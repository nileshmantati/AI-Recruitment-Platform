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
 * Downloads standard RFC 5545 .ics calendar invitation for an interview.
 */
export const downloadCalendarInvite = async (applicationId) => {
    try {
        const response = await api.get(`applications/${applicationId}/calendar-invite/`, {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `interview-${applicationId}.ics`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
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

/**
 * Generate 4 tailored mock interview questions for a specific role and format.
 */
export const generateMockQuestions = async (role, experienceLevel = 'Mid-Level', interviewType = 'technical') => {
    const response = await api.post('ai/mock-interview/generate-questions/', {
        role,
        experience_level: experienceLevel,
        interview_type: interviewType,
    });
    return response.data;
};

/**
 * Evaluates candidate answer to an interview question using Gemini AI.
 */
export const evaluateMockAnswer = async (question, answer, role) => {
    const response = await api.post('ai/mock-interview/evaluate-answer/', {
        question,
        answer,
        role,
    });
    return response.data;
};

/**
 * Requests a 6-digit password reset OTP sent to the user's email.
 */
export const requestPasswordResetOTP = async (usernameOrEmail) => {
    const response = await api.post('users/forgot-password/', {
        username_or_email: usernameOrEmail,
    });
    return response.data;
};

/**
 * Verifies the 6-digit password reset OTP.
 */
export const verifyPasswordResetOTP = async (usernameOrEmail, otp) => {
    const response = await api.post('users/verify-reset-otp/', {
        username_or_email: usernameOrEmail,
        otp,
    });
    return response.data;
};

/**
 * Resets user password using verified OTP.
 */
export const resetPassword = async (usernameOrEmail, otp, newPassword) => {
    const response = await api.post('users/reset-password/', {
        username_or_email: usernameOrEmail,
        otp,
        new_password: newPassword,
    });
    return response.data;
};

/**
 * Verifies email address using the 6-digit OTP code.
 */
export const verifyEmailOTP = async (emailOrUsername, otp) => {
    const response = await api.post('users/verify-email/', {
        email_or_username: emailOrUsername,
        otp,
    });
    return response.data;
};

/**
 * Resends a new 6-digit email verification OTP code.
 */
export const resendVerificationOTP = async (emailOrUsername) => {
    const response = await api.post('users/resend-otp/', {
        email_or_username: emailOrUsername,
    });
    return response.data;
};

export default api;