/**
 * Helper to format image URLs.
 * Handles both full Cloudinary URLs and local relative paths.
 * 
 * @param {string} path - The image filename or full URL.
 * @param {string} type - The subfolder name (profiles, events, gallery, proofs).
 * @returns {string|null}
 */
export const getImageUrl = (path, type = 'profiles') => {
  if (!path) return null;
  
  // If it's already a full URL (Cloudinary), return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Fallback to local server URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${type}/${path}`;
};
