// js/texter.js
// Quick notes / texter module.

window.TexterModule = (function () {
  'use strict';

  const STORAGE_KEY = () => 'texter_' + window.AppState.username;

  const SAMPLE_DATA = [
    { note: 'Remember to call the bank on Monday about the new account.', timestamp: '01-06-2025 10:15:00 AM' },
    { note: 'Buy groceries: milk, eggs, bread, onions, tomatoes.', timestamp: '02-06-2025 11:30:45 AM' },
    { note: 'Project deadline extended to June 20. Update the team.', timestamp: '03-06-2025 02:00:00 PM' },
    { note: 'Book dentist appointment for next week.', timestamp: '04-06-2025 09:00:00 AM' },
  ];

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>✏️ Texter</h2>
          <p>Quick notes and reminders</p>
        </div>

        <form class="form-card" id="texter-form" novalidate>
          <div class="card-title">New Note</div>
          <div id="texter-alert"></div>
          <div class="form-group">
            <label for="texter-note">Note</label>
            <textarea id="texter-note" placeholder="Type your note here…" rows="4"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Save Note</button>
        </form>

        <div class="card">
          <div class="card-title">📋 All Notes</div>
          <div id="texter-list"></div>
        </div>
      </div>
    `;

    document.getElementById('texter-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });

    loadData();
  }

  /* ── Submit ───────────────────────────────────────────────── */
  function submit() {
    const note = document.getElementById('texter-note').value.trim();

    clearAlert('texter-alert');

    const entry = {
      note: note || '(empty note)',
      timestamp: getKolkataTimestamp(),
    };

    const arr = getEntries();
    arr.unshift(entry);
    saveEntries(arr);

    // TODO: Firebase — POST to texter_v2/{username}.json
    firebasePost('texter_v2/' + window.AppState.username, entry)
      .then(function () { /* stub */ });

    document.getElementById('texter-note').value = '';
    showAlert('texter-alert', 'Note saved!', 'success');
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
    const container = document.getElementById('texter-list');
    if (!container) return;

    if (arr.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No notes yet. Write your first one above!</p>
      </div>`;
      return;
    }

    container.innerHTML = `<div class="entry-list">` +
      arr.map(function (e, i) {
        return `<div class="entry-card">
          <div class="entry-meta">
            <span class="badge badge-neutral">#${arr.length - i}</span>
            <span class="entry-time">🕐 ${e.timestamp || ''}</span>
          </div>
          <div class="entry-message">${escapeHtml(e.note)}</div>
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
