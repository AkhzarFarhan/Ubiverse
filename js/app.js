// js/app.js
// Hash-based SPA router + Firebase Authentication login flow.

(function () {
  'use strict';

  const MODULES = [
    { key: 'daily',  icon: '📅', label: 'Daily' },
    { key: 'gym',    icon: '🏋️', label: 'Gym' },
    { key: 'texter', icon: '✏️',  label: 'Texter' },
    { key: 'tasbih', icon: '📿', label: 'Tasbih' },
    { key: 'salah',  icon: '🕌', label: 'Salah' },
    { key: 'ledger', icon: '💰', label: 'Ledger' },
    { key: 'car',    icon: '🚗', label: 'Car' },
  ];

  const ROUTES = {
    home:   () => renderHome(),
    daily:  () => window.DailyModule.render(),
    gym:    () => window.GymModule.render(),
    texter: () => window.TexterModule.render(),
    tasbih: () => window.TasbihModule.render(),
    salah:  () => window.SalahModule.render(),
    ledger: () => window.LedgerModule.render(),
    car:    () => window.CarModule.render(),
  };

  /* ── Home (icon grid) ─────────────────────────────────────── */
  function renderHome() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>🌐 Ubiverse</h2>
          <p class="home-tagline">An Endless Possibility</p>
        </div>
        <div class="home-grid">
          ${MODULES.map(function (m) {
            return '<a href="#' + m.key + '" class="home-tile">'
              + '<span class="home-tile-icon">' + m.icon + '</span>'
              + '<span class="home-tile-label">' + m.label + '</span>'
              + '</a>';
          }).join('')}
        </div>
        <footer class="home-footer">
          Developed and Maintained by <a href="https://github.com/AkhzarFarhan" target="_blank" rel="noopener">Akhzar Farhan</a>
        </footer>
      </div>
    `;
  }

  /* ── Auth ─────────────────────────────────────────────────── */

  function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('layout').classList.remove('hidden');
    document.getElementById('header-user').textContent = '👤 ' + window.AppState.username;
    document.getElementById('signout-btn').classList.remove('hidden');
    navigate();
  }

  function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('layout').classList.add('hidden');
    document.getElementById('signout-btn').classList.add('hidden');
  }

  /* ── Google Sign-In ───────────────────────────────────────── */

  document.getElementById('google-signin-btn').addEventListener('click', async function () {
    try {
      await firebaseSignInWithGoogle();
      // onAuthStateChanged will handle the rest
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showAlert('login-alert', 'Sign-in failed: ' + err.message, 'error');
      }
    }
  });

  /* ── Sign Out ─────────────────────────────────────────────── */

  document.getElementById('signout-btn').addEventListener('click', async function () {
    await firebaseSignOut();
    // onAuthStateChanged will call showLogin()
  });

  /* ── Firebase Auth state observer ────────────────────────── */

  onAuthStateChanged(function (user) {
    if (user) {
      // Derive username from Google displayName or email prefix
      const username = (user.displayName || user.email.split('@')[0]).replace(/\s+/g, '').toLowerCase();
      window.AppState.username = username;
      localStorage.setItem('ubiverse_username', username);
      showApp();
    } else {
      window.AppState.username = '';
      localStorage.removeItem('ubiverse_username');
      showLogin();
    }
  });

  /* ── Router ───────────────────────────────────────────────── */

  function navigate() {
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
        `<div class="card"><p class="text-muted">⚠️ Error loading page: ${err.message}</p></div>`;
      console.error(err);
    }

    // Close mobile sidebar
    closeSidebar();
  }

  window.addEventListener('hashchange', function () {
    if (window.AppState.username) navigate();
  });

  /* ── Hamburger / sidebar ──────────────────────────────────── */

  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', function () {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);

  /* ── Boot ─────────────────────────────────────────────────── */
  // Auth state is restored by onAuthStateChanged — no need for manual session check.
  // Show login until Firebase resolves the auth state.
  showLogin();

}());

