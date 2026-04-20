import api from './axios';

export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);
export const uploadPaymentProof = (id, formData) => api.post(`/invoices/${id}/upload-proof`, formData);
export const verifyPayment = (id, data) => api.put(`/invoices/${id}/verify`, data);
