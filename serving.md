# Resource bundles and web server conventions

The resource bundle file format can be used by web servers to improve usability.

## Serving static files

A common problem in configuring web servers is setting the response headers. Each server has its own way of configuring these, and it can be painful!

The proposed solution is, when serving a static directory of files, just give the server a resource bundle. The responses within a resource bundle include headers, which the server can simply forward to the client (if it trusts them--some servers may want to validate/filter these headers, depending on the circumstance).

Advanced sections such as [content negotiation](./bundle-format.md#content-negotiation) may be especially useful on servers even if not needed in clients for subresource loading.

## Serving resource bundle chunks

In the [subresource loading with resource bundles](https://github.com/littledan/resource-bundles/blob/main/subresource-loading.md) proposal, there is a presumption of additional server logic to dynamically construct resource bundles for collections of chunk IDs. The server can be configured to create these by simply making a resource bundle which includes all chunk IDs. The request header will be all the extra context the server needs to perform the needed subsetting.
