// js/care.js
// Parental monitoring dashboard — shows kid's phone activity from Firebase.

export const CareModule = { render };

const CARE_API = 'https://my-own-ubiverse-default-rtdb.firebaseio.com';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

let refreshTimer = null;
let countdownTimer = null;
let countdownSeconds = 0;
let currentDeviceId = null;
let currentFilter = 'today';

/* ── Package-name to readable-name mapping ──────────────── */
const APP_NAMES = {
  'com.android.chrome':     'Chrome',
  'com.android.settings':   'Settings',
  'com.android.launcher3':  'Launcher',
  'com.android.vending':    'Play Store',
  'com.android.dialer':     'Phone',
  'com.android.mms':        'Messages',
  'com.android.gallery3d':  'Gallery',
  'com.android.camera':     'Camera',
  'com.android.calculator2':'Calculator',
  'com.android.calendar':   'Calendar',
  'com.android.contacts':   'Contacts',
  'com.android.deskclock':  'Clock',
  'com.android.documentsui':'Files',
  'com.google.android.apps.maps':     'Google Maps',
  'com.google.android.youtube':       'YouTube',
  'com.google.android.gm':            'Gmail',
  'com.google.android.apps.photos':   'Google Photos',
  'com.google.android.apps.docs':     'Google Docs',
  'com.google.android.apps.messaging':'Google Messages',
  'com.google.android.googlequicksearchbox': 'Google',
  'com.google.android.apps.youtube.music':   'YouTube Music',
  'com.whatsapp':           'WhatsApp',
  'com.instagram.android':  'Instagram',
  'com.facebook.katana':    'Facebook',
  'com.facebook.orca':      'Messenger',
  'com.snapchat.android':   'Snapchat',
  'org.telegram.messenger': 'Telegram',
  'com.twitter.android':    'X (Twitter)',
  'com.zhiliaoapp.musically':'TikTok',
  'com.spotify.music':      'Spotify',
  'com.netflix.mediaclient':'Netflix',
  'com.amazon.mShop.android.shopping': 'Amazon',
  'in.amazon.mShop.android.shopping':  'Amazon India',
  'com.flipkart.android':   'Flipkart',
  'com.phonepe.app':        'PhonePe',
  'net.one97.paytm':        'Paytm',
  'com.google.android.apps.nbu.paisa.user': 'Google Pay',
  'com.care':               'Care (Monitor)',
  'com.miui.home':          'Mi Launcher',
  'com.miui.securitycenter':'Security',
  'com.vivo.launcher':      'Vivo Launcher',
};

/* ── App icon/emoji mapping ─────────────────────────────── */
const APP_ICONS = {
  'Chrome':       '🌐', 'YouTube':      '▶️', 'Instagram':    '📸',
  'WhatsApp':     '💬', 'Facebook':     '👤', 'Snapchat':     '👻',
  'TikTok':       '🎵', 'Telegram':     '✈️', 'X (Twitter)':  '🐦',
  'Spotify':      '🎧', 'Netflix':      '🎬', 'Gmail':        '📧',
  'Google Maps':  '🗺️', 'Messages':     '💬', 'Phone':        '📞',
  'Camera':       '📷', 'Gallery':      '🖼️', 'Settings':     '⚙️',
  'Play Store':   '🛒', 'Calculator':   '🔢', 'Calendar':     '📅',
  'Clock':        '⏰', 'Files':        '📂', 'Google':       '🔍',
  'Care (Monitor)': '👁️', 'Launcher':   '🏠', 'Mi Launcher':  '🏠',
  'Vivo Launcher':'🏠',
};

function getAppName(packageName) {
  if (APP_NAMES[packageName]) return APP_NAMES[packageName];
  // Extract last meaningful part: com.example.myapp → Myapp
  const parts = packageName.split('.');
  const last = parts[parts.length - 1] || packageName;
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function getAppIcon(appName) {
  return APP_ICONS[appName] || '📱';
}

/* ── Helpers ────────────────────────────────────────────── */

function timeAgo(epochMs) {
  if (!epochMs) return 'Unknown';
  const diff = Date.now() - epochMs;
  if (diff < 0) return 'Just now';
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return secs + 's ago';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ' + (mins % 60) + 'm ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return totalSec + 's';
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins < 60) return mins + 'm ' + secs + 's';
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return hrs + 'h ' + remMins + 'm';
}

