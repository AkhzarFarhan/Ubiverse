// js/gym.js
// Gym workout log module.

window.GymModule = (function () {
  'use strict';

  const STORAGE_KEY   = () => 'gym_' + window.AppState.username;
  const FIREBASE_PATH = () => 'gym/' + window.AppState.username;

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>🏋️ Gym Log</h2>
          <p>Track your workout sessions</p>
        </div>

        <form class="form-card" id="gym-form" novalidate>
          <div class="card-title">Log Workout</div>
          <div id="gym-alert"></div>
          <div class="form-group">
            <label for="gym-message">Workout Details</label>
            <textarea id="gym-message" placeholder="e.g. Chest day: bench press 4×10, incline 3×12…" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Save Workout</button>
        </form>

        <div class="card">
          <div class="card-title">🗂️ Workout History</div>
          <div id="gym-list"><p class="text-muted text-sm text-center">Loading…</p></div>
        </div>
      </div>
    `;

    document.getElementById('gym-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });

    loadData();
  }

  /* ── Submit ───────────────────────────────────────────────── */
  async function submit() {
    const message = document.getElementById('gym-message').value.trim();

    if (!message) {
      showAlert('gym-alert', 'Workout details cannot be empty.', 'error');
      return;
    }

    clearAlert('gym-alert');

    const entry = {
      message,
      timestamp: getKolkataTimestamp(),
    };

    try {
      await firebasePost(FIREBASE_PATH(), entry);
    } catch (e) {
      console.warn('Firebase write failed:', e);
    }
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY())) || [];
    arr.unshift(entry);
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(arr));

    document.getElementById('gym-message').value = '';
    showAlert('gym-alert', 'Workout logged successfully! 💪', 'success');
    renderList(arr);
  }

  /* ── Load ─────────────────────────────────────────────────── */
  async function loadData() {
    const arr = await getEntries();
    renderList(arr);
  }

  /* ── Render list ──────────────────────────────────────────── */
  function renderList(arr) {
    const container = document.getElementById('gym-list');
    if (!container) return;

    if (arr.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🏃</div>
        <p>No workouts logged yet. Start your first session!</p>
      </div>`;
      return;
    }

    container.innerHTML = `<div class="entry-list">` +
      arr.map(function (e, i) {
        return `<div class="entry-card">
          <div class="entry-meta">
            <span class="badge badge-primary">#${arr.length - i}</span>
            <span class="entry-time">🕐 ${e.timestamp || ''}</span>
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

