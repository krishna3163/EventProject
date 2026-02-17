import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor — Attach JWT Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.response?.data?.message || 'An error occurred';

        if (error.response?.status === 401) {
            console.error('Authentication Error: Session expired or invalid');
            // Supabase handles refresh, but if the backend returns 401, 
            // the token might be truly invalid or corrupted.
        } else if (error.response?.status === 403) {
            toast.error('Access denied. You do not have permission.');
        } else {
            console.error('API Error:', message);
            if (typeof message === 'string') {
                toast.error(message);
            }
        }

        return Promise.reject(error);
    }
);

// Unified API Service
export const apiService = {
    // --- AUTHENTICATION & SYNC ---
    auth: {
        sync: () => api.post('/api/users/sync'),
    },

    // --- USER PROFILE ---
    user: {
        getUser: (id) => api.get(`/user/getById/${id}`),
        getAllUsers: () => api.get('/user/getAll'),
        updateUser: (id, userData) => api.put(`/user/update/${id}`, userData),
        deleteUser: (id) => api.delete(`/user/delete/${id}`),
    },

    // --- QUIZ EVENTS (MCQ) ---
    quiz: {
        create: (data) => api.post('/api/events/createEvent', data),
        getAll: () => api.get('/api/events/getAllEvent'),
        getById: (id) => api.get(`/api/events/getEventById/${id}`),
        addQuestion: (eventId, data) => api.post(`/api/questions/${eventId}`, data),
        addBulkQuestions: (eventId, data) => api.post(`/api/questions/bulk/${eventId}`, data),
        update: (id, data) => api.put(`/api/events/updateEvent/${id}`, data),
        delete: (id) => api.delete(`/api/events/deleteEvent/${id}`),

        // Test Taking
        startTest: (eventId, studentId) => api.post(`/api/mcq/start/${eventId}`, null, { headers: { studentId } }),
        submitTest: (eventId, studentId, data) => api.post(`/api/mcq/submit/${eventId}`, data, { headers: { studentId } }),
        getRemainingTime: (eventId, studentId) => api.get(`/api/mcq/remaining-time/${eventId}`, { headers: { studentId } }),

        // Analytics
        getAnalytics: (eventId) => api.get(`/api/mcq/admin/analytics/${eventId}`),
        downloadPdf: (eventId) => api.get(`/api/mcq/admin/analytics/pdf/${eventId}`, { responseType: 'blob' }),
    },

    // --- REGISTRATIONS ---
    registration: {
        register: (eventId, userId) => api.post(`/api/events/${eventId}/register`, { userId }),
        getParticipants: (eventId) => api.get(`/api/events/${eventId}/participants`),
        unregister: (eventId, userId) => api.delete(`/api/events/${eventId}/unregister`, { params: { userId } }),
    },

    // --- CODING CONTESTS ---
    contest: {
        create: (data) => api.post('/contest/insert', data),
        getAll: () => api.get('/contest/getAll'),
        getById: (id) => api.get(`/contest/getById/${id}`),
        update: (id, data) => api.put(`/contest/update/${id}`, data),
        delete: (id) => api.delete(`/contest/delete/${id}`),
    },

    // --- PROBLEMS (Coding) ---
    problem: {
        create: (data) => api.post('/problem/insert', data),
        getAll: () => api.get('/problem/getAll'),
        getById: (id) => api.get(`/problem/getById/${id}`),
        update: (id, data) => api.put(`/problem/update/${id}`, data),
        delete: (id) => api.delete(`/problem/delete/${id}`),
    },

    // --- SUBMISSIONS & LEADERBOARD ---
    submission: {
        submit: (data) => api.post('/submission', data),
        getAll: () => api.get('/submission'),
        getById: (id) => api.get(`/submission/${id}`),
        getByUser: (userId) => api.get(`/submission/userId/${userId}`),
        getByContest: (contestId) => api.get(`/submission/contestId/${contestId}`),
        getByProblem: (problemId) => api.get(`/submission/problemId/${problemId}`),
    },
    leaderboard: {
        get: (contestId) => api.get(`/leaderboard/${contestId}`),
    }
};

export default api;