function formatDurationLong(ms) {
  if (!ms || ms <= 0) return '0 seconds';
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return totalSec + ' second' + (totalSec !== 1 ? 's' : '');
  const mins = Math.floor(totalSec / 60);
  if (mins < 60) {
    const secs = totalSec % 60;
    return mins + ' min' + (mins !== 1 ? 's' : '') + (secs > 0 ? ' ' + secs + 's' : '');
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return hrs + ' hr' + (hrs !== 1 ? 's' : '') + (remMins > 0 ? ' ' + remMins + ' min' : '');
}

function formatTime(epochMs) {
  if (!epochMs) return '';
  return new Date(epochMs).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function formatDateTime(epochMs) {
  if (!epochMs) return '';
  return new Date(epochMs).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function getStartOfDay(offsetDays) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (offsetDays || 0));
  return d.getTime();
}

function getFilterStart() {
  switch (currentFilter) {
    case 'today':  return getStartOfDay(0);
    case '24h':    return Date.now() - 24 * 60 * 60 * 1000;
    case '7d':     return Date.now() - 7 * 24 * 60 * 60 * 1000;
    default:       return getStartOfDay(0);
  }
}

function extractDomain(url) {
  if (!url) return 'unknown';
  let cleaned = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  const slashIdx = cleaned.indexOf('/');
  if (slashIdx > 0) cleaned = cleaned.substring(0, slashIdx);
  return cleaned;
}

/* ── Status color logic ─────────────────────────────────── */

function getOnlineStatus(lastSeenAt) {
  if (!lastSeenAt) return { class: 'offline', label: 'Unknown', color: '#94a3b8' };
  const diff = Date.now() - lastSeenAt;
  if (diff < 10 * 60 * 1000)  return { class: 'online', label: 'Online', color: '#22c55e' };
  if (diff < 60 * 60 * 1000)  return { class: 'away', label: 'Recently active', color: '#f59e0b' };
  return { class: 'offline', label: 'Offline', color: '#ef4444' };
}

function getUsageLevel(totalMs) {
  if (totalMs > 4 * 60 * 60 * 1000) return { label: 'Excessive', color: '#ef4444', bg: '#fef2f2' };
  if (totalMs > 2 * 60 * 60 * 1000) return { label: 'High', color: '#f59e0b', bg: '#fffbeb' };
  if (totalMs > 1 * 60 * 60 * 1000) return { label: 'Moderate', color: '#3b82f6', bg: '#eff6ff' };
  return { label: 'Light', color: '#22c55e', bg: '#f0fdf4' };
}

/* ── Firebase REST fetch ────────────────────────────────── */

async function careApiFetch(path) {
  const url = CARE_API + path;
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error: ' + res.status);
  return res.json();
}

async function fetchDevice(deviceId) {
  return careApiFetch('/Care/' + deviceId + '/device.json');
}

async function fetchPermissions(deviceId) {
  return careApiFetch('/Care/' + deviceId + '/permissionStatus/current.json');
}

async function fetchEvents(deviceId, eventType) {
  // Fetch the latest 50 batches
  return careApiFetch('/Care/' + deviceId + '/events/' + eventType + '.json?orderBy="$key"&limitToLast=50');
}

/* ── Saved device ID ────────────────────────────────────── */

async function getSavedDeviceId() {
  const username = window.AppState.username;
  if (!username) return null;
  try {
    return await firebaseGet('ubiverse_care/' + username + '/deviceId');
  } catch (e) {
    console.warn('Could not read saved device ID:', e);
    return null;
  }
}

async function saveDeviceId(deviceId) {
  const username = window.AppState.username;
  if (!username) return;
  await firebasePut('ubiverse_care/' + username + '/deviceId', deviceId);
}

/* ── Main render ────────────────────────────────────────── */

async function render() {
  clearTimers();
  const app = document.getElementById('app');
  app.innerHTML = '<div class="care-loading"><div class="care-spinner"></div><p>Loading Care...</p></div>';

  try {
    const savedId = await getSavedDeviceId();
    if (savedId) {
      currentDeviceId = savedId;
      await renderDashboard();
    } else {
      renderSetup();
    }
  } catch (e) {
    console.error('Care render error:', e);
    renderSetup();
  }
}

/* ── Setup Screen ───────────────────────────────────────── */

function renderSetup() {
  clearTimers();
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h2>👁️ Care — Setup</h2>
        <p>Link your child's device to start monitoring</p>
      </div>
      <div class="care-setup-card">
        <div class="care-setup-icon">📱</div>
        <h3>Enter Device ID</h3>
        <p class="care-setup-desc">
          Open the <strong>Care</strong> app on your child's phone, go to <strong>Settings</strong>, 
          and copy the <strong>Device ID</strong> shown there.
        </p>
        <div class="form-group">
          <label for="care-device-input">Device ID</label>
          <input type="text" id="care-device-input" 
                 placeholder="e.g. eb33a11f-d7cd-4062-b57c-94fe32a7810a"
                 spellcheck="false" autocomplete="off" />
        </div>
        <div id="care-setup-alert"></div>
        <button class="btn btn-primary btn-full btn-lg" id="care-connect-btn">
          🔗 Connect Device
        </button>
      </div>
    </div>
  `;

  document.getElementById('care-connect-btn').addEventListener('click', handleConnect);
  document.getElementById('care-device-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleConnect();
  });
}

async function handleConnect() {
  const input = document.getElementById('care-device-input');
  const btn = document.getElementById('care-connect-btn');
  const deviceId = input.value.trim();

  if (!deviceId) {
    showAlert('care-setup-alert', 'Please enter a Device ID', 'warning');
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Verifying...';
  clearAlert('care-setup-alert');

  try {
    const device = await fetchDevice(deviceId);
    if (!device || !device.deviceId) {
      showAlert('care-setup-alert', 'Device not found. Please check the ID and try again.', 'error');
      btn.disabled = false;
      btn.textContent = '🔗 Connect Device';
      return;
    }

    await saveDeviceId(deviceId);
    currentDeviceId = deviceId;
    showAlert('care-setup-alert', 'Device connected: ' + (device.deviceName || device.model), 'success');
    
    setTimeout(async () => {
      await renderDashboard();
    }, 800);

  } catch (e) {
    showAlert('care-setup-alert', 'Connection failed: ' + e.message, 'error');
    btn.disabled = false;
    btn.textContent = '🔗 Connect Device';
  }
}

/* ── Dashboard ──────────────────────────────────────────── */

async function renderDashboard() {
  clearTimers();
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="fade-in">
      <div class="page-header care-header">
        <div class="care-header-top">
          <h2>👁️ Care</h2>
          <div class="care-header-actions">
            <button class="btn btn-sm btn-secondary" id="care-refresh-btn" title="Refresh now">🔄 Refresh</button>
            <button class="btn btn-sm btn-secondary" id="care-change-btn" title="Change device">⚙️</button>
          </div>
        </div>
        <div class="care-subheader">
          <span id="care-device-label" class="care-device-tag">Loading...</span>
          <span id="care-refresh-countdown" class="care-countdown"></span>
        </div>
      </div>

      <div class="care-filter-bar">
        <button class="care-filter-btn active" data-filter="today">Today</button>
        <button class="care-filter-btn" data-filter="24h">Last 24h</button>
        <button class="care-filter-btn" data-filter="7d">Last 7 days</button>
      </div>

      <div id="care-dashboard">
        <div class="care-loading"><div class="care-spinner"></div><p>Fetching activity data...</p></div>
      </div>
    </div>
  `;

  // Filter buttons
  document.querySelectorAll('.care-filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.care-filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      loadDashboardData();
    });
  });

  document.getElementById('care-refresh-btn').addEventListener('click', () => loadDashboardData());
  document.getElementById('care-change-btn').addEventListener('click', handleChangeDevice);

  await loadDashboardData();
  startAutoRefresh();
}

