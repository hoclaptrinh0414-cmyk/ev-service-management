// src/services/technicianService.js
import api from './api';

/**
 * Technician Service - API calls for technician portal
 */

// ============= WORK ORDERS =============

/**
 * Get all work orders assigned to current technician
 * @param {Object} params - Query parameters
 * @param {number} params.statusId - Filter by status ID (optional)
 * @param {string} params.startDate - Filter by start date (optional)
 * @param {string} params.endDate - Filter by end date (optional)
 * @returns {Promise} Work orders array
 */
export const getMyWorkOrders = async (params = {}) => {
  const response = await api.get('/api/technicians/my-work-orders', { params });
  return response.data;
};

/**
 * Get work order detail by ID
 * @param {number} id - Work order ID
 * @returns {Promise} Work order detail
 */
export const getWorkOrderDetail = async (id) => {
  const response = await api.get(`/api/work-orders/${id}`);
  return response.data;
};

/**
 * Update work order status
 * @param {number} id - Work order ID
 * @param {string} status - New status (In Progress, Completed, etc.)
 * @returns {Promise}
 */
export const updateWorkOrderStatus = async (id, status) => {
  const response = await api.patch(`/api/work-orders/${id}/status`, { status });
  return response.data;
};

// ============= CHECKLIST =============

/**
 * Get checklist for a work order
 * @param {number} workOrderId - Work order ID
 * @returns {Promise} Checklist items array
 */
export const getWorkOrderChecklist = async (workOrderId) => {
  const response = await api.get(`/api/work-orders/${workOrderId}/checklist`);
  return response.data;
};

/**
 * Mark checklist item as completed
 * @param {number} itemId - Checklist item ID
 * @returns {Promise}
 */
export const completeChecklistItem = async (itemId) => {
  const response = await api.patch(`/api/checklist-items/${itemId}/complete`);
  return response.data;
};

/**
 * Mark checklist item as incomplete
 * @param {number} itemId - Checklist item ID
 * @returns {Promise}
 */
export const uncompleteChecklistItem = async (itemId) => {
  const response = await api.patch(`/api/checklist-items/${itemId}/uncomplete`);
  return response.data;
};

// ============= ATTENDANCE =============

/**
 * Check in for work shift
 * @param {number} serviceCenterId - Service center ID
 * @param {string} shiftType - Shift type: "FullDay", "Morning", "Afternoon"
 * @param {string} notes - Optional notes
 * @returns {Promise} Shift data with shiftId, checkInTime, isLate
 */
export const checkIn = async (serviceCenterId = 1, shiftType = 'FullDay', notes = '') => {
  const response = await api.post('/api/technicians/attendance/check-in', {
    serviceCenterId,
    shiftType,
    notes
  });
  return response.data;
};

/**
 * Check out from work shift
 * @param {string} notes - Optional notes
 * @param {string} earlyCheckoutReason - Reason for early checkout (optional)
 * @returns {Promise} Shift data with checkOutTime, workedHours, status
 */
export const checkOut = async (notes = '', earlyCheckoutReason = null) => {
  const response = await api.post('/api/technicians/attendance/check-out', {
    notes,
    earlyCheckoutReason
  });
  return response.data;
};

// ============= QUALITY CONTROL =============

/**
 * Submit quality check report
 * @param {number} workOrderId - Work order ID
 * @param {Object} qcData - Quality check data
 * @returns {Promise}
 */
export const submitQualityCheck = async (workOrderId, qcData) => {
  const response = await api.post(`/api/work-orders/${workOrderId}/quality-check`, qcData);
  return response.data;
};

/**
 * Submit rating for work order
 * @param {number} workOrderId - Work order ID
 * @param {Object} ratingData - Rating data (rating, comment)
 * @returns {Promise}
 */
export const submitRating = async (workOrderId, ratingData) => {
  const response = await api.post(`/api/work-orders/${workOrderId}/rating`, ratingData);
  return response.data;
};

// ============= VEHICLE =============

/**
 * Update vehicle mileage
 * @param {number} vehicleId - Customer vehicle ID
 * @param {number} mileage - New mileage value
 * @returns {Promise}
 */
export const updateVehicleMileage = async (vehicleId, mileage) => {
  const response = await api.patch(`/api/customer-vehicles/${vehicleId}/mileage`, { mileage });
  return response.data;
};

