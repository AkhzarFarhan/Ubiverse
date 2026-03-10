# Ubiverse Agent Guide

Start here before editing the repo.

## What this repository is
Ubiverse is a mobile-first personal dashboard built as a static single-page app using vanilla HTML, CSS, and JavaScript. It runs directly in the browser, uses Firebase Realtime Database + Firebase Auth, and deploys to GitHub Pages via GitHub Actions.

## Read these files in order
1. [rules.md](rules.md) — non-negotiable repo rules and editing constraints
2. [architecture.md](architecture.md) — app structure, routing, auth, data flow
3. [modules.md](modules.md) — per-module behavior and storage paths
4. [workflows.md](workflows.md) — local dev, deployment, secrets, branching
5. [skills.md](skills.md) — technologies and implementation patterns used here
6. [current-state.md](current-state.md) — important recent behavior changes and known doc drift

## Current truths
- Authentication is Google-only via Firebase popup sign-in.
- `js/env.js` is generated at deploy time and must not be committed.
- The default route is `#home`, which renders a tile-based landing page.
- Modules are plain globals like `window.LedgerModule`, each exposing `render()`.
- The app is intentionally framework-free. Do not introduce React, Vue, bundlers, or transpilers unless explicitly requested.
- UI changes should remain mobile-first and touch-friendly.

## Critical files
- [index.html](index.html) — SPA shell, login screen, sidebar, script order
- [css/style.css](css/style.css) — all styling, tokens, layout, component styles
- [js/app.js](js/app.js) — router, home page, auth-driven shell switching
- [js/firebase.js](js/firebase.js) — Firebase init, auth helpers, CRUD helpers, Telegram hook
- [js/utils.js](js/utils.js) — formatting, alerts, shared helpers
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) — GitHub Pages deploy and env injection

## Editing strategy
- Read the relevant module file and shared helpers before changing behavior.
- Preserve current global module conventions and script ordering.
- Prefer small, localized edits over cross-cutting rewrites.
- If changing data shape or storage paths, document the migration impact.

## Important warning
The existing [README.md](README.md) contains useful background but some parts are stale relative to the current app state, especially auth flow details. Treat the files in this guide as the up-to-date source of truth.
