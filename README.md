# Resource bundles

A resource bundle is a collection of HTTP responses, represented in a new file format. This repository supports the development of the definition of the resource bundle format. It focuses primarily on efficient subresource loading on the Web.

## Motivation

A web site is composed of multiple resources, such as HTML, CSS, JavaScript and images. When a web application is loaded, the web browser first fetches the resources referenced by the page, and ultimately renders the web page.

The traditional way of building and deploying web sites is to use separate files for code organization purposes, and allow the browser to fetch them separately.

This model is well-supported by browsers and web specifications, but does not perform well in real-world applications, which frequently organize their code into hundreds or even thousands of files (even small websites quickly accumulate dozens of files).

In an attempt to address these performance issues without losing the ability to organize their code reasonably, developers have historically built tools that group together source files together in various ad-hoc ways:

- CSS concatenation.
- Image spriting.
- Bundling multiple JavaScript files together. Developers have used script concatenators for decades. More recently, developers have begun to use semantics-preserving module bundlers that combine many standard JavaScript modules into a single script or module.
- In recent years, developers have begun to bundle resources such as images and styles together with their JavaScript. In the case of CSS, this is accomplished by imperatively inserting styles into the DOM. In the case of images, it is accomplished by Base64-encoding the image, and then decoding the images at runtime using JavaScript and imperatively inserting them into the DOM.

Developers have also found ways to bundle newer file types (such as WebAssembly) with their JavaScript by [base64 encoding](https://guido.io/posts/embedding-webassembly-in-javascript/) them and including them in the combined JavaScript files that are created by build tools.

Modern tools that automate these ad-hoc strategies are known as "bundlers". Some popular bundlers include [webpack](https://webpack.js.org/), [rollup](https://rollupjs.org/guide/en/), [Parcel](https://parceljs.org/) and [esbuild](https://esbuild.github.io/).

Each bundler ecosystem is effectively a walled garden. Their bundling strategies are implementation details that are non-standard and not interoperable. In other words, there is no way for an application bundle that was created using Webpack to access an image inside of an application bundle that was created using Parcel.

This proposal aims to create a first-class bundling API for the web that would satisfy the use-cases that motivated today's bundler ecosystem, while allowing resources served as part of a bundle to behave like individual resources once they are used in a page.

## Table of contents

- [Motivation, goals and constraints](./motivation.md)
- [Resource bundle file format](./bundle-format.md)
- [Subresource loading from the client side](./subresource-loading.md)
- [Subresource loading from the server side](./subresource-loading-server.md)
- [Subresource loading input from tools](./subresource-loading-tools.md)
- [FAQ](./faq.md)
- [Other uses of bundles](./other-uses.md)

## Scope

This repository focuses on using resource bundles to enable subresource loading in web browsers. It also includes notes about possible use in other contexts.

Generally, this repository is scoped to **proposals that support the development and deployment of bundling on the standard, interoperable Web platform**. Our primary goal is broad adoption of these proposals by all major web browsers.

Considerations for how these technologies can be deployed outside of the Web are certainly welcome for discussion and influencing the details of the features.

However, the scope of this repository does not include:

- larger proposals which are motivated principally by packaging in non-Web environments
- proposals which are explicitly opposed by multiple browser engine maintainers

Such proposals are out of scope for this effort and can be discussed elsewhere.

## Implementation

The champions of this proposal, who maintain this repository, want to promote software development that would help the web ecosystem successfully adopt and migrate to this new format.

We forsee the need for the following implementation efforts (and expect to support efforts along these lines):

- **Web browsers**: Implementations of resource bundle loading APIs
- **Programming languages**: Utilities and libraries to create, introspect and manipulate resource bundles
- **Static web servers** (such as Apache and nginx): support for dynamic subset serving
- **Dynamic web server standards** (such as WSGI, Rack, Java Servlets and Express.js): middleware for dynamic subset serving
- **Web bundlers and frameworks**: Support for emitting the resource bundle format as a new target type

We also expect to support:

- General-purpose CLI tools to pack, unpack and transform resource bundles
- Polyfills for using/emulating resource bundles in browsers without native support

These proposals still undergoing active design. We believe that, at this time, implementations would be most helpful if developed in an effort to gather and provide feedback about these proposals. We suggest prototyping support within an experimental plugin, behind a flag, etc. and to clearly communicate to your users that the proposal is still likely to undergo substantial changes.

During the design and early implementation phase, we expect this repository to serve as the canonical source of information about the status of this proposal and implementation efforts. We expect to use this repository to host software development for tools and polyfills. We also expect to maintain a list of related software development done elsewhere.

## Gradual Adoption

We intend for resource bundles to be suitable to gradual adoption. Even if implementations exist only in certain parts of the stack, they are still useful.

- Bundlers and frameworks can use the bundling format as a standard interchange format, and tools that analyze or transform entire app payloads can be written against the bundling format.
- Application developers can adopt the bundler format as a simple one-file deployment payload, and use the polyfill in production. Applications can use native support instead of the polyfill as browsers add support.
- Static web servers can serve individual files from the bundle to clients that don't support bundles with no need for `.htaccess`-style configuration, since the bundle includes information such as `Content-Type` for each member of the bundle.
- Server-side frameworks such as Ruby on Rails, Django and Express.js could use the resource bundle format for internal communication.
- Web developers could use the CLI tool to convert their applications into a single file to make them easier to transport and deploy.

Each of these use-cases stands on its own, and could provide motivation for adoption of the resource bundle format and protocol while implementation in browsers is still ongoing. We believe that gaining gradual adoption is important, because it will help us collect real-world feedback during the design phase, and build confidence in the design as it progresses towards becoming an interoperable web standard.

## Standards venue

The Web Incubator Community Group, which may, in the future, host this repository, is not a standards venue itself; documents developed here are not, by themselves, on a standards track. Instead, WICG serves to provide an open platform and safeguard the intellectual property developed, to enable later standardization.

The resource bundle format itself is planned to eventually become an RFC from the [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/). It will be periodically published as an Internet-Draft. The bundle format is currently developed in [the wicg/webpackage repository](https://github.com/WICG/webpackage/blob/master/draft-yasskin-wpack-bundled-exchanges.md), with three PRs proposed ([#617](https://github.com/WICG/webpackage/pull/617), [#618](https://github.com/WICG/webpackage/pull/618), [#619](https://github.com/WICG/webpackage/pull/619)) to align this proposal with that.

Resource and module loading on the Web is generally defined by [WHATWG](https://whatwg.org/) standards like [HTML](https://html.spec.whatwg.org/) and [Fetch](https://fetch.spec.whatwg.org/) and [W3C](https://www.w3.org/) standards like [Resource Hints](https://w3c.github.io/resource-hints/). When the proposals in this repository reach a state of [multi-implementer support and no strong implementer objections](https://whatwg.org/working-mode), with [web-platform-tests](https://github.com/web-platform-tests/wpt/) tests developed, they will be proposed as pull requests to those standards.