async function handleChangeDevice() {
  if (confirm('Disconnect this device and link a new one?')) {
    clearTimers();
    currentDeviceId = null;
    const username = window.AppState.username;
    if (username) {
      try { await firebaseDelete('ubiverse_care/' + username + '/deviceId'); } catch(e) {}
    }
    renderSetup();
  }
}

async function loadDashboardData() {
  const container = document.getElementById('care-dashboard');
  if (!container) return;

  try {
    // Fetch all data in parallel
    const [device, permissions, appUsage, urls, screenOn, screenOff, unlocks] = await Promise.all([
      fetchDevice(currentDeviceId),
      fetchPermissions(currentDeviceId).catch(() => null),
      fetchEvents(currentDeviceId, 'AppUsage').catch(() => null),
      fetchEvents(currentDeviceId, 'Url').catch(() => null),
      fetchEvents(currentDeviceId, 'ScreenOn').catch(() => null),
      fetchEvents(currentDeviceId, 'ScreenOff').catch(() => null),
      fetchEvents(currentDeviceId, 'Unlock').catch(() => null),
    ]);

    // Update device label
    const labelEl = document.getElementById('care-device-label');
    if (labelEl && device) {
      const status = getOnlineStatus(device.lastSeenAt);
      labelEl.innerHTML = `<span class="care-status-dot care-dot-${status.class}"></span>
        ${device.manufacturer || ''} ${device.model || device.deviceName || ''} · ${status.label} · ${timeAgo(device.lastSeenAt)}`;
    }

    // Filter batches by time
    const filterStart = getFilterStart();

    const filteredAppUsage = filterBatches(appUsage, filterStart);
    const filteredUrls     = filterBatches(urls, filterStart);
    const filteredScreenOn = filterBatches(screenOn, filterStart);
    const filteredScreenOff = filterBatches(screenOff, filterStart);
    const filteredUnlocks  = filterBatches(unlocks, filterStart);

    container.innerHTML = `
      ${renderDeviceCard(device)}
      ${renderPermissionsCard(permissions)}
      ${renderScreenActivityCard(filteredScreenOn, filteredScreenOff, filteredUnlocks)}
      ${renderAppUsageCard(filteredAppUsage)}
      ${renderUrlCard(filteredUrls)}
    `;

    // Wire up collapsible sections
    container.querySelectorAll('.care-collapsible-header').forEach(header => {
      header.addEventListener('click', function() {
        const body = this.nextElementSibling;
        const arrow = this.querySelector('.care-collapse-arrow');
        body.classList.toggle('open');
        if (arrow) arrow.textContent = body.classList.contains('open') ? '▾' : '▸';
      });
    });

  } catch (e) {
    console.error('Dashboard load error:', e);
    container.innerHTML = `
      <div class="card">
        <p style="color: var(--color-danger);">❌ Failed to load data: ${e.message}</p>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('care-refresh-btn').click()" style="margin-top: 0.5rem;">Retry</button>
      </div>`;
  }
}

