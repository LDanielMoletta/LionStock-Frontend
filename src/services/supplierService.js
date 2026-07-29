import api from './api';

export const supplierService = {
  getAll: () => api.get('/api/suppliers'),
  getById: (id) => api.get(`/api/suppliers/${id}`),
  create: (payload) => api.post('/api/suppliers', payload),
  update: (id, payload) => api.put(`/api/suppliers/${id}`, payload),
  remove: (id) => api.delete(`/api/suppliers/${id}`),
};

export default supplierService;
