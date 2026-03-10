# Ubiverse Modules

## Module map

| Route | File | localStorage key | Firebase path | Notes |
|---|---|---|---|---|
| `home` | [js/app.js](js/app.js) | none | none | Landing page with labeled icon tiles |
| `daily` | [js/daily.js](js/daily.js) | `daily_<username>` | `daily/<username>` | Daily check-in entries |
| `gym` | [js/gym.js](js/gym.js) | `gym_<username>` | `gym/<username>` | Workout log |
| `texter` | [js/texter.js](js/texter.js) | `texter_<username>` | `texter_v2/<username>` | Notes/snippets |
| `tasbih` | [js/tasbih.js](js/tasbih.js) | `tasbih_<username>` | `tasbih/<username>` | Standard dhikr sequence + custom counter |
| `salah` | [js/salah.js](js/salah.js) | `salah_<username>` | `salah/<username>` | Prayer debt tracking + Chart.js visuals |
| `ledger` | [js/ledger.js](js/ledger.js) | `ledger_<username>` | `LedgerV2/<username>` | Fast transaction entry, balances, monthly summary |
| `car` | [js/car.js](js/car.js) | `car_<username>` | `car/<username>` | Fuel/service records and calculations |

## Shared module expectations
- Each module renders into `#app`.
- Each module owns its own event listeners after rendering.
- Most modules fetch current data in `loadData()` or equivalent after `render()`.
- Most modules use `firebaseGet()`/`firebasePost()` and fallback to `localStorage` on failures.

## Notable module behaviors

### Home
- Rendered from [js/app.js](js/app.js)
- Designed as the default landing screen
- Contains brand tagline and maintainer footer

### Tasbih
- Supports two modes: standard and custom
- Standard mode cycles through:
  - SubhanAllah x33
  - Alhamdulillah x33
  - Allahu Akbar x34
- Uses vibration on phase change/completion if supported
- Writes last completed record to `tasbih/<username>/last`

### Ledger
- Uses a fast-entry form with:
  - credit/debit toggle
  - single amount input
  - single-select mode pills
- Sends optional Telegram notification only when username matches configured `TG_USERNAME`
- Displays balances, recent transactions, and monthly summary
- Uses `LedgerV2/<username>` as Firebase path

### Salah
- Depends on Chart.js loaded in [index.html](index.html)
- Any visual/chart changes should be validated against mobile layout constraints

### Texter
- Firebase path is `texter_v2/<username>` rather than `texter/<username>`
- Preserve this path unless explicitly migrating stored data

## When adding a new module
1. Create `js/<module>.js` with a `window.<Name>Module` IIFE.
2. Add the script tag in [index.html](index.html) before [js/app.js](js/app.js).
3. Add route handling in [js/app.js](js/app.js).
4. Add sidebar navigation entry in [index.html](index.html).
5. Add necessary styles in [css/style.css](css/style.css).
6. Document its localStorage key and Firebase path in this file.
