// js/app.js
// Hash-based SPA router + login flow.

(function () {
  'use strict';

  const ROUTES = {
    daily:  () => window.DailyModule.render(),
    gym:    () => window.GymModule.render(),
    texter: () => window.TexterModule.render(),
    tasbih: () => window.TasbihModule.render(),
    salah:  () => window.SalahModule.render(),
    ledger: () => window.LedgerModule.render(),
    car:    () => window.CarModule.render(),
  };

  /* ── Auth ─────────────────────────────────────────────────── */

  function isLoggedIn() {
    return !!localStorage.getItem('ubiverse_username');
  }

  function restoreSession() {
    const u = localStorage.getItem('ubiverse_username');
    if (u) {
      window.AppState.username = u;
      return true;
    }
    return false;
  }

  function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('layout').classList.remove('hidden');
    document.getElementById('header-user').textContent = '👤 ' + window.AppState.username;
    navigate();
  }

  function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('layout').classList.add('hidden');
  }

  /* ── Login form ───────────────────────────────────────────── */

  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
      showAlert('login-alert', 'Please enter both username and password.', 'error');
      return;
    }

    window.AppState.username = username;
    window.AppState.password = password; // held in memory only; not persisted
    localStorage.setItem('ubiverse_username', username);
    // Passwords are never written to localStorage (mock auth only).

    clearAlert('login-alert');
    showApp();
  });

  /* ── Router ───────────────────────────────────────────────── */

  function navigate() {
    const hash = window.location.hash.replace('#', '') || 'daily';
    const page = ROUTES[hash] ? hash : 'daily';

    if (!ROUTES[hash]) {
      window.location.hash = 'daily';
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
    if (isLoggedIn()) navigate();
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

  if (restoreSession()) {
    showApp();
  } else {
    showLogin();
  }

}());
