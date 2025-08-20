# 🚀 Deployment Guide - StreamRush YouTube Clone

This guide covers deploying your YouTube clone to popular platforms with real file upload functionality.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ **Firebase Storage CORS configured** (see `STORAGE_CORS_FIX.md`)
- ✅ **All environment variables ready** (from `.env` file)
- ✅ **Project builds successfully** (`npm run build`)
- ✅ **Firebase project configured** and accessible

## 🌐 Platform-Specific Deployment

### 1. Vercel Deployment

#### Quick Deploy:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/streamrush)

#### Manual Deployment:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # From project root
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add these environment variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=vidstream-98e50.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=vidstream-98e50
   VITE_FIREBASE_STORAGE_BUCKET=vidstream-98e50.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

#### Configuration:
- ✅ `vercel.json` already configured
- ✅ SPA routing handled
- ✅ Security headers included

### 2. Netlify Deployment

#### Quick Deploy:
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/streamrush)

#### Manual Deployment:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**:
   ```bash
   # From project root
   netlify init
   netlify deploy --prod
   ```

4. **Set Environment Variables** in Netlify Dashboard:
   - Go to Site settings > Environment variables
   - Add the same Firebase variables as above

#### Configuration:
- ✅ `netlify.toml` already configured
- ✅ SPA routing handled
- ✅ Build optimization included

### 3. Firebase Hosting

#### Setup:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Hosting**:
   ```bash
   firebase init hosting
   ```
   - Select your existing project (`vidstream-98e50`)
   - Set public directory to `dist`
   - Configure as single-page app: `Yes`
   - Don't overwrite `index.html`

4. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

#### Configuration:
- ✅ Environment variables automatically available
- ✅ Same Firebase project integration
- ✅ Optimal performance

## 🔧 Environment Variables Reference

Make sure these are set in your deployment platform:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=vidstream-98e50.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vidstream-98e50
VITE_FIREBASE_STORAGE_BUCKET=vidstream-98e50.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## 🧪 Testing Your Deployment

After deployment, test these features:

### 1. Authentication:
- ✅ User registration
- ✅ User login
- ✅ Google OAuth login
- ✅ Profile management

### 2. Video Upload:
- ✅ File selection
- ✅ Upload progress
- ✅ Real file storage (not demo mode)
- ✅ Thumbnail upload

### 3. Video Playback:
- ✅ Video streaming
- ✅ Comments system
- ✅ Like/dislike functionality
- ✅ Subscription system

### 4. Search & Discovery:
- ✅ Video search
- ✅ Trending videos
- ✅ Category filtering
- ✅ User profiles

## 🔍 Troubleshooting Deployment Issues

### Common Issues:

1. **Build Failures**:
   ```bash
   # Check for TypeScript errors
   npm run type-check
   
   # Check for linting issues
   npm run lint
   
   # Test build locally
   npm run build
   ```

2. **Environment Variables Not Working**:
   - Verify all variables are set in platform dashboard
   - Check variable names match exactly (case-sensitive)
   - Redeploy after setting variables

3. **CORS Errors in Production**:
   - Verify CORS configuration includes your domain
   - Wait 5-10 minutes for CORS changes to propagate
   - Check Firebase Storage CORS settings

4. **Routing Issues (404 on refresh)**:
   - Verify SPA redirect rules are configured
   - Check `vercel.json` or `netlify.toml` settings

5. **Firebase Connection Issues**:
   - Verify Firebase project is active
   - Check Firebase quotas and billing
   - Ensure all Firebase services are enabled

## 📊 Performance Optimization

### Recommended Settings:

1. **Build Optimization**:
   ```json
   // vite.config.ts
   {
     "build": {
       "rollupOptions": {
         "output": {
           "manualChunks": {
             "vendor": ["react", "react-dom"],
             "firebase": ["firebase/app", "firebase/auth", "firebase/firestore"]
           }
         }
       }
     }
   }
   ```

2. **Caching Headers** (already configured):
   - Static assets: 1 year cache
   - HTML: No cache
   - API responses: Appropriate cache headers

3. **Image Optimization**:
   - Use WebP format for thumbnails
   - Implement lazy loading
   - Compress images before upload

## 🎉 Post-Deployment

After successful deployment:

1. **Update Firebase Authorized Domains**:
   - Go to Firebase Console > Authentication > Settings
   - Add your production domain to authorized domains

2. **Monitor Performance**:
   - Set up Firebase Analytics
   - Monitor error rates
   - Track user engagement

3. **Set Up Custom Domain** (optional):
   - Configure DNS settings
   - Set up SSL certificates
   - Update CORS configuration if needed

## 📞 Support

If you encounter deployment issues:

1. Check platform-specific documentation
2. Verify all configuration files are correct
3. Test locally with production build
4. Check browser console for errors
5. Review deployment logs

---

**Your YouTube clone is now ready for production! 🚀**

Choose your preferred platform and follow the steps above to deploy your app with full file upload functionality.