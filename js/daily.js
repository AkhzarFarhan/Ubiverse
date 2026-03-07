// js/daily.js
// Daily mood / note tracker module.

window.DailyModule = (function () {
  'use strict';

  const STORAGE_KEY = () => 'daily_' + window.AppState.username;

  const SAMPLE_DATA = [
    { message: 'Had a productive morning, finished the main feature.', rating: 8, timestamp: '01-06-2025 08:45:12 AM' },
    { message: 'Feeling a bit tired but pushed through the workout.', rating: 6, timestamp: '02-06-2025 09:10:30 AM' },
    { message: 'Great day overall! Met all targets and slept well.', rating: 9, timestamp: '03-06-2025 08:55:00 AM' },
  ];

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
            <label for="daily-rating">Rating (1–10)</label>
            <input type="number" id="daily-rating" placeholder="7" min="1" max="10" />
          </div>
          <button type="submit" class="btn btn-primary">Add Entry</button>
        </form>

        <div class="card">
          <div class="card-title">📋 Past Entries</div>
          <div id="daily-list"></div>
        </div>
      </div>
    `;

    document.getElementById('daily-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });

    loadData();
  }

  /* ── Submit ───────────────────────────────────────────────── */
  function submit() {
    const message = document.getElementById('daily-message').value.trim();
    const ratingRaw = document.getElementById('daily-rating').value.trim();
    const rating  = parseInt(ratingRaw, 10);

    if (!message) {
      showAlert('daily-alert', 'Message cannot be empty.', 'error');
      return;
    }
    if (!ratingRaw || isNaN(rating) || rating < 1 || rating > 10) {
      showAlert('daily-alert', 'Rating must be a number between 1 and 10.', 'error');
      return;
    }

    clearAlert('daily-alert');

    const entry = {
      message,
      rating,
      timestamp: getKolkataTimestamp(),
    };

    const arr = getEntries();
    arr.unshift(entry);
    saveEntries(arr);

    // TODO: Firebase — POST to daily/{username}.json
    firebasePost('daily/' + window.AppState.username, entry)
      .then(function () { /* stub */ });

    document.getElementById('daily-message').value = '';
    document.getElementById('daily-rating').value  = '';

    showAlert('daily-alert', 'Entry added successfully!', 'success');
    renderList(arr);
  }

  /* ── Load ─────────────────────────────────────────────────── */
  function loadData() {
    let arr = getEntries();
    if (arr.length === 0) {
      arr = SAMPLE_DATA.slice();
      saveEntries(arr);
    }
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

    const ratingColor = (r) => {
      if (r >= 8) return 'badge-success';
      if (r >= 5) return 'badge-primary';
      return 'badge-danger';
    };

    container.innerHTML = `<div class="entry-list">` +
      arr.map(function (e) {
        return `<div class="entry-card">
          <div class="entry-meta">
            <span class="entry-time">🕐 ${e.timestamp || ''}</span>
            <span class="badge ${ratingColor(e.rating)}">${e.rating}/10</span>
          </div>
          <div class="entry-message">${escapeHtml(e.message)}</div>
        </div>`;
      }).join('') +
    `</div>`;
  }

  /* ── Storage helpers ──────────────────────────────────────── */
  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY())) || [];
    } catch (_) { return []; }
  }

  function saveEntries(arr) {
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(arr));
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
