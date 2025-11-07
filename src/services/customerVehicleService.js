// src/services/customerVehicleService.js
import apiService from './apiService';

/**
 * Customer Vehicle Service
 * Quản lý API cho danh sách xe khách hàng (Admin/Staff)
 * Endpoint: GET /api/customer-vehicles
 */
const customerVehicleService = {
  /**
   * Lấy danh sách xe của khách hàng với filtering & pagination
   * GET /api/customer-vehicles
   * 
   * @param {Object} params - Query parameters
   * @param {number} params.Page - Số trang (mặc định: 1)
   * @param {number} params.PageSize - Số lượng items/trang (mặc định: 10)
   * @param {string} params.SearchTerm - Tìm kiếm theo biển số, VIN, tên xe
   * @param {number} params.CustomerId - Lọc theo ID khách hàng
   * @param {number} params.ModelId - Lọc theo ID model xe
   * @param {number} params.BrandId - Lọc theo ID hãng xe
   * @param {boolean} params.IsActive - Lọc xe đang hoạt động/không hoạt động
   * @param {boolean} params.MaintenanceDue - Lọc xe sắp đến hạn bảo dưỡng
   * @param {boolean} params.InsuranceExpiring - Lọc xe sắp hết hạn bảo hiểm
   * @param {string} params.SortBy - Sắp xếp theo field (ví dụ: 'LicensePlate', 'PurchaseDate')
   * @param {string} params.SortOrder - Thứ tự sắp xếp ('asc' hoặc 'desc')
   * @param {boolean} params.IncludeCustomer - Bao gồm thông tin khách hàng
   * @param {boolean} params.IncludeModel - Bao gồm thông tin model xe
   * @param {boolean} params.IncludeStats - Bao gồm thống kê bảo dưỡng
   * 
   * @returns {Promise<Object>} Response với danh sách xe và pagination info
   */
  async getAllCustomerVehicles(params = {}) {
    try {
      const queryParams = {
        Page: params.Page || 1,
        PageSize: params.PageSize || 10,
        ...(params.SearchTerm && { SearchTerm: params.SearchTerm }),
        ...(params.CustomerId && { CustomerId: params.CustomerId }),
        ...(params.ModelId && { ModelId: params.ModelId }),
        ...(params.BrandId && { BrandId: params.BrandId }),
        ...(params.IsActive !== undefined && { IsActive: params.IsActive }),
        ...(params.MaintenanceDue !== undefined && { MaintenanceDue: params.MaintenanceDue }),
        ...(params.InsuranceExpiring !== undefined && { InsuranceExpiring: params.InsuranceExpiring }),
        ...(params.SortBy && { SortBy: params.SortBy }),
        ...(params.SortOrder && { SortOrder: params.SortOrder }),
        ...(params.IncludeCustomer !== undefined && { IncludeCustomer: params.IncludeCustomer }),
        ...(params.IncludeModel !== undefined && { IncludeModel: params.IncludeModel }),
        ...(params.IncludeStats !== undefined && { IncludeStats: params.IncludeStats })
      };

      const response = await apiService.request({
        method: 'GET',
        endpoint: '/customer-vehicles',
        params: queryParams,
        auth: true
      });

      console.log('✅ Get all customer vehicles success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get all customer vehicles failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe của một khách hàng cụ thể
   * @param {number} customerId - ID khách hàng
   * @param {Object} params - Additional params (pagination, sorting, includes)
   */
  async getVehiclesByCustomer(customerId, params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        CustomerId: customerId,
        IncludeCustomer: params.IncludeCustomer ?? true,
        IncludeModel: params.IncludeModel ?? true
      });
    } catch (error) {
      console.error(`❌ Get vehicles for customer ${customerId} failed:`, error);
      throw error;
    }
  },

  /**
   * Tìm kiếm xe theo biển số, VIN, hoặc tên model
   * @param {string} searchTerm - Từ khóa tìm kiếm
   * @param {Object} params - Additional params
   */
  async searchVehicles(searchTerm, params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        SearchTerm: searchTerm,
        IncludeCustomer: params.IncludeCustomer ?? true,
        IncludeModel: params.IncludeModel ?? true
      });
    } catch (error) {
      console.error(`❌ Search vehicles with term "${searchTerm}" failed:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe theo hãng
   * @param {number} brandId - ID hãng xe
   * @param {Object} params - Additional params
   */
  async getVehiclesByBrand(brandId, params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        BrandId: brandId,
        IncludeModel: true,
        IncludeCustomer: params.IncludeCustomer ?? false
      });
    } catch (error) {
      console.error(`❌ Get vehicles by brand ${brandId} failed:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe theo model
   * @param {number} modelId - ID model xe
   * @param {Object} params - Additional params
   */
  async getVehiclesByModel(modelId, params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        ModelId: modelId,
        IncludeModel: true,
        IncludeCustomer: params.IncludeCustomer ?? true
      });
    } catch (error) {
      console.error(`❌ Get vehicles by model ${modelId} failed:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe sắp đến hạn bảo dưỡng
   * @param {Object} params - Additional params
   */
  async getMaintenanceDueVehicles(params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        MaintenanceDue: true,
        IncludeCustomer: true,
        IncludeModel: true,
        IncludeStats: true,
        SortBy: params.SortBy || 'NextMaintenanceDate',
        SortOrder: params.SortOrder || 'asc'
      });
    } catch (error) {
      console.error('❌ Get maintenance due vehicles failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe sắp hết hạn bảo hiểm
   * @param {Object} params - Additional params
   */
  async getInsuranceExpiringVehicles(params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        InsuranceExpiring: true,
        IncludeCustomer: true,
        IncludeModel: true,
        SortBy: params.SortBy || 'InsuranceExpiry',
        SortOrder: params.SortOrder || 'asc'
      });
    } catch (error) {
      console.error('❌ Get insurance expiring vehicles failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe đang hoạt động
   * @param {Object} params - Additional params
   */
  async getActiveVehicles(params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        IsActive: true,
        IncludeCustomer: params.IncludeCustomer ?? false,
        IncludeModel: params.IncludeModel ?? true
      });
    } catch (error) {
      console.error('❌ Get active vehicles failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe không hoạt động
   * @param {Object} params - Additional params
   */
  async getInactiveVehicles(params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        IsActive: false,
        IncludeCustomer: params.IncludeCustomer ?? true,
        IncludeModel: params.IncludeModel ?? true
      });
    } catch (error) {
      console.error('❌ Get inactive vehicles failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe với thống kê đầy đủ
   * @param {Object} params - Additional params
   */
  async getVehiclesWithStats(params = {}) {
    try {
      return await this.getAllCustomerVehicles({
        ...params,
        IncludeCustomer: true,
        IncludeModel: true,
        IncludeStats: true
      });
    } catch (error) {
      console.error('❌ Get vehicles with stats failed:', error);
      throw error;
    }
  }
};

export default customerVehicleService;
