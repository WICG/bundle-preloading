# Resource Bundle Format

Resource bundles represent a mapping from URL paths to HTTP responses. They are based on an extensible binary format, where new "sections" can be defined over time for different kinds of data.

This document describes the high-level design of resource bundle format, and how this format relates to applications like subresource loading and serving. A standard to describe this format would be a bit divorced from the content, motivations and implied semantics discussed below (see ["Specification"](#specification)).

> This document does **not** fully describe the **protocol** that clients will use to fetch and validate resource bundles. We expect many more tools to need to process the resource bundle format than participate in the protocol.

> TODO: Create a separate document describing the protocol, and link to it from the above note.

The broader area of binary formats for bundles of HTTP responses is under discussion in the [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/), which would be the ideal body to standardize this work. This document is based on previous Internet-Drafts by Jeffrey Yasskin published in the IETF WPACK WG.

## Formal Grammar

Resource bundles are defined in [CDDL], a language for expressing grammars over [CBOR](https://tools.ietf.org/html/rfc7049) binary data formats. This infrastructure means that the resource bundles specification does not need to worry about the details of the binary format and can focus on high-level architecture, using standard tools.

### The Format

At the top level of their binary format, resource bundles are defined as a series of named sections, each with a length. The `section-lengths` field contains a table of contents, and the sections are found in the main `sections` field.

> To maintain compatibility across versions and environments, a resource bundle begins with [a magic number](#ref-magic-number), then a version number, and ends with its length.

#### Type: `bundle`

| name              | type                   | size     | description                                                                   |
| ----------------- | ---------------------- | -------- | ----------------------------------------------------------------------------- |
| `magic`           | literal                | 64 bits  | F0 9F 8C 90 F0 9F 93 A6                                                       |
| `version`         | `bytes`: raw bytes     | 32 bits  | the version of the resource                                                   |
| `section-lengths` | array (section-length) | variable | [see below](#defn-section-length "section-length") _(section-length)_         |
| `sections`        | array                  | variable | [see next section](#section-index "The index section")] _(The index section)_ |
| `length`          | `bytes`: raw bytes     | 64 bits  | The number of bytes in the bundle                                             |

#### Type: <code id="defn-section-length">section-length</code>

| name           | type                                                                        | size     | description                         |
| -------------- | --------------------------------------------------------------------------- | -------- | ----------------------------------- |
| `section-name` | <abbr title="Text String (CBOR Major Type 3)">[`tstr`][tstr]</abbr>: string | variable | The name of the section (see below) |
| `length`       | `uint`: unsigned integer                                                    | variable | The length of the bundle in bytes   |

<details>
  <summary>CDDL Spec</summary>
  
```cddl
resourcebundle = [
  magic: h'F0 9F 8C 90 F0 9F 93 A6',
  version: bytes .siz
  section-lengths: bytes .cbor section-lengths,
  sections: [* any ],
  length: bytes .size 8,  ; Big-endian number of bytes in the bundle.
]
section-lengths = [* (section-name: tstr, length: uint) ],
```

</details>

## Core sections: `index` and `resources`

### The `index` section

<span id="section-index">The `index` section</span> is the table of contents for the entire bundle. It maps URLs to offset/length pairs in the resources section. The URLs are simply relative paths, within the same origin and directory as the bundle was fetched.

#### Type: `index`

| name    | type                                                              | size     | description                                         |
| ------- | ----------------------------------------------------------------- | -------- | --------------------------------------------------- |
| `index` | map (<code>[tstr]</code> => <code>[location-in-responses]</code>) | variable | A map from URL (as a variable string) to a location |

[location-in-responses]: #location-in-responses

#### Type: `location-in-responses`

| name     | type                     | size     | description                            |
| -------- | ------------------------ | -------- | -------------------------------------- |
| `offset` | `uint`: unsigned integer | variable | An offset within the resources section |
| `length` | `uint`: unsigned integer | variable | The size of the resource in bytes      |

<details>
  <summary>CDDL Spec</summary>

```cddl
index = {* tstr => [location-in-responses] }
location-in-responses = (offset: uint, length: uint)
```

</details>

### The `resources` section

The `resources` section contains an array of responses. Each response contains response headers and the response body.

#### Type: `response`

| name      | type                                             | size     | description                                                                  |
| --------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `headers` | map (<code>[bstr]</code> => <code>[bstr]</code>) | variable | A map of [field name](#ref-http-headers) to [field value](#ref-http-headers) |
| `payload` | <code>[bstr]</code>                              | variable | The content of the resource as a byte string                                 |

<details>
  <summary>CDDL Spec</summary>

```cddl
responses = [*response]
response = [headers: bstr .cbor headers, payload: bstr]
headers = {* bstr => bstr}
```

</details>

## Supplemental sections

The resource bundle format intentionally supports extensible sections, in order to support use-cases that go beyond the core goal of mapping from paths to responses. Such use-cases are application-specific, and may not be included in the main resource bundles specification. Whether included in the specification or not, custom sections should be registered in a registry of known resource bundle sections.

The remainder of this document describes custom sections that we expect might exist, and describes how they would work.

### Content negotiation

Servers perform content negotiation--determining the response based on attributes of the request--as a part of serving the web. Packaged applications (which are outside of the core scope of this repository) may also need to perform these similar server-side functions on the client side.

The `negotiated-index` section provides a more detailed mapping from URLs + request headers to response offset/length pairs. The reponses here 'override' the responses found in the named `index`, if they conflict. The `index`'s value is used as a fallback if the request does not match any of the variants named for content negotiation.

#### Type: `negotiated-index`

| name               | type                                                                                        | size     | description                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `negotiated-index` | map (<code>[whatwg-url]</code> => <code>[index-value](#type-negotiated-index-value)</code>) | variable | A map of [field name](#ref-http-headers) to [field value](#ref-http-headers) |

#### Type: `index-value` (array)

| index | type                                 | size     | description                              |
| ----- | ------------------------------------ | -------- | ---------------------------------------- |
| `0`   | <code>[bstr]</code>                  | variable | the value of the variant                 |
| `1`   | <code>[location-in-responses]</code> | variable | see <code>[location-in-responses]</code> |

<details>
  <summary>CDDL Spec</summary>

```cddl
negotiated-index = {* whatwg-url => [ variants-value, +location-in-responses ] }
variants-value = bstr
```

</details>

For further details about how the variants-value represents content negotiation, see [the specification's explanation](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html#section-4.2.1). Note that the proposal here is to use a simpler `index`, and move the more advanced index to the `negotiated-index` section.

## Specification

The format above matches the [Web Bundles specification](#ref-web-bundles) (assuming that PRs [#617](https://github.com/WICG/webpackage/pull/617), [#618](https://github.com/WICG/webpackage/pull/618) and [#619](https://github.com/WICG/webpackage/pull/619) are landed).

_See the [bundle format FAQ](./faq.md#bundle-format) for more information._

# References

## Normative References

<dl>
  <dt id="ref-cddl">[CDDL]</dt>
  <dd>

[cddl]: #ref-cddl "Concise Data Definition Language"

Concise Data Definition Language<br>
URL: <https://www.rfc-editor.org/rfc/rfc8610.html>

  </dd>
</dl>

<dl>
  <dt id="ref-cbor">[CBOR]</dt>
  <dd>

[cbor]: #ref-cbor "Concise Binary Object Representation"

Concise Binary Object Representation<br>
URL: <https://www.rfc-editor.org/rfc/rfc7049>

  </dd>
</dl>

<dl>
  <dt id="ref-http-headers">[HTTP-HEADERS]</dt>
  <dd>

[http-headers]: #ref-http-headers "Headers in HTTP 1/1"

Hypertext Transfer Protocol -- HTTP/1.1 (Section 4.2, Message Headers)<br>
URL: <https://tools.ietf.org/html/rfc2616#section-4.2>

  </dd>
</dl>

<dl>
  <dt id="ref-whatwg-url">[WHATWG-URL]</dt>
  <dd>

[whatwg-url]: #ref-whatwg-url "URL"

The URL Standard<br>
URL: <https://url.spec.whatwg.org/>

  </dd>
</dl>

<dl>
  <dt id="ref-web-bundles">[WEB-BUNDLES]</dt>
  <dd>

[web-bundles]: #ref-web-bundles "Concise Data Definition Language"

Web Bundles<br>
URL: <https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html>

  </dd>
</dl>

## Informative References

<dl>
  <dt id="ref-magic-number">[MAGIC-NUMBER]</dt>
  <dd>

Magic Number (File Signature)<br>
URL: <https://en.wikipedia.org/wiki/List_of_file_signatures>

[magic-number]: #ref-magic-number "Magic Number"

  </dd>
</dl>

<dl>
  <dt id="ref-cbor-break">[CBOR-BREAK]</dt>
  <dd>

A [CBOR] break control code (A CBOR break is encoded as Major Type `7` with additional type value `31`)<br>
URL: <https://en.wikipedia.org/wiki/CBOR#Break_control_code_(Additional_type_value_=_31)>

[cbor break]: #ref-cbor-break "CBOR break control code"

  </dd>
</dl>

<dl>
  <dt id="ref-cbor-bstr">[CBOR-BSTR]</dt>
  <dd>

A [CBOR] byte string (A CBOR byte string is encoded as Major Type `2`)<br>
URL: <https://en.wikipedia.org/wiki/CBOR#Major_type_and_additional_type_handling_in_each_data_item>

[bstr]: #ref-cbor-bstr "CBOR byte string"

  </dd>
</dl>

<dl>
  <dt id="ref-cbor-tstr">[CBOR-TSTR]</dt>
  <dd>

A [CBOR] text string (A CBOR text string is encoded as Major Type `3`, and is required to be UTF-8)<br>
URL: <https://en.wikipedia.org/wiki/CBOR#CBOR_data_item_header>

[tstr]: #ref-cbor-tstr "CBOR text string"

  </dd>
</dl>
