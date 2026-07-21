// frontend/src/services/api.js
import axios from 'axios';

// Read from .env — must be prefixed VITE_ for Vite to expose it to client code
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
    throw new Error('[api.js] VITE_API_BASE_URL is not set. Add it to frontend/.env');
}

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Intercept requests to add the Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept responses to handle token refresh on 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we get a 401 and haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    // Use a plain axios call to avoid interceptor loops
                    const res = await axios.post(`${API_BASE_URL}users/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = res.data.access;
                    localStorage.setItem('access_token', newAccessToken);

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token is also expired — force logout
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
        const response = await api.patch(`applications/${applicationId}/status/`, {
            status: newStatus
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
export const scheduleInterview = async (applicationId, scheduleData) => {
    try {
        const response = await api.post(`applications/${applicationId}/schedule/`, scheduleData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
/**
 * Uploads a resume file to the AI analysis endpoint.
 * @param {File} file - The resume file (PDF / DOCX / TXT)
 * @returns {Promise<Object>} AI analysis result
 */
export const analyzeResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('ai/analyze-resume/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export default api;