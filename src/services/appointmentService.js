// src/services/appointmentService.js
import apiService, { appointmentsAPI, lookupAPI } from './api';

/**
 * Appointment Service
 * Cung cấp các phương thức quản lý lịch hẹn bảo dưỡng theo tài liệu CUSTOMER_API_ENDPOINTS.md
 */
export const appointmentService = {
  // ============ VEHICLE HELPERS FOR BOOKING FLOW ============
  /**
   * Lấy danh sách xe của khách (dùng ở bước chọn xe)
   * GET /api/customer/profile/my-vehicles
   */
  async getMyVehicles() {
    try {
      const response = await apiService.getMyVehicles();
      console.log('🛠️ Get my vehicles success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my vehicles failed:', error);
      throw error;
    }
  },

  // ============ 4. APPOINTMENTS - ĐẶT LỊCH BẢO DƯỠNG ============

  /**
   * 4.1. Tạo lịch hẹn mới
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
      console.log('✅ Create appointment success:', response);
      return response;
    } catch (error) {
      console.error('❌ Create appointment failed:', error);
      throw error;
    }
  },

  /**
   * 4.2. Xem tất cả lịch hẹn của tôi
   * GET /api/appointments/my-appointments
   */
  async getMyAppointments(params = {}) {
    try {
      const response = await appointmentsAPI.getMyAppointments(params);
      console.log('✅ Get my appointments success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my appointments failed:', error);
      throw error;
    }
  },

  /**
   * 4.3. Xem lịch hẹn sắp tới
   * GET /api/appointments/my-appointments/upcoming
   */
  async getUpcomingAppointments(limit = 5) {
    try {
      const response = await appointmentsAPI.getUpcomingAppointments(limit);
      console.log('✅ Get upcoming appointments success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get upcoming appointments failed:', error);
      throw error;
    }
  },

  /**
   * 4.4. Xem chi tiết lịch hẹn
   * GET /api/appointments/{id}
   */
  async getAppointmentById(appointmentId) {
    try {
      const response = await appointmentsAPI.getAppointmentDetail(appointmentId);
      console.log('✅ Get appointment detail success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get appointment detail failed:', error);
      throw error;
    }
  },

  /**
   * 4.5. Tìm lịch hẹn theo mã
   * GET /api/appointments/by-code/{code}
   */
  async getAppointmentByCode(code) {
    try {
      const response = await appointmentsAPI.getAppointmentByCode(code);
      console.log('✅ Get appointment by code success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get appointment by code failed:', error);
      throw error;
    }
  },

  /**
   * 4.6. Cập nhật lịch hẹn
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
      console.log('✅ Update appointment success:', response);
      return response;
    } catch (error) {
      console.error('❌ Update appointment failed:', error);
      throw error;
    }
  },

  /**
   * 4.7. Dời lịch hẹn
   * POST /api/appointments/{id}/reschedule
   */
  async rescheduleAppointment(appointmentId, newSlotId, reason) {
    try {
      const response = await appointmentsAPI.rescheduleAppointment(appointmentId, newSlotId, reason);
      console.log('✅ Reschedule appointment success:', response);
      return response;
    } catch (error) {
      console.error('❌ Reschedule appointment failed:', error);
      throw error;
    }
  },

  /**
   * 4.8. Hủy lịch hẹn
   * POST /api/appointments/{id}/cancel
   */
  async cancelAppointment(appointmentId, reason) {
    try {
      const response = await appointmentsAPI.cancelAppointment(appointmentId, reason);
      console.log('✅ Cancel appointment success:', response);
      return response;
    } catch (error) {
      console.error('❌ Cancel appointment failed:', error);
      throw error;
    }
  },

  /**
   * 4.9. Xóa lịch hẹn (chỉ khi Pending)
   * DELETE /api/appointments/{id}
   */
  async deleteAppointment(appointmentId) {
    try {
      const response = await appointmentsAPI.deleteAppointment(appointmentId);
      console.log('✅ Delete appointment success:', response);
      return response;
    } catch (error) {
      console.error('❌ Delete appointment failed:', error);
      throw error;
    }
  },

  // ============ HELPER METHODS FOR BOOKING FLOW ============

  /**
   * Lấy danh sách trung tâm dịch vụ
   * GET /api/lookup/service-centers
   */
  async getServiceCenters() {
    try {
      const response = await lookupAPI.getServiceCenters();
      console.log('✅ Get service centers success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get service centers failed:', error);
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
   * Lấy danh sách dịch vụ bảo dưỡng
   * GET /api/lookup/maintenance-services
   */
  async getActiveServices() {
    try {
      const response = await lookupAPI.getMaintenanceServices();
      console.log('✅ Get maintenance services success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get maintenance services failed:', error);
      throw error;
    }
  },

  /**
   * Lấy khung giờ trống
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

