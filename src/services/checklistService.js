// src/services/checklistService.js
import api from './axiosInterceptor';

/**
 * Service for technician checklist workflow based on the provided API documentation.
 */

// ==================== CHECKLIST OPERATIONS ====================

/**
 * 1. Lấy danh sách checklist cho một work order
 * GET /api/work-orders/{id}/checklist
 * @param {number} workOrderId The ID of the work order.
 * @returns {Promise<Object>} The API response.
 */
export const getWorkOrderChecklist = async (workOrderId) => {
  const { data } = await api.get(`/api/work-orders/${workOrderId}/checklist`);
  return data;
};

/**
 * 2. Hoàn thành một mục trong checklist
 * POST /api/checklists/items/complete
 * @param {Object} payload The data for completing an item.
 * @param {number} payload.workOrderId The ID of the work order.
 * @param {number} payload.itemId The ID of the checklist item.
 * @param {string} payload.notes Notes from the technician.
 * @param {string[]} payload.photoUrls Array of photo URLs.
 * @returns {Promise<Object>} The API response.
 */
export const completeChecklistItem = async (payload) => {
  const { data } = await api.post('/api/checklists/items/complete', payload);
  return data;
};

/**
 * 3. Bỏ qua một mục tùy chọn trong checklist
 * POST /api/checklists/items/skip
 * @param {Object} payload The data for skipping an item.
 * @param {number} payload.workOrderId The ID of the work order.
 * @param {number} payload.itemId The ID of the checklist item.
 * @param {string} payload.skipReason The reason for skipping.
 * @returns {Promise<Object>} The API response.
 */
export const skipChecklistItem = async (payload) => {
  const { data } = await api.post('/api/checklists/items/skip', payload);
  return data;
};

/**
 * 4. Xác thực checklist trước khi hoàn tất
 * GET /api/checklists/work-orders/{workOrderId}/validate
 * @param {number} workOrderId The ID of the work order.
 * @returns {Promise<Object>} The validation result.
 */
export const validateChecklist = async (workOrderId) => {
  const { data } = await api.get(`/api/checklists/work-orders/${workOrderId}/validate`);
  return data;
};

/**
 * 5. Hoàn tất một work order
 * POST /api/work-orders/{id}/complete
 * @param {number} workOrderId The ID of the work order to complete.
 * @returns {Promise<Object>} The API response.
 */
export const completeWorkOrder = async (workOrderId) => {
  const { data } = await api.post(`/api/work-orders/${workOrderId}/complete`);
  return data;
};

/**
 * 6. Bulk complete tất cả các mục (Admin/Staff only)
 * POST /api/checklists/work-orders/{workOrderId}/complete-all
 * @param {number} workOrderId The ID of the work order.
 * @param {string} notes Notes for the bulk completion.
 * @returns {Promise<Object>} The API response.
 */
export const bulkCompleteAllItems = async (workOrderId, notes) => {
  const { data } = await api.post(`/api/checklists/work-orders/${workOrderId}/complete-all`, { notes });
  return data;
};


// ==================== OTHER USEFUL OPERATIONS (from existing code) ====================

/**
 * Hoàn tác một mục checklist (để sửa lỗi)
 * This endpoint was not in the user's document but exists in the old code.
 * Assuming a similar endpoint exists, like PATCH /api/checklists/items/{itemId}/uncomplete
 * @param {number} itemId The ID of the checklist item to uncomplete.
 * @returns {Promise<Object>} The API response.
 */
export const uncompleteChecklistItem = async (itemId) => {
  // NOTE: This endpoint path is an assumption based on the old code and REST principles.
  // It might need adjustment if the actual API endpoint is different.
  const { data } = await api.patch(`/api/checklists/items/${itemId}/uncomplete`);
  return data;
};

export default {
    getWorkOrderChecklist,
    completeChecklistItem,
    skipChecklistItem,
    validateChecklist,
    completeWorkOrder,
    bulkCompleteAllItems,
    uncompleteChecklistItem,
};
