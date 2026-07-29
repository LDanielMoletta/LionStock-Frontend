import api from './api';

export const movementService = {
  getAll: () => api.get('/api/movements'),
  getById: (id) => api.get(`/api/movements/${id}`),
  create: (payload) => api.post('/api/movements', payload),
  update: (id, payload) => api.put(`/api/movements/${id}`, payload),
  remove: (id) => api.delete(`/api/movements/${id}`),
};

export default movementService;
