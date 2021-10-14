const wbn = require('wbn');
const fs = require('fs');
const glob = require('glob');

// usage: node bundle.js <DIR>
// will produce a <DIR>.wbn bundle
// associated with the http://localhost:8080/<DIR>/ path

const subfolder = process.argv[2] || 'src';
const primaryURL = `http://localhost:8080/${subfolder}/`;
const builder = new wbn.BundleBuilder(primaryURL);

const files = glob.sync(`${process.argv[2]}/**/*.{js,png}`);

builder.addExchange(primaryURL, 200, {'Content-Type': 'text/html'}, "hi");

files.map(file => {
    builder.addExchange(
	primaryURL + file.slice(process.argv[2].length + 1),
	200,
	{'Content-Type': 'application/javascript'},
	fs.readFileSync(file)
    );
});

fs.writeFileSync(`${subfolder}.wbn`, builder.createBundle());
