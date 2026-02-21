# Ubiverse — Project Checkpoints

> Last updated: 2026-02-21

---

## 1. Project Overview

| Field | Value |
|---|---|
| **Name** | Ubiverse |
| **Version** | 1.0.0 |
| **Description** | Unified cross-platform (Web, Android, iOS) lifestyle utilities app |
| **License** | MIT — Copyright (c) 2026 Akhzar Farhan |
| **Entry Point** | `index.js` → `App.js` |
| **Architecture** | React Native (Expo) + Firebase backend |

---

## 2. Tech Stack & Versions

### Core Framework

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54.0.33 | Managed React Native framework (SDK 54) |
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.5 | Native mobile runtime |
| `react-dom` | 19.1.0 | Web runtime |
| `react-native-web` | ~0.21.0 | React Native → web transpilation |

### Navigation

| Package | Version | Purpose |
|---|---|---|
| `@react-navigation/native` | ^7.1.28 | Core navigation |
| `@react-navigation/native-stack` | ^7.3.21 | Stack navigator (auth flow) |
| `@react-navigation/bottom-tabs` | ^7.3.10 | Bottom tab navigator (main app) |
| `react-native-screens` | ^4.13.1 | Native screen primitives |
| `react-native-safe-area-context` | ^4.14.1 | Safe area handling |

### Firebase

| Package | Version | Purpose |
|---|---|---|
| `firebase` | ^11.3.1 | Firebase JS SDK (Auth + Firestore) |

### Expo Addons

| Package | Version | Purpose |
|---|---|---|
| `@expo/metro-runtime` | ^6.1.2 | Metro bundler runtime for web |
| `@expo/vector-icons` | ^14.0.2 | Icon library (Ionicons used) |
| `expo-font` | ^14.0.11 | Custom font loading |
| `expo-linear-gradient` | ^14.0.2 | Gradient backgrounds |
| `expo-status-bar` | ~3.0.9 | Status bar control |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@babel/core` | ^7.24.0 | Babel transpiler |
| `babel-preset-expo` | (via expo) | Expo Babel preset |
| `jest-expo` | ~54.0.0 | Testing preset |

---

## 3. Project Structure

```
Ubiverse/
├── .env                          # Firebase credentials (EXPO_PUBLIC_* vars)
├── .gitignore
├── App.js                        # Root component (AuthProvider + AppNavigator)
├── app.json                      # Expo config (icons, splash, bundle IDs)
├── babel.config.js               # Babel config (babel-preset-expo)
├── index.js                      # registerRootComponent entry
├── LICENSE                       # MIT
├── package.json
├── vercel.json                   # Vercel deployment config
├── assets/                       # icon.png, splash-icon.png, favicon.png, adaptive-icon.png
└── src/
    ├── context/
    │   └── AuthContext.js         # React context for Firebase Auth state
    ├── firebase/
    │   └── config.js             # Firebase init (app, auth, db exports)
    ├── navigation/
    │   └── AppNavigator.js       # Stack + Tab navigator with auth gating
    └── screens/
        ├── auth/
        │   ├── LoginScreen.js    # Email/password login
        │   └── RegisterScreen.js # Email/password registration with display name
        ├── dashboard/
        │   └── DashboardScreen.js # Home screen with tool cards
        ├── habits/
        │   └── HabitsScreen.js   # Habit tracker with streak calculation
        ├── notes/
        │   └── NotesScreen.js    # Notes CRUD with 2-column grid
        └── todo/
            └── TodoScreen.js     # Todo list with completion toggle
```

---

## 4. App Configuration

### Expo (`app.json`)

| Setting | Value |
|---|---|
| Slug | `ubiverse` |
| Orientation | Portrait |
| New Architecture | Enabled (`newArchEnabled: true`) |
| iOS Bundle ID | `com.ubiverse.app` |
| Android Package | `com.ubiverse.app` |
| Web Bundler | Metro |
| Web Output | Single (SPA) |
| Splash Background | `#6B4EFF` |
| Plugins | `expo-font` |

### Firebase Project

| Setting | Value |
|---|---|
| Project ID | `my-own-ubiverse` |
| Auth Domain | `my-own-ubiverse.firebaseapp.com` |
| Auth Method | Email/Password |
| Database | Cloud Firestore |

### Environment Variables (`.env`)

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

---

## 5. Features Implemented

### Authentication (Firebase Auth)
- [x] Email/password registration with display name
- [x] Email/password login
- [x] Logout
- [x] Auth state listener (`onAuthStateChanged`) in context
- [x] Auth-gated navigation (unauthenticated → Login/Register, authenticated → MainTabs)

### Dashboard
- [x] Greeting with user's first name
- [x] Tool cards grid linking to Todos, Habits, Notes tabs
- [x] Logout button

### Todos (Firestore: `users/{uid}/todos`)
- [x] Add task
- [x] Toggle completed
- [x] Delete task
- [x] Real-time listener (`onSnapshot`)
- [x] Ordered by `createdAt` desc
- [x] Remaining tasks count
- [x] Empty state

### Habits (Firestore: `users/{uid}/habits`)
- [x] Add habit with name + emoji (modal)
- [x] Toggle today's completion
- [x] Delete habit
- [x] Streak calculation (consecutive days)
- [x] Daily completion counter (X/Y done today)
- [x] Real-time listener (`onSnapshot`)
- [x] Ordered by `createdAt` asc
- [x] Empty state

