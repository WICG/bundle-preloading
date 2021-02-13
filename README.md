# Resource bundles

A resource bundle is a collection of HTTP responses, represented in a new file format. This repository supports the development of the definition of the resource bundle format, with a primary application of efficient subresource loading on the Web.

## Motivation

Modern web application consist of composing resources. The model of the Web is that these resources are shipped separately. However, developers have, for several years, chosen to create bundling solutions for a variety of reasons ranging from performance benefits, to creating usable abstractions that could be used together. This proposal seeks to make bundling a first class citizen for the Web platform, while maintaining the guarantees of the Web platform. 

## Table of contents
- [Motivation, goals and constraints](./motivation.md)
- [Resource bundle file format](./bundle-format.md)
- [Subresource loading from the client side](./subresource-loading.md)
- [Subresource loading from the server side](./subresource-loading-server.md)
- [Subresource loading input from tools](./subresource-loading-tools.md)
- [FAQ](./faq.md)
- [Other uses of bundles](./other-uses.md)

## Scope

This repository focuses on the application of resource bundles to subresource loading, but it also includes notes about possible use in other places. Generally, this repository is scoped to be related to proposals which may eventually be involved in improving development and deployment of applications on the standard, multiple-implementation Web platform. Considerations for how these technologies can be deployed outside of the Web are certainly welcome for discussion and influencing the details of the features.

However, larger proposals which are motivated principally by packaging in non-Web environments, or which are explicitly opposed by multiple browser engine maintainers, are out of scope for this effort and can be discussed elsewhere.

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

The Web Incubator Community Group, which may, in the future, host this repository, is not a standards venue itself; documents developed here are not, by themselves, on a standards track. Instead, WICG serves to provide an open platform and safeguard the intellectual property developed, to enable later standardization.

The resource bundle format itself is planned to eventually become an RFC from the [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/). It will be periodically published as an Internet-Draft. The bundle format is currently developed in [the wicg/webpackage repository](https://github.com/WICG/webpackage/blob/master/draft-yasskin-wpack-bundled-exchanges.md), with three PRs proposed ([#617](https://github.com/WICG/webpackage/pull/617), [#618](https://github.com/WICG/webpackage/pull/618), [#619](https://github.com/WICG/webpackage/pull/619)) to align this proposal with that.

Resource and module loading on the Web is generally defined by [WHATWG](https://whatwg.org/) standards like [HTML](https://html.spec.whatwg.org/) and [Fetch](https://fetch.spec.whatwg.org/) and [W3C](https://www.w3.org/) standards like [Resource Hints](https://w3c.github.io/resource-hints/). When the proposals in this repository reach a state of [multi-implementer support and no strong implementer objections](https://whatwg.org/working-mode), with [web-platform-tests](https://github.com/web-platform-tests/wpt/) tests developed, they will be proposed as pull requests to those standards.