// js/daily.js
// Daily mood / note tracker module.

window.DailyModule = (function () {
  'use strict';

  const STORAGE_KEY   = () => 'daily_' + window.AppState.username;
  const FIREBASE_PATH = () => 'daily/' + window.AppState.username;

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>📅 Daily Log</h2>
          <p>Track your daily mood and notes</p>
        </div>

        <form class="form-card" id="daily-form" novalidate>
          <div class="card-title">New Entry</div>
          <div id="daily-alert"></div>
          <div class="form-group">
            <label for="daily-message">Message</label>
            <input type="text" id="daily-message" placeholder="How was your day?" maxlength="300" />
          </div>
          <div class="form-group">
            <label>Rating (1 = worst, 10 = best)</label>
            <input type="hidden" id="daily-rating" value="" />
            <div class="daily-rating-grid">
              ${[1,2,3,4,5,6,7,8,9,10].map(function (n) {
                var cls;
                if (n <= 3)      cls = 'daily-rating-low';
                else if (n <= 5) cls = 'daily-rating-mid';
                else if (n <= 7) cls = 'daily-rating-ok';
                else             cls = 'daily-rating-high';
                return '<button type="button" class="daily-rating-btn ' + cls + '" data-rating="' + n + '">' + n + '</button>';
              }).join('')}
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Add Entry</button>
        </form>

        <div class="card">
          <div class="card-title">📋 Past Entries</div>
          <div id="daily-list"><p class="text-muted text-sm text-center">Loading…</p></div>
        </div>
      </div>
    `;

    document.getElementById('daily-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });

    // Rating button listeners
    document.querySelectorAll('.daily-rating-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.daily-rating-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById('daily-rating').value = btn.getAttribute('data-rating');
      });
    });

    loadData();
  }

  /* ── Submit ───────────────────────────────────────────────── */
  async function submit() {
    const message = document.getElementById('daily-message').value.trim();
    const rating  = document.getElementById('daily-rating').value;

    if (!message) {
      showAlert('daily-alert', 'Message cannot be empty.', 'error');
      return;
    }
    if (!rating) {
      showAlert('daily-alert', 'Please select a rating (1–10).', 'error');
      return;
    }

    clearAlert('daily-alert');

    const entry = {
      message,
      rating: parseInt(rating, 10),
      timestamp: getKolkataTimestamp(),
    };

    // Write to Firebase
    try {
      await firebasePost(FIREBASE_PATH(), entry);
    } catch (e) {
      console.warn('Firebase write failed:', e);
    }
    // Prepend to localStorage cache (synced from Firebase on page load)
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY())) || [];
    cached.unshift(entry);
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(cached));

    document.getElementById('daily-message').value = '';
    document.getElementById('daily-rating').value  = '';
    document.querySelectorAll('.daily-rating-btn').forEach(function (b) { b.classList.remove('active'); });

    showAlert('daily-alert', 'Entry added successfully!', 'success');
    renderList(cached);
  }

  /* ── Load ─────────────────────────────────────────────────── */
  async function loadData() {
    const arr = await getEntries();
    renderList(arr);
  }

  /* ── Render list ──────────────────────────────────────────── */
  function renderList(arr) {
    const container = document.getElementById('daily-list');
    if (!container) return;

    if (arr.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No entries yet. Add your first daily note above!</p>
      </div>`;
      return;
    }

    function ratingBadge(r) {
      // Legacy good/bad string ratings
      if (r === 'good') return '<span class="badge badge-success">👍 Good</span>';
      if (r === 'bad')  return '<span class="badge badge-danger">👎 Bad</span>';
      // Numeric ratings (1–10)
      var num = parseInt(r, 10);
      if (isNaN(num)) return '';
      var cls = num >= 8 ? 'badge-success' : num >= 6 ? 'badge-primary' : num >= 4 ? 'badge-warning' : 'badge-danger';
      return '<span class="badge ' + cls + '">' + num + '/10</span>';
    }

    container.innerHTML = `<div class="entry-list">` +
      arr.map(function (e) {
        return `<div class="entry-card">
          <div class="entry-meta">
            <span class="entry-time">🕐 ${e.timestamp || ''}</span>
            ${ratingBadge(e.rating)}
          </div>
          <div class="entry-message">${escapeHtml(e.message)}</div>
        </div>`;
      }).join('') +
    `</div>`;
  }

  /* ── Storage helpers ──────────────────────────────────────── */
  async function getEntries() {
    try {
      const data = await firebaseGet(FIREBASE_PATH());
      const arr  = data ? objectToArray(data) : [];
      localStorage.setItem(STORAGE_KEY(), JSON.stringify(arr));
      return arr;
    } catch (e) {
      console.warn('Firebase read failed, using localStorage:', e);
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY())) || [];
      } catch (_) { return []; }
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { render, submit, loadData };
}());

