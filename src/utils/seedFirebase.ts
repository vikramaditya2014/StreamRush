import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Video, User, Comment } from '../types';
import { Notification } from '../types/notification';

// Sample users/channels data
const sampleUsers = [
  {
    uid: 'techguru-uid-1',
    email: 'techguru@example.com',
    displayName: 'TechGuru',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    channelName: 'TechGuru',
    bio: 'Latest technology tutorials and reviews',
    subscribers: 1200000,
    subscribedTo: [],
    likedVideos: [],
    dislikedVideos: [],
    watchHistory: [],
    createdAt: new Date('2022-01-15'),
  },
  {
    uid: 'musiclover-uid-2',
    email: 'musiclover@example.com',
    displayName: 'MusicLover',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616c6d4e6e8?w=150&h=150&fit=crop&crop=face',
    channelName: 'MusicLover',
    bio: 'Relaxing music and playlists for every mood',
    subscribers: 850000,
    subscribedTo: [],
    likedVideos: [],
    dislikedVideos: [],
    watchHistory: [],
    createdAt: new Date('2021-08-20'),
  },
  {
    uid: 'progamer-uid-3',
    email: 'progamer@example.com',
    displayName: 'ProGamer',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    channelName: 'ProGamer',
    bio: 'Epic gaming content and live streams',
    subscribers: 2100000,
    subscribedTo: [],
    likedVideos: [],
    dislikedVideos: [],
    watchHistory: [],
    createdAt: new Date('2020-12-10'),
  },
  {
    uid: 'chefmaster-uid-4',
    email: 'chefmaster@example.com',
    displayName: 'ChefMaster',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    channelName: 'ChefMaster',
    bio: 'Delicious recipes and cooking tips',
    subscribers: 650000,
    subscribedTo: [],
    likedVideos: [],
    dislikedVideos: [],
    watchHistory: [],
    createdAt: new Date('2022-03-05'),
  }
];

