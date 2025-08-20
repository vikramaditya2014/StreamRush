import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { VideoProvider } from './contexts/VideoContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <VideoProvider>
        <Router>
          <div className="min-h-screen bg-youtube-dark text-white">
            <Header onToggleSidebar={toggleSidebar} />
            <div className="flex">
              <Sidebar isOpen={sidebarOpen} />
              <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'ml-64' : 'ml-16'
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
          </div>
        </Router>
      </VideoProvider>
    </AuthProvider>
  );
}

export default App;