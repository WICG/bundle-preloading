# Bundle preloading

## Authors

* @cjtenny
* @littledan
* @wycats
* @felipeerias

## Introduction

This document describes a mechanism and semantics for the efficient preloading of multiple resources using bundled HTTP responses in [the Web Bundles format](https://github.com/wpack-wg/bundled-responses).

Modern Web sites are composed of hundreds or thousands of resources. Fetching them one by one has poor performance, which is why Web developers rely on *bundlers*, tools that combine and transform resources for efficient deployment.

However, bundlers currently face many hurdles to provide a good developer experience, fast site loading, and efficient cache and network usage. The non-standard formats used by bundlers are not interoperable and extracting resources from them tends to be costly; furthermore, their contents are mostly opaque to browsers, preventing fine-granied cache management.

This proposal focuses on a mechanism that allows a large number of resources to be preloaded efficiently and incrementally cached by browsers, CDNs, and other intermediaries in ways complementary to [HTTP3/QUIC](https://developer.mozilla.org/en-US/docs/Glossary/QUIC).

There have been [several](https://en.wikipedia.org/wiki/HTTP/2_Server_Push) [previous](https://datatracker.ietf.org/doc/html/rfc7541) [attempts](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-cache-digest-05) to implement aspects of efficient resource bundling on the web. Unfortunately, they failed to gain widespread adoption due to constraints imposed on bundlers, servers, and clients. This proposal attempts to avoid the failures of those previous attempts by:

- Offering imperative and declarative client-side control to web developers
- Maintaining backwards compatibility for servers and intermediaries through polyfilling and existing cache-control mechanisms
- Preserving the relationship between URLs and content (["resource identity"](./glossary.md#rsrcidentity) for graceful degradation and content blocking.

<!-- TODO complete and sync with other docs-->

The main goals of bundle preloading are:

- Efficiently distribute web content in a standard and interoperable manner.
- Allow developers to keep the benefits of today's bundler ecosystem:
  * improved network performance and faster load times;
  * optimization strategies like revving, code splitting, tree shaking, etc. remain possible;
  * reduced bundler build time and logic.
- At the same time, preserve the benefits of accessing individual resources:
  * flexibility when loading and processing responses;
  * each response can be cached individually.


## Participation and Standards Venues

The Web Incubator Community Group is not a standards venue itself; documents developed here, such as this one, are not by themselves on a standards track. Instead, WICG serves to provide an open platform and safeguard the intellectual property developed to enable later standardization.

The resource bundle format referenced in this proposal is an RFC from the [IETF WPACK working group](https://datatracker.ietf.org/group/wpack/about/) which will be periodically published as an Internet-Draft. The bundle format is currently developed in the [wpack-wg/bundled-responses](https://github.com/wpack-wg/bundled-responses) repository.

Discussion of this proposal is welcome in the [issues](https://github.com/WICG/resource-bundles/issues) section of this repository. Additional discussion occurs on our [Matrix](https://matrix.to/#/#bundle-preloading:igalia.com) channel, at [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/) meetings, and on the WPACK WG [mailing list](https://www.ietf.org/mailman/listinfo/wpack).

Resource and module loading on the Web is generally defined by [WHATWG](https://whatwg.org/) standards like [HTML](https://html.spec.whatwg.org/) and [Fetch](https://fetch.spec.whatwg.org/) and [W3C](https://www.w3.org/) standards like [Resource Hints](https://w3c.github.io/resource-hints/). When the proposals in this repository reach a state of [multi-implementer support and no strong implementer objections](https://whatwg.org/working-mode), with [web-platform-tests](https://github.com/web-platform-tests/wpt/) tests developed, they will be proposed as pull requests to those standards.

# Table of contents

This proposal seeks to address several audiences - bundler and tooling authors, client and server side web developers, and browser implementers - and as such has been split into several files.

We recommend starting with the [motivation](./motivation.md) and [overview](./overview.md), which together with this introduction are a general-purpose [explainer](https://w3ctag.github.io/explainers) for most audiences.

The remaining sections provide further details for specific audiences.

- [Motivation, goals and constraints](./motivation.md)
- [Overview: bundle preloading](./overview.md)
- Considerations for bundlers, servers, and browsers
  - [Bundle preloading for clients](./subresource-loading-client.md)
  - [Bundle preloading for servers](./subresource-loading-server.md)
  - [Suggestions for bundlers & tools](./subresource-loading-tools.md)
- [FAQ](./faq.md)
- [Ideas for the future evolution of this proposal](./subresource-loading-evolution.md)
- [Glossary](./glossary.md)
- [Prototyping and implementation](./implementation.md) 

## Stakeholder feedback

The [FAQ](./faq.md) contains some characterization of stakeholder feedback. This section will be updated as stakeholders offer feedback.

## Acknowledgements

Ongoing conversations with and feedback from the following parties have helped shape (and continue to shape!) this proposal. The authors very much appreciate:

Guy Bedford, Rob Buis, Andrea Gianmarcchi, Devon Gonett, Tsuyoshi Horo, Hayato Ito, Jeff Kaufman, Tobias Koppers, Jason Miller, Shubhie Panicker, Pete Snyder, Martin Thomson, Sean Turner, Yoav Weiss, Evan Williams, Kinuko Yasuda, and Jeffrey Yasskin.

Previous section - [Table of contents](./README.md#table-of-contents) - [Next section](./motivation.md)
