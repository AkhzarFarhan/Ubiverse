const fs = require('fs');
let code = fs.readFileSync('js/app.js', 'utf8');

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

// replace ROUTES
code = code.replace(/const ROUTES = \{[\s\S]*?\};/, newRoutes);

// make navigate async
const newNavigate = `
  async function navigate() {
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
        \`<div class="card"><p class="text-muted">\u26A0\uFE0F Error loading page: \${err.message}</p></div>\`;
      console.error(err);
    }

    // Close mobile sidebar
    closeSidebar();
  }
`;

code = code.replace(/function navigate\(\) \{[\s\S]*?closeSidebar\(\);\s*\}/, newNavigate.trim());

fs.writeFileSync('js/app.js', code);
