// src/services/staffService.js
import api from './axiosInterceptor';

/**
 * Staff Service - Based on EVSC Staff Complete Workflow Postman Collection
 * Full E2E workflow: Appointment → Check-in → WorkOrder → Checklist → QC
 */

// ==================== APPOINTMENT MANAGEMENT ====================

/**
 * Lấy danh sách appointments (staff view)
 * @param {Object} params - { status, page, pageSize, startDate, endDate }
 */
export const getStaffAppointments = async (params = {}) => {
  const { data } = await api.get('/appointment-management', { params });
  return data;
};

/**
 * Lấy danh sách service centers đang hoạt động
 * GET /service-centers/active
 */
export const getActiveServiceCenters = async () => {
  const { data } = await api.get('/service-centers/active');
  return data;
};

/**
 * Lấy lịch hẹn theo service center và ngày
 * GET /appointment-management/by-service-center/{serviceCenterId}/date/{slotDate}
 */
export const getAppointmentsByDate = async (serviceCenterId, slotDate) => {
  if (!serviceCenterId) {
    throw new Error('Missing serviceCenterId for daily appointment fetch');
  }
  if (!slotDate) {
    throw new Error('Missing slotDate (YYYY-MM-DD) for daily appointment fetch');
  }
  const { data } = await api.get(
    `/appointment-management/by-service-center/${serviceCenterId}/date/${slotDate}`,
  );
  return data;
};

/**
 * Lấy chi tiết appointment
 * GET /appointment-management/{appointmentId}
 */
export const getAppointmentDetail = async (appointmentId) => {
  const { data } = await api.get(`/appointment-management/${appointmentId}`);
  return data;
};

/**
 * Xác nhận appointment (Staff confirm trước khi khách tới)
 * POST /appointment-management/{id}/confirm
 */
export const confirmAppointment = async (appointmentId, confirmData) => {
  const { data } = await api.post(
    `/appointment-management/${appointmentId}/confirm`,
    confirmData,
  );
  return data;
};

/**
 * Check-in appointment (tạo WorkOrder + Checklist tự động)
 * POST /appointment-management/{id}/check-in
 */
export const checkInAppointment = async (appointmentId) => {
  const { data } = await api.post(
    `/appointment-management/${appointmentId}/check-in`,
  );
  return data;
};

// ==================== WORK ORDER MANAGEMENT ====================

/**
 * Search work orders
 * GET /work-orders?SearchTerm={plate}&ServiceCenterId={id}
 */
export const searchWorkOrders = async (params = {}) => {
  const { data } = await api.get('/work-orders', { params });
  return data;
};

/**
 * Lấy chi tiết work order
 * GET /work-orders/{id}
 */
export const getWorkOrderDetail = async (workOrderId) => {
  const { data } = await api.get(`/work-orders/${workOrderId}`);
  return data;
};

/**
 * Auto-select best technician
 * POST /technicians/auto-assign/best
 */
export const autoSelectTechnician = async (assignData) => {
  const { data } = await api.post('/technicians/auto-assign/best', assignData);
  return data;
};

/**
 * Assign technician to work order
 * PATCH /work-orders/{id}/assign-technician/{technicianId}
 */
export const assignTechnician = async (workOrderId, technicianId) => {
  const { data } = await api.patch(
    `/work-orders/${workOrderId}/assign-technician/${technicianId}`,
  );
  return data;
};

/**
 * Start work order
 * POST /work-orders/{id}/start
 */
export const startWorkOrder = async (workOrderId) => {
  const { data } = await api.post(`/work-orders/${workOrderId}/start`);
  return data;
};

/**
 * Complete work order (sau khi checklist 100%)
 * POST /work-orders/{id}/complete
 */
export const completeWorkOrder = async (workOrderId) => {
  const { data } = await api.post(`/work-orders/${workOrderId}/complete`);
  return data;
};

// ==================== CHECKLIST MANAGEMENT ====================

/**
 * Lấy danh sách checklist templates
 * GET /checklist-templates?Page=1&PageSize=10
 */
export const getChecklistTemplates = async (params = {}) => {
  const { data } = await api.get('/checklist-templates', { params });
  return data;
};

/**
 * Lấy chi tiết template
 * GET /checklist-templates/{id}
 */
export const getTemplateDetail = async (templateId) => {
  const { data } = await api.get(`/checklist-templates/${templateId}`);
  return data;
};

/**
 * Apply checklist template to work order
 * POST /work-orders/{id}/apply-checklist
 */
export const applyChecklistTemplate = async (workOrderId, templateData) => {
  const { data } = await api.post(
    `/work-orders/${workOrderId}/apply-checklist`,
    templateData,
  );
  return data;
};

