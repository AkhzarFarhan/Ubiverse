// js/ledger.js
// Personal finance ledger module.

window.LedgerModule = (function () {
  'use strict';

  const STORAGE_KEY = () => 'ledger_' + window.AppState.username;

  const MODES = ['Cash', 'PhonePe', 'PayTM', 'Other UPI', 'Card', 'Net Banking', 'CashToBank', 'BankToCash'];
  const MODE_SHORT = {
    'Cash': 'CA', 'PhonePe': 'PP', 'PayTM': 'UPI', 'Other UPI': 'UPI',
    'Card': 'CRD', 'Net Banking': 'NB', 'CashToBank': 'CTB', 'BankToCash': 'BTC',
  };

  const SAMPLE_DATA = [
    { transaction_id: 1, credit: 50000, debit: 0, mode: 'Cash', details: 'Opening cash balance',
      cash: 50000, bank: 0, total: 50000, timestamp: '01-05-2025 10:00:00 AM' },
    { transaction_id: 2, credit: 100000, debit: 0, mode: 'Net Banking', details: 'Salary credited',
      cash: 50000, bank: 100000, total: 150000, timestamp: '01-05-2025 11:00:00 AM' },
    { transaction_id: 3, credit: 0, debit: 1200, mode: 'PhonePe', details: 'Grocery shopping',
      cash: 50000, bank: 98800, total: 148800, timestamp: '03-05-2025 06:30:00 PM' },
    { transaction_id: 4, credit: 0, debit: 500, mode: 'Cash', details: 'Auto fare',
      cash: 49500, bank: 98800, total: 148300, timestamp: '05-05-2025 09:15:00 AM' },
    { transaction_id: 5, credit: 0, debit: 0, mode: 'CashToBank', details: 'Deposit to bank',
      cash: 44500, bank: 103800, total: 148300, timestamp: '10-05-2025 02:00:00 PM',
      _transfer_amount: 5000 },
  ];

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>💰 Ledger</h2>
          <p>Personal finance tracker</p>
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

        <form class="form-card" id="ledger-form" novalidate>
          <div class="card-title">New Transaction</div>
          <div id="ledger-alert"></div>
          <div class="form-row">
            <div class="form-group">
              <label for="ledger-credit">Credit (₹)</label>
              <input type="number" id="ledger-credit" value="0" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label for="ledger-debit">Debit (₹)</label>
              <input type="number" id="ledger-debit" value="0" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="ledger-mode">Mode</label>
              <select id="ledger-mode">
                ${MODES.map(function (m) { return `<option value="${m}">${m}</option>`; }).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="ledger-details">Details</label>
              <input type="text" id="ledger-details" placeholder="e.g. Grocery shopping" maxlength="200" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Add Transaction</button>
        </form>

        <div class="card">
          <div class="card-title">📋 Transactions</div>
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
              <tbody id="ledger-tbody"></tbody>
            </table>
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
      </div>
    `;

    document.getElementById('ledger-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });

    loadData();
  }

  /* ── Submit ───────────────────────────────────────────────── */
  function submit() {
    const credit  = parseFloat(document.getElementById('ledger-credit').value)  || 0;
    const debit   = parseFloat(document.getElementById('ledger-debit').value)   || 0;
    const mode    = document.getElementById('ledger-mode').value;
    const details = document.getElementById('ledger-details').value.trim();

    // Validation
    if (credit === 0 && debit === 0) {
      showAlert('ledger-alert', 'Enter either a credit or debit amount.', 'error');
      return;
    }
    if (credit !== 0 && debit !== 0) {
      showAlert('ledger-alert', 'Only one of credit or debit can be non-zero.', 'error');
      return;
    }
    if (credit < 0 || debit < 0) {
      showAlert('ledger-alert', 'Amounts cannot be negative.', 'error');
      return;
    }

    const arr = getEntries();

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
    saveEntries(arr);

    // TODO: Firebase — POST to ledger/{username}.json
    firebasePost('ledger/' + window.AppState.username, entry)
      .then(function () { /* stub */ });

    // TODO: Telegram — send ledger notification

    document.getElementById('ledger-credit').value  = 0;
    document.getElementById('ledger-debit').value   = 0;
    document.getElementById('ledger-details').value = '';

    clearAlert('ledger-alert');
    showAlert('ledger-alert', 'Transaction added!', 'success');
    loadData();
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
  function loadData() {
    let arr = getEntries();
    if (arr.length === 0) {
      arr = SAMPLE_DATA.slice();
      saveEntries(arr);
    }

    // Update balance cards
    const last = arr[arr.length - 1];
    document.getElementById('bal-cash').textContent  = getINR(last.cash);
    document.getElementById('bal-bank').textContent  = getINR(last.bank);
    document.getElementById('bal-total').textContent = getINR(last.total);

    renderTable(arr);
    renderMonthly(arr);
  }

  /* ── Transaction table ────────────────────────────────────── */
  function renderTable(arr) {
    const tbody = document.getElementById('ledger-tbody');
    if (!tbody) return;

    tbody.innerHTML = arr.slice().reverse().map(function (e) {
      return `<tr>
        <td>${e.transaction_id}</td>
        <td style="white-space:nowrap;font-size:.8rem">${e.timestamp}</td>
        <td>${escapeHtml(e.details || '')}</td>
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

    tbody.innerHTML = Object.keys(months).sort().map(function (k) {
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
