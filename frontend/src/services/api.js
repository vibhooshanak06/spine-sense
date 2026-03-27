import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const postureAPI = {
  getCurrent: () => api.get('/posture/current'),
  getHistory: () => api.get('/posture/history'),
  getSummary: (period) => api.get(`/posture/summary/${period}`),
  submitData: (data) => api.post('/posture/data', data),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTrends: () => api.get('/analytics/trends'),
  getRiskAssessment: () => api.get('/analytics/risk-assessment'),
};

export const userAPI = {
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  getProfile: () => api.get('/users/profile'),
  getSettings: () => api.get('/users/settings'),
};

export default api;
