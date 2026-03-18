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

/* ── CRUD helpers ──────────────────────────────────────────── */

async function firebaseGet(path) {
  const snapshot = await db.ref(path).once('value');
  return snapshot.val();
}

async function firebasePost(path, data) {
  const ref = await db.ref(path).push(data);
  return { name: ref.key };
}

async function firebasePut(path, data) {
  await db.ref(path).set(data);
  return true;
}

async function firebasePatch(path, data) {
  await db.ref(path).update(data);
  return true;
}

async function firebaseDelete(path) {
  await db.ref(path).remove();
  return true;
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

  const separator = '=========================';
  const type   = entry.credit > 0 ? 'CREDIT' : 'DEBIT';
  const amount = entry.credit > 0 ? getINR(entry.credit) : getINR(entry.debit);

  let text = separator + '\n';
  text += '                     <b>' + type + '</b>\n';
  text += separator + '\n';
  text += 'ID:  <b>' + entry.transaction_id + '</b>\n';
  text += (entry.credit > 0 ? 'Credit' : 'Debit') + ':  <b>' + amount + '</b>\n';
  text += 'Details:  <b>' + escapeHtml(entry.details) + '</b>\n';
  text += 'Mode:  <b>' + escapeHtml(entry.mode) + '</b>\n';
  text += 'Cash Balance:  <b>' + getINR(entry.cash) + '</b>\n';
  text += 'Bank Balance:  <b>' + getINR(entry.bank) + '</b>\n\n';
  text += 'Total Balance:  <b>' + getINR(entry.total) + '</b>';

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
      console.warn('Telegram API error:', await res.text());
    }
  } catch (e) {
    console.warn('Telegram notification failed:', e);
  }
}

