# Glossary & references

This page gives working definitions for terms involved in bundle preloading and links to definitions for other relevant web terms which are already well-defined.

🚧 This glossary is a work in progress. If you encounter a confusing term in this proposal, let us know and we'll add an entry! 🚧

## What's a bundle?

A <a id="bundle"></a>**bundle** is a collection of [resources](#resource) used by a website. For each resource, it includes not only the data for the resource, such as a JavaScript file or image, but also the HTTP response context for the resource, e.g. response headers. In this proposal, 'bundle' often specifically refers to files in the [IETF WPACK WG format](https://datatracker.ietf.org/doc/draft-yasskin-wpack-bundled-exchanges/).

<a id="loading"></a>**Bundle preloading** refers to the process of accessing [resources](#resource) from within [bundles](#bundle), in contrast to accessing resources by requests to their canonical URLs. This proposal focuses on the semantics of bundle preloading.

## Bundle preloading terms

These terms are introduced or refined by this proposal. Many of these terms are used elsewhere on the web, but their meaning has subtleties that are context-dependent. This section defines them more precisely for how they are used throughout this proposal.

- <a id="resource"></a>**Resource** (also often referred to as an _asset_): A piece of data needed by a website. For example, JavaScript modules, CSS rulesets, and images are common resources (or parts of resources) used by web pages. A resource is [identified](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web) by a URL.

- <a id="intermediary"></a>**Intermediary**: An intermediary is any [proxy server](https://developer.mozilla.org/en-US/docs/Glossary/Proxy_server) serving a [browser](https://developer.mozilla.org/en-US/docs/Glossary/Browser) the contents of a [site](https://developer.mozilla.org/en-US/docs/Glossary/Site), including [transparent proxies](https://en.wikipedia.org/wiki/Proxy_server#Transparent_proxy) and [CDNs](https://developer.mozilla.org/en-US/docs/Glossary/CDN).

- <a id="canonical"></a>**Canonical URL**: [Resources](#resource) can be accessed in multiple ways. When a resource is contained within a bundle, the path representing that resource is a [URL]. Responses to requests made with the same headers to that URL must have the same [payload](https://developer.mozilla.org/en-US/docs/Glossary/Payload_body) and headers as the bundled resource to be considered compliant with bundle preloading, and in order to enable [progressive enhancement](#enhancement) and [graceful degradation](#degradation)

- <a id="prefetch"></a>**Preloading**: Previously referred to as 'batch prefetching' and 'batch preloading', this proposal focuses on "preloading" of bundled content because content can be requested before the browser is aware of a reference to it. This mechanism allows browsers to avoid downloading parts of a bundle [before they are needed](#lazyloading) to offer a faster web experience, as well as to avoid downlading resources they already have cached.

- <a id="subsetting"></a>**Bundle subsetting**: Bundle preloading involves dynamically serving bundled responses based upon a `Bundle-Preload` header. A bundler might produce a bundle with many responses, subsets of which are requested by different web pages or at different times. The process of producing and serving subsets of responses is referred to as 'bundle subsetting'.

- <a id="signedexchg"></a>[**Signed exchange**](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html): A proposal from the Google Chrome team to allow one "distributor" to serve web content from another "publisher". In its basic form ([shipping in Chrome, Edge, and Opera](https://caniuse.com/sxg), but explicitly opposed by other engines), Signed exchange does not use bundling, but instead signs an individual HTTP response.

- <a id="rsrcidentity"></a>**Resource identity**: URLs form the identity for resources on the Web. Resource bundles *represent* the same resources as their individual (canonical) URLs indicate. A page depending on a resource should behave identically whether that resource is preloaded from a bundle or fetched on its own; the identity of the resource at that URL does not depend on whether it is loaded from a bundle.

## Other helpful terms and references

This is a short index of web terms referenced in this proposal. Most of these terms are already well-defined, in which case we link to their definitions elsewhere. We provide short definitions or clarifications for a few as they relate to bundle preloading.

### HTTP

- It's very important to know what a [URL](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_URL) is to evaluate this proposal.

Relevant HTTP [headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers):
  - [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) - this proposal introduces a new value for `Cache-Control`
  - [Early Hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103)
  - [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag): `ETag`s and [cache digests](#digest) are important to understand in the context of [bundle subsetting](#subsetting).
  - [Vary](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary): `Vary` is also used for [bundle subsetting](#subsetting).

Other attempts have been made at improving the performance of serving many resources over HTTP.
- [HTTP/2](https://developer.mozilla.org/en-US/docs/Glossary/HTTP_2): This reduced much of the overhead of HTTP 1.
  - [HTTP/2 Server Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push): Allowed servers to send multiple responses together, similar to a bundle, but was [difficult to get right](https://jakearchibald.com/2017/h2-push-tougher-than-i-thought/) and to interface with bundlers.
- [QUIC](https://developer.mozilla.org/en-US/docs/Glossary/QUIC) (a.k.a. HTTP/3): Improves upon HTTP/2, without server push.

### Bundlers

A <a id="bundler"></a>**bundler** is a piece of software that packages resources for a website into different bundles, whether using the [IETF WPACK WG format](#bundle) or by concatenating JavaScript files, spriting images, etc. Most bundlers aim to make website loading faster, and many enable additional JavaScript features, such as modules, by transpiling code for older browsers.

Some popular bundlers include [webpack](https://webpack.js.org/), [rollup](https://rollupjs.org/guide/en/), [Parcel](https://parceljs.org/) and [esbuild](https://esbuild.github.io/).

Many bundlers employ the following optimization techniques:
  - <a id="codesplitting"></a>[Code splitting](https://developer.mozilla.org/en-US/docs/Glossary/Code_splitting)
  - <a id="cssconcatenation"></a>CSS concatenation: By putting many CSS rulesets into a single file, per-file overhead is reduced.
  - <a id="imagespritting"></a>[Image spriting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Images/Implementing_image_sprites_in_CSS)
  - <a id="minification"></a>[Minification](https://developer.mozilla.org/en-US/docs/Glossary/minification): Can be applied to both JS and CSS.
  - <a id="treeshaking"></a>[Tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)
  - <a id="virtualization"></a>Virtualization: CSS and images, among other resource types, can often be included in JavaScript files represented as base64 or other data. Though this makes resources loading slower for the browser because JavaScript must decode and insert those resources, it reduces the number of requests needed to deliver all of the resources.

- Build time: The amount of time it takes a bundler to produce bundled files from its input. Many bundlers focus on offering a fast build time so developers can rapidly reload their changes.

### Web performance

- <a id="digest"></a>Cache digest: [This page](https://calendar.perfplanet.com/2016/cache-digests-http2-server-push/) offers a good definition and some background: "A cache digest is sent by the client to the server. It tells the server what the client’s cache contains."
- [Compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression#file_format_compression): Compressing files reduces the time it takes to send data over the network, at the smaller cost of comperssion and decompression time on each end.
  - Compression dictionary: Many compression algorithms rely on a dictionary of sequences removed from source text. Compressing lots of material with similar content can be more efficient because the resulting dictionary is smaller than material with more unique content.
- <a id="degradation"></a>[Graceful degradation](https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation): Bundle preloading aims to achieve graceful degradation with decent performance for clients and [intermediaries](#intermediary) that do not support bundling.
- <a id="lazyloading"></a>[Lazy loading](https://developer.mozilla.org/en-US/docs/Glossary/Lazy_load): [Bundle subsetting](#subsetting) supports lazy loading.
- <a id="enhancement"></a>[Progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement): A bundle preloading polyfill can enable progressive enhancement.
- <a id="revving"></a>[Revved resources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#revved_resources) (revving): Unlike the authors' [previous approach](https://github.com/littledan/resource-bundles), revving is left as a choice to bundlers. Bundle preloading supports revving but does not contain any explicit restrictions that enforce or prevent it.
- <a id="tti"></a>[Time to interactive](https://developer.mozilla.org/en-US/docs/Glossary/Time_to_interactive) (TTI): An important metric for website performance. A website does not necessarily need to load a whole bundle to have a good TTI.

[Previous section](./subresource-loading-evolution.md) - [Table of contents](./README.md#table-of-contents) - [Next section](./implementation.md)
