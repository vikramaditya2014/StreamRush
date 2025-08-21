import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Video } from '../types';
import { MoreVertical, Clock, Play, Eye, ThumbsUp, Plus, PlaySquare, Bookmark } from 'lucide-react';
import AddToPlaylistModal from './AddToPlaylistModal';

interface VideoCardProps {
  video: Video;
  size?: 'small' | 'medium' | 'large';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, size = 'medium' }) => {
  const [, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return `${views}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const cardClasses = {
    small: 'w-full max-w-sm',
    medium: 'w-full max-w-md',
    large: 'w-full max-w-lg'
  };

  const thumbnailClasses = {
    small: 'aspect-video',
    medium: 'aspect-video',
    large: 'aspect-video'
  };

  return (
    <div 
      className={`group bg-youtube-dark rounded-lg sm:rounded-xl overflow-hidden hover:bg-youtube-gray transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50 ${cardClasses[size]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="video-card"
    >
      <Link to={`/watch/${video.id}`} className="block">
        <div className={`relative ${thumbnailClasses[size]} overflow-hidden`}>
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play size={24} className="text-white ml-1" fill="white" />
            </div>
          </div>
          
          {/* Duration badge */}
          {video.duration > 0 && (
            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center space-x-1 font-medium">
              <Clock size={10} className="sm:w-3 sm:h-3" />
              <span className="text-xs">{formatDuration(video.duration)}</span>
            </div>
          )}
          
          {/* Stats overlay - Hidden on mobile for cleaner look */}
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 hidden sm:flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center space-x-1">
              <Eye size={12} />
              <span>{formatViews(video.views)}</span>
            </div>
            <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center space-x-1">
              <ThumbsUp size={12} />
              <span>{formatViews(video.likes)}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <div className="flex space-x-2 sm:space-x-3">
          <Link to={`/channel/${video.uploaderId}`} className="flex-shrink-0 group/avatar">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover/avatar:ring-red-500 transition-all duration-200">
              {video.uploaderAvatar ? (
                <img
                  src={video.uploaderAvatar}
                  alt={video.uploaderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  {video.uploaderName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link to={`/watch/${video.id}`}>
              <h3 className="font-semibold text-white line-clamp-2 hover:text-red-400 transition-colors duration-200 mb-1 text-sm sm:text-base leading-tight" data-testid="video-title">
                {video.title}
              </h3>
            </Link>
            
            <Link
              to={`/channel/${video.uploaderId}`}
              className="text-youtube-lightgray text-xs sm:text-sm hover:text-white transition-colors duration-200 font-medium block truncate"
              data-testid="video-uploader"
            >
              {video.uploaderName}
            </Link>
            
            <div className="text-youtube-lightgray text-xs sm:text-sm mt-1 flex items-center space-x-1">
              <span data-testid="video-views">{formatViews(video.views)} views</span>
              <span>•</span>
              <span data-testid="video-date" className="truncate">{formatDistanceToNow(video.createdAt, { addSuffix: true })}</span>
            </div>
          </div>

          <div className="relative flex-shrink-0">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1 sm:p-2 hover:bg-youtube-gray rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hidden sm:block"
            >
              <MoreVertical size={16} />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-8 bg-youtube-gray rounded-lg shadow-xl py-2 z-20 min-w-[200px] border border-gray-600">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPlaylistModal(true);
                      setShowDropdown(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-youtube-dark transition-colors w-full text-left"
                  >
                    <Plus size={16} />
                    <span>Add to playlist</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Add to Watch Later functionality will be implemented
                      setShowDropdown(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-youtube-dark transition-colors w-full text-left"
                  >
                    <Bookmark size={16} />
                    <span>Save to Watch Later</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <AddToPlaylistModal 
          videoId={video.id}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};

export default VideoCard;