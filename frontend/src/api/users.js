import api from './axios';

export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data, config = {}) => api.put(`/users/${id}`, data, config);
export const changePassword = (id, data) => api.put(`/users/${id}/password`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getUserStats = () => api.get('/users/stats');
