# Firestore Database Setup

## Step 1: Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `vidstream-98e50`
3. Click on **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location (choose closest to your users)
7. Click **Done**

## Step 2: Set Up Security Rules (Development)

In the Firebase Console > Firestore Database > Rules tab, replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING**: These rules allow anyone to read/write your database. Only use for development!

## Step 3: Production Security Rules

For production, use these more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read videos, only authenticated users can write
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Anyone can read channels, only authenticated users can write
    match /channels/{channelId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Anyone can read comments, only authenticated users can write
    match /comments/{commentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Only authenticated users can read/write playlists
    match /playlists/{playlistId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 4: Set Up Storage Rules

Go to Firebase Console > Storage > Rules tab:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload videos and thumbnails
    match /videos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /thumbnails/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /avatars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 5: Test the Setup

1. After setting up the rules, try the "Seed Sample Data" button again
2. Check the Firebase Console > Firestore Database to see if data was created
3. Go back to your app's home page to see the videos

## Collections Structure

Your Firestore database will have these collections:

### `videos`
```javascript
{
  title: string,
  description: string,
  videoUrl: string,
  thumbnail: string,
  duration: number,
  views: number,
  likes: number,
  dislikes: number,
  uploaderId: string,
  uploaderName: string,
  uploaderAvatar: string,
  category: string,
  tags: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `channels`
```javascript
{
  name: string,
  handle: string,
  description: string,
  subscriberCount: number,
  avatar: string,
  banner: string,
  verified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `comments`
```javascript
{
  videoId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  text: string,
  likes: number,
  dislikes: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `users`
```javascript
{
  displayName: string,
  email: string,
  avatar: string,
  channelName: string,
  subscribedTo: string[],
  likedVideos: string[],
  dislikedVideos: string[],
  watchHistory: string[],
  playlists: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Troubleshooting

### Error: "Missing or insufficient permissions"
- Check that Firestore security rules allow the operation
- Make sure you're authenticated if rules require it

### Error: "The query requires an index"
- Go to Firebase Console > Firestore Database > Indexes
- Create the required composite indexes as suggested by the error

### Error: "Storage object does not exist"
- Check Firebase Storage rules
- Verify file upload permissions