const wbn = require('wbn');
const fs = require('fs');

const buf = fs.readFileSync(process.argv[2]);
const bundle = new wbn.Bundle(buf);
const exchanges = [];
for (const url of bundle.urls) {
  const resp = bundle.getResponse(url);
  exchanges.push({
    url,
    status: resp.status,
    headers: resp.headers,
    body: resp.body.toString('utf-8')
  });
}
console.log(JSON.stringify({
  version: bundle.version,  // format version
  primaryURL: bundle.primaryURL,
  manifestURL: bundle.manifestURL,
  exchanges
}, null, 2));
