# Subresource loading with resource bundles

This document describes a native bundle loading scheme, based on resource bundles, combining the advantages of today's bundlers and fetches of individual resources. If the HTML document explicitly links in a resource bundle for subresource loading, then the client (e.g., Web browser) *may* fetch resources inside of it from the bundle rather than individually. This scheme is designed for static, non-personalized content.

## One design: Two-level chunking with client-side manifest

Below is just one concrete place in the design space, as a concrete starting point for discussion and prototyping. There are many possible alternatives to continue considering, discussed in the [FAQ](./faq.md).

This proposal assumes the following:
* The site's code is bundled into a single "mega bundle".
* The bundle declaration on each entry points contains a *complete* list of routes or components and their dependencies.
  - Specifically, the browser is not aware of the full list of resources the bundle contains, just of the top-level routes. If that list is not complete, secondary resources can be discovered by the browser before the bundle's index is fetched, resulting in spurious downloads.
* A single chunk can contain multiple resources, in case they are typically fetched together. That is trading off caching granularity, in favor of reduction in the meta information that needs to be communicated between client and server.

### Loading by chunk IDs

In this proposal, resource bundles are broken into *chunks*. A chunk represents a subset of the broader bundle. This subset can contain any path within the scope of the bundle. When a chunk is loaded, all of the paths inside the chunk are made available for fetches to that path.

Each chunk is identified by a *chunk ID*. A chunk ID names not just the subset paths but also their contents. (Chunk IDs can be allocated based on hashing the bundle subset.) This way, chunks can be cached by the browser as "immutable", with the chunk ID rotating when contents change.

### `loadbundle` JSON manifest

