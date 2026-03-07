# 🌐 Ubiverse

Your personal all-in-one dashboard — a mobile-first, single-page web application built with **vanilla HTML/CSS/JS**.

## Features

Seven integrated personal-productivity modules, each migrated from the Python/Firebase backend:

| Module | Description |
|--------|-------------|
| 📅 **Daily** | Daily check-in with message and mood rating (1–10) |
| 🏋️ **Gym** | Workout log — track gym sessions with notes |
| ✏️ **Texter** | Quick notes / text snippets |
| 📿 **Tasbih** | Prayer-bead (dhikr) counter with configurable target |
| 🕌 **Salah** | Prayer-debt tracker with Chart.js rate-of-change visualization and completion predictions |
| 💰 **Ledger** | Personal finance ledger — Cash/Bank balances, INR formatting, monthly summary |
| 🚗 **Car** | Vehicle log — fuel fills, service records, mileage calculation |

## Architecture

```
Ubiverse/
├── index.html              # SPA shell — header, sidebar nav, login screen
├── database.rules.json     # Firebase Security Rules reference
├── css/
│   └── style.css           # Mobile-first styles, CSS custom properties, indigo theme
└── js/
    ├── firebase.js         # Firebase SDK init, CRUD helpers, Auth helpers, Telegram
    ├── utils.js            # DIV(), getINR(), getKolkataTimestamp(), showAlert(), …
    ├── app.js              # Hash-based SPA router + Firebase Auth login flow
    ├── daily.js            # Daily journal module
    ├── gym.js              # Gym tracker module
    ├── texter.js           # Notes/texter module
    ├── tasbih.js           # Tasbih counter module
    ├── salah.js            # Salah prayer tracker module (Chart.js)
    ├── ledger.js           # Ledger finance module
    └── car.js              # Car tracker module
```

## Running Locally

No build step required. Serve the root directory with any static file server:

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

## Technology

- **Vanilla HTML/CSS/JS** — no frameworks, no build tools
- **Firebase SDK 10 (compat)** (CDN) — Realtime Database + Authentication
- **Chart.js** (CDN) — for the Salah rate-of-change line chart
- **localStorage** — offline fallback / cache when Firebase is unreachable

## Firebase Setup

Ubiverse now uses the **Firebase Realtime Database** and **Firebase Authentication** SDKs.

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project named `texter-for-me`.
2. Enable **Authentication → Email/Password** sign-in method.
3. Enable **Realtime Database** and choose your region.

### 2. Configure the App

Open `js/firebase.js` and replace the placeholder values in `firebaseConfig`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← replace
  authDomain: "texter-for-me.firebaseapp.com",
  databaseURL: "https://texter-for-me-default-rtdb.firebaseio.com",
  projectId: "texter-for-me",
  storageBucket: "texter-for-me.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",  // ← replace
  appId: "YOUR_APP_ID"                  // ← replace
};
```

You can find these values in **Project Settings → General → Your apps** in the Firebase Console.

### 3. Deploy Security Rules

The file `database.rules.json` contains the recommended Firebase Security Rules (all reads/writes require authentication). Deploy them with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init database      # select your project
firebase deploy --only database
```

Or copy-paste the rules manually in **Realtime Database → Rules** in the Firebase Console.

### 4. Login Flow

The app uses **username + password** sign-in. Internally, the username is converted to an email (`{username}@ubiverse.app`) for Firebase Auth. The first login for a new username automatically creates the account.

### 5. Telegram Notifications (optional)

Ledger transactions for the user `akhzarfarhan` are automatically posted to a private Telegram channel. The bot token is embedded in `js/firebase.js`. This is intentional for a personal-use app, but consider moving it to an environment variable or server-side proxy for public deployments.


