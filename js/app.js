// js/app.js
// Hash-based SPA router + Firebase Authentication login flow.

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

  /* ── Login form ───────────────────────────────────────────── */

  document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
      showAlert('login-alert', 'Please enter both username and password.', 'error');
      return;
    }

    if (!sanitizeUsername(username)) {
      showAlert('login-alert', 'Username may only contain letters and numbers.', 'error');
      return;
    }

    const email = username + '@ubiverse.app';

    try {
      await firebaseSignIn(email, password);
      // onAuthStateChanged will handle the rest
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Auto-create account (matches old backend behaviour)
        try {
          const cred = await firebaseSignUp(email, password);
          await cred.user.updateProfile({ displayName: username });
        } catch (signUpErr) {
          showAlert('login-alert', 'Account creation failed: ' + signUpErr.message, 'error');
        }
      } else {
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
      // Derive username from displayName or email prefix
      const username = user.displayName || user.email.split('@')[0];
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

