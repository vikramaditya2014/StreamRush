import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal, Bell } from 'lucide-react';
import { useVideo } from '../contexts/VideoContext';
import { useAuth } from '../contexts/AuthContext';
import { Video, Comment } from '../types';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  
  const { 
    getVideo, 
    likeVideo, 
    dislikeVideo, 
    addComment, 
    getComments, 
    subscribeToChannel, 
    unsubscribeFromChannel,
    incrementViews,
    videos
  } = useVideo();
  
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    if (id) {
      loadVideo();
      loadComments();
      incrementViews(id);
    }
  }, [id]);

  useEffect(() => {
    if (video) {
      // Load related videos (same category or random)
      const related = videos
        .filter(v => v.id !== video.id && (v.category === video.category || Math.random() > 0.5))
        .slice(0, 10);
      setRelatedVideos(related);
      
      // Check if user is subscribed
      if (userProfile) {
        setIsSubscribed(userProfile.subscribedTo.includes(video.uploaderId));
      }
    }
  }, [video, videos, userProfile]);

  const loadVideo = async () => {
    if (id) {
      const videoData = await getVideo(id);
      setVideo(videoData);
    }
  };

  const loadComments = async () => {
    if (id) {
      const commentsData = await getComments(id);
      setComments(commentsData);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please login to like videos');
      return;
    }
    if (video) {
      await likeVideo(video.id);
      setVideo(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      toast.error('Please login to dislike videos');
      return;
    }
    if (video) {
      await dislikeVideo(video.id);
      setVideo(prev => prev ? { ...prev, dislikes: prev.dislikes + 1 } : null);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser) {
      toast.error('Please login to subscribe');
      return;
    }
    if (video) {
      if (isSubscribed) {
        await unsubscribeFromChannel(video.uploaderId);
        setIsSubscribed(false);
      } else {
        await subscribeToChannel(video.uploaderId);
        setIsSubscribed(true);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim() || !video) return;

    await addComment(video.id, newComment.trim());
    setNewComment('');
    loadComments();
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (!video) {
    return (
      <div className="pt-16 px-6">
        <div className="animate-pulse">
          <div className="aspect-video bg-youtube-gray rounded-lg mb-4"></div>
          <div className="h-6 bg-youtube-gray rounded mb-2"></div>
          <div className="h-4 bg-youtube-gray rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Video Section */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <ReactPlayer
              url={video.videoUrl}
              width="100%"
              height="100%"
              controls
              playing={false}
            />
          </div>

          {/* Video Info */}
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-2">{video.title}</h1>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-youtube-lightgray">
                <span>{formatViews(video.views)}</span>
                <span className="mx-2">•</span>
                <span>{formatDistanceToNow(video.createdAt, { addSuffix: true })}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 bg-youtube-gray hover:bg-gray-600 px-4 py-2 rounded-full transition-colors"
                >
                  <ThumbsUp size={20} />
                  <span>{formatNumber(video.likes)}</span>
                </button>
                
                <button
                  onClick={handleDislike}
                  className="flex items-center space-x-2 bg-youtube-gray hover:bg-gray-600 px-4 py-2 rounded-full transition-colors"
                >
                  <ThumbsDown size={20} />
                  <span>{formatNumber(video.dislikes)}</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-youtube-gray hover:bg-gray-600 px-4 py-2 rounded-full transition-colors">
                  <Share size={20} />
                  <span>Share</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-youtube-gray hover:bg-gray-600 px-4 py-2 rounded-full transition-colors">
                  <Download size={20} />
                  <span>Download</span>
                </button>
                
                <button className="p-2 bg-youtube-gray hover:bg-gray-600 rounded-full transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-center justify-between bg-youtube-gray rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {video.uploaderAvatar ? (
                    <img
                      src={video.uploaderAvatar}
                      alt={video.uploaderName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-youtube-red flex items-center justify-center text-white font-bold">
                      {video.uploaderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold">{video.uploaderName}</h3>
                  <p className="text-sm text-youtube-lightgray">1.2M subscribers</p>
                </div>
              </div>
              
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
            </div>

            {/* Description */}
            <div className="mt-4">
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="text-left w-full"
              >
                <div className={`bg-youtube-gray rounded-lg p-4 ${showDescription ? '' : 'line-clamp-3'}`}>
                  <p className="whitespace-pre-wrap">{video.description}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {comments.length} Comments
            </h2>
            
            {/* Add Comment */}
            {currentUser && (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt="Your avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-youtube-red flex items-center justify-center text-white font-bold">
                        {userProfile?.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-youtube-gray focus:border-white outline-none resize-none"
                      rows={1}
                    />
                    
                    {newComment.trim() && (
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setNewComment('')}
                          className="px-4 py-2 text-youtube-lightgray hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-youtube-red text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-youtube-red flex items-center justify-center text-white font-bold text-sm">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-youtube-lightgray">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">{comment.content}</p>
                    
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-youtube-lightgray hover:text-white transition-colors">
                        <ThumbsUp size={14} />
                        <span className="text-xs">{comment.likes}</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 text-youtube-lightgray hover:text-white transition-colors">
                        <ThumbsDown size={14} />
                      </button>
                      
                      <button className="text-xs text-youtube-lightgray hover:text-white transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="w-full lg:w-96">
          <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
          <div className="space-y-4">
            {relatedVideos.map((relatedVideo) => (
              <div key={relatedVideo.id} className="flex space-x-3">
                <div className="w-40 aspect-video rounded overflow-hidden flex-shrink-0">
                  <img
                    src={relatedVideo.thumbnailUrl}
                    alt={relatedVideo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {relatedVideo.title}
                  </h3>
                  <p className="text-xs text-youtube-lightgray mb-1">
                    {relatedVideo.uploaderName}
                  </p>
                  <div className="text-xs text-youtube-lightgray">
                    <span>{formatViews(relatedVideo.views)}</span>
                    <span className="mx-1">•</span>
                    <span>{formatDistanceToNow(relatedVideo.createdAt, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;