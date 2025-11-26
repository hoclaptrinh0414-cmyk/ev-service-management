// src/services/technicianService.js
import api from './axiosInterceptor';

/**
 * Service for technician-specific workflows.
 */

// ==================== WORK ORDER OPERATIONS ====================

/**
 * Lấy danh sách work orders của technician đang đăng nhập
 * GET /api/work-orders/my-work-orders
 * @param {Object} params Query parameters for filtering (e.g., status)
 * @returns {Promise<Object>} The API response.
 */
export const getMyWorkOrders = async (params) => {
    const { data } = await api.get('/api/work-orders/my-work-orders', { params });
    return data;
};

/**
 * Lấy chi tiết một work order
 * GET /api/work-orders/{workOrderId}
 * @param {number} workOrderId The ID of the work order.
 * @returns {Promise<Object>} The API response.
 */
export const getWorkOrderDetail = async (workOrderId) => {
    const { data } = await api.get(`/api/work-orders/${workOrderId}`);
    return data;
};

/**
 * Bắt đầu một work order
 * POST /api/work-orders/{id}/start
 * (This endpoint is from the old code, assuming it exists in the new API)
 * @param {number} workOrderId The ID of the work order to start.
 * @returns {Promise<Object>} The API response.
 */
export const startWorkOrder = async (workOrderId) => {
    const { data } = await api.post(`/api/work-orders/${workOrderId}/start`);
    return data;
};

export default {
    getMyWorkOrders,
    getWorkOrderDetail,
    startWorkOrder,
};
