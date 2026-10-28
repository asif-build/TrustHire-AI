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

// Response interceptor: graceful 401 recovery on public endpoints
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            // Public endpoints that should still render for unauthenticated / expired sessions
            const isPublicEndpoint = 
                originalRequest.url?.includes('/api/companies') ||
                originalRequest.url?.includes('/api/career/learning/hub') ||
                originalRequest.url?.includes('/api/career/learning/resources') ||
                originalRequest.url?.includes('/api/career/learning/paths') ||
                originalRequest.url?.includes('/api/jobs');

            if (isPublicEndpoint) {
                delete originalRequest.headers.Authorization;
                return apiClient(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

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

export const careerApi = {
    getOverview: () => apiClient.get('/api/career/overview'),
    getAIStatus: () => apiClient.get('/api/career/ai-status'),
    getProfile: () => apiClient.get('/api/career/profile'),
    updateProfile: (data) => apiClient.put('/api/career/profile', data),
    confirmProfile: (data) => apiClient.post('/api/career/profile/confirm-extraction', data),
    listResumes: () => apiClient.get('/api/career/resumes'),
    uploadResume: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/api/career/resumes/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteResume: (id) => apiClient.delete(`/api/career/resumes/${id}`),
    reanalyseResume: (id) => apiClient.post(`/api/career/resumes/${id}/reanalyse`),
    replaceResume: (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post(`/api/career/resumes/${id}/replace`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    downloadResumeUrl: (id) => `${API_URL}/api/career/resumes/${id}/download`,
    getRecommendedCompanies: () => apiClient.get('/api/career/companies/recommended'),
    improveResume: (data = {}) => apiClient.post('/api/career/studio/improve-resume', data),
    getHealth: () => apiClient.get('/api/career/health'),
    listJobs: (params = {}) => apiClient.get('/api/career/jobs', { params }),
    getJob: (id) => apiClient.get(`/api/career/jobs/${id}`),
    syncJobs: () => apiClient.post('/api/career/jobs/sync'),
    listMatches: () => apiClient.get('/api/career/matches'),
    evaluateMatch: (jobId) => apiClient.post('/api/career/matches/evaluate', { job_id: jobId }),
    listDocuments: () => apiClient.get('/api/career/studio/documents'),
    generateResume: (jobId) => apiClient.post('/api/career/studio/generate-resume', { job_id: jobId }),
    generateCoverLetter: (jobId) => apiClient.post('/api/career/studio/generate-cover-letter', { job_id: jobId }),
    updateDocument: (id, data) => apiClient.put(`/api/career/studio/documents/${id}`, data),
    deleteDocument: (id) => apiClient.delete(`/api/career/studio/documents/${id}`),
    listInterviewSessions: () => apiClient.get('/api/career/interview/sessions'),
    generateInterviewPrep: (jobId) => apiClient.post('/api/career/interview/generate', { job_id: jobId }),
    submitInterviewAnswer: (sessionId, questionId, answer) =>
        apiClient.post(`/api/career/interview/sessions/${sessionId}/submit-answer`, { question_id: questionId, answer }),
    listApplications: () => apiClient.get('/api/career/tracker/applications'),
    createApplication: (data) => apiClient.post('/api/career/tracker/applications', data),
    updateApplication: (id, data) => apiClient.put(`/api/career/tracker/applications/${id}`, data),
    deleteApplication: (id) => apiClient.delete(`/api/career/tracker/applications/${id}`),

    // Company Intelligence & Individualised Career Roadmaps
    toggleSaveJob: (id) => apiClient.post(`/api/career/jobs/${id}/save`),
    listRoadmaps: () => apiClient.get('/api/career/roadmaps'),
    getRoadmap: (id) => apiClient.get(`/api/career/roadmaps/${id}`),
    generateRoadmap: (data) => apiClient.post('/api/career/roadmaps/generate', data),
    deleteRoadmap: (id) => apiClient.delete(`/api/career/roadmaps/${id}`),
    updateTaskProgress: (taskId, data) => apiClient.patch(`/api/career/roadmaps/tasks/${taskId}/progress`, data),
    listSavedJobs: () => apiClient.get('/api/career/saved-jobs'),
    listSavedCompanies: () => apiClient.get('/api/career/saved-companies'),
    getMySkills: () => apiClient.get('/api/career/my-skills'),

    // Competence Assessments, Project Submissions & Apply Tracking
    listAssessments: (params = {}) => apiClient.get('/api/career/assessments', { params }),
    getAssessment: (slug) => apiClient.get(`/api/career/assessments/${slug}`),
    submitAssessment: (slug, answers) => apiClient.post(`/api/career/assessments/${slug}/submit`, { answers }),
    listProjectSubmissions: () => apiClient.get('/api/career/projects/submissions'),
    submitProject: (data) => apiClient.post('/api/career/projects/submissions', data),
    applyJobClick: (jobId, data = {}) => apiClient.post(`/api/career/jobs/${jobId}/apply-click`, data),
};

export const learningApi = {
    getHub: () => apiClient.get('/api/career/learning/hub'),
    listResources: (params = {}) => apiClient.get('/api/career/learning/resources', { params }),
    getResource: (id) => apiClient.get(`/api/career/learning/resources/${id}`),
    updateProgress: (data) => apiClient.post('/api/career/learning/progress', data),
    toggleSave: (id) => apiClient.post(`/api/career/learning/resources/${id}/save`),
    logClick: (id) => apiClient.post(`/api/career/learning/resources/${id}/click`),
    listPaths: () => apiClient.get('/api/career/learning/paths'),
    getPath: (slug) => apiClient.get(`/api/career/learning/paths/${slug}`),
    adminIngest: (data) => apiClient.post('/api/career/learning/admin/resources', data),
    adminVerify: (id) => apiClient.post(`/api/career/learning/admin/resources/${id}/verify`),
};

export const companiesApi = {
    list: (params = {}) => apiClient.get('/api/companies/', { params }),
    get: (slug) => apiClient.get(`/api/companies/${slug}`),
    getJobs: (slug) => apiClient.get(`/api/companies/${slug}/jobs`),
    toggleSave: (slug) => apiClient.post(`/api/companies/${slug}/save`),
};

export default apiClient;
