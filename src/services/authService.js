import api from './api';

export const authService = {
  login: async (credentials) => api.post('/api/auth/login', credentials),
};

export default authService;
