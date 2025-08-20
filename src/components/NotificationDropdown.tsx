import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Settings, Check, Trash2, Eye } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const {
    notifications,
    unreadCount,
    preferences,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.videoId) {
      navigate(`/watch/${notification.data.videoId}`);
    } else if (notification.data?.channelId) {
      navigate(`/channel/${notification.data.channelId}`);
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'video_upload':
        return '📹';
      case 'comment':
        return '💬';
      case 'like':
        return '👍';
      case 'subscription':
        return '🔔';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const NotificationSettings = () => (
    <div className="p-4 border-t border-youtube-gray">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Notification Settings</h3>
        <button
          onClick={() => setShowSettings(false)}
          className="text-youtube-lightgray hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="space-y-3">
        {Object.entries(preferences).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm text-youtube-lightgray capitalize">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </label>
            <button
              onClick={() => updatePreferences({ [key]: !value })}
              className={`w-10 h-6 rounded-full transition-colors ${
                value ? 'bg-youtube-red' : 'bg-youtube-gray'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  value ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-youtube-gray rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-youtube-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-youtube-dark border border-youtube-gray rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-youtube-gray">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Notifications</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-youtube-lightgray hover:text-white rounded"
                  title="Settings"
                >
                  <Settings size={16} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 text-youtube-lightgray hover:text-white rounded"
                    title="Mark all as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="p-1 text-youtube-lightgray hover:text-white rounded"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && <NotificationSettings />}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-youtube-lightgray">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-youtube-lightgray">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-youtube-gray">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-youtube-gray cursor-pointer transition-colors ${
                      !notification.read ? 'bg-youtube-gray bg-opacity-30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-white' : 'text-youtube-lightgray'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-youtube-lightgray mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-youtube-lightgray mt-2">
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-youtube-lightgray hover:text-white rounded"
                                title="Mark as read"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-youtube-lightgray hover:text-red-400 rounded"
                              title="Delete"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Thumbnail */}
                        {notification.data?.thumbnailUrl && (
                          <div className="mt-2">
                            <img
                              src={notification.data.thumbnailUrl}
                              alt=""
                              className="w-16 h-9 object-cover rounded"
                            />
                          </div>
                        )}

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-youtube-red rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-youtube-gray text-center">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="text-sm text-youtube-red hover:text-red-400 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;