# Server support for resource bundle loading

To allow [efficient resource bundle loading](./subresource-loading.md), additional support on the server is helpful: Clients may request just a subset of a resource bundle by indicating what they need in the request with a `Bundle-ETags:` or `Bundle-Chunk-IDs:` header, and the server should provide a response with just those ETags or chunks.

Clients may also request an individual resource in a bundle, and the server must provide the same response as it would provide in a bundle.

## Client/server subsetting protocol

The protocol that servers implement would depend on the subsetting mechanism selected.

### ETags

To fetch a subset of a resource bundle, the client makes a `GET` request to the bundle's URL, providing the `Bundle-ETags` HTTP header. The server is expected to respond with a response with the MIME type `application/resource-bundle`, with a resource bundle mapping URLs to responses with the given set of ETags.

Such a response must include a `Vary: Bundle-ETags` header in the response. It is likely appropriate to use a long-lived `Cache-Control` header for such responses (e.g., `immutable`).

<!-- TODO: Provide examples to make this all easier to understand -->

### Chunking

To fetch a subset of a resource bundle, the client makes a `GET` request to the bundle's URL, providing the `Bundle-Chunk-Ids` HTTP header. The server is expected to respond with a response with the MIME type `application/resource-bundle`, with a resource bundle mapping those chunk IDs to resource bundles with the individual resources in it.

Such a response must include a `Vary: Bundle-Chunk-Ids` header in the response. It is likely appropriate to use a long-lived `Cache-Control` header for chunks (e.g., `immutable`).

When serving an individual response in the "chunking" mechanism, a short-lived caching lifetime is likely appropriate to use, in case the chunk ID may be rotated in the future (whereas, for ETags, the client will send the appropriate `If-None-Match:` request).

<!-- TODO: Provide examples to make this all easier to understand -->

### Cuckoo hash

See the server's expectations under [this heading](https://docs.google.com/document/d/11t4Ix2bvF1_ZCV9HKfafGfWu82zbOD7aUhZ_FyDAgmA/edit#heading=h.2z671viuqv0m).

<!-- TODO(yoavweiss): Elaborate this section -->

## Suggested interface to upload resource bundles to servers

For serving static files, a common way to interact with servers is simply to upload a directory. This will work file, if you upload a directory of both the full resoruce bundle (with all the chunks), along with the individual files. If the server receives the `Bundle-ETags` or `Bundle-Chunk-Ids` header on a file with the `.rbn` extension, then the server is expected to respond with only the listed chunk IDs. The server may decide to compress the particular subset based, which can lead to better results than compressing chunks individually, since there is one shared compression dictionary.

## Subsetting by optimizing intermediaries

One supported form of deployment for resource bundles is to use a static file server, with the resource bundle and individual assets uploaded there, without any subsetting logic. Then, an optimizing intermediary in the serving path could intercept all requests which contain the `Bundle-ETags`/`Bundle-Chunk-Id` and perform the appropriate subsetting operation. The ability to factor out subsetting from serving hopefully makes it easier to deploy resource bundles.

*See the [serving FAQ](./faq.md#serving) for more information.*