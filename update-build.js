const fs = require('fs');

let content = fs.readFileSync('build.js', 'utf8');

// We want to add crypto
content = "const crypto = require('crypto');\n" + content;

// Generate hash
const hashFunc = `
// Generate a short hash based on current time to act as a version string
const buildHash = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 8) : crypto.createHash('md5').update(Date.now().toString()).digest('hex').substring(0, 8);
`;

const replaceAssets = `
// Copy HTML and other static assets
async function copyAssets() {
  // Copy index.html with updated script/style references
  let html = fs.readFileSync('index.html', 'utf8');

  // Add version cache busting for static resources
  html = html.replace(/href="css\\/style\\.css"/g, \`href="css/style.css?v=\${buildHash}"\`);
  html = html.replace(/src="js\\/env\\.js"/g, \`src="js/env.js?v=\${buildHash}"\`);
  html = html.replace(/src="js\\/firebase\\.js"/g, \`src="js/firebase.js?v=\${buildHash}"\`);
  html = html.replace(/src="js\\/utils\\.js"/g, \`src="js/utils.js?v=\${buildHash}"\`);
  html = html.replace(/src="js\\/app\\.js"/g, \`src="js/app.js?v=\${buildHash}"\`);

  fs.writeFileSync('dist/index.html', html);

  // Update sw.js CACHE_NAME to ensure the new version breaks the SW cache
  if (fs.existsSync('sw.js')) {
    let swContent = fs.readFileSync('sw.js', 'utf8');
    swContent = swContent.replace(/const CACHE_NAME = 'ubiverse-[^']+';/, \`const CACHE_NAME = 'ubiverse-\${buildHash}';\`);
    // Also copy it to dist
    fs.writeFileSync('dist/sw.js', swContent);
  }

  // Also copy manifest or assets folder if they exist
  if (fs.existsSync('manifest.json')) {
    fs.copyFileSync('manifest.json', 'dist/manifest.json');
  }
  if (fs.existsSync('assets')) {
    fs.cpSync('assets', 'dist/assets', { recursive: true });
  }

  console.log('Assets copied with cache-buster v=' + buildHash);
}
`;

content = content.replace(/(\/\/ Copy HTML and other static assets[\s\S]*?console\.log\('Assets copied'\);\n})/m, replaceAssets);

content = content.replace(/\/\/ Ensure dist directory/g, hashFunc + '\n// Ensure dist directory');

fs.writeFileSync('build.js', content);
