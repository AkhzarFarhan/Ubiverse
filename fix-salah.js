const fs = require('fs');
let code = fs.readFileSync('js/salah.js', 'utf8');

const consolidateFunc = `
  function consolidateByDate(arr) {
    if (!arr || arr.length === 0) return [];
    const consolidated = [];
    let currentKey = arr[0].date || arr[0].timestamp || 'Unknown';
    let currentEntry = arr[0];
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i].date || arr[i].timestamp || \`Unknown-\${i}\`;
      if (key === currentKey) {
        currentEntry = arr[i];
      } else {
        consolidated.push(currentEntry);
        currentKey = key;
        currentEntry = arr[i];
      }
    }
    consolidated.push(currentEntry);
    return consolidated;
  }
`;

// Insert the consolidate function before prediction helpers
code = code.replace('/* ── Predictions ──────────────────────────────────────────── */', consolidateFunc + '\n  /* ── Predictions ──────────────────────────────────────────── */');

// Update renderTable
const tableOld = `
    tbody.innerHTML = arr.map(function (e, i) {
      const displayDate = e.date ? formatDate(e.date) : \`Day \${i + 1}\`;
`;
const tableNew = `
    const consolidated = consolidateByDate(arr);
    tbody.innerHTML = consolidated.map(function (e, i) {
      const displayDate = e.date ? formatDate(e.date) : \`Day \${i + 1}\`;
`;
code = code.replace(tableOld, tableNew);

// Update renderChart
const chartOld = `
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
      const labelStr = arr[idx].date ? formatDate(arr[idx].date) : 'Entry ' + (idx + 1);
      labels.push(labelStr);
      PRAYERS.forEach(function (_, i) {
        datasets[i].data.push(arr[idx].prayers[i] - arr[idx - 1].prayers[i]);
      });
    }
`;

const chartNew = `
    const consolidated = consolidateByDate(arr);
    const msgEl = document.getElementById('salah-chart-msg');
    
    if (consolidated.length < 2) {
      if (!msgEl) {
        canvas.parentElement.insertAdjacentHTML('beforeend', '<p id="salah-chart-msg" class="text-muted text-sm text-center">Need at least 2 days of entries for chart.</p>');
      }
      return;
    } else if (msgEl) {
      msgEl.remove();
    }

    // Compute rate of change (delta) per day
    const labels  = [];
    const datasets = PRAYERS.map(function (p) {
      return { label: p, data: [], fill: false, tension: .35 };
    });

    const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4'];
    datasets.forEach(function (d, i) { d.borderColor = COLORS[i]; d.backgroundColor = COLORS[i]; });

    for (let idx = 1; idx < consolidated.length; idx++) {
      const labelStr = consolidated[idx].date ? formatDate(consolidated[idx].date) : 'Day ' + (idx + 1);
      labels.push(labelStr);
      PRAYERS.forEach(function (_, i) {
        datasets[i].data.push(consolidated[idx].prayers[i] - consolidated[idx - 1].prayers[i]);
      });
    }
`;
code = code.replace(chartOld, chartNew.trim() + '\n');

fs.writeFileSync('js/salah.js', code);
