const mustache = require('mustache');
const http = require('http');
const { URL } = require('url');
const wbn = require('wbn');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {performance} = require('perf_hooks');
const assert = require('assert');
const { ArgumentParser } = require('argparse');

const defaultHost = 'localhost';
const defaultPort = 8080;

let commandParser = new ArgumentParser(
    {description: 'Start server to test web bundle.'});
commandParser.add_argument('command', {choices: ['simple', 'full']});
let commandArgs = commandParser.parse_args([process.argv[2]]);

let defaultMustacheView = {};
let serverConfigs = [];

if (commandArgs['command'] == 'simple') {
  let simpleCommandParser = new ArgumentParser(
      {prog: `${path.basename(__filename)} simple`,
       description: 'Start server to test web bundle with simple argument.'});
  simpleCommandParser.add_argument(
      '-H', '--host',
      {action: 'store', default: defaultHost,
       help: `host name (default: ${defaultHost})`});
  simpleCommandParser.add_argument(
      '-p', '--port',
      {action: 'store', type: 'int', default: defaultPort,
       help: `port number (default: ${defaultPort})`});
  simpleCommandParser.add_argument(
      '-b', '--baseDir',
      {action: 'store', default: '.',
       help:'server base directory (default: current directory)'});
  simpleCommandParser.add_argument(
      '-w', '--wbnResourceDir',
      {action: 'append', help:'wbn resource directory in baseDir'});
  let args = simpleCommandParser.parse_args(process.argv.slice(3));
  let config = {host: args.host, port: args.port,
                baseUrl: `http://${args.host}:${args.port}`,
                baseDir: path.resolve(args.baseDir), wbnCreationInfoList: []};
  if (args.wbnResourceDir) {
    args.wbnResourceDir.forEach(resourceDir => {
        let resourceDirPath = path.join(config['baseDir'], resourceDir);
        if (fs.existsSync(resourceDirPath)) {
          let wbnCreationInfo = {output: `${resourceDir}.wbn`, resources: []};
          const files = glob.sync(`${resourceDirPath}/**/*.*`);
          files.map(file => {
            wbnCreationInfo['resources'].push({
                source: file.slice(config['baseDir'].length + 1)});
          });
          config['wbnCreationInfoList'].push(wbnCreationInfo);
        }
    });
  }
  serverConfigs.push(config);
} else {
  let fullCommandParser = new ArgumentParser(
      {prog: `${path.basename(__filename)} full`,
       description: "Start server to test web bundle with configuration file"});
  fullCommandParser.add_argument(
      '-H', '--host',
      {action: 'store', default: defaultHost,
       help: `host name (default: ${defaultHost})`});
  fullCommandParser.add_argument(
      '-p', '--port',
      {action: 'store', type: 'int', default: defaultPort,
       help: `fallback port number. (default: ${defaultPort})`});
  fullCommandParser.add_argument(
      '-c', '--configs', {action: 'store', required: true,
                          help: 'server configurations file path'});
  let args = fullCommandParser.parse_args(process.argv.slice(3));
  let configsPath = path.resolve(args.configs);
  assert(fs.existsSync(configsPath));
  serverConfigs = JSON.parse(fs.readFileSync(configsPath));
  let fallbackPort = args.port;
  let configsDir = path.dirname(configsPath);
  serverConfigs.forEach(config => {
    config['host'] = config['host'] || args.host;
    config['port'] = config['port'] || fallbackPort++;
    assert(config['baseUrl'] == null);
    config['baseUrl'] = `http://${config['host']}:${config['port']}`,
    defaultMustacheView[`${config['baseDir']}_baseUrl`] = config['baseUrl'];
    defaultMustacheView[`${config['baseDir']}_port`] = config['port'];
    config['baseDir'] = path.join(configsDir, config['baseDir']);
  });
}


