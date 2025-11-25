// src/services/vehicleService.js
import apiService, { vehicleAPI, lookupAPI } from './api';

/**
 * Vehicle Service
 * Quản lý các thao tác xe của khách hàng
 */
export const vehicleService = {
  // ============ 3. MY VEHICLES - XE CỦA TÔI ============

  /**
   * 3.1. Xem danh sách xe của tôi
   * GET /api/customer/profile/my-vehicles
   */
  async getMyVehicles() {
    try {
      const response = await vehicleAPI.getMyVehicles();
      console.log('Get my vehicles success:', response);
      return response;
    } catch (error) {
      console.error('Get my vehicles failed:', error);
      throw error;
    }
  },

  /**
   * 3.2. Đăng ký xe mới
   * POST /api/customer/profile/my-vehicles
   */
  async registerVehicle(vehicleData) {
    try {
      const response = await vehicleAPI.addVehicle({
        modelId: vehicleData.modelId,
        licensePlate: vehicleData.licensePlate,
        vin: vehicleData.vin || '',
        color: vehicleData.color || '',
        purchaseDate: vehicleData.purchaseDate || '',
        mileage: vehicleData.mileage || 0,
        insuranceNumber: vehicleData.insuranceNumber || '',
        insuranceExpiry: vehicleData.insuranceExpiry || '',
        registrationExpiry: vehicleData.registrationExpiry || ''
      });
      console.log('Register vehicle success:', response);
      return response;
    } catch (error) {
      console.error('Register vehicle failed:', error);
      throw error;
    }
  },

  /**
   * 3.3. Xem chi tiết 1 xe
   * GET /api/customer/profile/my-vehicles/{vehicleId}
   */
  async getVehicleDetail(vehicleId) {
    try {
      const response = await vehicleAPI.getVehicleDetail(vehicleId);
      console.log('Get vehicle detail success:', response);
      return response;
    } catch (error) {
      console.error('Get vehicle detail failed:', error);
      throw error;
    }
  },

  /**
   * 3.4. Xóa xe của tôi
   * DELETE /api/customer/profile/my-vehicles/{vehicleId}
   */
  async deleteVehicle(vehicleId) {
    try {
      // Kiểm tra xem xe có thể xóa không
      const canDeleteCheck = await this.canDeleteVehicle(vehicleId);

      if (!canDeleteCheck.success || !canDeleteCheck.data.canDelete) {
        throw new Error(canDeleteCheck.data.reason || 'Không thể xóa xe này');
      }

      const response = await vehicleAPI.deleteVehicle(vehicleId);
      console.log('Delete vehicle success:', response);
      return response;
    } catch (error) {
      console.error('Delete vehicle failed:', error);
      throw error;
    }
  },

  /**
   * 3.5. Kiểm tra xe có thể xóa không
   * GET /api/customer/profile/my-vehicles/{vehicleId}/can-delete
   */
  async canDeleteVehicle(vehicleId) {
    try {
      const response = await vehicleAPI.canDeleteVehicle(vehicleId);
      console.log('Can delete vehicle check:', response);
      return response;
    } catch (error) {
      console.error('Can delete vehicle check failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách hãng xe (cho form đăng ký xe)
   * GET /api/lookup/car-brands
   */
  async getCarBrands() {
    try {
      const response = await lookupAPI.getCarBrands();
      console.log('Get car brands success:', response);
      return response;
    } catch (error) {
      console.error('Get car brands failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách model theo hãng (cho form đăng ký xe)
   * GET /api/lookup/car-models/by-brand/{brandId}
   */
  async getCarModelsByBrand(brandId) {
    try {
      const response = await lookupAPI.getCarModelsByBrand(brandId);
      console.log('Get car models success:', response);
      return response;
    } catch (error) {
      console.error('Get car models failed:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin xe (partial update, chỉ gửi các trường có giá trị)
   * PUT /api/customer/profile/my-vehicles/{vehicleId}
   */
  async updateVehicle(vehicleId, vehicleData = {}) {
    try {
      const payload = {
        mileage: vehicleData.mileage,
        color: vehicleData.color?.trim(),
        batteryHealthPercent: vehicleData.batteryHealthPercent,
        vehicleCondition: vehicleData.vehicleCondition?.trim(),
        insuranceNumber: vehicleData.insuranceNumber?.trim(),
        insuranceExpiry: vehicleData.insuranceExpiry,
        registrationExpiry: vehicleData.registrationExpiry
      };

      // Loại bỏ undefined và chuỗi rỗng để tránh ghi đè không cần thiết
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
      );

      const response = await vehicleAPI.updateVehicle(vehicleId, cleanedPayload);
      console.log('Update vehicle success:', response);
      return response;
    } catch (error) {
      console.error('Update vehicle failed:', error);
      throw error;
    }
  },

  // Alias tiện dụng
  async updateMyVehicle(vehicleId, vehicleData) {
    return this.updateVehicle(vehicleId, vehicleData);
  }
};

export default vehicleService;
