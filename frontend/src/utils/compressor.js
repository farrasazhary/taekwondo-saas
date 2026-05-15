import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload.
 * @param {File} imageFile - The original image file.
 * @param {Object} options - Compression options.
 * @returns {Promise<File>} - The compressed image file.
 */
export const compressImage = async (imageFile, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1,            // Max size in MB
    maxWidthOrHeight: 1200,  // Max width/height
    useWebWorker: true,
    fileType: 'image/webp'   // Convert to WebP for better compression
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const compressedFile = await imageCompression(imageFile, finalOptions);
    console.log(`Original size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Create a new File object to ensure filename and type are correct
    const fileName = imageFile.name.replace(/\.[^/.]+$/, "") + ".webp";
    return new File([compressedFile], fileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    return imageFile; // Return original if compression fails
  }
};
