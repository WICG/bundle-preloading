# Tooling support for resource bundle loading

Resource bundles and the `loadbundle` manifests are not expected to be created manually by developers. Instead, the idea is that the bundlers which developers use today (such as [webpack](https://webpack.js.org/), [rollup](https://rollupjs.org/guide/en/), [Parcel](https://parceljs.org/) or [esbuild](https://esbuild.github.io/)) would output this new format. The transition enables more direct interpretation of assets by the browser and improved compression performance and cache hit rates.

Due to their place in the ecosystem, if we want to give Web/JS developers a path to improving loading performance, the working at the bundler level is a natural place. Bundlers already "speak the language" that developers speak, and they understand the set of resources involved and their relationship. In particular, the "back end" of bundlers--where they generate resources to be sent over the wire--is more relevant than the "front end"--where configuration files are processed, language supersets are handled, etc.

## Background: What bundlers do today

Bundlers act as the central build system for JS/Web applcations, allowing developers tie together various kinds of code transformation, including:
- Transformations from other languages and JS supersets to JS (e.g., [TypeScript](https://www.typescriptlang.org/))
- Downleveling to earlier versions of JS (e.g., [Babel](https://babeljs.io/))
- Custom, semantics-changing transformations within or between files (e.g., [webpack tree shaking options](https://webpack.js.org/guides/tree-shaking/))
- Minifiers (e.g., [Terser](https://terser.org/))

In addition to these options, there is a certain common core that modern bundlers all share:
- **Dependency tracking**: Understanding where all of the assets in an application are, and the dependencies between them ([webpack asset management docs](https://webpack.js.org/guides/asset-management/))
- **Code splitting**: Breaking up the graph of resources into certain components which are loaded together or separately ([webpack code splitting docs](https://webpack.js.org/guides/code-splitting/))
- **Bundling**: Packaging up several resources into fewer files to be transported more efficiently, e.g., through emulating ES modules, putting CSS in strings, binary data in base64 strings, etc. ("bundling")
- **Naming**: Naming chunks with URLs based on a hash of the contents, to enable long-lived caching modes ("cache busting", [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#revved_resources); [a detailed article about strategies](https://css-tricks.com/strategies-for-cache-busting-css/); [webpack caching docs](https://webpack.js.org/guides/caching/))

## How resource bundle loading compares to existing bundlers

The core of bundlers corresponds exactly to what is needed to generate resource bundles for efficient subresource loading, in a way that has the potential work even better:
- **Code splitting**: Resources are split at the level of separate chunk IDs. Rather than [making a tradeoff between granular chunking and minimizing the number of separate requests](https://web.dev/granular-chunking-nextjs/), small chunks can safely be used while many are requested at once, resulting in effective use of caching and compression, while having minimal HTTP overhead and unused bytes sent over the network.
- **Bundling**: The bundling format is native resource bundles, which can be understood directly by the browser. Unlike with enumated bundles, browsers know how to interpret them as they are streamed in, and don't require any JavaScript to execute to make them visible to the browser.
- **Naming**: To use long-lived caching modes, the hash is keyed by chunk ID. When content changes, the chunk ID changes. At the same time, all of the contained URLs can actually be the semantically relevant one, rather than a generated one. This means that unchanged files don't need a new revision just because one of their dependencies has a new version.

## Input and output of bundlers

In the basic model, the input of bundlers is as today (both in terms of developers' source code, as well as much of what goes into bundlers' configuration files), and the big difference is the output: Rather than outputting a directory of files to serve statically, bundlers would instead output two files:
- A `loadbundle` manifest to include directly in HTML, inline.
- A resource bundle, mapping chunk IDs to inner resource bundles, which contain the various resources. Servers are then expected to [serve subsets of this resource bundle](./subresource-loading-server.md) based on which chunk IDs the client requests.

It is possible that tools could use resource bundles in [further ways](./other-uses.md) as well.

*See the [tools FAQ](./faq.md#tools) for more information.*