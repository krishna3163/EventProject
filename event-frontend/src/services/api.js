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
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.response?.data?.message || 'An error occurred';

        if (error.response?.status === 401) {
            // Token expired – clear session
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            toast.error('Access denied. You do not have permission.');
        } else if (error.response?.status !== 404) {
            console.error('API Error:', message);
            if (typeof message === 'string' && message !== 'An error occurred') {
                toast.error(message);
            }
        }

        return Promise.reject(error);
    }
);

// Unified API Service
export const apiService = {
    // --- AUTHENTICATION ---
    auth: {
        login: (usernameOrEmail, password) => api.post('/api/auth/login', { usernameOrEmail, password }),
        registerStudent: (data) => api.post('/api/auth/register/student', data),
        registerOrganization: (data) => api.post('/api/auth/register/organization', data),
        sync: () => api.post('/api/users/sync'),
    },

    // --- USER PROFILE ---
    user: {
        getMe: () => api.get('/api/users/me'),
        getUser: (id) => api.get(`/user/getById/${id}`),
        getAllUsers: () => api.get('/user/getAll'),
        updateUser: (id, userData) => api.put(`/user/update/${id}`, userData),
        deleteUser: (id) => api.delete(`/user/delete/${id}`),
    },

    // --- ORGANIZATION ---
    organization: {
        getAll: () => api.get('/api/admin/org/all'),
        getById: (id) => api.get(`/api/admin/org/${id}`),
        getPublicProfile: (id) => api.get(`/api/public/org/${id}`),
        getPublicEvents: (id) => api.get(`/api/public/org/${id}/events`),
        search: (query) => api.get(`/api/public/org/search?query=${query}`),
        getStudents: (orgId) => api.get(`/api/admin/org/${orgId}/students`),
        getAdmins: (orgId) => api.get(`/api/admin/org/${orgId}/admins`),
        addAdmin: (orgId, data) => api.post(`/api/admin/org/${orgId}/add-admin`, data),
        toggleBlockUser: (orgId, userId) => api.put(`/api/admin/org/${orgId}/users/${userId}/toggle-block`),
    },

    // --- SUPER ADMIN ---
    superAdmin: {
        getAllUsers: () => api.get('/api/super/users'),
        getAllOrgs: () => api.get('/api/super/organizations'),
        getAnalytics: () => api.get('/api/super/analytics'),
        updateUserRole: (userId, role) => api.put(`/api/super/users/${userId}/role`, { role }),
        deleteUser: (userId) => api.delete(`/api/super/users/${userId}`),
        toggleBlockUser: (userId) => api.put(`/api/super/users/${userId}/toggle-block`),
    },

    // --- QUIZ EVENTS (MCQ) ---
    quiz: {
        create: (data) => api.post('/api/events/createEvent', data),
        getAll: () => api.get('/api/events/getAllEvent'),
        getOrgEvents: (orgId) => api.get(`/api/events/getOrgEvents/${orgId}`),
        getById: (id) => api.get(`/api/events/getEventById/${id}`),
        getQuestions: (eventId) => api.get(`/api/questions/event/${eventId}`),
        addQuestion: (eventId, data) => api.post(`/api/questions/${eventId}`, data),
        addBulkQuestions: (eventId, data) => api.post(`/api/questions/bulk/${eventId}`, data),
        update: (id, data) => api.put(`/api/events/updateEvent/${id}`, data),
        delete: (id) => api.delete(`/api/events/deleteEvent/${id}`),
        deleteQuestion: (qId) => api.delete(`/api/questions/${qId}`),

        // Test Taking
        startTest: (eventId, studentId, data = {}) => api.post(`/api/mcq/start/${eventId}`, data, { headers: { studentId } }),
        submitTest: (eventId, studentId, data) => api.post(`/api/mcq/submit/${eventId}`, data, { headers: { studentId } }),
        getRemainingTime: (eventId, studentId) => api.get(`/api/mcq/remaining-time/${eventId}`, { headers: { studentId } }),
        getResult: (eventId, studentId) => api.get(`/api/mcq/result/${eventId}`, { headers: { studentId } }),

        // Analytics
        getAnalytics: (eventId) => api.get(`/api/mcq/admin/analytics/${eventId}`),
        downloadPdf: (eventId) => api.get(`/api/mcq/admin/analytics/pdf/${eventId}`, { responseType: 'blob' }),
    },

    // --- REGISTRATIONS ---
    registration: {
        register: (eventId, studentId) => api.post(`/api/registrations/${eventId}`, null, { headers: { studentId } }),
        cancel: (eventId, studentId) => api.post(`/api/registrations/cancel/${eventId}`, null, { headers: { studentId } }),
        getParticipants: (eventId) => api.get(`/api/events/${eventId}/participants`),
    },

    // --- CODING CONTESTS ---
    contest: {
        create: (data) => api.post('/contest/insert', data),
        getAll: () => api.get('/contest/getAll'),
        getOrgContests: (orgId) => api.get(`/contest/getOrgContests/${orgId}`),
        getById: (id) => api.get(`/contest/getById/${id}`),
        update: (id, data) => api.put(`/contest/update/${id}`, data),
        delete: (id) => api.delete(`/contest/delete/${id}`),
    },

    // --- PROBLEMS (Coding) ---
    problem: {
        create: (data) => api.post('/problem/insert', data),
        getAll: () => api.get('/problem/getAll'),
        getOrgProblems: (orgId) => api.get(`/problem/getOrgProblems/${orgId}`),
        getById: (id) => api.get(`/problem/getById/${id}`),
        update: (id, data) => api.put(`/problem/update/${id}`, data),
        delete: (id) => api.delete(`/problem/delete/${id}`),
    },

    // --- SUBMISSIONS & LEADERBOARD ---
    submission: {
        run: (data) => api.post('/submission/run', data),
        submit: (data) => api.post('/submission', data),
        getAll: () => api.get('/submission'),
        getById: (id) => api.get(`/submission/${id}`),
        getByUser: (userId) => api.get(`/submission/userId/${userId}`),
        getByContest: (contestId) => api.get(`/submission/contestId/${contestId}`),
        getByProblem: (problemId) => api.get(`/submission/problemId/${problemId}`),
    },

    leaderboard: {
        get: (contestId) => api.get(`/leaderboard/${contestId}`),
    },
};

export default api;
