// js/texter.js
// Quick notes / texter module.

window.TexterModule = (function () {
  'use strict';

  const STORAGE_KEY   = () => 'texter_' + window.AppState.username;
  const FIREBASE_PATH = () => 'texter_v2/' + window.AppState.username;
  let currentEntries = [];

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
          <div class="texter-actions">
            <button type="submit" class="btn btn-primary">Save Note</button>
            <button type="button" id="texter-share-btn" class="btn btn-secondary">Share</button>
          </div>
        </form>

        <div class="card">
          <div class="card-title">📋 All Notes <button type="button" id="texter-copy-thread-btn" class="btn btn-secondary btn-sm texter-copy-btn">Copy Thread</button></div>
          <div id="texter-list"><p class="text-muted text-sm text-center">Loading…</p></div>
        </div>
      </div>
    `;

    document.getElementById('texter-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });
    document.getElementById('texter-share-btn').addEventListener('click', shareNote);
    document.getElementById('texter-copy-thread-btn').addEventListener('click', copyThread);

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

  async function shareNote() {
    clearAlert('texter-alert');
    const noteInput = document.getElementById('texter-note');
    const note = noteInput.value.trim();
    if (!note) {
      showAlert('texter-alert', 'Please enter text before sharing.', 'warning');
      return;
    }

    const targetUsernameRaw = window.prompt('Enter username (without @gmail.com) to share with:');
    const targetUsername = (targetUsernameRaw || '').trim().toLowerCase();
    if (!targetUsername) {
      showAlert('texter-alert', 'Share cancelled. Username is required.', 'warning');
      return;
    }
    if (targetUsername.includes('@')) {
      showAlert('texter-alert', 'Please enter only the username part, without @gmail.com.', 'warning');
      return;
    }
    // Username is derived from Google email prefix in app.js.
    if (!/^[a-z0-9._-]+$/.test(targetUsername)) {
      showAlert('texter-alert', 'Username can only contain letters, numbers, dots, underscores, and hyphens.', 'warning');
      return;
    }
    if (targetUsername === window.AppState.username) {
      showAlert('texter-alert', 'Enter another username to share this note.', 'warning');
      return;
    }

    const timestamp = getKolkataTimestamp();
    const sharedEntry = { note, timestamp, sharedBy: window.AppState.username };
    const ownerEntry = sharedEntry;

    try {
      await Promise.all([
        firebasePost(FIREBASE_PATH(), ownerEntry),
        firebasePost('texter_v2/' + targetUsername, sharedEntry)
      ]);
    } catch (e) {
      console.warn('Share failed:', e);
      showAlert('texter-alert', 'Could not share note right now. Please try again.', 'error');
      return;
    }

    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY())) || [];
    arr.unshift(ownerEntry);
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(arr));
    noteInput.value = '';
    showAlert('texter-alert', `Note shared with @${targetUsername} and saved.`, 'success');
    renderList(arr);
  }

  /* ── Load ─────────────────────────────────────────────────── */
  async function loadData() {
    const arr = await getEntries();
    renderList(arr);
  }

  async function copyThread() {
    clearAlert('texter-alert');
    if (!currentEntries.length) {
      showAlert('texter-alert', 'No notes to copy yet.', 'warning');
      return;
    }

    const threadText = currentEntries.map(function (entry, index) {
      const note = entry.note || '(empty note)';
      const timestamp = entry.timestamp || '';
      return '#' + (currentEntries.length - index) + ' [' + timestamp + ']\n' + note;
    }).join('\n\n---\n\n');

    try {
      await copyTextToClipboard(threadText);
      showAlert('texter-alert', 'Thread copied to clipboard!', 'success');
    } catch (e) {
      console.warn('Copy failed:', e);
      showAlert('texter-alert', 'Could not copy thread. Please try again.', 'error');
    }
  }

  /* ── Render list ──────────────────────────────────────────── */
  function renderList(arr) {
    const container = document.getElementById('texter-list');
    if (!container) return;
    currentEntries = Array.isArray(arr) ? arr : [];

    if (currentEntries.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No notes yet. Write your first one above!</p>
      </div>`;
      return;
    }

    container.innerHTML = `<div class="entry-list">` +
      currentEntries.map(function (e, i) {
        return `<div class="entry-card">
          <div class="entry-meta">
            <span class="badge badge-neutral">#${currentEntries.length - i}</span>
            <span class="entry-time">🕐 ${e.timestamp || ''}</span>
          </div>
          <div class="entry-message texter-content">${renderMarkdown(e.note)}</div>
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

  /* ── Simple markdown renderer ────────────────────────────── */
  function renderMarkdown(str) {
    var text = String(str);

    // Extract fenced code blocks first (```...```)
    var codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, function (_, code) {
      var idx = codeBlocks.length;
      codeBlocks.push('<pre class="texter-code-block"><code>' + escapeHtml(code.replace(/^\n/, '')) + '</code></pre>');
      return '\x00CODE' + idx + '\x00';
    });

    // Extract inline code (`...`)
    var inlineCodes = [];
    text = text.replace(/`([^`\n]+)`/g, function (_, code) {
      var idx = inlineCodes.length;
      inlineCodes.push('<code class="texter-inline-code">' + escapeHtml(code) + '</code>');
      return '\x00INLINE' + idx + '\x00';
    });

    // Escape remaining HTML
    text = escapeHtml(text);

    // Bold **text**
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    text = text.replace(/\*([\s\S]+?)\*/g, '<em>$1</em>');

    // Convert newlines to <br>
    text = text.replace(/\n/g, '<br>');

    // Restore code blocks and inline codes
    text = text.replace(/\x00CODE(\d+)\x00/g, function (_, idx) {
      return codeBlocks[parseInt(idx, 10)];
    });
    text = text.replace(/\x00INLINE(\d+)\x00/g, function (_, idx) {
      return inlineCodes[parseInt(idx, 10)];
    });

    return text;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', 'true');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (!copied) throw new Error('execCommand copy failed');
  }

  return { render, submit, loadData };
}());

