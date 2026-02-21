# 🌐 Ubiverse

A unified cross-platform (Web, Android and iOS) application for lifestyle utilities and tools.

## Features

- 🔐 **Authentication** — Email/password sign-up and login via Firebase Auth
- ✅ **Todo List** — Create, complete and delete tasks stored in Firestore
- 🔥 **Habit Tracker** — Build daily habits with streak tracking
- 📝 **Notes** — Create and manage personal notes

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (React Native + Web) |
| Authentication | [Firebase Auth](https://firebase.google.com/docs/auth) |
| Database | [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| Web Hosting | [Vercel](https://vercel.com) |

## Getting Started

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Set up Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Copy your Firebase config and create a `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2b. Enable Google Sign-In (optional but recommended)

1. In Firebase Console → **Authentication** → **Sign-in method**, enable **Google**.
2. Create Google OAuth client IDs for the platforms you target (Android/iOS/Web).
3. Add the client IDs to your `.env`:

```env
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your_expo_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
```

### 3. Run the app

```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

## Deploy to Vercel

1. Push this repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the Firebase env variables in Vercel's project settings
4. Deploy — Vercel will automatically run `npx expo export --platform web`

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
