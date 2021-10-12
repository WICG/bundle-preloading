# web-bundles-prototype-examples

This project contains different examples of using Web Bundles for resource preloading.

See also:

* https://gitlab.igalia.com/femorandeira/web-bundles-prototype-client
* https://gitlab.igalia.com/femorandeira/web-bundles-prototype-server

## create-react-app

Create React App using bundle preloading.

```shell
create-react-app
npm run-script build
```

Test it by running the [web-bundles-prototype-server](https://gitlab.igalia.com/femorandeira/web-bundles-prototype-server) and pointing it to this subfolder:

```shell
node server.js http://localhost 8080 <LOCATION OF THIS PROJECT>/create-react-app/build static
```

