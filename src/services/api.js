// src/services/api.js - COMPLETE FILE - COPY TOÀN BỘ FILE NÀY
const API_CONFIG = {
  baseURL:
    process.env.REACT_APP_API_URL || "https://57013b70a404.ngrok-free.app/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
};

console.log("API Configuration:", {
  baseURL: API_CONFIG.baseURL,
  appURL: process.env.REACT_APP_APP_URL || "http://localhost:3000",
});

class UnifiedAPIService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  getHeaders(includeAuth = true) {
    const headers = { ...API_CONFIG.headers };

    if (includeAuth) {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request(endpoint, options = {}, retryWithRefresh = true) {
    const url = `${this.baseURL}${endpoint}`;
    const includeAuth = options.auth !== false;
    const headers = {
      ...this.getHeaders(includeAuth),
      ...(options.headers || {}),
    };

    const config = {
      method: "GET",
      ...options,
      headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      console.log(`API Request: ${config.method} ${url}`);
      console.log("Request config:", {
        method: config.method,
        headers: config.headers,
        body: (() => {
          if (!config.body) return undefined;
          try {
            return JSON.parse(config.body);
          } catch {
            return config.body;
          }
        })(),
      });

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      console.log(`API Response Status: ${response.status}`, {
        ok: response.ok,
        statusText: response.statusText,
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log("API Response Data:", data);

      if (!response.ok) {
        // Attempt refresh token for 401 responses on authenticated routes
        if (
          response.status === 401 &&
          includeAuth &&
          retryWithRefresh &&
          !(endpoint.startsWith("/auth/") || endpoint.startsWith("/customer-registration/"))
        ) {
          try {
            const newAccessToken = await this.refreshAccessToken();
            console.log("Retrying original request with refreshed token");
            return this.request(endpoint, options, false);
          } catch (refreshError) {
            console.error("❌ Refresh token flow failed:", refreshError);
            this.clearAuth();
          }
        }

        const error = new Error(
          (data && data.message) || data || `HTTP error! status: ${response.status}`
        );
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("❌ API request failed:", {
        url,
        method: config.method,
        error: error.message,
        stack: error.stack,
      });

      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      if (error.message === "Failed to fetch") {
        throw new Error("Network error - Cannot connect to server");
      }

      throw error;
    }
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("Attempting to refresh access token via fetch client");
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    console.log("Refresh response (fetch client):", data);
    const success = data.success || data.Success;
    const payload = data.data || data.Data;

    if (!success || !payload) {
      throw new Error("Invalid refresh response");
    }

    const newAccessToken = payload.accessToken || payload.AccessToken;
    const newRefreshToken = payload.refreshToken || payload.RefreshToken;

    if (!newAccessToken || !newRefreshToken) {
      throw new Error("Missing tokens in refresh response");
    }

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("token", newAccessToken);
    console.log("Access token refreshed successfully (fetch client)");
    return newAccessToken;
  }

  // ============ AUTH METHODS ============
  // 1.2. Đăng nhập
  async login(credentials) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
      auth: false,
    });
    return response;
  }

  // 1.1. Đăng ký tài khoản Customer
  async register(userData) {
    const registerData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber || "",
      address: userData.address || "",
      dateOfBirth: userData.dateOfBirth || "",
      gender: userData.gender || "Male",
      identityNumber: userData.identityNumber || "",
    };

    const response = await this.request("/customer-registration/register", {
      method: "POST",
      body: JSON.stringify(registerData),
      auth: false,
    });
    return response;
  }

