// js/utils.js
// Shared utility helpers used across all modules.

window.AppState = { username: '', displayName: '', password: '' };

/* ── Math ──────────────────────────────────────────────────── */

/** Safe division — returns 0 when denominator is 0. */
function DIV(x, y) {
  if (!y || y === 0) return 0;
  return x / y;
}

/* ── Formatting ────────────────────────────────────────────── */

/**
 * Format a number as Indian Rupee string: ₹1,23,456
 * Last group = 3 digits, remaining groups = 2 digits.
 */
function getINR(n) {
  if (n == null || isNaN(n)) return '₹0';
  const num = parseFloat(n);
  const isNeg = num < 0;
  const abs = Math.abs(num).toFixed(2);
  const [intPart, decPart] = abs.split('.');

  let result = '';
  if (intPart.length <= 3) {
    result = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest   = intPart.slice(0, -3);
    const groups  = [];
    for (let i = rest.length; i > 0; i -= 2) {
      groups.unshift(rest.slice(Math.max(0, i - 2), i));
    }
    result = groups.join(',') + ',' + last3;
  }

  return (isNeg ? '-₹' : '₹') + result + '.' + decPart;
}

/**
 * Returns current date-time in Asia/Kolkata timezone.
 * Format: "DD-MM-YYYY HH:MM:SS AM/PM"
 */
function getKolkataTimestamp() {
  const now = new Date();
  const opts = {
    timeZone: 'Asia/Kolkata',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
    hour:     '2-digit',
    minute:   '2-digit',
    second:   '2-digit',
    hour12:   true,
  };
  const parts = new Intl.DateTimeFormat('en-IN', opts).formatToParts(now);
  const p = {};
  parts.forEach(({ type, value }) => { p[type] = value; });
  return `${p.day}-${p.month}-${p.year} ${p.hour}:${p.minute}:${p.second} ${p.dayPeriod.toUpperCase()}`;
}

/** Format a plain date string (YYYY-MM-DD) to "DD MMM YYYY". */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Validation ────────────────────────────────────────────── */

/** Returns true if username contains only alphanumeric characters. */
function sanitizeUsername(u) {
  return /^[a-zA-Z0-9]+$/.test(u);
}

/* ── Alerts ────────────────────────────────────────────────── */

/**
 * Inject a styled alert into the element with the given id.
 * @param {string} containerId - id of the container element
 * @param {string} message
 * @param {'success'|'error'|'warning'} type
 */
function showAlert(containerId, message, type) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  // Build DOM nodes so message text is set via textContent (prevents XSS).
  const wrapper = document.createElement('div');
  wrapper.className = 'alert alert-' + type;
  wrapper.setAttribute('role', 'alert');
  const iconSpan = document.createElement('span');
  iconSpan.textContent = icons[type] || '';
  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;
  wrapper.appendChild(iconSpan);
  wrapper.appendChild(msgSpan);
  el.innerHTML = '';
  el.appendChild(wrapper);
}

/** Clear any alert in the container. */
function clearAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

  /**
   * Display a floating global toast notification.
   * @param {string} message 
   * @param {'success'|'error'|'warning'} type 
   */
  function showToast(message, type = 'error') {
    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = 'alert alert-' + type;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.minWidth = '250px';
    toast.style.margin = '0';
    toast.style.transition = 'opacity 0.3s ease';

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icons[type] || '';

    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4500);
  }
 /* Returns [] when input is null/undefined.
 */
function objectToArray(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.values(obj);
}
