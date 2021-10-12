# Create React App (bundled)

This example depends on [the client libraries](../../client/) being available and compiled, so start with those.

Then, come back to this folder and build the app with:

```
npm install
npm run-script build
```

Finally, start a server pointing to this folder:

```
cd ../../server/
node server.js http://localhost 8080 ../examples/create-react-app/build static
```

This example depends on several manual changes to [public/index.html](public/index.html) to replace the sources linked by webpack with the necessary code to start a service worker, load the bundled resources, and then finally load the specific React code that implement the app. We are looking into ways to make this more convenient for developers.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
