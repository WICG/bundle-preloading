# Other possible uses of resource bundles

## A convention for tools

Resource bundles are hoped to be a useful intermediate format for the build pipeline for JavaScript/Web applications. Overall, it's hoped that this would increase interoperability and decrease the need for manual configuration. Resource bundles could be used for cases like the following:
- Web developers or framework authors can create a bundle using simple utilities, and pass this into a pipeline of build tools.
- Certain tools which today work on a per-file basis can instead work across multiple files within a bundle, trusting that relative URLs among them are to be taken literally (Babel and Terser have expressed interest here).
- Processing an application can be split between "extensions" (like JSX and SASS, where transforms are around bringing everything into a standard form) and "vanilla" (which is about optimizing, polyfilling, downleveling, etc, the standard form into a way that executes well everywhere). This could free up both categories to focus on what they do best, with a "vanilla bundle" as a universal intermediary.
- Tools can create custom sections (such as a representation of a dependency graph) in the bundle format itself to communicate among them before producing their final output.

## Serving static files

A common problem in configuring web servers is setting the response headers. Each server has its own way of configuring these, and it can be painful!

The proposed solution is, when serving a static directory of files, just give the server a resource bundle. The responses within a resource bundle include headers, which the server can simply forward to the client (if it trusts them--some servers may want to validate/filter these headers, depending on the circumstance).

Advanced sections such as [content negotiation](./bundle-format.md#content-negotiation) may be especially useful on servers even if not needed in clients for subresource loading.