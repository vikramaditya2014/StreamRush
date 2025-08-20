// Debug utility to test Cloudinary configuration
export const testCloudinaryPreset = async (cloudName: string, uploadPreset: string) => {
  const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  // Create a minimal test image (1x1 pixel PNG)
  const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch(testImageData);
    const blob = await response.blob();
    const testFile = new File([blob], 'test.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('upload_preset', uploadPreset);

    console.log('Testing Cloudinary with:', {
      url: testUrl,
      cloudName,
      uploadPreset,
      fileSize: testFile.size
    });

    const uploadResponse = await fetch(testUrl, {
      method: 'POST',
      body: formData
    });

    const responseText = await uploadResponse.text();
    console.log('Cloudinary Response Status:', uploadResponse.status);
    console.log('Cloudinary Response:', responseText);

    if (!uploadResponse.ok) {
      const errorData = JSON.parse(responseText);
      throw new Error(`Cloudinary Error: ${errorData.error?.message || uploadResponse.statusText}`);
    }

    const result = JSON.parse(responseText);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };

  } catch (error: any) {
    console.error('Cloudinary test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test preset existence by making a simple API call
export const checkPresetExists = async (cloudName: string, uploadPreset: string) => {
  try {
    const result = await testCloudinaryPreset(cloudName, uploadPreset);
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};