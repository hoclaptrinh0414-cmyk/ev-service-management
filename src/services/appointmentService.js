// src/services/appointmentService.js
import apiService, { appointmentsAPI, lookupAPI } from './api';

/**
 * Appointment Service
 * Cung cáº¥p cÃ¡c phÆ°Æ¡ng thá»©c quáº£n lÃ½ lá»‹ch háº¹n báº£o dÆ°á»¡ng theo tÃ i liá»‡u CUSTOMER_API_ENDPOINTS.md
 */
export const appointmentService = {
  // ============ VEHICLE HELPERS FOR BOOKING FLOW ============
  /**
   * Láº¥y danh sÃ¡ch xe cá»§a khÃ¡ch (dÃ¹ng á»Ÿ bÆ°á»›c chá»n xe)
   * GET /api/customer/profile/my-vehicles
   */
  
  async getMyVehicles() {
    try {
      const response = await apiService.getMyVehicles();
      console.log('Get my vehicles success:', response);
      return response;
    } catch (error) {
      console.error('Get my vehicles failed:', error);
      throw error;
    }
  },
/**
   * Admin: Xoa xe khach hang
   * DELETE /api/customer-vehicles/{id}
   */
  async deleteCustomerVehicleAdmin(vehicleId) {
    try {
      const response = await apiService.deleteCustomerVehicleAdmin(vehicleId);
      console.log('Delete customer vehicle (admin) success:', response);
      return response;
    } catch (error) {
      console.error('Delete customer vehicle (admin) failed:', error);
      throw error;
    }
  },

  /**
   * Customer: Xoa xe cua toi
   * DELETE /api/customer/profile/my-vehicles/{vehicleId}
   */
  async deleteVehicle(vehicleId) {
    try {
      const response = await apiService.deleteVehicle(vehicleId);
      console.log('Delete my vehicle success:', response);
      return response;
    } catch (error) {
      console.error('Delete my vehicle failed:', error);
      throw error;
    }
  },


  // ============ 4. APPOINTMENTS - Äáº¶T Lá»ŠCH Báº¢O DÆ¯á» NG ============

  /**
   * 4.1. Táº¡o lá»‹ch háº¹n má»›i
   * POST /api/appointments
   */
  async createAppointment(appointmentData) {
    try {
      const response = await appointmentsAPI.createAppointment({
        customerId: appointmentData.customerId,
        vehicleId: appointmentData.vehicleId,
        serviceCenterId: appointmentData.serviceCenterId,
        slotId: appointmentData.slotId,
        serviceIds: appointmentData.serviceIds,
        packageId: appointmentData.packageId || null,
        customerNotes: appointmentData.customerNotes || '',
        preferredTechnicianId: appointmentData.preferredTechnicianId || null,
        priority: appointmentData.priority || 'Normal',
        source: appointmentData.source || 'Online'
      });
      console.log('âœ… Create appointment success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Create appointment failed:', error);
      throw error;
    }
  },

  /**
   * 4.2. Xem táº¥t cáº£ lá»‹ch háº¹n cá»§a tÃ´i
   * GET /api/appointments/my-appointments
   */
  async getMyAppointments(params = {}) {
    try {
      const response = await appointmentsAPI.getMyAppointments(params);
      console.log('âœ… Get my appointments success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get my appointments failed:', error);
      throw error;
    }
  },

  /**
   * 4.3. Xem lá»‹ch háº¹n sáº¯p tá»›i
   * GET /api/appointments/my-appointments/upcoming
   */
  async getUpcomingAppointments(limit = 5) {
    try {
      const response = await appointmentsAPI.getUpcomingAppointments(limit);
      console.log('âœ… Get upcoming appointments success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get upcoming appointments failed:', error);
      throw error;
    }
  },

  /**
   * 4.4. Xem chi tiáº¿t lá»‹ch háº¹n
   * GET /api/appointments/{id}
   */
  async getAppointmentById(appointmentId) {
    try {
      const response = await appointmentsAPI.getAppointmentDetail(appointmentId);
      console.log('âœ… Get appointment detail success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get appointment detail failed:', error);
      throw error;
    }
  },

  /**
   * 4.5. TÃ¬m lá»‹ch háº¹n theo mÃ£
   * GET /api/appointments/by-code/{code}
   */
  async getAppointmentByCode(code) {
    try {
      const response = await appointmentsAPI.getAppointmentByCode(code);
      console.log('âœ… Get appointment by code success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get appointment by code failed:', error);
      throw error;
    }
  },

  /**
   * 4.6. Cáº­p nháº­t lá»‹ch háº¹n
   * PUT /api/appointments/{id}
   */
  async updateAppointment(appointmentId, updateData) {
    try {
      const response = await appointmentsAPI.updateAppointment(appointmentId, {
        vehicleId: updateData.vehicleId,
        slotId: updateData.slotId,
        serviceIds: updateData.serviceIds,
        customerNotes: updateData.customerNotes,
        priority: updateData.priority
      });
      console.log('âœ… Update appointment success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Update appointment failed:', error);
      throw error;
    }
  },

  /**
   * 4.7. Dá»i lá»‹ch háº¹n
   * POST /api/appointments/{id}/reschedule
   */
  async rescheduleAppointment(appointmentId, newSlotId, reason) {
    try {
      const response = await appointmentsAPI.rescheduleAppointment(appointmentId, newSlotId, reason);
      console.log('âœ… Reschedule appointment success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Reschedule appointment failed:', error);
      throw error;
    }
  },

  /**
   * 4.8. Há»§y lá»‹ch háº¹n
   * POST /api/appointments/{id}/cancel
   */
  async cancelAppointment(appointmentId, reason) {
    try {
      const response = await appointmentsAPI.cancelAppointment(appointmentId, reason);
      console.log('âœ… Cancel appointment success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Cancel appointment failed:', error);
      throw error;
    }
  },

  /**
   * 4.9. XÃ³a lá»‹ch háº¹n (chá»‰ khi Pending)
   * DELETE /api/appointments/{id}
   */
  async deleteAppointment(appointmentId) {
    try {
      const response = await appointmentsAPI.deleteAppointment(appointmentId);
      console.log('âœ… Delete appointment success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Delete appointment failed:', error);
      throw error;
    }
  },

  // ============ HELPER METHODS FOR BOOKING FLOW ============

  /**
   * Láº¥y danh sÃ¡ch trung tÃ¢m dá»‹ch vá»¥
   * GET /api/lookup/service-centers
   */
  async getServiceCenters() {
    try {
      const response = await lookupAPI.getServiceCenters();
      console.log('âœ… Get service centers success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get service centers failed:', error);
      throw error;
    }
  },



  /**

   * Lay trung tam dang hoat dong (loc tai FE)

   */

  async getActiveServiceCenters() {
    try {
      const response = await lookupAPI.getActiveServiceCenters();
      if (response?.data) {
        return response;
      }

      const centers = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      if (centers.length === 0) {
        const allCenters = await lookupAPI.getServiceCenters();
        const list = Array.isArray(allCenters?.data) ? allCenters.data : allCenters;
        return {
          ...allCenters,
          data: list,
        };
      }

      return {
        ...response,
        data: centers,
      };
    } catch (error) {
      console.error('Get active service centers failed:', error);
      try {
        const fallback = await lookupAPI.getServiceCenters();
        return fallback;
      } catch {
        throw error;
      }
    }
  },

  /**
   * Lay trung tam con slot trong theo ngay (BE: GET /api/service-centers/available?date=YYYY-MM-DD)
   */
  async getAvailableCenters(date) {
    try {
      const response = await apiService.getAvailableServiceCenters(date);
      if (response?.data) return response;

      const list = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      return {
        ...response,
        data: list,
      };
    } catch (error) {
      console.error('Get available centers failed:', error);
      throw error;
    }
  },



  /**
   * Láº¥y danh sÃ¡ch dá»‹ch vá»¥ báº£o dÆ°á»¡ng
   * GET /api/lookup/maintenance-services
   */
  async getActiveServices() {
    try {
      const response = await lookupAPI.getMaintenanceServices();
      console.log('âœ… Get maintenance services success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get maintenance services failed:', error);
      throw error;
    }
  },

  /**
   * Láº¥y khung giá» trá»‘ng
   * GET /api/lookup/time-slots/available
   */
  /**
   * L???y khung gi??? tr??`ng
   * GET /api/lookup/time-slots/available
   */
  async getAvailableSlots(serviceCenterId, date) {
    try {
      const response = await lookupAPI.getAvailableTimeSlots(serviceCenterId, date);
      console.log('?o. Get available time slots success:', response);
      return response;
    } catch (error) {
      console.error('??O Get available time slots failed:', error);
      throw error;
    }
  },

  /**
   * Active package subscriptions for a vehicle
   * GET /api/package-subscriptions/active-by-vehicle/{vehicleId}
   */
  async getActiveSubscriptionsByVehicle(vehicleId) {
    try {
      const response = await apiService.getActiveSubscriptionsByVehicle(vehicleId);
      console.log('Get active subscriptions by vehicle success:', response);
      return response;
    } catch (error) {
      console.error('Get active subscriptions by vehicle failed:', error);
      throw error;
    }
  }
};


export default appointmentService;



