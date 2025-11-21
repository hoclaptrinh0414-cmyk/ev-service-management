import api from './api';

/**
 * User Management Service
 * Admin - Users endpoints
 */

// Get all users with pagination and filters
export const getUsers = async (params = {}) => {
    try {
        const response = await api.get('/api/users', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Get user by ID
export const getUserById = async (id) => {
    try {
        const response = await api.get(`/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        throw error;
    }
};

// Update user
export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/api/users/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        throw error;
    }
};

// Delete user
export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        throw error;
    }
};

const userService = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};

export default userService;
