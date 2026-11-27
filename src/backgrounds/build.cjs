// Bundles each React Bits background (original source, unchanged) into vendor/js/bg-<name>.min.js,
// with React swapped for the tiny shim in react-shim.js.
// Needs esbuild installed:  npm i esbuild@0.24
//   node src/backgrounds/build.cjs
const path = require('node:path');
const esbuild = require('esbuild');

const here = __dirname;
const out = path.join(here, '..', '..', 'vendor', 'js');
const shim = path.join(here, 'react-shim.js');

const reactShim = {
  name: 'react-shim',
  setup(build) {
    build.onResolve({ filter: /^react(\/jsx-runtime|\/jsx-dev-runtime)?$/ }, () => ({ path: shim }));
    build.onResolve({ filter: /\.css$/ }, args => ({ path: args.path, namespace: 'skip-css' }));
    build.onLoad({ filter: /.*/, namespace: 'skip-css' }, () => ({ contents: '', loader: 'js' }));
  }
};

Promise.all(['veil'].map(name => esbuild.build({
  entryPoints: [path.join(here, `entry-${name}.js`)],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  plugins: [reactShim],
  nodePaths: (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean),
  outfile: path.join(out, `bg-${name}.min.js`),
  legalComments: 'none',
  logLevel: 'warning'
}))).then(() => console.log('backgrounds built'), err => { console.error(err); process.exit(1); });
