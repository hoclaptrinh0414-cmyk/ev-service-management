import apiService from './api';

/**
 * Axios-like wrapper for the unified API service
 * This allows services to use api.get(), api.post(), etc.
 */
const api = {
    async get(url, config = {}) {
        const { params, ...restConfig } = config;

        // Build query string from params
        let fullUrl = url;
        if (params) {
            const queryString = new URLSearchParams(
                Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
            ).toString();
            if (queryString) {
                fullUrl = `${url}?${queryString}`;
            }
        }

        const response = await apiService.request(fullUrl, {
            method: 'GET',
            ...restConfig,
        });

        return { data: response };
    },

    async post(url, data, config = {}) {
        const response = await apiService.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
            ...config,
        });

        return { data: response };
    },

    async put(url, data, config = {}) {
        const response = await apiService.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...config,
        });

        return { data: response };
    },

    async delete(url, config = {}) {
        const response = await apiService.request(url, {
            method: 'DELETE',
            ...config,
        });

        return { data: response };
    },

    async patch(url, data, config = {}) {
        const response = await apiService.request(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
            ...config,
        });

        return { data: response };
    },
};

export default api;