function filterBatches(batchesObj, filterStart) {
  if (!batchesObj || typeof batchesObj !== 'object') return [];
  return Object.values(batchesObj).filter(b => {
    const ts = b.lastEventAt || b.uploadedAt || b.lastRecordedAt || 0;
    return ts >= filterStart;
  });
}

/* ── Device Card ────────────────────────────────────────── */

function renderDeviceCard(device) {
  if (!device) return '<div class="care-card"><p class="text-muted">📱 Device info unavailable</p></div>';

  const status = getOnlineStatus(device.lastSeenAt);
  const syncInterval = device.syncIntervalMillis
    ? formatDuration(device.syncIntervalMillis)
    : '5m';

  return `
    <div class="care-card care-device-card">
      <div class="care-card-header">
        <span class="care-card-icon">📱</span>
        <span class="care-card-title">Device Status</span>
        <span class="badge badge-${status.class === 'online' ? 'success' : status.class === 'away' ? 'warning' : 'danger'}">${status.label}</span>
      </div>
      <div class="care-device-grid">
        <div class="care-device-item">
          <span class="care-device-label">Name</span>
          <span class="care-device-value">${device.deviceName || '—'}</span>
        </div>
        <div class="care-device-item">
          <span class="care-device-label">Model</span>
          <span class="care-device-value">${device.model || '—'}</span>
        </div>
        <div class="care-device-item">
          <span class="care-device-label">Manufacturer</span>
          <span class="care-device-value">${device.manufacturer || '—'}</span>
        </div>
        <div class="care-device-item">
          <span class="care-device-label">Last Seen</span>
          <span class="care-device-value">${timeAgo(device.lastSeenAt)}</span>
        </div>
        <div class="care-device-item">
          <span class="care-device-label">Sync Interval</span>
          <span class="care-device-value">${syncInterval}</span>
        </div>
        <div class="care-device-item">
          <span class="care-device-label">Last Sync</span>
          <span class="care-device-value">${formatDateTime(device.lastSeenAt)}</span>
        </div>
      </div>
    </div>`;
}

