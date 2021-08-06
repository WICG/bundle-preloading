# Subresource loading with resource bundles

<!-- TODO focus this document on resource bundling from the point of view of the client: user, developer, browser -->

This document presents the basic operation of bundled resource preloading, which constitutes our starting point in terms of specification and prototyping.

Additional, more complex mechanisms could be added to this initial version later on. This document also discusses several possible directions to evolve it in the future. There are tricky performance tradeoffs that we expect to only be able to make based on more concrete prototyping.

To load a very large number of JavaScript modules, these ideas may be best used in conjunction with the [Module Fragments proposal](https://github.com/tc39/proposal-module-fragments), as [described in the FAQ](https://github.com/WICG/resource-bundles/blob/main/faq.md#q-will-support-for-non-js-assets-make-resource-bundle-loading-too-heavy-weightslow).

## Base solution

The process of bundled resource preloading begins with the Web document specifying a list of resources to be preloaded.

Because of [origin model](./motivation.d#origin-model) and [path restriction](./motivation.md#path-restriction), those resources can only correspond to URLs with the same origin and `path - 1` as the bundle file itself.

There are two APIs available for expressing the lkist of resources to be preloaded:

* A declarative API in HTML:

```html
<!-- https://www.example.com/index.html -->
<script type="bundlepreload">
    {
        "source": "./assets/resources.wbn",
        "resources": [
            "render.js",
            "profile.png"
        ]
    }
</script>
```

* An imperative API in JS:

```js
// https://www.example.com/index.html
window.bundlePreload({
    source: "./assets/resources.wbn",
    resources: ["render.js","profile.png"]
});

let image = document.createElement("img");
image.src = "assets/profile.png";
...
```

Note that the list of resources may use relative (to the bundle file) URLs. If absolute URLs are used, they mush abide by the same origin and path restrictions mentioned above.

Regardless of the API used, this results in an HTTP request being sent to the server pointing at the bundle file and indicating in the `Bundle-Preload` header the resources to request.


```HTTP
GET /assets/resources.wbn HTTP/1.1
...
Host: www.example.com
Bundle-Preload: "render.js", "profile.png"
...
```

<!-- TODO doesn't this mean that if the server does not understand this header, it will send the whole bundle??? -->

The client may only request a subset of the resources in the list, if it will be able to retrieve the rest from its cache.

The response from the server must be a [bundled response](https://github.com/wpack-wg/bundled-responses) containing HTTP responses for each of the requested URLs. In our example:

* `https://www.example.com/assets/render.js`
* `https://www.example.com/assets/profile.png`

These resources may be cached and references to them later on may be loaded from the cache.

This initial version simply relies on the general HTTP cache. A further evolution could be to provide more fine-grained control to the developer by specifying a named cache using the [CacheStorage API](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage).

See the [Overview](./overview.md) document for a more detailed explanation.

## Optionality and URL integrity

Ensuring the integrity and semantics of URLs is essential for preserving privacy. To achieve this goal, **the browser's use of resource bundles is optional and verifiable**, in the following sense (credits for this idea go to Pete Snyder of Brave):

Servers must make bundles faithfully represent what they would return with an independent fetch to the same URL, and browsers may enforce this (offline, online, or both).

For offline enforcement, browsers may scan the Web and assemble a denylist of origins which do not implement this correspondence. Resource bundle loading declarations on these origins would simply be ignored, and the URLs within the resource bundle's scope would be fetched one by one.

For online enforcement: Whenever a fetch is made to something which is within the scope of a bundle declaration, the browser may take one or more of the following three choices:

- It may fetch the resource from the bundle (details based on the mechanism below).
- It may ignore the bundle and instead fetch the resource from the server directly, with the same URL.
- It may do both, compare the results, and stop using the bundle at all if there is a mismatch.

Online enforcement through the second or third bullet point would be most practical when it is done only rarely, for a small percentage of fetches, so that the overhead is low.


## Future evolution

After this initial version of resource preloading, more flexible mechanisms could be added to fulfill additional goals and provide more control to developers. These alternatives are explained at [Future evolution of bundle preloading](./subresource-loading-evolution.md).