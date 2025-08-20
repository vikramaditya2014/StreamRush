# Firebase Setup Instructions

## Fix: Firebase Auth Unauthorized Domain Error

If you're getting the error `Firebase: Error (auth/unauthorized-domain)`, follow these steps:

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `vidstream-98e50`

### Step 2: Configure Authorized Domains
1. Click on **Authentication** in the left sidebar
2. Click on the **Settings** tab
3. Scroll down to **Authorized domains** section
4. Click **Add domain** button

### Step 3: Add Required Domains
Add the following domains one by one:

- `localhost` (for development)
- `127.0.0.1` (alternative localhost)
- Your production domain (when deploying)

### Step 4: Save Changes
After adding the domains, the changes should take effect immediately.

### Step 5: Test Authentication
1. Restart your development server: `npm run dev`
2. Try logging in with Google or email/password
3. The unauthorized domain error should be resolved

## Additional Firebase Configuration

### Enable Authentication Methods
1. In Firebase Console > Authentication > Sign-in method
2. Enable the following providers:
   - **Email/Password**: Enable this provider
   - **Google**: Enable and configure OAuth consent screen

### Firestore Database Setup
1. Go to **Firestore Database** in Firebase Console
2. Create database in **test mode** (for development)
3. Set up security rules as needed

### Storage Setup
1. Go to **Storage** in Firebase Console
2. Get started with default security rules
3. Configure for file uploads (videos, thumbnails, avatars)

## Environment Variables
Make sure your `.env` file has all required Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Troubleshooting

### Common Issues:
1. **Domain not authorized**: Add localhost to authorized domains
2. **API key restrictions**: Check API key restrictions in Google Cloud Console
3. **CORS issues**: Ensure proper domain configuration
4. **Popup blocked**: Allow popups for Google authentication

### Development vs Production:
- **Development**: Use `localhost` and `127.0.0.1`
- **Production**: Add your actual domain (e.g., `yourdomain.com`, `www.yourdomain.com`)

## Security Notes
- Never commit `.env` files to version control
- Use different Firebase projects for development and production
- Configure proper Firestore security rules before going live
- Enable App Check for production apps