import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, Settings, Filter, X, Eye } from 'lucide-react';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'video_upload' | 'comment' | 'like' | 'subscription'>('all');
  const [showSettings, setShowSettings] = useState(false);
  
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

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

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

  const getFilterCount = (filterType: string) => {
    if (filterType === 'all') return notifications.length;
    if (filterType === 'unread') return unreadCount;
    return notifications.filter(n => n.type === filterType).length;
  };

  if (loading) {
    return (
      <div className="pt-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-youtube-red"></div>
            <span className="ml-3 text-youtube-lightgray">Loading notifications...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 px-6 min-h-screen bg-youtube-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Bell size={28} className="text-youtube-red" />
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-youtube-red text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-youtube-lightgray hover:text-white rounded-lg hover:bg-youtube-gray transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-2 text-youtube-lightgray hover:text-white rounded-lg hover:bg-youtube-gray transition-colors"
                title="Mark all as read"
              >
                <Check size={20} />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-2 text-youtube-lightgray hover:text-red-400 rounded-lg hover:bg-youtube-gray transition-colors"
                title="Clear all"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-youtube-dark border border-youtube-gray rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Notification Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-youtube-lightgray hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-youtube-gray rounded-lg">
                  <label className="text-sm text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <button
                    onClick={() => updatePreferences({ [key]: !value })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-youtube-red' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'video_upload', label: 'New Videos' },
            { key: 'comment', label: 'Comments' },
            { key: 'like', label: 'Likes' },
            { key: 'subscription', label: 'Subscriptions' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-youtube-red text-white'
                  : 'bg-youtube-gray text-youtube-lightgray hover:text-white hover:bg-gray-600'
              }`}
            >
              {label} ({getFilterCount(key)})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={64} className="mx-auto mb-4 text-youtube-lightgray opacity-50" />
            <h2 className="text-xl font-semibold text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h2>
            <p className="text-youtube-lightgray">
              {filter === 'all' 
                ? "We'll notify you when something happens"
                : `No ${filter.replace('_', ' ')} notifications found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-4 rounded-lg border transition-all cursor-pointer hover:bg-youtube-gray ${
                  !notification.read 
                    ? 'bg-youtube-dark border-youtube-red border-opacity-50' 
                    : 'bg-youtube-dark border-youtube-gray hover:border-gray-500'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-3xl">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 ${
                          !notification.read ? 'text-white' : 'text-youtube-lightgray'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-youtube-lightgray mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-youtube-lightgray">
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 text-youtube-lightgray hover:text-white rounded"
                            title="Mark as read"
                          >
                            <Eye size={16} />
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
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {notification.data?.thumbnailUrl && (
                      <div className="mt-3">
                        <img
                          src={notification.data.thumbnailUrl}
                          alt=""
                          className="w-20 h-11 object-cover rounded"
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
    </div>
  );
};

export default Notifications;