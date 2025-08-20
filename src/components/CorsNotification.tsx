import React, { useState } from 'react';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';

interface CorsNotificationProps {
  show: boolean;
  onClose: () => void;
}

const CorsNotification: React.FC<CorsNotificationProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md bg-yellow-900/90 border border-yellow-600 rounded-lg p-4 shadow-lg">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="text-yellow-400 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="text-yellow-100 font-semibold mb-2">
            Storage Upload Issue Detected
          </h3>
          <p className="text-yellow-200 text-sm mb-3">
            Firebase Storage CORS is not configured for localhost. Your upload was saved in demo mode.
          </p>
          <div className="space-y-2">
            <p className="text-yellow-200 text-xs">
              To enable real file uploads:
            </p>
            <ol className="text-yellow-200 text-xs space-y-1 ml-4">
              <li>1. Install Google Cloud SDK</li>
              <li>2. Run: <code className="bg-black/30 px-1 rounded">gcloud auth login</code></li>
              <li>3. Run: <code className="bg-black/30 px-1 rounded">gsutil cors set cors.json gs://vidstream-98e50.firebasestorage.app</code></li>
            </ol>
            <a 
              href="https://cloud.google.com/storage/docs/configuring-cors"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-yellow-300 hover:text-yellow-100 text-xs mt-2"
            >
              <ExternalLink size={12} className="mr-1" />
              Learn more about CORS configuration
            </a>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-yellow-400 hover:text-yellow-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default CorsNotification;