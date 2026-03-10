// js/tasbih.js
// Digital tasbih (dhikr counter) module.

window.TasbihModule = (function () {
  'use strict';

  const STORAGE_KEY   = () => 'tasbih_' + window.AppState.username;
  const FIREBASE_PATH = () => 'tasbih/' + window.AppState.username;

  let _count  = 0;
  let _target = 33;

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>📿 Tasbih</h2>
          <p>Digital dhikr counter</p>
        </div>

        <div class="card">
          <div class="tasbih-wrap">
            <div class="tasbih-count" id="tasbih-count">0</div>

            <div class="tasbih-progress">
              <div class="tasbih-progress-bar" id="tasbih-bar" style="width:0%"></div>
            </div>

            <div class="text-muted text-sm" id="tasbih-progress-label">0 / 33</div>

            <button class="tasbih-btn" id="tasbih-tap" aria-label="Tap to count">
              ﷽
            </button>

            <div class="completion-msg" id="tasbih-complete">
              🎉 SubhanAllah! Target reached!
            </div>

            <div class="tasbih-target-row">
              <label for="tasbih-target" style="margin-bottom:0">Target:</label>
              <input type="number" id="tasbih-target" value="33" min="1" max="10000"
                style="width:80px;" />
              <button class="btn btn-secondary btn-sm" id="tasbih-set-target">Set</button>
              <button class="btn btn-danger btn-sm" id="tasbih-reset">Reset</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Session Info</div>
          <div class="stat-cards" id="tasbih-stats">
            <div class="stat-card">
              <div class="stat-label">Count</div>
              <div class="stat-value" id="tasbih-stat-count">0</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Target</div>
              <div class="stat-value" id="tasbih-stat-target">33</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Remaining</div>
              <div class="stat-value" id="tasbih-stat-remaining">33</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Completions</div>
              <div class="stat-value" id="tasbih-stat-completions">0</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Restore saved state
    loadState();
    updateUI();

    document.getElementById('tasbih-tap').addEventListener('click', tap);
    document.getElementById('tasbih-reset').addEventListener('click', reset);
    document.getElementById('tasbih-set-target').addEventListener('click', setTarget);

    // Allow keyboard spacebar / Enter as tap
    document.addEventListener('keydown', handleKey);
  }

  /* ── Tap ──────────────────────────────────────────────────── */
  function tap() {
    _count++;
    saveState();
    updateUI();

    if (_count === _target) {
      onComplete();
    }
  }

  function handleKey(e) {
    // Only active when tasbih page is visible
    if (!document.getElementById('tasbih-tap')) {
      document.removeEventListener('keydown', handleKey);
      return;
    }
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      tap();
    }
  }

  /* ── Reset ────────────────────────────────────────────────── */
  function reset() {
    _count = 0;
    saveState();
    updateUI();
    document.getElementById('tasbih-complete').classList.remove('show');
  }

  /* ── Set target ───────────────────────────────────────────── */
  function setTarget() {
    const val = parseInt(document.getElementById('tasbih-target').value, 10);
    if (!val || val < 1) return;
    _target = val;
    _count  = 0;
    saveState();
    updateUI();
    document.getElementById('tasbih-complete').classList.remove('show');
  }

  /* ── Completion ───────────────────────────────────────────── */
  function onComplete() {
    document.getElementById('tasbih-complete').classList.add('show');
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    const record = { count: _count, target: _target, timestamp: getKolkataTimestamp() };
    firebasePut(FIREBASE_PATH() + '/last', record)
      .catch(function (e) { console.warn('Firebase write failed:', e); });
    localStorage.setItem(STORAGE_KEY(), JSON.stringify({ count: _count, target: _target }));
  }

  /* ── Update UI ────────────────────────────────────────────── */
  function updateUI() {
    const countEl    = document.getElementById('tasbih-count');
    const barEl      = document.getElementById('tasbih-bar');
    const labelEl    = document.getElementById('tasbih-progress-label');
    const statCount  = document.getElementById('tasbih-stat-count');
    const statTarget = document.getElementById('tasbih-stat-target');
    const statRem    = document.getElementById('tasbih-stat-remaining');
    const statComp   = document.getElementById('tasbih-stat-completions');

    if (!countEl) return;

    const pct         = Math.min(100, (_count / _target) * 100);
    const posInCycle  = _count % _target;
    const cyclePos    = (posInCycle === 0 && _count > 0) ? _target : posInCycle;
    const remaining   = Math.max(0, _target - cyclePos);
    const completions = Math.floor(_count / _target);

    countEl.textContent   = _count;
    barEl.style.width     = pct + '%';
    labelEl.textContent   = cyclePos + ' / ' + _target;
    statCount.textContent  = _count;
    statTarget.textContent = _target;
    statRem.textContent    = remaining;
    statComp.textContent   = completions;

    document.getElementById('tasbih-target').value = _target;
  }

  /* ── Storage ──────────────────────────────────────────────── */
  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY()));
      if (s) {
        _count  = s.count  || 0;
        _target = s.target || 33;
      }
    } catch (_) { /* ignore */ }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY(), JSON.stringify({ count: _count, target: _target }));
  }

  return { render };
}());

