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
};

export default workOrderService;