# Server support for resource bundle loading

To allow [efficient resource bundle loading](./subresource-loading), additional support on the server is helpful: Clients may request just a subset of a resource bundle by listing certain chunk IDs in the request, and the server should provide a response with just those chunks. Clients may also request an individual resource in a bundle, and the server must provide the same response as it would provide in a bundle.

## Client/server subsetting protocol

To fetch a subset of a resource bundle, the client makes a `GET` request to the bundle's URL, providing the `Resource-Bundle-Chunk-Ids` HTTP header. The server is expected to respond with a response with the MIME type `application/resource-bundle`, with a resource bundle mapping those chunk IDs to resource bundles with the individual resources in it.

<!-- TODO: Provide examples to make this all easier to understand -->

## Suggested interface to upload resource bundles to servers

For serving static files, a common way to interact with servers is simply to upload a directory. This will work file, if you upload a directory of both the full resoruce bundle (with all the chunks), along with the individual files. If the server receives the `Resource-Bundle-Chunk-Ids` header on a file with the `.rbn` extension, then the server is expected to respond with only the listed chunk IDs. The server may decide to compress the particular subset based, which can lead to better results than compressing chunks individually, since there is one shared compression dictionary.

## Subsetting by optimizing intermediaries

One supported form of deployment for resource bundles is to use a static file server, with the resource bundle and individual assets uploaded there, without any subsetting logic. Then, an optimizing intermediary in the serving path could intercept all requests which contain the `Resource-Bundle-Chunk-Id` and perform the appropriate subsetting operation. The ability to factor out subsetting from serving hopefully makes it easier to deploy resource bundles.

*See the [serving FAQ](./faq.md#serving) for more information.*