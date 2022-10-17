# Bundle preloading server — prototype

Build instructions:

* run `npm install`
* build [the client library](../client) as well
* run the server with `npm start` to use the default settings
  - equivalent to `node server.js http://localhost 8080 ../client src img`
  - this will open a server at `http://localhost:8080`, serve files from `../client`, and bundle the folders `src` and `img`
* otherwise, use `node server.js <BASE URL> <PORT> <BASE DIR> <SUBFOLDERS TO BUNDLE>`
* if you have `wbn_creation_templates.json` in `<BASE DIR>`, you can use `node server.js <BASE URL> <PORT> <BASE DIR> wbn_creation_templates.json`. You can specify the uuid of a file in the directory so that the `url` field can be replaced to `uuid-in-package:<uuid>`
  * This is the json format:
    ```json
    [
      {
        "directory": "<directory-name>",
        "resource_uuid_map": {
          "<resource-relative-path>": "<uuid>",
          ...
        }
      },
      ...
    ]
    ```

For simplicity, the server will create one bundle file for each of the subfolders provided in the command line.

This 1 to 1 correspondence between a bundle and the folder containing the same resources is not a requirement but here it simplifies prototyping and quick testing. It means that, for example, `https://example.com/media.wbn` would contain the same resources as the folder `https://example.com/media.wbn`.

A request for bundled resources should include the `"bundle-preload"` header, containing a list of space-separated URLs to preload. Note that the current implementation does not support relative file paths yet, although we are working on it.

If the `"bundle-preload"` header is missing, the server will simply return the whole bundle file.

Note that this server prototype is not strictly compliant: because it generates bundles both statically (on startup) and dynamically (when a request uses subsetting), there is the possibility that the dynamic responses can differ from the static bundles if individual contents are changed at runtime.
