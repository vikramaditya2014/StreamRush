import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { VideoProvider } from './contexts/VideoContextWithCloudinary';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CorsNotification from './components/CorsNotification';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Channel from './pages/Channel';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Trending from './pages/Trending';
import Subscriptions from './pages/Subscriptions';
import History from './pages/History';
import LikedVideos from './pages/LikedVideos';
import Playlists from './pages/Playlists';
import Playlist from './pages/Playlist';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  const [showCorsNotification, setShowCorsNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Listen for CORS errors from VideoContext
  React.useEffect(() => {
    const handleCorsError = () => {
      setShowCorsNotification(true);
    };

    window.addEventListener('corsError', handleCorsError);
    return () => window.removeEventListener('corsError', handleCorsError);
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <VideoProvider>
          <Router>
          <div className="min-h-screen bg-youtube-dark text-white">
            <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} />
            <div className="flex">
              <Sidebar isOpen={sidebarOpen} isMobile={isMobile} />
              {/* Mobile overlay */}
              {isMobile && sidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
              <main className={`flex-1 transition-all duration-300 ease-in-out ${
                isMobile 
                  ? 'ml-0' // No margin on mobile
                  : sidebarOpen 
                    ? 'ml-64' 
                    : 'ml-16'
              }`}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/watch/:id" element={<Watch />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/channel/:id" element={<Channel />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/liked" element={<LikedVideos />} />
                  <Route path="/playlists" element={<Playlists />} />
                  <Route path="/playlist/:id" element={<Playlist />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </main>
            </div>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#272727',
                  color: '#fff',
                  border: '1px solid #404040',
                },
              }}
            />
            <CorsNotification 
              show={showCorsNotification}
              onClose={() => setShowCorsNotification(false)}
            />
          </div>
          </Router>
        </VideoProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;