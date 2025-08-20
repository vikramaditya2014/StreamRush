export const VIDEO_CATEGORIES = [
  'General',
  'Gaming',
  'Music',
  'Sports',
  'News',
  'Entertainment',
  'Education',
  'Technology',
  'Travel',
  'Cooking',
  'Comedy',
  'Science',
  'Art',
  'Fashion',
  'Health',
  'Fitness',
  'DIY',
  'Pets',
  'Cars',
  'Business'
] as const;

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'upload_date', label: 'Upload date' },
  { value: 'view_count', label: 'View count' },
  { value: 'rating', label: 'Rating' }
] as const;

export const UPLOAD_DATE_FILTERS = [
  { value: 'any', label: 'Any time' },
  { value: 'hour', label: 'Last hour' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' }
] as const;

export const DURATION_FILTERS = [
  { value: 'any', label: 'Any duration' },
  { value: 'short', label: 'Under 4 minutes' },
  { value: 'medium', label: '4-20 minutes' },
  { value: 'long', label: 'Over 20 minutes' }
] as const;

export const MAX_FILE_SIZES = {
  VIDEO: 100 * 1024 * 1024, // 100MB
  THUMBNAIL: 5 * 1024 * 1024, // 5MB
  AVATAR: 2 * 1024 * 1024 // 2MB
} as const;

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/avi',
  'video/mov',
  'video/wmv'
] as const;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const;

export const ROUTES = {
  HOME: '/',
  WATCH: '/watch',
  SEARCH: '/search',
  CHANNEL: '/channel',
  UPLOAD: '/upload',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  TRENDING: '/trending',
  SUBSCRIPTIONS: '/subscriptions',
  HISTORY: '/history',
  LIKED: '/liked',
  PLAYLISTS: '/playlists'
} as const;

export const STORAGE_PATHS = {
  VIDEOS: 'videos',
  THUMBNAILS: 'thumbnails',
  AVATARS: 'avatars'
} as const;

export const COLLECTION_NAMES = {
  USERS: 'users',
  VIDEOS: 'videos',
  COMMENTS: 'comments',
  PLAYLISTS: 'playlists'
} as const;