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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Video, Comment, Playlist, SearchFilters } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import cloudinaryService from '../services/cloudinaryService';
import cloudinaryServiceSigned from '../services/cloudinaryServiceSigned';

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
  incrementViews: (videoId: string) => Promise<void>;
  addComment: (videoId: string, content: string) => Promise<void>;
  getComments: (videoId: string) => Promise<Comment[]>;
  subscribeToChannel: (channelId: string) => Promise<void>;
  unsubscribeFromChannel: (channelId: string) => Promise<void>;
  createPlaylist: (name: string, description: string, isPublic: boolean) => Promise<void>;
  addToPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  getUserPlaylists: () => Promise<Playlist[]>;
  getPlaylist: (playlistId: string) => Promise<Playlist | null>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();

  // Determine which upload service to use
  const useCloudinary = cloudinaryService.isConfigured();
  const useCloudinarySigned = cloudinaryServiceSigned.isConfigured();
  const useFirebaseStorage = !!(storage && !useCloudinary && !useCloudinarySigned);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      if (!db) {
        console.error('Firebase not initialized');
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
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (videoFile: File, thumbnailFile: File, videoData: Partial<Video>) => {
    try {
      setLoading(true);
      
      if (!db) {
        console.error('Firebase not initialized. Please check your configuration.');
        toast.error('Database not configured. Please check Firebase configuration.');
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
      let videoUrl = '';
      let thumbnailUrl = '';

      // Try Cloudinary first if configured
      if (useCloudinary) {
        try {
          toast.loading('Uploading to Cloudinary...', { id: 'upload-progress' });

          // Upload video to Cloudinary
          const videoResult = await cloudinaryService.uploadVideo(videoFile, (progress) => {
            toast.loading(`Uploading video: ${progress}%`, { id: 'upload-progress' });
          });
          videoUrl = videoResult.url;

          // Upload thumbnail to Cloudinary
          const thumbnailResult = await cloudinaryService.uploadImage(thumbnailFile, (progress) => {
            toast.loading(`Uploading thumbnail: ${progress}%`, { id: 'upload-progress' });
          });
          thumbnailUrl = thumbnailResult.url;

          toast.loading('Saving video details...', { id: 'upload-progress' });

        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed:', cloudinaryError);
          throw cloudinaryError;
        }
      }
      // Fallback to Firebase Storage
      else if (useFirebaseStorage) {
        try {
          toast.loading('Uploading to Firebase Storage...', { id: 'upload-progress' });

          // Upload video file
          const sanitizedVideoName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const videoRef = ref(storage, `videos/${currentUser.uid}/${videoId}_${sanitizedVideoName}`);
          
          const videoUploadResult = await new Promise<string>((resolve, reject) => {
            const uploadTask = uploadBytesResumable(videoRef, videoFile);
            
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                toast.loading(`Uploading video: ${Math.round(progress)}%`, { id: 'upload-progress' });
              },
              (error) => reject(error),
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
          videoUrl = videoUploadResult;

          // Upload thumbnail
          const sanitizedThumbnailName = thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const thumbnailRef = ref(storage, `thumbnails/${currentUser.uid}/${videoId}_${sanitizedThumbnailName}`);
          
          const thumbnailUploadResult = await new Promise<string>((resolve, reject) => {
            const uploadTask = uploadBytesResumable(thumbnailRef, thumbnailFile);
            
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                toast.loading(`Uploading thumbnail: ${Math.round(progress)}%`, { id: 'upload-progress' });
              },
              (error) => reject(error),
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
          thumbnailUrl = thumbnailUploadResult;

        } catch (firebaseError) {
          console.error('Firebase Storage upload failed:', firebaseError);
          throw firebaseError;
        }
      }
      // Demo mode fallback
      else {
        toast.loading('No upload service configured, creating demo entry...', { id: 'upload-progress' });
        videoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
        thumbnailUrl = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop';
      }

      // Create video document in Firestore
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
      
      const uploadMethod = useCloudinary ? 'Cloudinary' : useFirebaseStorage ? 'Firebase Storage' : 'Demo Mode';
      toast.success(`Video uploaded successfully via ${uploadMethod}!`, { id: 'upload-progress' });
      await fetchVideos();
      
    } catch (error: any) {
      console.error('Error uploading video:', error);
      
      // CORS error fallback
      const isCorsError = error.message?.includes('CORS') || 
                         error.message?.includes('preflight') ||
                         error.message?.includes('ERR_FAILED') ||
                         error.code === 'storage/unauthorized';
      
      if (isCorsError) {
        // Dispatch CORS error event for notification
        window.dispatchEvent(new CustomEvent('corsError'));
        
        toast.loading('Upload failed, creating demo entry...', { id: 'upload-progress' });
        
        // Create demo video entry
        const demoVideo: Omit<Video, 'id'> = {
          title: videoData.title || 'Untitled',
          description: videoData.description || '',
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',
          duration: videoData.duration || 60,
          views: 0,
          likes: 0,
          dislikes: 0,
          uploaderId: currentUser!.uid,
          uploaderName: userProfile!.displayName || currentUser!.displayName || 'Unknown User',
          uploaderAvatar: userProfile!.photoURL || currentUser!.photoURL || '',
          tags: videoData.tags || [],
          category: videoData.category || 'General',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        try {
          await addDoc(collection(db, 'videos'), demoVideo);
          toast.success('Video uploaded successfully! (Demo Mode - Please configure upload service)', { id: 'upload-progress' });
          await fetchVideos();
        } catch (dbError) {
          console.error('Database error:', dbError);
          toast.error('Failed to save video information', { id: 'upload-progress' });
        }
      } else {
        toast.error(`Upload failed: ${error.message}`, { id: 'upload-progress' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the methods remain the same as original VideoContext)
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

  // Increment video views
  const incrementViews = async (videoId: string) => {
    try {
      const videoRef = doc(db, 'videos', videoId);
      await updateDoc(videoRef, {
        views: increment(1)
      });
      
      // Update local state
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === videoId 
            ? { ...video, views: video.views + 1 }
            : video
        )
      );
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Like video functionality
  const likeVideo = async (videoId: string) => {
    if (!currentUser) {
      toast.error('Please login to like videos');
      return;
    }

    try {
      const videoRef = doc(db, 'videos', videoId);
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Check if user already liked this video
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const likedVideos = userData?.likedVideos || [];
      const dislikedVideos = userData?.dislikedVideos || [];
      
      if (likedVideos.includes(videoId)) {
        // Unlike the video
        await updateDoc(videoRef, { likes: increment(-1) });
        await updateDoc(userRef, { likedVideos: arrayRemove(videoId) });
        
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === videoId 
              ? { ...video, likes: Math.max(0, video.likes - 1) }
              : video
          )
        );
        toast.success('Removed from liked videos');
      } else {
        // Like the video
        await updateDoc(videoRef, { likes: increment(1) });
        await updateDoc(userRef, { likedVideos: arrayUnion(videoId) });
        
        // Remove from dislikes if present
        if (dislikedVideos.includes(videoId)) {
          await updateDoc(videoRef, { dislikes: increment(-1) });
          await updateDoc(userRef, { dislikedVideos: arrayRemove(videoId) });
        }
        
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === videoId 
              ? { 
                  ...video, 
                  likes: video.likes + 1,
                  dislikes: dislikedVideos.includes(videoId) ? Math.max(0, video.dislikes - 1) : video.dislikes
                }
              : video
          )
        );
        toast.success('Added to liked videos');
      }
    } catch (error) {
      console.error('Error liking video:', error);
      toast.error('Failed to like video');
    }
  };

  // Dislike video functionality
  const dislikeVideo = async (videoId: string) => {
    if (!currentUser) {
      toast.error('Please login to dislike videos');
      return;
    }

    try {
      const videoRef = doc(db, 'videos', videoId);
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Check if user already disliked this video
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const likedVideos = userData?.likedVideos || [];
      const dislikedVideos = userData?.dislikedVideos || [];
      
      if (dislikedVideos.includes(videoId)) {
        // Remove dislike
        await updateDoc(videoRef, { dislikes: increment(-1) });
        await updateDoc(userRef, { dislikedVideos: arrayRemove(videoId) });
        
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === videoId 
              ? { ...video, dislikes: Math.max(0, video.dislikes - 1) }
              : video
          )
        );
        toast.success('Removed dislike');
      } else {
        // Dislike the video
        await updateDoc(videoRef, { dislikes: increment(1) });
        await updateDoc(userRef, { dislikedVideos: arrayUnion(videoId) });
        
        // Remove from likes if present
        if (likedVideos.includes(videoId)) {
          await updateDoc(videoRef, { likes: increment(-1) });
          await updateDoc(userRef, { likedVideos: arrayRemove(videoId) });
        }
        
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === videoId 
              ? { 
                  ...video, 
                  dislikes: video.dislikes + 1,
                  likes: likedVideos.includes(videoId) ? Math.max(0, video.likes - 1) : video.likes
                }
              : video
          )
        );
        toast.success('Video disliked');
      }
    } catch (error) {
      console.error('Error disliking video:', error);
      toast.error('Failed to dislike video');
    }
  };

  // Add comment functionality
  const addComment = async (videoId: string, content: string) => {
    if (!currentUser || !userProfile) {
      toast.error('Please login to comment');
      return;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const comment = {
        id: uuidv4(),
        videoId,
        userId: currentUser.uid,
        userName: userProfile.displayName || currentUser.displayName || 'Anonymous',
        userAvatar: userProfile.photoURL || currentUser.photoURL || '',
        content: content.trim(),
        likes: 0,
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'comments'), comment);
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Get comments for a video
  const getComments = async (videoId: string): Promise<Comment[]> => {
    try {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('videoId', '==', videoId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(commentsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          replies: data.replies || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Comment;
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  // Subscribe to channel
  const subscribeToChannel = async (channelId: string) => {
    if (!currentUser || !userProfile) {
      toast.error('Please login to subscribe');
      return;
    }

    if (channelId === currentUser.uid) {
      toast.error('You cannot subscribe to your own channel');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const channelRef = doc(db, 'users', channelId);
      
      // Check if already subscribed
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const subscribedTo = userData?.subscribedTo || [];
      
      if (subscribedTo.includes(channelId)) {
        toast.info('Already subscribed to this channel');
        return;
      }

      // Add subscription
      await updateDoc(userRef, {
        subscribedTo: arrayUnion(channelId)
      });

      // Increment channel subscriber count
      await updateDoc(channelRef, {
        subscribers: increment(1)
      });

      toast.success('Subscribed successfully!');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe');
    }
  };

  // Unsubscribe from channel
  const unsubscribeFromChannel = async (channelId: string) => {
    if (!currentUser || !userProfile) {
      toast.error('Please login to unsubscribe');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const channelRef = doc(db, 'users', channelId);
      
      // Remove subscription
      await updateDoc(userRef, {
        subscribedTo: arrayRemove(channelId)
      });

      // Decrement channel subscriber count
      await updateDoc(channelRef, {
        subscribers: increment(-1)
      });

      toast.success('Unsubscribed successfully');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to unsubscribe');
    }
  };

  // Placeholder implementations for playlist methods
  const createPlaylist = async (name: string, description: string, isPublic: boolean) => {
    if (!currentUser) {
      toast.error('Please login to create playlists');
      return;
    }
    // Implementation for playlists can be added later
    toast.info('Playlist feature coming soon!');
  };

  const addToPlaylist = async (playlistId: string, videoId: string) => {
    toast.info('Playlist feature coming soon!');
  };

  const removeFromPlaylist = async (playlistId: string, videoId: string) => {
    toast.info('Playlist feature coming soon!');
  };

  const getUserPlaylists = async (): Promise<Playlist[]> => {
    return [];
  };

  const getPlaylist = async (playlistId: string): Promise<Playlist | null> => {
    return null;
  };

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
    incrementViews,
    addComment,
    getComments,
    subscribeToChannel,
    unsubscribeFromChannel,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    getUserPlaylists,
    getPlaylist
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};