// src/services/productService.js
import axiosInstance from './axiosInterceptor';

/**
 * Product Service - Maintenance Services & Packages
 *
 * Maintenance Services = Individual products
 * Maintenance Packages = Combo products (bundles of services)
 */

// ==================== MAINTENANCE SERVICES (INDIVIDUAL PRODUCTS) ====================

/**
 * Get all maintenance services (individual products)
 * GET /api/maintenance-services?IsActive=true&PageSize=10
 */
export const getMaintenanceServices = async (params = {}) => {
  const { data } = await axiosInstance.get('/maintenance-services', { params });
  return data;
};

/**
 * Search maintenance services by model
 * GET /api/maintenance-services/search?modelId={modelId}&page=1&pageSize=10
 */
export const searchServicesByModel = async (modelId, params = {}) => {
  const { data } = await axiosInstance.get('/maintenance-services/search', {
    params: { modelId, ...params }
  });
  return data;
};

/**
 * Get maintenance service detail
 * GET /api/maintenance-services/{id}
 */
export const getServiceDetail = async (serviceId) => {
  const { data } = await axiosInstance.get(`/maintenance-services/${serviceId}`);
  return data;
};

// ==================== MAINTENANCE PACKAGES (COMBO PRODUCTS) ====================

/**
 * Get all maintenance packages (combos)
 * GET /api/maintenance-packages?Status=Active&PageSize=10
 */
export const getMaintenancePackages = async (params = {}) => {
  const { data } = await axiosInstance.get('/maintenance-packages', { params });
  return data;
};

/**
 * Get package detail
 * GET /api/maintenance-packages/{id}
 */
export const getPackageDetail = async (packageId) => {
  const { data } = await axiosInstance.get(`/maintenance-packages/${packageId}`);
  return data;
};

/**
 * Get recommended packages by model
 * GET /api/maintenance-packages/recommended?modelId={modelId}&topCount=5
 */
export const getRecommendedPackages = async (modelId, topCount = 5) => {
  const { data } = await axiosInstance.get('/maintenance-packages/recommended', {
    params: { modelId, topCount }
  });
  return data;
};

// ==================== PACKAGE SUBSCRIPTIONS ====================

/**
 * Purchase package subscription
 * POST /api/package-subscriptions/purchase
 */
export const purchasePackage = async (purchaseData) => {
  const { data } = await axiosInstance.post('/package-subscriptions/purchase', purchaseData);
  return data;
};

/**
 * Get my package subscriptions
 * GET /api/package-subscriptions/my-subscriptions?statusFilter=Active
 */
export const getMySubscriptions = async (params = {}) => {
  const { data } = await axiosInstance.get('/package-subscriptions/my-subscriptions', { params });
  return data;
};

/**
 * Get subscription detail
 * GET /api/package-subscriptions/{subscriptionId}
 */
export const getSubscriptionDetail = async (subscriptionId) => {
  const { data } = await axiosInstance.get(`/package-subscriptions/${subscriptionId}`);
  return data;
};

/**
 * Get subscription usage
 * GET /api/package-subscriptions/{subscriptionId}/usage
 */
export const getSubscriptionUsage = async (subscriptionId) => {
  const { data } = await axiosInstance.get(`/package-subscriptions/${subscriptionId}/usage`);
  return data;
};

/**
 * Get active subscriptions by vehicle
 * GET /api/package-subscriptions/vehicle/{vehicleId}/active
 */
export const getActiveSubscriptionsByVehicle = async (vehicleId) => {
  const { data } = await axiosInstance.get(`/package-subscriptions/vehicle/${vehicleId}/active`);
  return data;
};

export default {
  // Individual Services
  getMaintenanceServices,
  searchServicesByModel,
  getServiceDetail,

  // Combo Packages
  getMaintenancePackages,
  getPackageDetail,
  getRecommendedPackages,

  // Subscriptions
  purchasePackage,
  getMySubscriptions,
  getSubscriptionDetail,
  getSubscriptionUsage,
  getActiveSubscriptionsByVehicle,
};
