// src/services/vehicleMaintenanceService.js
import { vehicleMaintenanceAPI } from './api';

/**
 * Vehicle Maintenance Service
 * Quản lý bảo dưỡng xe theo Postman collection
 */
export const vehicleMaintenanceService = {
  /**
   * Lấy danh sách nhắc nhở bảo dưỡng
   * GET /api/vehiclemaintenance/reminders
   *
   * @returns Array of maintenance reminders
   */
  async getReminders() {
    try {
      const response = await vehicleMaintenanceAPI.getReminders();
      console.log('✅ Get maintenance reminders success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get maintenance reminders failed:', error);
      throw error;
    }
  },

  /**
   * Lấy trạng thái bảo dưỡng của tất cả xe
   * GET /api/vehiclemaintenance/my-vehicles/status
   *
   * @returns Maintenance status for all vehicles
   */
  async getMaintenanceStatus() {
    try {
      const response = await vehicleMaintenanceAPI.getMaintenanceStatus();
      console.log('✅ Get maintenance status success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get maintenance status failed:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử bảo dưỡng của một xe
   * GET /api/vehiclemaintenance/{vehicleId}/history
   *
   * @param {number} vehicleId - ID của xe
   * @param {number} page - Trang hiện tại (mặc định 1)
   * @param {number} pageSize - Số lượng items mỗi trang (mặc định 10)
   * @returns Vehicle maintenance history with pagination
   */
  async getVehicleHistory(vehicleId, page = 1, pageSize = 10) {
    try {
      const response = await vehicleMaintenanceAPI.getVehicleHistory(
        vehicleId,
        page,
        pageSize
      );
      console.log('✅ Get vehicle maintenance history success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get vehicle maintenance history failed:', error);
      throw error;
    }
  },
};

export default vehicleMaintenanceService;
