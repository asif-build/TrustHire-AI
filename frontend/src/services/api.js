import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(async (config) => {
    let token = null;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            token = session.access_token;
        }
    } catch (e) {
        // Supabase not configured or failed
    }

    // Fallback to local mock session for local development
    if (!token) {
        const mockSessionJson = localStorage.getItem('mock_session');
        if (mockSessionJson) {
            try {
                const mockSession = JSON.parse(mockSessionJson);
                if (mockSession?.access_token) {
                    token = mockSession.access_token;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const jobsApi = {
    list: () => apiClient.get('/api/jobs/'),
    create: (data) => apiClient.post('/api/jobs/create', data),
    get: (id) => apiClient.get(`/api/jobs/${id}`),
};

export const resumesApi = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        return apiClient.post('/api/resumes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    status: () => apiClient.get('/api/resumes/status'),
};

export const matchingApi = {
    matches: (jobId, filters = {}) => {
        const params = new URLSearchParams();
        if (filters.min_experience) params.append('min_experience', filters.min_experience);
        if (filters.max_notice) params.append('max_notice', filters.max_notice);
        if (filters.min_score) params.append('min_score', filters.min_score);
        if (filters.location) params.append('location', filters.location);
        if (filters.skills) params.append('skills', filters.skills);
        
        return apiClient.get(`/api/matching/jobs/${jobId}/matches?${params.toString()}`);
    },
    shortlist: (rankingId) => apiClient.post(`/api/matching/rankings/${rankingId}/shortlist`),
    details: (rankingId) => apiClient.get(`/api/matching/rankings/${rankingId}/details`),
};

export const usersApi = {
    getProfile: () => apiClient.get('/api/users/profile'),
    updateProfile: (data) => apiClient.put('/api/users/profile', data),
};

export default apiClient;
