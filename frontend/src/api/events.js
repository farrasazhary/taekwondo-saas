import api from './axios';

export const getEvents = (params) => api.get('/events', { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateEvent = (id, data) => api.put(`/events/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const registerEvent = (id, data) => api.post(`/events/${id}/register`, data);
export const getMyRegistrations = () => api.get(`/events/registrations/me`);
export const getEventParticipants = (id) => api.get(`/events/${id}/participants`);
export const getEventPublic = (id) => api.get(`/events/public/${id}`);
