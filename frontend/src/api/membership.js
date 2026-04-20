import api from './axios';

export const requestMembershipUpgrade = (type) => api.post('/membership/upgrade', { type });
