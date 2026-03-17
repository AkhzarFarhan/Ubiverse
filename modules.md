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
| `vibex` | [js/vibex.js](js/vibex.js) | none | `vibex/users/<username>`, `vibex/chats/<chatId>/messages` | Real-time chat between users |
| `quran` | [js/quran.js](js/quran.js) | `quran_<username>` | `quran/<username>` | Qur'an reader with per-surah reading progress |

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
- Supports sharing entered text to another Ubiverse username (Google email prefix only)
- Preserve this path unless explicitly migrating stored data

### Vibex
- Real-time chat module using Firebase listeners (`on()`) rather than one-shot `once()`
- User presence tracked via `vibex/users/<username>` with `online` flag and `lastSeen` timestamp
- Uses Firebase `.info/connected` and `onDisconnect()` for automatic offline detection
- Chat ID between two users is their sorted usernames joined by underscore (e.g. `alice_bob`)
- Messages stored at `vibex/chats/<chatId>/messages/<pushId>`
- Each message has `delivered` and `read` boolean flags for receipt tracking
- Supports markdown text (bold, italic, inline code, fenced code blocks)
- No localStorage caching — all data is real-time from Firebase

### Al-Qur'an
- Loads Tanzil Simple Plain XML (`assets/quran-simple-plain.xml`) via fetch + DOMParser
- Displays surah index with Arabic names, English names, ayah counts, and reading progress
- Reader view prioritizes Al-Qalam Majeed, PDMS Saleem Quran Font, Noorehuda, and Mehr Naskh with Amiri Quran fallback on unsupported devices
- Preserves all Quranic marks (waqf/stop signs, diacritics) as present in source XML
- Tap any ayah to bookmark progress; "Mark Surah as Read" for full completion
- Progress stored per surah: `{ lastAyah, completed, timestamp }` at `quran/<username>`
- Surah search by Arabic name, English name, or number

## When adding a new module
1. Create `js/<module>.js` with a `window.<Name>Module` IIFE.
2. Add the script tag in [index.html](index.html) before [js/app.js](js/app.js).
3. Add route handling in [js/app.js](js/app.js).
4. Add sidebar navigation entry in [index.html](index.html).
5. Add necessary styles in [css/style.css](css/style.css).
6. Document its localStorage key and Firebase path in this file.
