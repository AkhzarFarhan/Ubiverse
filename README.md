# Ubiverse Android

A modern, lightweight Android application built with Kotlin, Jetpack Compose, and Material Design 3. This is the Android port of the Ubiverse personal dashboard webapp.

## Features

- **15 Modules**: Daily Log, Gym Tracker, Texter, Tasbih, Salah Tracker, Ledger, Car Log, Quran Reader, Hadith Reader, Carpool, LTE MAC Viewer, Sudoku, Care Monitor, Focus Prep
- **Offline-First Architecture**: Room database with WorkManager sync to Firebase Realtime Database
- **Google Sign-In**: Firebase Authentication with Google provider
- **Material Design 3**: Custom theming matching the original webapp design
- **Modular Architecture**: Feature-based modules with clean separation of concerns

## Tech Stack

- **Language**: Kotlin 1.9.24
- **UI**: Jetpack Compose with Material 3
- **Architecture**: MVVM with Hilt Dependency Injection
- **Database**: Room (SQLite) with TypeConverters
- **Sync**: WorkManager with exponential backoff
- **Auth**: Firebase Authentication (Google Sign-In)
- **Remote**: Firebase Realtime Database
- **Charts**: MPAndroidChart / Vico
- **Image Loading**: Coil
- **Networking**: Retrofit + OkHttp + Moshi
- **Serialization**: Kotlinx Serialization
- **Date/Time**: Kotlinx Datetime

## Project Structure

```
Ubiverse/
├── app/                    # Application module
├── core/
│   ├── data/              # Repositories, Firebase, Sync
│   ├── database/          # Room DAOs, Entities, Database
│   ├── model/             # Domain models (serializable)
│   ├── common/            # Formatters, utilities
│   ├── ui/                # Shared Compose components, Navigation
│   ├── designsystem/      # Theme, Typography, Shapes
│   ├── datastore/         # Preferences DataStore
│   ├── network/           # Retrofit, API services
│   └── testing/           # Test utilities
├── feature/
│   ├── daily/             # Daily Log feature
│   ├── gym/               # Gym Tracker feature
│   ├── texter/            # Texter feature
│   ├── tasbih/            # Tasbih feature
│   ├── ledger/            # Ledger feature
│   ├── car/               # Car Log feature
│   ├── salah/             # Salah Tracker feature
│   ├── quran/             # Quran Reader feature
│   ├── hadith/            # Hadith Reader feature
│   ├── carpool/           # Carpool feature
│   ├── sudoku/            # Sudoku feature
│   ├── care/              # Care Monitor feature
│   ├── focus/             # Focus Prep feature
│   └── lte/               # LTE MAC Viewer feature
└── settings.gradle.kts    # Module declarations
```

## Getting Started

### Prerequisites

- Android Studio Koala (2024.1.1) or later
- JDK 17
- Android SDK 34
- Firebase project with:
  - Authentication (Google provider enabled)
  - Realtime Database
  - `google-services.json` in `app/` directory

### Configuration

1. Clone the repository
2. Add your `google-services.json` to `app/`
3. Configure Firebase project in `local.properties`:
   ```properties
   firebase.api.key=YOUR_API_KEY
   firebase.auth.domain=YOUR_PROJECT.firebaseapp.com
   firebase.database.url=https://YOUR_PROJECT.firebaseio.com
   firebase.project.id=YOUR_PROJECT
   firebase.storage.bucket=YOUR_PROJECT.appspot.com
   firebase.messaging.sender.id=YOUR_SENDER_ID
   firebase.app.id=YOUR_APP_ID
   ```

### Build & Run

```bash
# Debug build
./gradlew assembleDebug

# Run on connected device
./gradlew installDebug
```

## Module Dependencies

```
app
├── core:data
├── core:database
├── core:model
├── core:common
├── core:ui
├── core:designsystem
├── core:datastore
├── core:network
├── core:testing
└── feature:* (all feature modules)
```

## Key Implementation Details

### Offline-First Sync
- All writes go to Room first (instant UI)
- WorkManager queues sync operations
- Exponential backoff retry (1s → 30s max)
- Deduplication via syncId ring buffer (500 entries)
- Network detection via ConnectivityManager + Firebase `.info/connected`

### Data Models
All models use `@Serializable` for Kotlinx Serialization
Room TypeConverters handle complex types (arrays, nested objects)

### Theming
Colors, typography, and shapes match the original webapp's CSS custom properties:
- Primary: `#10B981` (Emerald 500)
- Surface: `#FFFFFF`, `#F1F5F9`
- Text: `#1E293B`, `#64748B`, `#94A3B8`
- Radius: 6dp, 10dp, 16dp

## Modules Status

| Module | Status |
|--------|--------|
| core:data | ✅ Complete |
| core:database | ✅ Complete |
| core:model | ✅ Complete (15 modules) |
| core:common | ✅ Complete |
| core:ui | ✅ Complete |
| core:designsystem | ✅ Complete |
| core:datastore | 🔄 In Progress |
| core:network | 🔄 In Progress |
| feature:daily | 🔄 In Progress |
| feature:gym | 🔄 In Progress |
| feature:texter | 🔄 In Progress |
| feature:tasbih | 🔄 In Progress |
| feature:ledger | 🔄 In Progress |
| feature:car | 🔄 In Progress |
| feature:salah | 🔄 In Progress |
| feature:quran | 🔄 In Progress |
| feature:hadith | 🔄 In Progress |
| feature:carpool | 🔄 In Progress |
| feature:sudoku | 🔄 In Progress |
| feature:care | 🔄 In Progress |
| feature:focus | 🔄 In Progress |
| feature:lte | 🔄 In Progress |

## License

MIT License - see LICENSE file for details.