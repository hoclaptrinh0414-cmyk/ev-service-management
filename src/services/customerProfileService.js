// src/services/customerProfileService.js
import apiService from './api';

/**
 * Customer Profile Service
 * API: /api/customer/profile/me (GET, PUT)
 *
 * ⚠️ QUAN TRỌNG: BE trả về PascalCase
 * Response structure: { Success, Message, Data }
 * Data fields: CustomerId, FullName, PhoneNumber, Email, Address, DateOfBirth, Gender,
 *              TotalSpent, LoyaltyPoints, CustomerType: { TypeName, DiscountPercent }
 */
export const customerProfileService = {
  /**
   * GET /api/customer/profile/me
   * Lấy thông tin hồ sơ khách hàng
   */
  async getProfile() {
    try {
      console.log('📥 [customerProfileService] Calling API: GET /api/customer/profile/me');

      const response = await apiService.getCustomerProfile();

      console.log('📦 [customerProfileService] Raw API response:', response);
      console.log('📦 [customerProfileService] Response type:', typeof response);
      console.log('📦 [customerProfileService] Response keys:', Object.keys(response || {}));

      // ✅ BE THỰC TẾ TRẢ VỀ LOWERCASE (theo CUSTOMER_API_ENDPOINTS.md)
      // Response: { success: true, message: "...", data: {...} }
      return {
        success: response.success || false,
        message: response.message || '',
        data: response.data || null,
        errorCode: response.errorCode || null
      };
    } catch (error) {
      console.error('❌ [customerProfileService] Get profile failed:', error);
      throw error;
    }
  },

  /**
   * PUT /api/customer/profile/me
   * Cập nhật thông tin hồ sơ khách hàng
   */
  async updateProfile(userData) {
    try {
      console.log('📤 [customerProfileService] Updating profile with:', userData);

      const response = await apiService.updateCustomerProfile({
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        preferredLanguage: 'vi-VN', // Mặc định tiếng Việt
        marketingOptIn: true // Mặc định đồng ý nhận thông tin marketing
      });

      console.log('📦 [customerProfileService] Update response:', response);

      // ✅ BE THỰC TẾ TRẢ VỀ LOWERCASE (theo CUSTOMER_API_ENDPOINTS.md)
      return {
        success: response.success || false,
        message: response.message || '',
        data: response.data || null,
        errorCode: response.errorCode || null
      };
    } catch (error) {
      console.error('❌ [customerProfileService] Update profile failed:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin đầy đủ (bao gồm loyalty points, customer type, etc.)
   */
  async getFullProfile() {
    try {
      const response = await this.getProfile();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get profile');
    } catch (error) {
      console.error('❌ Get full profile failed:', error);
      throw error;
    }
  },

  /**
   * Cập nhật một phần thông tin profile
   */
  async partialUpdate(partialData) {
    try {
      // Lấy profile hiện tại
      const currentProfile = await this.getFullProfile();

      // Merge với dữ liệu mới
      const updatedData = {
        ...currentProfile,
        ...partialData
      };

      return await this.updateProfile(updatedData);
    } catch (error) {
      console.error('❌ Partial update failed:', error);
      throw error;
    }
  }
};

export default customerProfileService;
