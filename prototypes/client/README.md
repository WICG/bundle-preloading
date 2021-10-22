# Bundle preloading client — prototype

Build instructions:

* run `npm install`
* run `npm run-script build` to prepare the service worker script
* build [the server](../server) as well

To try out a small demo, simply launch a server pointing to this folder:

```
cd ../server/
node server.js http://localhost 8080 ../client img
```

The demo page will preload images 1 to 5 using a Web Bundle. Take a look at your browser's network inspector to see what happens as you use the buttons to add each of the images: the first five images will be loaded immediately, as they are already cached, but the last five will need to be fetched one by one on the spot.

If you want to try it out on a different page:

* build this project
* copy the files `bundlepreload.js` and `service-worker-browserified.js` to the root folder of the new page
* add `<script src='bundlepreload.js'></script>` to the new page
* add a `<script type="bundlepreload">` containing the resources to bundle in JSON format:

```
<script type="bundlepreload">
  {
    "source": "https://example.com/assets.wbn",
    "resources": [
        "https://example.com/assets/styles.css",
        "https://example.com/assets/header.png",
        "https://example.com/assets/icon.bmp",
        "https://example.com/assets/animations.js"
    ]
  }
</script>
```

This prototype uses a service worker to issue requests for Web Bundles, process the received content, and store the resources in a cache. It relies on [the `wbn` Node.js module](https://www.npmjs.com/package/wbn/) to manipulate [the Web Bundle format](https://github.com/wpack-wg/bundled-responses).
