# Resource bundles

A resource bundle is a collection of HTTP responses, represented in a new file format. This repository supports the development of the definition of the resource bundle format as well as uses of this format:
- The resource bundle format ([explainer](./bundle-format-md), [spec](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html))
- Dynamic chunk loading and caching with resource bundles ([explainer](./dynamic-chunk-loading.md))
- Streaming module loading and execution with resource bundles ([explainer](./streaming-module-loading.md))
- Serving conventions for resource bundles ([explainer](./serving.md))
- JS/web build tool conventions for resource bundles ([explainer](./tools.md))

## Scope

This repository is scoped to be related to proposals which may eventually be involved in improving development and deployment of applications on the standard, multiple-implementation Web platform. Considerations for how these technologies can be deployed outside of the Web are certainly welcome for discussion and influencing the details of the features.

However, larger proposals which are motivated principally by packaging in non-Web environments, or which are explicitly opposed by multiple browser engine maintainers, are out of scope for this effort and can be discussed elsewhere.

In general, efforts may migrate into or out of this repository, if they are considered relevant to the scope and if participants want to develop them in one place or another.

## Implementation

This effort aims to promote software development to implement the resource bundle format and its applications to support the JS/Web ecosystem. We specifically see the need for:
- Browser implementations of resource bundle loading APIs
- Utilities/libraries in various programming languages to pack and unpack resource bundles
- Server support for dynamic chunk serving
- Bundler and framework support for emitting resource bundles
- Polyfills for using/emulating resource bundles in browsers without native support

At this point, these proposals are all very early and are best developed within an experimental plugin, behind a flag, etc.

Resource bundles and their applications are designed to be suitable to gradual adoption--even if implementations exist only in certain parts of the stack, they are still useful.

This repository can host software development for tools and polyfills and also cross-reference related software development done elsewhere.

## Standards venue

The Web Incubator Community Group, which (*theoretically, in the future*) hosts this repository, is not a standards venue itself; documents developed here are not, by themselves, on a standards track. Instead, WICG serves to provide an open platform and safeguard the intellectual property developed, to enable later standardization.

The resource bundle format itself is planned to eventually become an RFC from the [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/). It is periodically published as an Internet-Draft. However, its draft is developed in this repository.

Resource and module loading on the Web is generally defined by [WHATWG](https://whatwg.org/) standards like [HTML](https://html.spec.whatwg.org/) and [Fetch](https://fetch.spec.whatwg.org/) and [W3C](https://www.w3.org/) standards like [Resource Hints](https://w3c.github.io/resource-hints/). When the proposals in this repository reach a state of [multi-implementer support and no strong implementer objections](https://whatwg.org/working-mode), with [web-platform-tests](https://github.com/web-platform-tests/wpt/) tests developed, they will be proposed as pull requests to those standards.
