import React from 'react';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const History: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="pt-16 px-6 text-center">
        <div className="max-w-md mx-auto mt-20">
          <HistoryIcon size={64} className="mx-auto mb-4 text-youtube-lightgray" />
          <h1 className="text-2xl font-bold mb-4">Keep track of what you watch</h1>
          <p className="text-youtube-lightgray mb-6">
            Watch history isn't viewable when signed out
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <HistoryIcon size={32} className="text-youtube-red" />
          <h1 className="text-3xl font-bold">Watch history</h1>
        </div>
        
        <button className="flex items-center space-x-2 bg-youtube-gray hover:bg-gray-600 px-4 py-2 rounded-full transition-colors">
          <Trash2 size={16} />
          <span>Clear all</span>
        </button>
      </div>

      <div className="text-center py-12">
        <HistoryIcon size={64} className="mx-auto mb-4 text-youtube-lightgray" />
        <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
        <p className="text-youtube-lightgray mb-6">
          Videos you watch will appear here
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-primary"
        >
          Start watching
        </button>
      </div>
    </div>
  );
};

export default History;