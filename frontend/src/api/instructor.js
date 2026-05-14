import api from './axios';

export const getInstructorsPublic = () => fetch('/api/instructors/public').then(r => r.json());
export const getInstructors = () => api.get('/instructors');
export const createInstructor = (data) => api.post('/instructors', data);
export const deleteInstructor = (id) => api.delete(`/instructors/${id}`);
export const updateInstructor = (id, data) => api.put(`/instructors/${id}`, data);