/* ── Permissions Card ───────────────────────────────────── */

function renderPermissionsCard(perms) {
  if (!perms) return `
    <div class="care-card">
      <div class="care-card-header">
        <span class="care-card-icon">🔐</span>
        <span class="care-card-title">Permissions</span>
        <span class="badge badge-neutral">No data</span>
      </div>
      <p class="text-muted" style="font-size:.85rem;">Permission status not yet reported.</p>
    </div>`;

  const allGranted = perms.allRequiredGranted;
  const items = [
    { label: 'Usage Access',         granted: perms.usageAccessGranted },
    { label: 'Accessibility',        granted: perms.accessibilityGranted },
    { label: 'Notification Access',  granted: perms.notificationGranted },
    { label: 'Battery Optimization', granted: perms.batteryOptimizationIgnored },
  ];

  return `
    <div class="care-card">
      <div class="care-card-header">
        <span class="care-card-icon">🔐</span>
        <span class="care-card-title">Permissions</span>
        <span class="badge ${allGranted ? 'badge-success' : 'badge-danger'}">${allGranted ? 'All Granted' : 'Action Needed'}</span>
      </div>
      <div class="care-perm-list">
        ${items.map(it => `
          <div class="care-perm-row">
            <span class="care-perm-icon">${it.granted ? '✅' : '❌'}</span>
            <span class="care-perm-label">${it.label}</span>
            <span class="care-perm-status ${it.granted ? 'granted' : 'denied'}">${it.granted ? 'Granted' : 'Denied'}</span>
          </div>
        `).join('')}
      </div>
      ${perms.updatedAt ? `<p class="care-card-footer">Last checked: ${formatDateTime(perms.updatedAt)}</p>` : ''}
    </div>`;
}

/* ── Screen Activity Card ───────────────────────────────── */

function renderScreenActivityCard(screenOnBatches, screenOffBatches, unlockBatches) {
  let screenOnCount = 0, screenOffCount = 0, unlockCount = 0;

  screenOnBatches.forEach(b => { screenOnCount += (b.count || b.eventCount || 0); });
  screenOffBatches.forEach(b => { screenOffCount += (b.count || b.eventCount || 0); });
  unlockBatches.forEach(b => { unlockCount += (b.count || b.eventCount || 0); });

  const totalActivity = screenOnCount + unlockCount;

  return `
    <div class="care-card">
      <div class="care-card-header">
        <span class="care-card-icon">📱</span>
        <span class="care-card-title">Screen Activity</span>
      </div>
      <div class="care-screen-stats">
        <div class="care-screen-stat">
          <div class="care-screen-stat-value">${unlockCount}</div>
          <div class="care-screen-stat-label">Phone Unlocks</div>
          <div class="care-screen-stat-desc">Times the phone was picked up</div>
        </div>
        <div class="care-screen-stat">
          <div class="care-screen-stat-value">${screenOnCount}</div>
          <div class="care-screen-stat-label">Screen On</div>
          <div class="care-screen-stat-desc">Screen turned on</div>
        </div>
        <div class="care-screen-stat">
          <div class="care-screen-stat-value">${screenOffCount}</div>
          <div class="care-screen-stat-label">Screen Off</div>
          <div class="care-screen-stat-desc">Screen turned off</div>
        </div>
      </div>
      ${totalActivity === 0 ? '<p class="care-empty">No screen activity in this period.</p>' : ''}
    </div>`;
}

