# Ubiverse Skills Reference

This file describes the technical knowledge an LLM or contributor should apply when working in this repo.

## Primary stack
- Vanilla HTML5
- Vanilla CSS3 with CSS custom properties
- Vanilla JavaScript (ES2019+ style, browser-first)
- Firebase Realtime Database (web compat SDK)
- Firebase Authentication (Google provider)
- Chart.js
- GitHub Actions + GitHub Pages

## Important implementation patterns

### 1. Global module pattern
Modules are defined as IIFEs attached to `window`, for example:
- `window.DailyModule`
- `window.LedgerModule`

They are consumed by [js/app.js](js/app.js).

### 2. Render-on-navigation pattern
Most modules:
- render HTML into `#app`
- attach events immediately after render
- load data after render

### 3. Firebase + local cache pattern
Common pattern:
- read from Firebase
- cache into `localStorage`
- if Firebase fails, fallback to `localStorage`

### 4. Mobile-first UI
Common goals:
- compact layouts
- big tap targets
- quick-entry forms
- minimal scrolling where possible

### 5. Shared helper usage
Use [js/utils.js](js/utils.js) helpers where possible:
- `getINR()` for currency formatting
- `getKolkataTimestamp()` for timestamps
- `showAlert()` / `clearAlert()` for inline alerts
- `objectToArray()` for Firebase object results

## Domain-specific skills by module
- Daily/Gym/Texter: list rendering, form handling, lightweight CRUD
- Tasbih: stateful counters, vibration API, touch-friendly UX
- Salah: chart rendering, projections, date grouping
- Ledger: finance math, balance transitions, efficient transaction entry UX
- Car: mileage and service calculations

## What not to assume
- There is no bundler, module system, or package manager-based frontend toolchain.
- There is no server-side backend in this repo.
- Auth is not email/password anymore.
- Not all docs in [README.md](README.md) are current.

## Helpful mindset for changes
- Prefer simple browser-native solutions.
- Keep data shapes stable.
- Optimize for maintainability by a single human owner and future coding agents.
- Treat deploy automation and secret injection as part of the app architecture, not an afterthought.
