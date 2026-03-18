# Ubiverse Rules

## Core constraints
- Keep the project as a static vanilla HTML/CSS/JS app.
- Do not add build tooling, framework dependencies, or TypeScript unless explicitly requested.
- Preserve the current script-loading model from [index.html](index.html).
- Maintain mobile-first UX. Large touch areas and low-friction data entry are preferred.
- Do not commit real credentials. `js/env.js` must remain generated/ignored.

## JavaScript conventions
- Modules live in `js/*.js` and attach themselves to `window`, e.g. `window.TasbihModule`.
- Each feature module should expose `render()` and own its own DOM rendering.
- Shared behavior goes in [js/utils.js](js/utils.js) or [js/firebase.js](js/firebase.js), not duplicated per module.
- Follow the existing style: plain functions, IIFEs, no classes unless there is a clear benefit.

## Data/storage rules
- User-scoped data is stored under Firebase paths based on `window.AppState.username`.
- Most modules use both Firebase and `localStorage`; keep offline fallback behavior intact.
- Avoid changing Firebase path names unless absolutely necessary.
- If a change requires a schema/path change, document backward-compatibility impact.

## Auth/security rules
- Current auth is Google sign-in only.
- Do not reintroduce username/password auth unless explicitly requested.
- Do not hardcode Firebase, Telegram, or other secrets.
- Keep secret names aligned with [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## UI/UX rules
- Prioritize fast entry flows for frequently used modules.
- Keep components visually consistent with the existing design tokens in [css/style.css](css/style.css).
- Prefer compact layouts on mobile, but do not sacrifice clarity.
- Preserve accessibility basics: labels, button text, focusability, and readable states.

## Git/workflow rules
- Normal flow is `dev` -> `main`.
- Use [Makefile](Makefile) in WSL/Git Bash and [make.ps1](make.ps1) in PowerShell.
- `pushm` is the fast path for commit + push to `dev` + merge to `main`.

## Testing rules
- Add tests when changing calculation logic, data transforms, validation rules, or cross-module shared helpers.
- Prefer small browser-native tests over introducing heavy test frameworks.
- Do not add a complex frontend build/test toolchain unless explicitly requested.
- If tests are added, keep them isolated from production runtime files and clearly document how to run them.
- Test files should focus on deterministic logic first: formatting, ledger math, date handling, counter behavior, and data conversion helpers.
- For UI-heavy changes, include at least a manual test checklist covering mobile layout, tap targets, auth flow, and persistence behavior.
- When changing Firebase or `localStorage` interactions, test both the success path and fallback path.
- When fixing a bug, add a test case or documented manual reproduction that would have caught the bug.
- Do not rely on real production credentials in tests; use mock data or safe local fixtures.
- Keep test data anonymous and disposable.

## Manual test checklist rules
- Verify login flow and sign-out behavior after auth-related changes.
- Verify the default `#home` route and navigation to any module you touched.
- Verify mobile usability for any touched form or tap target.
- Verify that alerts, empty states, and duplicate-prevention logic still behave correctly.
- Verify that existing stored data still renders after schema-adjacent changes.

## Documentation rules
- When behavior changes materially, update these markdown context files.
- If code and docs disagree, code wins until docs are corrected.
