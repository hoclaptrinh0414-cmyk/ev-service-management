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

      // Check success flag
      const success = response.success || response.Success;
      
      if (!success) {
        throw new Error('Login failed');
      }

      // Extract data object
      const data = response.data || response.Data;
      
      if (!data) {
        console.error('❌ No data object in response');
        throw new Error('Invalid login response - no data');
      }

      console.log('🔍 Data object:', data);

      // Token is IN data object: data.accessToken or data.token
      let token = data.accessToken || data.access_token || data.token || data.Token;
      
      // Fallback: check root level with dynamic field name (backward compatible)
      if (!token) {
        for (const key in response) {
          if (key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('jwt') || 
              key.startsWith('my')) {
            token = response[key];
            console.log(`🔍 Found token in root field: ${key}`);
            break;
          }
        }
      } else {
        console.log('🔍 Found token in data.accessToken');
      }

      if (!token) {
        console.error('❌ Missing token in response');
        console.error('❌ Full response:', JSON.stringify(response, null, 2));
        throw new Error('Invalid login response - missing token');
      }

      // User data can be:
      // 1. Nested: data.user (object)
      // 2. Flat: data (direct fields like userId, username, etc.)
      let userData = null;
      
      if (data.user && typeof data.user === 'object') {
        // Nested structure: { data: { user: {...} } }
        console.log('🔍 Found nested user object');
        userData = {
          ...data.user,
          // Also merge customer if exists
          ...(data.customer || response.customer || response.Customer || {})
        };
      } else {
        // Flat structure: { data: { userId, username, ... } }
        console.log('🔍 Using flat data structure');
        userData = {
          ...data,
          ...(response.customer || response.Customer || {})
        };
      }

      console.log('🔍 User data:', userData);

      // Save auth
      authUtils.setAuth(token, userData);
      console.log('✅ Login success with user data');

      // Fetch customer profile only for Customer role (roleId === 4)
      const roleId = userData.roleId || userData.RoleId;
      if (roleId === 4) {  // Customer role
        try {
          console.log('📥 Fetching full customer profile...');
          const profileResponse = await apiService.getCustomerProfile();
          console.log('🔍 Profile response:', profileResponse);

          const profileSuccess = profileResponse.success;
          const profileData = profileResponse.data;

          if (profileSuccess && profileData) {
            const fullUserData = {
              ...userData,
              ...profileData
            };

            authUtils.setAuth(token, fullUserData);
            console.log('✅ Full profile loaded:', fullUserData);
          }
        } catch (profileError) {
          console.warn('⚠️ Could not fetch full profile, using basic info:', profileError);
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
