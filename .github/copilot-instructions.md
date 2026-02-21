# Ubiverse — LLM Workflow & Development Guide

> This file is the single source of truth for any LLM agent maintaining this project.
> Read CHECKPOINTS.md for version snapshots and feature status.

---

## Quick Reference

- **Stack**: Expo SDK 54 · React 19.1 · React Native 0.81.5 · Firebase JS SDK 11 · React Navigation 7
- **Language**: JavaScript (no TypeScript)
- **Entry**: `index.js` → `App.js` → `AuthProvider` → `AppNavigator`
- **Backend**: Firebase Auth (email/password) + Cloud Firestore (real-time)
- **Platforms**: Web (Vercel), Android, iOS
- **Package manager**: npm (lockfile: `package-lock.json`)

---

## 1. Project Architecture

```
App.js                          ← Root: wraps everything in AuthProvider
└── src/
    ├── context/AuthContext.js   ← Auth state (user, loading, login, register, logout)
    ├── firebase/config.js      ← Firebase init (app, auth, db)
    ├── navigation/AppNavigator.js ← Auth-gated routing
    └── screens/
        ├── auth/               ← LoginScreen, RegisterScreen
        ├── dashboard/          ← DashboardScreen (tool cards)
        ├── habits/             ← HabitsScreen (streak tracker)
        ├── notes/              ← NotesScreen (CRUD, 2-col grid)
        └── todo/               ← TodoScreen (task list)
```

### Data Flow

```
User action → Screen component → Firebase SDK call → Firestore
                                                      ↓
                                              onSnapshot listener
                                                      ↓
                                              setState → re-render
```

All Firestore data lives under `users/{uid}/` with three subcollections: `todos`, `habits`, `notes`.

---

## 2. Conventions & Patterns

### File & Folder Naming
- **Screens**: `src/screens/{feature}/{FeatureName}Screen.js` (PascalCase for component files)
- **Context**: `src/context/{Name}Context.js`
- **Config**: `src/firebase/config.js`
- **One screen per file**, one default export per screen

### Component Patterns
- **Functional components only** — no class components
- **React hooks** — `useState`, `useEffect`, `useContext`
- **Custom hooks** — `useAuth()` from AuthContext
- **No external state library** — use React Context for shared state, local `useState` for screen state
- **StyleSheet.create()** at bottom of each file — no inline style objects, no CSS-in-JS libraries
- **`testID` props** on all interactive elements (buttons, inputs, toggleable items) for testing

### Firebase Patterns
- **Modular imports** (tree-shakable): `import { getAuth } from 'firebase/auth'` — never use compat (`firebase/compat/*`)
- **Real-time listeners**: use `onSnapshot` for all collections (no one-time `getDocs` fetches)
- **Cleanup**: always return the `unsubscribe` function from `useEffect`
- **Server timestamps**: use `serverTimestamp()` for `createdAt` / `updatedAt`
- **Error handling**: wrap every Firestore/Auth call in `try/catch` and show `Alert.alert`

### Navigation Patterns
- **Auth gating** in `AppNavigator`: conditional rendering based on `user` from `useAuth()`
- **Stack navigator** for auth flow (Login ↔ Register)
- **Bottom tab navigator** for main app (Dashboard, Todos, Habits, Notes)
- **`headerShown: false`** on all navigators — screens manage their own headers

### Styling Patterns
- **Theme colors** (not centralized yet — duplicated per screen):
  - Primary: `#6B4EFF`, gradient to `#A855F7`
  - Habit accent: `#FF6B6B` / `#FF8E53`
  - Notes accent: `#00C9A7` / `#00B4D8`
  - Dark text: `#1A1A2E`
- **Cards**: white background, `borderRadius: 16–24`, subtle colored shadow, `elevation: 2–4`
- **Gradients**: use `expo-linear-gradient` (`LinearGradient`)
- **Icons**: exclusively `Ionicons` from `@expo/vector-icons`
- **Safe areas**: `SafeAreaView` for screen roots, `KeyboardAvoidingView` for forms

---

## 3. Adding a New Feature (Screen)

Follow this exact sequence:

### Step 1 — Create screen file
```
src/screens/{feature}/{Feature}Screen.js
```
Use an existing screen (e.g., `TodoScreen.js`) as the template. Match the patterns:
- `SafeAreaView` root with feature-specific background color
- Header section with title + optional action button
- `FlatList` with `onSnapshot` real-time listener
- Empty state component
- `StyleSheet.create()` at bottom

### Step 2 — Add Firestore subcollection
- Collection path: `users/{uid}/{feature}`
- Always include `createdAt: serverTimestamp()` on writes
- Use `onSnapshot` with `orderBy` for real-time reads
- Return unsubscribe in `useEffect` cleanup

### Step 3 — Register in navigation
1. Import the screen in `src/navigation/AppNavigator.js`
2. Add a `<Tab.Screen>` in `MainTabs` with an Ionicons icon
3. Add a tool card in `DashboardScreen.js` in the `tools` array

### Step 4 — Add testIDs
- Input fields: `testID="{feature}-input"`
- Action buttons: `testID="{feature}-add-button"`, `testID="{feature}-toggle-{id}"`, `testID="{feature}-delete-{id}"`

### Step 5 — Update Firestore security rules
If the new feature uses a new collection path, add it under the existing wildcard rule or extend as needed.

---

## 4. Modifying Existing Code

### Before editing any file:
1. Read the full file to understand current state
2. Verify imports are modular Firebase (not compat)
3. Check for `testID` props on interactive elements
4. Preserve the `StyleSheet.create()` pattern at file bottom

