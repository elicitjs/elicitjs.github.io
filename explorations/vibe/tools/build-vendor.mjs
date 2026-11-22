// build-vendor.mjs — bundle Elicit.js + d3 + topojson-client as one IIFE, so the
// site loads with a plain <script> tag and opens from file://.
//
//   cd tools && npm install && node build-vendor.mjs
//
// Built from ../../../../elicitjs/src, so rebuild it after a library change.
// d3 is resolved from the library's own node_modules, so the library and the
// entries' data prep share one copy.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = path.resolve(here, '../../../../elicitjs');

await build({
    entryPoints: [path.join(here, 'vendor-src/elicit.js')],
    bundle: true, format: 'iife', minify: true, legalComments: 'none',
    outfile: path.resolve(here, '../vendor/elicit-bundle.js'),
    alias: { d3: path.join(lib, 'node_modules/d3/src/index.js') },
    nodePaths: [path.join(here, 'node_modules')],
});
console.log('vendor/elicit-bundle.js written');
