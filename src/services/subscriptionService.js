// src/services/subscriptionService.js
import apiService, { subscriptionsAPI, lookupAPI } from './api';

/**
 * Subscription Service
 * Cung cấp các phương thức quản lý gói dịch vụ theo tài liệu CUSTOMER_API_ENDPOINTS.md
 */
export const subscriptionService = {
  // ============ 5. PACKAGE SUBSCRIPTIONS - GÓI DỊCH VỤ ============

  /**
   * 5.1. Xem danh sách gói dịch vụ của tôi
   * GET /api/package-subscriptions/my-subscriptions
   * @param {string} statusFilter - Active, Expired, Cancelled, Suspended
   */
  async getMySubscriptions(statusFilter = null) {
    try {
      const response = await subscriptionsAPI.getMySubscriptions(statusFilter);
      console.log('✅ Get my subscriptions success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my subscriptions failed:', error);
      throw error;
    }
  },

  /**
   * 5.2. Xem chi tiết subscription
   * GET /api/package-subscriptions/{id}
   */
  async getSubscriptionById(subscriptionId) {
    try {
      const response = await subscriptionsAPI.getSubscriptionDetail(subscriptionId);
      console.log('✅ Get subscription detail success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get subscription detail failed:', error);
      throw error;
    }
  },

  /**
   * 5.3. Xem usage (đã dùng bao nhiêu)
   * GET /api/package-subscriptions/{id}/usage
   */
  async getSubscriptionUsage(subscriptionId) {
    try {
      const response = await subscriptionsAPI.getSubscriptionUsage(subscriptionId);
      console.log('✅ Get subscription usage success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get subscription usage failed:', error);
      throw error;
    }
  },

  /**
   * 5.4. Xem subscriptions active cho 1 xe
   * GET /api/package-subscriptions/vehicle/{vehicleId}/active
   */
  async getActiveSubscriptionsByVehicle(vehicleId) {
    try {
      const response = await subscriptionsAPI.getActiveSubscriptionsByVehicle(vehicleId);
      console.log('✅ Get active subscriptions by vehicle success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get active subscriptions by vehicle failed:', error);
      throw error;
    }
  },

  /**
   * 5.5. Mua gói dịch vụ
   * POST /api/package-subscriptions/purchase
   */
  async purchasePackage(packageData) {
    try {
      const response = await subscriptionsAPI.purchasePackage({
        packageId: packageData.packageId,
        vehicleId: packageData.vehicleId,
        paymentMethod: packageData.paymentMethod,
        paymentReference: packageData.paymentReference
      });
      console.log('✅ Purchase package success:', response);
      return response;
    } catch (error) {
      console.error('❌ Purchase package failed:', error);
      throw error;
    }
  },

  /**
   * 5.6. Hủy subscription
   * POST /api/package-subscriptions/{id}/cancel
   */
  async cancelSubscription(subscriptionId, cancellationReason) {
    try {
      const response = await subscriptionsAPI.cancelSubscription(subscriptionId, cancellationReason);
      console.log('✅ Cancel subscription success:', response);
      return response;
    } catch (error) {
      console.error('❌ Cancel subscription failed:', error);
      throw error;
    }
  },

  // ============ HELPER METHODS ============

  /**
   * Lấy danh sách gói bảo dưỡng có sẵn (public)
   * GET /api/maintenance-packages
   */
  async getAvailablePackages(page = 1, pageSize = 10) {
    try {
      const response = await lookupAPI.getMaintenancePackages(page, pageSize);
      console.log('✅ Get available packages success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get available packages failed:', error);
      throw error;
    }
  },

  /**
   * Lấy gói phổ biến
   * GET /api/maintenance-packages/popular
   */
  async getPopularPackages(topCount = 5) {
    try {
      const response = await lookupAPI.getPopularPackages(topCount);
      console.log('✅ Get popular packages success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get popular packages failed:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết gói bảo dưỡng
   * GET /api/maintenance-packages/{id}
   */
  async getPackageDetail(packageId) {
    try {
      const response = await lookupAPI.getPackageDetail(packageId);
      console.log('✅ Get package detail success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get package detail failed:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả subscriptions active
   */
  async getAllActiveSubscriptions() {
    return this.getMySubscriptions('Active');
  },

  /**
   * Lấy tất cả subscriptions expired
   */
  async getAllExpiredSubscriptions() {
    return this.getMySubscriptions('Expired');
  },

  /**
   * Lấy tất cả subscriptions cancelled
   */
  async getAllCancelledSubscriptions() {
    return this.getMySubscriptions('Cancelled');
  }
};

export default subscriptionService;
