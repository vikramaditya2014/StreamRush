import React, { useState } from 'react';
import { useVideo } from '../contexts/VideoContextWithCloudinary';
import VideoCard from '../components/VideoCard';
import { Loader2, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const { videos, loading } = useVideo();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Gaming',
    'Music',
    'Sports',
    'News',
    'Entertainment',
    'Education',
    'Technology',
    'Travel',
    'Cooking'
  ];

  const filteredVideos = selectedCategory === 'All' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative">
          <Loader2 className="animate-spin text-red-500" size={48} />
          <div className="absolute inset-0 animate-ping">
            <Loader2 className="text-red-500/30" size={48} />
          </div>
        </div>
        <p className="mt-4 text-youtube-lightgray animate-pulse">Loading amazing content...</p>
      </div>
    );
  }

  return (
    <div className="pt-16 px-3 sm:px-6 min-h-screen">
      {/* Welcome Banner */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-500/20">
        <div className="flex items-center space-x-3">
          <Sparkles className="text-red-500 animate-pulse" size={20} />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Welcome to StreamRush
          </h1>
        </div>
        <p className="text-youtube-lightgray mt-2 text-sm sm:text-base">Discover amazing content from creators around the world</p>
      </div>

      {/* Category Filter */}
      <div className="sticky top-16 bg-youtube-dark/95 backdrop-blur-sm py-3 sm:py-4 mb-6 sm:mb-8 border-b border-youtube-gray z-10 -mx-3 sm:-mx-6 px-3 sm:px-6">
        <div className="flex space-x-2 sm:space-x-3 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full whitespace-nowrap transition-all duration-300 font-medium transform hover:scale-105 text-sm sm:text-base ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-youtube-gray text-white hover:bg-gray-600 hover:shadow-md'
              }`}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {filteredVideos.map((video, index) => (
          <div
            key={video.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <VideoCard video={video} />
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedCategory === 'All' 
                ? 'No videos available yet'
                : `No ${selectedCategory} videos found`
              }
            </h3>
            <p className="text-youtube-lightgray mb-6">
              {selectedCategory === 'All' 
                ? 'Get started by adding some sample data to your database!'
                : `Try selecting a different category or check back later.`
              }
            </p>
            {selectedCategory === 'All' && (
              <a
                href="/admin"
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to Admin Panel
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;