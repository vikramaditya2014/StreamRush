import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X } from 'lucide-react';
import { useVideo } from '../contexts/VideoContextWithCloudinary';
import { useAuth } from '../contexts/AuthContext';
import CloudinaryStatus from '../components/CloudinaryStatus';
import CloudinaryTest from '../components/CloudinaryTest';
import toast from 'react-hot-toast';

const Upload: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    tags: '',
    duration: 0
  });
  const [uploading, setUploading] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { uploadVideo } = useVideo();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const categories = [
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
    'Health'
  ];

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('Video file size must be less than 100MB');
        return;
      }
      
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      
      // Auto-generate title from filename
      if (!formData.title) {
        const filename = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: filename }));
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Thumbnail file size must be less than 5MB');
        return;
      }
      
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const duration = Math.floor(videoRef.current.duration);
      setFormData(prev => ({ ...prev, duration }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!thumbnailFile) {
      toast.error('Please select a thumbnail image');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    try {
      setUploading(true);
      
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await uploadVideo(videoFile, thumbnailFile, {
        ...formData,
        tags
      });

      navigate('/');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview('');
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  // Allow uploads in demo mode
  const isDemoMode = !currentUser;

  return (
    <div className="pt-16 px-3 sm:px-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload video</h1>
        <p className="text-youtube-lightgray text-sm sm:text-base">
          Share your video with the world
          {isDemoMode && <span className="ml-2 px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full">Demo Mode</span>}
        </p>
      </div>

      <CloudinaryStatus />
      <CloudinaryTest />

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Video Upload */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Video file</h2>
          {!videoFile ? (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-youtube-gray rounded-lg p-8 sm:p-12 text-center cursor-pointer hover:border-youtube-red transition-colors"
            >
              <UploadIcon size={40} className="sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-youtube-lightgray" />
              <p className="text-base sm:text-lg mb-2">Select video to upload</p>
              <p className="text-youtube-lightgray text-xs sm:text-sm">
                Or drag and drop a video file (Max: 100MB)
              </p>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                src={videoPreview}
                onLoadedMetadata={handleVideoLoad}
                controls
                className="w-full max-w-2xl rounded-lg"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="mt-2 text-sm text-youtube-lightgray">
                {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Thumbnail</h2>
          {!thumbnailFile ? (
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed border-youtube-gray rounded-lg p-8 text-center cursor-pointer hover:border-youtube-red transition-colors max-w-md"
            >
              <UploadIcon size={32} className="mx-auto mb-2 text-youtube-lightgray" />
              <p className="mb-1">Select thumbnail</p>
              <p className="text-youtube-lightgray text-sm">
                JPG, PNG (Max: 5MB)
              </p>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative max-w-md">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full aspect-video object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Video Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Enter video title"
                maxLength={100}
                required
              />
              <div className="text-xs text-youtube-lightgray mt-1">
                {formData.title.length}/100
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field w-full h-32 resize-none"
                placeholder="Tell viewers about your video"
                maxLength={5000}
              />
              <div className="text-xs text-youtube-lightgray mt-1">
                {formData.description.length}/5000
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Enter tags separated by commas"
              />
              <div className="text-xs text-youtube-lightgray mt-1">
                Separate tags with commas (e.g., gaming, tutorial, fun)
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {formData.duration > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration
                </label>
                <div className="text-youtube-lightgray">
                  {Math.floor(formData.duration / 60)}:{(formData.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-youtube-gray">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={uploading || !videoFile || !thumbnailFile}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadIcon size={16} />
                <span>Upload video</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;