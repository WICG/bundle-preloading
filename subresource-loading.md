# Subresource loading with resource bundles

This document describes a native bundle loading scheme, based on resource bundles, combining the advantages of today's bundlers and fetches of individual resources. If the HTML document explicitly links in a resource bundle for subresource loading, then the client (e.g., Web browser) *may* fetch resources inside of it from the bundle rather than individually. This scheme is designed for static, non-personalized content.

## Motivation

### The world today

When loading subresources on the Web, developers currently have an unfortunate choice between serving resources individually, or using bundlers (such as [webpack](https://webpack.js.org/)), both of which have disadvantages affecting loading performance.

URLs addressing individually fetched resources are the basis for the architecture of the Web today. Web browsers and other HTTP clients contain several mechanisms based on this architecture, which are unfortunately obscured by bundlers today:
- Each response has a MIME type and can be fetched in a streaming way, permitting incremental and/or parallel processing by the browser by default.
- Each response can be cached individually according to its URL and the response's cache control directives.

Today's bundlers serve a number of number of purposes not met by fetches of individual resources:
- Bundlers group multiple resources into a smaller number of virtualized resources, reducing the significant per-resource overhead present in all web browser today and enabling high-quality compression.
- Bundlers facilitate the use of long-lived caching modes by implementing schemes where URLs are rotated as their contents change.
- Bundlers track nested dependencies, prefetching the appropriate content when a new component or route is loaded ("code splitting") while avoiding duplication of shared dependencies.

By implementing a native bundling scheme, web browsers would be better able to understand what's going on in the output of bundlers, by maintaining a tight correspondence to Web semantics which doesn't currently exist. Hopefully, this will improve loading performance.

## Constraints

### HTTP/URL semantics

#### Origin model

This proposal aims to strongly preserve the Web's origin model. On the Web, resources, including bundles, are fetched from a URL in a particular `https://` origin. Resource bundles represent resources within the same `https://` origin as the bundle was fetched from.

(A possible extension would be to lower the privilege level even further with mutually-isolated segments within an `https://` origin, but this is not part of the proposal.)

#### Path restriction

For the same [reason as ServiceWorkers](https://w3c.github.io/ServiceWorker/#path-restriction), it is important to limit resource bundles to represent resources whose path begins with a particular prefix, to provide additional protection on sites which host multiple users' content in different directories in the same origin (e.g., university websites' home directories, or GitHub pages for large organizations with several repositories).

#### Identity correspondence

URLs form the identity for resources on the Web. Resource bundles *represent* the same resources as their individual URLs indicate. Servers must maintain this correspondence--serving the same result if a resource is fetched individually, outside of the bundle. Clients must be able to verify that servers are well-behaved in practice. This correspondence maintains the sense of identity of URLs.

### Usability

#### For web developers

Existing bundlers like webpack should be able to support a mode outputting resource bundles, without non-trivial configuration changes.
- Mechanisms like code splitting with `import()` and asset references with `new URL()` should be usable in the same way automatically.
- Rich customizations/transformations (e.g., JSX, SASS), not just built-in Web features, should remain usable when targeting resource bundles.

#### For servers

- Web servers, as well as optimizing/caching intermediaries such as CDNs, should be able to implement the appropriate serving side of resource bundles within reasonable resource constraints.
- The serving logic should be somehow "commoditized" and not require a lot of extra work to get going (unlike HTTP/2 PUSH).
- Protocols must be stateless, with the server not having to remember what an individual client's cache contains.
- Deployment of static content using resource bundles to servers should be possible simply by copying files over, for a server which supports resource bundles. Deployment should be stateless: the server shouldn't have to remember anything about the previous version of the site.

#### For browsers

- Graceful degradation should be possible in multiple ways:
    - Always: Sites which use resource bundles transparently fall back to 
    - Optionally (decision of the build infrastucture): Various forms of feature detection (client-side and server-side) can note the lack of resource bundle support and serve a emulated bundle format when appropriate.
- Resource bundle loading should be reasonable to implement, fitting into something related to browsers' existing fetching and caching architectures while providing performance benefits in practice.

### Privacy

#### Personalization

Resource bundles must not be used for personalized content. Intuitively, they are for the "static" part of a site, and individual resources can be used for the dynamic part. This matches how bundlers are typically used today. As [Brave explained](https://brave.com/webbundles-harmful-to-content-blocking-security-tools-and-the-open-web/), personalization of resource bundles would allow URLs to be statelessly rotated between different requests, making URLs less meaningful/stable.

#### Content blocking

Content blockers have a number of requirements when it comes to ensuring that batching/bundling systems do not lead to them being circumvented in practice:
- It must not be possible for a "trusted" intermediary to "repackage" sites, as this could lead to lead to situations in practice where ads and tracking are signed as the publisher. (c.f. "Origin model")
- Resource bundles must not enable the cheap rotation of URLs within the bundle, as this would make URL-based content blocking much more difficult. (c.f. "Personalization")
- When content is blocked, it's ideal if sites don't tend to cause browsers to download the blocked content. (c.f. "code splitting")

## One design: Two-level chunking with client-side hints manifest

Below is just one concrete place in the design space, as a concrete starting point for discussion and prototyping. There are many possible alternatives to continue considering, discussed in the Design FAQ below.

<!-- TODO: the following two paragraphs are quite confusing; clarify them -->

The format here uses a manifest which identifies the resource bundle URL and an association between *paths* inside the resource bundle and *chunk IDs* which identify pieces of the resource bundle. A fetch to a path inside the scope of the bundle is served by the bundle (modulo "optionality", see below).

When the document fetches a path which has chunk IDs associated with it, if those chunk IDs are not in cache for this bundle, then a GET request is made to the server, indicating all needed chunk IDs in a new header. The response is expected to be a resource bundle, with one response for each chunk ID, associating each of those chunk IDs with *another* resource bundle with the associated subset of resources.

### Example

```html
<script type=loadbundle>
{
    "source": "pack.rbn",
    "scope": "static/"
    "paths": {
        "a.js": ["bGpobG", "FzZGZq"],
        "b.js": ["bGpobG", "sbnNkd"]
        "style/": ["a2FzaG"],
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
```css=
/* page.css */
body { background-color: purple; } 
/* button.css */
button { margin: 3em }
```
- bGpobG: common.js
```js=
// common.js
export const say = alert;
```
- FzZGZq: a.js
```js=
// a.js
import { say } from "./common.js";
say("a");
```
- sbnNkd: b.js
```js=
// b.js
import { say } from "./common.js";
say("b");
```

The resources are grouped into the [resource bundle file format](https://github.com/littledan/resource-bundles/blob/main/bundle-format.md). 

(Although this example used few resources, to focus on illustrating we could picture each one of these chunk IDs containing multiple different JS modules which are imported from `a.js`, `b.js` and `common.js`; the HTML file would stay the same, as it only needs to note entry-points that start off the fetching.)

#### How it loads

When the HTML page is parsed, it is noted that there are multiple fetches to paths which are mapped in the bundle manifest. Both of these point to the chunk ID `a2FzaG`. On a cold load, this chunk is not in cache. As the first step of fetching these, the following HTTP request is made:

```http
GET /pack.rbn
Resource-Bundle-Chunk-Ids: a2FzaG
```

The server then responds with a resource bundle which has one response in it, named `a2FzaG`, which contains a resource bundle mapping each of those two paths to their contents as listed above. The response includes the header `Vary: Resource-Bundle-Chunk-Ids` to express that the response was based on the `Resource-Bundle-Chunk-Ids` header, and another request with a different header value may have a different response. `a2FzaG` is placed in the HTTP cache, so then the fetches to `style/page.css` and `style/button.css` are served from that cache.

Let's say that, then, the user clicks on button "a". To fetch the needed assets, the client makes the following fetch:

```http
GET /pack.rbn
Resource-Bundle-Chunk-Ids: bGpobG FzZGZq
```

If, following that, the "b" button is clicked, the server would make a smaller fetch:

```http
GET /pack.rbn
Resource-Bundle-Chunk-Ids: sbnNkd
```

#### Update example

Let's say we want to ship a new version of lodash, but other resources stay the same on the page. Some clients will be loading the new version fresh, and some may have loaded the page before, with or without clicking each of the buttons.

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
        "style/": ["a2FzaG"],
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

### Fetch and caching semantics

(The following is a rough outline, just to get specific about concrete details for one version; there is no strong attachment to these details.)

Two new data structures are added:
- Persistent: In the double-keyed cache entry associated with a resource bundle URL, there is a cache mapping chunk IDs to the resource bundle chunks they contain. 
- Ephemeral: The document contains a mapping from URL scope prefixes to `<script type=loadbundle>` tags which declared them, together with a list of chunk IDs which are currently "mapped in" (initially empty).
- Ephemeral: A list of chunk IDs to fetch, accumulated just during a turn of the event loop

When a URL is fetched, if any entry in the ephemeral mapping is a prefix of the URL, then this fetch may be served from the resource bundle, as follows:
- If any of the mapped in chunk IDs contain the response, return that response.
- If the URL is listed in the `paths` of the `<script type=loadbundle>` tag (including being a prefix of a path that ends with `/`), then add the chunk IDs associated with the path to the list to fetch.
- Otherwise, return a 404 error

When returning to the event loop, if there are any chunk IDs on the list to fetch:
- For each cache ID:
    - If the persistent cache contains that chunk ID, map it in and remove it from the list
- Then, if there are any remaining chunk IDs, make a single non-credentialed GET request for all chunk IDs together (space-separated in the `Resource-Bundle-Chunk-Ids` header).
- When the fetch returns from the server, map in all fetched chunk IDs and add them to the persistent cache.
- Then, the original fetch can continue at the top of the algorithm. It should either be served by a mapped-in chunk or 404.

## Design FAQ

These questions are all up for discussion; please file an issue if you disagree with one of the answers here. This Q/A explains how the above proposal was arrived at, but the document describes a very early proposal which is still 

#### Q: Rather than add bundling into the platform, why not fix HTTP?

**A**: If we can figure out a way to do that which would obsolete bundlers, then that would be perfect! However, it's unclear how to reduce browsers' per-fetch overhead within HTTP (which has to do with security-driven process architecture), even if we developed a nicer way to share compression dictionaries among HTTP responses and encourage more widespread prefetching. Please file an issue if you have ideas.

#### Q: Should bundling be restricted to JavaScript, which is the case with the largest amount of resource blow-up?

**A**: JavaScript-only bundling is explored in [JavaScript module bundles](https://gist.github.com/littledan/c54efa928b7e6ce7e69190f73673e2a0), but the current bundler ecosystem shows strong demand for bundling CSS, images, WebAssembly etc., and new non-JS module types further encourage the use of many small non-JS resources. Today, we see widespread usage of CSS in JavaScript strings, and other datatypes in base64 in JS strings (!). A JS-only bundle format may encourage these patterns to continue.

The [import maps proposal](https://github.com/WICG/import-maps) can also be used to [map away hashes in script filenames](https://github.com/WICG/import-maps#mapping-away-hashes-in-script-filenames). This can be useful for "cache busting" for JavaScript, but not for other resource types. However, in practice, similar techniques are needed for CSS, images, and other resource types, which a module-map-based approach has trouble solving (though it could be possible with [import: URLs](https://github.com/WICG/import-maps#import-urls)).

#### Q: Will support for non-JS assets make resource bundle loading too heavy-weight/slow?

**A**: This proposal works at the network fetch level, not the module map level. This means that, when executing a JavaScript module graph, some browser machinery needs to be engaged. Different web browser maintainers have made different predictions about how optimizable this machinery will be (while keeping the code maintainable). The plan is to prototype resource bundle loading, ideally in multiple browsers, to assess the impact.

#### Q: Should we start with a simpler kind of bundle loading, without subsetting or versioning?

**A**: This approach is sketched out [in this explainer](https://github.com/WICG/webpackage/blob/master/explainers/subresource-loading.md). This document takes a broader approach, based on conversations with webapp and tooling developers, as these capabilities seem to be often needed for native resource bundles to be useful in practice -- without them, significant transformations/emulation would remain needed, and the browser's cache would not be usable as effectively.

#### Q: Is it necessary to split into chunks, rather than naming individual resources?

**A**: Moderately large modern webapps are estimated to often contain on the order of tens of thousands of source JavaScript modules, but then break down into tens or hundreds of entry-points/loadable/cacheable units. It is not practical to ship information from the client to the server, or the server to the client, about tens of thousands of resources, but hundreds may be practical. Hash-based digests can sometimes help, but with too many resources, either the hash digest may get too big or the error rate may get too high.

If chunking is not done at the resource bundle level, it would be necessary at some other level (e.g., using existing bundler/downleveling strategies to emulate ES module semantics, rather than shipping native ES modules to the browser). [This previous version](https://gist.github.com/littledan/e01801001c277b0be03b1ca54788505e) sketched out an approach to individual resources, rather than chunks, being used in bundling.

#### Q: Why associate bundle loading with fetches to URLs, rather than exposing an imperative API?

**A**: In the above proposal, resource bundle loading serves fundamentally as a *hint* for how to get the same content faster--these semantics correspond to the privacy goals above. It is ideal if this hint can be declared in just one place, rather than sprinkled throughout the code.

If an imperative API were used to load a subset of the bundle, then it would have to be invoked explicitly in each case that a resource served from a bundle is going to be used. This would be quite awkward and redundant, requiring additional tooling to generate that code. It is more usable if the platform handles this logic. [This previous version](https://gist.github.com/littledan/e01801001c277b0be03b1ca54788505e) used an imperative API for loading bundles.

#### Q: Why does the syntax for loading a resource bundle use a `<script>` tag?

**A**: It is important for browsers' preload scanners to be able to fetch resource bundles as appropriate, so a declarative syntax (here, through a `<script>` tag) is required. `<script>` is used rather than `<link>` due to [concerns from WebKit and Google security experts](https://lists.w3.org/Archives/Public/public-web-perf/2020Aug/0028.html) about injection attacks. But more syntax, in addition to the `<script>` tag, may actually be needed.

Several use cases for resource bundle loading take place without the presence of the DOM, e.g, from a Worker. Therefore, a non-DOM-based JavaScript API is necessary, possibly something like `navigator.loadbundle({"source": "example.rbn", /* ... */})`.

The `Link:` header, and even further, [HTTP Early Hints](https://www.fastly.com/es/blog/beyond-server-push-experimenting-with-the-103-early-hints-status-code) has great potential to serve as a mechanism to initiate prefetching as soon as possible. It would be optimal for resource batch loading to *also* have a syntax to be usable in this form, even if it's unavailable as a `<link>` tag in HTML.

#### Q: Is it ideal to ship a manifest to clients? Wouldn't it be better to keep this information on the server?

**A**: It's complicated: there are three pieces of information that need to be brought together in order for the server to send the client the information that it needs:
- The contents of the browser's HTTP cache (held in the browser)
- The set of routes/components requested (held in the browser)
- The set of resources needed for each route/component (held in the server)

The approach above ships a manifest to the client, which ends up standing in for the set of resources needed for each route/component. An alternative strategy would be to ship, to the server, both a digest of the relevant part of the browser's HTTP cache, as well as a representation of which routes/components are requested. [This document](https://docs.google.com/document/d/11t4Ix2bvF1_ZCV9HKfafGfWu82zbOD7aUhZ_FyDAgmA/edit) explores techniques for sending a digest of the browser's HTTP cache to the server, and some advanced dynamic bundling solutions use a related technique.

#### Q: Is it really necessary for the server to dynamically generate responses? Is there any way to implement bundling on a static file server?

**A**: Fundamentally, the set of resources that a browser has in its cache is based on the path that the user took through the application. This means that there is a combinatorial explosion of possibilities for the optimal bundle to send to the client, and dynamic subsetting could provide the best loading performance.

This strategy is used in custom bundlers for some major sites. This proposal aims to bring these advanced loading techniques to a broader section of web developers.

The strategy implemented today in bundles like webpack and rollup is, instead, statically generated chunks which can be served from a static file server. With static chunking, there is a tradeoff between, on one hand, better cache usage and avoiding sending duplicate/unneeded resources (where smaller chunks are better), and on the other hand, compressability and reduction of per-fetch overhead (where bigger chunks are better). [Recent work](https://web.dev/granular-chunking-nextjs/) has focused on finding an optimal middle point, but the ideal would be to cache at a small granularity but fetch/compress at a bigger granularity, as is possible with dynamic chunking in the context of native resource bundle loading.

If dynamic bundle generation is too expensive/difficult to deploy in practice in many cases (whether due to usability issues for web developers or servers), resource bundle loading could be based on (either in a separate mode, or always) static chunking with each chunk served from a different URLs: the cost in terms of runtime performance is a tradeoff with easier deployability. It may be that static chunking is enough in practice, if it only results in a reasonably small number of HTTP/2 fetches, and compression works relatively well with Brotli default compression dictionaries, for example.

#### Q: Will it be efficient to dynamically, optimally re-compress just the requested parts of the bundle?

**A**: In general, the hope is that there can be a high-quality-compressed version of the entire bundle produced and deployed to the server, and the server would be able to efficiently calculate dynamic subsets. However, the efficiency of this subsetting is unclear, and depends on the compression algorithm used. More research is needed. (c.f. [this blog post](https://dev.to/riknelix/fast-and-efficient-recompression-using-previous-compression-artifacts-47g5), [this comment](https://docs.google.com/document/d/11t4Ix2bvF1_ZCV9HKfafGfWu82zbOD7aUhZ_FyDAgmA/edit?disco=AAAAGdV5qt0)).

One idea raised to reduce the cost of re-compression for dynamic subsetting: use a different bundle URL per route/component, so that these can serve as different pre-compressed units, so the subsetting is more "dense". However, it is not clear how to handle the common case of fetching multiple routes/components at once (which is the source of the combinatorial explosion in the first case).

#### Q: How does this proposal relate to Sub-resource Integrity (SRI)?

**A**: Some thought has been put into various schemes to facilitate the adoption of SRI in conjunction with resource bundles. For many cases, the hashes will take up too much space to be sent to the client, and SRI adds deployment challenges (e.g., with upgrades). Efficient SRI approaches may be beneficial and follow up proposals can be explored in this repository or elsewhere. A [previous draft](https://gist.github.com/littledan/18a1bd6e14e4f0ddb305a2a051ced01e#file-dynamic-chunk-loading-md) had a closer relationship with SRI.

#### Q: Is there a way to load a bundle in a way that all network requests from inside of it are required to be served within the bundle?

**A**: Not in this proposal. Such a limitation would make the most sense if it were document-wide, but this proposal is about loading a resource bundle *within* a document (so, the HTML had to come from somewhere else, for one). A separate proposal could create a kind of iframe which is limited to be loading contents out of a particular bundle, perhaps with the bundle loading mechanism based on this document. It will be important to evaluate the privacy implications of such a proposal.

#### Q: Is one level of chunking enough? Should chunking be part of a more complex DAG?

**A**: Sometimes, several different entry-points require a common set of resources repeatedly, even if these break down into multiple cache units. In the current proposal, the same string of chunk IDs needs to be repeated for each entry-point to handle this case. It would be possible to extend the manifest language to give these sets an explicit representation. It's not clear if such sets would have any advantages over compression, and it would add complexity, so this version of the proposal omits that, for simplicitly. A [previous draft](https://gist.github.com/littledan/18a1bd6e14e4f0ddb305a2a051ced01e#file-dynamic-chunk-loading-md) was based around such sets.

#### Q: To avoid letting the list of chunks get too long, could the client send the server the list of chunks it already has, instead of what it's missing?

**A**: This is an advanced technique that could work in the context of a "chunk DAG" that is expressed in the manifest: if a particular parent chunk ID is requested, and most children chunk IDs are missing, but just a few are present, then the client could send the server a header that indicates this state, and the server could respond with the appropriate set of chunks. This more advanced capability is omitted from this document for simplicity; it might be better to include in a v2 proposal.

#### Q: What happens if the server sends the client more chunks than it asked for?

**A**: Servers are permitted to do this, and all of the subresources will end up loading, though more slowly. For example, a server could simply always reply with all of the chunks. Intelligent middleware could be responsible for filtering just the requested chunks, making it easier to deploy resource bundle loading.

There are a number of different possible valid designs for which chunks a browser caches and maps in when a server returns more chunks than requested:
- The browser could discard all additional chunks (and potentially fetch them again later)
- The browser could cache all chunks, but only map in the requested ones (maybe the best option?)
- The browser could cache and map in all chunks in the response

#### Q: Is there any way to keep around just *part* of a chunk ID in cache, if part of it changes and another part doesn't?

**A**: In the above proposal, chunk IDs are the atomic unit of loading and caching. The browser either uses whole chunk or it does not. Chunk IDs are abstract units of loading, not necessarily corresponding to a library/package: there may be multiple packages in a chunk, or one package may be divided into multiple chunks. If you want to be able to keep around just part of a chunk ID when only part of it changes, divide it into two chunk IDs ahead of time. Bundlers are responsible for making this metadata volume vs caching tradeoff.

#### Q: If resource bundle loading is restricted to being same-origin, does that mean they can't be loaded from a CDN?

**A**: It is fine to load a resource bundle from a CDN: that bundle will be representing URLs *on the same origin* (as well as within the path limitation). For example, `https://site.example` can contain something like the following:

```html
<!-- https://site.example/index.html -->
<script type=loadbundle>
    {
        "source": "https://cdn.example/pack.rbn",
        "scope": "https://cdn.example/pack/",
        "paths": { /* ... */ }
    }
</script>
```

Because the `source` is the same origin as the `scope`, the resource bundle loading is permitted.
