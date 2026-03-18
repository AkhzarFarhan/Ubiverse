// js/ledger.js
// Personal finance ledger module.

window.LedgerModule = (function () {
  'use strict';

  const STORAGE_KEY   = () => 'ledger_' + window.AppState.username;
  const FIREBASE_PATH = () => 'LedgerV2/' + window.AppState.username;

  const MODES = ['Cash', 'PhonePe', 'PayTM', 'Other UPI', 'Card', 'Net Banking', 'CashToBank', 'BankToCash'];
  const MODE_SHORT = {
    'Cash': 'CA', 'PhonePe': 'PP', 'PayTM': 'UPI', 'Other UPI': 'UPI',
    'Card': 'CRD', 'Net Banking': 'NB', 'CashToBank': 'CTB', 'BankToCash': 'BTC',
  };

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>💰 Ledger</h2>
          <p>Personal finance tracker</p>
        </div>

        <form class="form-card" id="ledger-form" novalidate>
          <div class="card-title">New Transaction</div>
          <div id="ledger-alert"></div>

          <!-- Type toggle -->
          <div class="ledger-type-row">
            <button type="button" class="ledger-type-btn active" data-type="debit">− Debit</button>
            <button type="button" class="ledger-type-btn" data-type="credit">+ Credit</button>
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label for="ledger-amount">Amount (₹)</label>
            <input type="number" id="ledger-amount" placeholder="0.00" min="0" step="0.01" inputmode="decimal" />
          </div>

          <!-- Mode pills -->
          <div class="form-group">
            <label>Mode</label>
            <div class="ledger-mode-pills" id="ledger-mode-pills">
              ${MODES.map(function (m, i) {
                return '<button type="button" class="mode-pill' + (i === 0 ? ' active' : '') + '" data-mode="' + m + '">' + m + '</button>';
              }).join('')}
            </div>
          </div>

          <!-- Details -->
          <div class="form-group">
            <input type="text" id="ledger-details" placeholder="Details (e.g. Grocery shopping)" maxlength="200" />
          </div>

          <button type="submit" class="btn btn-primary btn-full">Add Transaction</button>
        </form>

        <div class="card">
          <div class="card-title" id="ledger-transactions-toggle" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span>📋 Transactions</span>
            <span id="ledger-transactions-chevron">▼</span>
          </div>
          <div id="ledger-transactions-content" style="display: none;">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Timestamp</th>
                    <th>Details</th>
                    <th>Mode</th>
                    <th class="td-num">Credit</th>
                    <th class="td-num">Debit</th>
                    <th class="td-num">Total Balance</th>
                  </tr>
                </thead>
                <tbody id="ledger-tbody"><tr><td colspan="7" class="text-muted text-sm text-center">Loading…</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">📅 Monthly Summary</div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th class="td-num">Credit</th>
                  <th class="td-num">Debit</th>
                  <th class="td-num">Net</th>
                </tr>
              </thead>
              <tbody id="ledger-monthly"></tbody>
            </table>
          </div>
        </div>

        <div class="stat-cards" id="ledger-balances">
          <div class="stat-card">
            <div class="stat-label">Cash Balance</div>
            <div class="stat-value" id="bal-cash">₹0.00</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Bank Balance</div>
            <div class="stat-value" id="bal-bank">₹0.00</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Balance</div>
            <div class="stat-value" id="bal-total">₹0.00</div>
          </div>
        </div>

        <div class="card" id="ledger-chart-card">
          <div class="card-title">📈 Financial Timeline</div>
          <div style="position: relative; height: 300px; width: 100%; margin-top: 1rem;" id="ledger-chart-wrapper">
            <div id="ledger-chart-loader" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.875rem;">Loading graph...</div>
            <canvas id="ledger-chart" style="display:none;"></canvas>
          </div>
        </div>

        <div class="stat-cards" id="ledger-lifetime-stats" style="margin-top: 1.5rem;">
          <div class="stat-card">
            <div class="stat-label">Lifetime Credits</div>
            <div class="stat-value td-positive" id="bal-lifetime-credits">₹0.00</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Lifetime Debits</div>
            <div class="stat-value td-negative" id="bal-lifetime-debits">₹0.00</div>
          </div>
        </div>
      </div>
    `;

    // Transactions collapsable toggle
    const txToggle = document.getElementById('ledger-transactions-toggle');
    if (txToggle) {
      txToggle.addEventListener('click', function() {
        const content = document.getElementById('ledger-transactions-content');
        const chevron = document.getElementById('ledger-transactions-chevron');
        if (content.style.display === 'none') {
          content.style.display = 'block';
          chevron.textContent = '▲';
        } else {
          content.style.display = 'none';
          chevron.textContent = '▼';
        }
      });
    }

    // Type toggle (credit / debit)
    document.querySelectorAll('.ledger-type-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.ledger-type-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    // Mode pills
    document.querySelectorAll('.mode-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.mode-pill').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    document.getElementById('ledger-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });

    loadData();
  }

  /* ── Submit ───────────────────────────────────────────────── */
  async function submit() {
    const amount  = parseFloat(document.getElementById('ledger-amount').value) || 0;
    const type    = document.querySelector('.ledger-type-btn.active').dataset.type;
    const modeBtn = document.querySelector('.mode-pill.active');
    const mode    = modeBtn ? modeBtn.dataset.mode : MODES[0];
    const details = document.getElementById('ledger-details').value.trim();

    const credit = type === 'credit' ? amount : 0;
    const debit  = type === 'debit'  ? amount : 0;

    // Validation
    if (amount <= 0) {
      showAlert('ledger-alert', 'Enter a valid amount.', 'error');
      return;
    }

    const arr = await getEntries();

    // Duplicate check against last transaction
    if (arr.length > 0) {
      const last = arr[arr.length - 1];
      if (last.credit === credit && last.debit === debit &&
          last.mode === mode && last.details === details) {
        showAlert('ledger-alert', 'Duplicate transaction detected. Matches the last entry.', 'warning');
        return;
      }
    }

    const entry = processLedgerData(arr, credit, debit, mode, details);
    arr.push(entry);

    // Write to Firebase and update local cache
    try {
      await firebasePost(FIREBASE_PATH(), entry);
    } catch (e) {
      console.warn('Firebase write failed:', e);
    }
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(arr));

    // Send Telegram notification
    sendTelegramForLedger(entry, window.AppState.username);

    document.getElementById('ledger-amount').value  = '';
    document.getElementById('ledger-details').value = '';

    clearAlert('ledger-alert');
    showAlert('ledger-alert', 'Transaction added!', 'success');
    updateBalances(arr);
    renderTable(arr);
    renderMonthly(arr);
    renderChartLazy(arr);
  }

  /* ── Process ledger entry ─────────────────────────────────── */
  function processLedgerData(arr, credit, debit, mode, details) {
    const prev = arr.length > 0 ? arr[arr.length - 1] : { cash: 0, bank: 0, total: 0, transaction_id: 0 };
    let cash  = prev.cash;
    let bank  = prev.bank;
    let total = prev.total;

    const amount = credit > 0 ? credit : debit;

    if (mode === 'CashToBank') {
      cash  -= amount;
      bank  += amount;
    } else if (mode === 'BankToCash') {
      cash  += amount;
      bank  -= amount;
    } else if (mode === 'Cash') {
      if (credit > 0) { cash += credit; total += credit; }
      else             { cash -= debit;  total -= debit; }
    } else {
      // Bank/UPI modes
      if (credit > 0) { bank += credit; total += credit; }
      else             { bank -= debit;  total -= debit; }
    }

    return {
      transaction_id: prev.transaction_id + 1,
      credit,
      debit,
      mode,
      details,
      cash:  parseFloat(cash.toFixed(2)),
      bank:  parseFloat(bank.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      timestamp: getKolkataTimestamp(),
    };
  }

  /* ── Load ─────────────────────────────────────────────────── */
  async function loadData() {
    const arr = await getEntries();

    if (arr.length === 0) {
      const tbody = document.getElementById('ledger-tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-muted text-sm text-center">No transactions yet.</td></tr>';
      return;
    }

    updateBalances(arr);
    renderTable(arr);
    renderMonthly(arr);
    renderChartLazy(arr);
  }

  /* ── Update balance cards ─────────────────────────────────── */
  function updateBalances(arr) {
    if (arr.length === 0) return;
    const last = arr[arr.length - 1];
    document.getElementById('bal-cash').textContent  = getINR(last.cash);
    document.getElementById('bal-bank').textContent  = getINR(last.bank);
    document.getElementById('bal-total').textContent = getINR(last.total);

      let lifetimeCredit = 0;
      let lifetimeDebit = 0;
      arr.forEach(function(e) {
        if (e.credit) lifetimeCredit += parseFloat(e.credit);
        if (e.debit) lifetimeDebit += parseFloat(e.debit);
      });
      
      const lcEl = document.getElementById('bal-lifetime-credits');
      const ldEl = document.getElementById('bal-lifetime-debits');
      if (lcEl) lcEl.textContent = getINR(lifetimeCredit);
      if (ldEl) ldEl.textContent = getINR(lifetimeDebit);
    }

  /* ── Transaction table ────────────────────────────────────── */
  function renderTable(arr) {
    const tbody = document.getElementById('ledger-tbody');
    if (!tbody) return;

    tbody.innerHTML = arr.slice().reverse().map(function (e) {
      const dateOnly = (e.timestamp || '').split(' ')[0] || e.timestamp;
      return `<tr>
        <td>${e.transaction_id}</td>
        <td style="white-space:nowrap;font-size:.75rem">${dateOnly}</td>
        <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(e.details || '')}">${escapeHtml(e.details || '')}</td>
        <td><span class="badge badge-neutral">${MODE_SHORT[e.mode] || e.mode}</span></td>
        <td class="td-num td-positive">${e.credit > 0 ? getINR(e.credit) : '—'}</td>
        <td class="td-num td-negative">${e.debit  > 0 ? getINR(e.debit)  : '—'}</td>
        <td class="td-num font-bold">${getINR(e.total)}</td>
      </tr>`;
    }).join('');
  }

  /* ── Monthly summary ──────────────────────────────────────── */
  function renderMonthly(arr) {
    const tbody = document.getElementById('ledger-monthly');
    if (!tbody) return;

    const months = {};
    arr.forEach(function (e) {
      // Parse month from timestamp "DD-MM-YYYY ..."
      const parts = (e.timestamp || '').split(' ')[0].split('-');
      const key   = parts.length === 3 ? parts[1] + '-' + parts[2] : 'Unknown';
      if (!months[key]) months[key] = { credit: 0, debit: 0 };
      months[key].credit += (e.credit || 0);
      months[key].debit  += (e.debit  || 0);
    });

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    tbody.innerHTML = Object.keys(months).sort(function (a, b) {
      if (a === 'Unknown') return 1;
      if (b === 'Unknown') return -1;

      const [am, ay] = a.split('-').map(function (x) { return parseInt(x, 10); });
      const [bm, by] = b.split('-').map(function (x) { return parseInt(x, 10); });

      if (ay !== by) return ay - by;
      return am - bm;
    }).map(function (k) {
      if (k === 'Unknown') {
        const netUnknown = months[k].credit - months[k].debit;
        return `<tr>
        <td>Unknown</td>
        <td class="td-num td-positive">${getINR(months[k].credit)}</td>
        <td class="td-num td-negative">${getINR(months[k].debit)}</td>
        <td class="td-num ${netUnknown >= 0 ? 'td-positive' : 'td-negative'} font-bold">${getINR(netUnknown)}</td>
      </tr>`;
      }

      const [mm, yyyy] = k.split('-');
      const name = monthNames[parseInt(mm, 10) - 1] + ' ' + yyyy;
      const net  = months[k].credit - months[k].debit;
      return `<tr>
        <td>${name}</td>
        <td class="td-num td-positive">${getINR(months[k].credit)}</td>
        <td class="td-num td-negative">${getINR(months[k].debit)}</td>
        <td class="td-num ${net >= 0 ? 'td-positive' : 'td-negative'} font-bold">${getINR(net)}</td>
      </tr>`;
    }).join('');
  }

  /* ── Timeline Chart ───────────────────────────────────────── */
  let chartInstance = null;
  let chartDataCache = null;
  let chartIntersectionObserver = null;

  function renderChartLazy(arr) {
    chartDataCache = arr;
    const card = document.getElementById('ledger-chart-card');
    if (!card) return;

    if (window.IntersectionObserver) {
      if (chartIntersectionObserver) chartIntersectionObserver.disconnect();
      chartIntersectionObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          chartIntersectionObserver.disconnect();
          loadChartJsAndDraw();
        }
      }, { rootMargin: '0px 0px 200px 0px' });
      chartIntersectionObserver.observe(card);
    } else {
      loadChartJsAndDraw();
    }
  }

  function loadChartJsAndDraw() {
    if (window.Chart) {
      drawChart();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
      drawChart();
    };
    document.head.appendChild(script);
  }

  function drawChart() {
    if (!window.Chart || !chartDataCache) return;
    const canvas = document.getElementById('ledger-chart');
    if (!canvas) return;
    const loader = document.getElementById('ledger-chart-loader');
    if (loader) loader.style.display = 'none';
    canvas.style.display = 'block';

    const months = {};
    chartDataCache.forEach(function (e) {
      const parts = (e.timestamp || '').split(' ')[0].split('-');
      const key   = parts.length === 3 ? parts[1] + '-' + parts[2] : 'Unknown';
      if (key === 'Unknown') return;
      if (!months[key]) months[key] = { credit: 0, debit: 0 };
      months[key].credit += (e.credit || 0);
      months[key].debit  += (e.debit  || 0);
    });

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    // Sort chronologically
    const sortedKeys = Object.keys(months).sort(function (a, b) {
      const [am, ay] = a.split('-').map(function (x) { return parseInt(x, 10); });
      const [bm, by] = b.split('-').map(function (x) { return parseInt(x, 10); });
      if (ay !== by) return ay - by;
      return am - bm;
    });

    const labels = sortedKeys.map(function(k) {
      const [mm, yyyy] = k.split('-');
      return monthNames[parseInt(mm, 10) - 1] + ' ' + (yyyy.substring(2));
    });

    const creditData = sortedKeys.map(function(k) { return months[k].credit; });
    const debitData = sortedKeys.map(function(k) { return months[k].debit; });

    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // Check if body has a dark theme or light theme to adjust text colors
    const isDark = document.body.style.backgroundColor !== '#ffffff' && document.body.style.backgroundColor !== 'white' && !document.body.classList.contains('light-theme');
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Credit',
            data: creditData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: 'Debit',
            data: debitData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { color: textColor } }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
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

