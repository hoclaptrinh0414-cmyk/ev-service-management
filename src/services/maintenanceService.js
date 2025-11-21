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

  // Get active pricing for a service by vehicle model
  getModelServicePricing: async ({ modelId, serviceId, forDate }) => {
    if (!modelId || !serviceId) {
      throw new Error('modelId and serviceId are required to fetch pricing');
    }
    const params = {
      modelId,
      serviceId,
      forDate: forDate || new Date().toISOString().split('T')[0],
    };
    const response = await axios.get(
      `${API_BASE_URL}/model-service-pricings/active`,
      {
        params,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      }
    );
    return response.data;
  },

  // Get maintenance history for a vehicle (customer)
  getVehicleMaintenanceHistory: async (vehicleId) => {
    if (!vehicleId) {
      throw new Error('vehicleId is required to fetch maintenance history');
    }
    const token = localStorage.getItem('accessToken');
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(
      `${API_BASE_URL}/VehicleMaintenance/${vehicleId}/history`,
      { headers: { 'ngrok-skip-browser-warning': 'true', ...authHeader } }
    );
    return response.data;
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
