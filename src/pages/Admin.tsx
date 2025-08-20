import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { seedFirebaseData } from '../utils/seedFirebase';
import { useVideo } from '../contexts/VideoContextWithCloudinary';

const Admin: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { videos, loading } = useVideo();

  const handleSeedData = async () => {
    if (videos.length > 0) {
      const confirm = window.confirm(
        'This will add sample data to your Firebase database. Continue?'
      );
      if (!confirm) return;
    }

    try {
      setIsSeeding(true);
      toast.loading('Seeding Firebase data...', { id: 'seeding' });
      
      const result = await seedFirebaseData();
      
      toast.success(
        `Successfully seeded ${result.users} users, ${result.videos} videos, ${result.comments} comments, and ${result.notifications} notifications!`,
        { id: 'seeding', duration: 5000 }
      );
      
      // Refresh the page to load new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed data. Check console for details.', { id: 'seeding' });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-youtube-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-youtube-dark rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            StreamRush Admin Panel
          </h1>
          
          <div className="grid gap-8">
            {/* Database Status */}
            <div className="bg-youtube-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Database Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Videos in Database:</span>
                  <span className="font-mono">
                    {loading ? 'Loading...' : videos.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Firebase Status:</span>
                  <span className="text-green-400">✅ Connected</span>
                </div>
              </div>
            </div>

            {/* Data Seeding */}
            <div className="bg-youtube-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Data Management</h2>
              <p className="text-gray-300 mb-6">
                Seed your Firebase database with sample YouTube-like content including videos, 
                channels, and comments to get started quickly.
              </p>
              
              <div className="space-y-4">
                <div className="bg-youtube-black rounded p-4">
                  <h3 className="font-semibold mb-2">Sample Data Includes:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 4 Sample channels (TechGuru, MusicLover, ProGamer, ChefMaster)</li>
                    <li>• 8 Sample videos with real thumbnails and metadata</li>
                    <li>• Sample comments and interactions</li>
                    <li>• Sample notifications for different user actions</li>
                    <li>• Proper categories and tags</li>
                    <li>• Realistic view counts and engagement metrics</li>
                  </ul>
                </div>
                
                <button
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isSeeding
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSeeding ? 'Seeding Data...' : 'Seed Sample Data'}
                </button>
              </div>
            </div>

            {/* Firebase Setup Instructions */}
            <div className="bg-youtube-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">⚠️ Firebase Setup Required</h2>
              <div className="space-y-4 text-gray-300">
                
                {/* Firestore Setup */}
                <div>
                  <p className="text-yellow-400 font-semibold mb-2">1. Firestore Database Setup:</p>
                  <div className="bg-youtube-black rounded p-3 space-y-1 text-sm">
                    <p>• Go to Firebase Console → Firestore Database</p>
                    <p>• Create database in "test mode"</p>
                    <p>• Set security rules to allow read/write</p>
                  </div>
                </div>

                {/* Storage Setup */}
                <div>
                  <p className="text-yellow-400 font-semibold mb-2">2. Firebase Storage Setup (for video uploads):</p>
                  <div className="bg-youtube-black rounded p-3 space-y-1 text-sm">
                    <p>• Go to Firebase Console → Storage</p>
                    <p>• Click "Get started" → "Start in test mode"</p>
                    <p>• Set storage rules to allow authenticated uploads</p>
                  </div>
                </div>

                {/* Quick Rules */}
                <div>
                  <p className="text-yellow-400 font-semibold mb-2">3. Quick Setup Rules:</p>
                  <div className="bg-youtube-black rounded p-3">
                    <p className="text-xs mb-2">Firestore Rules:</p>
                    <pre className="text-xs bg-gray-800 p-2 rounded overflow-x-auto mb-3">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                    <p className="text-xs mb-2">Storage Rules:</p>
                    <pre className="text-xs bg-gray-800 p-2 rounded overflow-x-auto">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-youtube-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
              <div className="space-y-3 text-gray-300">
                <p>1. Set up Firestore database (see above)</p>
                <p>2. Click "Seed Sample Data" to populate your database</p>
                <p>3. Go to the home page to see the videos</p>
                <p>4. Try uploading your own videos using the upload feature</p>
                <p>5. Test authentication by signing in/up</p>
                <p>6. Explore all features like comments, likes, subscriptions</p>
              </div>
            </div>

            {/* Firebase Console Link */}
            <div className="bg-youtube-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Firebase Console</h2>
              <p className="text-gray-300 mb-4">
                Monitor your data and manage your Firebase project:
              </p>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
              >
                Open Firebase Console
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;