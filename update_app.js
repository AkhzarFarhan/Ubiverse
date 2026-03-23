const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

// Replace ROUTES
const oldRoutes = `  const ROUTES = {
    home:   () => renderHome(),
    daily:  () => window.DailyModule.render(),
    gym:    () => window.GymModule.render(),
    texter: () => window.TexterModule.render(),
    tasbih: () => window.TasbihModule.render(),
    salah:  () => window.SalahModule.render(),
    ledger: () => window.LedgerModule.render(),
    car:    () => window.CarModule.render(),
    vibex:  () => window.VibexModule.render(),
    quran:  () => window.QuranModule.render(),
  };`;

const newRoutes = `  const ROUTES = {
    home:   () => renderHome(),
    daily:  () => import('./daily.js').then(m => m.DailyModule.render()),
    gym:    () => import('./gym.js').then(m => m.GymModule.render()),
    texter: () => import('./texter.js').then(m => m.TexterModule.render()),
    tasbih: () => import('./tasbih.js').then(m => m.TasbihModule.render()),
    salah:  () => import('./salah.js').then(m => m.SalahModule.render()),
    ledger: () => import('./ledger.js').then(m => m.LedgerModule.render()),
    car:    () => import('./car.js').then(m => m.CarModule.render()),
    vibex:  () => import('./vibex.js').then(m => m.VibexModule.render()),
    quran:  () => import('./quran.js').then(m => m.QuranModule.render()),
  };`;

content = content.replace(oldRoutes, newRoutes);
content = content.replace(/m\.DailyModule/g, 'm.DailyModule'); // Ensure didn't replace twice

// Update navigate 
const oldNavigate = `  function navigate() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const page = ROUTES[hash] ? hash : 'home';

    if (!ROUTES[hash]) {
      window.location.hash = 'home';
      return;
    }

    // Update nav active states
    document.querySelectorAll('.nav-link').forEach(function (a) {
      a.classList.toggle('active', a.dataset.page === page);
    });

    // Render page module
    try {
      ROUTES[page]();
    } catch (err) {
      document.getElementById('app').innerHTML =
        \`<div class="card"><p class="text-muted">⚠️ Error loading page: \${err.message}</p></div>\`;
      console.error(err);
    }
    closeSidebar();
  }`;

const newNavigate = `  async function navigate() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const page = ROUTES[hash] ? hash : 'home';

    if (!ROUTES[hash]) {
      window.location.hash = 'home';
      return;
    }

    // Update nav active states
    document.querySelectorAll('.nav-link').forEach(function (a) {
      a.classList.toggle('active', a.dataset.page === page);
    });

    // Render page module
    try {
      await ROUTES[page]();
    } catch (err) {
      document.getElementById('app').innerHTML =
        \`<div class="card"><p class="text-muted">⚠️ Error loading page: \${err.message}</p></div>\`;
      console.error(err);
    }
    closeSidebar();
  }`;

content = content.replace(oldNavigate, newNavigate);
fs.writeFileSync('js/app.js', content);
