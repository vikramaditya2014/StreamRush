# Firebase Storage Setup Guide

## Issue: Video Upload Not Working

If video uploads are stuck on "uploading" but never complete, you need to set up Firebase Storage.

## Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `vidstream-98e50`
3. Click on **Storage** in the left sidebar
4. Click **Get started**
5. Choose **Start in test mode** (for development)
6. Select a location (same as your Firestore location)
7. Click **Done**

## Step 2: Configure Storage Security Rules

In Firebase Console > Storage > Rules tab, replace with:

### Development Rules (Permissive)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to upload
    match /videos/{allPaths=**} {
      allow write: if request.auth != null
        && request.resource.size < 100 * 1024 * 1024; // 100MB limit
    }
    
    match /thumbnails/{allPaths=**} {
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    match /avatars/{allPaths=**} {
      allow write: if request.auth != null
        && request.resource.size < 2 * 1024 * 1024; // 2MB limit
    }
  }
}
```

### Production Rules (Secure)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Videos: Only owner can upload, size limits, file type validation
    match /videos/{userId}/{videoId}/{fileName} {
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 100 * 1024 * 1024
        && request.resource.contentType.matches('video/.*');
    }
    
    // Thumbnails: Only owner can upload, size limits, image validation
    match /thumbnails/{userId}/{videoId}/{fileName} {
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    
    // Avatars: Only owner can upload
    match /avatars/{userId}/{fileName} {
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Step 3: Test Upload

1. Make sure you're logged in to the app
2. Go to `/upload` page
3. Select a video file (under 100MB)
4. Select a thumbnail image (under 5MB)
5. Fill in title and description
6. Click "Upload video"

## Step 4: Verify Storage

After upload, check Firebase Console > Storage to see if files were uploaded to:
- `/videos/{videoId}/filename.mp4`
- `/thumbnails/{videoId}/filename.jpg`

## Common Issues & Solutions

### Issue: "Upload failed. Firebase not configured properly"
**Solution**: Check that Firebase Storage is enabled in console

### Issue: "Permission denied" or "Unauthorized"
**Solution**: 
1. Make sure user is logged in
2. Check storage security rules
3. Verify rules allow authenticated uploads

### Issue: "Upload stuck at 0%"
**Solution**:
1. Check file size limits (100MB for videos, 5MB for thumbnails)
2. Verify internet connection
3. Check browser console for errors

### Issue: "Invalid file type"
**Solution**: 
- Videos: Use MP4, WebM, AVI, MOV formats
- Thumbnails: Use JPG, PNG, WebP formats

### Issue: "Quota exceeded"
**Solution**: 
- Firebase free tier has 1GB storage limit
- Upgrade to paid plan for more storage

## File Size Limits

- **Videos**: 100MB maximum
- **Thumbnails**: 5MB maximum  
- **Avatars**: 2MB maximum

## Supported File Types

### Videos
- MP4 (recommended)
- WebM
- AVI
- MOV
- MKV

### Images (Thumbnails/Avatars)
- JPG/JPEG (recommended)
- PNG
- WebP
- GIF

## Storage Structure

```
/videos/
  /{videoId}/
    /video-filename.mp4
    
/thumbnails/
  /{videoId}/
    /thumbnail-filename.jpg
    
/avatars/
  /{userId}/
    /avatar-filename.jpg
```

## Monitoring Usage

1. Go to Firebase Console > Storage
2. Click on **Usage** tab
3. Monitor storage usage and bandwidth
4. Set up billing alerts if needed

## Troubleshooting Commands

### Check Storage Configuration
```javascript
// In browser console
console.log(firebase.storage());
```

### Test Upload Permissions
```javascript
// In browser console
firebase.storage().ref('test/test.txt').putString('test')
  .then(() => console.log('Upload works!'))
  .catch(err => console.error('Upload failed:', err));
```