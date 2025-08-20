// Alternative Cloudinary Service - Works without upload presets
// Uses direct API calls with timestamp-based authentication

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
}

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  duration?: number;
}

class CloudinaryServiceSigned {
  private config: CloudinaryConfig;

  constructor() {
    this.config = {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
      apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || ''
    };
  }

  /**
   * Upload video file to Cloudinary using direct API
   */
  async uploadVideo(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    return this.uploadFile(file, 'video', onProgress);
  }

  /**
   * Upload image file to Cloudinary using direct API
   */
  async uploadImage(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    return this.uploadFile(file, 'image', onProgress);
  }

  /**
   * Generic file upload method using basic authentication
   */
  private async uploadFile(
    file: File, 
    resourceType: 'video' | 'image',
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', this.config.apiKey);
    formData.append('timestamp', Math.round(Date.now() / 1000).toString());
    formData.append('folder', 'streamrush');

    // Add resource type specific parameters
    if (resourceType === 'video') {
      formData.append('resource_type', 'video');
      formData.append('quality', 'auto');
    } else {
      formData.append('resource_type', 'image');
      formData.append('quality', 'auto');
      formData.append('format', 'webp');
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudName}/${resourceType}/upload`;

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
          // Try to parse error response
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(`Upload failed: ${errorResponse.error?.message || xhr.statusText}`));
          } catch {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
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
   * Check if Cloudinary is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.cloudName && this.config.apiKey);
  }

  /**
   * Get configuration status
   */
  getConfigStatus(): {
    configured: boolean;
    cloudName: string;
    hasApiKey: boolean;
  } {
    return {
      configured: this.isConfigured(),
      cloudName: this.config.cloudName,
      hasApiKey: !!this.config.apiKey
    };
  }
}

// Export singleton instance
export const cloudinaryServiceSigned = new CloudinaryServiceSigned();
export default cloudinaryServiceSigned;