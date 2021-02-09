Resource bundles represent a mapping from URL paths to HTTP responses. They are based on an extensible binary format, where new "sections" can be defined over time for different kinds of data.

This document describes the high-level design of resource bundles' format, and how this format relates to applications like subresource loading and serving. A standard to describe this format would be a bit divorced from the content, motivations and implied semantics discussed below (see ["Specification"](#specification)).

The broader area of binary formats for bundles of HTTP responses is under discussion in the [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/), which would be the ideal body to standardize this work. This document is based on previous Internet-Drafts by Jeffrey Yasskin published in the IETF WPACK WG.

## Binary section architecture

Resource bundles are defined in [CDDL](https://www.rfc-editor.org/rfc/rfc8610.html), a language for expressing grammars over [CBOR](https://tools.ietf.org/html/rfc7049) binary data formats. This infrastructure means that the resource bundles specification does not need to worry about the details of the binary format and can focus on high-level architecture, using standard tools.

At the top level of their binary format, resource bundles are defined as a series of named sections, each with a length. The `section-lengths` field contains a table of contents, and the sections are found in the main `sections` field.

To maintain compatibility across versions and environments, a resource bundle begins with a magic number, then a version number, and ends with its length.

```
resourcebundle = [
  magic: h'F0 9F 8C 90 F0 9F 93 A6',
  version: bytes .size 4,
  section-lengths: bytes .cbor section-lengths,
  sections: [* any ],
  length: bytes .size 8,  ; Big-endian number of bytes in the bundle.
]
section-lengths = [* (section-name: tstr, length: uint) ],
```

## Core sections: `index` and `resources`

The `index` section maps URLs to offset/length pairs in the resources section. The URLs are simply relative paths, within the same origin and directory as the bundle was fetched.

```
index = {* tstr => [location-in-responses] }
location-in-responses = (offset: uint, length: uint)
```

The `resources` section contains the payloads. These consist of two arbitrary binary strings, the first of which stands for the response headers, and the second of which is the response body.

```
responses = [*response]
response = [headers: bstr .cbor headers, payload: bstr]
headers = {* bstr => bstr}
```

## Supplemental sections

The following sections go beyond the core goal of representing a mapping from paths to responses, and are application-specific. They may or may not be included in the main resource bundles specification, but either way, would be represented in the same resource bundle section registry.

### Content negotiation

Servers perform content negotiation--determining the response based on attributes of the request--as a part of serving the web. Packaged applications (which are outside of the core scope of this repository) may also need to perform these similar server-side functions on the client side.

The `negotiated-index` section provides a more detailed mapping from URLs + request headers to response offset/length pairs. The reponses here 'override' the responses found in the named `index`, if they conflict. The `index`'s value is used as a fallback if the request does not match any of the variants named for content negotiation.

```
negotiated-index = {* whatwg-url => [ variants-value, +location-in-responses ] }
variants-value = bstr
```

For further details about how the variants-value represents content negotiation, see [the specification's explanation](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html#section-4.2.1). Note that the proposal here is to use a simpler `index`, and move the more advanced index to the `negotiated-index` section.

## Specification

The format above matches the [Web Bundles specification](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html) if PRs [#617](https://github.com/WICG/webpackage/pull/617), [#618](https://github.com/WICG/webpackage/pull/618) and [#619](https://github.com/WICG/webpackage/pull/619) are landed.

*See the [bundle format FAQ](./faq.md#bundle-format) for more information.*