The set of chunk IDs to request is indicated in a JSON manifest, which can be included in HTML in a `<script type=loadmodule>` tag. This JSON includes just a few fields:
- `"source"`: The URL (relative to the document) of the bundle to fetch from
- `"scope"`: The URL prefix (relative to the document) within which all fetches will be served by the bundle, rather than individual fetches (modulo ["optionality"](https://github.com/littledan/resource-bundles/blob/main/subresource-loading.md#optionality-and-url-integrity)). This avoids race conditions: if a bundle fetch corresponding to this scope is currently pending, then a fetch against something in the scope that's not in cache will wait until that bundle fetch returns. (Resources not served from the bundle may result in a 404, modulo ["optionality"](https://github.com/littledan/resource-bundles/blob/main/subresource-loading.md#optionality-and-url-integrity).) The `scope` must be prefixed by the same path as the `source`, to meet the [path restriction](./motivation#path-restriction).
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

Resources are grouped into bundle chunk IDs with contents as follows:
- a2FzaG: style/page.css, style/button.css
```css
/* page.css */
body { background-color: purple; } 
```
```css
/* button.css */
button { margin: 3em }
```
- bGpobG: common.js
```js
// common.js
export const say = alert;
```
- FzZGZq: a.js
```js
// a.js
import { say } from "./common.js";
say("a");
```
- sbnNkd: b.js
```js
// b.js
import { say } from "./common.js";
say("b");
```

The resources are grouped into the [resource bundle file format](./bundle-format.md). 

(Although this example used few resources, to focus on illustrating we could picture each one of these chunk IDs containing multiple different JS modules which are imported from `a.js`, `b.js` and `common.js`; the HTML file would stay the same, as it only needs to note entry-points that start off the fetching.)

##### How it loads

When the HTML page is parsed, it is noted that there are multiple fetches to paths which are mapped in the bundle manifest. Both of these point to the chunk ID `a2FzaG`. On a cold load, this chunk is not in cache. As the first step of fetching these, the following HTTP request is made:

```http
GET /pack.rbn
Resource-Bundle-Chunk-Ids: a2FzaG
```

<!-- TODO: Add the response from the server. -->

The server then responds with a resource bundle which has one response in it, named `a2FzaG`, which contains a resource bundle mapping each of those two paths to their contents as listed above. The response includes the header `Vary: Resource-Bundle-Chunk-Ids` to express that the response was based on the `Resource-Bundle-Chunk-Ids` header, and another request with a different header value may have a different response. `a2FzaG` is placed in the HTTP cache, so then the fetches to `style/page.css` and `style/button.css` are served from that cache. (Note that `style/button.css` is loaded by virtue of coming along for the ride of what was requested for `style/page.css`, despite not having an entry in the `loadbundle` manifest.)

Let's say that, then, the user clicks on button "a". To fetch the needed assets, the client makes the following fetch:

```http
GET /pack.rbn
Resource-Bundle-Chunk-Ids: bGpobG FzZGZq
```

(TODO: The list of chunk IDs should be serialized with [Structured Fields](https://tools.ietf.org/html/draft-ietf-httpbis-header-structure-19); probably this means they are comma-separated rather than space-separated.)

Note that `bGpobG`, containing `common.js`, is fetched, even though there was no explicit request for `common.js` yet. The `loadbundle` manifest caused the fetch of `a.js` to trigger `common.js` to be *prefetched* by virtue of both chunk IDs being listed in the `"paths"` entry for `"a.js"`. This prefetch happens with just one fetch over the network, grouped with `a.js`, permitting `a.js` and `common.js` to share a compression dictionary.

If, following that, the "b" button is clicked, the server would make a smaller fetch:

```http
GET /pack.rbn
Resource-Bundle-Chunk-Ids: sbnNkd
```

Even though the `"paths"` for `"b.js"` includes the chunk ID `bGpobG`, that chunk ID is already found in cache, so it is not loaded again.

#### Update example

Let's say we want to ship a new version of `common.js`, but other resources stay the same on the page. Some clients will be loading the new version fresh, and some may have loaded the page before, with or without clicking each of the buttons.

In the new version, we have a new chunk ID:
- 0ijdfs: common.js
```js=
export const say = console.log
```

This new chunk ID is referenced from HTML as follows:

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

The rest of the page and chunk IDs all stay the same, as the only thing that changed was `common.js`--one of the dependent chunk IDs for `a.js` and `b.js` changed.

Ideally, the only thing that will have to be re-fetched is the particular code that changed, and everything else can "just work" from cache if present.

Indeed, this is what happens. If the page has been loaded previously, and one of the buttons was clicked previously, and it's still present in cache: then, when the previously clicked button is pressed, the following fetch is made:

```http
GET /pack.rbn
Resource-Bundle-Chunk-Ids: 0ijdfs
```

Existing content from the cache can simply be reused, since the cache is at the granularity of the chunk IDs within the bundle, not at the level of the bundle itself.

### Optionality and URL integrity

To ensure the integrity of the semantics of URLs, which is essential for the privacy-preserving properties explained above, the browser's use of resource bundles is optional and verifiable, in the following sense:

Servers must make bundles faithfully represent what they would return with an independent fetch to the same URL, and browsers may enforce this, online, offline, or both.

For offline enforcement, browsers may scan the Web and assemble a denylist of origins which do not implement this correspondence. Resource bundle loading declarations on these origins would simply be ignored, and the URLs within the resource bundle's scope would simply be fetched one by one.

For online enforcement: Whenever a fetch is made to something which is within the scope of a bundle declaration, the browser has three choices, all of which it may make:
- It may fetch the resource from the bundle (details below).
- It may ignore the bundle and instead fetch the resource from the server directly, with the same URL.
- It may do both, compare the results, and stop using the bundle at all if there is a mismatch.

Online enforcement through the second or third bullet point would be most practical when it is done only rarely, for a small percentage of fetches, so that the overhead is low.

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
- Then, if there are any remaining chunk IDs, make a single cookie-less (`crossorigin="omit"`) GET request for all chunk IDs together (space-separated in the `Resource-Bundle-Chunk-Ids` header).
- When the fetch returns from the server, map in all fetched chunk IDs and add them to the persistent cache.
- Then, the original fetch can continue at the top of the algorithm. It should either be served by a mapped-in chunk or 404.

*See the [subresource loading FAQ](./faq.md#subresource-loading) for more information.*

#### Pros
* Mixing in decelration of the resources in the bundle and scopes covered by it in ways that enable use of both techniques, without requiring hard-to-implement [Cache Digests](https://tools.ietf.org/html/draft-ietf-httpbis-cache-digest-05).
* Decouples the resource number from the number of chunks in ways that enable higher scalability in cases of closely knit, very small modules.

#### Cons
* Requires declaring full dependency map on each entry point, that includes all the chunks required by all the entry points. If developer tooling will get that wrong, it can result in spurious downloads.
* A "just download the entire bundle" fallback is not feasible, since the full bundle contains all of the code-split parts, but initial load should only load the necessary parts. Related, caches that ignores Vary will have have A Bad Time™. 
* It could be prohibitively slow to dynamically compress collections of chunks to a high quality, as there are certain techniques that work quickly in the case of a large subset, but not as well in a smaller subset
(See [results](https://dev.to/riknelix/fast-and-efficient-recompression-using-previous-compression-artifacts-47g5#results) for 90% removal)
* It's improbable that all entry points require the same order of resources. This proposal doesn't provide a way for bundlers to address this and enable different chunk order for different entry points.

