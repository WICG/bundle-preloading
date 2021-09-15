# Motivation, goals, and constraints

## Background

Websites are often composed of multiple resources, such as HTML, CSS, JavaScript and images. When a Web application is loaded, the Web browser fetches the resources referenced by the page and renders the Web page.

**TODO weird writing**

The historical way of building and deploying websites was to use separate files for code organization purposes and allow the browser to fetch them separately. This model did not perform well in real-world applications as their source grew to hundreds and thousands of files.

In an attempt to address these performance issues without losing the ability to organize code in files, developers built tools that transform and combine source files for efficient deployment in various ad-hoc ways:

- CSS concatenation
- Image spriting
- Script concatenation
- JavaScript transpilers supporting module systems and polyfills
- Imperative insertion of images and stylesheets from base64 encoding (see [virtualization](./glossary.md#virtualization)).

**TODO link**

Modern tools that automate these ad-hoc strategies are known as *bundlers*. Some popular bundlers include [webpack](https://webpack.js.org/), [rollup](https://rollupjs.org/guide/en/), [Parcel](https://parceljs.org/) and [esbuild](https://esbuild.github.io/).

## Why change the status quo?

Two reasons: efficiency and interoperability.

Bundlers' strategies impose overhead at several levels. Virtualization of resources affects browser's fetch destination and processing. Changing bundles are hard to maintain with respect to caches, and do not fit the browsers' existing caching schemes. Combination of resources may impose a processing or translation overhead relative to e.g. native modules, sources, or individual images.

Each bundler ecosystem is effectively a walled garden. Their bundling strategies are usually neither interoperable nor standardized. For example, there is no standard way for a bundle created with webpack to access an image inside of a bundle created with Parcel.

URLs addressing individually fetched resources are the basis for the architecture of today's Web. Browsers and other HTTP clients contain several mechanisms based on this architecture, which are unfortunately obscured by bundlers today:
- Responses have MIME types and can be fetched in a streaming way, permitting incremental and/or parallel processing.
- Each response can be cached individually according to its URL and cache control directives.

At the same time, modern bundlers also serve a number of purposes not met by fetching resources individually:
- Reducing significant per-resource overhead at the network and browser level, for example reducing network round trips and enabling more efficient compression
- Facilitating the use of long-lived caching by implementing [revving](./glossary.md#revving).
- Prefetching content when needed by tracking dependencies, while avoiding duplication of shared dependencies (["code splitting"](./glossary.md#codesplitting)).
- Avoiding loading unused resources, for example by [tree shaking](./glossary.md#treeshaking).

This proposal aims to create a first-class API for preloading multiple resources from bundled responses that combines the benefits offered by today's bundler ecosystem with the benefits of serving and accessing individual resources.

By implementing a native bundling scheme, Web browsers will be better able to interpret the output of bundlers while maintaining a tight correspondence to Web semantics and retaining bundling's performance benefits.

## Goals

Bundle preloading seeks to enable developers to:
- Efficiently distribute Web content in a standard and interoperable manner, without custom application logic.
- Remove overhead from resource ["virtualization"](./glossary.md#virtualization).
- Benefit from code splitting, incremental caching and related strategies, without needing to solve the hard problem of cache invalidation.
- Write Web code without changing development workflow or URL accesses.

Bundle preloading focuses on the standard, interoperable Web platform. Our primary goal is the broad adoption of bundle preloading by all major Web browsers. Discussion of how these technologies can be deployed outside of the Web are welcome for discussion and influencing the details of the features, but the following use cases are beyond the scope of this proposal:
- Bundle preloading in non-Web environments
- Preloading bundled responses from different origins
- Offline preloading of bundled content
- Content origin attestation, e.g. signed exchanges

Bundle preloading must not weaken the security or user freedom of the open Web. The following subsections elaborate on goals, non-goals, and constraints as they relate to Web developers and users.

### HTTP/URL semantics

#### Resource identity and URL consistency

URLs form the identity for resources on the Web. Resource bundles *represent* the same resources as their individual URLs indicate. Servers must maintain this correspondence--serving the same result if a resource is fetched individually, outside of the bundle. This correspondence maintains the sense of identity of URLs.

Clients must be able to verify that servers are well-behaved in practice. Enforcement of this property is described in ["Optionality and URL integrity"](./subresource-loading-client.md#optionality-and-url-integrity). In this proposal, maintaining resource identity is necessary for backwards compatibility and graceful degradation as much as it is for preserving user freedom on the Web.

#### Origin model

This proposal aims to preserve the Web's origin model. On the Web, resources, including bundles, are fetched from a URL in a particular origin (e.g. `https://`). Bundle preloading, as described in this proposal, fetches resources within the same origin as the bundle was fetched from.

(A possible extension would be to lower the privilege level even further with mutually-isolated segments within an `https://` origin, but this feature is beyond the scope of this repository, c.f., [Chrome's proposal for opaque-origin iframes](https://github.com/WICG/webpackage/blob/main/explainers/subresource-loading-opaque-origin-iframes.md/).)

#### Path restriction

For the same [reason as ServiceWorkers](https://w3c.github.io/ServiceWorker/#path-restriction), it is important to limit resource bundles to represent resources whose path begins with a particular prefix, to provide additional protection on sites which host multiple users' content in different directories in the same origin (e.g., university websites' home directories, or GitHub pages for large organizations with several repositories).

### Usability

#### For Web developers

- Web development mechanisms and tools (other than bundlers) should not need to change as a result of using bundle preloading.
- Mechanisms like code splitting with `import()` and asset references with `new URL()` should be usable in the same way.
- Rich transformations (e.g., JSX, SASS), not just built-in Web features, should remain usable when targeting resource bundles.
- Bundle preloading should allow for [revving](./glossary.md#revving).

#### For servers and intermediaries

- Web servers, as well as optimizing/caching intermediaries such as CDNs, should be able to implement bundle preloading with low, reasonable overhead and without being required to hold the entire bundle in memory.
- Web servers and intermediaries that do not understand bundle preloading should not suffer large time or space performance penalties (e.g. combinatorial explosion of caching content).
- The serving logic should be stateless and independent of the details of bundlers or applications (e.g. unlike HTTP/2 PUSH):
  - Protocols must be stateless, with the server not needing to track individual client cache contents or previously served bundles/files for the origin.
  - Deployment of static content using bundles to servers should be possible simply by copying files.
- This proposal is complementary to [HTTP3/QUIC](https://developer.mozilla.org/en-US/docs/Glossary/QUIC).


#### For browsers

- Graceful degradation should be possible in multiple ways when unsupported by the browser:
  - *Always*: Sites which use bundle preloading will transparently fall back to fetching resources individually.
  - *Optionally*: Feature detection can observe the lack of bundle preloading support and emulate bundle preloading when appropriate, e.g. using ServiceWorkers.
- Bundle preloading should be reasonable to implement, fitting into browsers' existing fetching and caching architectures while providing performance benefits in practice.

### Privacy

#### Personalization

Bundle preloading should not enable disguising personalized content; that introduces potential harm to privacy. Intuitively, bundle preloading is for the "static" assets of a site, and individual resources can be used for dynamic API access. This matches how bundlers are typically used today.

Brave [objects](https://brave.com/webbundles-harmful-to-content-blocking-security-tools-and-the-open-web/) to bundle preloading approaches that weaken [resource identity](./glossary.md#rsrcidentity), such as if personalization of bundles allows URLs to be statelessly rotated between different requests. This proposal's approach to bundle preloading does not weaken the significance of URLs.

#### Content blocking

Content blocking and bundle preloading must remain compatible; if bundle preloading defeats content blocking, this weakens user freedom on the Web.
- It must not be possible for a "trusted" intermediary to "repackage" sites, as this could lead to situations in practice where ads and tracking are signed as the publisher. (c.f. ["Origin model"](#origin-model))
- Bundle preloading must not enable the cheap rotation of URLs within the bundle, as this would make URL-based content blocking much more difficult. (c.f. ["Personalization"](#personalization))
- When content is blocked, bundle preloading should not cause browsers to download the blocked content. (c.f. ["code splitting"](#for-web-developers))

[Previous section](./README.md) - [Table of contents](./README.md#table-of-contents) - [Next section](./overview.md)