const contentTypeMap = {
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

function createWbn(baseDir, baseUrl, wbnCreationInfo) {
  var t0 = performance.now();

  const builder = new wbn.BundleBuilder();

  assert(wbnCreationInfo['output']);
  assert(wbnCreationInfo['resources']);
  assert(baseUrl);
  assert(baseDir);

  wbnCreationInfo['baseUrl'] = wbnCreationInfo['baseUrl'] || baseUrl;

  wbnCreationInfo['resources'].forEach(resource => {
    assert(resource['source']);

    resource['baseUrl'] = resource['baseUrl'] || wbnCreationInfo['baseUrl'];
    let mustacheView = {... defaultMustacheView || {}};
    mustacheView['baseUrl'] = resource['baseUrl'];

    resource['url'] = resource['url'] || `{{{baseUrl}}}/${resource['source']}`
    resource['url'] = mustache.render(resource['url'], mustacheView);
    if (resource['uuid'])
      resource['url'] = `uuid-in-package:${resource['uuid']}`;

    let sourcePath = path.join(baseDir, resource['source']);
    let mustachePath = `${sourcePath}.mustache`;
    if (fs.existsSync(mustachePath)) {
      let sourceData =
          mustache.render(fs.readFileSync(mustachePath).toString(),
                          mustacheView);
      fs.writeFileSync(sourcePath, sourceData);
    }

    assert(fs.existsSync(sourcePath), `Cannot find ${sourcePath}`);
    
    let fileExt = path.parse(resource['source']).ext;
    let contentType = contentTypeMap[fileExt] || 'application/javascript';
    let fileData = fs.readFileSync(sourcePath);
    builder.addExchange(resource['url'],
                        200,
                        { 'Content-Type': contentType },
                        fileData);
    if (resource['primary'])
      builder.setPrimaryURL(resource['url']);
  });
  fs.writeFileSync(path.join(baseDir, wbnCreationInfo['output']),
                   builder.createBundle());

  console.log([`Created ${wbnCreationInfo['output']}`,
               `with ${wbnCreationInfo['resources'].length} resources`,
               `in ${(performance.now() - t0).toFixed(1)} ms`].join(' '));
}

function startServer(baseUrl, port, baseDir) {
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Base directory: ${baseDir}`);

  http.createServer(function (request, response) {
    console.log(`${request.method} ${request.url}`);
    var t0 = performance.now();

    let requestUrl = new URL(request.url, baseUrl);
    let pathname = path.resolve(
      path.join(baseDir, requestUrl.toString().replace(baseUrl, "")));
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
    response.setHeader('Access-Control-Allow-Methods',
                       'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers',
                       'X-Requested-With,content-type,bundle-preload,Vary');
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
            let resourcePath = path.resolve(path.join(baseDir,
                                            resourceUrl.pathname));
            let resourceExtension = path.parse(resourcePath).ext;
            const headers = {
              'Access-Control-Allow-Headers':
                  'X-Requested-With,content-type,bundle-preload,Vary',
              'Content-Type': contentTypeMap[resourceExtension] ||
                              'application/octet-stream',
            };
            builder.addExchange(resourceUrl.toString(), 200, headers,
                                fs.readFileSync(resourcePath));
          } catch (error) {
            console.log(
                `Bundled request failed when getting the file: ${error}`);
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
        console.log(
            `Serving a custom bundle took ${(t1 - t0).toFixed(1)} ms.`);
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
                           contentTypeMap[requestExt] || 'text/plain');
        response.end(data);

        var t1 = performance.now();
        console.log(`Serving a single file took ${(t1 - t0).toFixed(1)} ms.`);
      }
    });
  }).listen(parseInt(port));

  console.log('Server listening on port ' + port);
}

serverConfigs.forEach(config => {
  config['wbnCreationInfoList'].forEach(wbnCreationInfo => {
    createWbn(config['baseDir'], config['baseUrl'], wbnCreationInfo);
  });
  let mustacheView = {... defaultMustacheView || {}};
  mustacheView['baseUrl'] = config['baseUrl'];
  let indexPath = path.join(config['baseDir'], 'index.html');
  let mustachePath = `${indexPath}.mustache`;
  if (fs.existsSync(mustachePath)) {
    let sourceData =
        mustache.render(fs.readFileSync(mustachePath).toString(),
                        mustacheView);
    fs.writeFileSync(indexPath, sourceData);
  }
  startServer(config['baseUrl'], config['port'], config['baseDir']);
});
