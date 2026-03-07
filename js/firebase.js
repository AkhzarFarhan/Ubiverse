// js/firebase.js
// Firebase Realtime Database + Auth integration.

const firebaseConfig = {
  apiKey: "AIzaSyD_rHfoSDn2wjsBO3skLNiPagRa7-OWPus",
  authDomain: "my-own-ubiverse.firebaseapp.com",
  databaseURL: "https://my-own-ubiverse-default-rtdb.firebaseio.com",
  projectId: "my-own-ubiverse",
  storageBucket: "my-own-ubiverse.firebasestorage.app",
  messagingSenderId: "829161965482",
  appId: "1:829161965482:web:ef90332c1e681173268dd3"
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

async function firebaseSignIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

async function firebaseSignUp(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

function firebaseSignOut() {
  return auth.signOut();
}

function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

/* ── Telegram notifications ────────────────────────────────── */

const TG_BOT_TOKEN     = '934430337:AAHuy53OeyE__KKel3jsfZwGmciyrLSLScg';
const TG_LEDGER_CHAT_ID = '-376211740';

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