  async logout() {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuth();
    }
  }

  // ============ PASSWORD RESET METHODS ============
  // 1.7. Quên mật khẩu (gửi OTP)
  async forgotPassword(email) {
    console.log("🔐 Sending forgot password request for:", email);
    const response = await this.request("/account/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      auth: false,
    });
    console.log("✅ Forgot password response:", response);
    return response;
  }

  // 1.8. Đặt lại mật khẩu (với OTP)
  async resetPassword(resetData) {
    console.log("🔄 Submitting password reset for:", resetData.email);
    const response = await this.request("/account/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email: resetData.email,
        otp: resetData.otp,
        newPassword: resetData.newPassword,
        confirmPassword: resetData.confirmPassword,
      }),
      auth: false,
    });
    console.log("✅ Reset password response:", response);
    return response;
  }

  // 1.6. Đổi mật khẩu (khi đã đăng nhập)
  async changePassword(passwordData) {
    const response = await this.request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      }),
    });
    return response;
  }

  // ============ SOCIAL LOGIN METHODS ============
  // 1.3. Đăng nhập bằng Google
  async googleLogin(idToken) {
    const response = await this.request("/auth/external/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      auth: false,
    });
    return response;
  }

  async facebookLogin(accessToken) {
    const response = await this.request("/auth/external/facebook", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
      auth: false,
    });
    return response;
  }

  // ============ EMAIL VERIFICATION METHODS ============
  // 1.4. Xác thực Email
  async verifyEmail(email, token) {
    const response = await this.request("/verification/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, token }),
      auth: false,
    });
    return response;
  }

  // 1.5. Gửi lại email xác thực
  async resendVerification(email) {
    const response = await this.request("/verification/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
      auth: false,
    });
    return response;
  }

  async checkEmailStatus(email) {
    const response = await this.request(
      `/verification/email-status?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        auth: false,
      }
    );
    return response;
  }

  // ============ CUSTOMER PROFILE METHODS ============
  // 2.1. Xem thông tin hồ sơ của tôi
  async getCustomerProfile() {
    const response = await this.request("/customer/profile/me");
    return response;
  }

  // 2.2. Cập nhật thông tin hồ sơ
  async updateCustomerProfile(userData) {
    const response = await this.request("/customer/profile/me", {
      method: "PUT",
      body: JSON.stringify({
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        preferredLanguage: userData.preferredLanguage || "vi",
        marketingOptIn:
          userData.marketingOptIn !== undefined
            ? userData.marketingOptIn
            : true,
      }),
    });
    return response;
  }

  // Legacy methods for backward compatibility
  async getCurrentUser() {
    return this.getCustomerProfile();
  }

  async getProfile() {
    return this.getCustomerProfile();
  }

  async updateProfile(userData) {
    return this.updateCustomerProfile(userData);
  }

  // ============ ADMIN USER MANAGEMENT METHODS ============
  async getAllUsers() {
    const response = await this.request("/admin/users");
    return response;
  }

  async getUser(userId) {
    const response = await this.request(`/admin/users/${userId}`);
    return response;
  }

  async updateUser(userId, userData) {
    const response = await this.request(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    return response;
  }

  async deleteUser(userId) {
    const response = await this.request(`/admin/users/${userId}`, {
      method: "DELETE",
    });
    return response;
  }

  // ============ CAR BRANDS & MODELS METHODS - NEW ============
  // ✅ KHÔNG CẦN TOKEN (AllowAnonymous)
  async getActiveBrands() {
    const response = await this.request("/car-brands/active", { auth: false });
    return response;
  }

  async getModelsByBrand(brandId) {
    const response = await this.request(`/car-models/by-brand/${brandId}`, {
      auth: false,
    });
    return response;
  }

  async getAllBrands(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(
      `/car-brands${queryString ? `?${queryString}` : ""}`
    );
    return response;
  }

  async getAllModels(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(
      `/car-models${queryString ? `?${queryString}` : ""}`
    );
    return response;
  }

  // ============ MY VEHICLES METHODS ============
  // 3.1. Xem danh sách xe của tôi
  async getMyVehicles() {
    const response = await this.request("/customer/profile/my-vehicles");
    return response;
  }

  // 3.2. Đăng ký xe mới
  async addVehicle(vehicleData) {
    const response = await this.request("/customer/profile/my-vehicles", {
      method: "POST",
      body: JSON.stringify({
        modelId: vehicleData.modelId,
        licensePlate: vehicleData.licensePlate,
        vin: vehicleData.vin,
        color: vehicleData.color,
        purchaseDate: vehicleData.purchaseDate,
        mileage: vehicleData.mileage,
        insuranceNumber: vehicleData.insuranceNumber,
        insuranceExpiry: vehicleData.insuranceExpiry,
        registrationExpiry: vehicleData.registrationExpiry,
      }),
    });
    return response;
  }

  // 3.3. Xem chi tiết 1 xe
  async getVehicleDetail(vehicleId) {
    const response = await this.request(
      `/customer/profile/my-vehicles/${vehicleId}`
    );
    return response;
  }

  // 3.4. Xóa xe của tôi
  async deleteVehicle(vehicleId) {
    const response = await this.request(
      `/customer/profile/my-vehicles/${vehicleId}`,
      {
        method: "DELETE",
      }
    );
    return response;
  }

  // 3.5. Kiểm tra xe có thể xóa không
  async canDeleteVehicle(vehicleId) {
    const response = await this.request(
      `/customer/profile/my-vehicles/${vehicleId}/can-delete`
    );
    return response;
  }

  // Legacy methods for backward compatibility
  async getCustomerVehicles(params = {}) {
    return this.getMyVehicles();
  }

  async getVehicle(vehicleId) {
    return this.getVehicleDetail(vehicleId);
  }

  async updateVehicle(vehicleId, vehicleData) {
    // Note: Update vehicle endpoint not in the API doc for customer
    // Keeping for potential future use
    const response = await this.request(
      `/customer/profile/my-vehicles/${vehicleId}`,
      {
        method: "PUT",
        body: JSON.stringify(vehicleData),
      }
    );
    return response;
  }

  // ============ APPOINTMENTS METHODS ============
  // 4.1. Tạo lịch hẹn mới
  async createAppointment(appointmentData) {
    const response = await this.request("/appointments", {
      method: "POST",
      body: JSON.stringify({
        customerId: appointmentData.customerId,
        vehicleId: appointmentData.vehicleId,
        serviceCenterId: appointmentData.serviceCenterId,
        slotId: appointmentData.slotId,
        serviceIds: appointmentData.serviceIds,
        packageId: appointmentData.packageId || null,
        customerNotes: appointmentData.customerNotes || "",
        preferredTechnicianId: appointmentData.preferredTechnicianId || null,
        priority: appointmentData.priority || "Normal",
        source: appointmentData.source || "Online",
      }),
    });
    return response;
  }

  // 4.2. Xem tất cả lịch hẹn của tôi
  async getMyAppointments() {
    const response = await this.request("/appointments/my-appointments");
    return response;
  }

  // 4.3. Xem lịch hẹn sắp tới
  async getUpcomingAppointments(limit = 5) {
    const response = await this.request(
      `/appointments/my-appointments/upcoming?limit=${limit}`
    );
    return response;
  }

  // 4.4. Xem chi tiết lịch hẹn
  async getAppointmentDetail(id) {
    const response = await this.request(`/appointments/${id}`);
    return response;
  }

  // 4.5. Tìm lịch hẹn theo mã
  async getAppointmentByCode(code) {
    const response = await this.request(`/appointments/by-code/${code}`);
    return response;
  }

  // 4.6. Cập nhật lịch hẹn
  async updateAppointment(id, appointmentData) {
    const response = await this.request(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        appointmentId: id,
        vehicleId: appointmentData.vehicleId,
        slotId: appointmentData.slotId,
        serviceIds: appointmentData.serviceIds,
        customerNotes: appointmentData.customerNotes,
        priority: appointmentData.priority,
      }),
    });
    return response;
  }

  // 4.7. Dời lịch hẹn
  async rescheduleAppointment(id, newSlotId, reason) {
    const response = await this.request(`/appointments/${id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({
        appointmentId: id,
        newSlotId: newSlotId,
        reason: reason,
      }),
    });
    return response;
  }

  // 4.8. Hủy lịch hẹn
  async cancelAppointment(id, cancellationReason) {
    const response = await this.request(`/appointments/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({
        appointmentId: id,
        cancellationReason: cancellationReason,
      }),
    });
    return response;
  }

  // 4.9. Xóa lịch hẹn (chỉ khi Pending)
  async deleteAppointment(id) {
    const response = await this.request(`/appointments/${id}`, {
      method: "DELETE",
    });
    return response;
  }

  // ============ PAYMENT & INVOICE METHODS ============
  async createPaymentForAppointment(appointmentId, paymentData) {
    if (appointmentId === undefined || appointmentId === null) {
      throw new Error("Appointment ID is required to create payment");
    }
    const response = await this.request(
      `/appointments/${appointmentId}/pay`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    );
    return response;
  }

  async mockCompletePayment(paymentCode, gateway, success, amount) {
    if (!paymentCode) {
      throw new Error("Payment code is required for mock payment");
    }
    const response = await this.request(`/payments/mock/complete`, {
      method: "POST",
      body: JSON.stringify({
        paymentCode,
        gateway,
        success,
        amount,
      }),
    });
    return response;
  }

  async getPaymentByCode(paymentCode) {
    if (!paymentCode) {
      throw new Error("Payment code is required");
    }
    const response = await this.request(`/payments/by-code/${paymentCode}`);
    return response;
  }

  async getPaymentByCodePublic(paymentCode) {
    if (!paymentCode) {
      throw new Error("Payment code is required");
    }
    const response = await this.request(`/payments/by-code/${paymentCode}`, {
      auth: false,
    });
    return response;
  }

  async getPaymentsByInvoice(invoiceId) {
    if (invoiceId === undefined || invoiceId === null) {
      throw new Error("Invoice ID is required");
    }
    const response = await this.request(
      `/payments/by-invoice/${invoiceId}`
    );
    return response;
  }

  async getInvoiceById(invoiceId) {
    if (invoiceId === undefined || invoiceId === null) {
      throw new Error("Invoice ID is required");
    }
    const response = await this.request(`/invoices/${invoiceId}`);
    return response;
  }

  async getInvoiceByCode(invoiceCode) {
    if (!invoiceCode) {
      throw new Error("Invoice code is required");
    }
    const response = await this.request(`/invoices/by-code/${invoiceCode}`);
    return response;
  }

  // Legacy methods for backward compatibility
  async bookService(serviceData) {
    return this.createAppointment(serviceData);
  }

  async getBookings() {
    return this.getMyAppointments();
  }

  async updateBooking(id, updateData) {
    return this.updateAppointment(id, updateData);
  }

  async cancelBooking(id) {
    return this.cancelAppointment(id, "Cancelled by user");
  }

  // ============ PACKAGE SUBSCRIPTIONS METHODS ============
  // 5.1. Xem danh sách gói dịch vụ của tôi
  async getMySubscriptions(statusFilter = null) {
    const url = statusFilter
      ? `/package-subscriptions/my-subscriptions?statusFilter=${statusFilter}`
      : "/package-subscriptions/my-subscriptions";
    const response = await this.request(url);
    return response;
  }

  // 5.2. Xem chi tiết subscription
  async getSubscriptionDetail(id) {
    const response = await this.request(`/package-subscriptions/${id}`);
    return response;
  }

  // 5.3. Xem usage (đã dùng bao nhiêu)
  async getSubscriptionUsage(id) {
    const response = await this.request(`/package-subscriptions/${id}/usage`);
    return response;
  }

  // 5.4. Xem subscriptions active cho 1 xe
  async getActiveSubscriptionsByVehicle(vehicleId) {
    const response = await this.request(
      `/package-subscriptions/vehicle/${vehicleId}/active`
    );
    return response;
  }

  // 5.5. Mua gói dịch vụ
  async purchasePackage(packageData) {
    const response = await this.request("/package-subscriptions/purchase", {
      method: "POST",
      body: JSON.stringify({
        packageId: packageData.packageId,
        vehicleId: packageData.vehicleId,
        paymentMethod: packageData.paymentMethod,
        paymentReference: packageData.paymentReference,
      }),
    });
    return response;
  }

  // 5.6. Hủy subscription
  async cancelSubscription(id, cancellationReason) {
    const response = await this.request(`/package-subscriptions/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({
        cancellationReason: cancellationReason,
      }),
    });
    return response;
  }

  // ============ LOOKUP DATA METHODS ============
  // 6.1. Danh sách hãng xe
  async getCarBrands() {
    const response = await this.request("/lookup/car-brands", { auth: false });
    return response;
  }

  // 6.2. Danh sách model theo hãng
  async getCarModelsByBrand(brandId) {
    const response = await this.request(
      `/lookup/car-models/by-brand/${brandId}`,
      { auth: false }
    );
    return response;
  }

  // 6.3. Danh sách trung tâm dịch vụ
  async getServiceCenters() {
    const response = await this.request("/service-centers", {
      auth: false,
    });
    return response;
  }
  async getActiveServiceCenters() {
    const response = await this.request("/service-centers/active", {
      auth: false,
    });
    return response;
  }

  // 6.x Active subscriptions by vehicle
  async getActiveSubscriptionsByVehicle(vehicleId) {
    if (!vehicleId) {
      throw new Error("Vehicle ID is required to fetch active subscriptions");
    }
    const response = await this.request(
      `/package-subscriptions/active-by-vehicle/${vehicleId}`
    );
    return response;
  }


  // 6.4. Time slots available (khung giờ trống)
  async getAvailableTimeSlots(serviceCenterId, date) {
    const response = await this.request(
      `/time-slots/available?centerId=${serviceCenterId}&date=${date}`,
      { auth: false }
    );
    return response;
  }

  // 6.5. Danh sách dịch vụ
  async getMaintenanceServices() {
    const response = await this.request("/lookup/maintenance-services", {
      auth: false,
    });
    return response;
  }

  // 6.6. Danh sách gói bảo dưỡng (public)
  async getMaintenancePackages(page = 1, pageSize = 10) {
    const response = await this.request(
      `/maintenance-packages?page=${page}&pageSize=${pageSize}`,
      { auth: false }
    );
    return response;
  }

  // 6.7. Gói bảo dưỡng phổ biến
  async getPopularPackages(topCount = 5) {
    const response = await this.request(
      `/maintenance-packages/popular?topCount=${topCount}`,
      { auth: false }
    );
    return response;
  }

  // 6.8. Chi tiết gói bảo dưỡng
  async getPackageDetail(id) {
    const response = await this.request(`/maintenance-packages/${id}`, {
      auth: false,
    });
    return response;
  }

  // 6.9. Loại khách hàng (Customer Types)
  async getCustomerTypes() {
    const response = await this.request("/customer-types", { auth: false });
    return response;
  }

  // Legacy method
  async getServices() {
    return this.getMaintenanceServices();
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
    const response = await this.request("/cart");
    return response;
  }

  async addToCart(productId, quantity = 1) {
    const response = await this.request("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    return response;
  }

  async updateCartItem(itemId, quantity) {
    const response = await this.request(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
    return response;
  }

  async removeFromCart(itemId) {
    const response = await this.request(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
    return response;
  }

  // ============ ORDER METHODS ============
  async createOrder(orderData) {
    const response = await this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    return response;
  }

  async getOrders() {
    const response = await this.request("/orders");
    return response;
  }

  async getOrder(id) {
    const response = await this.request(`/orders/${id}`);
    return response;
  }

  // ============ UTILITY METHODS ============
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  getToken() {
    // Ưu tiên accessToken (dùng trong axiosInterceptor), fallback về token
    return localStorage.getItem("accessToken") || localStorage.getItem("token");
  }

  getUser() {
    const user = localStorage.getItem("user");
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  getStoredUser() {
    return this.getUser();
  }

  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    console.log("Auth data cleared from localStorage");
  }

  setAuth(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
    console.log("Auth data saved to localStorage");
  }

  // ============ ERROR HANDLING UTILITY ============
  handleApiError(error) {
    if (error.message === "Network error - Cannot connect to server") {
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    }

    if (error.message === "Request timeout") {
      return "Yêu cầu quá thời gian chờ. Vui lòng thử lại.";
    }

    if (error.response) {
      const { status, data } = error.response;

      if (data && data.errorCode) {
        switch (data.errorCode) {
          case "INVALID_TOKEN":
            return "Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.";
          case "TOKEN_EXPIRED":
            return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
          case "ACCESS_DENIED":
            return "Bạn không có quyền thực hiện hành động này.";
          case "VALIDATION_ERROR":
            return data.message || "Dữ liệu không hợp lệ.";
          case "EMAIL_NOT_FOUND":
            return "Email không tồn tại trong hệ thống.";
          case "INVALID_CREDENTIALS":
            return "Tên đăng nhập hoặc mật khẩu không đúng.";
          case "USER_NOT_VERIFIED":
            return "Tài khoản chưa được xác thực email.";
          case "USER_ALREADY_EXISTS":
            return "Tài khoản đã tồn tại.";
          default:
            return data.message || "Có lỗi xảy ra. Vui lòng thử lại.";
        }
      }

      switch (status) {
        case 400:
          return data.message || "Yêu cầu không hợp lệ.";
        case 401:
          return "Bạn cần đăng nhập để thực hiện hành động này.";
        case 403:
          return "Bạn không có quyền thực hiện hành động này.";
        case 404:
          return "Không tìm thấy tài nguyên yêu cầu.";
        case 409:
          return data.message || "Dữ liệu đã tồn tại.";
        case 429:
          return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
        case 500:
          return "Lỗi máy chủ. Vui lòng thử lại sau.";
        default:
          return data.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      }
    }

    return error.message || "Có lỗi xảy ra. Vui lòng thử lại.";
  }
}

// Helper utilities for query string generation
const toPascalCase = (key) => {
  if (!key) {
    return "";
  }
  return String(key)
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("")
    .replace(/\s+/g, "");
};

const serializeQueryValue = (value) => {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
};

const buildQueryString = (params = {}) => {
  if (!params || typeof params !== "object") {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    const normalizedKey = toPascalCase(key);

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === "") {
          return;
        }
        searchParams.append(normalizedKey, serializeQueryValue(item));
      });
      return;
    }

    searchParams.append(normalizedKey, serializeQueryValue(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

// Tạo instance
const apiService = new UnifiedAPIService();

// ============ EXPORTED API OBJECTS ============
export const authAPI = {
  login: (credentials) => apiService.login(credentials),
  register: (userData) => apiService.register(userData),
  logout: () => apiService.logout(),
  getCurrentUser: () => apiService.getCurrentUser(),
  getProfile: () => apiService.getProfile(),
  updateProfile: (userData) => apiService.updateProfile(userData),
  changePassword: (passwordData) => apiService.changePassword(passwordData),
};

// Account API for customer profile management
export const accountAPI = {
  getProfile: () => apiService.getProfile(),
  updateProfile: (userData) => apiService.updateProfile(userData),
  changePassword: (passwordData) => apiService.changePassword(passwordData),
};

export const accountRecoveryService = {
  forgotPassword: async (email) => {
    return await apiService.forgotPassword(email);
  },
  resetPassword: async (data) => {
    return await apiService.resetPassword(data);
  },
};

export const socialAPI = {
  googleLogin: (credential) => apiService.googleLogin(credential),
  facebookLogin: (accessToken) => apiService.facebookLogin(accessToken),
};

export const emailVerificationAPI = {
  resendVerification: (email) => apiService.resendVerification(email),
  checkEmailStatus: (email) => apiService.checkEmailStatus(email),
  verifyEmail: (token, email) => apiService.verifyEmail(token, email),
};

export const usersAPI = {
  getAllUsers: () => apiService.getAllUsers(),
  getUser: (userId) => apiService.getUser(userId),
  updateUser: (userId, userData) => apiService.updateUser(userId, userData),
  deleteUser: (userId) => apiService.deleteUser(userId),
};

// ============ ADMIN CUSTOMERS API ============
export const customersAPI = {
  getCustomers: (params = {}) => {
    const queryString = buildQueryString(params);
    return apiService.request(`/customers${queryString}`);
  },
  getById: (customerId, params = {}) => {
    if (customerId === undefined || customerId === null) {
      throw new Error("Customer ID is required");
    }
    const queryString = buildQueryString(params);
    return apiService.request(`/customers/${customerId}${queryString}`);
  },
  create: (customerData) =>
    apiService.request("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    }),
  update: (customerId, customerData) => {
    if (customerId === undefined || customerId === null) {
      throw new Error("Customer ID is required");
    }
    return apiService.request(`/customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  },
  remove: (customerId) => {
    if (customerId === undefined || customerId === null) {
      throw new Error("Customer ID is required");
    }
    return apiService.request(`/customers/${customerId}`, {
      method: "DELETE",
    });
  },
  getStatistics: (params = {}) => {
    const queryString = buildQueryString(params);
    return apiService.request(`/customers/statistics${queryString}`);
  },
  getMaintenanceDue: (params = {}) => {
    const queryString = buildQueryString(params);
    return apiService.request(`/customers/maintenance-due${queryString}`);
  },
  getActive: (params = {}) => {
    const queryString = buildQueryString(params);
    return apiService.request(`/customers/active${queryString}`);
  },
};

// ============ CUSTOMER TYPES API ============
export const customerTypesAPI = {
  getAll: (params = {}) => {
    const queryString = buildQueryString(params);
    return apiService.request(`/customer-types${queryString}`);
  },
  getActive: (params = {}) => {
    const defaults = {
      page: 1,
      pageSize: 50,
      includeStats: false,
      ...params,
      isActive: true,
    };
    const queryString = buildQueryString(defaults);
    return apiService.request(`/customer-types${queryString}`);
  },
  getById: (typeId, params = {}) => {
    if (typeId === undefined || typeId === null) {
      throw new Error("Customer type ID is required");
    }
    const queryString = buildQueryString(params);
    return apiService.request(`/customer-types/${typeId}${queryString}`);
  },
  create: (typeData) =>
    apiService.request("/customer-types", {
      method: "POST",
      body: JSON.stringify(typeData),
    }),
  update: (typeId, typeData) => {
    if (typeId === undefined || typeId === null) {
      throw new Error("Customer type ID is required");
    }
    return apiService.request(`/customer-types/${typeId}`, {
      method: "PUT",
      body: JSON.stringify(typeData),
    });
  },
  remove: (typeId) => {
    if (typeId === undefined || typeId === null) {
      throw new Error("Customer type ID is required");
    }
    return apiService.request(`/customer-types/${typeId}`, {
      method: "DELETE",
    });
  },
};

// ============ CAR BRANDS & MODELS API - NEW ============
export const carBrandAPI = {
  getActiveBrands: () => apiService.getActiveBrands(),
  getAllBrands: (params) => apiService.getAllBrands(params),
};

export const carModelAPI = {
  getModelsByBrand: (brandId) => apiService.getModelsByBrand(brandId),
  getAllModels: (params) => apiService.getAllModels(params),
};

// ============ MY VEHICLES API ============
export const vehicleAPI = {
  getMyVehicles: () => apiService.getMyVehicles(),
  getVehicleDetail: (vehicleId) => apiService.getVehicleDetail(vehicleId),
  addVehicle: (vehicleData) => apiService.addVehicle(vehicleData),
  updateVehicle: (vehicleId, vehicleData) =>
    apiService.updateVehicle(vehicleId, vehicleData),
  deleteVehicle: (vehicleId) => apiService.deleteVehicle(vehicleId),
  canDeleteVehicle: (vehicleId) => apiService.canDeleteVehicle(vehicleId),
  // Legacy methods
  getCustomerVehicles: (params) => apiService.getCustomerVehicles(params),
  getVehicle: (vehicleId) => apiService.getVehicle(vehicleId),
};

// ============ APPOINTMENTS API ============
export const appointmentsAPI = {
  createAppointment: (appointmentData) =>
    apiService.createAppointment(appointmentData),
  getMyAppointments: () => apiService.getMyAppointments(),
  getUpcomingAppointments: (limit) => apiService.getUpcomingAppointments(limit),
  getAppointmentDetail: (id) => apiService.getAppointmentDetail(id),
  getAppointmentByCode: (code) => apiService.getAppointmentByCode(code),
  updateAppointment: (id, appointmentData) =>
    apiService.updateAppointment(id, appointmentData),
  rescheduleAppointment: (id, newSlotId, reason) =>
    apiService.rescheduleAppointment(id, newSlotId, reason),
  cancelAppointment: (id, cancellationReason) =>
    apiService.cancelAppointment(id, cancellationReason),
  deleteAppointment: (id) => apiService.deleteAppointment(id),
};

// ============ PACKAGE SUBSCRIPTIONS API ============
export const subscriptionsAPI = {
  getMySubscriptions: (statusFilter) =>
    apiService.getMySubscriptions(statusFilter),
  getSubscriptionDetail: (id) => apiService.getSubscriptionDetail(id),
  getSubscriptionUsage: (id) => apiService.getSubscriptionUsage(id),
  getActiveSubscriptionsByVehicle: (vehicleId) =>
    apiService.getActiveSubscriptionsByVehicle(vehicleId),
  purchasePackage: (packageData) => apiService.purchasePackage(packageData),
  cancelSubscription: (id, cancellationReason) =>
    apiService.cancelSubscription(id, cancellationReason),
};

// ============ LOOKUP DATA API ============
export const lookupAPI = {
  getCarBrands: () => apiService.getCarBrands(),
  getCarModelsByBrand: (brandId) => apiService.getCarModelsByBrand(brandId),
  getServiceCenters: () => apiService.getServiceCenters(),
  getActiveServiceCenters: () => apiService.getActiveServiceCenters(),
  getAvailableTimeSlots: (serviceCenterId, date) =>
    apiService.getAvailableTimeSlots(serviceCenterId, date),
  getMaintenanceServices: () => apiService.getMaintenanceServices(),
  getMaintenancePackages: (page, pageSize) =>
    apiService.getMaintenancePackages(page, pageSize),
  getPopularPackages: (topCount) => apiService.getPopularPackages(topCount),
  getPackageDetail: (id) => apiService.getPackageDetail(id),
  getCustomerTypes: () => apiService.getCustomerTypes(),
};

// Legacy service API for backward compatibility
export const serviceAPI = {
  bookService: (serviceData) => apiService.bookService(serviceData),
  getBookings: () => apiService.getBookings(),
  updateBooking: (id, updateData) => apiService.updateBooking(id, updateData),
  cancelBooking: (id) => apiService.cancelBooking(id),
  getServices: () => apiService.getServices(),
};

export const productAPI = {
  getProducts: (params) => apiService.getProducts(params),
  getProduct: (id) => apiService.getProduct(id),
};

export const cartAPI = {
  getCart: () => apiService.getCart(),
  addToCart: (productId, quantity) => apiService.addToCart(productId, quantity),
  updateCartItem: (itemId, quantity) =>
    apiService.updateCartItem(itemId, quantity),
  removeFromCart: (itemId) => apiService.removeFromCart(itemId),
};

export const orderAPI = {
  createOrder: (orderData) => apiService.createOrder(orderData),
  getOrders: () => apiService.getOrders(),
  getOrder: (id) => apiService.getOrder(id),
};

export const paymentAPI = {
  createPaymentForAppointment: (appointmentId, paymentData) =>
    apiService.createPaymentForAppointment(appointmentId, paymentData),
  mockCompletePayment: (paymentCode, gateway, success, amount) =>
    apiService.mockCompletePayment(paymentCode, gateway, success, amount),
  getPaymentByCodePublic: (paymentCode) =>
    apiService.getPaymentByCodePublic(paymentCode),
  getPaymentByCode: (paymentCode) =>
    apiService.getPaymentByCode(paymentCode),
  getPaymentsByInvoice: (invoiceId) =>
    apiService.getPaymentsByInvoice(invoiceId),
};

export const invoiceAPI = {
  getInvoiceById: (invoiceId) => apiService.getInvoiceById(invoiceId),
  getInvoiceByCode: (invoiceCode) => apiService.getInvoiceByCode(invoiceCode),
};

// ============ STAFF MANAGEMENT API ============
// Generic REST wrapper matching required endpoints
export const staffAPI = {
  // GET /api/staff?search=&role=&status=&page=&pageSize=
  list: (params = {}) => {
    const queryString = buildQueryString(params);
    return apiService.request(`/staff${queryString}`);
  },
  // GET /api/staff/:id
  getById: (id) => {
    if (id === undefined || id === null) throw new Error("Staff ID is required");
    return apiService.request(`/staff/${id}`);
  },
  // POST /api/staff
  create: (data) =>
    apiService.request(`/staff`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  // PUT /api/staff/:id
  update: (id, data) => {
    if (id === undefined || id === null) throw new Error("Staff ID is required");
    return apiService.request(`/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  // DELETE /api/staff/:id
  remove: (id) => {
    if (id === undefined || id === null) throw new Error("Staff ID is required");
    return apiService.request(`/staff/${id}`, { method: "DELETE" });
  },
  // PATCH /api/staff/:id/status
  updateStatus: (id, status) => {
    if (id === undefined || id === null) throw new Error("Staff ID is required");
    return apiService.request(`/staff/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

export const authUtils = {
  isAuthenticated: () => apiService.isAuthenticated(),
  getToken: () => apiService.getToken(),
  getUser: () => apiService.getUser(),
  getStoredUser: () => apiService.getStoredUser(),
  clearAuth: () => apiService.clearAuth(),
  setAuth: (token, user) => apiService.setAuth(token, user),
};

export const handleApiError = (error) => apiService.handleApiError(error);

export default apiService;
