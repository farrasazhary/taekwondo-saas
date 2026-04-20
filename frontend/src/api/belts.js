import api from './axios';

export const getBelts = () => api.get('/belts');
