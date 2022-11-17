# Bundle preloading server — prototype

Build instructions:

* run `npm install`
* build [the client library](../client) as well
* run the server with `npm start` to use the default settings
  - equivalent to `node server.js simple -H localhost -p 8080 -b ../client -w src -w img`
  - this will open a server at `http://localhost:8080`, serve files from `../client`, and bundle the folders `src` and `img`
* otherwise, use `node server.js simple [-H HOST] [-p PORT] [-b BASEDIR] [-w WBNRESOURCEDIR]`. Please refer the help (`node server.js simple -h`)
* if you have server configs json file, you can use `node server.js full [-h] [-H HOST] [-p PORT] -c CONFIGS`. Please refer the help (`node server.js full -h`)
* You can specify server configurations and wbn creation information in the server configs json file. You can set the uuid of a resource file so that the `url` field for the resource can be replaced to `uuid-in-package:<uuid>`. Also you can specify the primary resource so that the resource can be loaded when we load the bundle file from the file system.
  * This is the json format:
    ```javascript
    [
      {
        "host": "<host-name>",  // optional. (default: localhost)
        "port": <port-number>,  // optional. (default: 8080 ~)
        "baseDir": "<server-base-directory>",
        "wbnCreationInfoList": [
          {
            "output": "<wbn-file-name>",
            "resources": [
              {
                "source": "<source-file-path>",
                "uuid": "<uuid>",  // optional. (default: null)
                "url": "<bundled-resource-url>",  // optional. (default: http://<host>:<port>/<source)
                "primary": <whether-this-is-primary-resource>  // optional. (default: false)
              },
              ...
            ]
          },
          ...
        ]
      },
      ...
    ]
    ```

For simplicity, the server will create one bundle file for each of the subfolders provided in the command line.

This 1 to 1 correspondence between a bundle and the folder containing the same resources is not a requirement but here it simplifies prototyping and quick testing. It means that, for example, `https://example.com/media.wbn` would contain the same resources as the folder `https://example.com/media.wbn`.

A request for bundled resources should include the `"bundle-preload"` header, containing a list of space-separated URLs to preload. Note that the current implementation does not support relative file paths yet, although we are working on it.

If the `"bundle-preload"` header is missing, the server will simply return the whole bundle file.

Note that this server prototype is not strictly compliant: because it generates bundles both statically (on startup) and dynamically (when a request uses subsetting), there is the possibility that the dynamic responses can differ from the static bundles if individual contents are changed at runtime.
