const fs = require('fs');
let code = fs.readFileSync('build.js', 'utf8');

// remove format: 'esm'
code = code.replace(/format:\s*'esm',?\s*/, '');

// add copy env.js
const replaceAssets = `
  // Copy HTML and other static assets
async function copyAssets() {
  let html = fs.readFileSync('index.html', 'utf8');

  // Copy env.js if exists
  if (fs.existsSync('js/env.js')) {
    if (!fs.existsSync('dist/js')) fs.mkdirSync('dist/js', { recursive: true });
    fs.copyFileSync('js/env.js', 'dist/js/env.js');
  }

  // Add version cache busting for static resources
`;

code = code.replace(/async function copyAssets\(\) \{\s*let html = fs\.readFileSync\('index\.html', 'utf8'\);/, replaceAssets);

fs.writeFileSync('build.js', code);
