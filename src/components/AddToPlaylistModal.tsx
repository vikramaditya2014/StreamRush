import React, { useState, useEffect } from 'react';
import { X, Plus, Lock, Globe, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContextWithCloudinary';
import { Playlist } from '../types';

interface AddToPlaylistModalProps {
  videoId: string;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ videoId, onClose }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistPrivate, setNewPlaylistPrivate] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(new Set());
  const { currentUser } = useAuth();
  const { getUserPlaylists, createPlaylist, addToPlaylist, removeFromPlaylist } = useVideo();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const userPlaylists = await getUserPlaylists();
      setPlaylists(userPlaylists);
      
      // Check which playlists already contain this video
      const containingPlaylists = new Set<string>();
      userPlaylists.forEach(playlist => {
        if (playlist.videoIds.includes(videoId)) {
          containingPlaylists.add(playlist.id);
        }
      });
      setAddedPlaylists(containingPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      await createPlaylist(newPlaylistName.trim(), '', !newPlaylistPrivate);
      setNewPlaylistName('');
      setShowCreateForm(false);
      loadPlaylists(); // Reload playlists
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const handlePlaylistToggle = async (playlistId: string) => {
    try {
      if (addedPlaylists.has(playlistId)) {
        await removeFromPlaylist(playlistId, videoId);
        setAddedPlaylists(prev => {
          const newSet = new Set(prev);
          newSet.delete(playlistId);
          return newSet;
        });
      } else {
        await addToPlaylist(playlistId, videoId);
        setAddedPlaylists(prev => new Set(prev).add(playlistId));
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-youtube-gray rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Save video</h2>
            <button onClick={onClose} className="p-1 hover:bg-youtube-dark rounded">
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-6">
            <p className="text-youtube-lightgray mb-4">
              Sign in to save videos to your playlists
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="btn-primary"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-youtube-gray rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-xl font-bold">Save video to playlist</h2>
          <button onClick={onClose} className="p-1 hover:bg-youtube-dark rounded">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-youtube-dark rounded animate-pulse"></div>
                  <div className="flex-1 h-4 bg-youtube-dark rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              {/* Create new playlist */}
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-3 w-full p-3 hover:bg-youtube-dark rounded-lg transition-colors mb-4"
                >
                  <Plus size={16} />
                  <span>Create new playlist</span>
                </button>
              ) : (
                <form onSubmit={handleCreatePlaylist} className="mb-4 p-3 bg-youtube-dark rounded-lg">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Playlist name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full bg-youtube-gray border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                      autoFocus
                    />
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private"
                        checked={newPlaylistPrivate}
                        onChange={(e) => setNewPlaylistPrivate(e.target.checked)}
                        className="text-red-500"
                      />
                      <label htmlFor="private" className="text-sm flex items-center space-x-1">
                        <Lock size={14} />
                        <span>Private</span>
                      </label>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="btn-primary text-sm px-4 py-2"
                        disabled={!newPlaylistName.trim()}
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewPlaylistName('');
                        }}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Existing playlists */}
              {playlists.length > 0 && (
                <div className="space-y-1">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePlaylistToggle(playlist.id)}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-youtube-dark rounded-lg transition-colors"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {addedPlaylists.has(playlist.id) ? (
                          <Check size={16} className="text-red-500" />
                        ) : (
                          <div className="w-4 h-4 border border-gray-500 rounded"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          {playlist.isPublic ? (
                            <Globe size={14} className="text-youtube-lightgray" />
                          ) : (
                            <Lock size={14} className="text-youtube-lightgray" />
                          )}
                          <span className="font-medium">{playlist.name}</span>
                        </div>
                        <p className="text-xs text-youtube-lightgray">
                          {playlist.videoIds.length} videos
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {playlists.length === 0 && !showCreateForm && (
                <div className="text-center py-6">
                  <p className="text-youtube-lightgray">
                    You don't have any playlists yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;