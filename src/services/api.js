import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://lionstock.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lionstock_token');

  if (token) {
    if (typeof config.headers?.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lionstock_token');
      localStorage.removeItem('lionstock_user');

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export const extractListData = (response, fallback = []) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  const listCandidates = [payload?.items, payload?.results, payload?.products, payload?.categories, payload?.suppliers, payload?.movements, payload?.users];
  const foundList = listCandidates.find((value) => Array.isArray(value));

  return foundList || fallback;
};

export default api;
