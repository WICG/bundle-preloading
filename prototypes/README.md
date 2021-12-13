# Bundle preloading: prototypes and examples

This folder contains:

- [`server`](./server): a simple Web server that supports bundle preloading with subsetting
- [`client`](./client):a polyfill implementation of bundle preloading in JS
- [`examples`](./examples): examples of bundle preloading in use

The examples can be easily run on a local machine by following the instructions on each subfolder.

## Notes

The prototype uses a Service Worker to populate a cache with the preloaded resources. This cache is not cleared when you reload the page in the browser or relaunch the server pointing to a different page. When testing, it is recommended to clear the caches and reload the page every time.

In Chromium, this can be done from the Developer Tools: Application > Cache Storage > right-click on the cache > Delete.

In Firefox, from the Developer Tools: Storage > Cache Storage > the page's URL > right-click on the cache > Delete.
