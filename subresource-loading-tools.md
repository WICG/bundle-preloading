# Tooling support for resource bundle loading

Resource bundles and `bundlepreload` manifests are not expected to be created and mantained manually by developers. Instead, the idea is that the bundler tools which developers use today would output this new format.

Due to their place in the ecosystem, if we want to give Web/JS developers a path to improving loading performance, working at the bundler level is a natural choice. Bundlers already "speak the language" of developers, and they understand the set of resources involved and their relationships. In particular, the "back end" of bundlers--where they generate resources to be sent over the wire--is more relevant than the "front end"--where configuration files are processed, language supersets are handled, etc.


## Background: Bundling and the JS ecosystem

Modern Web sites are composed of hundreds or thousands of resources. Fetching them one by one would have very poor performance, which is why developers have created *bundlers*: tools that transform and combine resources for efficient deployment.

Some examples of bundler tools are [webpack](https://webpack.js.org/), [rollup](https://rollupjs.org/guide/en/), [Parcel](https://parceljs.org/) or [esbuild](https://esbuild.github.io/)). In general, they all share a common set of core functionality:

- **Dependency tracking**: Understanding where all of the assets in an application are, and the dependencies between them (webpack [dependency graph](https://webpack.js.org/concepts/dependency-graph/), [asset management](https://webpack.js.org/guides/asset-management/))
- **Bundling**: Packaging up several resources into fewer files to be transported more efficiently, e.g., through emulating ES modules, embedding CSS and binary data in JS source code ("virtualization"), etc.
- **Code splitting**: Breaking up the graph of resources into groups of components which can be loaded together or separately ([webpack code splitting docs](https://webpack.js.org/guides/code-splitting/))
- **Tree shaking**: identify and remove unused code ([MDN documentation](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking))
- **Naming**: Naming chunks with URLs based on a hash of the contents, to enable long-lived caching modes ("cache busting", [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#revved_resources); [a detailed article about strategies](https://css-tricks.com/strategies-for-cache-busting-css/); [webpack caching docs](https://webpack.js.org/guides/caching/))

Since bundlers act as the central build system for JS/Web applications, this allows them to also perform various kinds of code transformation, including:

- Transformations from other languages and JS supersets to JS (e.g., [TypeScript](https://www.typescriptlang.org/))
- Downleveling to earlier versions of JS (e.g., [Babel](https://babeljs.io/))
- Transformations which apply across files (e.g., [webpack tree shaking options](https://webpack.js.org/guides/tree-shaking/))
- Minifiers (e.g., [Terser](https://terser.org/))


## How resource bundle loading compares to existing bundlers

This would enable more direct interpretation of assets by the browser, as well as improved compression performance and cache hit rates.

The core functionality of bundlers matches what would be needed to generate resource bundles for efficient subresource loading, in a way that has significant potential for improvement over the status quo:

- **Code splitting**: Resources are split at a more granular level, down to the individual resource (or chunk). Rather than [making a tradeoff between granular chunking and minimizing the number of separate requests](https://web.dev/granular-chunking-nextjs/), the request can contain just the resources or small chunks that are needed, since many are requested at once. This results in effective use of caching and compression, while having minimal HTTP overhead and unused bytes sent over the network.
- **Bundling**: The non-standard formats currently used by bundlers are opaque to browsers and require JavaScript execution to be loaded. The bundling format is native [Web bundles](https://github.com/wpack-wg/bundled-responses), which browsers will be able to understand and unpack directly.
- **Naming**: To use long-lived caching modes, developers will be able to implement [revving](./glossary.md#revving) by appending a version number to the resource's name; when the content changes, this version number will be updated. Since bundle preloading provides a more fine-grained view of the resources contained in a bundle, unchanged files won't need a new revision just because one of their dependencies has been updated.


## Input and output of bundlers

In the basic model of bundled resource preloading, the input of bundlers remains the same as today (both in terms of developers' source code, as well as much of what goes into bundlers' configuration files), and the big difference is the output: Rather than outputting a directory of files to serve statically, bundlers would instead output two files:

- A `bundlepreload` manifest to include directly in HTML, inline.
- A bundle file (in the [Web bundle format](https://github.com/wpack-wg/bundled-responses)) with the responses that correspond to the resources contained in the bundle.

Optionally, the bundlers may create several versions of the same bundle of resources (e.g. for different languages). The selection of which one to use for each request will be made as a result of [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation) on the server.

*See the [tools FAQ](./faq.md#tools) for more information.*

[Previous section](./subresource-loading-server.md) - [Table of contents](./README.md#table-of-contents) - [Next section](./faq.md)