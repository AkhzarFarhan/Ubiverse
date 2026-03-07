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
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages deployment workflow
├── css/
│   └── style.css           # Mobile-first styles, CSS custom properties, indigo theme
└── js/
    ├── env.js.example      # Environment template — copy to env.js for local dev
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

1. Copy the example environment file and fill in your credentials:

```bash
cp js/env.js.example js/env.js
# Edit js/env.js with your real Firebase and Telegram values
```

2. Serve the root directory with any static file server:

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

Copy `js/env.js.example` to `js/env.js` and fill in your Firebase credentials:

```bash
cp js/env.js.example js/env.js
```

Then edit `js/env.js` with the values from **Project Settings → General → Your apps** in the Firebase Console.

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

Ledger transactions for the user `akhzarfarhan` are automatically posted to a private Telegram channel. Set the `TG_BOT_TOKEN` and `TG_LEDGER_CHAT_ID` values in `js/env.js` (or the corresponding GitHub secrets for production).

## GitHub Pages Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that deploys to GitHub Pages and injects credentials at build time.

### Required Repository Secrets

Go to **Settings → Secrets and variables → Actions** and add the following secrets:

| Secret | Description |
|--------|-------------|
| `FIREBASE_API_KEY` | Firebase Web API key |
| `FIREBASE_AUTH_DOMAIN` | e.g. `my-project.firebaseapp.com` |
| `FIREBASE_DATABASE_URL` | e.g. `https://my-project-default-rtdb.firebaseio.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | e.g. `my-project.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `FIREBASE_APP_ID` | Firebase Web app ID |
| `TG_BOT_TOKEN` | Telegram bot token (optional) |
| `TG_LEDGER_CHAT_ID` | Telegram chat ID for ledger notifications (optional) |

Once the secrets are configured, every push to `main` will automatically deploy the app to GitHub Pages with the credentials injected.


