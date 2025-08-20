export interface Notification {
  id: string;
  userId: string;
  type: 'video_upload' | 'comment' | 'like' | 'subscription' | 'system';
  title: string;
  message: string;
  data?: {
    videoId?: string;
    channelId?: string;
    commentId?: string;
    thumbnailUrl?: string;
    channelName?: string;
    videoTitle?: string;
  };
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  videoUploads: boolean;
  comments: boolean;
  likes: boolean;
  subscriptions: boolean;
  system: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}