const http = require('http');
const { URL } = require('url');
const wbn = require('wbn');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {performance} = require('perf_hooks');

// Parameters:  node server.js http://localhost 8080 ../client src img
const urlPrefix = process.argv[2] || 'http://localhost';
const port = process.argv[3] || 8080;
const baseUrl = `${urlPrefix}:${port}`;
const baseDir = path.resolve(process.argv[4] || '.');

console.log(`Base URL: ${baseUrl}`);
console.log(`Base folder: ${baseDir}`);

if (process.argv.length > 5) {
    // bundle the indicated folders
    for (let dir of process.argv.slice(5)) {
        var t0 = performance.now();

        const subfolder = path.resolve(path.join(baseDir, dir));
        const bundleLocation = `${subfolder}.wbn`;
        const bundleRootURL = `${baseUrl}/${dir}/`;
        const builder = new wbn.BundleBuilder();
        const files = glob.sync(`${subfolder}/**/*.*`);

        files.map(file => {
            builder.addExchange(
                bundleRootURL + file.slice(subfolder.length + 1),
                200,
                { 'Content-Type': 'application/javascript' },
                fs.readFileSync(file)
            );
        });
        fs.writeFileSync(`${subfolder}.wbn`, builder.createBundle());

        console.log(`Created ${bundleLocation} with ${files.length} resources in ${(performance.now() - t0).toFixed(1)} ms`);
    }
}

const map = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.wbn': 'application/webbundle;v=b1'
};

http.createServer(function (request, response) {
    console.log(`${request.method} ${request.url}`);
    var t0 = performance.now();

    // TODO support both absolute and relative URLs in individual and bundled requests

    let pathname = path.resolve(path.join(baseDir, request.url));
    let name = path.parse(pathname).name;
    let ext = path.parse(pathname).ext;

    try {
        if (fs.statSync(pathname).isDirectory()) {
            pathname = path.join(pathname, 'index.html');
            ext = '.html';
        }
    } catch (error) {
        console.log(`${error}`);
    }

    // CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,bundle-preload,Vary');
    response.setHeader('X-Content-Type-Options', 'nosniff');

    // Bundle Preloading with subsetting
    if (request.headers['bundle-preload'] != undefined) {
        let resources = request.headers['bundle-preload'];

        // if the Resources header is empty, reply with 204 No Content
        if (resources.trim().length == 0) {
            response.statusCode = 204;
            response.end('Request for empty bundle.');
            return;
        }

        let resourcesArray = resources.split(/\s+/);

        if (resourcesArray != undefined && resourcesArray.length > 0) {
            const builder = new wbn.BundleBuilder();
            for (resource of resourcesArray) {
                try {
                    // TODO support relative paths
                    const resourceUrl = new URL(resource);
                    let resourcePath = path.resolve(path.join(baseDir, resourceUrl.pathname));
                    let resourceExtension = path.parse(resourcePath).ext;
                    const headers = {
                        'Access-Control-Allow-Headers': 'X-Requested-With,content-type,bundle-preload,Vary',
                        'Content-Type': map[resourceExtension] || 'application/octet-stream',
                    };
                    builder.addExchange(resource, 200, headers, fs.readFileSync(resourcePath));
                } catch (error) {
                    console.log(`Bundled request failed when getting the file: ${error}`);
                    response.statusCode = (error.code === 'ENOENT' ? 404 : 500);
                    response.end(`Error getting the file: ${error}`);
                    return;
                }
            }
            response.setHeader('Content-type', 'application/webbundle;v=b1');
            response.setHeader('Vary', 'bundle-preload');
            response.end(builder.createBundle());

            var t1 = performance.now();
            console.log(`Requested ${resources}`);
            console.log(`Serving a custom bundle took ${(t1 - t0).toFixed(1)} ms.`);
            return;
        }
    }
    // if no subsetting is done, we will return the whole bundle file

    fs.readFile(pathname, function(error, data) {
        if(error){
            console.log(`Single request failed when getting the file: ${error}`);
            response.statusCode = (error.code === 'ENOENT' ? 404 : 500);
            response.end(`Error getting the file: ${error}`);
        } else {
            // if the file is found, set Content-type and send data
            response.setHeader('Content-type', map[ext] || 'text/plain' );
            response.end(data);

            var t1 = performance.now();
            console.log(`Serving a single file took ${(t1 - t0).toFixed(1)} ms.`);
        }
    });
}).listen(parseInt(port));

console.log('Server listening on port ' + port);
