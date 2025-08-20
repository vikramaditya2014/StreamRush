# Deployment Guide

This guide will help you deploy the YouTube Clone to Firebase Hosting with Firestore and Firebase Storage.

## Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn
3. Firebase CLI
4. A Firebase project

## Quick Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable the following services:
   - Authentication (Email/Password and Google)
   - Firestore Database
   - Storage

### 4. Initialize Firebase in Your Project

```bash
firebase init
```

Select the following options:
- ✅ Firestore: Configure security rules and indexes files
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Storage: Configure a security rules file for Cloud Storage

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Get your Firebase config from Project Settings > General > Your apps
3. Fill in the environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 6. Deploy

```bash
# Deploy everything (hosting, rules, indexes)
npm run deploy

# Or deploy individually
npm run deploy:hosting    # Deploy only the web app
npm run deploy:rules      # Deploy only Firestore and Storage rules
npm run deploy:indexes    # Deploy only Firestore indexes
```

## Manual Setup Steps

### 1. Firebase Authentication Setup

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Email/Password authentication
3. Enable Google authentication:
   - Click on Google provider
   - Enable it
   - Add your domain to authorized domains

### 2. Firestore Database Setup

1. Go to Firebase Console > Firestore Database
2. Create database in production mode
3. The security rules will be deployed automatically

### 3. Firebase Storage Setup

1. Go to Firebase Console > Storage
2. Get started with default settings
3. The security rules will be deployed automatically

### 4. Configure CORS for Storage (if needed)

Create a `cors.json` file:

```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS settings:

```bash
gsutil cors set cors.json gs://your-project-id.appspot.com
```

## Environment-Specific Deployments

### Development

```bash
# Use development environment
cp .env.development .env
npm run build
firebase use development-project-id
firebase deploy
```

### Production

```bash
# Use production environment
cp .env.production .env
npm run build
firebase use production-project-id
firebase deploy
```

## Custom Domain Setup

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the verification steps
4. Update DNS records as instructed

## Monitoring and Analytics

### Enable Firebase Analytics

1. Go to Firebase Console > Analytics
2. Enable Google Analytics
3. Follow the setup wizard

### Performance Monitoring

1. Go to Firebase Console > Performance
2. Enable Performance Monitoring
3. The SDK is already configured in the app

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Make sure all environment variables are set
   - Check TypeScript errors: `npm run lint`
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Authentication Issues**
   - Verify Firebase config in `.env`
   - Check authorized domains in Firebase Console
   - Ensure authentication methods are enabled

3. **Firestore Permission Errors**
   - Deploy security rules: `npm run deploy:rules`
   - Check rules in Firebase Console > Firestore > Rules

4. **Storage Upload Issues**
   - Deploy storage rules: `npm run deploy:rules`
   - Check CORS configuration
   - Verify file size limits

### Debugging

1. **Check Firebase logs**
   ```bash
   firebase functions:log
   ```

2. **Local debugging**
   ```bash
   npm run dev
   ```

3. **Preview build locally**
   ```bash
   npm run build
   npm run preview
   ```

## Performance Optimization

### 1. Enable Compression

Firebase Hosting automatically enables gzip compression.

### 2. Caching Strategy

The `firebase.json` includes caching headers for static assets.

### 3. Bundle Analysis

```bash
npm run build -- --analyze
```

### 4. Image Optimization

- Use WebP format for thumbnails
- Implement lazy loading for video thumbnails
- Compress images before upload

## Security Checklist

- ✅ Environment variables are not committed to git
- ✅ Firestore security rules are properly configured
- ✅ Storage security rules restrict access appropriately
- ✅ Authentication is required for sensitive operations
- ✅ CORS is configured correctly
- ✅ File upload size limits are enforced

## Backup Strategy

### 1. Firestore Backup

```bash
gcloud firestore export gs://your-backup-bucket/firestore-backup
```

### 2. Storage Backup

```bash
gsutil -m cp -r gs://your-project-id.appspot.com gs://your-backup-bucket/storage-backup
```

## Scaling Considerations

1. **Firestore Limits**
   - 1 write per second per document
   - 10,000 writes per second per database

2. **Storage Limits**
   - 5GB free tier
   - Consider CDN for video delivery at scale

3. **Authentication Limits**
   - 100 sign-ups per hour for free tier

## Support

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [troubleshooting section](#troubleshooting)
3. Open an issue in the repository