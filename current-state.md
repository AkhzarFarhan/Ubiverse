# Ubiverse Current State Notes

This file captures recent realities that may not be fully reflected elsewhere.

## Auth changed
The app now uses Google sign-in only.
- Login UI is the Google button in [index.html](index.html)
- Auth helper is `firebaseSignInWithGoogle()` in [js/firebase.js](js/firebase.js)
- [README.md](README.md) still contains older references to username/password auth and should be treated cautiously

## Home screen changed
The default route is now `#home`.
The landing screen shows:
- tile-based module shortcuts
- brand tagline: "An Endless Possibility"
- maintainer footer linking to Akhzar Farhan's GitHub profile

## Ledger changed
Ledger entry is optimized for speed:
- one amount field
- credit/debit toggle
- single-select mode pills
- timestamp table now shows date only, not time

## Tasbih changed
Tasbih supports:
- standard 33/33/34 dhikr flow
- custom counter mode
- phone vibration on phase changes and completion

## Deployment gotchas
- `js/env.js` is generated during GitHub Actions deployment
- If deployed site cannot load `js/env.js`, check that GitHub Pages is set to deploy from **GitHub Actions**
- Workflow expects a `github-pages` environment and matching secret names

## Telegram behavior
Ledger notifications are conditional:
- sent only if the current username matches `TG_USERNAME`
- bot token/chat id must be configured in secrets or local env
