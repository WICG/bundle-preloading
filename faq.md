# FAQ

## General

#### Q: How does this proposal relate to the Web Package/Web Packaging/Web Bundles/Bundled Exchange effort ([repo](https://github.com/wicg/webpackage))?

**A**: This is the same effort, really, with a particular scope. In particular, this repository has a focus on same-origin static subresource loading, while preserving the semantics and integrity of URLs. The Google Chrome team (including Jeffrey Yasskin and Yoav Weiss) have been collaborating closely on this project. There are different concrete alternatives under discussion (especially in the details of subresource loading, and less so for the bundle format itself), but the idea is to gather more feedback (possibly including prototyping) to draw a shared conclusion.

#### Q: Why the name change, then?

**A**: To express the limited scope (separating from Signed Exchange, preserving URL semantics) and the fact that this format may be useful outside of the Web (e.g., in Node.js). Hopefully, these changes address the previous criticisms of Web Bundles.

#### Q: How does this proposal relate to Signed Exchange?

**A**: [Signed Exchange](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html) is a proposal from the Google Chrome team to allow one "distributor" to serve web content from another "publisher". In its basic form ([shipping in Chrome, Edge, and Opera](https://caniuse.com/sxg), but explicitly opposed by other engines), Signed Exchange does not use bundling, but instead signs an individual HTTP response.

This proposal does not make any special allowances for Signed Exchange, and some coauthors personally oppose the promotion of Signed Exchange through bundling. There has been high-level discussion about a concept of "signed bundles" (which led these two proposals to be coupled at some point), but the overlap is as simple as: if a bundle were signed, there would have to be some kind of section within the bundle to contain the signature for the bundle as a whole (rather than leave signatures to being per-response).

#### Q: Weren't ad blockers and publishers opposed to Web Bundles? How do they feel about this proposal?

**A**: [Robin Berjon](https://twitter.com/robinberjon) from the New York Times said,
> It's a useful approach to address the bundling mess we see in JS (and other similar issues), building on smart work from Jeffrey Yasskin and Yoav Weiss but without the bits that help Google take over the Web.

An analysis by Brave is [in this issue comment](https://github.com/littledan/resource-bundles/issues/14#issuecomment-779531021).

#### Q: How far along is this proposal? Is it about to ship?

**A**: This proposal is very early. Although [Chrome has a flagged experiment for unsigned Web Bundles](https://web.dev/web-bundles/) based on [this explainer](https://github.com/WICG/webpackage/blob/master/explainers/subresource-loading.md), there is no specification or tests, and there are ongoing efforts to iterate on design and communicate with browser vendors, web developers and other web stakeholders before this proposal is ready to ship.

#### Q: How is this work funded? Are there any conflicts of interest?

[Eye/O](https://eyeo.com/) is funding Daniel Ehrenberg's (Igalia) work on resource bundles, and [Bloomberg](https://www.techatbloomberg.com/) had funded it previously. Many others have been collaborating, especially Yehuda Katz (Tilde), Pete Snyder (Brave) and several Google employees (inside and outside of the Chrome team). Google and Brave are also a clients of Igalia, but not funding work on this project.

## Bundle format

#### Q: Why not use .tar or .zip?

**A**: These both have significant problems. zip stores its index at the end, so it's not suitable for streaming. tar doesn't permit random access, and can only be used in a streaming mode. Increasing the amount of metadata (e.g., for HTTP headers) is awkward in both formats and would require new tooling anyway.

Interestingly, an effort to bring packages to the web by the W3C TAG (Technical Architecture Group) in 2015 [identified many of these same issues](https://www.w3.org/TR/web-packaging/#intro). That effort was ultimately unsuccessful, but the fact that the champions of a related proposal independently identified the same issues makes us more confident about them.

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

**A**: The idea is to standardize the format in IETF, probably in the [IETF WPACK WG](https://datatracker.ietf.org/wg/wpack/about/). IETF has good infrastructure for the use of CBOR in specifications, and many important stakeholders in this problem space are in IETF and specifically the WPACK WG, which was assembled to work on the bundling problem space. In this repository, we'll develop a draft of a specification, which can hopefully be adopted by an IETF WG and become an RFC. The draft here is based on [Jeffrey Yasskin's prior proposal](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html), which has been introduced as an Internet-Draft in IETF. The resource bundle section registry would be created within IANA.

#### Q: How does bundle format proposal relate to Jeffrey Yasskin's [Web Bundle format](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html)?

**A**: Daniel Ehrenberg and Jeffrey Yasskin have been working together closely on this proposal. Our current drafts have some mismatches, but the idea is to talk this through with more stakeholders and come to common conclusions.

#### Q: How does error handling work, given that CBOR leaves that a bit open?

**A**: Web specifications for subresource loading in browsers will describe how parsing and error reporting work operationally, including error reporting. In general, the idea is to be strict about reporting errors when they are encountered (not trying to silently correct them), but also to permit errors to be detected somewhat "lazily", to permit resource bundles to be used even without the whole thing having been parsed (e.g., in a streaming or random-access way).

## Subresource loading

#### Q: Rather than add bundling into the platform, why not fix HTTP?

**A**: If we can figure out a way to do that which would obsolete bundlers, then that would be perfect! However, it's unclear how to reduce browsers' per-fetch overhead within HTTP (which has to do with security-driven process architecture), even if we developed a nicer way to share compression dictionaries among HTTP responses and encourage more widespread prefetching. Please file an issue if you have concrete ideas.

This question has been raised over the years in response to previous web packaging proposals. During those prior discussions, folks who were actively working on HTTP/2 felt optimistic that HTTP/2 would ultimately obviate the need for a web packaging standard. Since then, many of those folks have become more pessimistic about solving the problem of packaging entirely through HTTP. Jake Archibald wrote a post explaining some of the unexpected subtleties of HTTP/2 called [HTTP/2 push is tougher than I thought](https://jakearchibald.com/2017/h2-push-tougher-than-i-thought/).

Sharing compression dictionaries across multiple HTTP responses is a particularly challenging part. Although HTTPWG has developed various draft proposals in this area, concerns have been raised about privacy, security, implementation complexity, and the ability to use high-quality compression techniques on-line.

#### Q: Are web developers actually supposed to write out those `<script type=loadbundle>` manifests, and create the resource bundles, themselves?

**A**: No. This is a job for bundlers to do ([explainer](./subresource-loading-tools.md)). Hopefully, bundlers will take an application and output an appropriate resource bundle, to be [interpreted by the server](./subresource-loading-server.md) to send just the requested resources to the client. The bundler will also create a `loadbundle` manifest, which can be pasted into the HTML inline.

#### Q: Should bundling be restricted to JavaScript, which is the case with the largest amount of resource blow-up?

**A**: JavaScript-only bundling is explored in [JavaScript module fragments](https://github.com/littledan/proposal-module-fragments/), but the current bundler ecosystem shows strong demand for bundling CSS, images, WebAssembly etc., and new non-JS module types further encourage the use of many small non-JS resources. Today, we see widespread usage of CSS in JavaScript strings, and other datatypes in base64 in JS strings (!). A JS-only bundle format may encourage these patterns to continue.

Among other problems, these approaches make the resources opaque to the browser, which limits how effectively browsers can apply optimizations to them. It is also impossible to target these individual resources using browser APIs such as CSP. It is also impossible for these bundled resources to have their own headers. A JS-only bundle format may encourage these patterns to continue.

The [import maps proposal](https://github.com/WICG/import-maps) can also be used to [map away hashes in script filenames](https://github.com/WICG/import-maps#mapping-away-hashes-in-script-filenames). This can be useful for "cache busting" for JavaScript, but not for other resource types. However, in practice, similar techniques are needed for CSS, images, and other resource types, which a module-map-based approach has trouble solving

[Fetch maps]([https://discourse.wicg.io/t/proposal-fetch-maps/4259) could similarly be used for non-module subresources. Alternatively, [import: URLs](https://github.com/WICG/import-maps#import-urls) could be used to reference non-module assets while indirecting through an import map.

#### Q: Will support for non-JS assets make resource bundle loading too heavy-weight/slow?

**A**: Indeed, it may. This proposal works at the network fetch level, not the module map level. This means that, when executing a JavaScript module graph, some browser machinery needs to be engaged. Multiple browser maintainers have expressed concern about whether the fetch/network machinery can scale up to 10000+ JS modules. Although resource bundles will help save *some* of the overhead, they may not be enough. JavaScript-specific [module fragments](https://github.com/littledan/proposal-module-fragments/) may be implementable with less overhead, as they work at the module map level.

It's my (Dan Ehrenberg's) hypothesis at this point that, for best performance, JS module fragments should be nested inside resource bundles. This way, the expressiveness of resource bundles can be combined with the low per-asset overhead of JS module fragments: most of the "blow-up" in terms of the number of assets today is JS modules, so it makes sense to have a specialized solution for that case, which can be contained inside the JS engine. The plan from here will be to develop prototype implementations (both in browsers and build tools) to validate this hypothesis before shipping.

#### Q: Should we start with a simpler kind of bundle loading, without subsetting or versioning?

**A**: This approach is sketched out [in this explainer](https://github.com/WICG/webpackage/blob/master/explainers/subresource-loading.md). This repository takes a broader approach, based on conversations with webapp and tooling developers, as these capabilities seem to be often needed for native resource bundles to be useful in practice -- without them, significant transformations/emulation would remain needed, and the browser's cache would not be usable as effectively.

#### Q: Why address resources within a bundle with URLs that look like they come from outside of the bundle, instead of something which more explicitly notes their source, like `https://example.com/bundle.rbn#resource-within-bundle`?

**A**: Although this is a possible approach, it would come with significant costs:
- Web developers write application code with resources identified by paths, not fragments. The use of fragments would require that bundlers continue to virtualize paths, whereas this proposal aims to reduce the amount of virtualization that bundlers need to do.
- Lots of code in different places likely depends on how a network request to fetch a URL is not affected by the fragment; this particular scheme breaks that assumption.
    - One example of such code is the filter rules of content blockers, but this may be fixable; it just requires some investigation.
- In such a scheme, there is no sense of an "underlying URL" to verify against, so it's unclear how to prevent low-cost, per-request rotation of URLs, which could pose a problem for content blockers.

A different [`package:` scheme](https://github.com/WICG/webpackage/blob/master/explainers/bundle-urls-and-origins.md) has also been proposed for this purpose, which avoids the use of fragments, but causes even more issues because introducing a new scheme is expensive, and the authority of such URLs is unclear due to the presence of multiple origins.

#### Q: Why trigger bundle loading automatically when certain URLs are fetched, rather than exposing an imperative API?

**A**: In this proposal, resource bundle loading serves fundamentally as a *hint* for how to get the same content faster--these semantics correspond to the privacy goals. It is ideal if this hint can be declared in just one place, rather than sprinkled throughout the code.

If an imperative API were used to load a subset of the bundle, then it would have to be invoked explicitly in each case that a resource served from a bundle is going to be used. This would be quite awkward and redundant, requiring additional tooling to generate that code. It is more usable if the platform handles this logic. [This previous version](https://gist.github.com/littledan/e01801001c277b0be03b1ca54788505e) used an imperative API for loading bundles.

#### Q: Why does the syntax for loading a resource bundle use a `<script>` tag?

**A**: It is important for browsers' preload scanners to be able to fetch resource bundles as appropriate, so a declarative syntax (here, through a `<script>` tag) is required. `<script>` is used rather than `<link>` due to [concerns from WebKit](https://lists.w3.org/Archives/Public/public-web-perf/2020Aug/0028.html) about injection attacks. But more syntax, in addition to the `<script>` tag, may actually be needed.

Several use cases for resource bundle loading take place without the presence of the DOM, e.g, from a Worker. Therefore, a non-DOM-based JavaScript API is necessary, possibly something like `navigator.loadbundle({"source": "example.rbn", /* ... */})`.

The `Link:` header, and even further, [HTTP Early Hints](https://www.fastly.com/es/blog/beyond-server-push-experimenting-with-the-103-early-hints-status-code) has great potential to serve as a mechanism to initiate prefetching as soon as possible. It would be optimal for resource batch loading to *also* have a syntax to be usable in this form, even if it's unavailable as a `<link>` tag in HTML.

#### Q: Is it ideal to ship a manifest to clients? Wouldn't it be better to keep this information on the server?

**A**: It's complicated: there are three pieces of information that need to be brought together in order for the server to send the client the information that it needs:
- The contents of the browser's HTTP cache (held in the browser)
- The set of routes/components requested (held in the browser)
- The set of resources needed for each route/component (held in the server)

The approach above ships a manifest to the client, which ends up standing in for the set of resources needed for each route/component. An alternative strategy would be to ship, to the server, both a digest of the relevant part of the browser's HTTP cache, as well as a representation of which routes/components are requested. [This document](https://docs.google.com/document/d/11t4Ix2bvF1_ZCV9HKfafGfWu82zbOD7aUhZ_FyDAgmA/edit) explores techniques for sending a digest of the browser's HTTP cache to the server, and some advanced dynamic bundling solutions use a related technique.

#### Q: Could the manifest be delivered to the client incrementally, instead of all at once?

**A**: Such an approach makes sense if fetching some ETags/chunks exposes the possible need for even more ETags/chunks in the future, that couldn't have been triggered previously. For example, say there is a rarely loaded but very large "admin" pane, which has several tabs within it: when you first load the admin pane, you may have more manifest to load for those inner tabs, which isn't necessary on first page load. There are a couple ways that this could be implemented:
- *Imperatively*: There should probably be a JavaScript API for imperatively adding additional paths, each corresponding to ETags/chunk IDs to be loaded. This API can be invoked explicitly after clicking on the admin pane, based on logic embedded in it.
- *Declaratively*: If we find that this is a common pattern/need, then resource bundles could contain an additional section in them which is the section of paths that needs to be added for it, so that this can occur without running JavaScript.

Incremental manifest fetching is another advanced technique that could be included in a v2 proposal, or even initially if experimentation finds that it is needed for sufficient performance.

#### Q: How does this proposal relate to Sub-resource Integrity (SRI)?

**A**: Some thought has been put into various schemes to facilitate the adoption of SRI in conjunction with resource bundles. For many cases, the hashes will take up too much space to be sent to the client, and SRI adds deployment challenges (e.g., with upgrades). Efficient SRI approaches may be beneficial and follow up proposals can be explored in this repository or elsewhere. A [previous draft](https://gist.github.com/littledan/18a1bd6e14e4f0ddb305a2a051ced01e#file-dynamic-chunk-loading-md) had a closer relationship with SRI.

#### Q: Is there a way to load a bundle in a way that all network requests from inside of it are required to be served within the bundle?

**A**: Not in this proposal. Such a limitation would make the most sense if it were document-wide, but this proposal is about loading a resource bundle *within* a document (so, the HTML had to come from somewhere else, for one). A separate proposal could create a kind of iframe which is limited to be loading contents out of a particular bundle, perhaps with the bundle loading mechanism based on this document. It will be important to evaluate the privacy implications of such a proposal.

#### Q: What happens if the server sends the client more ETags or chunks than it asked for?

**A**: Servers are permitted to do this, and all of the subresources will end up loading, though more slowly. For example, a server could simply always reply with all of the ETags/chunks. Intelligent middleware could be responsible for filtering just the requested parts, making it easier to deploy resource bundle loading.

There are a number of different possible valid designs for how a browser behaves when a response contains additional resources that were not requested:
- The browser could discard all additional resources
- The browser could cache everything and make it available to the application

#### Q: Why are the requested ETags/chunks listed as a header parameter, rather than in the URL as a query parameter?

**A**: Both alternatives would be possible. In a way, this is a sort of bikeshed, which would be fine to iterate on. Layering-wise, it's a bit unusual for network protocols to add query parameters this way, but it may be helpful to deal with length limitations in headers (which may be higher for URLs) and intermediaries which don't handle `Vary:` properly (whereas everyone keys off of the full URL).

#### Q: If resource bundle loading is restricted to being same-origin, does that mean they can't be loaded from a CDN?

**A**: It is fine to load a resource bundle from a CDN: that bundle will be representing URLs *on the same origin as the bundle* (as well as within the path limitation). For example, `https://site.example` can contain something like the following:

```html
<!-- https://site.example/index.html -->
<script type=loadbundle>
    {
        "source": "https://cdn.example/pack.rbn",
        "scope": "https://cdn.example/pack/",
        "paths": { /* ... */ }
    }
</script>
```

Because the `source` is the same origin as the `scope`, the resource bundle loading is permitted.

#### Q: I think it'd be great to use resource bundles to serve ads, which need to be personalized. Can the no-personalization requirement be relaxed?

**A**: Some people have interesting ideas for how some kind of loading involving resource bundles could improve the efficiency of ad loading and even *reduce* the privilege level of ads. At the same time, it's quite tricky to get these privacy and security issues right, and it's important that whatever is adopted remains compatible with various interventions that user agents want to make (such as content blocking). This is a big problem space and research area.

Ads seem to have somewhat different needs for loading compared to static subresource loading explained above. For example:
- Ads often need to run at a lower privilege level than the surrounding page (e.g., in a cross-origin iframe), whereas subresource loading is often for fully privileged resources.
- Ads often need to download their entirety, whereas subresource loading benefits from reusing things from the browser cache.
- Ads are often negotiated for what to load differently for each user, whereas subresource loading generally uses broadly shared assets.

It's possible that some kind of *other* ad loading proposal could reuse the resource bundle format in some way, but the actual loading mechanism is likely to be quite different from what is described in this document. Ad loading with resource bundles would be a very separate project, outside the scope of this repository.

#### Q: How would WebExtensions (e.g., for content blocking) interact with resource bundle loading?

**A**: More design work is still needed here, but the general idea is: if the extension intercepts fetches today, it will be able to intercept fetches that will be served by the resource bundle, as well as the underlying fetches to the resource bundle itself. Resources which are explicitly included among the `"paths"` in the `<script type=loadbundle>` manifest, and resources which come along for the ride when a chunk is fetched, are treated identically: Both would be intercepted by extensions. The only difference is that blocking the former will block fetching the chunk at all, whereas the latter will be something which has already downloaded.

However, this could be quite expensive for extensions which intercept fetches (e.g., content blockers), and it may be beneficial to introduce certain changes to the [`webRequest`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest) API to facilitate optimizations: For example, a new [`RequestFilter`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/RequestFilter) field could be added to distinguish requests served from bundles, to allow work to focus on the request for the bundle chunks, rather than the individual included requests. [Safari's declarative Content Blocker API](https://developer.apple.com/documentation/safariservices/creating_a_content_blocker) could be treated similarly.

#### Q: How would ServiceWorker interact with resource bundle loading?

**A**: More design work is needed still, but one possibility is: a ServiceWorker fetch event would be dispatched for each fetch, both of resources served by resource bundles, and the resource bundle chunk fetches themselves. Unfortunately, unlike WebExtensions, there doesn't seem to be an API (besides the path prefix) to filter which requests hit the ServiceWorker.

#### Q: Will the overhead of going to plugins and ServiceWorker make resource bundle loading too slow?

**A**: It's possible that these factors could cause significant overhead, if the number of resources is too great. A couple ways to consider mitigating this overhead:
- At the application level, greater use of [JS module fragments](https://github.com/littledan/proposal-module-fragments/) could reduce the number of resources, and therefore reduce the overhead.
- In extensions and ServiceWorker, a batch-based API could be added to handle fetches which are served from resource bundles.

#### Q: Would this proposal work with readable ETags/chunk IDs instead of random numbers and letters?

**A**: Yes. ETags and chunk IDs are allocated by the creator of the resource bundles--in practice, the bundler. A simple way to allocate such IDs is to base it on a hash of the contents of the response or chunk. This matches a common practice with cache busting URLs. An advantage is that it's "stateless": the bundler does not have to think about what IDs may have been used in the past and exist in cache, by betting that there will not be a collision. However, the IDs could also be allocated in any other way, including one that makes more sense to humans.

### Chunking

#### Q: Why bother with chunking, rather than the simpler ETags approach of naming individual resources?

**A**: Naming individual resources results in a larger `<script type=loadbundle>` manifest, as well as more lengthy headers. Depending on how many resources are loaded, this may or may not be too many. If JavaScript is bundled into fewer resources using the [module fragments](https://github.com/littledan/proposal-module-fragments/) proposal, then the pressure may be reduced a bit.

The larger amount of metadata with the ETags approach has the benefit of better cache granularity and more efficiency gains due to content blocking. Whether chunking makes sense in general depends on whether resources have a consistent grouping to build off of, or whether, in practice, they are fairly independent in their distribution.

Chunking comes at the significant cost of not exposing each URL to the client, to decide whether to fetch it individually. Instead, responses are returned from the server in chunks of bundles, with new URLs in responses coming as a potential "surprise". This violates the requirement that content blockers can avoid such overhead, making the chunking approach potentially not viable.

#### Q: Is one level of chunking enough? Should chunking be part of a more complex DAG?

**A**: Sometimes, several different entry-points require a common set of resources repeatedly, even if these break down into multiple cache units. In the current proposal, the same string of chunk IDs needs to be repeated for each entry-point to handle this case. It would be possible to extend the manifest language to give these sets an explicit representation. It's not clear if such sets would have any advantages over compression, and it would add complexity, so this version of the proposal omits that, for simplicitly. A [previous draft](https://gist.github.com/littledan/18a1bd6e14e4f0ddb305a2a051ced01e#file-dynamic-chunk-loading-md) was based around such sets.

#### Q: To avoid letting the list of chunks get too long, could the client send the server the list of chunks it already has, instead of what it's missing?

**A**: This is an advanced technique that could work in the context of a "chunk DAG" that is expressed in the manifest: if a particular parent chunk ID is requested, and most children chunk IDs are missing, but just a few are present, then the client could send the server a header that indicates this state, and the server could respond with the appropriate set of chunks. This more advanced capability is omitted from this document for simplicity; it might be better to include in a v2 proposal.

#### Q: Is there any way to keep around just *part* of a chunk ID in cache, if part of it changes and another part doesn't?

**A**: In the above proposal, chunk IDs are the atomic unit of loading and caching. The browser either uses whole chunk or it does not. Chunk IDs are abstract units of loading, not necessarily corresponding to a library/package: there may be multiple packages in a chunk, or one package may be divided into multiple chunks. If you want to be able to keep around just part of a chunk ID when only part of it changes, divide it into two chunk IDs ahead of time. Bundlers are responsible for making this metadata volume vs caching tradeoff.

## Serving

#### Q: Is it really necessary for the server to dynamically generate responses? Is there any way to implement bundling on a static file server?

**A**: Fundamentally, the set of resources that a browser has in its cache is based on the path that the user took through the application. This means that there is a combinatorial explosion of possibilities for the optimal bundle to send to the client, and dynamic subsetting could provide the best loading performance.

This strategy is used in custom bundlers for some major sites. This proposal aims to bring these advanced loading techniques to a broader section of web developers.

The strategy implemented today in bundles like webpack and rollup is, instead, statically generated chunks which can be served from a static file server. With static chunking, there is a tradeoff between, on one hand, better cache usage and avoiding sending duplicate/unneeded resources (where smaller chunks are better), and on the other hand, compressability and reduction of per-fetch overhead (where bigger chunks are better). [Recent work](https://web.dev/granular-chunking-nextjs/) has focused on finding an optimal middle point, but the ideal would be to cache at a small granularity but fetch/compress at a bigger granularity, as is possible with dynamic chunking in the context of native resource bundle loading.

If dynamic bundle generation is too expensive/difficult to deploy in practice in many cases (whether due to usability issues for web developers or servers), resource bundle loading could be based on (either in a separate mode, or always) static chunking with each chunk served from a different URLs: the cost in terms of runtime performance is a tradeoff with easier deployability. It may be that static chunking is enough in practice, if it only results in a reasonably small number of HTTP/2 fetches, and compression works relatively well with Brotli default compression dictionaries, for example.

#### Q: Will it be efficient to dynamically, optimally re-compress just the requested parts of the bundle?

**A**: In general, the hope is that there can be a high-quality-compressed version of the entire bundle produced and deployed to the server, and the server would be able to efficiently calculate dynamic subsets. However, the efficiency of compressing this subset is unclear, and depends on the compression algorithm used. More research is needed. (c.f. [this blog post](https://dev.to/riknelix/fast-and-efficient-recompression-using-previous-compression-artifacts-47g5), [this comment](https://docs.google.com/document/d/11t4Ix2bvF1_ZCV9HKfafGfWu82zbOD7aUhZ_FyDAgmA/edit?disco=AAAAGdV5qt0)).

One idea raised to reduce the cost of re-compression for dynamic subsetting: use a different bundle URL per route/component, so that these can serve as different pre-compressed units, so the subsetting is more "dense". However, it is not clear how to handle the common case of fetching multiple routes/components at once (which is the source of the combinatorial explosion in the first case).

#### Q: How would the server know which kind of loading mode the client is asking for (e.g., in personalized ads vs non-personalized subresource loading)?

**A**: In general, the loading mode should be indicated by the HTML (here, the `<script type=loadbundle>` tag). If the client knows how to interpret that, then it will send the appropriate request to the server, indicating what it wants. There are further possibilities to let the server know if more optional sections are added to the bundle format, such as an `Accept-Bundle-Sections` header describing what the client knows how to interpret (where no such header would indicate that only the `index` and `responses` sections are interpreted).

## Tools

#### Q: In the chunking approach, how should bundlers decide how big/small to make the chunks?

**A**: (Note that, in the ETags approach, the bundler gives output at the individual resource granularity, and does not need to form chunks.)

There are many possible policies here, just as bundlers today have many possible policies, but the (hoped-for) increased efficiency from resource bundles allows the search/design space to be a bit larger. Some possible factors to consider when dividing resources into chunks:
- *Fetching exactly what's needed*: In one sense, code splitting is "optimal" when you send the client only the information they need to render a particular set of routes/components, and nothing additional. This becomes a bit complicated when certain dependencies are shared and others are not. The problem is thoroughly solved by current bundlers, but this "optimal" solution can lead to more chunks than one might expect.
- *Cache reuse*: The smaller the chunks are, the greater chance there is that, when just one resource changes, the maximal amount of information can be reused from cache. At the limit, this would mean putting each resource in its own chunk, however this strategy has cost:
- *Avoiding excessive numbers of chunks*: More chunks means more metadata, both in the information sent between the client and the server, as well as for the browser to process internally. At some point, it makes sense to stop dividing the chunks smaller and smaller to reduce this cost. However, chunks are likely cheaper than independent fetches, so the calculus is shifted a bit compared [existing tuning](https://web.dev/granular-chunking-nextjs/).

#### Q: When should bundlers decide to break up different units into module fragments?

**A**: Yet another interesting design space to explore! The general idea is to start using module fragments rather than separate resources in the resource bundle when necessary, to avoid the excess overhead of separate resources. One neat solution would be to put each "package" (e.g., in npm) in a single JS file using module fragments, but this may not yet be efficient enough. We'll likely need to experiment with real implementations to figure out what the optimal point is.

#### Q: How can this feature be used when some browsers will support it and others will not?

**A**: Two options:
- *Graceful degradation*: Because individual resources in a resource bundle must be served from the same URL with the same contents, sites will "just work" if resource bundles are simply turned off. However, performance will often not be good enough, for all the reasons developers use bundlers in the first place today.
- *Feature detection*: Detect the lack of this feature and invoke a legacy-bundled fallback. The detection can be done by introspecting the DOM and checking how the `loadbundle` manifest was parsed.
