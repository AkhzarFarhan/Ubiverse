const esbuild = require('esbuild');
async function run() {
  const res = await esbuild.build({
    entryPoints: ['js/app.js'],
    outdir: 'dist-test',
    format: 'esm',
    entryNames: 'js/[name]-[hash]',
    metafile: true
  });
  console.log(JSON.stringify(res.metafile.outputs, null, 2));
}
run();