// ============= STATISTICS =============

/**
 * Get technician dashboard statistics
 * This function is deprecated - use getMyWorkOrders() instead
 * @returns {Promise} Dashboard stats
 */
export const getTechnicianStats = async () => {
  // Use my-work-orders endpoint to calculate stats
  const response = await api.get('/api/technicians/my-work-orders');
  return response.data;
};

/**
 * Get today's attendance status
 * @returns {Promise} Attendance status
 */
export const getTodayAttendance = async () => {
  const response = await api.get('/api/technicians/attendance/today');
  return response.data;
};

/**
 * Get my shift history
 * @param {Object} params - Query parameters
 * @param {string} params.from - Start date (optional)
 * @param {string} params.to - End date (optional)
 * @returns {Promise} Shift history
 */
export const getMyShifts = async (params = {}) => {
  const response = await api.get('/api/technicians/attendance/my-shifts', { params });
  return response.data;
};

/**
 * Get my work schedule
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (optional)
 * @param {string} params.endDate - End date (optional)
 * @returns {Promise} Schedule data
 */
export const getMySchedule = async (params = {}) => {
  const response = await api.get('/api/technicians/my-schedule', { params });
  return response.data;
};

/**
 * Get my performance metrics
 * @param {Object} params - Query parameters
 * @param {string} params.periodStart - Period start date-time (optional)
 * @param {string} params.periodEnd - Period end date-time (optional)
 * @returns {Promise} Performance data
 */
export const getMyPerformance = async (params = {}) => {
  const response = await api.get('/api/technicians/my-performance', { params });
  return response.data;
};

/**
 * Get my ratings from customers
 * @param {Object} params - Query parameters
 * @param {number} params.minRating - Minimum rating filter (optional)
 * @param {string} params.startDate - Start date filter (optional)
 * @param {string} params.endDate - End date filter (optional)
 * @returns {Promise} Ratings array
 */
export const getMyRatings = async (params = {}) => {
  const response = await api.get('/api/technicians/my-ratings', { params });
  return response.data;
};

/**
 * Get work order timeline/history
 * @param {number} id - Work order ID
 * @returns {Promise} Timeline events
 */
export const getWorkOrderTimeline = async (id) => {
  const response = await api.get(`/api/work-orders/${id}/timeline`);
  return response.data;
};

/**
 * Complete all checklist items for a work order
 * @param {number} workOrderId - Work order ID
 * @returns {Promise}
 */
export const completeAllChecklist = async (workOrderId) => {
  const response = await api.post(`/api/work-orders/${workOrderId}/complete-all`);
  return response.data;
};

/**
 * Complete a work order
 * @param {number} id - Work order ID
 * @returns {Promise}
 */
export const completeWorkOrder = async (id) => {
  const response = await api.post(`/api/work-orders/${id}/complete`);
  return response.data;
};

/**
 * Start a work order
 * @param {number} id - Work order ID
 * @returns {Promise} Updated work order with status InProgress
 */
export const startWorkOrder = async (id) => {
  const response = await api.post(`/api/work-orders/${id}/start`);
  return response.data;
};

// ============= CHECKLIST - EXTENDED APIs =============

/**
 * Update checklist item (full update)
 * @param {number} itemId - Checklist item ID
 * @param {Object} data - Update data
 * @param {boolean} data.isCompleted - Completion status
 * @param {string} data.notes - Notes/comments
 * @param {string} data.imageUrl - Image URL (optional)
 * @returns {Promise} Updated item
 */
export const updateChecklistItem = async (itemId, data) => {
  const response = await api.put(`/api/checklist-items/${itemId}`, data);
  return response.data;
};

/**
 * Mark checklist item as completed (quick action)
 * @param {number} itemId - Checklist item ID
 * @param {string} notes - Quick notes (optional)
 * @returns {Promise} Updated item with completedBy, completedDate
 */
