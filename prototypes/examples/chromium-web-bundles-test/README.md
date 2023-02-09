# Chromium Web bundles test

This example tests the initial implementation of [Subresource loading with Web Bundles](https://github.com/WICG/webpackage/blob/main/explainers/subresource-loading.md) ([spec](https://wicg.github.io/webpackage/subresource-loading.html)) in Chromium.

It is not necessary to compile this example, since it will use the implementation provided by Chromium. If things don't work as expected, open `chrome://flags/` and check that the _Web Bundles_ flag is enabled.

Try it out it by running the [Bundle Preloading prototype server](../../server) and pointing it to this subfolder:

```shell
cd ../../server
node server.js full -s http -H localhost -p 8080 -c ../examples/chromium-web-bundles-test/server_configs.json
```

Please note that, you need to do the following steps to test subresource loading from signed bundle:

1. Create 'priv.key', 'cert.cbor' and 'cert.pem' to sign wbn and run https localhost<br>
   (ref: https://github.com/WICG/webpackage/blob/main/go/signedexchange/README.md)

2. Install the certificate
   ```bash
   $ certutil -d sql:$HOME/.pki/nssdb -A -t "CT,c,c" -n "localhost" -i cert.pem
   ```

3. Copy 'priv.key' and 'cert.pem' under 'prototypes/server/certificate/'

4. run server
   ```bash
   $ node server.js full -H localhost -p 8080 -c \
       ../examples/chromium-web-bundles-test/server_configs.json
   ```

5. Sign generated wbn file ('unsigned_subresource_loading.wbn') with the certificate<br>
   (ref: https://github.com/WICG/webpackage/tree/main/go/bundle#using-signatures-section-sub-command)
   ```bash
   $ sign-bundle signatures-section -i unsigned_subresource_loading.wbn \
       -certificate cert.cbor -privateKey priv.key -o signed_subresource_loading.wbn
   ```

## Content blocking

The folder [`extension-block-web-bundles-test`](./extension-block-web-bundles-test) contains Chromium extensions those are able to block content in the Web bundles in this example. The blocking can affect individual content inside the bundle or the Web bundle as a whole.
- [`extension-block-web-bundles-test/v2`](./extension-block-web-bundles-test/v2): Extension using [WebRequest](https://developer.chrome.com/docs/extensions/reference/webRequest/).
- [`extension-block-web-bundles-test/v3`](./extension-block-web-bundles-test/v3): Extension using [DeclarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/).

To try it out, open `chrome://extensions/` in Chromium, click on `Load unpacked` and select the folder in `extension-block-web-bundles-test`. Then try to load the page again.
