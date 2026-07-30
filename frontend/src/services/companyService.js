import api from './api';

export const companyService = {
    // Get full company profile
    getProfile: async () => {
        const response = await api.get('company/profile/');
        return response.data;
    },

    // Check completion status
    getCompletion: async () => {
        const response = await api.get('company/completion/');
        return response.data;
    },

    // Create new company profile
    createProfile: async (data) => {
        const response = await api.post('company/', data);
        return response.data;
    },

    // Update existing company profile
    updateProfile: async (id, data) => {
        const response = await api.put(`company/${id}/`, data);
        return response.data;
    },

    // Upload Logo
    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await api.post('company/logo/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Upload Banner
    uploadBanner: async (file) => {
        const formData = new FormData();
        formData.append('banner', file);
        const response = await api.post('company/banner/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Upload Document
    uploadDocument: async (docType, file) => {
        const formData = new FormData();
        formData.append('doc_type', docType);
        formData.append('file', file);
        const response = await api.post('company/documents/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Delete Document
    deleteDocument: async (id) => {
        const response = await api.delete(`company/documents/${id}/`);
        return response.data;
    },

    // Upload Gallery Image
    uploadGalleryImage: async (file, caption = '') => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('caption', caption);
        const response = await api.post('company/gallery/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Delete Gallery Image
    deleteGalleryImage: async (id) => {
        const response = await api.delete(`company/gallery/${id}/`);
        return response.data;
    }
};
