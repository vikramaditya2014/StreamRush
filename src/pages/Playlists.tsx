import React, { useState, useEffect } from 'react';
import { PlaySquare, Plus, Lock, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContext';
import { Playlist } from '../types';

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  const { currentUser } = useAuth();
  const { getUserPlaylists, createPlaylist } = useVideo();

  useEffect(() => {
    if (currentUser) {
      loadPlaylists();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadPlaylists = async () => {
    try {
      const userPlaylists = await getUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPlaylist.name.trim()) return;

    try {
      await createPlaylist(
        newPlaylist.name.trim(),
        newPlaylist.description.trim(),
        newPlaylist.isPublic
      );
      
      setNewPlaylist({ name: '', description: '', isPublic: true });
      setShowCreateModal(false);
      loadPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="pt-16 px-6 text-center">
        <div className="max-w-md mx-auto mt-20">
          <PlaySquare size={64} className="mx-auto mb-4 text-youtube-lightgray" />
          <h1 className="text-2xl font-bold mb-4">Organize your videos</h1>
          <p className="text-youtube-lightgray mb-6">
            Sign in to create playlists and organize your favorite videos
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
            {Array.from({ length: 4 }).map((_, i) => (
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <PlaySquare size={32} className="text-youtube-red" />
          <h1 className="text-3xl font-bold">Your playlists</h1>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New playlist</span>
        </button>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="video-card">
              <div className="aspect-video bg-youtube-gray rounded-lg flex items-center justify-center mb-3">
                {playlist.thumbnailUrl ? (
                  <img
                    src={playlist.thumbnailUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <PlaySquare size={48} className="text-youtube-lightgray" />
                )}
              </div>
              
              <div className="p-3">
                <h3 className="font-semibold mb-1 line-clamp-2">{playlist.name}</h3>
                
                <div className="flex items-center space-x-2 text-sm text-youtube-lightgray mb-2">
                  {playlist.isPublic ? (
                    <Globe size={14} />
                  ) : (
                    <Lock size={14} />
                  )}
                  <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
                </div>
                
                <p className="text-sm text-youtube-lightgray">
                  {playlist.videoIds.length} videos
                </p>
                
                {playlist.description && (
                  <p className="text-sm text-youtube-lightgray mt-2 line-clamp-2">
                    {playlist.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PlaySquare size={64} className="mx-auto mb-4 text-youtube-lightgray" />
          <h2 className="text-xl font-semibold mb-2">No playlists yet</h2>
          <p className="text-youtube-lightgray mb-6">
            Create playlists to organize your favorite videos
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Plus size={16} />
            <span>Create playlist</span>
          </button>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-youtube-gray rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Create new playlist</h2>
            
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label htmlFor="playlistName" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="playlistName"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="playlistDescription" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="playlistDescription"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Enter playlist description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Privacy</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="privacy"
                      checked={newPlaylist.isPublic}
                      onChange={() => setNewPlaylist(prev => ({ ...prev, isPublic: true }))}
                      className="text-youtube-red"
                    />
                    <Globe size={16} />
                    <span>Public</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!newPlaylist.isPublic}
                      onChange={() => setNewPlaylist(prev => ({ ...prev, isPublic: false }))}
                      className="text-youtube-red"
                    />
                    <Lock size={16} />
                    <span>Private</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;