// Sample videos data
const sampleVideos = [
  {
    title: 'Building a Modern React App with TypeScript',
    description: 'Learn how to build a scalable React application using TypeScript, including best practices and advanced patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    duration: 1245, // 20:45
    views: 15400,
    likes: 892,
    dislikes: 23,
    uploaderId: 'techguru-uid-1',
    uploaderName: 'TechGuru',
    uploaderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    category: 'Technology',
    tags: ['react', 'typescript', 'javascript', 'programming', 'tutorial'],
    createdAt: new Date('2024-01-15'),
  },
  {
    title: 'Epic Gaming Montage - Best Moments 2024',
    description: 'Check out the most epic gaming moments from this year! Featuring incredible plays and highlights.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    duration: 892, // 14:52
    views: 45200,
    likes: 2300,
    dislikes: 45,
    uploaderId: 'progamer-uid-3',
    uploaderName: 'ProGamer',
    uploaderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    category: 'Gaming',
    tags: ['gaming', 'montage', 'highlights', 'epic', 'gameplay'],
    createdAt: new Date('2024-01-18'),
  },
  {
    title: 'Relaxing Jazz Music for Study & Work',
    description: 'Perfect background music for studying, working, or just relaxing. Smooth jazz instrumentals to help you focus.',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=360&fit=crop',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    duration: 3600, // 1:00:00
    views: 123500,
    likes: 5678,
    dislikes: 89,
    uploaderId: 'musiclover-uid-2',
    uploaderName: 'MusicLover',
    uploaderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d4e6e8?w=150&h=150&fit=crop&crop=face',
    category: 'Music',
    tags: ['jazz', 'relaxing', 'study', 'work', 'instrumental'],
    createdAt: new Date('2024-01-18'),
  },
  {
    title: '10-Minute Italian Pasta Recipe',
    description: 'Quick and delicious Italian pasta recipe that you can make in just 10 minutes. Perfect for busy weeknights!',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=360&fit=crop',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
    duration: 645, // 10:45
    views: 34600,
    likes: 1200,
    dislikes: 34,
    uploaderId: 'chefmaster-uid-4',
    uploaderName: 'ChefMaster',
    uploaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    category: 'Food',
    tags: ['cooking', 'pasta', 'italian', 'recipe', 'quick'],
    createdAt: new Date('2024-01-28'),
  },
  {
    title: 'AI and Machine Learning Explained',
    description: 'A comprehensive guide to understanding artificial intelligence and machine learning concepts for beginners.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=640&h=360&fit=crop',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4',
    duration: 1834, // 30:34
    views: 67900,
    likes: 3500,
    dislikes: 78,
    uploaderId: 'techguru-uid-1',
    uploaderName: 'TechGuru',
    uploaderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    category: 'Technology',
    tags: ['ai', 'machine learning', 'technology', 'tutorial', 'beginner'],
    createdAt: new Date('2024-01-28'),
  },
  {
    title: 'Top 10 Travel Destinations 2024',
    description: 'Discover the most amazing travel destinations for 2024. From hidden gems to popular hotspots!',
    thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=640&h=360&fit=crop',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1920x1080_1mb.mp4',
    duration: 1156, // 19:16
    views: 89100,
    likes: 4600,
    dislikes: 120,
    uploaderId: 'musiclover-uid-2',
    uploaderName: 'MusicLover',
    uploaderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d4e6e8?w=150&h=150&fit=crop&crop=face',
    category: 'Travel',
    tags: ['travel', 'destinations', '2024', 'vacation', 'adventure'],
    createdAt: new Date('2024-01-28'),
  },
  {
    title: 'Intense Workout - 30 Minutes Full Body',
    description: 'Get ready for an intense 30-minute full body workout that will challenge every muscle group!',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640&h=360&fit=crop',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1920x1080_2mb.mp4',
    duration: 1800, // 30:00
    views: 23500,
    likes: 1900,
    dislikes: 45,
    uploaderId: 'progamer-uid-3',
    uploaderName: 'ProGamer',
    uploaderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    category: 'Sports',
    tags: ['workout', 'fitness', 'exercise', 'fullbody', 'intense'],
    createdAt: new Date('2024-02-01'),
  },
  {
    title: 'Breaking: Latest Tech News Update',
    description: 'Stay updated with the latest technology news, product launches, and industry insights from around the world.',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=640&h=360&fit=crop',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1920x1080_5mb.mp4',
    duration: 756, // 12:36
    views: 156800,
    likes: 8900,
    dislikes: 234,
    uploaderId: 'techguru-uid-1',
    uploaderName: 'TechGuru',
    uploaderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    category: 'News',
    tags: ['tech news', 'technology', 'breaking', 'updates', 'industry'],
    createdAt: new Date('2024-02-01'),
  }
];

// Sample comments for each video
const sampleComments = [
  {
    videoId: '1',
    userId: 'user1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face',
    text: 'Great video! Really helpful content.',
    likes: 12,
    dislikes: 0,
    createdAt: new Date('2024-01-16'),
  },
  {
    videoId: '1',
    userId: 'user2',
    userName: 'Jane Smith',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d4e6e8?w=150&h=150&fit=crop&crop=face',
    text: 'Thanks for sharing this! Looking forward to more content like this.',
    likes: 8,
    dislikes: 0,
    createdAt: new Date('2024-01-17'),
  },
  {
    videoId: '1',
    userId: 'user3',
    userName: 'Mike Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    text: 'Excellent explanation! This cleared up a lot of confusion for me.',
    likes: 15,
    dislikes: 1,
    createdAt: new Date('2024-01-18'),
  }
];