/**
 * Lấy checklist của work order
 * GET /checklists/work-orders/{workOrderId}
 */
export const getWorkOrderChecklist = async (workOrderId) => {
  const { data } = await api.get(`/checklists/work-orders/${workOrderId}`);
  return data;
};

/**
 * Complete checklist item
 * POST /checklists/items/complete
 */
export const completeChecklistItem = async (itemData) => {
  const { data } = await api.post('/checklists/items/complete', itemData);
  return data;
};

/**
 * Skip optional checklist item
 * POST /checklists/items/skip
 */
export const skipChecklistItem = async (skipData) => {
  const { data } = await api.post('/checklists/items/skip', skipData);
  return data;
};

/**
 * Update checklist item (status, notes, image)
 * PUT /checklist-items/{id}
 */
export const updateChecklistItem = async (itemId, updateData) => {
  const { data } = await api.put(`/checklist-items/${itemId}`, updateData);
  return data;
};

/**
 * Quick complete item
 * PATCH /checklist-items/{id}/complete
 * Body: raw string (not JSON object)
 */
export const quickCompleteItem = async (itemId, notes = '') => {
  const { data } = await api.patch(
    `/checklist-items/${itemId}/complete`,
    JSON.stringify(notes), // Send as raw JSON string
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return data;
};

/**
 * Uncomplete item (for testing/rollback)
 * PATCH /checklist-items/{id}/uncomplete
 */
export const uncompleteChecklistItem = async (itemId) => {
  const { data } = await api.patch(`/checklist-items/${itemId}/uncomplete`);
  return data;
};

/**
 * Bulk complete all items
 * POST /work-orders/{id}/complete-all
 */
export const bulkCompleteAllItems = async (workOrderId, notes) => {
  const { data } = await api.post(`/work-orders/${workOrderId}/complete-all`, {
    notes,
  });
  return data;
};

/**
 * Validate checklist (check if can complete work order)
 * GET /checklists/work-orders/{id}/validate
 */
export const validateChecklist = async (workOrderId) => {
  const { data } = await api.get(
    `/checklists/work-orders/${workOrderId}/validate`,
  );
  return data;
};

// ==================== QUALITY CHECK ====================

/**
 * Perform quality check
 * POST /work-orders/{id}/quality-check
 */
export const performQualityCheck = async (workOrderId, qcData) => {
  const { data } = await api.post(
    `/work-orders/${workOrderId}/quality-check`,
    qcData,
  );
  return data;
};

/**
 * Get quality check info
 * GET /work-orders/{id}/quality-check
 */
export const getQualityCheckInfo = async (workOrderId) => {
  const { data } = await api.get(`/work-orders/${workOrderId}/quality-check`);
  return data;
};

/**
 * Check if customer can rate
 * GET /work-orders/{id}/can-rate
 */
export const canRateWorkOrder = async (workOrderId) => {
  const { data } = await api.get(`/work-orders/${workOrderId}/can-rate`);
  return data;
};

// ==================== INVOICE ====================

/**
 * Get invoice by work order
 * GET /invoices/by-work-order/{workOrderId}
 */
export const getInvoiceByWorkOrder = async (workOrderId) => {
  const { data } = await api.get(`/invoices/by-work-order/${workOrderId}`);
  return data;
};

// ==================== TECHNICIANS ====================

/**
 * Lấy danh sách technicians
 */
export const getTechnicians = async () => {
  const { data } = await api.get('/technicians');
  return data;
};

/**
 * Lấy thống kê appointment theo trạng thái
 *
 */
export const getAppointmentStatistics = async () => {
  const { data } = await api.get(
    '/appointment-management/statistics/by-status',
  );
  return data;
};

export default {
  // Appointments
  getStaffAppointments,
  getAppointmentsByDate,
  getAppointmentDetail,
  confirmAppointment,
  checkInAppointment,
  getActiveServiceCenters,

  // Work Orders
  searchWorkOrders,
  getWorkOrderDetail,
  autoSelectTechnician,
  assignTechnician,
  startWorkOrder,
  completeWorkOrder,

  // Checklist Templates
  getChecklistTemplates,
  getTemplateDetail,
  applyChecklistTemplate,

  // Checklist Operations
  getWorkOrderChecklist,
  completeChecklistItem,
  skipChecklistItem,
  updateChecklistItem,
  quickCompleteItem,
  uncompleteChecklistItem,
  bulkCompleteAllItems,
  validateChecklist,

  // Quality Check
  performQualityCheck,
  getQualityCheckInfo,
  canRateWorkOrder,

  // Invoice
  getInvoiceByWorkOrder,

  // Technicians
  getTechnicians,

  // Statistics
  getAppointmentStatistics,
};
