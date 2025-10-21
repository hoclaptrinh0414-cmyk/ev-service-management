// src/services/authService.js
import apiService, { authAPI, socialAPI, emailVerificationAPI, accountRecoveryService, authUtils } from './api';

/**
 * Authentication Service
 * Cung cấp các phương thức xác thực người dùng theo tài liệu CUSTOMER_API_ENDPOINTS.md
 */
export const authService = {
  // ============ 1. AUTHENTICATION - XÁC THỰC ============

  /**
   * 1.1. Đăng ký tài khoản Customer
   * POST /api/customer-registration/register
   */
  async register(userData) {
    try {
      const response = await apiService.register({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || 'Male',
        identityNumber: userData.identityNumber || ''
      });

      console.log('✅ Register success:', response);
      return response;
    } catch (error) {
      console.error('❌ Register failed:', error);
      throw error;
    }
  },

  /**
   * 1.2. Đăng nhập
   * POST /api/auth/login
   */
  async login(username, password) {
    try {
      const response = await apiService.login({ username, password });
      console.log('🔍 Raw login response:', response);

      // ✅ BE trả về: { Success, Data: { User, Customer, Token } }
      // api.js đã convert về lowercase: { success, data }
      const success = response.Success || response.success;
      const data = response.Data || response.data;

      if (success && data) {
        const Token = data.Token || data.token;
        const User = data.User || data.user;
        const Customer = data.Customer || data.customer;

        console.log('🔍 Extracted data:', { Token, User, Customer });

        if (!Token || !User) {
          console.error('❌ Missing Token or User in response');
          throw new Error('Invalid login response');
        }

        // Lưu token và user data cơ bản trước
        const basicUserData = {
          ...User,
          ...Customer  // Merge customer data if exists
        };

        authUtils.setAuth(Token, basicUserData);
        console.log('✅ Login success with basic data:', basicUserData);

        // Gọi thêm API GET customer profile để lấy thông tin đầy đủ
        // (Chỉ gọi nếu là Customer role)
        const roleId = User.RoleId || User.roleId;
        if (roleId === 3) {  // Customer role
          try {
            console.log('📥 Fetching full customer profile...');
            const profileResponse = await apiService.getCustomerProfile();
            console.log('🔍 Profile response:', profileResponse);

            // ✅ BE TRẢ VỀ LOWERCASE (theo CUSTOMER_API_ENDPOINTS.md)
            const profileSuccess = profileResponse.success;
            const profileData = profileResponse.data;

            if (profileSuccess && profileData) {
              // ✅ Merge full profile data (lowercase từ BE)
              const fullUserData = {
                ...basicUserData,
                ...profileData
              };

              // Cập nhật lại localStorage với thông tin đầy đủ
              authUtils.setAuth(Token, fullUserData);
              console.log('✅ Full profile loaded:', fullUserData);
            }
          } catch (profileError) {
            console.warn('⚠️ Could not fetch full profile, using basic info:', profileError);
            // Vẫn cho phép login thành công ngay cả khi không lấy được full profile
          }
        }
      }

      return { success, data };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  /**
   * 1.3. Đăng nhập bằng Google
   * POST /api/auth/external/google
   */
  async googleLogin(idToken) {
    try {
      const response = await socialAPI.googleLogin(idToken);

      if (response.success && response.data.token) {
        const { token, user, customer } = response.data;
        const userData = { ...user, customer };
        authUtils.setAuth(token, userData);
        console.log('✅ Google login success:', userData);

        // Lấy thông tin profile đầy đủ
        try {
          const profileResponse = await apiService.getCustomerProfile();
          if (profileResponse.success && profileResponse.data) {
            const fullUserData = { ...userData, ...profileResponse.data };
            authUtils.setAuth(token, fullUserData);
            console.log('✅ Full profile loaded after Google login');
          }
        } catch (profileError) {
          console.warn('⚠️ Could not fetch full profile after Google login');
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Google login failed:', error);
      throw error;
    }
  },

  /**
   * 1.3. Đăng nhập bằng Facebook
   * POST /api/auth/external/facebook
   */
  async facebookLogin(accessToken) {
    try {
      const response = await socialAPI.facebookLogin(accessToken);

      if (response.success && response.data.token) {
        const { token, user, customer } = response.data;
        const userData = { ...user, customer };
        authUtils.setAuth(token, userData);
        console.log('✅ Facebook login success:', userData);

        // Lấy thông tin profile đầy đủ
        try {
          const profileResponse = await apiService.getCustomerProfile();
          if (profileResponse.success && profileResponse.data) {
            const fullUserData = { ...userData, ...profileResponse.data };
            authUtils.setAuth(token, fullUserData);
            console.log('✅ Full profile loaded after Facebook login');
          }
        } catch (profileError) {
          console.warn('⚠️ Could not fetch full profile after Facebook login');
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Facebook login failed:', error);
      throw error;
    }
  },

  /**
   * 1.4. Xác thực Email
   * POST /api/verification/verify-email
   */
  async verifyEmail(email, token) {
    try {
      const response = await emailVerificationAPI.verifyEmail(token, email);
      console.log('✅ Email verified:', response);
      return response;
    } catch (error) {
      console.error('❌ Email verification failed:', error);
      throw error;
    }
  },

  /**
   * 1.5. Gửi lại email xác thực
   * POST /api/verification/resend-verification
   */
  async resendVerification(email) {
    try {
      const response = await emailVerificationAPI.resendVerification(email);
      console.log('✅ Verification email resent:', response);
      return response;
    } catch (error) {
      console.error('❌ Resend verification failed:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái email
   */
  async checkEmailStatus(email) {
    try {
      const response = await emailVerificationAPI.checkEmailStatus(email);
      return response;
    } catch (error) {
      console.error('❌ Check email status failed:', error);
      throw error;
    }
  },

  /**
   * 1.6. Đổi mật khẩu (khi đã đăng nhập)
   * PUT /api/auth/change-password
   */
  async changePassword(currentPassword, newPassword, confirmNewPassword) {
    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      console.log('✅ Password changed:', response);
      return response;
    } catch (error) {
      console.error('❌ Change password failed:', error);
      throw error;
    }
  },

  /**
   * 1.7. Quên mật khẩu (gửi OTP)
   * POST /api/account/forgot-password
   */
  async forgotPassword(email) {
    try {
      const response = await accountRecoveryService.forgotPassword(email);
      console.log('✅ Forgot password email sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Forgot password failed:', error);
      throw error;
    }
  },

  /**
   * 1.8. Đặt lại mật khẩu (với OTP)
   * POST /api/account/reset-password
   */
  async resetPassword(email, token, newPassword, confirmPassword) {
    try {
      const response = await accountRecoveryService.resetPassword({
        email,
        token,
        newPassword,
        confirmPassword
      });
      console.log('✅ Password reset success:', response);
      return response;
    } catch (error) {
      console.error('❌ Reset password failed:', error);
      throw error;
    }
  },

  /**
   * Đăng xuất
   */
  async logout() {
    try {
      await authAPI.logout();
      console.log('✅ Logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Vẫn clear auth data ngay cả khi có lỗi
      authUtils.clearAuth();
    }
  },

  // ============ UTILITY METHODS ============

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser() {
    return authUtils.getUser();
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isAuthenticated() {
    return authUtils.isAuthenticated();
  },

  /**
   * Lấy token hiện tại
   */
  getToken() {
    return authUtils.getToken();
  },

  /**
   * Clear auth data
   */
  clearAuth() {
    authUtils.clearAuth();
  }
};

export default authService;
