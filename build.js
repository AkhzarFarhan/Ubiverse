const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a short hash based on current time to act as a version string
const buildHash = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 8) : crypto.createHash('md5').update(Date.now().toString()).digest('hex').substring(0, 8);

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Minify and bundle JavaScript
async function buildJS() {
  try {
    await esbuild.build({
      entryPoints: [
        'js/app.js',
        'js/utils.js',
        'js/firebase.js',
        'js/daily.js',
        'js/gym.js',
        'js/texter.js',
        'js/tasbih.js',
        'js/salah.js',
        'js/ledger.js',
        'js/car.js',
        'js/vibex.js',
        'js/quran.js',
        'sw.js'
      ],
      outdir: 'dist',
      minify: true,
      sourcemap: true,
      format: 'esm',
      target: ['es2020', 'chrome80', 'firefox80', 'safari13'],
    });
    console.log('JavaScript build completed');
  } catch (error) {
    console.error('JavaScript build failed:', error);
    process.exit(1);
  }
}

// Minify CSS
async function buildCSS() {
  try {
    await esbuild.build({
      entryPoints: ['css/style.css'],
      minify: true,
      outfile: 'dist/css/style.css',
    });
    console.log('CSS build completed');
  } catch (error) {
    console.error('CSS build failed:', error);
    process.exit(1);
  }
}

// Copy critical CSS
async function copyCriticalCSS() {
  if (!fs.existsSync(path.join(distDir, 'css'))) {
    fs.mkdirSync(path.join(distDir, 'css'), { recursive: true });
  }
  const criticalCSS = fs.readFileSync('css/critical.css', 'utf8');
  fs.writeFileSync('dist/css/critical.css', criticalCSS);
}

// Copy HTML and other static assets
async function copyAssets() {
  let html = fs.readFileSync('index.html', 'utf8');

  // Add version cache busting for static resources
  html = html.replace(/href="css\/style\.css"/g, `href="css/style.css?v=${buildHash}"`);
  html = html.replace(/src="js\/env\.js"/g, `src="js/env.js?v=${buildHash}"`);
  html = html.replace(/src="js\/firebase\.js"/g, `src="js/firebase.js?v=${buildHash}"`);
  html = html.replace(/src="js\/utils\.js"/g, `src="js/utils.js?v=${buildHash}"`);
  html = html.replace(/src="js\/app\.js"/g, `src="js/app.js?v=${buildHash}"`);

  fs.writeFileSync('dist/index.html', html);

  // Update sw.js CACHE_NAME to ensure the new version breaks the SW cache
  if (fs.existsSync('sw.js')) {
    let swContent = fs.readFileSync('sw.js', 'utf8');
    swContent = swContent.replace(/const CACHE_NAME = 'ubiverse-[^']+';/, `const CACHE_NAME = 'ubiverse-${buildHash}';`);
    // NOTE: Need to rewrite the minified one in dist instead so we don't lose minification
    let distSw = fs.readFileSync('dist/sw.js', 'utf8');
    distSw = distSw.replace(/const \w+.*?"ubiverse-[^"]+"/, `const CACHE_NAME="ubiverse-${buildHash}"`);
    
    // Instead of messing with minifier, let's just copy the unminified one over for simplicity
    // SW is extremely small anyway
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

// Main build function
async function build() {
  console.log('Starting build process...');
  await buildJS();
  await buildCSS();
  await copyCriticalCSS();
  await copyAssets();
  console.log('Build completed successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
