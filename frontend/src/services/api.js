import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// Posture API
export const postureAPI = {
  submitData: (data) => api.post('/posture/data', data),
  getCurrent: () => api.get('/posture/current'),
  getHistory: (params) => api.get('/posture/history', { params }),
  getSummary: (period) => api.get(`/posture/summary/${period}`),
};

// Device API
export const deviceAPI = {
  getDevices: () => api.get('/devices'),
  addDevice: (device) => api.post('/devices', device),
  updateDevice: (id, updates) => api.put(`/devices/${id}`, updates),
  deleteDevice: (id) => api.delete(`/devices/${id}`),
  calibrateDevice: (id, calibrationData) => api.post(`/devices/${id}/calibrate`, calibrationData),
  updateDeviceStatus: (id, status) => api.post(`/devices/${id}/status`, status),
  getDeviceHealth: (id) => api.get(`/devices/${id}/health`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profile) => api.put('/users/profile', profile),
  getSettings: () => api.get('/users/settings'),
  updateSettings: (settings) => api.put('/users/settings', settings),
  addMedicalHistory: (entry) => api.post('/users/medical-history', entry),
  removeMedicalHistory: (entryId) => api.delete(`/users/medical-history/${entryId}`),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  deleteAccount: (password) => api.delete('/users/account', { data: { password } }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getRiskAssessment: () => api.get('/analytics/risk-assessment'),
};

export default api;