// js/tasbih.js
// Digital tasbih (dhikr counter) module.
// Modes: "standard" (SubhanAllah → Alhamdulillah → Allahu Akbar) and "custom".

const TasbihModule = (function () {
  'use strict';

  const STORAGE_KEY   = () => 'tasbih_' + window.AppState.username;
  const FIREBASE_PATH = () => 'tasbih/' + window.AppState.username;

  /* ── Standard dhikr phases ────────────────────────────────── */
  const PHASES = [
    { arabic: 'سُبْحَانَ ٱللَّٰهِ',    label: 'SubhanAllah',   count: 33 },
    { arabic: 'ٱلْحَمْدُ لِلَّٰهِ',     label: 'Alhamdulillah', count: 33 },
    { arabic: 'ٱللَّٰهُ أَكْبَرُ',       label: 'Allahu Akbar',  count: 34 },
  ];
  const TOTAL_STANDARD = PHASES.reduce((s, p) => s + p.count, 0); // 100

  let _mode       = 'standard'; // 'standard' | 'custom'
  let _count       = 0;
  let _phase       = 0;         // index into PHASES (standard mode)
  let _customTarget = 100;      // editable target for custom mode

  /* ── Helpers ──────────────────────────────────────────────── */
  function currentPhase() { return PHASES[_phase]; }

  /** Return { phaseIndex, offsetInPhase } from global _count */
  function phaseInfo() {
    let remaining = _count;
    for (let i = 0; i < PHASES.length; i++) {
      if (remaining < PHASES[i].count) return { idx: i, offset: remaining };
      remaining -= PHASES[i].count;
    }
    return { idx: PHASES.length - 1, offset: PHASES[PHASES.length - 1].count };
  }

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>📿 Tasbih</h2>
          <p>Digital dhikr counter</p>
        </div>

        <!-- Mode tabs -->
        <div class="tasbih-mode-tabs">
          <button class="tasbih-mode-tab active" data-mode="standard">Standard (33-33-34)</button>
          <button class="tasbih-mode-tab" data-mode="custom">Custom Counter</button>
        </div>

        <div class="card">
          <div class="tasbih-wrap">
            <!-- Phase label (standard mode) -->
            <div class="tasbih-phase" id="tasbih-phase"></div>

            <div class="tasbih-count" id="tasbih-count">0</div>

            <div class="tasbih-progress">
              <div class="tasbih-progress-bar" id="tasbih-bar" style="width:0%"></div>
            </div>

            <div class="text-muted text-sm" id="tasbih-progress-label">0 / 33</div>

            <button class="tasbih-btn" id="tasbih-tap" aria-label="Tap to count"></button>

            <div class="completion-msg" id="tasbih-complete">
              🎉 Tasbih complete!
            </div>

            <!-- Custom mode: target input -->
            <div class="tasbih-target-row hidden" id="tasbih-custom-row">
              <label for="tasbih-custom-target" style="margin-bottom:0">Target:</label>
              <input type="number" id="tasbih-custom-target" value="100" min="1" max="99999"
                style="width:90px;" />
              <button class="btn btn-secondary btn-sm" id="tasbih-set-custom">Set</button>
            </div>

            <button class="btn btn-danger btn-sm" id="tasbih-reset">Reset</button>
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
              <div class="stat-value" id="tasbih-stat-target">100</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Remaining</div>
              <div class="stat-value" id="tasbih-stat-remaining">100</div>
            </div>
          </div>
        </div>
      </div>
    `;

    loadState();
    applyModeUI();
    updateUI();

    document.getElementById('tasbih-tap').addEventListener('click', tap);
    document.getElementById('tasbih-reset').addEventListener('click', reset);
    document.getElementById('tasbih-set-custom').addEventListener('click', setCustomTarget);

    document.querySelectorAll('.tasbih-mode-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchMode(btn.dataset.mode);
      });
    });

    document.addEventListener('keydown', handleKey);
  }

  /* ── Mode switching ───────────────────────────────────────── */
  function switchMode(mode) {
    _mode  = mode;
    _count = 0;
    _phase = 0;
    saveState();

    document.querySelectorAll('.tasbih-mode-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    applyModeUI();
    updateUI();
    document.getElementById('tasbih-complete').classList.remove('show');
  }

  function applyModeUI() {
    const customRow = document.getElementById('tasbih-custom-row');
    const phaseEl   = document.getElementById('tasbih-phase');

    document.querySelectorAll('.tasbih-mode-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === _mode);
    });

    if (_mode === 'custom') {
      customRow.classList.remove('hidden');
      phaseEl.classList.add('hidden');
      document.getElementById('tasbih-custom-target').value = _customTarget;
    } else {
      customRow.classList.add('hidden');
      phaseEl.classList.remove('hidden');
    }
  }

  /* ── Tap ──────────────────────────────────────────────────── */
  function tap() {
    const total = _mode === 'standard' ? TOTAL_STANDARD : _customTarget;
    if (_count >= total) return; // already done

    _count++;

    // Standard mode: detect phase transitions
    if (_mode === 'standard') {
      const info = phaseInfo();
      if (info.idx !== _phase) {
        _phase = info.idx;
        vibrate([100, 50, 100, 50, 100]); // triple-pulse for phase change
      }
    }

    saveState();
    updateUI();

    if (_count >= total) onComplete();
  }

  function handleKey(e) {
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
    _phase = 0;
    saveState();
    updateUI();
    document.getElementById('tasbih-complete').classList.remove('show');
  }

  /* ── Set custom target ────────────────────────────────────── */
  function setCustomTarget() {
    const val = parseInt(document.getElementById('tasbih-custom-target').value, 10);
    if (!val || val < 1) return;
    _customTarget = val;
    _count = 0;
    saveState();
    updateUI();
    document.getElementById('tasbih-complete').classList.remove('show');
  }

  /* ── Completion ───────────────────────────────────────────── */
  function onComplete() {
    document.getElementById('tasbih-complete').classList.add('show');
    vibrate([200, 100, 200, 100, 300]);

    const total = _mode === 'standard' ? TOTAL_STANDARD : _customTarget;
    const record = { count: _count, target: total, mode: _mode, timestamp: getKolkataTimestamp() };
    firebasePut(FIREBASE_PATH() + '/last', record)
      .catch(function (e) { console.warn('Firebase write failed:', e); });
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(getStateObj()));
  }

  /* ── Update UI ────────────────────────────────────────────── */
  function updateUI() {
    const countEl   = document.getElementById('tasbih-count');
    const barEl     = document.getElementById('tasbih-bar');
    const labelEl   = document.getElementById('tasbih-progress-label');
    const phaseEl   = document.getElementById('tasbih-phase');
    const tapBtn    = document.getElementById('tasbih-tap');
    const statCount = document.getElementById('tasbih-stat-count');
    const statTarget = document.getElementById('tasbih-stat-target');
    const statRem   = document.getElementById('tasbih-stat-remaining');

    if (!countEl) return;

    if (_mode === 'standard') {
      const info      = phaseInfo();
      const phase     = PHASES[info.idx];
      const pct       = Math.min(100, (_count / TOTAL_STANDARD) * 100);
      const remaining = TOTAL_STANDARD - _count;

      countEl.textContent    = info.offset;
      barEl.style.width      = pct + '%';
      labelEl.textContent    = info.offset + ' / ' + phase.count;
      phaseEl.innerHTML      = '<span class="tasbih-phase-arabic">' + phase.arabic + '</span>'
                             + '<span class="tasbih-phase-label">' + phase.label + '</span>';
      phaseEl.classList.remove('hidden');
      tapBtn.textContent     = phase.arabic;
      statCount.textContent  = _count;
      statTarget.textContent = TOTAL_STANDARD;
      statRem.textContent    = remaining;
    } else {
      const pct       = Math.min(100, (_count / _customTarget) * 100);
      const remaining = Math.max(0, _customTarget - _count);

      countEl.textContent    = _count;
      barEl.style.width      = pct + '%';
      labelEl.textContent    = _count + ' / ' + _customTarget;
      phaseEl.classList.add('hidden');
      tapBtn.textContent     = _count;
      statCount.textContent  = _count;
      statTarget.textContent = _customTarget;
      statRem.textContent    = remaining;
    }
  }

  /* ── Storage ──────────────────────────────────────────────── */
  function getStateObj() {
    return { mode: _mode, count: _count, phase: _phase, customTarget: _customTarget };
  }

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY()));
      if (s) {
        _mode         = s.mode         || 'standard';
        _count        = s.count        || 0;
        _phase        = s.phase        || 0;
        _customTarget = s.customTarget || 100;
      }
    } catch (_) { /* ignore */ }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(getStateObj()));
  }

  return { render };
}());


export { TasbihModule };
