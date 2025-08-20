# YouTube Clone

A full-featured YouTube clone built with React, TypeScript, Firebase, and Tailwind CSS. This application replicates the core functionality of YouTube including video upload, streaming, user authentication, comments, subscriptions, and more.

## 🚀 Features

### Core Features
- **User Authentication**: Sign up/Sign in with email or Google
- **Video Upload**: Upload videos with thumbnails and metadata
- **Video Streaming**: Watch videos with custom player controls
- **Search**: Search videos by title, description, and tags
- **Comments**: Add, view, and interact with comments
- **Likes/Dislikes**: Like and dislike videos
- **Subscriptions**: Subscribe to channels and view subscription feed
- **Playlists**: Create and manage video playlists
- **Channel Pages**: View channel information and videos
- **Trending**: Discover trending videos
- **History**: Track watched videos (when signed in)
- **Responsive Design**: Works on desktop, tablet, and mobile

### Additional Features
- **Real-time Updates**: Live updates for likes, views, and comments
- **Category Filtering**: Filter videos by categories
- **Advanced Search**: Filter search results by date, duration, etc.
- **User Profiles**: Manage your channel and view analytics
- **Dark Theme**: YouTube-like dark interface
- **File Upload**: Support for video and image uploads
- **Security**: Firestore security rules and authentication

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Video Player**: React Player
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Set up Firebase Storage
   - Copy your Firebase config

4. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Deploy Firebase Rules**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy --only firestore:rules,storage:rules,firestore:indexes
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Deploy to Firebase Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or connect your GitHub repository

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── VideoCard.tsx   # Video display card
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── VideoContext.tsx # Video data management
├── pages/              # Page components
│   ├── Home.tsx        # Home page with video grid
│   ├── Watch.tsx       # Video player page
│   ├── Upload.tsx      # Video upload page
│   ├── Login.tsx       # Authentication pages
│   └── ...
├── config/             # Configuration files
│   └── firebase.ts     # Firebase configuration
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
└── App.tsx             # Main application component
```

## 🔧 Configuration

### Firebase Setup

1. **Authentication**
   - Enable Email/Password authentication
   - Enable Google authentication
   - Configure authorized domains

2. **Firestore Database**
   - Create database in production mode
   - Deploy the provided security rules
   - Create the required indexes

3. **Storage**
   - Set up Firebase Storage
   - Deploy the provided storage rules
   - Configure CORS if needed

### Environment Variables

All environment variables should be prefixed with `VITE_` for Vite to include them in the build:

- `VITE_FIREBASE_API_KEY`: Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Your Firebase app ID

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```

## 📱 Features Overview

### Authentication
- Email/password registration and login
- Google OAuth integration
- Protected routes for authenticated users
- User profile management

### Video Management
- Upload videos with metadata (title, description, tags, category)
- Thumbnail upload and management
- Video processing and storage
- View count tracking

### Social Features
- Like and dislike videos
- Comment on videos
- Subscribe to channels
- Create and manage playlists

### Discovery
- Home feed with latest videos
- Trending videos page
- Search with filters
- Category-based filtering

### User Experience
- Responsive design for all devices
- Dark theme matching YouTube's design
- Real-time updates
- Smooth navigation and loading states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- YouTube for the design inspiration
- Firebase for the backend infrastructure
- React team for the amazing framework
- All the open-source libraries used in this project

## 📞 Support

If you have any questions or need help with setup, please open an issue in the repository.

---

**Note**: This is a clone project for educational purposes. It is not affiliated with YouTube or Google.