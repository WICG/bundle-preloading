# Prototyping and implementation of bundle preloading

## Gradual Adoption

We intend for bundle preloading to be suitable for gradual adoption. Even if implementations exist only in certain parts of the stack, they should still be useful.

- Application developers can adopt the bundled response format as a simple one-file deployment payload, and use a polyfill in production.
- Applications can use native support instead of the polyfill as browsers add support.
- Static web servers can serve entire bundled response files without understanding bundle subresource requests.
- Proxies can be used to support bundle subresource requests for existing servers. 
- Intermediaries can cache or ignore bundle subresource requests by interpreting new and existing `Cache-Control` header values.

Each of these use-cases stands on its own, and can provide motivation for adoption of the resource bundle format and protocol while implementation in browsers is still ongoing. We believe that gradual adoption is important, because it will help us collect real-world feedback during the design phase and build confidence in the design as it progresses towards becoming an interoperable web standard.

## Implementation Areas

The champions of this proposal, who maintain this repository, want to promote software development that would help the web ecosystem successfully adopt and migrate to preloading resources from bundled responses.

We forsee the need for the following implementation efforts (and expect to support efforts along these lines):

- **Browsers**: Implementations of bundle preloading APIs
- **Bundlers and frameworks**: Support for loading subresources using the bundle preload API.
- **Proxies and web servers** (such as Apache and nginx): support for bundle preloading requests
- **Dynamic web server standards** (such as WSGI, Rack, Java Servlets and Express.js): middleware for bundle preloading requests

We also expect to need polyfills for using/emulating bundles loading in browsers without native support.

These proposals still undergoing active design. We believe that, at this time, implementations would be most helpful if developed in an effort to gather and provide feedback about these proposals. We suggest prototyping support within an experimental plugin, behind a flag, etc. and to clearly communicate to your users that the proposal is still likely to undergo substantial changes.

During the design and early implementation phase, we expect this repository to serve as the canonical source of information about the status of this proposal and implementation efforts. We expect to use this repository to host software development for tools and polyfills. We also expect to maintain a list of related software development done elsewhere.

## Prototypes

### Polyfill

The authors plan to develop a prototype polyfill using the ServiceWorker API. The polyfill will support:
- Making bundle preloading requests to a bundle-supporting server
- Serving bundle preloading requests from entire bundles
- Incremental, persistent caching of bundle subresources

The prototype polyfill will be hosted at 🚧 location TBD 🚧.

### Browsers

Google Chrome is currently running an [origin trial](https://chromium.googlesource.com/chromium/src.git/+/refs/heads/main/content/browser/web_package/subresource_loading_origin_trial.md) for "subresource loading with web bundles". Though it's an exciting effort, it currently differs from the this proposal in several ways.

- Most importantly, the origin trial does not yet support the `'Bundle-Preload'` request header. The client has no way of informing servers what it wants to receive in a bundle. This means that servers may send more than needed. This shares cache invalidation and cache digest problems with existing strategies like HTTP/2 Server Push.
- The origin trial uses a `<link>` tag instead of a `<script>` tag, which raises [concerns about injection attacks](https://lists.w3.org/Archives/Public/public-web-perf/2020Aug/0028.html).
- In that version, multiple scopes may be specified for the destination of a web bundle. This proposal suggests a narrower [path restriction](./motivation.md#path-restriction).
- They also implement a mechanism for [opaque-origin iframes](https://github.com/WICG/webpackage/blob/main/explainers/subresource-loading-opaque-origin-iframes.md/). Though the authors support the protection goals of opaque-origin iframes, it is beyond the scope of this proposal, and the `"urn:uuid"` syntax runs counter to the goal of preserving [resource identity](./motivation.md#resource-identity).

We hope to work with the Google Chrome developers to combine the two efforts, as we believe we have lots of common ground.

### Bundlers and frameworks

🚧 The authors are currently soliciting community feedback to find an appropriate bundler to work with for early prototyping.

### Proxies and web servers

The authors plan to develop a prototype proxy that enables bundle preloading, to be hosted at 🚧 location TBD 🚧.

### Dynamic web server standards

🚧 The authors are currently soliciting community feedback to find an appropriate server standard to work with for early prototyping.

[Previous section](./faq.md) - [Table of contents](./README.md#table-of-contents) - [Next section](./subresource-loading-evolution.md)
