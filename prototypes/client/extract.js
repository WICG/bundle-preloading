const wbn = require('wbn');
const fs = require('fs');
const path = require('path');

// Usage: node extract.js bundle.wbn outdir/
const buf = fs.readFileSync(process.argv[2]);
const outdir = process.argv[3];
const bundle = new wbn.Bundle(buf);
const primurl = bundle.primaryURL;
const exchanges = [];
for (const url of bundle.urls) {
    if (!url.startsWith(primurl)) {
	console.warn(`Found non-primary base URL ${url} for bundle anchored at ${primurl}`);
	continue;
    }
    const resp = bundle.getResponse(url);
    if (resp.status != 200) {
	console.warn(`Skipping url ${url} with status ${resp.status}`);
	continue;
    }
    const fpath = url.slice(primurl.length);
    if (fs.existsSync(fpath)) {
	console.warn(`Path ./${outdir}/${fpath} already exists`);
	continue;
    }
    const parsepath = path.parse(fpath);
    if (!fs.existsSync(`./${outdir}/${parsepath.dir}`)) {
	fs.mkdirSync(`./${outdir}/${parsepath.dir}`, {recursive: true});
    }
    if (parsepath.base.length == 0) {
	console.warn(`Skipping directory response ${url}`);
	continue;
    }
    let body = resp.body.toString('utf-8');
    fs.writeFileSync(`./${outdir}/${parsepath.dir}/${parsepath.base}`, body);
}