### Common modifications:
| Task | Where to change |
|---|---|
| Add auth method (e.g., Google) | `AuthContext.js` + `LoginScreen.js` |
| Add Firestore field | Screen file's `addDoc`/`updateDoc` call + `renderItem` |
| Change theme color | Each screen's `StyleSheet` (no central theme file yet) |
| Add a tab | `AppNavigator.js` (`MainTabs`) + new screen + `DashboardScreen.js` tools array |
| Add env variable | `.env` file with `EXPO_PUBLIC_` prefix + reference via `process.env.EXPO_PUBLIC_*` |

---

## 5. Environment & Build Commands

```bash
# Install dependencies
npm install

# Development
npm run web          # Web on localhost
npm run android      # Android (requires emulator or device)
npm run ios          # iOS (requires macOS + simulator)
npm start            # Interactive Expo dev menu

# Production
npm run build:web    # Outputs to /dist for Vercel

# Testing
npm test             # Jest (jest-expo preset)
```

### Environment variables
All Firebase config in `.env` using `EXPO_PUBLIC_` prefix. Expo reads these at build time via `process.env.EXPO_PUBLIC_*`. Never commit real credentials — `.env` is in `.gitignore`.

### Vercel deployment
- Build: `npx expo export --platform web`
- Output: `dist/`
- SPA fallback: all routes → `/index.html`
- Add env vars in Vercel dashboard project settings

---

## 6. Firestore Schema

```
users/{userId}/
├── todos/{todoId}
│   ├── text: string
│   ├── completed: boolean
│   └── createdAt: Timestamp
├── habits/{habitId}
│   ├── name: string
│   ├── emoji: string
│   ├── completedDates: string[]   ← ISO date strings ["2026-02-21"]
│   └── createdAt: Timestamp
└── notes/{noteId}
    ├── title: string
    ├── body: string
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp
```

**Rules**: only `request.auth.uid == userId` can read/write. All data is user-scoped.

---

## 7. Dependency Management

### Upgrade rules
- **Expo SDK**: follow the [Expo upgrade guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/). Expo pins `react`, `react-native`, and companion lib versions — don't upgrade these independently.
- **Firebase**: safe to upgrade minor/patch within v11.x. Major version bumps may change modular API.
- **React Navigation**: v7.x — check changelogs before bumping major.
- **Never mix** `@react-native-firebase/*` with `firebase` JS SDK. This project uses the JS SDK only.

### Adding new dependencies
```bash
npx expo install <package>       # Preferred — resolves Expo-compatible version
npm install <package>            # Only if not an Expo-managed package
```

---

## 8. Testing Strategy

- **Framework**: Jest with `jest-expo` preset (configured in `package.json`)
- **Test IDs**: all interactive elements have `testID` props — use these for component/E2E tests
- **Current status**: no tests written yet — this is a gap to address
- **Recommended approach**:
  - Unit tests for utility logic (e.g., streak calculation in HabitsScreen)
  - Component tests with React Native Testing Library
  - E2E tests with Detox or Maestro

---

## 9. Code Quality Checklist

When reviewing or generating code for this project, verify:

- [ ] Functional component with hooks (no classes)
- [ ] Firebase modular imports (`from 'firebase/auth'`, not `firebase/compat/auth`)
- [ ] `onSnapshot` with cleanup in `useEffect` return
- [ ] `try/catch` + `Alert.alert` on every async Firebase call
- [ ] `serverTimestamp()` on document creation/updates
- [ ] `testID` on buttons, inputs, and toggleable elements
- [ ] `StyleSheet.create()` at file bottom (no inline objects)
- [ ] `SafeAreaView` as screen root
- [ ] `KeyboardAvoidingView` wrapping forms
- [ ] Platform-aware behavior: `Platform.OS === 'ios' ? 'padding' : 'height'`
- [ ] No hardcoded Firebase credentials (use `process.env.EXPO_PUBLIC_*`)
- [ ] Ionicons for all icons (no mixing icon sets)
- [ ] Empty state component in every `FlatList`

---

## 10. Known Technical Debt

| Issue | Impact | Suggested Fix |
|---|---|---|
| No centralized theme/constants file | Colors duplicated across 6+ files | Create `src/constants/theme.js` |
| No error boundary | Unhandled errors crash the app | Add React error boundary in `App.js` |
| No loading/skeleton states beyond spinner | Poor perceived performance | Add shimmer/skeleton placeholders |
| Habits `TODAY` constant computed at module load | Stale if app open past midnight | Compute inside render or use `useMemo` with date check |
| No Firestore indexes defined | Complex queries may fail in production | Export and commit `firestore.indexes.json` |
| No TypeScript | No compile-time type safety | Migrate to `.tsx` (low priority, project is small) |
| No ESLint/Prettier config | Inconsistent formatting possible | Add `.eslintrc.js` + `.prettierrc` |
| No CI/CD pipeline | Manual testing/deployment only | Add GitHub Actions for lint + test + deploy |

---

## 11. Do Not

- **Do not** use `firebase/compat/*` imports — this project is fully modular v11
- **Do not** install `@react-native-firebase/*` — it conflicts with the JS SDK approach
- **Do not** use class components or `this.setState`
- **Do not** add inline style objects — always use `StyleSheet.create()`
- **Do not** hardcode Firebase config — always read from `process.env.EXPO_PUBLIC_*`
- **Do not** use `getDocs` for lists that need live updates — use `onSnapshot`
- **Do not** skip `testID` on new interactive elements
- **Do not** modify `package-lock.json` manually — let npm manage it
- **Do not** upgrade `react` / `react-native` versions independently of Expo SDK
