import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Video, Bell, User, LogOut, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-youtube-dark border-b border-youtube-gray z-50 backdrop-blur-sm bg-opacity-95">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo and Menu */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-youtube-gray rounded-full transition-all duration-200 hover:scale-105"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
              <Play size={18} className="text-white ml-0.5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              StreamRush
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="flex group">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-youtube-dark border border-youtube-gray rounded-l-full px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all duration-200 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="bg-youtube-gray border border-l-0 border-youtube-gray rounded-r-full px-6 py-2.5 hover:bg-gray-600 transition-all duration-200 group-hover:bg-red-600 group-hover:border-red-600"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {currentUser ? (
            <>
              <Link
                to="/upload"
                className="p-2 hover:bg-youtube-gray rounded-full transition-all duration-200 hover:scale-105 group"
                title="Upload Video"
              >
                <Video size={20} className="group-hover:text-red-400 transition-colors" />
              </Link>
              <button 
                className="p-2 hover:bg-youtube-gray rounded-full transition-all duration-200 hover:scale-105 relative group" 
                title="Notifications"
              >
                <Bell size={20} className="group-hover:text-yellow-400 transition-colors" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full overflow-hidden hover:ring-2 hover:ring-red-500 transition-all duration-200 hover:scale-105"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                      <User size={18} />
                    </div>
                  )}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-youtube-gray rounded-xl shadow-2xl py-2 z-50 border border-gray-600 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-600">
                      <p className="font-semibold text-white">{userProfile?.displayName || 'Demo User'}</p>
                      <p className="text-sm text-youtube-lightgray">{userProfile?.email || 'demo@streamrush.com'}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-youtube-dark"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      <span>Your channel</span>
                    </Link>
                    <Link
                      to="/history"
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-youtube-dark"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>History</span>
                    </Link>
                    <Link
                      to="/playlists"
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-youtube-dark"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>Your playlists</span>
                    </Link>
                    <hr className="my-2 border-gray-600" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-youtube-dark w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-2 border border-red-500 text-red-500 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
            >
              <User size={16} />
              <span className="font-medium">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;