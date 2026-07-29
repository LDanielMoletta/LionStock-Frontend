import api from './api';

export const categoryService = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (payload) => api.post('/api/categories', payload),
  update: (id, payload) => api.put(`/api/categories/${id}`, payload),
  remove: (id) => api.delete(`/api/categories/${id}`),
};

export default categoryService;
