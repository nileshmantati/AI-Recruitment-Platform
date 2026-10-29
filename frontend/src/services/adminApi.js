// frontend/src/services/adminApi.js
import api from './api';

/**
 * Admin REST API Service
 * Encapsulates secure endpoints provided by backend Phase 3 under /api/admin/
 */

// 1. Dashboard Overview
export const getDashboardStats = async () => {
    const response = await api.get('admin/dashboard/stats/');
    return response.data;
};

// 2. User Management
export const getAdminUsers = async (params = {}) => {
    const cleanParams = {};
    if (params.page) cleanParams.page = params.page;
    if (params.role) cleanParams.role = params.role;
    if (params.is_active !== undefined && params.is_active !== '') {
        cleanParams.is_active = params.is_active;
    }
    if (params.is_email_verified !== undefined && params.is_email_verified !== '') {
        cleanParams.is_email_verified = params.is_email_verified;
    }
    if (params.search) cleanParams.search = params.search;

    const response = await api.get('admin/users/', { params: cleanParams });
    return response.data;
};

export const getAdminUserDetails = async (userId) => {
    const response = await api.get(`admin/users/${userId}/`);
    return response.data;
};

export const updateAdminUserStatus = async (userId, isActive, reason = '') => {
    const response = await api.patch(`admin/users/${userId}/status/`, {
        is_active: isActive,
        reason: reason.trim(),
    });
    return response.data;
};

// 3. Job Moderation
export const getAdminJobs = async (params = {}) => {
    const cleanParams = {};
    if (params.page) cleanParams.page = params.page;
    if (params.is_active !== undefined && params.is_active !== '') {
        cleanParams.is_active = params.is_active;
    }
    if (params.search) cleanParams.search = params.search;

    const response = await api.get('admin/jobs/', { params: cleanParams });
    return response.data;
};

export const getAdminJobDetails = async (jobId) => {
    const response = await api.get(`admin/jobs/${jobId}/`);
    return response.data;
};

export const moderateAdminJob = async (jobId, isActive, reason = '') => {
    const response = await api.patch(`admin/jobs/${jobId}/moderation/`, {
        is_active: isActive,
        reason: reason.trim(),
    });
    return response.data;
};

// 4. Application Analytics
export const getAdminAnalytics = async (params = {}) => {
    const cleanParams = {};
    if (params.start_date) cleanParams.start_date = params.start_date;
    if (params.end_date) cleanParams.end_date = params.end_date;

    const response = await api.get('admin/analytics/', { params: cleanParams });
    return response.data;
};

// 5. Audit Logs (for recent dashboard feed)
export const getAdminAuditLogs = async (params = {}) => {
    const cleanParams = {};
    if (params.page) cleanParams.page = params.page;
    if (params.page_size) cleanParams.page_size = params.page_size;
    if (params.action) cleanParams.action = params.action;
    if (params.target_type) cleanParams.target_type = params.target_type;
    if (params.actor) cleanParams.actor = params.actor;
    if (params.start_date) cleanParams.start_date = params.start_date;
    if (params.end_date) cleanParams.end_date = params.end_date;
    if (params.search) cleanParams.search = params.search;

    const response = await api.get('admin/audit-logs/', { params: cleanParams });
    return response.data;
};

// 6. Staff Admin Management (Super Admin Exclusive)
export const getStaffAdmins = async () => {
    const response = await api.get('admin/staff-admins/');
    return response.data;
};

export const getAssignablePermissions = async () => {
    const response = await api.get('admin/staff-admins/assignable-permissions/');
    return response.data;
};

export const provisionStaffAdmin = async (payload) => {
    const response = await api.post('admin/staff-admins/', payload);
    return response.data;
};

export const updateStaffAdminPermissions = async (userId, permissions) => {
    const response = await api.patch(`admin/staff-admins/${userId}/permissions/`, {
        permissions,
    });
    return response.data;
};

export const updateStaffAdminStatus = async (userId, isActive, reason = '') => {
    const response = await api.patch(`admin/staff-admins/${userId}/status/`, {
        is_active: isActive,
        reason: (reason || '').trim(),
    });
    return response.data;
};

export const promoteUserToStaff = async (userId, permissions) => {
    const response = await api.post(`admin/users/${userId}/promote-to-staff/`, {
        permissions,
    });
    return response.data;
};

export const demoteUserFromStaff = async (userId, role = 'CANDIDATE') => {
    const response = await api.post(`admin/users/${userId}/demote-from-staff/`, {
        role,
    });
    return response.data;
};
