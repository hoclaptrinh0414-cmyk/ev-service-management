// src/services/api.js - Unified API Service
// Chỉ cần thay đổi baseURL khi đổi backend

const API_CONFIG = {
  baseURL: 'https://af41bfba2248.ngrok-free.app/api', // URL backend chính
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

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

  // Generic request method với error handling
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
      console.log(`API Request: ${config.method} ${url}`, config);
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      console.log(`API Response Status: ${response.status}`, response);

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log('API Response Data:', data);

      if (!response.ok) {
        const error = new Error(data.message || data || `HTTP error! status: ${response.status}`);
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API request failed:', error);
      
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
      fullName: userData.fullName,        // Backend dùng camelCase
      email: userData.email,
      phoneNumber: userData.phone || null, // Backend dùng camelCase
      roleId: userData.roleId || 4        // Default customer role
    };

    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
      auth: false
    });
    return response;
  }

  async forgotPassword(email) {
    const response = await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
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

  // ============ USER METHODS ============
  async getCurrentUser() {
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

  getStoredUser() {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// Tạo instance và export
const apiService = new UnifiedAPIService();

// Export các API objects để backward compatibility
export const authAPI = {
  login: (credentials) => apiService.login(credentials),
  register: (userData) => apiService.register(userData),
  forgotPassword: (email) => apiService.forgotPassword(email),
  logout: () => apiService.logout(),
  getCurrentUser: () => apiService.getCurrentUser(),
  updateProfile: (userData) => apiService.updateProfile(userData)
};

export const emailVerificationAPI = {
  resendVerification: (email) => apiService.resendVerification(email),
  checkEmailStatus: (email) => apiService.checkEmailStatus(email),
  verifyEmail: (token, email) => apiService.verifyEmail(token, email)
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
  getStoredUser: () => apiService.getStoredUser(),
  clearAuth: () => apiService.clearAuth(),
  setAuth: (token, user) => apiService.setAuth(token, user)
};

// Export default instance
export default apiService;