/* ── App Usage Card ─────────────────────────────────────── */

function renderAppUsageCard(batches) {
  if (!batches || batches.length === 0) {
    return `
      <div class="care-card">
        <div class="care-card-header">
          <span class="care-card-icon">📊</span>
          <span class="care-card-title">App Usage</span>
        </div>
        <p class="care-empty">No app usage data in this period.</p>
      </div>`;
  }

  // Aggregate across all batches
  const appMap = {};
  let totalDurationMs = 0;
  let totalSessions = 0;

  batches.forEach(batch => {
    if (!batch.apps) return;
    Object.values(batch.apps).forEach(app => {
      const name = getAppName(app.packageName);
      if (!appMap[name]) {
        appMap[name] = { packageName: app.packageName, name, totalMs: 0, sessions: 0 };
      }
      appMap[name].totalMs += (app.totalDurationMs || 0);
      appMap[name].sessions += (app.sessionCount || 0);
    });
    totalDurationMs += (batch.totalDurationMs || 0);
    totalSessions += (batch.sessionCount || 0);
  });

  // Sort by duration descending
  const sortedApps = Object.values(appMap).sort((a, b) => b.totalMs - a.totalMs);
  const maxDuration = sortedApps.length > 0 ? sortedApps[0].totalMs : 1;
  const usageLevel = getUsageLevel(totalDurationMs);

  // Exclude very short entries (< 1 second) from the bar chart
  const significantApps = sortedApps.filter(a => a.totalMs >= 1000);
  const topApps = significantApps.slice(0, 15);

  return `
    <div class="care-card">
      <div class="care-card-header">
        <span class="care-card-icon">📊</span>
        <span class="care-card-title">App Usage</span>
        <span class="badge" style="background:${usageLevel.bg};color:${usageLevel.color};">${usageLevel.label}</span>
      </div>
      <div class="care-usage-summary">
        <div class="care-usage-total">
          <span class="care-usage-total-value">${formatDurationLong(totalDurationMs)}</span>
          <span class="care-usage-total-label">Total Screen Time</span>
        </div>
        <div class="care-usage-meta">
          <span>${totalSessions} sessions</span>
          <span>${significantApps.length} apps</span>
        </div>
      </div>
      ${topApps.length > 0 ? `
        <div class="care-app-bars">
          ${topApps.map(app => {
            const pct = Math.max(3, Math.round((app.totalMs / maxDuration) * 100));
            const icon = getAppIcon(app.name);
            return `
              <div class="care-app-bar-row">
                <div class="care-app-bar-label">
                  <span class="care-app-icon">${icon}</span>
                  <span class="care-app-name">${app.name}</span>
                </div>
                <div class="care-app-bar-track">
                  <div class="care-app-bar-fill" style="width:${pct}%"></div>
                </div>
                <div class="care-app-bar-value">${formatDuration(app.totalMs)}</div>
              </div>`;
          }).join('')}
        </div>
      ` : ''}
      ${significantApps.length > 15 ? `<p class="care-card-footer">Showing top 15 of ${significantApps.length} apps</p>` : ''}
    </div>`;
}

/* ── URL Visits Card ────────────────────────────────────── */

