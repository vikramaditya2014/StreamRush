# Firebase Storage CORS Setup - Production Ready

## 🎯 Enable Real File Uploads (Development + Production)

This guide will configure Firebase Storage to work with:
- ✅ **Local Development** (localhost:3000, localhost:5173)
- ✅ **Vercel Deployments** (*.vercel.app)
- ✅ **Netlify Deployments** (*.netlify.app, *.netlify.com)
- ✅ **Firebase Hosting** (*.firebaseapp.com, *.web.app)

## 🚀 Quick Setup (Automated)

### Windows Users:
```powershell
# Run from project root directory
.\setup-firebase-storage.ps1
```

### Mac/Linux Users:
```bash
# Run from project root directory
chmod +x setup-firebase-storage.sh
./setup-firebase-storage.sh
```

## 🛠️ Manual Setup (Step by Step)

### Step 1: Install Google Cloud SDK

**Windows:**
1. Download from: https://cloud.google.com/sdk/docs/install-sdk
2. Run `GoogleCloudSDKInstaller.exe`
3. Follow the installation wizard
4. Restart PowerShell/Command Prompt

**Mac:**
```bash
# Using Homebrew
brew install --cask google-cloud-sdk

# Or download installer from:
# https://cloud.google.com/sdk/docs/install-sdk
```

**Linux:**
```bash
# Ubuntu/Debian
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Or follow: https://cloud.google.com/sdk/docs/install-sdk
```

### Step 2: Authenticate and Configure

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your Firebase project
gcloud config set project vidstream-98e50

# Verify authentication
gcloud auth list
```

### Step 3: Apply CORS Configuration

```bash
# Apply the CORS configuration (from project root)
gsutil cors set cors.json gs://vidstream-98e50.firebasestorage.app

# Verify CORS configuration
gsutil cors get gs://vidstream-98e50.firebasestorage.app
```

## 📋 CORS Configuration Details

The `cors.json` file includes origins for all major deployment platforms:

```json
{
  "origin": [
    "http://localhost:3000",     // Local development
    "https://localhost:3000",    // Local HTTPS
    "http://localhost:5173",     // Vite dev server
    "https://localhost:5173",    // Vite HTTPS
    "https://*.vercel.app",      // Vercel deployments
    "https://*.netlify.app",     // Netlify deployments
    "https://*.netlify.com",     // Netlify custom domains
    "https://*.firebaseapp.com", // Firebase hosting
    "https://*.web.app"          // Firebase web.app domains
  ]
}
```

## 🌐 Deployment-Specific Instructions

### Vercel Deployment:

1. **Environment Variables**: Make sure all Firebase environment variables are set in Vercel dashboard
2. **Build Settings**: 
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```
3. **Domain**: Your app will be available at `https://your-app.vercel.app`

### Netlify Deployment:

1. **Environment Variables**: Set Firebase variables in Netlify dashboard
2. **Build Settings**:
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   ```
3. **Domain**: Your app will be available at `https://your-app.netlify.app`

### Firebase Hosting:

1. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
2. **Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
3. **Domain**: Your app will be available at `https://vidstream-98e50.web.app`

## 🔧 Storage Rules (Already Configured)

Your `storage.rules` file is already properly configured:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Videos - authenticated users can upload to their own folder
    match /videos/{userId}/{allPaths=**} {
      allow read: if true; // Public read access
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Thumbnails - authenticated users can upload to their own folder
    match /thumbnails/{userId}/{allPaths=**} {
      allow read: if true; // Public read access
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ✅ Verification Steps

After setup, verify everything works:

1. **Local Testing**:
   ```bash
   npm run dev
   # Try uploading a video at http://localhost:3000/upload
   ```

2. **Production Testing**:
   - Deploy to your chosen platform
   - Try uploading a video on the live site
   - Check that files appear in Firebase Storage console

## 🎉 What You Get

After completing this setup:

- ✅ **Real File Uploads** - Actual video and thumbnail files stored in Firebase Storage
- ✅ **Progress Tracking** - Real-time upload progress indicators
- ✅ **Cross-Platform Support** - Works on all major deployment platforms
- ✅ **Production Ready** - No CORS errors in development or production
- ✅ **Automatic Fallback** - Demo mode still available if needed

## 🆘 Troubleshooting

### Common Issues:

1. **"gcloud not found"**:
   - Restart your terminal after installing Google Cloud SDK
   - Make sure SDK is added to your PATH

2. **"Permission denied"**:
   - Make sure you're authenticated: `gcloud auth login`
   - Verify you have access to the Firebase project

3. **"Bucket not found"**:
   - Check your project ID: `gcloud config get-value project`
   - Verify Firebase Storage is enabled in Firebase Console

4. **Still getting CORS errors**:
   - Wait 5-10 minutes for CORS changes to propagate
   - Clear browser cache and try again
   - Verify CORS config: `gsutil cors get gs://vidstream-98e50.firebasestorage.app`

## 📞 Support

If you encounter issues:
1. Check the browser console for specific error messages
2. Verify your Firebase project settings
3. Ensure all environment variables are correctly set
4. Try the demo mode fallback to test other functionality

---

**Ready to enable real uploads? Run the setup script or follow the manual steps above!** 🚀