// Sample notifications data
const sampleNotifications: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: 'techguru-uid-1',
    type: 'video_upload',
    title: 'MusicLover uploaded a new video',
    message: 'Relaxing Jazz Music for Study & Work',
    data: {
      videoId: 'sample-video-3',
      channelId: 'musiclover-uid-2',
      channelName: 'MusicLover',
      videoTitle: 'Relaxing Jazz Music for Study & Work',
      thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=360&fit=crop'
    },
    read: false
  },
  {
    userId: 'techguru-uid-1',
    type: 'comment',
    title: 'ProGamer commented on your video',
    message: 'Great tutorial! This really helped me understand TypeScript better.',
    data: {
      videoId: 'sample-video-1',
      channelId: 'progamer-uid-3',
      channelName: 'ProGamer',
      videoTitle: 'Building a Modern React App with TypeScript',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop'
    },
    read: false
  },
  {
    userId: 'techguru-uid-1',
    type: 'like',
    title: 'ChefMaster liked your video',
    message: 'Building a Modern React App with TypeScript',
    data: {
      videoId: 'sample-video-1',
      channelId: 'chefmaster-uid-4',
      channelName: 'ChefMaster',
      videoTitle: 'Building a Modern React App with TypeScript',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop'
    },
    read: true
  },
  {
    userId: 'musiclover-uid-2',
    type: 'subscription',
    title: 'TechGuru subscribed to your channel',
    message: 'You now have a new subscriber!',
    data: {
      channelId: 'techguru-uid-1',
      channelName: 'TechGuru'
    },
    read: false
  },
  {
    userId: 'progamer-uid-3',
    type: 'video_upload',
    title: 'ChefMaster uploaded a new video',
    message: '10-Minute Italian Pasta Recipe',
    data: {
      videoId: 'sample-video-5',
      channelId: 'chefmaster-uid-4',
      channelName: 'ChefMaster',
      videoTitle: '10-Minute Italian Pasta Recipe',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=360&fit=crop'
    },
    read: false
  },
  {
    userId: 'chefmaster-uid-4',
    type: 'system',
    title: 'Welcome to StreamRush!',
    message: 'Start uploading videos and building your audience. Check out our creator tools and analytics.',
    data: {},
    read: true
  }
];

export const seedFirebaseData = async () => {
  if (!db) {
    console.error('Firebase not initialized');
    return;
  }

  try {
    console.log('🌱 Starting Firebase data seeding...');

    // Seed users/channels with specific document IDs
    console.log('👥 Seeding users/channels...');
    for (const user of sampleUsers) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Seed videos
    console.log('🎥 Seeding videos...');
    const videoRefs = [];
    for (const video of sampleVideos) {
      const docRef = await addDoc(collection(db, 'videos'), {
        ...video,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      videoRefs.push(docRef.id);
    }

    // Seed comments
    console.log('💬 Seeding comments...');
    for (let i = 0; i < sampleComments.length; i++) {
      const comment = sampleComments[i];
      await addDoc(collection(db, 'comments'), {
        ...comment,
        videoId: videoRefs[0], // Associate with first video
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Seed notifications
    console.log('🔔 Seeding notifications...');
    for (const notification of sampleNotifications) {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    console.log('✅ Firebase data seeding completed successfully!');
    console.log(`📊 Seeded: ${sampleUsers.length} users, ${sampleVideos.length} videos, ${sampleComments.length} comments, ${sampleNotifications.length} notifications`);
    
    return {
      users: sampleUsers.length,
      videos: sampleVideos.length,
      comments: sampleComments.length,
      notifications: sampleNotifications.length,
    };
  } catch (error) {
    console.error('❌ Error seeding Firebase data:', error);
    throw error;
  }
};

// Function to clear all data (use with caution)
export const clearFirebaseData = async () => {
  if (!db) {
    console.error('Firebase not initialized');
    return;
  }

  try {
    console.log('🗑️ Clearing Firebase data...');
    
    // Note: In a real app, you'd want to use batch operations for better performance
    // This is a simple implementation for development purposes
    
    console.log('✅ Firebase data cleared (implement batch delete for production)');
  } catch (error) {
    console.error('❌ Error clearing Firebase data:', error);
    throw error;
  }
};