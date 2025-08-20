import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Bell, Video as VideoIcon, PlaySquare } from 'lucide-react';
import { useVideo } from '../contexts/VideoContextWithCloudinary';
import { useAuth } from '../contexts/AuthContext';
import { Video, User } from '../types';
import VideoCard from '../components/VideoCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Channel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [channelData, setChannelData] = useState<User | null>(null);
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'playlists' | 'about'>('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const { getChannelVideos, subscribeToChannel, unsubscribeFromChannel } = useVideo();
  const { currentUser, userProfile } = useAuth();

  const loadChannelData = useCallback(async () => {
    if (!id) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (userDoc.exists()) {
        setChannelData(userDoc.data() as User);
      }
    } catch (error) {
      console.error('Error loading channel data:', error);
    }
  }, [id]);

  const loadChannelVideos = useCallback(async () => {
    if (!id) return;
    
    try {
      const videos = await getChannelVideos(id);
      setChannelVideos(videos);
    } catch (error) {
      console.error('Error loading channel videos:', error);
    } finally {
      setLoading(false);
    }
  }, [id, getChannelVideos]);

  useEffect(() => {
    if (id) {
      loadChannelData();
      loadChannelVideos();
    }
  }, [id, loadChannelData, loadChannelVideos]);

  useEffect(() => {
    if (userProfile && channelData) {
      setIsSubscribed(userProfile.subscribedTo.includes(channelData.uid));
    }
  }, [userProfile, channelData]);

  const handleSubscribe = async () => {
    if (!currentUser || !channelData) return;
    
    try {
      if (isSubscribed) {
        await unsubscribeFromChannel(channelData.uid);
        setIsSubscribed(false);
        setChannelData(prev => prev ? { ...prev, subscribers: prev.subscribers - 1 } : null);
      } else {
        await subscribeToChannel(channelData.uid);
        setIsSubscribed(true);
        setChannelData(prev => prev ? { ...prev, subscribers: prev.subscribers + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M subscribers`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K subscribers`;
    }
    return `${count} subscribers`;
  };

  if (loading || !channelData) {
    return (
      <div className="pt-16 px-6">
        <div className="animate-pulse">
          <div className="h-48 bg-youtube-gray rounded-lg mb-6"></div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-youtube-gray rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-youtube-gray rounded w-48"></div>
              <div className="h-4 bg-youtube-gray rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Channel Banner */}
      <div className="h-48 bg-gradient-to-r from-youtube-red to-red-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Channel Info */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-youtube-dark">
            {channelData.photoURL ? (
              <img
                src={channelData.photoURL}
                alt={channelData.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-youtube-red flex items-center justify-center text-white text-2xl font-bold">
                {channelData.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{channelData.channelName}</h1>
            <div className="flex items-center space-x-4 text-youtube-lightgray mb-4">
              <span>{formatSubscribers(channelData.subscribers)}</span>
              <span>•</span>
              <span>{channelVideos.length} videos</span>
            </div>
          </div>
          
          {currentUser && currentUser.uid !== channelData.uid && (
            <button
              onClick={handleSubscribe}
              className={`flex items-center space-x-2 px-6 py-2 rounded-full font-semibold transition-colors ${
                isSubscribed
                  ? 'bg-youtube-gray text-white hover:bg-gray-600'
                  : 'bg-youtube-red text-white hover:bg-red-600'
              }`}
            >
              <Bell size={16} />
              <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
            </button>
          )}
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
                <span>Videos</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('playlists')}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'playlists'
                  ? 'border-youtube-red text-white'
                  : 'border-transparent text-youtube-lightgray hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <PlaySquare size={16} />
                <span>Playlists</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('about')}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'about'
                  ? 'border-youtube-red text-white'
                  : 'border-transparent text-youtube-lightgray hover:text-white'
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === 'videos' && (
            <div>
              {channelVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {channelVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <VideoIcon size={64} className="mx-auto mb-4 text-youtube-lightgray" />
                  <p className="text-youtube-lightgray text-lg">
                    This channel hasn't uploaded any videos yet
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="text-center py-12">
              <PlaySquare size={64} className="mx-auto mb-4 text-youtube-lightgray" />
              <p className="text-youtube-lightgray text-lg">
                No playlists available
              </p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-4xl">
              <div className="bg-youtube-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">About this channel</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Channel name</h4>
                    <p className="text-youtube-lightgray">{channelData.channelName}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Joined</h4>
                    <p className="text-youtube-lightgray">
                      {new Date(channelData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Stats</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-youtube-dark rounded p-4 text-center">
                        <div className="text-2xl font-bold text-youtube-red">
                          {channelData.subscribers.toLocaleString()}
                        </div>
                        <div className="text-sm text-youtube-lightgray">Subscribers</div>
                      </div>
                      
                      <div className="bg-youtube-dark rounded p-4 text-center">
                        <div className="text-2xl font-bold text-youtube-red">
                          {channelVideos.length}
                        </div>
                        <div className="text-sm text-youtube-lightgray">Videos</div>
                      </div>
                      
                      <div className="bg-youtube-dark rounded p-4 text-center">
                        <div className="text-2xl font-bold text-youtube-red">
                          {channelVideos.reduce((total, video) => total + video.views, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-youtube-lightgray">Total views</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;