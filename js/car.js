// js/car.js
// Vehicle log module — fuel, service, odometer tracking.

window.CarModule = (function () {
  'use strict';

  const STORAGE_KEY = () => 'car_' + window.AppState.username;

  const SAMPLE_DATA = [
    {
      entry_id: 1, date: '2025-04-01', odometer: 12000, distanceTraveled: 0,
      fuelVolume: 0, totalCost: 0, pricePerUnit: 0, fullTank: false, station: '',
      serviceCost: 0, serviceDetails: '',
      drivingMode: '', notes: 'Initial odometer reading',
      mileage: null, entryType: 'odometer', timestamp: '01-04-2025 09:00:00 AM',
    },
    {
      entry_id: 2, date: '2025-04-10', odometer: 12320, distanceTraveled: 320,
      fuelVolume: 22, totalCost: 2376, pricePerUnit: 108, fullTank: true, station: 'HP Majestic',
      serviceCost: 0, serviceDetails: '',
      drivingMode: 'City', notes: '',
      mileage: null, entryType: 'fuel', timestamp: '10-04-2025 07:15:00 AM',
    },
    {
      entry_id: 3, date: '2025-04-22', odometer: 12700, distanceTraveled: 380,
      fuelVolume: 28, totalCost: 3024, pricePerUnit: 108, fullTank: true, station: 'Indian Oil',
      serviceCost: 0, serviceDetails: '',
      drivingMode: 'Mixed', notes: '',
      mileage: 17.27, entryType: 'fuel', timestamp: '22-04-2025 08:00:00 AM',
    },
    {
      entry_id: 4, date: '2025-05-05', odometer: 13050, distanceTraveled: 350,
      fuelVolume: 0, totalCost: 0, pricePerUnit: 0, fullTank: false, station: '',
      serviceCost: 2500, serviceDetails: 'Oil change + air filter',
      drivingMode: '', notes: 'Routine service',
      mileage: null, entryType: 'service', timestamp: '05-05-2025 10:30:00 AM',
    },
    {
      entry_id: 5, date: '2025-05-20', odometer: 13420, distanceTraveled: 370,
      fuelVolume: 25, totalCost: 2700, pricePerUnit: 108, fullTank: true, station: 'HP Majestic',
      serviceCost: 0, serviceDetails: '',
      drivingMode: 'Highway', notes: 'Weekend trip',
      mileage: null, entryType: 'fuel', timestamp: '20-05-2025 06:45:00 AM',
    },
    {
      entry_id: 6, date: '2025-06-02', odometer: 13800, distanceTraveled: 380,
      fuelVolume: 26, totalCost: 2808, pricePerUnit: 108, fullTank: true, station: 'BPCL',
      serviceCost: 0, serviceDetails: '',
      drivingMode: 'City', notes: '',
      mileage: 14.62, entryType: 'fuel', timestamp: '02-06-2025 07:10:00 AM',
    },
  ];

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>🚗 Car Log</h2>
          <p>Track fuel, service, and mileage</p>
        </div>

        <!-- Summary cards -->
        <div class="stat-cards" id="car-stats">
          <div class="stat-card">
            <div class="stat-label">Total Distance</div>
            <div class="stat-value" id="cs-dist">0 km</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Fuel</div>
            <div class="stat-value" id="cs-fuel">0 L</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Fuel Cost</div>
            <div class="stat-value" id="cs-fcost">₹0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Service Cost</div>
            <div class="stat-value" id="cs-scost">₹0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Avg Mileage</div>
            <div class="stat-value" id="cs-mileage">— km/L</div>
          </div>
        </div>

        <form class="form-card" id="car-form" novalidate>
          <div class="card-title">New Entry</div>
          <div id="car-alert"></div>

          <div class="form-row">
            <div class="form-group">
              <label for="car-date">Date <span style="color:var(--color-danger)">*</span></label>
              <input type="date" id="car-date" />
            </div>
            <div class="form-group">
              <label for="car-odometer">Odometer (km) <span style="color:var(--color-danger)">*</span></label>
              <input type="number" id="car-odometer" placeholder="13500" min="0" step="1" />
            </div>
          </div>

          <!-- Fuel section toggle -->
          <div class="collapsible-header" id="fuel-toggle">
            <span>⛽ Fuel Entry (optional)</span>
            <span id="fuel-toggle-icon">▶</span>
          </div>
          <div class="collapsible-body" id="fuel-section">
            <div class="form-row">
              <div class="form-group">
                <label for="car-fuel-vol">Fuel Volume (L)</label>
                <input type="number" id="car-fuel-vol" value="0" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label for="car-fuel-cost">Total Cost (₹)</label>
                <input type="number" id="car-fuel-cost" value="0" min="0" step="0.01" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="car-price-per-unit">₹ / Litre</label>
                <input type="number" id="car-price-per-unit" value="0" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label for="car-station">Station</label>
                <input type="text" id="car-station" placeholder="e.g. HP Majestic" />
              </div>
            </div>
            <div class="toggle-row">
              <input type="checkbox" id="car-full-tank" />
              <label for="car-full-tank">Full tank</label>
            </div>
          </div>

          <hr class="divider" />

          <!-- Service section toggle -->
          <div class="collapsible-header" id="service-toggle">
            <span>🔧 Service Entry (optional)</span>
            <span id="service-toggle-icon">▶</span>
          </div>
          <div class="collapsible-body" id="service-section">
            <div class="form-row">
              <div class="form-group">
                <label for="car-svc-cost">Service Cost (₹)</label>
                <input type="number" id="car-svc-cost" value="0" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label for="car-svc-details">Service Details</label>
                <input type="text" id="car-svc-details" placeholder="e.g. Oil change, air filter" />
              </div>
            </div>
          </div>

          <hr class="divider" />

          <div class="form-row">
            <div class="form-group">
              <label for="car-mode">Driving Mode</label>
              <input type="text" id="car-mode" placeholder="e.g. City / Highway / Mixed" />
            </div>
            <div class="form-group">
              <label for="car-notes">Notes</label>
              <input type="text" id="car-notes" placeholder="Optional notes" maxlength="200" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary">Save Entry</button>
        </form>

        <div class="card">
          <div class="card-title">📋 Log</div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th class="td-num">Odo</th>
                  <th class="td-num">Dist</th>
                  <th>Mode</th>
                  <th class="td-num">Fuel L</th>
                  <th class="td-num">Fuel ₹</th>
                  <th class="td-num">₹/L</th>
                  <th class="td-num">km/L</th>
                  <th>Full</th>
                  <th>Station</th>
                  <th class="td-num">Svc ₹</th>
                  <th>Service</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody id="car-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Set today's date as default
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('car-date').value = today;

    // Collapsible toggles
    setupToggle('fuel-toggle', 'fuel-section', 'fuel-toggle-icon');
    setupToggle('service-toggle', 'service-section', 'service-toggle-icon');

    document.getElementById('car-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });

    // Auto-calculate ₹/L
    ['car-fuel-vol', 'car-fuel-cost'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', autoPricePerUnit);
    });

    loadData();
  }

  function setupToggle(headerId, bodyId, iconId) {
    document.getElementById(headerId).addEventListener('click', function () {
      const body = document.getElementById(bodyId);
      const icon = document.getElementById(iconId);
      body.classList.toggle('open');
      icon.textContent = body.classList.contains('open') ? '▼' : '▶';
    });
  }

  function autoPricePerUnit() {
    const vol  = parseFloat(document.getElementById('car-fuel-vol').value)  || 0;
    const cost = parseFloat(document.getElementById('car-fuel-cost').value) || 0;
    if (vol > 0 && cost > 0) {
      document.getElementById('car-price-per-unit').value = (cost / vol).toFixed(2);
    }
  }

  /* ── Submit ───────────────────────────────────────────────── */
  function submit() {
    const date      = document.getElementById('car-date').value;
    const odometer  = parseFloat(document.getElementById('car-odometer').value) || 0;
    const fuelVol   = parseFloat(document.getElementById('car-fuel-vol').value)   || 0;
    const fuelCost  = parseFloat(document.getElementById('car-fuel-cost').value)  || 0;
    const ppu       = parseFloat(document.getElementById('car-price-per-unit').value) || 0;
    const fullTank  = document.getElementById('car-full-tank').checked;
    const station   = document.getElementById('car-station').value.trim();
    const svcCost   = parseFloat(document.getElementById('car-svc-cost').value)    || 0;
    const svcDetails = document.getElementById('car-svc-details').value.trim();
    const mode      = document.getElementById('car-mode').value.trim();
    const notes     = document.getElementById('car-notes').value.trim();

    // Validation
    if (!date) {
      showAlert('car-alert', 'Date is required.', 'error');
      return;
    }
    if (!odometer || odometer <= 0) {
      showAlert('car-alert', 'Odometer reading must be greater than 0.', 'error');
      return;
    }

    const arr = getEntries();
    const lastOdo = arr.length > 0 ? arr[arr.length - 1].odometer : 0;

    if (odometer < lastOdo) {
      showAlert('car-alert', `Odometer (${odometer}) cannot be less than last entry (${lastOdo}).`, 'error');
      return;
    }
    if ((fuelVol > 0 && fuelCost === 0) || (fuelVol === 0 && fuelCost > 0)) {
      showAlert('car-alert', 'If entering fuel, both volume and cost are required.', 'error');
      return;
    }

    clearAlert('car-alert');

    const entry = processCarData(arr, {
      date, odometer, fuelVol, fuelCost, ppu, fullTank, station,
      svcCost, svcDetails, mode, notes,
    });

    arr.push(entry);
    saveEntries(arr);

    // TODO: Firebase — POST to car/{username}.json
    firebasePost('car/' + window.AppState.username, entry)
      .then(function () { /* stub */ });

    showAlert('car-alert', 'Entry saved! 🚗', 'success');

    // Reset optional fields
    document.getElementById('car-fuel-vol').value   = 0;
    document.getElementById('car-fuel-cost').value  = 0;
    document.getElementById('car-price-per-unit').value = 0;
    document.getElementById('car-full-tank').checked    = false;
    document.getElementById('car-station').value    = '';
    document.getElementById('car-svc-cost').value   = 0;
    document.getElementById('car-svc-details').value = '';
    document.getElementById('car-mode').value       = '';
    document.getElementById('car-notes').value      = '';

    loadData();
  }

  /* ── Process car entry ────────────────────────────────────── */
  function processCarData(arr, raw) {
    const lastEntry = arr.length > 0 ? arr[arr.length - 1] : null;
    const lastOdo   = lastEntry ? lastEntry.odometer : 0;
    const distanceTraveled = raw.odometer - lastOdo;

    // Mileage: only if last entry was full tank AND distance > 0 AND fuel > 0
    let mileage = null;
    if (lastEntry && lastEntry.fullTank && distanceTraveled > 0 && raw.fuelVol > 0) {
      mileage = parseFloat(DIV(distanceTraveled, raw.fuelVol).toFixed(2));
    }

    // Entry type
    let entryType = 'odometer';
    if (raw.fuelVol > 0 && raw.svcCost > 0) entryType = 'fuel+service';
    else if (raw.fuelVol > 0)               entryType = 'fuel';
    else if (raw.svcCost > 0)               entryType = 'service';

    const prevId = lastEntry ? lastEntry.entry_id : 0;

    return {
      entry_id:          prevId + 1,
      date:              raw.date,
      odometer:          raw.odometer,
      distanceTraveled:  distanceTraveled,
      fuelVolume:        raw.fuelVol,
      totalCost:         raw.fuelCost,
      pricePerUnit:      raw.ppu,
      fullTank:          raw.fullTank,
      station:           raw.station,
      serviceCost:       raw.svcCost,
      serviceDetails:    raw.svcDetails,
      drivingMode:       raw.mode,
      notes:             raw.notes,
      mileage,
      entryType,
      timestamp:         getKolkataTimestamp(),
    };
  }

  /* ── Load ─────────────────────────────────────────────────── */
  function loadData() {
    let arr = getEntries();
    if (arr.length === 0) {
      arr = SAMPLE_DATA.slice();
      saveEntries(arr);
    }

    // Summary
    let totalDist = 0, totalFuelVol = 0, totalFuelCost = 0, totalSvcCost = 0;
    const mileages = [];

    arr.forEach(function (e) {
      totalDist     += (e.distanceTraveled || 0);
      totalFuelVol  += (e.fuelVolume  || 0);
      totalFuelCost += (e.totalCost   || 0);
      totalSvcCost  += (e.serviceCost || 0);
      if (e.mileage != null) mileages.push(e.mileage);
    });

    const avgMileage = mileages.length > 0
      ? (mileages.reduce(function (a, b) { return a + b; }, 0) / mileages.length).toFixed(2)
      : null;

    document.getElementById('cs-dist').textContent    = totalDist.toLocaleString() + ' km';
    document.getElementById('cs-fuel').textContent    = totalFuelVol.toFixed(1) + ' L';
    document.getElementById('cs-fcost').textContent   = getINR(totalFuelCost);
    document.getElementById('cs-scost').textContent   = getINR(totalSvcCost);
    document.getElementById('cs-mileage').textContent = avgMileage ? avgMileage + ' km/L' : '— km/L';

    renderTable(arr);
  }

  /* ── Table ────────────────────────────────────────────────── */
  function renderTable(arr) {
    const tbody = document.getElementById('car-tbody');
    if (!tbody) return;

    tbody.innerHTML = arr.slice().reverse().map(function (e) {
      const typeBadge = {
        fuel: 'badge-primary', service: 'badge-warning',
        'fuel+service': 'badge-success', odometer: 'badge-neutral',
      }[e.entryType] || 'badge-neutral';

      return `<tr>
        <td>${e.entry_id}</td>
        <td style="white-space:nowrap">${formatDate(e.date)}</td>
        <td><span class="badge ${typeBadge}">${e.entryType}</span></td>
        <td class="td-num">${e.odometer.toLocaleString()}</td>
        <td class="td-num">${e.distanceTraveled > 0 ? '+' + e.distanceTraveled : '—'}</td>
        <td>${escapeHtml(e.drivingMode || '')}</td>
        <td class="td-num">${e.fuelVolume  > 0 ? e.fuelVolume  : '—'}</td>
        <td class="td-num">${e.totalCost   > 0 ? getINR(e.totalCost) : '—'}</td>
        <td class="td-num">${e.pricePerUnit > 0 ? e.pricePerUnit.toFixed(1) : '—'}</td>
        <td class="td-num">${e.mileage != null ? e.mileage + ' km/L' : '—'}</td>
        <td class="td-center">${e.fullTank ? '✅' : ''}</td>
        <td>${escapeHtml(e.station || '')}</td>
        <td class="td-num">${e.serviceCost > 0 ? getINR(e.serviceCost) : '—'}</td>
        <td>${escapeHtml(e.serviceDetails || '')}</td>
        <td>${escapeHtml(e.notes || '')}</td>
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
