// js/texter.js
// Quick notes / texter module.

window.TexterModule = (function () {
  'use strict';

  const STORAGE_KEY   = () => 'texter_' + window.AppState.username;
  const FIREBASE_PATH = () => 'texter_v2/' + window.AppState.username;

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
          <div id="texter-list"><p class="text-muted text-sm text-center">Loading…</p></div>
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
  async function submit() {
    const note = document.getElementById('texter-note').value.trim();

    clearAlert('texter-alert');

    const entry = {
      note: note || '(empty note)',
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

    document.getElementById('texter-note').value = '';
    showAlert('texter-alert', 'Note saved!', 'success');
    renderList(arr);
  }

  /* ── Load ─────────────────────────────────────────────────── */
  async function loadData() {
    const arr = await getEntries();
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

