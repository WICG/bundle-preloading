# Create React App with bundle preloading

An example webapp created with [`create-react-app`](https://github.com/facebook/create-react-app), with small modifications to the templates and configuration used by `webpack` in order to take advantage of bundle preloading. It depends on [the server](../../server) and [the client libraries](../../client/).

Compile this webapp with:

```shell
npm install
npm run-script build
```

Test it by running the [Bundle Preloading prototype server](../../server) and pointing it to this subfolder:

```shell
cd ../../server
node server.js http://localhost 8080 ../examples/create-react-app/build static
```

This example depends on several manual changes to [public/index.html](public/index.html) to replace the sources linked by webpack with the necessary code to start a service worker, load the bundled resources, and then finally load the JS React code that implements the app. We are looking into ways to automate these, to demonstrate how an existing applucation may use bundle preloading with a few relatively small changes.
