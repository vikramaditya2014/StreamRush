import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Video as VideoIcon, Settings, Upload, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContextWithCloudinary';
import { Video } from '../types';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'analytics' | 'settings'>('videos');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    channelName: '',
    bio: '',
    location: ''
  });
  
  const { currentUser, userProfile, updateProfile } = useAuth();
  const { getChannelVideos, videos } = useVideo();
  const navigate = useNavigate();

  // Demo mode support
  const isDemoMode = !currentUser;
  const demoProfile = {
    displayName: 'Demo User',
    channelName: 'Demo Channel',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    subscribers: 1250,
    bio: 'Welcome to my demo channel! This is a sample profile showcasing StreamRush features.'
  };
  
  const currentProfile = isDemoMode ? demoProfile : userProfile;

  const loadUserVideos = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const videos = await getChannelVideos(currentUser.uid);
      setUserVideos(videos);
    } catch (error) {
      console.error('Error loading user videos:', error);
      // Set empty array as fallback
      setUserVideos([]);
      toast.error('Failed to load your videos. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, getChannelVideos]);

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, show user's uploaded videos from the global videos list
      const demoUserVideos = videos.filter(video => video.uploaderId === 'demo-user');
      setUserVideos(demoUserVideos);
      setLoading(false);
      return;
    }
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    loadUserVideos();
  }, [currentUser, videos, isDemoMode, navigate, loadUserVideos]);

  const totalViews = userVideos.reduce((total, video) => total + video.views, 0);
  const totalLikes = userVideos.reduce((total, video) => total + video.likes, 0);

  const handleEditProfile = () => {
    setEditForm({
      displayName: currentProfile?.displayName || '',
      channelName: currentProfile?.channelName || '',
      bio: (currentProfile as any)?.bio || '',
      location: (currentProfile as any)?.location || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (isDemoMode) {
      toast.success('Profile updated! (Demo Mode)');
      setIsEditing(false);
      return;
    }

    if (!editForm.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        displayName: editForm.displayName,
        channelName: editForm.channelName,
        bio: editForm.bio,
        location: editForm.location
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      displayName: '',
      channelName: '',
      bio: '',
      location: ''
    });
  };

  if (!isDemoMode && (!currentUser || !userProfile)) {
    return (
      <div className="pt-16 px-6 text-center">
        <div className="max-w-md mx-auto mt-20">
          <User size={64} className="mx-auto mb-4 text-youtube-lightgray" />
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-youtube-lightgray mb-6">
            Please sign in to view your profile
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-16 px-6">
        <div className="animate-pulse">
          <div className="h-32 bg-youtube-gray rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-video bg-youtube-gray rounded-lg"></div>
                <div className="h-4 bg-youtube-gray rounded"></div>
                <div className="h-3 bg-youtube-gray rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 px-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-youtube-gray to-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
        {isDemoMode && (
          <div className="mb-4">
            <span className="px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-full">Demo Mode</span>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-red-500/20">
            {currentProfile?.photoURL ? (
              <img
                src={currentProfile.photoURL}
                alt={currentProfile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold">
                {currentProfile?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Channel Name</label>
                  <input
                    type="text"
                    value={editForm.channelName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, channelName: e.target.value }))}
                    className="input-field w-full max-w-md"
                    placeholder="Enter channel name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="input-field w-full max-w-md"
                    placeholder="Enter display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="input-field w-full max-w-md h-20 resize-none"
                    placeholder="Tell viewers about your channel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field w-full max-w-md"
                    placeholder="Enter your location"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {currentProfile?.channelName}
                </h1>
                <p className="text-youtube-lightgray mb-2">{currentProfile?.displayName}</p>
                {(currentProfile as any)?.bio && (
                  <p className="text-gray-300 mb-2 max-w-2xl">{(currentProfile as any).bio}</p>
                )}
                {(currentProfile as any)?.location && (
                  <p className="text-gray-400 mb-4 text-sm">📍 {(currentProfile as any).location}</p>
                )}
              </>
            )}
            
            {!isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center bg-black/20 rounded-lg p-3">
                  <div className="text-xl font-bold text-red-400">
                    {currentProfile?.subscribers?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-youtube-lightgray">Subscribers</div>
                </div>
                
                <div className="text-center bg-black/20 rounded-lg p-3">
                  <div className="text-xl font-bold text-red-400">
                    {userVideos.length}
                  </div>
                  <div className="text-sm text-youtube-lightgray">Videos</div>
                </div>
                
                <div className="text-center bg-black/20 rounded-lg p-3">
                  <div className="text-xl font-bold text-red-400">
                    {totalViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-youtube-lightgray">Total views</div>
                </div>
                
                <div className="text-center bg-black/20 rounded-lg p-3">
                  <div className="text-xl font-bold text-red-400">
                    {totalLikes.toLocaleString()}
                  </div>
                  <div className="text-sm text-youtube-lightgray">Total likes</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isSaving 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                >
                  <Save size={16} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isSaving 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-youtube-gray hover:bg-gray-600'
                  } text-white`}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/upload')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Upload size={16} />
                  <span>Upload</span>
                </button>
                
                <button 
                  onClick={handleEditProfile}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-youtube-gray mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'videos'
                ? 'border-youtube-red text-white'
                : 'border-transparent text-youtube-lightgray hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <VideoIcon size={16} />
              <span>Your videos</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'border-youtube-red text-white'
                : 'border-transparent text-youtube-lightgray hover:text-white'
            }`}
          >
            Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'border-youtube-red text-white'
                : 'border-transparent text-youtube-lightgray hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings size={16} />
              <span>Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'videos' && (
          <div>
            {userVideos.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Your videos ({userVideos.length})</h2>
                  <button
                    onClick={() => navigate('/upload')}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Upload size={16} />
                    <span>Upload new video</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <VideoIcon size={64} className="mx-auto mb-4 text-youtube-lightgray" />
                <h2 className="text-xl font-semibold mb-2">No videos uploaded yet</h2>
                <p className="text-youtube-lightgray mb-6">
                  Upload your first video to get started
                </p>
                <button
                  onClick={() => navigate('/upload')}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Upload size={16} />
                  <span>Upload video</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Channel Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Total Views</h3>
                <div className="text-3xl font-bold text-youtube-red">
                  {totalViews.toLocaleString()}
                </div>
                <p className="text-sm text-youtube-lightgray mt-1">
                  Across all videos
                </p>
              </div>
              
              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Total Likes</h3>
                <div className="text-3xl font-bold text-youtube-red">
                  {totalLikes.toLocaleString()}
                </div>
                <p className="text-sm text-youtube-lightgray mt-1">
                  From all videos
                </p>
              </div>
              
              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Subscribers</h3>
                <div className="text-3xl font-bold text-youtube-red">
                  {userProfile.subscribers.toLocaleString()}
                </div>
                <p className="text-sm text-youtube-lightgray mt-1">
                  Current count
                </p>
              </div>
              
              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Videos</h3>
                <div className="text-3xl font-bold text-youtube-red">
                  {userVideos.length}
                </div>
                <p className="text-sm text-youtube-lightgray mt-1">
                  Total uploaded
                </p>
              </div>
            </div>

            {userVideos.length > 0 && (
              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performing Videos</h3>
                <div className="space-y-4">
                  {userVideos
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((video, index) => (
                      <div key={video.id} className="flex items-center space-x-4">
                        <div className="text-youtube-red font-bold">#{index + 1}</div>
                        <div className="w-16 aspect-video rounded overflow-hidden">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-1">{video.title}</h4>
                          <div className="text-sm text-youtube-lightgray">
                            {video.views.toLocaleString()} views • {video.likes.toLocaleString()} likes
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Channel Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Channel Name</label>
                    <input
                      type="text"
                      value={currentProfile?.channelName || ''}
                      className="input-field w-full"
                      placeholder="Enter channel name"
                      disabled={!isDemoMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name</label>
                    <input
                      type="text"
                      value={currentProfile?.displayName || ''}
                      className="input-field w-full"
                      placeholder="Enter display name"
                      disabled={!isDemoMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Channel Description</label>
                    <textarea
                      value={(currentProfile as any)?.bio || ''}
                      className="input-field w-full h-24 resize-none"
                      placeholder="Tell viewers about your channel"
                      disabled={!isDemoMode}
                    />
                  </div>
                  {isDemoMode && (
                    <button
                      onClick={() => toast.success('Settings saved! (Demo Mode)')}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Make channel public</h4>
                      <p className="text-sm text-youtube-lightgray">Allow others to find and view your channel</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show subscriber count</h4>
                      <p className="text-sm text-youtube-lightgray">Display your subscriber count publicly</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Allow comments</h4>
                      <p className="text-sm text-youtube-lightgray">Let viewers comment on your videos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email notifications</h4>
                      <p className="text-sm text-youtube-lightgray">Receive updates about your channel via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push notifications</h4>
                      <p className="text-sm text-youtube-lightgray">Get notified about new subscribers and comments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;