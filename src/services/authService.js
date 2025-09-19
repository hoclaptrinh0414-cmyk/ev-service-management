// src/services/apiService.js

const API_BASE_URL = 'http://172.16.24.52:5153/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method để tạo headers    
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      }),
      auth: false // Không cần auth cho login
    });
  }

  async register(userData) {
    const registerData = {
      username: userData.username,
      password: userData.password,
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phone,
      roleId: userData.roleId || 4 // Default customer role
    };

    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
      auth: false // Không cần auth cho register
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      auth: false
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa token dù có lỗi hay không
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // User methods
  async getCurrentUser() {
    return this.request('/user/profile');
  }

  async updateProfile(userData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Product methods
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/products?${searchParams}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  // Cart methods
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  // Order methods
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  // Service booking methods (dành cho EV service)
  async bookService(serviceData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  async getBookings() {
    return this.request('/bookings');
  }

  async updateBooking(id, updateData) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  // Utility methods
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeUser('user');
  }
}

// Tạo instance và export
const apiService = new ApiService();
export default apiService;