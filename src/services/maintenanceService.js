// src/services/maintenanceService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5153/api';

export const maintenanceService = {
  // Get all maintenance services with pagination and filters
  getAllServices: async (params = {}) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maintenance-services`,
        {
          params,
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get service by ID
  getServiceById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maintenance-services/${id}`,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching service detail:', error);
      throw error;
    }
  },

  // Get active services
  getActiveServices: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maintenance-services/active`,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  },

  // Get services by category
  getServicesByCategory: async (categoryId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maintenance-services/by-category/${categoryId}`,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  },

  // Smart search services
  searchServices: async (params = {}) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maintenance-services/search`,
        {
          params,
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  },

  // Format currency to VND
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  // Format time duration
  formatDuration: (minutes) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}phút` : `${hours}h`;
  }
};

export default maintenanceService;