### Notes (Firestore: `users/{uid}/notes`)
- [x] Create note with title + body (modal)
- [x] Edit existing note
- [x] Delete note (with confirmation alert)
- [x] 2-column masonry-like grid
- [x] Real-time listener (`onSnapshot`)
- [x] Ordered by `updatedAt` desc
- [x] Empty state

---

## 6. Firestore Data Model

```
users/{userId}/
├── todos/{todoId}
│   ├── text: string
│   ├── completed: boolean
│   └── createdAt: Timestamp
├── habits/{habitId}
│   ├── name: string
│   ├── emoji: string
│   ├── completedDates: string[]      # ["2026-02-21", ...]
│   └── createdAt: Timestamp
└── notes/{noteId}
    ├── title: string
    ├── body: string
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp
```

### Security Rules

All data scoped per user — read/write allowed only when `request.auth.uid == userId`.

---

## 7. Navigation Structure

```
AppNavigator (NativeStackNavigator)
├── [Unauthenticated]
│   ├── Login  → LoginScreen
│   └── Register → RegisterScreen
└── [Authenticated]
    └── Main → MainTabs (BottomTabNavigator)
        ├── Dashboard → DashboardScreen
        ├── Todos → TodoScreen
        ├── Habits → HabitsScreen
        └── Notes → NotesScreen
```

---

## 8. Styling & Theme

| Token | Value | Usage |
|---|---|---|
| Primary | `#6B4EFF` | Buttons, active tab, gradients |
| Secondary Gradient | `#A855F7` | Header gradients |
| Habit Accent | `#FF6B6B` / `#FF8E53` | Habit cards, streak flame |
| Notes Accent | `#00C9A7` / `#00B4D8` | Note cards, save button |
| Background (Todos) | `#F8F7FF` | Light purple tint |
| Background (Habits) | `#FFF8F7` | Light warm tint |
| Background (Notes) | `#F7FFFD` | Light mint tint |
| Dark Text | `#1A1A2E` | Headings and body |
| Card Style | White, `borderRadius: 16-24`, subtle shadow | Consistent across screens |

---

## 9. Deployment

### Web — Vercel

| Setting | Value |
|---|---|
| Build Command | `npx expo export --platform web` |
| Output Directory | `dist` |
| SPA Routing | `/(.*) → /index.html` |
| Framework Override | `null` (static) |

### Mobile

| Command | Platform |
|---|---|
| `npm run android` | Android (Expo Dev Client or Expo Go) |
| `npm run ios` | iOS (Expo Dev Client or Expo Go) |
| `npm run web` | Web (localhost dev server) |

---

## 10. Scripts

| Script | Command | Purpose |
|---|---|---|
| `start` | `expo start` | Start Expo dev server |
| `android` | `expo start --android` | Launch on Android |
| `ios` | `expo start --ios` | Launch on iOS |
| `web` | `expo start --web` | Launch on web |
| `build:web` | `expo export --platform web` | Production web build |
| `test` | `jest --watchAll=false` | Run tests (jest-expo) |

---

## 11. Key Design Decisions

1. **Expo SDK 54** with New Architecture enabled — uses React 19.1 and RN 0.81
2. **Firebase JS SDK v11** (modular/tree-shakable imports) — no `@react-native-firebase`
3. **All data per-user** under `users/{uid}/` — simple Firestore security rules
4. **Real-time listeners** (`onSnapshot`) for all collections — no manual refresh needed
5. **No custom fonts loaded** — relies on system defaults + Ionicons for icons
6. **SPA web output** via Metro bundler — deployed as static site on Vercel
7. **Env vars** use `EXPO_PUBLIC_` prefix for client-side access in Expo
8. **No offline persistence** configured — relies on default Firestore behavior
9. **No state management library** — React Context + local `useState` suffices at current scale
10. **Test IDs (`testID`)** added to all interactive elements for automated testing

---

## 12. Known Gaps / Future Considerations

### Bugs & Critical Tech Debt
- [ ] **BUG**: `TODAY` constant in `HabitsScreen.js` is evaluated at module load. If the app is left open overnight, habits will be logged for the wrong day. Needs to be computed inside the render cycle or via a hook.
- [ ] **Tech Debt**: Theme colors (e.g., `#6B4EFF`, `#FF6B6B`) are duplicated across multiple screen `StyleSheet`s. Needs a centralized `src/constants/theme.js`.
- [ ] **Tech Debt**: Missing React Error Boundary in `App.js`. Unhandled render errors will crash the entire app to a white screen.
- [ ] **Tooling**: Missing ESLint and Prettier configuration for consistent code formatting.

### Feature Gaps
- [ ] No unit or integration tests written yet (jest-expo configured but unused)
- [ ] No dark mode support
- [ ] No password reset / forgot password flow
- [ ] No push notifications
- [ ] No offline-first / caching strategy
- [ ] No input validation beyond empty-check and password length
- [ ] Habits streak resets if a single day is missed (no "freeze" feature)
- [ ] Notes don't support rich text or markdown
- [ ] No search / filter on any list
- [ ] No user profile / settings screen
- [ ] No EAS Build config (`eas.json`) for production native builds
