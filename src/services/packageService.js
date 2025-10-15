// src/services/packageService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5153/api';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const packageService = {
  // Get all maintenance packages
  getAllPackages: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maintenance-packages/active`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  },

  // Subscribe to a package
  subscribeToPackage: async (subscriptionData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/package-subscriptions`,
        subscriptionData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error subscribing to package:', error);
      throw error;
    }
  },

  // Get my subscriptions
  getMySubscriptions: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/package-subscriptions/my-subscriptions`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }
};

export default packageService;
