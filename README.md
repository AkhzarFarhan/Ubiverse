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
├── index.html          # SPA shell — header, sidebar nav, login screen
├── css/
│   └── style.css       # Mobile-first styles, CSS custom properties, indigo theme
└── js/
    ├── firebase.js     # Firebase stubs (TODO: replace with real Firebase SDK)
    ├── utils.js        # DIV(), getINR(), getKolkataTimestamp(), showAlert(), …
    ├── app.js          # Hash-based SPA router + login / session management
    ├── daily.js        # Daily journal module
    ├── gym.js          # Gym tracker module
    ├── texter.js       # Notes/texter module
    ├── tasbih.js       # Tasbih counter module
    ├── salah.js        # Salah prayer tracker module (Chart.js)
    ├── ledger.js       # Ledger finance module
    └── car.js          # Car tracker module
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
- **Chart.js** (CDN) — for the Salah rate-of-change line chart
- **localStorage** — mock data storage until Firebase is wired up

## Roadmap

- [ ] **Firebase** — replace `// TODO: Firebase` stubs in `js/firebase.js` with real Realtime Database calls
- [ ] **Telegram** — replace `// TODO: Telegram` stubs with real bot notifications
- [ ] **Auth** — replace mock auth with real Firebase Auth or custom backend verification
