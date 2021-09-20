# Bundle preloading for servers

This section discusses the proposal from the point of view of primary and intermediate servers.

## Basic operation

As explained in the [overview](./overview.md), the server receives a request for a bundled response that targets the Web bundle file and includes a `Bundle-Preload` header listing the requested resources.

The response from the server will be in the [bundled response](https://github.com/wpack-wg/bundled-responses) format, containing HTTP responses for each of the requested URLs.

The server may return more resources than those originally requested. The browser may choose to cache those resources; it it does so, it should not make those additional resources available to the page until they are themselves included in a `bundlepreload` declaration.

### Response headers

The server response will include the header `Vary: Bundle-Preload`, to signify that the bundle should be requested again for a different value of the `Bundle-Preload` resource list.

`Cache-Control: private` may be used to indicate that the response may be stored only by a browser's cache. This directive is intended as a hint to intermediate servers that they should not try to store many variants of the same bundle.

`Cache-Control: private bundled` (note the new value) may be used to let bundling-aware intermediate servers understand that the data it is not private and may be cached, but probably with a bundling-specific strategy.

<!-- Removed mentions of Bundle-Preload in the response. Add them again if there is a need for it. -->

## Backwards compatibility

By default, the original bundle file stored in the server contains all of the resources that may be requested from it. It is up to the browser and the server to negotiate the eventual transmission of only a subset of those resources.

This provides backwards compatibility: a request without a `Bundle-Preload` header, or to a server that does not support subsetting, will simply result in the download of the whole bundle file. All of the desired resources will be available in that bundle, although this might be more inefficient because it could also cause the transmission of resources that are already in the browser's cache.

However, this performance hit does not need to happen more than once: assuming that the bundle is immutable (see [revving](./glossary.md#revving)), when the browser visits other pages that request a different subset of resources, those additional resources will already be available in the browser's cache as they were already received as part of the initial bundle.

Conversely, if the client is not able to carry out bundle preloading requests, the resources will be available from the server through individual requests.

<!-- Graceful degradation, Progressive enhancement -->

## Performance considerations

This mechanism relies on the creation of a set of bundled responses for each request. [Experimental prototyping](./implementation.md) shows that this can be done with reasonable performance, specially as the number of files grows, although more systematic testing will be required in the future.

From the point of view of the client, a resource may be obtained individually or as part of a bundle. In the server, the most trivial implementation of this concept is to store both the bundle file and each of the individual resources. This introduces tradeoffs in terms of storage space and preserving the consistency between the version in the bundle and in the filesystem. Alternatively, the server may opt to store only the bundle file and serve subsets of it as required, as part of bundled or individual responses.

There might be a performance hit as the number of resources becomes very large. We are studying 

## Data integrity

The server must provide the same data for a given resource regardless of whether it is served individually or as part of a bundle. This preserves the Web's ["resource identity and URL consistency"](./motivation.md#resource-identity-and-url-consistency).

[Previous section](./subresource-loading-client.md) - [Table of contents](./README.md#table-of-contents) - [Next section](./subresource-loading-tools.md)