# Firebase Emulator Setup (Alternative Solution)

If you want to avoid the unauthorized domain issue entirely during development, you can use Firebase Emulators.

## Install Firebase CLI
```bash
npm install -g firebase-tools
```

## Login to Firebase
```bash
firebase login
```

## Initialize Firebase Emulators
```bash
firebase init emulators
```

Select:
- Authentication Emulator
- Firestore Emulator
- Storage Emulator

## Create firebase.json Configuration
```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## Update Firebase Config for Development
Create a separate config for emulators in `src/config/firebase.ts`:

```typescript
// Add this after Firebase initialization
if (import.meta.env.DEV) {
  // Connect to emulators in development
  if (auth && !auth.app.options.projectId?.includes('demo-')) {
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  if (db && !db.app.options.projectId?.includes('demo-')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  if (storage && !storage.app.options.projectId?.includes('demo-')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
}
```

## Start Emulators
```bash
firebase emulators:start
```

## Benefits of Using Emulators
- No unauthorized domain issues
- Faster development
- Offline development
- No quota limits
- Easy data reset
- Built-in UI for managing data

## Access Emulator UI
Open http://localhost:4000 to access the Firebase Emulator UI where you can:
- View and manage authentication users
- Browse Firestore collections
- Monitor storage files
- View logs and metrics