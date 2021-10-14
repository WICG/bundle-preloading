# Bundle preloading server — prototype

Build instructions:

* run `npm install`
* build [the client library](../client) as well
* run the server with `npm start` to use the default settings
  - equivalent to `node server.js http://localhost 8080 ../client src img`
  - this will open a server at `http://localhost:8080`, serve files from `../client`, and bundle the folders `src` and `img`
* otherwise, use `node server.js <BASE URL> <PORT> <BASE DIR> <SUBFOLDERS TO BUNDLE>`

For simplicity, the server will create one bundle file for each of the subfolders provided in the command line.

This 1 to 1 correspondence between a bundle and the folder containing the same resources is not a requirement but here it simplifies prototyping and quick testing. It means that, for example, `https://example.com/media.wbn` would contain the same resources as the folder `https://example.com/media.wbn`.

A request for bundled resources should include the `"bundle-preload"` header, containing a list of space-separated URLs to preload.  Note that the current implementation does not support relative file paths yet, although we are working on it.

If the `"bundle-preload"` header is missing, the server will simply return the whole bundle file.
