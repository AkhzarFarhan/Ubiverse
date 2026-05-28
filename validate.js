#!/usr/bin/env node
// validate.js — Lightweight structural validator for Ubiverse.
// Replaces the former Python test suite. Run with: node validate.js
//
// Checks:
//   1. Required project files exist
//   2. No git conflict markers in source files
//   3. Critical DOM IDs exist in index.html
//   4. MODULES and ROUTES in app.js are consistent
//   5. Sidebar nav covers all routes
//   6. Each module file exposes a global IIFE with render()

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
let passed = 0;
let failed = 0;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function check(name, ok, detail) {
  if (ok) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}: ${detail}`);
  }
}

// ── 1. Required files ────────────────────────────────────────────
console.log('\n── Required Files ──');
const requiredFiles = [
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/firebase.js',
  'js/utils.js',
  'js/env.js.example',
  'build.js',
  'database.rules.json',
];
const missingFiles = requiredFiles.filter(f => !fs.existsSync(path.join(ROOT, f)));
check('Required project files exist', missingFiles.length === 0, `Missing: ${missingFiles.join(', ')}`);

// ── 2. No conflict markers ──────────────────────────────────────
console.log('\n── Conflict Markers ──');
const globs = ['js', 'css'];
const extensions = ['.js', '.html', '.css', '.md'];
const sourceFiles = [];

// Collect source files from root and subdirectories
fs.readdirSync(ROOT).forEach(f => {
  const full = path.join(ROOT, f);
  if (extensions.some(ext => f.endsWith(ext)) && fs.statSync(full).isFile()) {
    sourceFiles.push(f);
  }
});
globs.forEach(dir => {
  const dirPath = path.join(ROOT, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    fs.readdirSync(dirPath).forEach(f => {
      if (extensions.some(ext => f.endsWith(ext))) {
        sourceFiles.push(path.join(dir, f));
      }
    });
  }
});

const conflictFiles = sourceFiles.filter(f => {
  const text = read(f);
  return /^<{7}\s/m.test(text) || /^={7}$/m.test(text) || /^>{7}\s/m.test(text);
});
check('No conflict markers in source files', conflictFiles.length === 0, `Found in: ${conflictFiles.join(', ')}`);

// ── 3. Critical DOM IDs ─────────────────────────────────────────
console.log('\n── DOM Structure ──');
const indexHtml = read('index.html');
const requiredIds = [
  'login-screen', 'login-alert', 'google-signin-btn',
  'layout', 'header-user', 'signout-btn',
  'sidebar', 'sidebar-overlay', 'app',
];
const missingIds = requiredIds.filter(id => !indexHtml.includes(`id="${id}"`));
check('Critical DOM IDs exist in index.html', missingIds.length === 0, `Missing: ${missingIds.join(', ')}`);

// ── 4. MODULES/ROUTES consistency ───────────────────────────────
console.log('\n── Routes & Modules ──');
const appJs = read('js/app.js');

// Extract MODULES keys
const moduleKeys = [...appJs.matchAll(/\{\s*key:\s*'([a-z]+)'/g)].map(m => m[1]);
check('MODULES array has entries', moduleKeys.length >= 7, `Found only ${moduleKeys.length} modules`);

// Extract ROUTES keys
const routeKeys = [...appJs.matchAll(/^\s*([a-z]+):\s*\(\)\s*=>/gm)].map(m => m[1]);
check('Home route exists', routeKeys.includes('home'), 'Missing home route');

// ROUTES (minus home) should match MODULES
const routesNoHome = routeKeys.filter(k => k !== 'home').sort();
const modulesSorted = [...new Set(moduleKeys)].sort();
const routeMismatch = modulesSorted.filter(k => !routesNoHome.includes(k));
const extraRoutes = routesNoHome.filter(k => !modulesSorted.includes(k));
check(
  'ROUTES keys match MODULES keys',
  routeMismatch.length === 0 && extraRoutes.length === 0,
  `Missing routes: [${routeMismatch}] Extra routes: [${extraRoutes}]`
);

// ── 5. Sidebar nav coverage ─────────────────────────────────────
console.log('\n── Sidebar Navigation ──');
const navKeys = [...indexHtml.matchAll(/data-page="([a-z]+)"/g)].map(m => m[1]);
const nonHomeRoutes = routeKeys.filter(k => k !== 'home');
const missingNav = nonHomeRoutes.filter(k => !navKeys.includes(k));
check('Sidebar nav covers all routes', missingNav.length === 0, `Missing nav for: ${missingNav.join(', ')}`);
check('Sidebar includes home link', navKeys.includes('home'), 'Missing home nav link');

// ── 6. Module file contracts ────────────────────────────────────
console.log('\n── Module Contracts ──');

// Build expected module names from ROUTES import patterns
const moduleFileMap = {};
for (const match of appJs.matchAll(/import\('\.\/([^']+)'\)\.then\(m\s*=>\s*m\.(\w+)\.render\(\)\)/g)) {
  moduleFileMap['js/' + match[1]] = match[2];
}

for (const [filePath, moduleName] of Object.entries(moduleFileMap)) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    check(`${filePath} exists`, false, 'File not found');
    continue;
  }
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check for either IIFE pattern (const or window) or ESM export
  const hasIIFE = content.includes(`window.${moduleName} = (function ()`)
    || content.includes(`const ${moduleName} = (function ()`);
  const hasESMExport = content.includes(`export const ${moduleName}`)
    || content.includes(`export { ${moduleName} }`);
  const hasModule = hasIIFE || hasESMExport;

  const hasRender = content.includes('function render(');
  const exportsRender = content.includes('return { render')
    || content.includes('return { render:')
    || content.includes(`${moduleName} = { render`);

  check(`${filePath} defines ${moduleName}`, hasModule, `Missing ${moduleName} definition (IIFE or ESM export)`);
  check(`${filePath} has render() function`, hasRender, 'Missing function render(');
  check(`${filePath} exports render`, exportsRender || hasESMExport, 'Missing render export');
}

// ── 7. Firebase CRUD error handling ─────────────────────────────
console.log('\n── Firebase CRUD Contracts ──');
const firebaseJs = read('js/firebase.js');
const crudFunctions = ['firebaseGet', 'firebasePost', 'firebasePut', 'firebasePatch', 'firebaseDelete'];

for (const fn of crudFunctions) {
  const fnRegex = new RegExp(`async function ${fn}\\(`);
  const hasFn = fnRegex.test(firebaseJs);
  check(`${fn}() exists`, hasFn, `Missing async function ${fn}`);

  if (hasFn) {
    // Find the function block (rough: from function start to next async function or end)
    const startIdx = firebaseJs.search(fnRegex);
    const nextFnIdx = firebaseJs.indexOf('async function ', startIdx + 10);
    const block = nextFnIdx > startIdx ? firebaseJs.slice(startIdx, nextFnIdx) : firebaseJs.slice(startIdx);

    check(`${fn}() has try/catch`, block.includes('try {') && block.includes('catch'), 'Missing try/catch');
    check(`${fn}() shows toast on error`, block.includes('window.showToast'), 'Missing window.showToast');
  }
}

// ── Summary ──────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`  Total: ${passed + failed} checks | ✅ ${passed} passed | ❌ ${failed} failed`);
console.log('═'.repeat(50));

if (failed > 0) {
  console.log('\n⚠️  Validation FAILED — fix the issues above before pushing.\n');
  process.exit(1);
} else {
  console.log('\n✅ All structural checks passed.\n');
  process.exit(0);
}
