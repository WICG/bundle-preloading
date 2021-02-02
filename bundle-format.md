Resource bundles represent a mapping from URL paths to HTTP responses. They are based on an extensible binary format, where new "sections" can be defined over time for different kinds of data.

This document describes the high-level design of resource bundles' format, and how this format relates to applications like subresource loading and serving. A standard to describe this format would be a bit divorced from the content, motivations and implied semantics discussed below.

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

## FAQ

#### Q: Why not use .tar or .zip?

**A**: These both have significant problems. zip stores its index at the end, so it's not suitable for streaming. tar doesn't permit random access, and can only be used in a streaming mode. Increasing the amount of metadata (e.g., for HTTP headers) is awkward in both formats and would require new tooling anyway.

#### Q: Should [W3C MiniApp packaging](https://w3c.github.io/miniapp/specs/packaging/) use this bundle format instead of .zip?

**A**: This is really a question for the [W3C MiniApp CG](https://github.com/w3c/miniapp/), but there are some valid reasons why the MiniApp CG may decide to leave things as is:
- Most of the MiniApp packaging specification focuses on the format and conventions for applications, which is outside of the scope of the core bundling format described in this document. The .zip file is the simple part.
- This proposal is not yet ready, and it would be a shame for an early version of it to ship in MiniApp with a different version shipping on the Web later.
- MiniApp is already in wide use in the ecosystem despite lack of formal standardization, so the standardization effort around it naturally leans on the conservative side around making compatibility-affecting changes. Switching bundle formats would make new apps not work on old app runtimes.
- .zip is an established standard which is in wide use, so it seems fine to use for MiniApp if it works well for them.
- It's not clear if optimal streaming, random access performance, or additional metadata is so important for MiniApp, to be worth the churn of changing the archive format.

Once resource bundles are an established standard, one could imagine MiniApp being extended to permit resource bundles as an alternative format alongside .zip.

#### Q: Should this format include more fields for offline web pages?

**A**: It's not really clear which fields are needed or what their semantics should be, but in general, this format would permit someone who is designing an offline web page format to design custom sections for the data they need. 

#### Q: How will this format be standardized?

**A**: The idea is to standardize the format in IETF, probably the [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/). IETF has good infrastructure for the use of CBOR in specifications, and many important stakeholders in this problem space are in IETF and specifically the WPACK WG, which was assembled to work on the bundling problem space. In this repository, we'll develop a draft of a specification, which can hopefully be adopted by an IETF WG and become an RFC. The draft here is based on [Jeffrey Yasskin's prior proposal](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html), which has been introduced as an Internet-Draft in IETF. The resource bundle section registry would be created within IANA.

#### Q: The above document hints at how resource bundles have meaning in subresource loading and on servers, but what are the semantics in the abstract?

**A**: It's hard to say exactly. This file format is useful for several different kinds of applications that have different needs and semantics--subresource loading and serving are already fairly different from each other. There is currently no concrete plan to define a higher-level document like [HTTP semantics](https://httpwg.org/http-core/draft-ietf-httpbis-semantics-latest.html) for resource bundles, to complement the operationally-oriented documents like resource bundle loading and serving. We'll probably have to feel this space out with various applications/endpoints to understand where to generalize, similar to the history of HTTP.

#### Q: How does this proposal relate to Jeffrey Yasskin's [Web Bundle format](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html)?

**A**: Daniel Ehrenberg and Jeffrey Yasskin have been working together closely on this proposal. Our current drafts have some mismatches, but the idea is to talk this through with more stakeholders and come to common conclusions.
