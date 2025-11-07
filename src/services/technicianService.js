// src/services/technicianService.js
import apiService from './apiService';

/**
 * Technician Service
 * Tổng hợp các API cho Technician role
 * Tham khảo: README_FE_Technician_Flow.md
 */
const technicianService = {
  // ============ ATTENDANCE APIs ============
  
  /**
   * Lấy thông tin ca làm việc hôm nay
   * GET /api/technicians/attendance/today
   */
  async getTodayShift() {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: '/technicians/attendance/today',
        auth: true
      });
      console.log('✅ Get today shift success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get today shift failed:', error);
      throw error;
    }
  },

  /**
   * Check-in vào ca làm việc
   * POST /api/technicians/attendance/check-in
   * @param {Object} data
   * @param {number} data.serviceCenterId - ID của service center
   * @param {string} data.shiftType - Loại ca ('FullDay', 'Morning', 'Afternoon')
   * @param {string} data.notes - Ghi chú check-in
   */
  async checkIn(data) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: '/technicians/attendance/check-in',
        body: {
          serviceCenterId: data.serviceCenterId,
          shiftType: data.shiftType || 'FullDay',
          notes: data.notes || 'Check-in via Technician App'
        },
        auth: true
      });
      console.log('✅ Check-in success:', response);
      return response;
    } catch (error) {
      console.error('❌ Check-in failed:', error);
      throw error;
    }
  },

  /**
   * Check-out khỏi ca làm việc
   * POST /api/technicians/attendance/check-out
   * @param {Object} data
   * @param {string} data.notes - Ghi chú check-out
   * @param {string} data.earlyCheckoutReason - Lý do check-out sớm (nếu có)
   */
  async checkOut(data = {}) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: '/technicians/attendance/check-out',
        body: {
          notes: data.notes || 'Check-out via Technician App',
          earlyCheckoutReason: data.earlyCheckoutReason || null
        },
        auth: true
      });
      console.log('✅ Check-out success:', response);
      return response;
    } catch (error) {
      console.error('❌ Check-out failed:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử các ca làm việc
   * GET /api/technicians/attendance/my-shifts
   * @param {Object} params - Query parameters
   * @param {number} params.Page - Số trang
   * @param {number} params.PageSize - Số items/trang
   * @param {string} params.FromDate - Từ ngày (ISO format)
   * @param {string} params.ToDate - Đến ngày (ISO format)
   */
  async getMyShifts(params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: '/technicians/attendance/my-shifts',
        params: params,
        auth: true
      });
      console.log('✅ Get my shifts success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my shifts failed:', error);
      throw error;
    }
  },

  // ============ WORK ORDER APIs ============

  /**
   * Lấy danh sách work orders được assign
   * GET /api/technicians/my-work-orders
   * @param {Object} params - Query parameters
   * @param {number} params.StatusId - Lọc theo status
   * @param {number} params.Page - Số trang
   * @param {number} params.PageSize - Số items/trang
   */
  async getMyWorkOrders(params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: '/technicians/my-work-orders',
        params: params,
        auth: true
      });
      console.log('✅ Get my work orders success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my work orders failed:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết work order
   * GET /api/technicians/work-orders/{workOrderId}
   */
  async getWorkOrderDetail(workOrderId) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: `/technicians/work-orders/${workOrderId}`,
        auth: true
      });
      console.log('✅ Get work order detail success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get work order detail failed:', error);
      throw error;
    }
  },

  /**
   * Bắt đầu work order
   * POST /api/technicians/work-orders/{workOrderId}/start
   * @param {number} workOrderId
   * @param {string} notes - Ghi chú khi bắt đầu
   */
  async startWorkOrder(workOrderId, notes = '') {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: `/technicians/work-orders/${workOrderId}/start`,
        body: { notes: notes || 'Started via Technician App' },
        auth: true
      });
      console.log('✅ Start work order success:', response);
      return response;
    } catch (error) {
      console.error('❌ Start work order failed:', error);
      throw error;
    }
  },

  /**
   * Hoàn thành work order
   * POST /api/technicians/work-orders/{workOrderId}/complete
   * @param {number} workOrderId
   * @param {Object} data
   * @param {string} data.notes - Ghi chú khi hoàn thành
   * @param {string} data.technicianRemarks - Nhận xét của technician
   */
  async completeWorkOrder(workOrderId, data = {}) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: `/technicians/work-orders/${workOrderId}/complete`,
        body: {
          notes: data.notes || 'Completed via Technician App',
          technicianRemarks: data.technicianRemarks || ''
        },
        auth: true
      });
      console.log('✅ Complete work order success:', response);
      return response;
    } catch (error) {
      console.error('❌ Complete work order failed:', error);
      throw error;
    }
  },

  // ============ CHECKLIST APIs ============

  /**
   * Lấy danh sách checklist của work order
   * GET /api/technicians/work-orders/{workOrderId}/checklist
   */
  async getWorkOrderChecklist(workOrderId) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: `/technicians/work-orders/${workOrderId}/checklist`,
        auth: true
      });
      console.log('✅ Get checklist success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get checklist failed:', error);
      throw error;
    }
  },

  /**
   * Hoàn thành một checklist item
   * POST /api/technicians/checklist/{checklistItemId}/complete
   * @param {number} checklistItemId
   * @param {Object} data
   * @param {string} data.notes - Ghi chú
   */
  async completeChecklistItem(checklistItemId, data = {}) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: `/technicians/checklist/${checklistItemId}/complete`,
        body: {
          notes: data.notes || ''
        },
        auth: true
      });
      console.log('✅ Complete checklist item success:', response);
      return response;
    } catch (error) {
      console.error('❌ Complete checklist item failed:', error);
      throw error;
    }
  },

  /**
   * Bỏ qua một checklist item
   * POST /api/technicians/checklist/{checklistItemId}/skip
   * @param {number} checklistItemId
   * @param {Object} data
   * @param {string} data.reason - Lý do bỏ qua
   */
  async skipChecklistItem(checklistItemId, data = {}) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: `/technicians/checklist/${checklistItemId}/skip`,
        body: {
          reason: data.reason || 'Skipped'
        },
        auth: true
      });
      console.log('✅ Skip checklist item success:', response);
      return response;
    } catch (error) {
      console.error('❌ Skip checklist item failed:', error);
      throw error;
    }
  },

  /**
   * Validate toàn bộ checklist
   * POST /api/technicians/work-orders/{workOrderId}/checklist/validate
   */
  async validateChecklist(workOrderId) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: `/technicians/work-orders/${workOrderId}/checklist/validate`,
        auth: true
      });
      console.log('✅ Validate checklist success:', response);
      return response;
    } catch (error) {
      console.error('❌ Validate checklist failed:', error);
      throw error;
    }
  },

  // ============ SELF-SERVICE APIs ============

  /**
   * Lấy lịch làm việc của tôi
   * GET /api/technicians/my-schedule
   * @param {Object} params
   * @param {string} params.startDate - Từ ngày (format: YYYY-MM-DD)
   * @param {string} params.endDate - Đến ngày (format: YYYY-MM-DD)
   */
  async getMySchedule(params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: '/technicians/my-schedule',
        params: params,
        auth: true
      });
      console.log('✅ Get my schedule success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my schedule failed:', error);
      throw error;
    }
  },

  /**
   * Lấy performance metrics
   * GET /api/technicians/my-performance
   * @param {Object} params
   * @param {string} params.periodStart - Ngày bắt đầu (format: ISO DateTime)
   * @param {string} params.periodEnd - Ngày kết thúc (format: ISO DateTime)
   */
  async getMyPerformance(params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: '/technicians/my-performance',
        params: params,
        auth: true
      });
      console.log('✅ Get my performance success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my performance failed:', error);
      throw error;
    }
  },

  /**
   * Lấy ratings/reviews của tôi
   * GET /api/technicians/my-ratings
   * @param {Object} params
   * @param {number} params.minRating - Lọc rating tối thiểu (1-5)
   * @param {string} params.startDate - Từ ngày (format: YYYY-MM-DD)
   * @param {string} params.endDate - Đến ngày (format: YYYY-MM-DD)
   */
  async getMyRatings(params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: '/technicians/my-ratings',
        params: params,
        auth: true
      });
      console.log('✅ Get my ratings success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my ratings failed:', error);
      throw error;
    }
  },

  /**
   * Request time-off
   * POST /api/technicians/request-time-off
   * @param {Object} data
   * @param {number} data.technicianId - ID của technician
   * @param {string} data.startDate - Ngày bắt đầu (format: YYYY-MM-DD)
   * @param {string} data.endDate - Ngày kết thúc (format: YYYY-MM-DD)
   * @param {string} data.reason - Lý do nghỉ phép
   * @param {string} data.timeOffType - Loại nghỉ phép
   * @param {string} data.notes - Ghi chú thêm
   */
  async requestTimeOff(data) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: '/technicians/request-time-off',
        body: {
          technicianId: data.technicianId,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
          timeOffType: data.timeOffType || 'Annual',
          notes: data.notes || ''
        },
        auth: true
      });
      console.log('✅ Request time-off success:', response);
      return response;
    } catch (error) {
      console.error('❌ Request time-off failed:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử time-off requests
   * GET /api/technicians/time-off/my-requests
   */
  async getMyTimeOffRequests(params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: '/technicians/time-off/my-requests',
        params: params,
        auth: true
      });
      console.log('✅ Get my time-off requests success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get my time-off requests failed:', error);
      throw error;
    }
  },

  // ============ TECHNICIAN MANAGEMENT APIs ============
  
  /**
   * Lấy danh sách technicians (Admin/Manager use)
   * GET /api/technicians
   * @param {Object} params
   * @param {number} params.ServiceCenterId - Lọc theo service center
   * @param {string} params.Department - Lọc theo department
   * @param {string} params.SkillName - Lọc theo kỹ năng
   * @param {string} params.MinSkillLevel - Level tối thiểu
   * @param {boolean} params.IsActive - Lọc active/inactive
   * @param {string} params.SearchTerm - Tìm kiếm
   * @param {string} params.SortBy - Sắp xếp theo field
   * @param {string} params.SortDirection - 'asc' hoặc 'desc'
   * @param {number} params.PageNumber - Số trang
   * @param {number} params.PageSize - Số items/trang
   */
  async getAllTechnicians(params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: '/technicians',
        params: params,
        auth: true
      });
      console.log('✅ Get all technicians success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get all technicians failed:', error);
      throw error;
    }
  },

  /**
   * Lấy schedule của một technician cụ thể (Admin/Manager use)
   * GET /api/technicians/{id}/schedule
   * @param {number} technicianId
   * @param {Object} params
   * @param {string} params.startDate - Từ ngày (format: YYYY-MM-DD)
   * @param {string} params.endDate - Đến ngày (format: YYYY-MM-DD)
   */
  async getTechnicianSchedule(technicianId, params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: `/technicians/${technicianId}/schedule`,
        params: params,
        auth: true
      });
      console.log('✅ Get technician schedule success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get technician schedule failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách skills của một technician
   * GET /api/technicians/{id}/skills
   * @param {number} technicianId
   */
  async getTechnicianSkills(technicianId) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: `/technicians/${technicianId}/skills`,
        auth: true
      });
      console.log('✅ Get technician skills success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get technician skills failed:', error);
      throw error;
    }
  },

  /**
   * Thêm skill mới cho technician
   * POST /api/technicians/{id}/skills
   * @param {number} technicianId
   * @param {Object} data
   * @param {string} data.skillName - Tên kỹ năng
   * @param {string} data.skillLevel - Level (Beginner, Intermediate, Advanced, Expert)
   * @param {string} data.certificationDate - Ngày chứng nhận (format: YYYY-MM-DD)
   * @param {string} data.expiryDate - Ngày hết hạn (format: YYYY-MM-DD)
   * @param {string} data.certifyingBody - Tổ chức cấp chứng chỉ
   * @param {string} data.certificationNumber - Số chứng chỉ
   * @param {string} data.notes - Ghi chú
   */
  async addTechnicianSkill(technicianId, data) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: `/technicians/${technicianId}/skills`,
        body: data,
        auth: true
      });
      console.log('✅ Add technician skill success:', response);
      return response;
    } catch (error) {
      console.error('❌ Add technician skill failed:', error);
      throw error;
    }
  },

  /**
   * Lấy performance của một technician cụ thể (Admin/Manager use)
   * GET /api/technicians/{id}/performance
   * @param {number} technicianId
   * @param {Object} params
   * @param {string} params.periodStart - Ngày bắt đầu (ISO DateTime)
   * @param {string} params.periodEnd - Ngày kết thúc (ISO DateTime)
   */
  async getTechnicianPerformance(technicianId, params = {}) {
    try {
      const response = await apiService.request({
        method: 'GET',
        endpoint: `/technicians/${technicianId}/performance`,
        params: params,
        auth: true
      });
      console.log('✅ Get technician performance success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get technician performance failed:', error);
      throw error;
    }
  },

  // ============ VEHICLE HEALTH APIs ============
  
  /**
   * Tạo vehicle health report
   * POST /api/vehicles/health
   * @param {Object} data
   * @param {number} data.vehicleId - ID của xe
   * @param {number} data.workOrderId - ID của work order
   * @param {number} data.batteryHealth - Sức khỏe pin (0-100)
   * @param {number} data.motorEfficiency - Hiệu suất động cơ (0-100)
   * @param {number} data.brakeWear - Mức độ mòn phanh (0-100)
   * @param {number} data.tireWear - Mức độ mòn lốp (0-100)
   * @param {number} data.overallCondition - Tình trạng tổng thể (0-100)
   * @param {string} data.diagnosticCodes - Mã chẩn đoán
   * @param {string} data.recommendations - Khuyến nghị
   * @param {string} data.nextCheckDue - Ngày kiểm tra tiếp theo (format: YYYY-MM-DD)
   */
  async createVehicleHealthReport(data) {
    try {
      const response = await apiService.request({
        method: 'POST',
        endpoint: '/vehicles/health',
        body: data,
        auth: true
      });
      console.log('✅ Create vehicle health report success:', response);
      return response;
    } catch (error) {
      console.error('❌ Create vehicle health report failed:', error);
      throw error;
    }
  }
};

export default technicianService;

