import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Users,
  History,
  PlaySquare,
  Clock,
  ThumbsUp,
  Settings,
  HelpCircle,
  Flag,
  Gamepad2,
  Music,
  Trophy,
  Newspaper
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile = false }) => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const SidebarItem: React.FC<{
    to: string;
    icon: React.ReactNode;
    label: string;
    requireAuth?: boolean;
  }> = ({ to, icon, label, requireAuth = false }) => {
    if (requireAuth && !currentUser) return null;

    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-youtube-gray transition-all duration-200 cursor-pointer group ${
          isActive(to) ? 'bg-youtube-gray border-r-2 border-red-500' : ''
        }`}
        title={!isOpen ? label : ''}
      >
        <div className={`${isActive(to) ? 'text-red-500' : ''} group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        {(isOpen || isMobile) && <span className="text-sm font-medium">{label}</span>}
      </Link>
    );
  };

  return (
    <aside className={`fixed left-0 top-16 h-full bg-youtube-dark border-r border-youtube-gray overflow-y-auto transition-all duration-300 ease-in-out z-40 ${
      isMobile 
        ? isOpen 
          ? 'w-64 translate-x-0' 
          : 'w-64 -translate-x-full'
        : isOpen 
          ? 'w-64' 
          : 'w-16'
    }`}>
      <div className="p-3">
        {/* Main Navigation */}
        <div className="mb-6 space-y-1">
          <SidebarItem to="/" icon={<Home size={20} />} label="Home" />
          <SidebarItem to="/trending" icon={<TrendingUp size={20} />} label="Trending" />
          <SidebarItem
            to="/subscriptions"
            icon={<Users size={20} />}
            label="Subscriptions"
            requireAuth
          />
        </div>

        {/* Library */}
        {currentUser && (isOpen || isMobile) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-youtube-lightgray mb-3 px-3">
              Library
            </h3>
            <div className="space-y-1">
              <SidebarItem to="/history" icon={<History size={20} />} label="History" />
              <SidebarItem to="/playlists" icon={<PlaySquare size={20} />} label="Playlists" />
              <SidebarItem to="/liked" icon={<ThumbsUp size={20} />} label="Liked videos" />
              <SidebarItem to="/watch-later" icon={<Clock size={20} />} label="Watch later" />
            </div>
          </div>
        )}

        {/* Subscriptions */}
        {currentUser && (isOpen || isMobile) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-youtube-lightgray mb-3 px-3">
              Subscriptions
            </h3>
            {/* This would be populated with actual subscriptions */}
            <div className="px-3 py-2 text-sm text-youtube-lightgray">
              No subscriptions yet
            </div>
          </div>
        )}

        {/* Explore */}
        <div className="mb-6">
          {(isOpen || isMobile) && (
            <h3 className="text-sm font-semibold text-youtube-lightgray mb-3 px-3">
              Explore
            </h3>
          )}
          <div className="space-y-1">
            <Link to="/gaming" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-youtube-gray transition-all duration-200 cursor-pointer group" title={!(isOpen || isMobile) ? 'Gaming' : ''}>
              <div className="group-hover:scale-110 transition-transform duration-200">
                <Gamepad2 size={20} />
              </div>
              {(isOpen || isMobile) && <span className="text-sm font-medium">Gaming</span>}
            </Link>
            <Link to="/music" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-youtube-gray transition-all duration-200 cursor-pointer group" title={!(isOpen || isMobile) ? 'Music' : ''}>
              <div className="group-hover:scale-110 transition-transform duration-200">
                <Music size={20} />
              </div>
              {(isOpen || isMobile) && <span className="text-sm font-medium">Music</span>}
            </Link>
            <Link to="/sports" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-youtube-gray transition-all duration-200 cursor-pointer group" title={!(isOpen || isMobile) ? 'Sports' : ''}>
              <div className="group-hover:scale-110 transition-transform duration-200">
                <Trophy size={20} />
              </div>
              {(isOpen || isMobile) && <span className="text-sm font-medium">Sports</span>}
            </Link>
            <Link to="/news" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-youtube-gray transition-all duration-200 cursor-pointer group" title={!(isOpen || isMobile) ? 'News' : ''}>
              <div className="group-hover:scale-110 transition-transform duration-200">
                <Newspaper size={20} />
              </div>
              {(isOpen || isMobile) && <span className="text-sm font-medium">News</span>}
            </Link>
          </div>
        </div>

        {/* More from StreamRush */}
        <div className="mb-6">
          {(isOpen || isMobile) && (
            <h3 className="text-sm font-semibold text-youtube-lightgray mb-3 px-3">
              More from StreamRush
            </h3>
          )}
          <div className="space-y-1">
            <Link to="/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-youtube-gray transition-all duration-200 cursor-pointer group" title={!(isOpen || isMobile) ? 'Settings' : ''}>
              <div className="group-hover:scale-110 transition-transform duration-200">
                <Settings size={20} />
              </div>
              {(isOpen || isMobile) && <span className="text-sm font-medium">Settings</span>}
            </Link>
            <Link to="/report" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-youtube-gray transition-all duration-200 cursor-pointer group" title={!(isOpen || isMobile) ? 'Report history' : ''}>
              <div className="group-hover:scale-110 transition-transform duration-200">
                <Flag size={20} />
              </div>
              {(isOpen || isMobile) && <span className="text-sm font-medium">Report history</span>}
            </Link>
            <Link to="/help" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-youtube-gray transition-all duration-200 cursor-pointer group" title={!(isOpen || isMobile) ? 'Help' : ''}>
              <div className="group-hover:scale-110 transition-transform duration-200">
                <HelpCircle size={20} />
              </div>
              {(isOpen || isMobile) && <span className="text-sm font-medium">Help</span>}
            </Link>
          </div>
        </div>

        {/* Footer */}
        {(isOpen || isMobile) && (
          <div className="px-3 py-4 text-xs text-youtube-lightgray border-t border-youtube-gray">
            <p className="mb-2">
              About Press Copyright Contact us Creators Advertise Developers
            </p>
            <p className="mb-2">
              Terms Privacy Policy & Safety How StreamRush works Test new features
            </p>
            <p>© 2024 StreamRush</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;