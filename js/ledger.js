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
              <tbody id="ledger-tbody"><tr><td colspan="7" class="text-muted text-sm text-center">Loading…</td></tr></tbody>
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
  }

  /* ── Update balance cards ─────────────────────────────────── */
  function updateBalances(arr) {
    if (arr.length === 0) return;
    const last = arr[arr.length - 1];
    document.getElementById('bal-cash').textContent  = getINR(last.cash);
    document.getElementById('bal-bank').textContent  = getINR(last.bank);
    document.getElementById('bal-total').textContent = getINR(last.total);
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

