import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import cloudinaryService from '../services/cloudinaryService';

const CloudinaryStatus: React.FC = () => {
  const status = cloudinaryService.getConfigStatus();

  if (!status.configured) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="text-yellow-400" size={20} />
          <div>
            <h3 className="text-yellow-100 font-semibold">Cloudinary Not Configured</h3>
            <p className="text-yellow-200 text-sm">
              Currently using demo mode. Configure Cloudinary for real uploads.
            </p>
            <div className="mt-2 text-xs text-yellow-300">
              <p>Missing: {!status.cloudName && 'Cloud Name'} {!status.hasUploadPreset && 'Upload Preset'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2">
        <CheckCircle className="text-green-400" size={20} />
        <div>
          <h3 className="text-green-100 font-semibold">Cloudinary Ready</h3>
          <p className="text-green-200 text-sm">
            Real file uploads enabled via Cloudinary ({status.cloudName})
          </p>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryStatus;