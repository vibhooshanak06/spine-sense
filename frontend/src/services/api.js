/**
 * API Service
 * Fetch-based HTTP client for SpineSense frontend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
        throw data;
    }

    return data;
}

export const postureAPI = {
    getCurrent: () => request('/posture/current'),
    getHistory: () => request('/posture/history'),
    getSummary: (period) => request(`/posture/summary/${period}`),
    submitData: (data) => request('/posture/data', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

export const analyticsAPI = {
    getDashboard: () => request('/analytics/dashboard'),
    getTrends: () => request('/analytics/trends'),
    getRiskAssessment: () => request('/analytics/risk-assessment')
};

export const userAPI = {
    getDashboardStats: () => request('/users/dashboard-stats'),
    getProfile: () => request('/users/profile'),
    getSettings: () => request('/users/settings')
};

export const authAPI = {
    login: (credentials) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    register: (userData) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    getMe: () => request('/auth/me')
};

export default {
    postureAPI,
    analyticsAPI,
    userAPI,
    authAPI
};
