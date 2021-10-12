# Bundled preloading client — prototype

Steps:

* run `npm run-script build` to prepare the service worker script
* run the server in `web-bundles-prototype-server` pointing at this folder

To serve a different page than the default one:

* build this project
* copy the files `bundlepreload.js` and `service-worker-browserified.js` to the root folder of the new page
* add `<script src='bundlepreload.js'></script>` to the new page
* add a `<script type="bundlepreload">` with the resources to bundle
