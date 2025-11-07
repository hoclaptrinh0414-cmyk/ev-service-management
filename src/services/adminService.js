// src/services/adminService.js
import apiService from './api';

/**
 * Admin Service
 * Provides admin-specific API calls for user management, etc.
 */
export const adminService = {
  
  // ============ USER MANAGEMENT ============
  
  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  async getAllUsers() {
    try {
      const response = await apiService.request('/users', {
        method: 'GET',
        auth: true
      });
      
      console.log('✅ Get all users success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get all users failed:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * GET /api/users/{id}
   * @param {number} userId - User ID
   */
  async getUserById(userId) {
    try {
      const response = await apiService.request(`/users/${userId}`, {
        method: 'GET',
        auth: true
      });
      
      console.log('✅ Get user by ID success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get user by ID failed:', error);
      throw error;
    }
  },

  /**
   * Create new user
   * POST /api/users
   * @param {Object} userData - User data
   */
  async createUser(userData) {
    try {
      const response = await apiService.request('/users', {
        method: 'POST',
        body: userData,
        auth: true
      });
      
      console.log('✅ Create user success:', response);
      return response;
    } catch (error) {
      console.error('❌ Create user failed:', error);
      throw error;
    }
  },

  /**
   * Update user
   * PUT /api/users/{id}
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiService.request(`/users/${userId}`, {
        method: 'PUT',
        body: userData,
        auth: true
      });
      
      console.log('✅ Update user success:', response);
      return response;
    } catch (error) {
      console.error('❌ Update user failed:', error);
      throw error;
    }
  },

  /**
   * Delete user (soft delete)
   * DELETE /api/users/{id}
   * @param {number} userId - User ID to delete
   */
  async deleteUser(userId) {
    try {
      const response = await apiService.request(`/users/${userId}`, {
        method: 'DELETE',
        auth: true
      });
      
      console.log('✅ Delete user success:', response);
      return response;
    } catch (error) {
      console.error('❌ Delete user failed:', error);
      throw error;
    }
  },

  /**
   * Restore deleted user
   * POST /api/users/{id}/restore
   * @param {number} userId - User ID to restore
   */
  async restoreUser(userId) {
    try {
      const response = await apiService.request(`/users/${userId}/restore`, {
        method: 'POST',
        auth: true
      });
      
      console.log('✅ Restore user success:', response);
      return response;
    } catch (error) {
      console.error('❌ Restore user failed:', error);
      throw error;
    }
  },

  /**
   * Lock user account
   * POST /api/users/{id}/lock
   * @param {number} userId - User ID to lock
   */
  async lockUser(userId) {
    try {
      const response = await apiService.request(`/users/${userId}/lock`, {
        method: 'POST',
        auth: true
      });
      
      console.log('✅ Lock user success:', response);
      return response;
    } catch (error) {
      console.error('❌ Lock user failed:', error);
      throw error;
    }
  },

  /**
   * Unlock user account
   * POST /api/users/{id}/unlock
   * @param {number} userId - User ID to unlock
   */
  async unlockUser(userId) {
    try {
      const response = await apiService.request(`/users/${userId}/unlock`, {
        method: 'POST',
        auth: true
      });
      
      console.log('✅ Unlock user success:', response);
      return response;
    } catch (error) {
      console.error('❌ Unlock user failed:', error);
      throw error;
    }
  },

  // ============ CUSTOMER MANAGEMENT ============

  /**
   * Get all customers
   * GET /api/customers
   */
  async getAllCustomers() {
    try {
      const response = await apiService.request('/customers', {
        method: 'GET',
        auth: true
      });
      
      console.log('✅ Get all customers success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get all customers failed:', error);
      throw error;
    }
  },

  /**
   * Get customer by ID
   * GET /api/customers/{id}
   * @param {number} customerId - Customer ID
   */
  async getCustomerById(customerId) {
    try {
      const response = await apiService.request(`/customers/${customerId}`, {
        method: 'GET',
        auth: true
      });
      
      console.log('✅ Get customer by ID success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get customer by ID failed:', error);
      throw error;
    }
  },

  /**
   * Delete customer
   * DELETE /api/customers/{id}
   * @param {number} customerId - Customer ID to delete
   */
  async deleteCustomer(customerId) {
    try {
      const response = await apiService.request(`/customers/${customerId}`, {
        method: 'DELETE',
        auth: true
      });
      
      console.log('✅ Delete customer success:', response);
      return response;
    } catch (error) {
      console.error('❌ Delete customer failed:', error);
      throw error;
    }
  },

};

export default adminService;
