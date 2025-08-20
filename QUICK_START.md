# YouTube Clone - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- Firebase account
- Git

### 1. Setup Project
```bash
# Clone and navigate to project
cd youtube-clone

# Install dependencies
npm install

# Make setup script executable
chmod +x setup.sh
```

### 2. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enable these services:
   - **Authentication** (Email/Password + Google)
   - **Firestore Database** (Production mode)
   - **Storage**

#### Get Firebase Config
1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Click "Web" icon to create web app
4. Copy the config object

#### Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Firebase config
nano .env
```

Add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy

#### Option A: Automated Setup (Recommended)
```bash
./setup.sh
```
This script will:
- Install Firebase CLI
- Login to Firebase
- Initialize project
- Deploy rules and hosting
- Give you the live URL

#### Option B: Manual Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Deploy rules first
npm run deploy:rules

# Build and deploy
npm run deploy
```

### 4. Configure Authentication

#### Enable Authentication Methods
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable **Email/Password**
3. Enable **Google**:
   - Click Google provider
   - Enable it
   - Add your domain to authorized domains

### 5. Test Your App

#### Local Development
```bash
npm run dev
```
Visit: http://localhost:5173

#### Production
Your app is live at: `https://your-project-id.web.app`

## 🎯 Key Features Ready to Use

### ✅ User Authentication
- Sign up with email/password
- Google OAuth login
- User profiles and channels

### ✅ Video Management
- Upload videos with thumbnails
- Video streaming and playback
- Categories and tags

### ✅ Social Features
- Like/dislike videos
- Comments and replies
- Subscribe to channels
- Create playlists

### ✅ Discovery
- Home feed with latest videos
- Search with filters
- Trending videos
- Category browsing

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm test                # Run unit tests
npm run test:e2e        # Run E2E tests

# Deployment
npm run deploy          # Deploy everything
npm run deploy:hosting  # Deploy only web app
npm run deploy:rules    # Deploy only Firebase rules
```

## 🔧 Customization

### Styling
- Edit `src/index.css` for global styles
- Modify `tailwind.config.js` for theme customization
- Update colors in CSS variables

### Features
- Add new pages in `src/pages/`
- Create components in `src/components/`
- Extend contexts in `src/contexts/`

### Firebase Rules
- Modify `firestore.rules` for database security
- Update `storage.rules` for file upload security

## 🚨 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Firebase Issues
```bash
# Re-login to Firebase
firebase logout
firebase login

# Check project status
firebase projects:list
firebase use your-project-id
```

### Environment Issues
- Ensure all `VITE_` prefixed variables are set in `.env`
- Check Firebase config matches your project
- Verify authorized domains in Firebase Console

## 📱 Mobile Responsive

The app is fully responsive and works on:
- ✅ Desktop (Chrome, Firefox, Safari)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)

## 🔒 Security

- ✅ Firebase security rules implemented
- ✅ Authentication required for uploads
- ✅ File size limits enforced
- ✅ Input validation on all forms

## 📈 Scaling

### Free Tier Limits
- **Firestore**: 50K reads, 20K writes per day
- **Storage**: 5GB total
- **Authentication**: 100 sign-ups per hour

### Upgrade Path
- Firebase Blaze plan for production
- CDN for video delivery
- Cloud Functions for advanced features

## 🎉 You're Ready!

Your YouTube Clone is now:
- ✅ **Fully functional** with all core features
- ✅ **Production ready** with proper security
- ✅ **Mobile responsive** for all devices
- ✅ **Scalable** with Firebase backend
- ✅ **Customizable** with modern tech stack

Start uploading videos and building your community! 🎬✨