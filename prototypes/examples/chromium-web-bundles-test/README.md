# Chromium Web bundles test

This example tests the initial implementation of [Subresource loading with Web Bundles](https://github.com/WICG/webpackage/blob/main/explainers/subresource-loading.md) ([spec](https://wicg.github.io/webpackage/subresource-loading.html)) in Chromium.

It is not necessary to compile this example, since it will use the implementation provided by Chromium. If things don't work as expected, open `chrome://flags/` and check that the _Web Bundles_ flag is enabled.

Try it out it by running the [Bundle Preloading prototype server](../../server) and pointing it to this subfolder:

```shell
cd ../../server
node server.js full -H localhost -p 8080 -c ../examples/chromium-web-bundles-test/server_configs.json
```

## Content blocking

The folder [`extension-block-web-bundles-test`](./extension-block-web-bundles-test) contains a Chromium extension that is able to block content in the Web bundles in this example. The blocking can affect individual content inside the bundle or the Web bundle as a whole.

To try it out, open `chrome://extensions/` in Chromium, click on `Load unpacked` and select the folder `extension-block-web-bundles-test`. Then try to load the page again.
