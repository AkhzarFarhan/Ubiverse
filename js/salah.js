// js/salah.js
// Salah (prayer) tracking module with Chart.js visualization.

window.SalahModule = (function () {
  'use strict';

  const PRAYERS    = ['Fajr', 'Zohar', 'Asr', 'Maghrib', 'Isha'];
  const FARZ_RAKA  = [2, 4, 4, 3, 4];
  const STORAGE_KEY   = () => 'salah_' + window.AppState.username;
  const FIREBASE_PATH = () => 'salah/' + window.AppState.username;

  let _chartInstance = null;

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    if (_chartInstance) {
      _chartInstance.destroy();
      _chartInstance = null;
    }

    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>🕌 Salah Tracker</h2>
          <p>Track your daily prayer progress</p>
        </div>

        <form class="form-card" id="salah-form" novalidate>
          <div class="card-title">Log Progress</div>
          <div id="salah-alert"></div>
          <p class="text-sm text-muted mb-sm">
            Enter the number of <strong>rakah you prayed today</strong> per prayer.
            Leave 0 if unchanged.
          </p>
          <div class="form-row">
            ${PRAYERS.map(function (p, i) {
              return `<div class="form-group">
                <label for="salah-input-${i}">${p} (Farz: ${FARZ_RAKA[i]})</label>
                <input type="number" id="salah-input-${i}" value="0" min="0" />
              </div>`;
            }).join('')}
          </div>
          <div class="form-group">
            <label for="salah-note">Update Note</label>
            <input type="text" id="salah-note" placeholder="e.g. Made up 2 Zohar prayers" maxlength="200" />
          </div>
          <button type="submit" class="btn btn-primary">Save Update</button>
        </form>

        <div class="stat-cards" id="salah-stats"></div>

        <div class="chart-container">
          <div class="card-title">📈 Rate of Change (Δ Rakah / Entry)</div>
          <canvas id="salah-chart"></canvas>
        </div>

        <div class="card">
          <div class="card-title">📋 History</div>
          <div class="table-wrapper">
            <table id="salah-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Note</th>
                  ${PRAYERS.map(function (p) { return '<th>' + p + '</th>'; }).join('')}
                </tr>
              </thead>
              <tbody id="salah-tbody"><tr><td colspan="${PRAYERS.length + 2}" class="text-muted text-sm text-center">Loading…</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('salah-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });

    loadData();
  }

  /* ── Submit ───────────────────────────────────────────────── */
  async function submit() {
    const newValues = PRAYERS.map(function (_, i) {
      return parseInt(document.getElementById('salah-input-' + i).value, 10) || 0;
    });
    const note = document.getElementById('salah-note').value.trim();

    const arr = await getEntries();
    const last = arr.length > 0 ? arr[arr.length - 1].prayers : Array(PRAYERS.length).fill(0);

    // For each prayer: if new_value != 0 → updated = existing + new - farz; else keep
    const updated = PRAYERS.map(function (_, i) {
      if (newValues[i] !== 0) {
        return last[i] + newValues[i] - FARZ_RAKA[i];
      }
      return last[i];
    });

    const today = new Date().toISOString().slice(0, 10);
    const entry = {
      prayers:   updated,
      note:      note || '',
      timestamp: getKolkataTimestamp(),
      date:      today,
    };

    try {
      await firebasePost(FIREBASE_PATH(), entry);
    } catch (e) {
      console.warn('Firebase write failed:', e);
    }
    arr.push(entry);
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(arr));

    PRAYERS.forEach(function (_, i) {
      document.getElementById('salah-input-' + i).value = 0;
    });
    document.getElementById('salah-note').value = '';

    showAlert('salah-alert', 'Progress saved! 🕌', 'success');
    renderStats(arr);
    renderChart(arr);
    renderTable(arr);
  }

  /* ── Load ─────────────────────────────────────────────────── */
  async function loadData() {
    const arr = await getEntries();

    if (arr.length === 0) {
      const tbody = document.getElementById('salah-tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="${PRAYERS.length + 2}" class="text-muted text-sm text-center">No entries yet.</td></tr>`;
      return;
    }

    renderStats(arr);
    renderChart(arr);
    renderTable(arr);
  }

  /* ── Stats ────────────────────────────────────────────────── */
  function renderStats(arr) {
    const container = document.getElementById('salah-stats');
    if (!container) return;

    const firstRow = arr[0].prayers;
    const lastRow  = arr[arr.length - 1].prayers;
    const timeTaken = arr.length - 1;

    const predicted = predictDaysLeft(firstRow, lastRow, timeTaken);
    const actual    = actualDaysLeft(lastRow);

    let html = '';

    PRAYERS.forEach(function (p, i) {
      html += `<div class="stat-card">
        <div class="stat-label">${p} remaining</div>
        <div class="stat-value ${lastRow[i] < 0 ? 'negative' : 'positive'}">${lastRow[i]}</div>
      </div>`;
    });

    container.innerHTML = html;

    // Prediction section
    const predSection = document.createElement('div');
    predSection.className = 'card mb-md';
    predSection.style.gridColumn = '1 / -1';
    predSection.innerHTML = `
      <div class="card-title">🔮 Predictions</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-top:.5rem">
        ${PRAYERS.map(function (p, i) {
          return `<div class="stat-card">
            <div class="stat-label">${p} predicted</div>
            <div class="stat-value">${predicted[i]}d</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${p} actual</div>
            <div class="stat-value">${actual[i]}d</div>
          </div>`;
        }).join('')}
      </div>`;

    // Replace or insert below stats
    const existingPred = document.getElementById('salah-prediction');
    if (existingPred) existingPred.remove();
    predSection.id = 'salah-prediction';
    container.after(predSection);
  }

  /* ── Chart ────────────────────────────────────────────────── */
  function renderChart(arr) {
    const canvas = document.getElementById('salah-chart');
    if (!canvas) return;

    if (_chartInstance) {
      _chartInstance.destroy();
      _chartInstance = null;
    }

    if (arr.length < 2) {
      canvas.parentElement.innerHTML += '<p class="text-muted text-sm text-center">Need at least 2 entries for chart.</p>';
      return;
    }

    // Compute rate of change (delta) per entry
    const labels  = [];
    const datasets = PRAYERS.map(function (p) {
      return { label: p, data: [], fill: false, tension: .35 };
    });

    const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4'];
    datasets.forEach(function (d, i) { d.borderColor = COLORS[i]; d.backgroundColor = COLORS[i]; });

    for (let idx = 1; idx < arr.length; idx++) {
      labels.push('Entry ' + (idx + 1));
      PRAYERS.forEach(function (_, i) {
        datasets[i].data.push(arr[idx].prayers[i] - arr[idx - 1].prayers[i]);
      });
    }

    _chartInstance = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          y: {
            title: { display: true, text: 'Δ Rakah' },
            grid: { color: '#e2e8f0' },
          },
          x: { grid: { color: '#e2e8f0' } },
        },
      },
    });
  }

  /* ── Table ────────────────────────────────────────────────── */
  function renderTable(arr) {
    const tbody = document.getElementById('salah-tbody');
    if (!tbody) return;

    tbody.innerHTML = arr.map(function (e, i) {
      return `<tr>
        <td>Day ${i + 1}</td>
        <td>${escapeHtml(e.note || '')}</td>
        ${e.prayers.map(function (v) {
          const cls = v < 0 ? 'td-negative' : v > 0 ? 'td-positive' : '';
          return `<td class="td-num ${cls}">${v}</td>`;
        }).join('')}
      </tr>`;
    }).join('');
  }

  /* ── Predictions ──────────────────────────────────────────── */
  function predictDaysLeft(firstRow, lastRow, timeTaken) {
    return PRAYERS.map(function (_, i) {
      const delta = Math.abs(lastRow[i] - firstRow[i]);
      if (delta === 0) return lastRow[i] === 0 ? 0 : '∞';
      // Rate of improvement per day × remaining rakah debt
      const ratePerDay     = DIV(timeTaken, delta);
      const remainingDebt  = Math.abs(lastRow[i]);
      return Math.ceil(ratePerDay * remainingDebt);
    });
  }

  function actualDaysLeft(lastRow) {
    return PRAYERS.map(function (_, i) {
      return Math.ceil(Math.abs(DIV(lastRow[i], FARZ_RAKA[i])));
    });
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

