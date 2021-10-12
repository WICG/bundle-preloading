# web-bundles-prototype-examples

This project contains different examples of using Web Bundles for resource preloading.

See also:

* https://gitlab.igalia.com/femorandeira/web-bundles-prototype-client
* https://gitlab.igalia.com/femorandeira/web-bundles-prototype-server

## create-react-app

Create React App using bundle preloading. Initial code comes from running `create-react-app`, with some modifications added afterward.

```shell
npm install
npm run-script build
```

Test it by running the [web-bundles-prototype-server](https://gitlab.igalia.com/femorandeira/web-bundles-prototype-server) and pointing it to this subfolder:

```shell
cd ../../server
node server.js http://localhost 8080 ../examples/create-react-app/build static
```

