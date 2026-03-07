// js/gym.js
// Gym workout log module.

window.GymModule = (function () {
  'use strict';

  const STORAGE_KEY = () => 'gym_' + window.AppState.username;

  const SAMPLE_DATA = [
    { message: 'Chest & triceps: bench press 4×10, incline DB 3×12, tricep pushdown 3×15.', timestamp: '01-06-2025 06:30:00 AM' },
    { message: 'Leg day: squats 4×8, leg press 3×12, leg curl 3×15, calf raises 4×20.', timestamp: '03-06-2025 06:45:22 AM' },
    { message: 'Pull day: deadlifts 3×5, barbell rows 4×10, lat pulldown 3×12, face pulls 3×15.', timestamp: '05-06-2025 07:00:10 AM' },
    { message: 'Cardio: 30 min treadmill + 15 min cycle. Felt energetic.', timestamp: '07-06-2025 06:20:00 AM' },
  ];

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
          <div id="gym-list"></div>
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
  function submit() {
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

    const arr = getEntries();
    arr.unshift(entry);
    saveEntries(arr);

    // TODO: Firebase — POST to gym/{username}.json
    firebasePost('gym/' + window.AppState.username, entry)
      .then(function () { /* stub */ });

    document.getElementById('gym-message').value = '';
    showAlert('gym-alert', 'Workout logged successfully! 💪', 'success');
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
