import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, PlaySquare, Clock, Eye, MoreVertical, Shuffle, PlayIcon, Lock, Globe, Trash2 } from 'lucide-react';
import { useVideo } from '../contexts/VideoContextWithCloudinary';
import { useAuth } from '../contexts/AuthContext';
import { Playlist as PlaylistType, Video } from '../types';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatViews, formatDuration } from '../utils/formatters';
import { formatDistanceToNow } from 'date-fns';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { removeFromPlaylist } = useVideo();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (id) {
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    if (!id) return;

    try {
      // Load playlist data
      const playlistDoc = await getDoc(doc(db, 'playlists', id));
      if (playlistDoc.exists()) {
        const playlistData = {
          id: playlistDoc.id,
          ...playlistDoc.data(),
          createdAt: playlistDoc.data().createdAt?.toDate(),
          updatedAt: playlistDoc.data().updatedAt?.toDate()
        } as PlaylistType;

        setPlaylist(playlistData);

        // Load videos in playlist
        if (playlistData.videoIds.length > 0) {
          const videosQuery = query(
            collection(db, 'videos'),
            where('__name__', 'in', playlistData.videoIds)
          );
          const videosSnapshot = await getDocs(videosQuery);
          
          const videosData = videosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          })) as Video[];

          // Maintain playlist order
          const orderedVideos = playlistData.videoIds
            .map(videoId => videosData.find(video => video.id === videoId))
            .filter((video): video is Video => video !== undefined);

          setVideos(orderedVideos);
        }
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromPlaylist = async (videoId: string) => {
    if (!playlist || !currentUser || currentUser.uid !== playlist.userId) return;

    try {
      await removeFromPlaylist(playlist.id, videoId);
      // Reload playlist
      loadPlaylist();
    } catch (error) {
      console.error('Error removing from playlist:', error);
    }
  };

  const calculateTotalDuration = () => {
    return videos.reduce((total, video) => total + (video.duration || 0), 0);
  };

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="pt-16 px-6">
        <div className="animate-pulse">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <div className="aspect-video bg-youtube-gray rounded-lg mb-4"></div>
              <div className="h-8 bg-youtube-gray rounded mb-2"></div>
              <div className="h-4 bg-youtube-gray rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-youtube-gray rounded w-1/2"></div>
            </div>
            <div className="lg:w-2/3 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-40 aspect-video bg-youtube-gray rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-youtube-gray rounded"></div>
                    <div className="h-3 bg-youtube-gray rounded w-3/4"></div>
                    <div className="h-3 bg-youtube-gray rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="pt-16 px-6 text-center">
        <div className="max-w-md mx-auto mt-20">
          <PlaySquare size={64} className="mx-auto mb-4 text-youtube-lightgray" />
          <h1 className="text-2xl font-bold mb-4">Playlist not found</h1>
          <p className="text-youtube-lightgray mb-6">
            This playlist may have been deleted or made private
          </p>
          <Link to="/playlists" className="btn-primary">
            Back to playlists
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.uid === playlist.userId;

  return (
    <div className="pt-16 px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Playlist Info */}
        <div className="lg:w-1/3">
          <div className="bg-gradient-to-b from-red-600/20 to-purple-600/20 rounded-xl p-6 border border-red-500/20">
            {/* Playlist thumbnail */}
            <div className="aspect-video bg-youtube-gray rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {playlist.thumbnailUrl || videos[0]?.thumbnailUrl ? (
                <img
                  src={playlist.thumbnailUrl || videos[0]?.thumbnailUrl}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PlaySquare size={48} className="text-youtube-lightgray" />
              )}
              
              {/* Play overlay */}
              {videos.length > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                  <Link
                    to={`/watch/${videos[currentVideoIndex]?.id}?list=${playlist.id}`}
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors"
                  >
                    <Play size={24} className="ml-1" />
                  </Link>
                </div>
              )}
            </div>

            {/* Playlist details */}
            <h1 className="text-2xl font-bold mb-2">{playlist.name}</h1>
            
            <div className="flex items-center space-x-2 text-sm text-youtube-lightgray mb-2">
              {playlist.isPublic ? (
                <>
                  <Globe size={14} />
                  <span>Public playlist</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Private playlist</span>
                </>
              )}
            </div>

            <div className="text-sm text-youtube-lightgray mb-4">
              <p>{videos.length} videos</p>
              {videos.length > 0 && (
                <p>{formatTotalDuration(calculateTotalDuration())} total</p>
              )}
              <p>Updated {formatDistanceToNow(playlist.updatedAt || playlist.createdAt, { addSuffix: true })}</p>
            </div>

            {playlist.description && (
              <p className="text-sm text-youtube-lightgray mb-4">
                {playlist.description}
              </p>
            )}

            {/* Action buttons */}
            {videos.length > 0 && (
              <div className="space-y-2">
                <Link
                  to={`/watch/${videos[currentVideoIndex]?.id}?list=${playlist.id}`}
                  className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors w-full"
                >
                  <PlayIcon size={16} />
                  <span>Play all</span>
                </Link>
                
                <button className="flex items-center justify-center space-x-2 bg-youtube-gray hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors w-full">
                  <Shuffle size={16} />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Videos List */}
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Videos</h2>
            {isOwner && (
              <span className="text-sm text-youtube-lightgray">
                You can remove videos from this playlist
              </span>
            )}
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-12">
              <PlaySquare size={64} className="mx-auto mb-4 text-youtube-lightgray" />
              <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
              <p className="text-youtube-lightgray">
                Videos you add to this playlist will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`flex items-start space-x-4 p-3 rounded-lg hover:bg-youtube-gray transition-colors group ${
                    currentVideoIndex === index ? 'bg-youtube-gray' : ''
                  }`}
                >
                  {/* Index */}
                  <div className="w-8 flex-shrink-0 text-center">
                    <span className="text-youtube-lightgray group-hover:hidden">
                      {index + 1}
                    </span>
                    <button 
                      onClick={() => setCurrentVideoIndex(index)}
                      className="hidden group-hover:block p-1 hover:bg-youtube-dark rounded"
                    >
                      <Play size={12} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <Link 
                    to={`/watch/${video.id}?list=${playlist.id}&index=${index}`}
                    className="w-40 aspect-video flex-shrink-0 rounded overflow-hidden relative"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Duration */}
                    {video.duration && (
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </Link>

                  {/* Video info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/watch/${video.id}?list=${playlist.id}&index=${index}`}
                      className="block"
                    >
                      <h3 className="font-semibold line-clamp-2 hover:text-red-400 transition-colors mb-1">
                        {video.title}
                      </h3>
                    </Link>
                    
                    <Link
                      to={`/channel/${video.uploaderId}`}
                      className="text-sm text-youtube-lightgray hover:text-white transition-colors block"
                    >
                      {video.uploaderName}
                    </Link>
                    
                    <div className="text-xs text-youtube-lightgray mt-1">
                      <span>{formatViews(video.views)} views</span>
                      <span className="mx-1">•</span>
                      <span>{formatDistanceToNow(video.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOwner ? (
                      <button
                        onClick={() => handleRemoveFromPlaylist(video.id)}
                        className="p-2 hover:bg-youtube-dark rounded-full transition-colors text-red-400 hover:text-red-300"
                        title="Remove from playlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-youtube-dark rounded-full transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlist;