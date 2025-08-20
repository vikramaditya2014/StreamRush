import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import cloudinaryService from '../services/cloudinaryService';
import { testCloudinaryPreset } from '../utils/cloudinaryDebug';

const CloudinaryTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testCloudinaryConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const status = cloudinaryService.getConfigStatus();
      
      // Use debug utility for better error reporting
      const result = await testCloudinaryPreset(
        status.cloudName, 
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'my_unsigned_preset'
      );
      
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Cloudinary connection successful!',
          details: {
            url: result.url,
            publicId: result.publicId,
            cloudName: status.cloudName,
            preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
          }
        });
      } else {
        throw new Error(result.error);
      }

    } catch (error: any) {
      console.error('Cloudinary test failed:', error);
      
      let errorMessage = 'Connection failed';
      if (error.message?.includes('400')) {
        errorMessage = 'Upload preset "streamrush_uploads" not found or incorrectly configured. Please check: 1) Preset exists 2) Signing Mode is "Unsigned" 3) Preset name is exactly "streamrush_uploads"';
      } else if (error.message?.includes('Invalid upload preset')) {
        errorMessage = 'Upload preset "streamrush_uploads" not found. Please create it in Cloudinary dashboard.';
      } else if (error.message?.includes('Invalid cloud name')) {
        errorMessage = 'Invalid cloud name. Please check your configuration.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }

      setTestResult({
        success: false,
        message: errorMessage,
        details: {
          error: error.message,
          status: error.status || 'Unknown',
          fullError: error
        }
      });
    } finally {
      setTesting(false);
    }
  };

  const status = cloudinaryService.getConfigStatus();

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Cloudinary Connection Test</h3>
      
      <div className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center space-x-2">
          {status.configured ? (
            <CheckCircle className="text-green-400" size={20} />
          ) : (
            <XCircle className="text-red-400" size={20} />
          )}
          <span className={status.configured ? 'text-green-400' : 'text-red-400'}>
            Configuration: {status.configured ? 'Ready' : 'Missing credentials'}
          </span>
        </div>

        {status.configured && (
          <div className="text-sm text-gray-400">
            <p>Cloud Name: <span className="text-white">{status.cloudName}</span></p>
            <p>Upload Preset: <span className="text-white">streamrush_uploads</span></p>
          </div>
        )}

        {/* Test Button */}
        <button
          onClick={testCloudinaryConnection}
          disabled={!status.configured || testing}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !status.configured || testing
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {testing ? (
            <div className="flex items-center space-x-2">
              <Loader className="animate-spin" size={16} />
              <span>Testing Connection...</span>
            </div>
          ) : (
            'Test Connection'
          )}
        </button>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-900/20 border border-green-600' 
              : 'bg-red-900/20 border border-red-600'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="text-green-400" size={20} />
              ) : (
                <XCircle className="text-red-400" size={20} />
              )}
              <span className={testResult.success ? 'text-green-400' : 'text-red-400'}>
                {testResult.message}
              </span>
            </div>
            
            {testResult.success && testResult.details && (
              <div className="text-sm text-gray-400 mt-2">
                <p>Test image uploaded successfully!</p>
                <p className="text-xs break-all">URL: {testResult.details.url}</p>
              </div>
            )}
            
            {!testResult.success && (
              <div className="text-sm text-red-300 mt-2">
                <p>Please check the setup guide and try again.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudinaryTest;