# Subresource loading with resource bundles

This document describes multiple versions of possible native bundle loading mechanisms, based on resource bundles, combining the advantages of today's bundlers and fetches of individual resources. Multiple versions are under investigation because there are tricky performance tradeoffs that we expect to only be able to make based on more concrete prototyping.

All versions have the [same goals](https://github.com/littledan/resource-bundles/blob/main/motivation.md), just differing in their mechanisms to acheive them. No version is currently spelled out which is known to meet all goals completely, which is why this is still a work in progress.
- **URL integrity**: Bundle responses from servers must faithfully represent the responses from URLs in bundles, and clients may enforce this effectively. Bundles are designed for static, non-personalized content.
- **Subsetting**: Clients can decide which resources they want to fetch from a bundle, e.g., to avoid reloading things that they already have stored in cache, or to avoid the overhead of fetching resources which would be content-blocked.
- **Versioning**: Resources inside bundles can be cached well but nevertheless updated quickly, using a native mechanism without rotating URLs ("cache busting").
- **Waterfall**: When multiple resources reference each other, an attempt to load one resource will trigger all dependent resources to be delivered to the client in a minimal number of round trips. 
- **Space**: Messages from the server to the client, and from the client to the server, are only extended minimally to support these protocols, ensuring that space overhead is not a barrier to adoption.
- **Fallback**: In browsers which do not support bundling, if the request to load the bundle is ignored, then the application can load anyway, though it may be much slower to start up and not cached well.

To summarize the three versions described in this document:
1. *ETags*: Each resource in the resource bundle has an ETag described in a manifest which is inline in HTML (to avoid an extra round trip), together with a list of other ETags to prefetch along with it. The server is sent a single request with a list of ETags to load together, in a resource bundle.
    - Caveat: This mechanism might require manifests which are too large, risking the space goals.
1. *Chunking*: To reduce the size of the manifest vs the full ETags approach, multiple responses can be grouped into chunks, each of which has a chunk ID. This mechanism is analogous to the ETags approach, but enables a more terse manifest and request headers.
    - Caveat: This mechanism does not fully meet subsetting goals (particularly as it relates to content blocking), as subsetting is at the chunk granularity, but content blockers may want to avoid loading part of a chunk.
1. *Cuckoo hash*: Multiple resource bundles are used to describe different routes, while a cuckoo hash describing cache contents is used to communicate with the server.
    - Caveat: The writeup of this mechanism is incomplete, so the tradeoffs remain unclear.

These mechanisms are just starting points for discussion and prototyping. There are many possible alternatives to continue considering, discussed in the [subresource loading FAQ](./faq.md#subresource-loading).

## Optionality and URL integrity

Common to all mechanisms is ensuring the integrity and semantics of URLs, which is essential for the privacy-preserving properties explained above. To achieve this goal, the browser's use of resource bundles is optional and verifiable, in the following sense (credits for this idea go to Pete Snyder of Brave):

Servers must make bundles faithfully represent what they would return with an independent fetch to the same URL, and browsers may enforce this, online, offline, or both.

For offline enforcement, browsers may scan the Web and assemble a denylist of origins which do not implement this correspondence. Resource bundle loading declarations on these origins would simply be ignored, and the URLs within the resource bundle's scope would simply be fetched one by one.

For online enforcement: Whenever a fetch is made to something which is within the scope of a bundle declaration, the browser has three choices, all of which it may make:
- It may fetch the resource from the bundle (details based on the mechanism below).
- It may ignore the bundle and instead fetch the resource from the server directly, with the same URL.
- It may do both, compare the results, and stop using the bundle at all if there is a mismatch.

Online enforcement through the second or third bullet point would be most practical when it is done only rarely, for a small percentage of fetches, so that the overhead is low.

## Option 1: ETags

In this option, each resource in the resource bundle has an ETag described in the inline manifest, together with a list of other ETags to prefetch along with it. The server is sent a single request with a list of ETags to load together, in a resource bundle.

The ETag of a resonse within a bundle must be unique, not just compared to past versions of the same URL, but also compared to other ETags in the same bundle. In this way, the ETag represents both the URL and the version of the resource.

This mechanism assumes that the whole site is grouped into one big bundle, which the server then serves subsets of, based on the ETags requested from the client.

### Inline bundle loading manifests

In HTML, a manifest is used to load a bundle, placed in a `<script type=loadbundle>` tag. The contents are expected to be a JSON object with the following fields:
- `"source"` is the URL of the bundle
- `"paths"` is an object:
    - A key for each URL which may be served by the bundle
    - A corresponding value which is an array of ETags. The first ETag is for the URL, and following ETags represent dependencies that should be prefetched along with that resource.

When a request is made to a URL which is listed in `paths`, the client collects the appropriate list of ETags from all nested dependencies and sends a GET request to the server at the bundle's URL with the `Bundle-ETags:` header listing the required ETags. The server is expected to respond with a resource bundle with a resource corresponding to each ETag.

### Example

This example, and the following examples in the page, are based on a small web page:

```html
<script type=loadbundle>
{
    "source": "pack.rbn",
    "paths": {
        "static/a.js": ["FzZGZq", "bGpobG"],
        "static/b.js": ["sbnNkd", "bGpobG"],
        "static/common.js": ["bGpobG"],
        "static/style/page.css": ["a2FzaG"],
        "static/style/button.css": ["a2pobH"]
    }
}
</script>
<link rel=stylesheet href="static/style/page.css">
<link rel=stylesheet href="static/style/button.css">
<button onclick="import('static/a.js')">a</button>
<button onclick="import('static/b.js')">b</button>
```

`static/a.js` and `static/b.js` both import `static/common.js`.

##### How it loads

When the HTML page is parsed, it is noted that there are multiple fetches to paths which are mapped in the bundle manifest. The ETags `a2FzaG` and `a2pobH` are required. On a cold load, neither of these ETags are in cache. As the first step of fetching these, the following HTTP request is made:

```http
GET /pack.rbn
Bundle-ETags: a2FzaG, a2pobH
```

<!-- TODO: Add the response from the server. -->

The server then responds with a resource bundle which has two responses in it, for the two URLs listed above, using these ETags. The response includes the header `Vary: Bundle-ETags` to express that the response was based on the `Bundle-ETags` header, and another request with a different header value may have a different response. Both responses are placed in the HTTP cache, so then the fetches to `style/page.css` and `style/button.css` are served from that cache.

Let's say that, then, the user clicks on button "a". To fetch the needed assets, the client makes the following fetch:

```http
GET /pack.rbn
Bundle-ETags: bGpobG, FzZGZq
```

Note that `bGpobG`, containing `common.js`, is fetched, even though there was no explicit request for `common.js` yet. The `loadbundle` manifest caused the fetch of `a.js` to trigger `common.js` to be *prefetched* by virtue of both ETags being listed in the `"paths"` entry for `"a.js"`. This prefetch happens with just one fetch over the network, grouped with `a.js`, permitting `a.js` and `common.js` to share a compression dictionary.

If, following that, the "b" button is clicked, the server would make a smaller fetch:

```http
GET /pack.rbn
Bundle-ETags: sbnNkd
```

Even though the `"paths"` for `"b.js"` includes the chunk ID `bGpobG`, that ETag is already found in cache, so it is not loaded again.

#### Update example

Let's say we want to ship a new version of `common.js`, but other resources stay the same on the page. Some clients will be loading the new version fresh, and some may have loaded the page before, with or without clicking each of the buttons.

In the new version, we have a new ETag for `common.js`, corresponding to a new response body, as the code is updated. This new ETag is referenced from HTML as follows:

```html
<script type=loadbundle>
{
    "source": "pack.rbn",
    "paths": {
        "static/a.js": ["FzZGZq", "0ijdfs"],
        "static/b.js": ["sbnNkd", "0ijdfs"],
        "static/common.js": ["0ijdfs"],
        "static/style/page.css": ["a2FzaG"],
        "static/style/button.css": ["a2pobH"]
    }
}
</script>
<link rel=stylesheet href="static/style/page.css">
<link rel=stylesheet href="static/style/button.css">
<button onclick="import('static/a.js')">a</button>
<button onclick="import('static/b.js')">b</button>
```

The rest of the page and ETags all stay the same, as the only thing that changed was `common.js`--one of the dependent chunk IDs for `a.js` and `b.js` changed.

Ideally, the only thing that will have to be re-fetched is the particular code that changed, and everything else can "just work" from cache if present.

Indeed, this is what happens. If the page has been loaded previously, and one of the buttons was clicked previously, and it's still present in cache: then, when the previously clicked button is pressed, the following fetch is made:

```http
GET /pack.rbn
Bundle-ETags: 0ijdfs
```

Existing content from the cache can simply be reused, since the cache is at the granularity of the ETags within the bundle, not at the level of the bundle itself.

#### Fetch and caching semantics

Two new ephemeral data structures are added:
- A document-wide mapping from URLs in the `paths` list to `<script type=loadbundle>` tags which declared them
- A list of ETags to fetch for each `<script type=loadbundle>` tag, accumulated just during a turn of the event loop

When a URL is fetched, if it is not fresh in cache, but it was listed in `paths`, then this fetch may be fetched from the resource bundle. Initially, it is added to the list of ETags to fetch, for the `loadbundle` declaration. When returning to the event loop, if there are any ETags on the list to fetch:
- Make a single cookie-less (`crossorigin="omit"`) GET request to the bundle URL, listing all ETags in the `Bundle-ETags` header.
- When the fetch returns from the server, save each response to the cache.
- Then, the original fetch can be served from cache (assuming the server followed through on its end of the contract; if the response is missing the original URL, then 404).

### Analysis

#### Pros
* Generally meets most of the goals at the beginning of this document.
* Enables servers to share a compression dictionary across all responses in a bundle, without requiring hard-to-implement [Cache Digests](https://tools.ietf.org/html/draft-ietf-httpbis-cache-digest-05).
* This is a relatively simple mechanism, which cleanly corresponds to the use of ETags on individual requests and responses.

#### Cons
* **The `<script type=loadbundle>` manifest may get large. The `Bundle-ETags:` header may also get large.** This is a core concern that may affect the viability of the approach.
* Requires declaring full dependency map on each entry point, that includes all the resources required by all the entry points. If developer tooling will get that wrong, it can result in spurious downloads.
* A "just download the entire bundle" fallback is not feasible, since the full bundle contains all of the code-split parts, but initial load should only load the necessary parts. Related, caches that ignores Vary will have have A Bad Time™. 
* It could be prohibitively slow to dynamically compress collections of chunks to a high quality, as there are certain techniques that work quickly in the case of a large subset, but not as well in a smaller subset
(See [results](https://dev.to/riknelix/fast-and-efficient-recompression-using-previous-compression-artifacts-47g5#results) for 90% removal)
* Different entry points may benefit from different orderings of resources. This proposal doesn't provide a way for bundlers to address this and enable different chunk order for different entry points.

## Option 2: Chunking

In this proposal, resource bundles are broken into *chunks*. A chunk represents a subset of the broader bundle. This subset can contain any path within the scope of the bundle. When a chunk is loaded, all of the paths inside the chunk are made available for fetches to that path.

Each chunk is identified by a *chunk ID*. A chunk ID names not just the subset paths but also their contents. It forms a sort of ETag for a set of responses, rather than a single response. (Chunk IDs can be allocated based on hashing the bundle subset.) This way, chunks can be cached by the browser as "immutable", with the chunk ID rotating when contents change.

### Modified bundle loading manifest

The set of chunk IDs to request is indicated in a JSON manifest, which can be included in HTML in a `<script type=loadmodule>` tag. This JSON includes just a few fields:
- `"source"`: The URL (relative to the document) of the bundle to fetch from
- `"scope"`: The URL prefix (relative to the document) within which all fetches will be served by the bundle, rather than individual fetches (modulo ["optionality"](#optionality-and-url-integrity)). This avoids race conditions: if a bundle fetch corresponding to this scope is currently pending, then a fetch against something in the scope that's not in cache will wait until that bundle fetch returns. (Resources not served from the bundle may result in a 404, modulo ["optionality"](#optionality-and-url-integrity).) The `scope` must be prefixed by the same path as the `source`, to meet the [path restriction](./motivation.md#path-restriction).
- `"paths"`: For a subset of paths (relative to the scope), the list of chunk IDs to load from the bundle when fetching that path. This can include multiple entries, e.g., in the case of dependencies: the resource being fetched may depend on some other resources from another chunk, so it makes sense to initiate the fetch to those dependencies as soon as the path is fetched.

Note that not all paths that are served within the scope are explicitly listed in `"paths"`. Chunks may have multiple responses in them, for multiple paths, and some chunks may be loaded even if none of the paths inside the chunk are explicitly listed (in the case of dependencies).

### Example

```html
<script type=loadbundle>
{
    "source": "pack.rbn",
    "scope": "static/"
    "paths": {
        "a.js": ["bGpobG", "FzZGZq"],
        "b.js": ["bGpobG", "sbnNkd"],
        "style/page.css": ["a2FzaG"],
    }
}
</script>
<link rel=stylesheet href="static/style/page.css">
<link rel=stylesheet href="static/style/button.css">
<button onclick="import('static/a.js')">a</button>
<button onclick="import('static/b.js')">b</button>
```

Some differences worth noting:
- The scope makes it so that the `static/` prefix on the URLs is not needed, since all paths are resolved relative to the scope.
- In `a.js` and `b.js`'s entries, the chunk ID for `common.js` comes first, since now the order is arbitrary and insignificant.
- `style/button.css` is not listed explicitly, since now it's grouped in with the chunk `a2FzaG`
- `common.js` has no entry in `paths`, since it will never be fetched first-thing (it is not an "entry point"), and will always instead be prefetched due to importing `a.js` or `b.js`.

##### How it loads

Fetches of CSS from the HTML lead to the chunk ID of `a2FzaG` being fetched. On a cold load, this chunk is not in cache. As the first step of fetching these, the following HTTP request is made:

```http
GET /pack.rbn
Bundle-Chunk-Ids: a2FzaG
```

<!-- TODO: Add the response from the server. -->

The server then responds with a resource bundle which has one response in it, named `a2FzaG`, which contains a resource bundle with responses for `style/button.css` and `style/page.css`. The response includes the header `Vary: Bundle-Chunk-Ids` to express that the response was based on the `Bundle-Chunk-Ids` header, and another request with a different header value may have a different response.

`a2FzaG` is placed in the HTTP cache, so then the fetches to `style/page.css` and `style/button.css` are served from that cache. (Note that `style/button.css` is loaded by virtue of coming along for the ride of what was requested for `style/page.css`, despite not having an entry in the `loadbundle` manifest.)

Let's say that, then, the user clicks on button "a". To fetch the needed assets, the client makes the following fetch:

```http
GET /pack.rbn
Bundle-Chunk-Ids: bGpobG, FzZGZq
```

Note that `bGpobG`, containing `common.js`, is fetched, even though there was no explicit request for `common.js` yet. The `loadbundle` manifest caused the fetch of `a.js` to trigger `common.js` to be *prefetched* by virtue of both chunk IDs being listed in the `"paths"` entry for `"a.js"`. This prefetch happens with just one fetch over the network, grouped with `a.js`, permitting `a.js` and `common.js` to share a compression dictionary.

If, following that, the "b" button is clicked, the server would make a smaller fetch:

```http
GET /pack.rbn
Bundle-Chunk-Ids: sbnNkd
```

Even though the `"paths"` for `"b.js"` includes the chunk ID `bGpobG`, that chunk ID is already found in cache, so it is not loaded again.

#### Update example

To ship a new version of `common.js`, while serving to clients which may have partially cached this application previously, a new chunk ID is allocated and referenced in the manifest as follows:

```html
<script type=loadbundle>
{
    "source": "pack.rbn",
    "scope": "static/",
    "paths": {
        "a.js": ["0ijdfs", "FzZGZq"],
        "b.js": ["0ijdfs", "sbnNkd"],
        "style/page.css": ["a2FzaG"],
    }
}
</script>
<link rel=stylesheet href="static/style/page.css">
<link rel=stylesheet href="static/style/button.css">
<button onclick="import('static/a.js')">a</button>
<button onclick="import('static/b.js')">b</button>
```

Similarly to the above example for ETags, when a previously-clicked button is pressed, only a single, minimal fetch is made, thanks to caching at the level of chunk IDs, not at the level of the bundle.

```http
GET /pack.rbn
Bundle-Chunk-Ids: 0ijdfs
```

#### Fetch and caching semantics

(The following is a rough outline, just to get specific about concrete details for one version; there is no strong attachment to these details.)

Two new data structures are added:
- Persistent: In the double-keyed cache entry associated with a resource bundle URL, there is a cache mapping chunk IDs to the resource bundle chunks they contain. 
- Ephemeral: The document contains a mapping from URL scope prefixes to `<script type=loadbundle>` tags which declared them, together with a list of chunk IDs which are currently "mapped in" (initially empty).
- Ephemeral: A list of chunk IDs to fetch, accumulated just during a turn of the event loop

When a URL is fetched, if any entry in the ephemeral mapping is a prefix of the URL, then this fetch may be served from the resource bundle, as follows:
- If any of the mapped in chunk IDs contain the response, return that response.
- If the URL is listed in the `paths` of the `<script type=loadbundle>` tag, then add the chunk IDs associated with the path to the list to fetch.
- Otherwise, return a 404 error

When returning to the event loop, if there are any chunk IDs on the list to fetch:
- For each cache ID:
    - If the persistent cache contains that chunk ID, map it in and remove it from the list
- Then, if there are any remaining chunk IDs, make a single cookie-less (`crossorigin="omit"`) GET request for all chunk IDs together (space-separated in the `Bundle-Chunk-Ids` header).
- When the fetch returns from the server, map in all fetched chunk IDs and add them to the persistent cache.
- Then, the original fetch can continue at the top of the algorithm. It should either be served by a mapped-in chunk or 404.

### Analysis

This proposal assumes the following:
* The application's code is bundled into a single "mega bundle".
* The bundle declaration on each entry points contains a *complete* list of routes or components and their dependencies.
  - Specifically, the browser is not aware of the full list of resources the bundle contains, just of the top-level routes. If that list is not complete, secondary resources can be discovered by the browser before the bundle's index is fetched, resulting in either 404s or redundant fetches.
* A single chunk can contain multiple resources, in case they are typically fetched together. That is trading off caching/content blocking granularity, in favor of reduction in the meta information that needs to be communicated between client and server.

#### Pros
* Generally meets most of the goals in the beginning of this document.
* The inline manifest and headers are more compact than ETags, enabling higher scalability in cases of closely knit collections of small resources.
* Like ETags, enables efficient compression.

#### Cons
* **Content blocking has no way of knowing what a chunk will contain until it is downloaded, so there is no way to avoid wasted bandwidth.** This is a core concern making this mechanism potentially inviable.
* Like ETags, requires a full dependency map, there is no fallback to "just download the entire bundle", and compression performance and suboptimal ordering could be issues.

## Option 3: Cuckoo hash

The scheme is outlined in [this document](https://docs.google.com/document/d/11t4Ix2bvF1_ZCV9HKfafGfWu82zbOD7aUhZ_FyDAgmA/edit).

<!-- TODO(yoavweiss): Write this section, including an explanation of how code splitting and versioning works. Note: maybe the ETags approach above could be combined with cuckoo hashing to make the message to the server more terse. -->
