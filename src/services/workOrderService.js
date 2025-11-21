import api from './apiWrapper';

/**
 * Work Order Management Service
 * Based on actual API endpoints from backend
 */

// ==================== WORK ORDER CRUD ====================

// Get all work orders with filters
// API: GET /work-orders
// Parameters: WorkOrderCode, CustomerId, VehicleId, ServiceCenterId, TechnicianId,
//             StatusId, Priority, StartDateFrom, StartDateTo, CompletedDateFrom,
//             CompletedDateTo, RequiresApproval, QualityCheckRequired, SearchTerm,
//             PageNumber, PageSize, SortBy, SortDirection
export const getWorkOrders = async (params = {}) => {
  try {
    // Map frontend params to backend params
    const apiParams = {
      WorkOrderCode: params.workOrderCode || params.code,
      CustomerId: params.customerId,
      VehicleId: params.vehicleId,
      ServiceCenterId: params.serviceCenterId,
      TechnicianId: params.technicianId,
      StatusId: params.statusId || params.status,
      Priority: params.priority,
      StartDateFrom: params.startDateFrom || params.dateFrom,
      StartDateTo: params.startDateTo || params.dateTo,
      CompletedDateFrom: params.completedDateFrom,
      CompletedDateTo: params.completedDateTo,
      RequiresApproval: params.requiresApproval,
      QualityCheckRequired: params.qualityCheckRequired,
      SearchTerm: params.search || params.searchTerm,
      PageNumber: params.page || params.pageNumber || 1,
      PageSize: params.limit || params.pageSize || 20,
      SortBy: params.sortBy || 'CreatedDate',
      SortDirection: params.sortDirection || params.sortOrder || 'desc'
    };

    // Remove undefined values
    Object.keys(apiParams).forEach(key =>
      apiParams[key] === undefined && delete apiParams[key]
    );

    const response = await api.get('/work-orders', { params: apiParams });

    // Handle response format
    const data = response.data.data || response.data;

    return {
      success: response.data.success !== undefined ? response.data.success : true,
      items: data.items || data || [],
      totalPages: data.totalPages,
      totalItems: data.totalItems,
      currentPage: data.currentPage || apiParams.PageNumber
    };
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
};

// Get work order by ID
// API: GET /work-orders/{id}
export const getWorkOrderById = async (id) => {
  try {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching work order ${id}:`, error);
    throw error;
  }
};

// Get work order by code
export const getWorkOrderByCode = async (code) => {
  try {
    const response = await api.get(`/work-orders/code/${code}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching work order by code ${code}:`, error);
    throw error;
  }
};

// Create work order
// API: POST /work-orders
export const createWorkOrder = async (workOrderData) => {
  try {
    const response = await api.post('/work-orders', workOrderData);
    return response.data;
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
};

// Update work order
// API: PUT /work-orders/{id}
export const updateWorkOrder = async (id, workOrderData) => {
  try {
    const response = await api.put(`/work-orders/${id}`, workOrderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating work order ${id}:`, error);
    throw error;
  }
};

// Delete work order
// API: DELETE /work-orders/{id}
export const deleteWorkOrder = async (id) => {
  try {
    const response = await api.delete(`/work-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting work order ${id}:`, error);
    throw error;
  }
};

// ==================== WORK ORDER STATUS ====================

// Update work order status
export const updateWorkOrderStatus = async (id, statusId) => {
  try {
    const response = await api.put(`/work-orders/${id}/status`, { statusId });
    return response.data;
  } catch (error) {
    console.error(`Error updating work order status ${id}:`, error);
    throw error;
  }
};

// ==================== WORK ORDER LIFECYCLE ====================

// Start work order
export const startWorkOrder = async (id) => {
  try {
    const response = await api.post(`/work-orders/${id}/start`);
    return response.data;
  } catch (error) {
    console.error(`Error starting work order ${id}:`, error);
    throw error;
  }
};

// Complete work order
export const completeWorkOrder = async (id) => {
  try {
    const response = await api.post(`/work-orders/${id}/complete`);
    return response.data;
  } catch (error) {
    console.error(`Error completing work order ${id}:`, error);
    throw error;
  }
};

// Cancel work order
export const cancelWorkOrder = async (id, reason) => {
  try {
    const response = await api.post(`/work-orders/${id}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error(`Error cancelling work order ${id}:`, error);
    throw error;
  }
};

// ==================== TECHNICIAN ASSIGNMENT ====================

// Assign technician
export const assignTechnician = async (workOrderId, technicianId) => {
  try {
    const response = await api.post(`/work-orders/${workOrderId}/assign-technician`, {
      technicianId
    });
    return response.data;
  } catch (error) {
    console.error(`Error assigning technician to work order ${workOrderId}:`, error);
    throw error;
  }
};

// Unassign technician
export const unassignTechnician = async (workOrderId, technicianId) => {
  try {
    const response = await api.post(`/work-orders/${workOrderId}/unassign-technician`, {
      technicianId
    });
    return response.data;
  } catch (error) {
    console.error(`Error unassigning technician from work order ${workOrderId}:`, error);
    throw error;
  }
};

// ==================== TIMELINE & NOTES ====================

// Get work order timeline
export const getWorkOrderTimeline = async (id) => {
  try {
    const response = await api.get(`/work-orders/${id}/timeline`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching timeline for work order ${id}:`, error);
    throw error;
  }
};

// Add timeline entry
export const addTimelineEntry = async (id, entryData) => {
  try {
    const response = await api.post(`/work-orders/${id}/timeline`, entryData);
    return response.data;
  } catch (error) {
    console.error(`Error adding timeline entry to work order ${id}:`, error);
    throw error;
  }
};

// ==================== CHECKLIST ====================

// Get work order checklist
export const getWorkOrderChecklist = async (id) => {
  try {
    const response = await api.get(`/work-orders/${id}/checklist`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching checklist for work order ${id}:`, error);
    throw error;
  }
};

// ==================== QUALITY & RATING ====================

// Perform quality check
export const performQualityCheck = async (id, checkData) => {
  try {
    const response = await api.post(`/work-orders/${id}/quality-check`, checkData);
    return response.data;
  } catch (error) {
    console.error(`Error performing quality check for work order ${id}:`, error);
    throw error;
  }
};

// Get quality check result
export const getQualityCheck = async (id) => {
  try {
    const response = await api.get(`/work-orders/${id}/quality-check`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quality check for work order ${id}:`, error);
    throw error;
  }
};

// Add rating
export const addRating = async (id, ratingData) => {
  try {
    const response = await api.post(`/work-orders/${id}/rating`, ratingData);
    return response.data;
  } catch (error) {
    console.error(`Error adding rating to work order ${id}:`, error);
    throw error;
  }
};

const workOrderService = {
  getWorkOrders,
  getWorkOrderById,
  getWorkOrderByCode,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  updateWorkOrderStatus,
  startWorkOrder,
  completeWorkOrder,
  cancelWorkOrder,
  assignTechnician,
  unassignTechnician,
  getWorkOrderTimeline,
  addTimelineEntry,
  getWorkOrderChecklist,
  performQualityCheck,
  getQualityCheck,
  addRating,
};

export default workOrderService;
