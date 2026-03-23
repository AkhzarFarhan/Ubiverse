const fs = require('fs');

let code = fs.readFileSync('js/salah.js', 'utf8');

const tableOld = `
  /* ── Table ────────────────────────────────────────────────── */
  function renderTable(arr) {
    const tbody = document.getElementById('salah-tbody');
    if (!tbody) return;

    tbody.innerHTML = arr.map(function (e, i) {
      const displayDate = e.date ? formatDate(e.date) : \`Day \${i + 1}\`;
`;
const tableNew = `
  /* ── Table ────────────────────────────────────────────────── */
  function renderTable(arr) {
    const tbody = document.getElementById('salah-tbody');
    if (!tbody) return;

    const consolidated = consolidateByDate(arr);
    tbody.innerHTML = consolidated.map(function (e, i) {
      const displayDate = e.date ? formatDate(e.date) : \`Day \${i + 1}\`;
`;

code = code.replace(tableOld, tableNew);

const chartRegex = /if \(arr\.length < 2\) \{[\s\S]*?const labels\s*=\s*\[\];[\s\S]*?for \(let idx = 1; idx < arr\.length; idx\+\+\) \{[\s\S]*?\}/;
const chartReplace = `
    const consolidated = consolidateByDate(arr);
    if (consolidated.length < 2) {
      canvas.parentElement.innerHTML += '<p class="text-muted text-sm text-center">Need at least 2 days of entries for chart.</p>';
      return;
    }

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
code = code.replace(chartRegex, chartReplace.trim());

fs.writeFileSync('js/salah.js', code);
