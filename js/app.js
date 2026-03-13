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
    { key: 'vibex',  icon: '💬', label: 'Vibex' },
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
    vibex:  () => window.VibexModule.render(),
  };

  /* ── Home (icon grid) ─────────────────────────────────────── */
  function renderHome() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--color-primary)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:bottom; margin-right:4px;">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            Ubiverse
          </h2>
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
    document.getElementById('header-user').textContent = '👤 ' + window.AppState.displayName;
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
      // Username from email prefix (unique per Google account)
      const username = user.email.split('@')[0].toLowerCase();
      // Display name: first name from Google profile, fallback to email prefix
      const firstName = user.displayName ? user.displayName.split(' ')[0] : username;
      window.AppState.username = username;
      window.AppState.displayName = firstName;
      localStorage.setItem('ubiverse_username', username);
      showApp();
    } else {
      window.AppState.username = '';
      window.AppState.displayName = '';
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
  // If a previous session is cached in localStorage, show the app shell
  // immediately to avoid the login-screen flash while Firebase resolves
  // the auth state. We only toggle visibility here (not calling showApp())
  // because AppState is not yet populated — navigate() and the header
  // username are set by onAuthStateChanged once it confirms the session.
  // If the session has expired, onAuthStateChanged will call showLogin().
  if (localStorage.getItem('ubiverse_username')) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('layout').classList.remove('hidden');
  } else {
    showLogin();
  }

}());

