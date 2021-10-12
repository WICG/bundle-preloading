# Bundled preloading server — prototype

Steps:

* run `npm install`
* prepare the client as well
* run the server with `npm start` to use the default settings
  - equivalent to `node server.js http://localhost 8080 ../web-bundles-prototype-client src img`
  - this will open a server at `http://localhost:8080`, serve files from `../web-bundles-prototype-client`, and bundle the folders `src` and `img`
* otherwise, use `node server.js <BASE URL> <PORT> <BASE DIR> <FOLDERS TO BUNDLE>`
