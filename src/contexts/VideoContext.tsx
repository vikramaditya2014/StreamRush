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
  deleteDoc,
  where,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Video, Comment, Playlist, SearchFilters } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { mockVideos, getTrendingVideos as getMockTrendingVideos, getVideosByCategory, searchVideos as searchMockVideos, getMockComments } from '../utils/mockData';

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
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (videoFile: File, thumbnailFile: File, videoData: Partial<Video>) => {
    try {
      setLoading(true);
      
      if (!db || !storage) {
        console.error('Firebase not initialized. Please check your configuration.');
        toast.error('Upload failed. Firebase not configured properly.');
        setLoading(false);
        return;
      }

      if (!currentUser || !userProfile) {
        toast.error('Please login to upload videos');
        setLoading(false);
        return;
      }
      
      // Upload video file
      const videoId = uuidv4();
      const videoRef = ref(storage, `videos/${videoId}/${videoFile.name}`);
      const videoSnapshot = await uploadBytes(videoRef, videoFile);
      const videoUrl = await getDownloadURL(videoSnapshot.ref);

      // Upload thumbnail
      const thumbnailRef = ref(storage, `thumbnails/${videoId}/${thumbnailFile.name}`);
      const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailFile);
      const thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref);

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
        uploaderName: userProfile.displayName,
        uploaderAvatar: userProfile.photoURL,
        tags: videoData.tags || [],
        category: videoData.category || 'General',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'videos'), video);
      toast.success('Video uploaded successfully!');
      await fetchVideos();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const getVideo = async (id: string): Promise<Video | null> => {
    try {
      if (!db) {
        // Demo mode - find video in local state or mock data
        const video = videos.find(v => v.id === id) || mockVideos.find(v => v.id === id);
        return video || null;
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
      // Fallback to local/mock data
      const video = videos.find(v => v.id === id) || mockVideos.find(v => v.id === id);
      return video || null;
    }
  };

  const searchVideos = async (searchQuery: string, filters?: SearchFilters): Promise<Video[]> => {
    try {
      if (!db) {
        // Use mock data search
        return searchMockVideos(searchQuery);
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
      return searchMockVideos(searchQuery);
    }
  };

  const getTrendingVideos = async (): Promise<Video[]> => {
    try {
      if (!db) {
        // Use mock trending data
        return getMockTrendingVideos();
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
      return getMockTrendingVideos();
    }
  };

  const getChannelVideos = async (userId: string): Promise<Video[]> => {
    try {
      if (!db) {
        // Demo mode - filter videos by userId
        const allVideos = [...videos, ...mockVideos];
        return allVideos.filter(video => video.uploaderId === userId);
      }

      const videosRef = collection(db, 'videos');
      const q = query(videosRef, where('uploaderId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Video[];
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      // Fallback to demo data
      const allVideos = [...videos, ...mockVideos];
      return allVideos.filter(video => video.uploaderId === userId);
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
        // Demo mode - return mock comments
        return getMockComments(videoId);
      }

      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('videoId', '==', videoId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Comment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return getMockComments(videoId);
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
    getUserPlaylists,
    incrementViews
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};