// src/services/maintenanceService.js
import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://unprepared-kade-nonpossibly.ngrok-free.dev/api';

export const maintenanceService = {
  // ===== Helpers =====
  buildAuthHeaders: () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

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

  // ===== Vehicle Maintenance (Customer) =====

  // Tổng quan trạng thái bảo dưỡng cho tất cả xe của user
  getMyVehiclesMaintenanceStatus: async () => {
    const authHeader = maintenanceService.buildAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/VehicleMaintenance/my-vehicles/status`,
      { headers: { 'ngrok-skip-browser-warning': 'true', ...authHeader } }
    );
    return response.data;
  },

  // Danh sách nhắc nhở (NeedAttention, Urgent) + summary
  getMaintenanceReminders: async () => {
    const authHeader = maintenanceService.buildAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/VehicleMaintenance/reminders`,
      { headers: { 'ngrok-skip-browser-warning': 'true', ...authHeader } }
    );
    return response.data;
  },

  // Trạng thái chi tiết 1 xe
  getVehicleMaintenanceStatus: async (vehicleId) => {
    if (!vehicleId) throw new Error('vehicleId is required to fetch maintenance status');
    const authHeader = maintenanceService.buildAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/VehicleMaintenance/${vehicleId}/status`,
      { headers: { 'ngrok-skip-browser-warning': 'true', ...authHeader } }
    );
    return response.data;
  },

  // Get maintenance history for a vehicle (customer)
  getVehicleMaintenanceHistory: async (vehicleId) => {
    if (!vehicleId) {
      throw new Error('vehicleId is required to fetch maintenance history');
    }
    const authHeader = maintenanceService.buildAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/VehicleMaintenance/${vehicleId}/history`,
      { headers: { 'ngrok-skip-browser-warning': 'true', ...authHeader } }
    );
    return response.data;
  },

  // Cập nhật odo hiện tại để dự báo chính xác hơn
  updateVehicleMileage: async (vehicleId, { currentMileage, notes }) => {
    if (!vehicleId) throw new Error('vehicleId is required to update mileage');
    const authHeader = maintenanceService.buildAuthHeaders();
    const payload = {
      currentMileage,
      notes
    };
    const response = await axios.put(
      `${API_BASE_URL}/VehicleMaintenance/${vehicleId}/mileage`,
      payload,
      { headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...authHeader } }
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
