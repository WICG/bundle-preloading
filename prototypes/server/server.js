const mustache = require('mustache');
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

const content_type_map = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.wbn': 'application/webbundle'
};

function createWbn(template) {
    var t0 = performance.now();
    let directory = template['directory'];
    let resource_uuid_map = template['resource_uuid_map'] || {};
    let mustache_view = {
        "base_url": baseUrl
    };

    const subfolder = path.resolve(path.join(baseDir, directory));
    const bundle_location = `${subfolder}.wbn`;
    const bundle_root_url = `${baseUrl}/${directory}/`;

    const mustache_files = glob.sync(`${subfolder}/**/*.mustache`);
    mustache_files.map(mustache_file => {
        let output_data = mustache.render(fs.readFileSync(mustache_file).toString(),
                                          mustache_view);
        let output_path = mustache_file.replace('.mustache', '');
        fs.writeFileSync(output_path, output_data);
    });

    const files = glob.sync(`${subfolder}/**/*.*`);
    const builder = new wbn.BundleBuilder();
    files.map(file => {
        let relative_path = file.slice(subfolder.length + 1);
        let file_ext = path.parse(file).ext;
        let resource_url = bundle_root_url + relative_path;
        let uuid = resource_uuid_map[relative_path];
        if (uuid)
          resource_url = `uuid-in-package:${uuid}`;
        let content_type = content_type_map[file_ext] ||
                           'application/javascript';
        let file_data = fs.readFileSync(file);
        builder.addExchange(resource_url,
                            200,
                            { 'Content-Type': content_type },
                            file_data);
    });
    fs.writeFileSync(`${subfolder}.wbn`, builder.createBundle());

    console.log(`Created ${bundle_location} with ${files.length} resources in ${(performance.now() - t0).toFixed(1)} ms`);
}

let templates = [];
if (process.argv.length > 5) {
    if (process.argv.length == 6 &&
        process.argv[5] == "wbn_creation_templates.json") {
        let templates_path = path.join(baseDir, process.argv[5]);
        if (fs.existsSync(templates_path))
            templates = JSON.parse(fs.readFileSync(templates_path));
    } else {
        for (let dir of process.argv.slice(5))
            templates.push({"directory": dir})
    }
    // bundle the indicated folders
    templates.forEach(template => { createWbn(template); });
}

http.createServer(function (request, response) {
    console.log(`${request.method} ${request.url}`);
    var t0 = performance.now();

    let requestUrl = new URL(request.url, baseUrl);
    let pathname = path.resolve(path.join(baseDir, requestUrl.toString().replace(baseUrl, "")));
    let requestName = path.parse(pathname).name;
    let requestExt = path.parse(pathname).ext;

    try {
        if (fs.statSync(pathname).isDirectory()) {
            pathname = path.join(pathname, 'index.html');
            requestExt = '.html';
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

        // return an error if the file does not exist
        // TODO also if it is not a WBN file?
        if (!fs.existsSync(pathname)) {
            response.statusCode = 404;
            response.end(`Error getting the file: ${error}`);
            return;
        }

        let resourcesArray = resources.split(/\s+/);

        if (resourcesArray != undefined && resourcesArray.length > 0) {
            const builder = new wbn.BundleBuilder();
            for (resource of resourcesArray) {
                try {
                    const resourceUrl = new URL(resource, baseResourceUrl);
                    let resourcePath = path.resolve(path.join(baseDir, resourceUrl.pathname));
                    let resourceExtension = path.parse(resourcePath).ext;
                    const headers = {
                        'Access-Control-Allow-Headers': 'X-Requested-With,content-type,bundle-preload,Vary',
                        'Content-Type': content_type_map[resourceExtension] ||
                                        'application/octet-stream',
                    };
                    builder.addExchange(resourceUrl.toString(), 200, headers, fs.readFileSync(resourcePath));
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
            response.setHeader('Content-type',
                               content_type_map[requestExt] || 'text/plain');
            response.end(data);

            var t1 = performance.now();
            console.log(`Serving a single file took ${(t1 - t0).toFixed(1)} ms.`);
        }
    });
}).listen(parseInt(port));

console.log('Server listening on port ' + port);
