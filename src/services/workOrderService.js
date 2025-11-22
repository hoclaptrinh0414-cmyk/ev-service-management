// src/services/workOrderService.js
import { workOrderAPI } from './api';

/**
 * Work Order & Rating Service
 */
export const workOrderService = {
  /**
   * LẤY CHI TIẾT WORK ORDER (có services) - DÙNG CHO "VIEW DETAILS"
   * GET /api/work-orders/{workOrderId}
   */
  async getWorkOrderDetails(workOrderId) {
    try {
      const response = await workOrderAPI.getWorkOrderById(workOrderId);
      console.log('Get work order details success:', response);
      return response;
    } catch (error) {
      console.error('Get work order details failed:', error);
      throw error;
    }
  },

  /**
   * KIỂM TRA CÓ THỂ RATE HAY KHÔNG - DÙNG CHO "RATE"
   * GET /api/work-orders/{workOrderId}/can-rate
   */
  async canRateWorkOrder(workOrderId) {
    try {
      const response = await workOrderAPI.canRateWorkOrder(workOrderId);
      console.log('Can rate check success:', response);
      return response;
    } catch (error) {
      console.error('Can rate check failed:', error);
      throw error;
    }
  },

  /**
   * GỬI ĐÁNH GIÁ
   */
  async submitRating(workOrderId, ratingData) {
    try {
      const response = await workOrderAPI.submitRating(workOrderId, {
        overallRating: ratingData.overallRating,
        serviceQuality: ratingData.serviceQuality || ratingData.overallRating,
        staffProfessionalism: ratingData.staffProfessionalism || ratingData.overallRating,
        facilityQuality: ratingData.facilityQuality || ratingData.overallRating,
        waitingTime: ratingData.waitingTime || ratingData.overallRating,
        priceValue: ratingData.priceValue || ratingData.overallRating,
        communicationQuality: ratingData.communicationQuality || ratingData.overallRating,
        positiveFeedback: ratingData.positiveFeedback || '',
        negativeFeedback: ratingData.negativeFeedback || '',
        wouldRecommend: ratingData.wouldRecommend !== undefined ? ratingData.wouldRecommend : true,
        wouldReturn: ratingData.wouldReturn !== undefined ? ratingData.wouldReturn : true,
      });
      console.log('Submit rating success:', response);
      return response;
    } catch (error) {
      console.error('Submit rating failed:', error);
      throw error;
    }
  },
  /**
   * LẤY CHECKLIST CỦA WORK ORDER
   * GET /api/work-orders/{workOrderId}/checklist
   */
  async getChecklist(workOrderId) {
    try {
      const response = await workOrderAPI.getChecklist(workOrderId);
      return response;
    } catch (error) {
      console.error('Get checklist failed:', error);
      throw error;
    }
  },

  /**
   * HOÀN THÀNH 1 CHECKLIST ITEM
   * POST /api/checklists/items/complete
   */
  async completeChecklistItem(data) {
    try {
      const response = await workOrderAPI.completeChecklistItem(data);
      return response;
    } catch (error) {
      console.error('Complete checklist item failed:', error);
      throw error;
    }
  },

  /**
   * BỎ QUA 1 CHECKLIST ITEM (OPTIONAL)
   * POST /api/checklists/items/skip
   */
  async skipChecklistItem(data) {
    try {
      const response = await workOrderAPI.skipChecklistItem(data);
      return response;
    } catch (error) {
      console.error('Skip checklist item failed:', error);
      throw error;
    }
  },

  /**
   * VALIDATE CHECKLIST TRƯỚC KHI COMPLETE WORK ORDER
   * GET /api/checklists/work-orders/{workOrderId}/validate
   */
  async validateChecklist(workOrderId) {
    try {
      const response = await workOrderAPI.validateChecklist(workOrderId);
      return response;
    } catch (error) {
      console.error('Validate checklist failed:', error);
      throw error;
    }
  },

  /**
   * HOÀN TẤT WORK ORDER
   * POST /api/work-orders/{id}/complete
   */
  async completeWorkOrder(workOrderId) {
    try {
      const response = await workOrderAPI.completeWorkOrder(workOrderId);
      return response;
    } catch (error) {
      console.error('Complete work order failed:', error);
      throw error;
    }
  },

  /**
   * (OPTIONAL) COMPLETE ALL ITEMS
   * POST /api/checklists/work-orders/{workOrderId}/complete-all
   */
  async bulkCompleteChecklist(workOrderId, notes) {
    try {
      const response = await workOrderAPI.bulkCompleteChecklist(workOrderId, notes);
      return response;
    } catch (error) {
      console.error('Bulk complete checklist failed:', error);
      throw error;
    }
  },
};

export default workOrderService;