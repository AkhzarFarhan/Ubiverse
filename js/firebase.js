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

async function sendTelegramForLedger(entry, username) {
  if (username !== 'akhzarfarhan') return;

  const separator = '=========================';
  const type   = entry.credit > 0 ? 'CREDIT' : 'DEBIT';
  const amount = entry.credit > 0 ? getINR(entry.credit) : getINR(entry.debit);

  let text = separator + '\n';
  text += '                     *' + type + '*\n';
  text += separator + '\n';
  text += 'ID:  *' + entry.transaction_id + '*\n';
  text += (entry.credit > 0 ? 'Credit' : 'Debit') + ':  *' + amount + '*\n';
  text += 'Details:  *' + entry.details + '*\n';
  text += 'Mode:  *' + entry.mode + '*\n';
  text += 'Cash Balance:  *' + getINR(entry.cash) + '*\n';
  text += 'Bank Balance:  *' + getINR(entry.bank) + '*\n\n';
  text += 'Total Balance:  *' + getINR(entry.total) + '*';

  const url = 'https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage';
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_LEDGER_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.warn('Telegram notification failed:', e);
  }
}

