// js/firebase.js
// Firebase Realtime Database + Auth integration.
// Credentials are loaded from js/env.js (see js/env.js.example).

const env = window.__ENV__ || {};

if (!env.FIREBASE_API_KEY) {
  throw new Error(
    'Missing environment config. ' +
    'Copy js/env.js.example to js/env.js and fill in your credentials.'
  );
}

const firebaseConfig = {
  apiKey:            env.FIREBASE_API_KEY,
  authDomain:        env.FIREBASE_AUTH_DOMAIN,
  databaseURL:       env.FIREBASE_DATABASE_URL,
  projectId:         env.FIREBASE_PROJECT_ID,
  storageBucket:     env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.database();

/* ── CRUD helpers (offline-aware via SyncQueue) ───────────── */

async function firebaseGet(path) {
  if (window.SyncQueue) {
    if (!window.SyncQueue.isOnline()) {
      const err = new Error('Offline');
      err.code = 'OFFLINE';
      throw err;
    }
    if (window.SyncQueue.pendingCount() > 0) {
      try {
        await window.SyncQueue.flush();
      } catch (e) {
        console.warn('Sync queue flush failed before read:', e);
      }
    }
  }

  try {
    const snapshot = await db.ref(path).once('value');
    return snapshot.val();
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase read error: ' + (e.message || e), 'error');
    throw e;
  }
}

/**
 * Post data to Firebase. Queues automatically if offline or slow.
 * Returns { synced: boolean, key?: string, syncId?: string }.
 * Never throws — offline writes are queued for later.
 */
async function firebasePost(path, data, options) {
  if (window.SyncQueue) {
    return window.SyncQueue.tryOrQueue('post', path, data, options);
  }
  // Fallback if sync.js not loaded yet
  try {
    const ref = await db.ref(path).push(data);
    return { synced: true, key: ref.key };
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase write error: ' + (e.message || e), 'error');
    return { synced: false };
  }
}

/**
 * Set data at Firebase path. Queues automatically if offline or slow.
 * Never throws — offline writes are queued for later.
 */
async function firebasePut(path, data, options) {
  if (window.SyncQueue) {
    return window.SyncQueue.tryOrQueue('put', path, data, options);
  }
  try {
    await db.ref(path).set(data);
    return { synced: true };
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase write error: ' + (e.message || e), 'error');
    return { synced: false };
  }
}

/**
 * Update data at Firebase path. Queues automatically if offline or slow.
 * Never throws — offline writes are queued for later.
 */
async function firebasePatch(path, data, options) {
  if (window.SyncQueue) {
    return window.SyncQueue.tryOrQueue('patch', path, data, options);
  }
  try {
    await db.ref(path).update(data);
    return { synced: true };
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase update error: ' + (e.message || e), 'error');
    return { synced: false };
  }
}

/**
 * Delete data at Firebase path. Queues automatically if offline or slow.
 * Never throws — offline writes are queued for later.
 */
async function firebaseDelete(path, options) {
  if (window.SyncQueue) {
    return window.SyncQueue.tryOrQueue('delete', path, null, options);
  }
  try {
    await db.ref(path).remove();
    return { synced: true };
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase delete error: ' + (e.message || e), 'error');
    return { synced: false };
  }
}

/* ── Direct CRUD helpers (bypass queue — for multi-user writes) ── */

async function firebasePostDirect(path, data) {
  try {
    const ref = await db.ref(path).push(data);
    return { name: ref.key };
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase write error: ' + (e.message || e), 'error');
    throw e;
  }
}

async function firebasePutDirect(path, data) {
  try {
    await db.ref(path).set(data);
    return true;
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase write error: ' + (e.message || e), 'error');
    throw e;
  }
}

async function firebasePatchDirect(path, data) {
  try {
    await db.ref(path).update(data);
    return true;
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase update error: ' + (e.message || e), 'error');
    throw e;
  }
}

async function firebaseDeleteDirect(path) {
  try {
    await db.ref(path).remove();
    return true;
  } catch (e) {
    if (typeof window.showToast === 'function') window.showToast('Firebase delete error: ' + (e.message || e), 'error');
    throw e;
  }
}

/* ── Auth helpers ──────────────────────────────────────────── */

const googleProvider = new firebase.auth.GoogleAuthProvider();

async function firebaseSignInWithGoogle() {
  return auth.signInWithPopup(googleProvider);
}

function firebaseSignOut() {
  return auth.signOut();
}

function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

/* ── Telegram notifications ────────────────────────────────── */

const TG_BOT_TOKEN      = env.TG_BOT_TOKEN     || '';
const TG_LEDGER_CHAT_ID = env.TG_LEDGER_CHAT_ID || '';
const TG_USERNAME       = env.TG_USERNAME       || '';

async function sendTelegramForLedger(entry, username) {
  if (TG_USERNAME && username !== TG_USERNAME) return;
  if (!TG_BOT_TOKEN || !TG_LEDGER_CHAT_ID) return;

  const escapeHtml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const getIntINR = (val) => getINR(val).replace(/\.\d{2}$/, '');

  const separator = '=========================';
  const type   = entry.credit > 0 ? 'CREDIT' : 'DEBIT';
  const amount = entry.credit > 0 ? getIntINR(entry.credit) : getIntINR(entry.debit);

  let text = separator + '\n';
  text += '                     <b>' + type + '</b>\n';
  text += separator + '\n';
  text += 'ID:  <b>' + entry.transaction_id + '</b>\n';
  text += (entry.credit > 0 ? 'Credit' : 'Debit') + ':  <b>' + amount + '</b>\n';
  text += 'Details:  <b>' + escapeHtml(entry.details) + '</b>\n';
  text += 'Mode:  <b>' + escapeHtml(entry.mode) + '</b>\n';
  text += 'Cash Balance:  <b>' + getIntINR(entry.cash) + '</b>\n';
  text += 'Bank Balance:  <b>' + getIntINR(entry.bank) + '</b>\n\n';
  text += 'Total Balance:  <b>' + getIntINR(entry.total) + '</b>';

  const url = 'https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_LEDGER_CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn('Telegram API error:', errText);
      if (typeof window.showToast === 'function') window.showToast('Telegram API error', 'error');
    }
  } catch (e) {
    console.warn('Telegram notification failed:', e);
    if (typeof window.showToast === 'function') window.showToast('Telegram dispatch failed: ' + (e.message || e), 'error');
  }
}
