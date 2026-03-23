const esbuild = require('esbuild');
async function run() {
  const res = await esbuild.build({
    stdin: {
      contents: 'const x = 1; export { x };',
      resolveDir: process.cwd(),
    },
    minify: true,
    write: false
  });
  console.log(res.outputFiles[0].text);
}
run();
