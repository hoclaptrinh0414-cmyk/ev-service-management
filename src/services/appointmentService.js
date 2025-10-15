// src/services/appointmentService.js
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

export const appointmentService = {
  // Get customer's vehicles
  getMyVehicles: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-vehicles/my-vehicles`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  // Get all service centers
  getServiceCenters: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/service-centers`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching service centers:', error);
      throw error;
    }
  },

  // Get active maintenance services
  getActiveServices: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maintenance-services/active`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get available time slots
  getAvailableSlots: async (centerId, date) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/time-slots/available`,
        {
          params: { centerId, date }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments`,
        appointmentData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Get my appointments
  getMyAppointments: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/my-appointments`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (limit = 5) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/my-appointments/upcoming`,
        {
          ...getAuthHeaders(),
          params: { limit }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
        { appointmentId, cancellationReason: reason },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }
};

export default appointmentService;
