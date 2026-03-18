# Ubiverse Architecture

## Top-level structure
- [index.html](index.html): static SPA shell
- [css/style.css](css/style.css): all visual styling
- [js/app.js](js/app.js): auth-aware router and home screen
- [js/firebase.js](js/firebase.js): Firebase bootstrap and shared backend helpers
- [js/utils.js](js/utils.js): shared formatting and utility helpers
- [js/*.js](js): feature modules

## Runtime model
This app is a client-rendered SPA with hash routing.

### Shell flow
1. [index.html](index.html) loads the Firebase CDN scripts.
2. `js/env.js` is loaded next.
3. [js/firebase.js](js/firebase.js) initializes Firebase using `window.__ENV__`.
4. [js/utils.js](js/utils.js) defines shared helpers and `window.AppState`.
5. Module files load.
6. [js/app.js](js/app.js) binds auth events and routes.

If auth is absent, the Google sign-in card is shown.
If auth exists, the main layout is shown and the current hash route is rendered.

## Routing
Routes are hash-based and currently include:
- `#home`
- `#daily`
- `#gym`
- `#texter`
- `#tasbih`
- `#salah`
- `#ledger`
- `#car`

Default route is `#home`.

## Auth model
- Firebase Auth is used.
- Current login method is Google popup sign-in only.
- Username is derived from `displayName` or email prefix and normalized in [js/app.js](js/app.js).
- Auth state controls whether the login screen or app shell is visible.

## Data model
Each module owns its own Firebase path and `localStorage` key. Most reads use:
- Firebase first
- `localStorage` fallback if Firebase fails

Writes are usually optimistic to Firebase and mirrored into local cache.

## Styling model
- Single stylesheet: [css/style.css](css/style.css)
- Uses CSS custom properties and shared component classes
- Layout is mobile-first, with sidebar behavior adapted for smaller screens

## Deployment model
- GitHub Actions workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- Trigger: push to `main`
- The workflow generates `js/env.js` from GitHub environment/repository secrets
- GitHub Pages must be configured to deploy from GitHub Actions, not directly from branch contents

## External services
- Firebase Realtime Database
- Firebase Auth
- Telegram bot API for optional ledger notifications
- Chart.js for Salah visualizations
