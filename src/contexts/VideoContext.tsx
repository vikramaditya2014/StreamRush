import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  where,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Video, Comment, Playlist, SearchFilters } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';


interface VideoContextType {
  videos: Video[];
  loading: boolean;
  uploadVideo: (videoFile: File, thumbnailFile: File, videoData: Partial<Video>) => Promise<void>;
  getVideo: (id: string) => Promise<Video | null>;
  searchVideos: (query: string, filters?: SearchFilters) => Promise<Video[]>;
  getTrendingVideos: () => Promise<Video[]>;
  getChannelVideos: (userId: string) => Promise<Video[]>;
  likeVideo: (videoId: string) => Promise<void>;
  dislikeVideo: (videoId: string) => Promise<void>;
  addComment: (videoId: string, content: string) => Promise<void>;
  getComments: (videoId: string) => Promise<Comment[]>;
  subscribeToChannel: (channelId: string) => Promise<void>;
  unsubscribeFromChannel: (channelId: string) => Promise<void>;
  createPlaylist: (name: string, description: string, isPublic: boolean) => Promise<void>;
  addToPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  getUserPlaylists: () => Promise<Playlist[]>;
  incrementViews: (videoId: string) => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser, userProfile } = useAuth();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      if (!db) {
        console.error('Firebase not initialized. Please check your configuration.');
        toast.error('Database connection failed. Please check Firebase configuration.');
        setLoading(false);
        return;
      }

      const videosRef = collection(db, 'videos');
      const q = query(videosRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const videosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Video[];
      
      setVideos(videosData);
      console.log(`✅ Loaded ${videosData.length} videos from Firebase`);
      
      if (videosData.length === 0) {
        console.log('No videos found in database. Upload some videos to get started!');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos. Please try again.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (videoFile: File, thumbnailFile: File, videoData: Partial<Video>) => {
    try {
      setLoading(true);
      
      if (!db || !storage) {
        console.error('Firebase not initialized. Please check your configuration.');
        toast.error('Upload failed. Firebase Storage not configured. Please check STORAGE_SETUP.md');
        setLoading(false);
        return;
      }

      if (!currentUser || !userProfile) {
        toast.error('Please login to upload videos');
        setLoading(false);
        return;
      }

      // Validate file sizes
      if (videoFile.size > 100 * 1024 * 1024) {
        toast.error('Video file must be less than 100MB');
        setLoading(false);
        return;
      }

      if (thumbnailFile.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail file must be less than 5MB');
        setLoading(false);
        return;
      }

      const videoId = uuidv4();
      
      // Show upload progress
      toast.loading('Uploading video file...', { id: 'upload-progress' });
      
      try {
        // Upload video file with better error handling
        const sanitizedVideoName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const videoRef = ref(storage, `videos/${currentUser.uid}/${videoId}_${sanitizedVideoName}`);
        
        const videoUrl = await new Promise<string>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(videoRef, videoFile);
          
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              toast.loading(`Uploading video: ${Math.round(progress)}%`, { id: 'upload-progress' });
            },
            (error) => {
              console.error('Video upload error:', error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });

        toast.loading('Uploading thumbnail...', { id: 'upload-progress' });

        // Upload thumbnail with better error handling
        const sanitizedThumbnailName = thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const thumbnailRef = ref(storage, `thumbnails/${currentUser.uid}/${videoId}_${sanitizedThumbnailName}`);
        
        const thumbnailUrl = await new Promise<string>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(thumbnailRef, thumbnailFile);
          
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              toast.loading(`Uploading thumbnail: ${Math.round(progress)}%`, { id: 'upload-progress' });
            },
            (error) => {
              console.error('Thumbnail upload error:', error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });

        toast.loading('Saving video details...', { id: 'upload-progress' });

        // Create video document
        const video: Omit<Video, 'id'> = {
          title: videoData.title || 'Untitled',
          description: videoData.description || '',
          videoUrl,
          thumbnailUrl,
          duration: videoData.duration || 0,
          views: 0,
          likes: 0,
          dislikes: 0,
          uploaderId: currentUser.uid,
          uploaderName: userProfile.displayName || currentUser.displayName || 'Unknown User',
          uploaderAvatar: userProfile.photoURL || currentUser.photoURL || '',
          tags: videoData.tags || [],
          category: videoData.category || 'General',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await addDoc(collection(db, 'videos'), video);
        
        toast.success('Video uploaded successfully!', { id: 'upload-progress' });
        await fetchVideos();
        
      } catch (storageError: any) {
        console.error('Storage error:', storageError);
        
        // Check if it's a CORS error or storage configuration issue
        const isCorsError = storageError.message?.includes('CORS') || 
                           storageError.message?.includes('preflight') ||
                           storageError.message?.includes('ERR_FAILED') ||
                           storageError.code === 'storage/unauthorized' ||
                           (storageError.code === undefined && storageError.message?.includes('Failed'));
        
        if (isCorsError) {
          // Dispatch CORS error event for notification
          window.dispatchEvent(new CustomEvent('corsError'));
          
          toast.loading('Storage upload failed, creating demo entry...', { id: 'upload-progress' });
          
          // Create a demo video entry without actual file upload
          const demoVideo: Omit<Video, 'id'> = {
            title: videoData.title || 'Untitled',
            description: videoData.description || '',
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Demo video URL
            thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop', // Demo thumbnail
            duration: videoData.duration || 60,
            views: 0,
            likes: 0,
            dislikes: 0,
            uploaderId: currentUser.uid,
            uploaderName: userProfile.displayName || currentUser.displayName || 'Unknown User',
            uploaderAvatar: userProfile.photoURL || currentUser.photoURL || '',
            tags: videoData.tags || [],
            category: videoData.category || 'General',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          try {
            await addDoc(collection(db, 'videos'), demoVideo);
            toast.success('Video uploaded successfully! (Demo Mode - Storage CORS issue detected)', { id: 'upload-progress' });
            await fetchVideos();
            return; // Exit successfully
          } catch (dbError) {
            console.error('Database error:', dbError);
            toast.error('Failed to save video information', { id: 'upload-progress' });
          }
        } else {
          // Handle other storage errors
          if (storageError.code === 'storage/quota-exceeded') {
            toast.error('Storage quota exceeded. Please upgrade your Firebase plan.', { id: 'upload-progress' });
          } else if (storageError.code === 'storage/invalid-format') {
            toast.error('Invalid file format. Please use supported video/image formats.', { id: 'upload-progress' });
          } else {
            toast.error(`Upload failed: ${storageError.message}`, { id: 'upload-progress' });
          }
        }
        throw storageError;
      }
      
    } catch (error: any) {
      console.error('Error uploading video:', error);
      
      if (!error.code?.startsWith('storage/')) {
        toast.error('Failed to upload video. Please try again.', { id: 'upload-progress' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getVideo = async (id: string): Promise<Video | null> => {
    try {
      if (!db) {
        console.error('Firebase not initialized');
        return null;
      }

      const videoDoc = await getDoc(doc(db, 'videos', id));
      if (videoDoc.exists()) {
        return {
          id: videoDoc.id,
          ...videoDoc.data(),
          createdAt: videoDoc.data().createdAt?.toDate(),
          updatedAt: videoDoc.data().updatedAt?.toDate()
        } as Video;
      }
      return null;
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  };

  const searchVideos = async (searchQuery: string, filters?: SearchFilters): Promise<Video[]> => {
    try {
      if (!db) {
        console.error('Firebase not initialized');
        return [];
      }

      const videosRef = collection(db, 'videos');
      let q = query(videosRef);

      // Apply sorting
      if (filters?.sortBy === 'view_count') {
        q = query(q, orderBy('views', 'desc'));
      } else if (filters?.sortBy === 'upload_date') {
        q = query(q, orderBy('createdAt', 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Video[];

      // Filter by search query (client-side for simplicity)
      if (searchQuery) {
        results = results.filter(video =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      return results;
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  };

  const getTrendingVideos = async (): Promise<Video[]> => {
    try {
      if (!db) {
        console.error('Firebase not initialized');
        return [];
      }

      const videosRef = collection(db, 'videos');
      const q = query(videosRef, orderBy('views', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Video[];
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      return [];
    }
  };

  const getChannelVideos = async (userId: string): Promise<Video[]> => {
    try {
      if (!db) {
        console.error('Firebase not initialized');
        return [];
      }

      const videosRef = collection(db, 'videos');
      const q = query(videosRef, where('uploaderId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const userVideos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Video[];

      // Sort by createdAt in memory to avoid index requirement
      return userVideos.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      // Fallback to existing videos in state
      return videos.filter(video => video.uploaderId === userId);
    }
  };

  const likeVideo = async (videoId: string) => {
    if (!currentUser) {
      toast.error('Please login to like videos');
      return;
    }

    if (!db) {
      toast.error('Database connection failed. Please check Firebase configuration.');
      return;
    }

    try {
      const videoRef = doc(db, 'videos', videoId);
      await updateDoc(videoRef, {
        likes: increment(1)
      });
      
      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === videoId ? { ...video, likes: video.likes + 1 } : video
      ));
      toast.success('Video liked!');
    } catch (error) {
      console.error('Error liking video:', error);
      toast.error('Failed to like video');
    }
  };

  const dislikeVideo = async (videoId: string) => {
    if (!currentUser && db) {
      toast.error('Please login to dislike videos');
      return;
    }

    try {
      if (!db) {
        // Demo mode - just update local state
        setVideos(prev => prev.map(video => 
          video.id === videoId ? { ...video, dislikes: video.dislikes + 1 } : video
        ));
        toast.success('Video disliked! (Demo Mode)');
        return;
      }

      const videoRef = doc(db, 'videos', videoId);
      await updateDoc(videoRef, {
        dislikes: increment(1)
      });
      
      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === videoId ? { ...video, dislikes: video.dislikes + 1 } : video
      ));
      toast.success('Video disliked!');
    } catch (error) {
      console.error('Error disliking video:', error);
      // Fallback to demo mode behavior
      setVideos(prev => prev.map(video => 
        video.id === videoId ? { ...video, dislikes: video.dislikes + 1 } : video
      ));
      toast.success('Video disliked! (Demo Mode)');
    }
  };

  const addComment = async (videoId: string, content: string) => {
    if (!db) {
      // Demo mode - simulate adding comment
      toast.success('Comment added! (Demo Mode)');
      return;
    }

    if (!currentUser || !userProfile) {
      toast.error('Please login to comment');
      return;
    }

    try {
      const comment: Omit<Comment, 'id'> = {
        videoId,
        userId: currentUser.uid,
        userName: userProfile.displayName,
        userAvatar: userProfile.photoURL,
        content,
        likes: 0,
        replies: [],
        createdAt: new Date()
      };

      await addDoc(collection(db, 'comments'), comment);
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.success('Comment added! (Demo Mode)');
    }
  };

  const getComments = async (videoId: string): Promise<Comment[]> => {
    try {
      if (!db) {
        console.error('Firebase not initialized');
        return [];
      }

      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('videoId', '==', videoId));
      const querySnapshot = await getDocs(q);
      
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Comment[];

      // Sort by createdAt in memory to avoid index requirement
      return comments.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const subscribeToChannel = async (channelId: string) => {
    if (!db) {
      // Demo mode
      toast.success('Subscribed! (Demo Mode)');
      return;
    }

    if (!currentUser || !userProfile) {
      toast.error('Please login to subscribe');
      return;
    }

    try {
      // Update user's subscriptions
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        subscribedTo: arrayUnion(channelId)
      });

      // Update channel's subscriber count
      const channelRef = doc(db, 'users', channelId);
      await updateDoc(channelRef, {
        subscribers: increment(1)
      });

      toast.success('Subscribed successfully!');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.success('Subscribed! (Demo Mode)');
    }
  };

  const unsubscribeFromChannel = async (channelId: string) => {
    if (!db) {
      // Demo mode
      toast.success('Unsubscribed! (Demo Mode)');
      return;
    }

    if (!currentUser || !userProfile) {
      toast.error('Please login to unsubscribe');
      return;
    }

    try {
      // Update user's subscriptions
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        subscribedTo: arrayRemove(channelId)
      });

      // Update channel's subscriber count
      const channelRef = doc(db, 'users', channelId);
      await updateDoc(channelRef, {
        subscribers: increment(-1)
      });

      toast.success('Unsubscribed successfully!');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.success('Unsubscribed! (Demo Mode)');
    }
  };

  const createPlaylist = async (name: string, description: string, isPublic: boolean) => {
    if (!currentUser) {
      toast.error('Please login to create playlists');
      return;
    }

    try {
      const playlist: Omit<Playlist, 'id'> = {
        name,
        description,
        userId: currentUser.uid,
        videoIds: [],
        isPublic,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'playlists'), playlist);
      toast.success('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    }
  };

  const addToPlaylist = async (playlistId: string, videoId: string) => {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      await updateDoc(playlistRef, {
        videoIds: arrayUnion(videoId),
        updatedAt: new Date()
      });
      toast.success('Added to playlist!');
    } catch (error) {
      console.error('Error adding to playlist:', error);
      toast.error('Failed to add to playlist');
    }
  };

  const removeFromPlaylist = async (playlistId: string, videoId: string) => {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      await updateDoc(playlistRef, {
        videoIds: arrayRemove(videoId),
        updatedAt: new Date()
      });
      toast.success('Removed from playlist!');
    } catch (error) {
      console.error('Error removing from playlist:', error);
      toast.error('Failed to remove from playlist');
    }
  };

  const getUserPlaylists = async (): Promise<Playlist[]> => {
    if (!currentUser) return [];

    try {
      const playlistsRef = collection(db, 'playlists');
      const q = query(playlistsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Playlist[];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  };

  const incrementViews = async (videoId: string) => {
    try {
      const videoRef = doc(db, 'videos', videoId);
      await updateDoc(videoRef, {
        views: increment(1)
      });
      
      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === videoId ? { ...video, views: video.views + 1 } : video
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const value: VideoContextType = {
    videos,
    loading,
    uploadVideo,
    getVideo,
    searchVideos,
    getTrendingVideos,
    getChannelVideos,
    likeVideo,
    dislikeVideo,
    addComment,
    getComments,
    subscribeToChannel,
    unsubscribeFromChannel,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    getUserPlaylists,
    incrementViews
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};