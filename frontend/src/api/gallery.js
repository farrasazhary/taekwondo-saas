import api from './axios';

export const getGalleryPublic = () => fetch('/api/gallery/public').then(r => r.json());
export const getGallery = () => api.get('/gallery');
export const createGalleryItem = (data) => api.post('/gallery', data);
export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`);