function renderUrlCard(batches) {
  if (!batches || batches.length === 0) {
    return `
      <div class="care-card">
        <div class="care-card-header">
          <span class="care-card-icon">🌐</span>
          <span class="care-card-title">Websites Visited</span>
        </div>
        <p class="care-empty">No browsing data in this period.</p>
      </div>`;
  }

  // Aggregate visits by domain
  const domainMap = {};
  let totalVisits = 0;
  const allUrls = [];

  batches.forEach(batch => {
    if (!batch.visits) return;
    Object.values(batch.visits).forEach(visit => {
      const domain = extractDomain(visit.url);
      if (!domainMap[domain]) {
        domainMap[domain] = { domain, visits: 0, urls: new Set() };
      }
      domainMap[domain].visits += (visit.visitCount || 1);
      domainMap[domain].urls.add(visit.url);
      totalVisits += (visit.visitCount || 1);
      allUrls.push(visit);
    });
  });

  const sortedDomains = Object.values(domainMap).sort((a, b) => b.visits - a.visits);

  // Domain category tagging
  const flaggedDomains = {
    'instagram.com': { icon: '📸', tag: 'Social Media' },
    'facebook.com':  { icon: '👤', tag: 'Social Media' },
    'tiktok.com':    { icon: '🎵', tag: 'Social Media' },
    'twitter.com':   { icon: '🐦', tag: 'Social Media' },
    'x.com':         { icon: '🐦', tag: 'Social Media' },
    'snapchat.com':  { icon: '👻', tag: 'Social Media' },
    'youtube.com':   { icon: '▶️', tag: 'Video' },
    'reddit.com':    { icon: '🟧', tag: 'Social Media' },
    'pinterest.com': { icon: '📌', tag: 'Social Media' },
  };

  return `
    <div class="care-card">
      <div class="care-card-header">
        <span class="care-card-icon">🌐</span>
        <span class="care-card-title">Websites Visited</span>
        <span class="badge badge-neutral">${totalVisits} visits</span>
      </div>
      <div class="care-url-domains">
        ${sortedDomains.map(d => {
          const flag = flaggedDomains[d.domain];
          const urlList = Array.from(d.urls);
          const urlId = 'care-urls-' + d.domain.replace(/\./g, '_');
          return `
            <div class="care-domain-group">
              <div class="care-collapsible-header" data-target="${urlId}">
                <div class="care-domain-info">
                  <span class="care-domain-icon">${flag ? flag.icon : '🔗'}</span>
                  <span class="care-domain-name">${d.domain}</span>
                  ${flag ? `<span class="care-domain-tag">${flag.tag}</span>` : ''}
                </div>
                <div class="care-domain-meta">
                  <span class="care-domain-count">${d.visits} visit${d.visits !== 1 ? 's' : ''}</span>
                  <span class="care-collapse-arrow">▸</span>
                </div>
              </div>
              <div class="care-url-list" id="${urlId}">
                ${urlList.slice(0, 20).map(u => `<div class="care-url-item" title="${u}">↳ ${u.length > 60 ? u.substring(0, 57) + '...' : u}</div>`).join('')}
                ${urlList.length > 20 ? `<div class="care-url-more">+${urlList.length - 20} more URLs</div>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

/* ── Auto Refresh ───────────────────────────────────────── */

function startAutoRefresh() {
  countdownSeconds = REFRESH_INTERVAL / 1000;
  updateCountdown();

  countdownTimer = setInterval(() => {
    countdownSeconds--;
    if (countdownSeconds <= 0) countdownSeconds = REFRESH_INTERVAL / 1000;
    updateCountdown();
  }, 1000);

  refreshTimer = setInterval(() => {
    countdownSeconds = REFRESH_INTERVAL / 1000;
    loadDashboardData();
  }, REFRESH_INTERVAL);
}

function updateCountdown() {
  const el = document.getElementById('care-refresh-countdown');
  if (!el) return;
  const mins = Math.floor(countdownSeconds / 60);
  const secs = countdownSeconds % 60;
  el.textContent = 'Auto-refresh in ' + mins + ':' + String(secs).padStart(2, '0');
}

function clearTimers() {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
}
