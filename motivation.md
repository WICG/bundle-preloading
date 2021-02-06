# Motivation

When loading subresources on the Web, developers currently have an unfortunate choice between serving resources individually, or using bundlers (such as [webpack](https://webpack.js.org/), [rollup](https://rollupjs.org/guide/en/), [Parcel](https://parceljs.org/) or [esbuild](https://esbuild.github.io/)), both of which have disadvantages affecting loading performance.

URLs addressing individually fetched resources are the basis for the architecture of the Web today. Web browsers and other HTTP clients contain several mechanisms based on this architecture, which are unfortunately obscured by bundlers today:
- Each response has a MIME type and can be fetched in a streaming way, permitting incremental and/or parallel processing by the browser by default.
- Each response can be cached individually according to its URL and the response's cache control directives.

Today's bundlers serve a number of purposes not met by fetches of individual resources:
- Bundlers group multiple resources into a smaller number of virtualized resources, reducing the significant per-resource overhead present in all web browser today and enabling high-quality compression.
- Bundlers facilitate the use of long-lived caching modes by implementing schemes where URLs are rotated as their contents change.
- Bundlers track nested dependencies, prefetching the appropriate content when a new component or route is loaded ("code splitting") while avoiding duplication of shared dependencies.

By implementing a native bundling scheme, web browsers would be better able to understand what's going on in the output of bundlers, by maintaining a tight correspondence to Web semantics which doesn't currently exist. Hopefully, this will improve loading performance.

## Constraints

### HTTP/URL semantics

#### Origin model

This proposal aims to preserve the Web's origin model. On the Web, resources, including bundles, are fetched from a URL in a particular `https://` origin. Resource bundle loading, as described in this repository, fetches resources within the same `https://` origin as the bundle was fetched from.

(A possible extension would be to lower the privilege level even further with mutually-isolated segments within an `https://` origin, but this feature is beyond the scope of this repository.)

#### Path restriction

For the same [reason as ServiceWorkers](https://w3c.github.io/ServiceWorker/#path-restriction), it is important to limit resource bundles to represent resources whose path begins with a particular prefix, to provide additional protection on sites which host multiple users' content in different directories in the same origin (e.g., university websites' home directories, or GitHub pages for large organizations with several repositories).

#### Identity correspondence

URLs form the identity for resources on the Web. Resource bundles *represent* the same resources as their individual URLs indicate. Servers must maintain this correspondence--serving the same result if a resource is fetched individually, outside of the bundle. Clients must be able to verify that servers are well-behaved in practice. This correspondence maintains the sense of identity of URLs. (Enforcement of this property is described in ["Optionality and URL integrity"](./subresource-loading.md#optionality-and-url-integrity).)

### Usability

#### For web developers

Existing bundlers should be able to support a mode outputting resource bundles, without non-trivial configuration changes.
- Mechanisms like code splitting with `import()` and asset references with `new URL()` should be usable in the same way automatically.
- Rich customizations/transformations (e.g., JSX, SASS), not just built-in Web features, should remain usable when targeting resource bundles.
- To support long-term caching modes on the client, it should be possible to "rotate" the cache key while keeping the logical name (that the application developer uses) the same. This practice is often referred to as "cache busting" or "revved resources" and is [recommended by MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#revved_resources).

([Subresource loading tool support](./subresource-loading-tools.md) attempts to meet these goals.)

#### For servers

- Web servers, as well as optimizing/caching intermediaries such as CDNs, should be able to implement the appropriate serving side of resource bundles within reasonable resource constraints and without being required to buffer the entire bundle.
- The serving logic should be simple enough to be "commoditized" and not require complex logic to get right (e.g. unlike HTTP/2 PUSH):
  - Protocols must be stateless, with the server not having to remember what an individual client's cache contains, nor previous bundles/files a certain site has served in the past.
  - Deployment of static content using resource bundles to servers should be possible simply by copying files over, for a server which supports resource bundles. 

([Subresource loading server support](./subresource-loading-server.md) attempts to meet these goals.)

#### For browsers

- Graceful degradation should be possible in multiple ways:
    - Always: Sites which use resource bundles transparently fall back to loading the resources individually for non-supporting sites.
    - Optionally (decision of the build infrastucture): Various forms of feature detection (client-side and server-side) can note the lack of resource bundle support and serve a emulated bundle format when appropriate.
- Resource bundle loading should be reasonable to implement, fitting into something related to browsers' existing fetching and caching architectures while providing performance benefits in practice.

([Subresource loading browser support](./subresource-loading.md) attempts to meet these goals.)

### Privacy

#### Personalization

Resource bundles must not be used for personalized content. Intuitively, they are for the "static" part of a site, and individual resources can be used for the dynamic part. This matches how bundlers are typically used today. As [Brave explained](https://brave.com/webbundles-harmful-to-content-blocking-security-tools-and-the-open-web/), personalization of resource bundles would allow URLs to be statelessly rotated between different requests, making URLs less meaningful/stable.

#### Content blocking

Content blockers have a number of requirements when it comes to ensuring that batching/bundling systems do not lead to them being circumvented in practice:
- It must not be possible for a "trusted" intermediary to "repackage" sites, as this could lead to situations in practice where ads and tracking are signed as the publisher. (c.f. ["Origin model"](#origin-model))
- Resource bundles must not enable the cheap rotation of URLs within the bundle, as this would make URL-based content blocking much more difficult. (c.f. ["Personalization"](https://github.com/littledan/resource-bundles/blob/main/subresource-loading.md#personalization))
- When content is blocked, it's ideal if sites don't tend to cause browsers to download the blocked content. (c.f. ["code splitting"](#for-web-developers))