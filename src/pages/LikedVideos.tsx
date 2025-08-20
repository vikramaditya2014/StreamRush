import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LikedVideos: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="pt-16 px-6 text-center">
        <div className="max-w-md mx-auto mt-20">
          <ThumbsUp size={64} className="mx-auto mb-4 text-youtube-lightgray" />
          <h1 className="text-2xl font-bold mb-4">Enjoy your favorite videos</h1>
          <p className="text-youtube-lightgray mb-6">
            Sign in to access videos that you've liked
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

  return (
    <div className="pt-16 px-6">
      <div className="flex items-center space-x-3 mb-6">
        <ThumbsUp size={32} className="text-youtube-red" />
        <h1 className="text-3xl font-bold">Liked videos</h1>
      </div>

      <div className="text-center py-12">
        <ThumbsUp size={64} className="mx-auto mb-4 text-youtube-lightgray" />
        <h2 className="text-xl font-semibold mb-2">No liked videos yet</h2>
        <p className="text-youtube-lightgray mb-6">
          Videos you like will appear here
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-primary"
        >
          Find videos to like
        </button>
      </div>
    </div>
  );
};

export default LikedVideos;