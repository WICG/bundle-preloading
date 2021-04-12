# Bundle preloading

## Authors

* @cjtenny
* @littledan
* @wycats

## Introduction

Bundled responses are a collection of HTTP responses, represented in [a new file format](https://github.com/seanturner/wpack-bundled-responses). This document describes a mechanism and semantics for efficient preloading of multiple resources from bundled responses.

Web bundlers currently face lots of hurdles to provide a good developer experience, fast site loading, and efficient cache and network usage. A bundling format alone does not address all of their issues. This proposal focuses on a mechanism that allows a large number of resources to be preloaded efficiently and incrementally cached by browsers, CDNs, and other intermediaries in ways complementary to [HTTP3/QUIC](https://developer.mozilla.org/en-US/docs/Glossary/QUIC).

There have been [several](https://en.wikipedia.org/wiki/HTTP/2_Server_Push) [previous](https://datatracker.ietf.org/doc/html/rfc7541) [attempts](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-cache-digest-05) to implement aspects of efficient resource bundling on the web. Unfortunately, they failed to gain widespread adoption due to constraints imposed on bundlers, servers, and clients. This proposal attempts to avoid the failures of those previous attempts. It does so by:
- Offering imperative and declarative client-side control to web developers
- Maintaining backwards compatibility for servers and intermediaries through polyfilling and existing cache-control mechanisms
- Preserving the relationship between URLs and content (["resource identity"](./glossary.md#rsrcidentity) for graceful degradation and content blocking.

Bundle preloading can be used to:
- Load web content faster
- Reduce bundler build time and logic
- Represent simple web sites with fewer files

## Participation and Standards Venue

The Web Incubator Community Group is not a standards venue itself; documents developed here, such as this one, are not by themselves on a standards track. Instead, WICG serves to provide an open platform and safeguard the intellectual property developed to enable later standardization.

The resource bundle format referenced in this proposal is an RFC from the IETF WPACK WG. It will be periodically published as an Internet-Draft. The bundle format is currently developed in the [wpack-wg/bundled-responses](https://github.com/wpack-wg/bundled-responses) repository.

Discussion of this proposal is welcome in the [issues](https://github.com/WICG/resource-bundles/issues) section of this repository. Additional discussion occurs on our [Matrix](https://matrix.to/#/#bundle-preloading:igalia.com) channel, at [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/) meetings, and on the WPACK WG [mailing list](https://www.ietf.org/mailman/listinfo/wpack).

Resource and module loading on the Web is generally defined by [WHATWG](https://whatwg.org/) standards like [HTML](https://html.spec.whatwg.org/) and [Fetch](https://fetch.spec.whatwg.org/) and [W3C](https://www.w3.org/) standards like [Resource Hints](https://w3c.github.io/resource-hints/). When the proposals in this repository reach a state of [multi-implementer support and no strong implementer objections](https://whatwg.org/working-mode), with [web-platform-tests](https://github.com/web-platform-tests/wpt/) tests developed, they will be proposed as pull requests to those standards.

# Table of contents

This proposal seeks to address several audiences - bundler and tooling authors, client and server side web developers, and browser implementers - and as such has been split into several files.

We recommend starting with the [motivation](./motivation.md) and [examples](./examples.md), which together with this introduction are a general-purpose [explainer](https://w3ctag.github.io/explainers) for most audiences.

The remaining sections go into more detail about the design tradeoffs and possible scenarios relating to gradual adoption, backwards compatibility, and graceful degradation for specific audiences.

🚧 = Out of date, being rewritten to be consistent with current state of proposal (2021-05-13)

- [Motivation, goals and constraints](./motivation.md)
- [Basic usage: bundle preloading examples](./examples.md)
- Considerations for bundlers, servers, and browsers
  - 🚧 [Bundle preloading for clients](./subresource-loading.md) 🚧
  - 🚧 [Bundle preloading for servers](./subresource-loading-server.md) 🚧
  - 🚧 [Suggestions for bundlers & tools](./subresource-loading-tools.md) 🚧
- 🚧 [FAQ](./faq.md) 🚧
- [Glossary](./glossary.md)
- [Prototyping and implementation](./implementation.md) 

## Stakeholder feedback / opposition

🚧 The [FAQ](./faq.md) contains some characterization of stakeholder feedback; however, it is based on an outdated version of this proposal. This section will be updated as stakeholders offer feedback. 🚧

## Acknowledgements

Ongoing conversations with and feedback from the following parties have helped shape (and continue to shape!) this proposal. The authors very much appreciate:

Guy Bedford, Rob Buis, Andrea Gianmarcchi, Devon Gonett, Tsuyoshi Horo, Hayato Ito, Jeff Kaufman, Tobias Koppers, Jason Miller, Shubhie Panicker, Pete Snyder, Martin Thomson, Sean Turner, Yoav Weiss, Evan Williams, Kinuko Yasuda, and Jeffrey Yasskin.

Previous section - [Table of contents](./README.md#table-of-contents) - [Next section](./motivation.md)
