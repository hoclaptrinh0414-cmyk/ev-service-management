// src/services/lookupService.js
import apiService, { lookupAPI } from './api';

/**
 * Lookup Service
 * Cung c¥p các ph°¡ng théc tra céu dï liÇu theo tài liÇu CUSTOMER_API_ENDPOINTS.md
 * T¥t c£ endpoints Áu AllowAnonymous (không c§n token)
 */
export const lookupService = {
  // ============ 6. LOOKUP DATA - Dî LIÆU TRA CèU ============

  /**
   * 6.1. Danh sách hãng xe
   * GET /api/lookup/car-brands
   */
  async getCarBrands() {
    try {
      const response = await lookupAPI.getCarBrands();
      console.log(' Get car brands success:', response);
      return response;
    } catch (error) {
      console.error('L Get car brands failed:', error);
      throw error;
    }
  },

  /**
   * 6.2. Danh sách model theo hãng
   * GET /api/lookup/car-models/by-brand/{brandId}
   */
  async getCarModelsByBrand(brandId) {
    try {
      const response = await lookupAPI.getCarModelsByBrand(brandId);
      console.log(' Get car models success:', response);
      return response;
    } catch (error) {
      console.error('L Get car models failed:', error);
      throw error;
    }
  },

  /**
   * 6.3. Danh sách trung tâm dËch vå
   * GET /api/lookup/service-centers
   */
  async getServiceCenters() {
    try {
      const response = await lookupAPI.getServiceCenters();
      console.log(' Get service centers success:', response);
      return response;
    } catch (error) {
      console.error('L Get service centers failed:', error);
      throw error;
    }
  },

  /**
   * 6.4. Time slots available (khung giÝ trÑng)
   * GET /api/lookup/time-slots/available
   */
  async getAvailableTimeSlots(serviceCenterId, date) {
    try {
      const response = await lookupAPI.getAvailableTimeSlots(serviceCenterId, date);
      console.log(' Get available time slots success:', response);
      return response;
    } catch (error) {
      console.error('L Get available time slots failed:', error);
      throw error;
    }
  },

  /**
   * 6.5. Danh sách dËch vå
   * GET /api/lookup/maintenance-services
   */
  async getMaintenanceServices() {
    try {
      const response = await lookupAPI.getMaintenanceServices();
      console.log(' Get maintenance services success:', response);
      return response;
    } catch (error) {
      console.error('L Get maintenance services failed:', error);
      throw error;
    }
  },

  /**
   * 6.6. Danh sách gói b£o d°áng (public)
   * GET /api/maintenance-packages
   */
  async getMaintenancePackages(page = 1, pageSize = 10) {
    try {
      const response = await lookupAPI.getMaintenancePackages(page, pageSize);
      console.log(' Get maintenance packages success:', response);
      return response;
    } catch (error) {
      console.error('L Get maintenance packages failed:', error);
      throw error;
    }
  },

  /**
   * 6.7. Gói b£o d°áng phÕ bi¿n
   * GET /api/maintenance-packages/popular
   */
  async getPopularPackages(topCount = 5) {
    try {
      const response = await lookupAPI.getPopularPackages(topCount);
      console.log(' Get popular packages success:', response);
      return response;
    } catch (error) {
      console.error('L Get popular packages failed:', error);
      throw error;
    }
  },

  /**
   * 6.8. Chi ti¿t gói b£o d°áng
   * GET /api/maintenance-packages/{id}
   */
  async getPackageDetail(packageId) {
    try {
      const response = await lookupAPI.getPackageDetail(packageId);
      console.log(' Get package detail success:', response);
      return response;
    } catch (error) {
      console.error('L Get package detail failed:', error);
      throw error;
    }
  },

  /**
   * 6.9. Lo¡i khách hàng (Customer Types)
   * GET /api/customer-types
   */
  async getCustomerTypes() {
    try {
      const response = await lookupAPI.getCustomerTypes();
      console.log(' Get customer types success:', response);
      return response;
    } catch (error) {
      console.error('L Get customer types failed:', error);
      throw error;
    }
  },

  // ============ COMBINED HELPER METHODS ============

  /**
   * L¥y t¥t c£ dï liÇu c§n thi¿t cho form ng ký xe
   */
  async getVehicleRegistrationData() {
    try {
      const [brands, customerTypes] = await Promise.all([
        this.getCarBrands(),
        this.getCustomerTypes()
      ]);

      return {
        brands: brands.success ? brands.data : [],
        customerTypes: customerTypes.success ? customerTypes.data : []
      };
    } catch (error) {
      console.error('L Get vehicle registration data failed:', error);
      throw error;
    }
  },

  /**
   * L¥y t¥t c£ dï liÇu c§n thi¿t cho form ·t lËch
   */
  async getAppointmentBookingData() {
    try {
      const [serviceCenters, maintenanceServices, packages] = await Promise.all([
        this.getServiceCenters(),
        this.getMaintenanceServices(),
        this.getPopularPackages(5)
      ]);

      return {
        serviceCenters: serviceCenters.success ? serviceCenters.data : [],
        maintenanceServices: maintenanceServices.success ? maintenanceServices.data : [],
        packages: packages.success ? packages.data : []
      };
    } catch (error) {
      console.error('L Get appointment booking data failed:', error);
      throw error;
    }
  },

  /**
   * L¥y models theo brand và cache k¿t qu£
   */
  _modelCache: {},
  async getModelsWithCache(brandId) {
    if (this._modelCache[brandId]) {
      console.log('=æ Using cached models for brand:', brandId);
      return this._modelCache[brandId];
    }

    const models = await this.getCarModelsByBrand(brandId);
    this._modelCache[brandId] = models;
    return models;
  },

  /**
   * Clear cache
   */
  clearCache() {
    this._modelCache = {};
    console.log('>ù Lookup cache cleared');
  }
};

export default lookupService;