export const markItemComplete = async (itemId, notes = '') => {
  const response = await api.patch(`/api/checklist-items/${itemId}/complete`, 
    JSON.stringify(notes),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
  return response.data;
};

/**
 * Mark checklist item as incomplete (undo)
 * @param {number} itemId - Checklist item ID
 * @returns {Promise} Updated item with cleared completion data
 */
export const markItemIncomplete = async (itemId) => {
  const response = await api.patch(`/api/checklist-items/${itemId}/uncomplete`);
  return response.data;
};

/**
 * Complete item with validation
 * @param {number} itemId - Checklist item ID
 * @param {number} workOrderId - Work order ID
 * @param {string} notes - Detailed notes
 * @param {string} imageUrl - Image URL (optional)
 * @returns {Promise} Completed item
 */
export const completeItemWithValidation = async (itemId, workOrderId, notes, imageUrl = null) => {
  const response = await api.post('/api/items/complete', {
    itemId,
    workOrderId,
    notes,
    imageUrl
  });
  return response.data;
};

/**
 * Skip optional checklist item
 * @param {number} itemId - Checklist item ID
 * @param {number} workOrderId - Work order ID
 * @param {string} skipReason - Reason for skipping
 * @returns {Promise} Skipped item
 */
export const skipOptionalItem = async (itemId, workOrderId, skipReason) => {
  const response = await api.post('/api/items/skip', {
    itemId,
    workOrderId,
    skipReason
  });
  return response.data;
};

/**
 * Validate if work order can be completed
 * @param {number} workOrderId - Work order ID
 * @returns {Promise} Validation result with canComplete, missingItems
 */
export const validateWorkOrderCompletion = async (workOrderId) => {
  const response = await api.get(`/api/work-orders/${workOrderId}/validate`);
  return response.data;
};

/**
 * Bulk complete all checklist items
 * @param {number} workOrderId - Work order ID
 * @param {string} notes - Bulk completion notes
 * @returns {Promise} Result with totalItems, completedItems, failedItems
 */
export const bulkCompleteAllItems = async (workOrderId, notes = '') => {
  const response = await api.post(`/api/work-orders/${workOrderId}/complete-all`, {
    notes
  });
  return response.data;
};

// ============= ADD SERVICE TO WORK ORDER =============

/**
 * Get active maintenance services
 * @returns {Promise} Array of active services
 */
export const getActiveServices = async () => {
  const response = await api.get('/api/maintenance-services', {
    params: { isActive: true }
  });
  // Handle both response formats
  return response.data.items || response.data.data?.items || response.data.data || response.data;
};

/**
 * Add service to work order
 * @param {number} workOrderId - Work order ID
 * @param {number} serviceId - Service ID to add
 * @returns {Promise} Updated work order with services and amounts
 */
export const addServiceToWorkOrder = async (workOrderId, serviceId) => {
  const response = await api.post(`/api/work-orders/${workOrderId}/services/${serviceId}`);
  return response.data;
};

// ============= SELF-SERVICE =============

/**
 * Request time off
 * @param {Object} data - Time off request data
 * @param {number} data.technicianId - Technician ID
 * @param {string} data.startDate - Start date (YYYY-MM-DD)
 * @param {string} data.endDate - End date (YYYY-MM-DD)
 * @param {string} data.reason - Reason for time off
 * @param {string} data.timeOffType - Type: "AnnualLeave", "SickLeave", "Emergency", "Other"
 * @param {string} data.notes - Additional notes
 * @returns {Promise} Time off request result
 */
export const requestTimeOff = async (data) => {
  const response = await api.post('/api/technicians/request-time-off', data);
  return response.data;
};

const technicianService = {
  // Work Orders
  getMyWorkOrders,
  getWorkOrderDetail,
  updateWorkOrderStatus,
  startWorkOrder,
  completeWorkOrder,
  getWorkOrderTimeline,
  
  // Checklist - Basic
  getWorkOrderChecklist,
  completeChecklistItem,
  uncompleteChecklistItem,
  completeAllChecklist,
  
  // Checklist - Extended
  updateChecklistItem,
  markItemComplete,
  markItemIncomplete,
  completeItemWithValidation,
  skipOptionalItem,
  validateWorkOrderCompletion,
  bulkCompleteAllItems,
  
  // Attendance
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyShifts,
  
  // Self-Service
  getMySchedule,
  getMyPerformance,
  getMyRatings,
  requestTimeOff,
  
  // Services
  getActiveServices,
  addServiceToWorkOrder,
  
  // Legacy
  submitQualityCheck,
  submitRating,
  updateVehicleMileage,
  getTechnicianStats,
};

export default technicianService;
