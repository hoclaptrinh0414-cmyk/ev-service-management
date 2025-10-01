// src/services/api.js - COMPLETE FIXED FILE - REPLACE YOUR ENTIRE api.js WITH THIS
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'https://ccb8c212fd09.ngrok-free.app/api',
  timeout: 15000, // Tăng timeout lên 15s
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Bỏ qua warning của ngrok
  },
};

// Thêm logging để debug
console.log('🔧 API Configuration:', {
  baseURL: API_CONFIG.baseURL,
  appURL: process.env.REACT_APP_APP_URL || 'http://localhost:3000'
});

class UnifiedAPIService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  // Helper method to get headers
  getHeaders(includeAuth = true) {
    const headers = { ...API_CONFIG.headers };
    
    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Generic request method với error handling được cải thiện
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      console.log(`🌐 API Request: ${config.method} ${url}`);
      console.log('📋 Request config:', {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.parse(config.body) : undefined
      });
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      console.log(`📡 API Response Status: ${response.status}`, {
        ok: response.ok,
        statusText: response.statusText
      });

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log('📦 API Response Data:', data);

      if (!response.ok) {
        const error = new Error(data.message || data || `HTTP error! status: ${response.status}`);
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ API request failed:', {
        url,
        method: config.method,
        error: error.message,
        stack: error.stack
      });
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error - Cannot connect to server');
      }
      
      throw error;
    }
  }

  // ============ AUTH METHODS ============
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      }),
      auth: false
    });
    return response;
  }

  async register(userData) {
    const registerData = {
      username: userData.username,
      password: userData.password,
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phone || null,
      roleId: userData.roleId || 4 // Default customer role
    };

    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
      auth: false
    });
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear auth data
      this.clearAuth();
    }
  }

  // ============ PASSWORD RESET METHODS ============
  async forgotPassword(email) {
    console.log('🔐 Sending forgot password request for:', email);
    const response = await this.request('/account/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      auth: false
    });
    console.log('✅ Forgot password response:', response);
    return response;
  }

  async validateResetToken(token, email) {
    console.log('🔍 Validating reset token for:', email);
    const params = new URLSearchParams({
      token: encodeURIComponent(token),
      email: encodeURIComponent(email)
    });
    
    const response = await this.request(`/account/validate-reset-token?${params}`, {
      method: 'GET',
      auth: false
    });
    console.log('✅ Token validation response:', response);
    return response;
  }

  async resetPassword(resetData) {
    console.log('🔄 Submitting password reset for:', resetData.email);
    const response = await this.request('/account/reset-password-submit', {
      method: 'POST',
      body: JSON.stringify({
        token: resetData.token,
        email: resetData.email,
        newPassword: resetData.newPassword,
        confirmPassword: resetData.confirmPassword
      }),
      auth: false
    });
    console.log('✅ Reset password response:', response);
    return response;
  }

  // ============ SOCIAL LOGIN METHODS ============
  async googleLogin(credential) {
    const response = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
      auth: false
    });
    return response;
  }

  async facebookLogin(accessToken) {
    const response = await this.request('/auth/facebook', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
      auth: false
    });
    return response;
  }

  // ============ EMAIL VERIFICATION METHODS ============
  async resendVerification(email) {
    const response = await this.request('/verification/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
      auth: false
    });
    return response;
  }

  async checkEmailStatus(email) {
    const response = await this.request(`/verification/email-status?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      auth: false
    });
    return response;
  }

  async verifyEmail(token, email) {
    const response = await this.request(`/verification/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
      method: 'GET',
      auth: false
    });
    return response;
  }

  // ============ USER PROFILE METHODS ============
  async getCurrentUser() {
    const response = await this.request('/user/profile');
    return response;
  }

  async getProfile() {
    const response = await this.request('/user/profile');
    return response;
  }

  async updateProfile(userData) {
    const response = await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    return response;
  }

  async changePassword(passwordData) {
    const response = await this.request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
    return response;
  }

  // ============ ADMIN USER MANAGEMENT METHODS ============
  async getAllUsers() {
    const response = await this.request('/admin/users');
    return response;
  }

  async getUser(userId) {
    const response = await this.request(`/admin/users/${userId}`);
    return response;
  }

  async updateUser(userId, userData) {
    const response = await this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    return response;
  }

  async deleteUser(userId) {
    const response = await this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
    return response;
  }

  // ============ SERVICE BOOKING METHODS ============
  async bookService(serviceData) {
    const response = await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
    return response;
  }

  async getBookings() {
    const response = await this.request('/bookings');
    return response;
  }

  async updateBooking(id, updateData) {
    const response = await this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    return response;
  }

  async cancelBooking(id) {
    const response = await this.request(`/bookings/${id}`, {
      method: 'DELETE'
    });
    return response;
  }

  async getServices() {
    const response = await this.request('/services');
    return response;
  }

  // ============ PRODUCT METHODS ============
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/products?${queryString}`);
    return response;
  }

  async getProduct(id) {
    const response = await this.request(`/products/${id}`);
    return response;
  }

  // ============ CART METHODS ============
  async getCart() {
    const response = await this.request('/cart');
    return response;
  }

  async addToCart(productId, quantity = 1) {
    const response = await this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    return response;
  }

  async updateCartItem(itemId, quantity) {
    const response = await this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    return response;
  }

  async removeFromCart(itemId) {
    const response = await this.request(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
    return response;
  }

  // ============ ORDER METHODS ============
  async createOrder(orderData) {
    const response = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return response;
  }

  async getOrders() {
    const response = await this.request('/orders');
    return response;
  }

  async getOrder(id) {
    const response = await this.request(`/orders/${id}`);
    return response;
  }

  // ============ UTILITY METHODS ============
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  getStoredUser() {
    return this.getUser();
  }

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Auth data cleared from localStorage');
  }

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('💾 Auth data saved to localStorage');
  }

  // ============ ERROR HANDLING UTILITY ============
  handleApiError(error) {
    // Handle network errors
    if (error.message === 'Network error - Cannot connect to server') {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }

    // Handle timeout errors
    if (error.message === 'Request timeout') {
      return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
    }

    // Handle API response errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle specific error codes
      if (data && data.errorCode) {
        switch (data.errorCode) {
          case 'INVALID_TOKEN':
            return 'Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.';
          case 'TOKEN_EXPIRED':
            return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          case 'ACCESS_DENIED':
            return 'Bạn không có quyền thực hiện hành động này.';
          case 'VALIDATION_ERROR':
            return data.message || 'Dữ liệu không hợp lệ.';
          case 'EMAIL_NOT_FOUND':
            return 'Email không tồn tại trong hệ thống.';
          case 'INVALID_CREDENTIALS':
            return 'Tên đăng nhập hoặc mật khẩu không đúng.';
          case 'USER_NOT_VERIFIED':
            return 'Tài khoản chưa được xác thực email.';
          case 'USER_ALREADY_EXISTS':
            return 'Tài khoản đã tồn tại.';
          default:
            return data.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
        }
      }

      // Handle HTTP status codes
      switch (status) {
        case 400:
          return data.message || 'Yêu cầu không hợp lệ.';
        case 401:
          return 'Bạn cần đăng nhập để thực hiện hành động này.';
        case 403:
          return 'Bạn không có quyền thực hiện hành động này.';
        case 404:
          return 'Không tìm thấy tài nguyên yêu cầu.';
        case 409:
          return data.message || 'Dữ liệu đã tồn tại.';
        case 429:
          return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
        case 500:
          return 'Lỗi máy chủ. Vui lòng thử lại sau.';
        default:
          return data.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      }
    }

    // Handle generic errors
    return error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
}

// Tạo instance và export
const apiService = new UnifiedAPIService();

// ============ EXPORTED API OBJECTS - FIXED VERSION ============
export const authAPI = {
  login: (credentials) => apiService.login(credentials),
  register: (userData) => apiService.register(userData),
  logout: () => apiService.logout(),
  getCurrentUser: () => apiService.getCurrentUser(),
  getProfile: () => apiService.getProfile(),
  updateProfile: (userData) => apiService.updateProfile(userData),
  changePassword: (passwordData) => apiService.changePassword(passwordData)
};

export const accountRecoveryService = {
  forgotPassword: async (email) => {
    return await apiService.forgotPassword(email);
  },
  validateResetToken: async (token, email) => {
    return await apiService.validateResetToken(token, email);
  },
  resetPassword: async (data) => {
    return await apiService.resetPassword(data);
  },
};

export const socialAPI = {
  googleLogin: (credential) => apiService.googleLogin(credential),
  facebookLogin: (accessToken) => apiService.facebookLogin(accessToken)
};

export const emailVerificationAPI = {
  resendVerification: (email) => apiService.resendVerification(email),
  checkEmailStatus: (email) => apiService.checkEmailStatus(email),
  verifyEmail: (token, email) => apiService.verifyEmail(token, email)
};

export const usersAPI = {
  getAllUsers: () => apiService.getAllUsers(),
  getUser: (userId) => apiService.getUser(userId),
  updateUser: (userId, userData) => apiService.updateUser(userId, userData),
  deleteUser: (userId) => apiService.deleteUser(userId)
};

export const serviceAPI = {
  bookService: (serviceData) => apiService.bookService(serviceData),
  getBookings: () => apiService.getBookings(),
  updateBooking: (id, updateData) => apiService.updateBooking(id, updateData),
  cancelBooking: (id) => apiService.cancelBooking(id),
  getServices: () => apiService.getServices()
};

export const productAPI = {
  getProducts: (params) => apiService.getProducts(params),
  getProduct: (id) => apiService.getProduct(id)
};

export const cartAPI = {
  getCart: () => apiService.getCart(),
  addToCart: (productId, quantity) => apiService.addToCart(productId, quantity),
  updateCartItem: (itemId, quantity) => apiService.updateCartItem(itemId, quantity),
  removeFromCart: (itemId) => apiService.removeFromCart(itemId)
};

export const orderAPI = {
  createOrder: (orderData) => apiService.createOrder(orderData),
  getOrders: () => apiService.getOrders(),
  getOrder: (id) => apiService.getOrder(id)
};

export const authUtils = {
  isAuthenticated: () => apiService.isAuthenticated(),
  getToken: () => apiService.getToken(),
  getUser: () => apiService.getUser(),
  getStoredUser: () => apiService.getStoredUser(),
  clearAuth: () => apiService.clearAuth(),
  setAuth: (token, user) => apiService.setAuth(token, user)
};

// Export error handling utility
export const handleApiError = (error) => apiService.handleApiError(error);

// Export default instance
export default apiService;