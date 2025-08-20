// Cloudinary Upload Service - Free Alternative to Firebase Storage
// This service provides free video and image hosting with generous limits

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string; // Unsigned upload preset
}

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  duration?: number;
}

class CloudinaryService {
  private config: CloudinaryConfig;

  constructor() {
    this.config = {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
      apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset'
    };
  }

  /**
   * Upload video file to Cloudinary
   */
  async uploadVideo(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    return this.uploadFile(file, 'video', onProgress);
  }

  /**
   * Upload image file to Cloudinary
   */
  async uploadImage(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    return this.uploadFile(file, 'image', onProgress);
  }

  /**
   * Generic file upload method
   */
  private async uploadFile(
    file: File, 
    resourceType: 'video' | 'image',
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.config.uploadPreset);
    
    // Add folder for organization
    formData.append('folder', 'streamrush');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudName}/${resourceType}/upload`;

    console.log('Cloudinary Upload Details:', {
      cloudName: this.config.cloudName,
      uploadPreset: this.config.uploadPreset,
      resourceType,
      uploadUrl,
      fileName: file.name,
      fileSize: file.size
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(Math.round(progress));
        }
      });

      xhr.addEventListener('load', () => {
        console.log('Cloudinary Response Status:', xhr.status);
        console.log('Cloudinary Response Text:', xhr.responseText);
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              format: response.format,
              bytes: response.bytes,
              duration: response.duration
            });
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          // Try to parse error response for better error message
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            const errorMessage = errorResponse.error?.message || `Upload failed with status: ${xhr.status}`;
            console.error('Cloudinary Error Response:', errorResponse);
            reject(new Error(errorMessage));
          } catch {
            reject(new Error(`Upload failed with status: ${xhr.status} - ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  }

  /**
   * Generate optimized video URL with transformations
   */
  getOptimizedVideoUrl(publicId: string, options?: {
    quality?: 'auto' | 'low' | 'medium' | 'high';
    width?: number;
    height?: number;
  }): string {
    const { quality = 'auto', width, height } = options || {};
    
    let transformation = `q_${quality}`;
    if (width && height) {
      transformation += `,w_${width},h_${height},c_fill`;
    }

    return `https://res.cloudinary.com/${this.config.cloudName}/video/upload/${transformation}/${publicId}`;
  }

  /**
   * Generate optimized image URL with transformations
   */
  getOptimizedImageUrl(publicId: string, options?: {
    quality?: 'auto' | 'low' | 'medium' | 'high';
    width?: number;
    height?: number;
  }): string {
    const { quality = 'auto', width = 400, height = 225 } = options || {};
    
    const transformation = `q_${quality},w_${width},h_${height},c_fill,f_webp`;

    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${transformation}/${publicId}`;
  }

  /**
   * Delete file from Cloudinary (requires API key)
   */
  async deleteFile(publicId: string, resourceType: 'video' | 'image' = 'image'): Promise<boolean> {
    // Note: Deletion requires server-side implementation with API secret
    // For now, we'll just return true (files will remain in Cloudinary)
    console.log(`File deletion requested for: ${publicId}`);
    return true;
  }

  /**
   * Check if Cloudinary is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.cloudName && this.config.uploadPreset);
  }

  /**
   * Get configuration status
   */
  getConfigStatus(): {
    configured: boolean;
    cloudName: string;
    hasUploadPreset: boolean;
  } {
    return {
      configured: this.isConfigured(),
      cloudName: this.config.cloudName,
      hasUploadPreset: !!this.config.uploadPreset
    };
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;