import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://2bc85e2d7dea.ngrok-free.app/api";

// Create axios instance with default config
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          // Backend may wrap tokens inside { success, data: { ... } }
          const payload =
            response.data?.data ||
            response.data?.Data ||
            response.data ||
            {};

          const newAccessToken =
            payload.accessToken ||
            payload.AccessToken ||
            payload.token ||
            payload.Token;
          const newRefreshToken =
            payload.refreshToken || payload.RefreshToken;

          if (!newAccessToken || !newRefreshToken) {
            throw new Error('Invalid refresh response');
          }

          localStorage.setItem('token', newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return adminAPI(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== USER MANAGEMENT ====================
export const userAPI = {
  getAll: () => adminAPI.get('/users'),
  getById: (id) => adminAPI.get(`/users/${id}`),
  update: (id, data) => adminAPI.put(`/users/${id}`, data),
  delete: (id) => adminAPI.delete(`/users/${id}`),
};

// ==================== FINANCIAL REPORTS ====================
export const financialAPI = {
  getRevenue: (params) => adminAPI.get('/financial-reports/revenue', { params }),
  getRevenueToday: () => adminAPI.get('/financial-reports/revenue/today'),
  getRevenueThisMonth: () => adminAPI.get('/financial-reports/revenue/this-month'),
  getRevenueCompare: (params) => adminAPI.get('/financial-reports/revenue/compare', { params }),
  getPayments: (params) => adminAPI.get('/financial-reports/payments', { params }),
  getPaymentGatewayComparison: () => adminAPI.get('/financial-reports/payments/gateway-comparison'),
  getPaymentsToday: () => adminAPI.get('/financial-reports/payments/today'),
  getInvoices: (params) => adminAPI.get('/financial-reports/invoices', { params }),
  getOutstandingInvoices: () => adminAPI.get('/financial-reports/invoices/outstanding'),
  getInvoicesThisMonth: () => adminAPI.get('/financial-reports/invoices/this-month'),
  getDiscountAnalysis: () => adminAPI.get('/financial-reports/invoices/discount-analysis'),
};

// ==================== SERVICE CENTERS ====================
export const serviceCenterAPI = {
  getAll: (params) => adminAPI.get('/service-centers', { params }),
  getById: (id) => adminAPI.get(`/service-centers/${id}`),
  create: (data) => adminAPI.post('/service-centers', data),
  update: (id, data) => adminAPI.put(`/service-centers/${id}`, data),
  delete: (id) => adminAPI.delete(`/service-centers/${id}`),
  getByCode: (code) => adminAPI.get(`/service-centers/by-code/${code}`),
  getActive: () => adminAPI.get('/service-centers/active'),
  getByProvince: (province) => adminAPI.get(`/service-centers/by-province/${province}`),
  search: (params) => adminAPI.get('/service-centers/search', { params }),
  getStatistics: (id) => adminAPI.get(`/service-centers/${id}/statistics`),
  getAvailability: (id, params) => adminAPI.get(`/service-centers/${id}/availability`, { params }),
};

// ==================== INVENTORY MANAGEMENT ====================
export const inventoryAPI = {
  getAll: (params) => adminAPI.get('/inventory', { params }),
  getByPartAndCenter: (partId, centerId) => adminAPI.get(`/inventory/part/${partId}/center/${centerId}`),
  getLowStockAlerts: () => adminAPI.get('/inventory/low-stock-alerts'),
  getTotalValue: () => adminAPI.get('/inventory/total-value'),
  reserve: (data) => adminAPI.post('/inventory/reserve', data),
  release: (data) => adminAPI.post('/inventory/release', data),
};

export const stockTransactionAPI = {
  getAll: (params) => adminAPI.get('/stock-transactions', { params }),
  getById: (id) => adminAPI.get(`/stock-transactions/${id}`),
  getRecentByPart: (partId) => adminAPI.get(`/stock-transactions/part/${partId}/recent`),
  getMovementSummary: (params) => adminAPI.get('/stock-transactions/movement-summary', { params }),
};

// ==================== APPOINTMENTS ====================
export const appointmentAPI = {
  getAll: (params) => adminAPI.get('/appointment-management', { params }),
  getById: (id) => adminAPI.get(`/appointment-management/${id}`),
  create: (data) => adminAPI.post('/appointment-management', data),
  update: (id, data) => adminAPI.put(`/appointment-management/${id}`, data),
  delete: (id) => adminAPI.delete(`/appointment-management/${id}`),
  getByServiceCenter: (centerId, date) => adminAPI.get(`/appointment-management/by-service-center/${centerId}/date/${date}`),
  getByCustomer: (customerId) => adminAPI.get(`/appointment-management/by-customer/${customerId}`),
  confirm: (id) => adminAPI.post(`/appointment-management/${id}/confirm`),
  markNoShow: (id) => adminAPI.post(`/appointment-management/${id}/mark-no-show`),
  checkIn: (id) => adminAPI.post(`/appointment-management/${id}/check-in`),
  cancel: (id) => adminAPI.post(`/appointment-management/${id}/cancel`),
  complete: (id) => adminAPI.post(`/appointment-management/${id}/complete`),
  getStatisticsByStatus: () => adminAPI.get('/appointment-management/statistics/by-status'),
  getMetrics: {
    paymentHealth: () => adminAPI.get('/appointment-management/metrics/payment-health'),
    subscriptionUsage: () => adminAPI.get('/appointment-management/metrics/subscription-usage'),
    degradation: () => adminAPI.get('/appointment-management/metrics/degradation'),
    cancellation: () => adminAPI.get('/appointment-management/metrics/cancellation'),
  },
};

// ==================== MAINTENANCE PACKAGES ====================
export const maintenancePackageAPI = {
  getAll: (params) => adminAPI.get('/maintenance-packages', { params }),
  getById: (id) => adminAPI.get(`/maintenance-packages/${id}`),
  create: (data) => adminAPI.post('/maintenance-packages', data),
  update: (id, data) => adminAPI.put(`/maintenance-packages/${id}`, data),
  delete: (id) => adminAPI.delete(`/maintenance-packages/${id}`),
  getByCode: (code) => adminAPI.get(`/maintenance-packages/code/${code}`),
  getPopular: () => adminAPI.get('/maintenance-packages/popular'),
  getRecommended: () => adminAPI.get('/maintenance-packages/recommended'),
  canDelete: (id) => adminAPI.get(`/maintenance-packages/${id}/can-delete`),
};

// ==================== MAINTENANCE SERVICES ====================
export const maintenanceServiceAPI = {
  getAll: (params) => adminAPI.get('/maintenance-services', { params }),
  getById: (id) => adminAPI.get(`/maintenance-services/${id}`),
  create: (data) => adminAPI.post('/maintenance-services', data),
  update: (id, data) => adminAPI.put(`/maintenance-services/${id}`, data),
  delete: (id) => adminAPI.delete(`/maintenance-services/${id}`),
  getActive: () => adminAPI.get('/maintenance-services/active'),
  getByCategory: (categoryId) => adminAPI.get(`/maintenance-services/by-category/${categoryId}`),
  canDelete: (id) => adminAPI.get(`/maintenance-services/${id}/can-delete`),
  search: (params) => adminAPI.get('/maintenance-services/search', { params }),
};

// ==================== SERVICE CATEGORIES ====================
export const serviceCategoryAPI = {
  getAll: (params) => adminAPI.get('/service-categories', { params }),
  getById: (id) => adminAPI.get(`/service-categories/${id}`),
  create: (data) => adminAPI.post('/service-categories', data),
  update: (id, data) => adminAPI.put(`/service-categories/${id}`, data),
  delete: (id) => adminAPI.delete(`/service-categories/${id}`),
  getActive: () => adminAPI.get('/service-categories/active'),
  canDelete: (id) => adminAPI.get(`/service-categories/${id}/can-delete`),
};

// ==================== MODEL SERVICE PRICINGS ====================
export const pricingAPI = {
  getAll: (params) => adminAPI.get('/model-service-pricings', { params }),
  getById: (id) => adminAPI.get(`/model-service-pricings/${id}`),
  create: (data) => adminAPI.post('/model-service-pricings', data),
  update: (id, data) => adminAPI.put(`/model-service-pricings/${id}`, data),
  delete: (id) => adminAPI.delete(`/model-service-pricings/${id}`),
  getByModel: (modelId) => adminAPI.get(`/model-service-pricings/by-model/${modelId}`),
  getByService: (serviceId) => adminAPI.get(`/model-service-pricings/by-service/${serviceId}`),
  getActive: () => adminAPI.get('/model-service-pricings/active'),
};

// ==================== TECHNICIANS ====================
export const technicianAPI = {
  getAll: (params) => adminAPI.get('/technicians', { params }),
  getById: (id) => adminAPI.get(`/technicians/${id}`),
  getSchedule: (id) => adminAPI.get(`/technicians/${id}/schedule`),
  getSkills: (id) => adminAPI.get(`/technicians/${id}/skills`),
  getPerformance: (id) => adminAPI.get(`/technicians/${id}/performance`),
  addSkill: (id, data) => adminAPI.post(`/technicians/${id}/skills`, data),
  removeSkill: (techId, skillId) => adminAPI.delete(`/technicians/${techId}/skills/${skillId}`),
  verifySkill: (techId, skillId, data) => adminAPI.post(`/technicians/${techId}/skills/${skillId}/verify`, data),
  getAvailable: (params) => adminAPI.get('/technicians/available', { params }),
  autoAssignBest: (data) => adminAPI.post('/technicians/auto-assign/best', data),
  getWorkloadBalance: (centerId) => adminAPI.get(`/technicians/workload-balance/${centerId}`),
};

// ==================== CAR BRANDS ====================
export const carBrandAPI = {
  getAll: (params) => adminAPI.get('/car-brands', { params }),
  getById: (id) => adminAPI.get(`/car-brands/${id}`),
  create: (data) => adminAPI.post('/car-brands', data),
  update: (id, data) => adminAPI.put(`/car-brands/${id}`, data),
  delete: (id) => adminAPI.delete(`/car-brands/${id}`),
  getActive: () => adminAPI.get('/car-brands/active'),
  getByCountry: (country) => adminAPI.get(`/car-brands/by-country/${country}`),
  search: (params) => adminAPI.get('/car-brands/search', { params }),
  getStatistics: (id) => adminAPI.get(`/car-brands/${id}/statistics`),
};

// ==================== CAR MODELS ====================
export const carModelAPI = {
  getAll: (params) => adminAPI.get('/car-models', { params }),
  getById: (id) => adminAPI.get(`/car-models/${id}`),
  create: (data) => adminAPI.post('/car-models', data),
  update: (id, data) => adminAPI.put(`/car-models/${id}`, data),
  delete: (id) => adminAPI.delete(`/car-models/${id}`),
  getActive: () => adminAPI.get('/car-models/active'),
  getByBrand: (brandId) => adminAPI.get(`/car-models/by-brand/${brandId}`),
  search: (params) => adminAPI.get('/car-models/search', { params }),
  getStatistics: (id) => adminAPI.get(`/car-models/${id}/statistics`),
};

// ==================== CUSTOMERS ====================
export const customerAPI = {
  getAll: (params) => adminAPI.get('/customers', { params }),
  getById: (id) => adminAPI.get(`/customers/${id}`),
  create: (data) => adminAPI.post('/customers', data),
  update: (id, data) => adminAPI.put(`/customers/${id}`, data),
  delete: (id) => adminAPI.delete(`/customers/${id}`),
  getByCode: (code) => adminAPI.get(`/customers/by-code/${code}`),
  getByPhone: (phone) => adminAPI.get('/customers/by-phone', { params: { phone } }),
  getActive: () => adminAPI.get('/customers/active'),
  getMaintenanceDue: () => adminAPI.get('/customers/maintenance-due'),
  getStatistics: () => adminAPI.get('/customers/statistics'),
};

// ==================== WORK ORDERS ====================
export const workOrderAPI = {
  getAll: (params) => adminAPI.get('/work-orders', { params }),
  getById: (id) => adminAPI.get(`/work-orders/${id}`),
  create: (data) => adminAPI.post('/work-orders', data),
  update: (id, data) => adminAPI.put(`/work-orders/${id}`, data),
  delete: (id) => adminAPI.delete(`/work-orders/${id}`),
  getByCode: (code) => adminAPI.get(`/work-orders/by-code/${code}`),
  updateStatus: (id, status) => adminAPI.patch(`/work-orders/${id}/status`, { status }),
  assignTechnician: (id, technicianId) => adminAPI.patch(`/work-orders/${id}/assign-technician/${technicianId}`),
  start: (id) => adminAPI.post(`/work-orders/${id}/start`),
  complete: (id) => adminAPI.post(`/work-orders/${id}/complete`),
  getTimeline: (id) => adminAPI.get(`/work-orders/${id}/timeline`),
};

export default adminAPI;
