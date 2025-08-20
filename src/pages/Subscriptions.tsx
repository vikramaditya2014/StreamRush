import React, { useState, useEffect } from 'react';
import { Users, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContextWithCloudinary';
import { Video } from '../types';
import VideoCard from '../components/VideoCard';

const Subscriptions: React.FC = () => {
  const [subscriptionVideos, setSubscriptionVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { currentUser, userProfile } = useAuth();
  const { videos } = useVideo();

  useEffect(() => {
    if (userProfile && userProfile.subscribedTo.length > 0) {
      // Filter videos from subscribed channels
      const subVideos = videos.filter(video => 
        userProfile.subscribedTo.includes(video.uploaderId)
      );
      setSubscriptionVideos(subVideos);
    }
    setLoading(false);
  }, [userProfile, videos]);

  if (!currentUser) {
    return (
      <div className="pt-16 px-6 text-center">
        <div className="max-w-md mx-auto mt-20">
          <Users size={64} className="mx-auto mb-4 text-youtube-lightgray" />
          <h1 className="text-2xl font-bold mb-4">Don't miss new videos</h1>
          <p className="text-youtube-lightgray mb-6">
            Sign in to see updates from your favorite YouTube channels
          </p>
          <button
            onClick={() => window.location.href = '/login'}
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
          <div className="h-8 bg-youtube-gray rounded w-48 mb-6"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users size={32} className="text-youtube-red" />
          <h1 className="text-3xl font-bold">Subscriptions</h1>
        </div>
        
        <button className="flex items-center space-x-2 bg-youtube-gray hover:bg-gray-600 px-4 py-2 rounded-full transition-colors">
          <Bell size={16} />
          <span>Manage</span>
        </button>
      </div>

      {/* Content */}
      {subscriptionVideos.length > 0 ? (
        <>
          <p className="text-youtube-lightgray mb-6">
            Latest videos from your subscriptions
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subscriptionVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto mb-4 text-youtube-lightgray" />
          <h2 className="text-xl font-semibold mb-2">No subscriptions yet</h2>
          <p className="text-youtube-lightgray mb-6">
            Subscribe to channels to see their latest videos here
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Browse videos
          </button>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;