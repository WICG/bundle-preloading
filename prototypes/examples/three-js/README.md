# Three.js with bundle preloading

This example uses a Web Bundle to load a large JS library with hundreds of source files in a single request-response exchange. It depends on [the server](../../server) and [the client libraries](../../client/).

To try it out, simply launch a server pointing to this folder:

```
cd ../../server/
node server.js http://localhost 8080 ../examples/three-js src
```

This example uses bundle preloading without specifying a list of resources, so the whole contents of the `src` subfolder will be fetched and stored in the cache. Although our current intention is to disallow this approach eventually (opting instead for requiring that resources are explicitly identified for preloading), this example is here as a proof of concept and a starting point for other experiments in the future.
