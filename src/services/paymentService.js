// src/services/paymentService.js
import { paymentAPI, invoiceAPI } from './api';

/**
 * Payment Service
 * Quáº£n lÃ½ thanh toÃ¡n cho appointments theo Postman collection
 */
export const paymentService = {
  /**
   * Táº¡o payment intent cho appointment (tiá»n cá»c/thanh toÃ¡n trÆ°á»›c)
   * POST /api/appointments/{appointmentId}/pay
   *
   * @param {number} appointmentId - ID cá»§a appointment
   * @param {object} paymentData - { paymentMethod: 'VNPay', returnUrl: '...' }
   * @returns Response vá»›i paymentIntentId, invoiceId, paymentUrl, paymentCode, amount
   */
  async createPaymentForAppointment(appointmentId, paymentData) {
    try {
      const response = await paymentAPI.createPaymentForAppointment(
        appointmentId,
        {
          paymentMethod: paymentData.paymentMethod || 'VNPay',
          returnUrl: paymentData.returnUrl || `${window.location.origin}/payment/callback`,
        }
      );
      console.log('âœ… Create payment for appointment success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Create payment for appointment failed:', error);
      throw error;
    }
  },

  /**
   * Mock complete payment (cho testing)
   * POST /api/payments/mock/complete
   *
   * @param {string} paymentCode - MÃ£ payment
   * @param {string} gateway - Gateway (VNPay, Momo, etc.)
   * @param {boolean} success - ThÃ nh cÃ´ng hay tháº¥t báº¡i
   * @param {number} amount - Sá»‘ tiá»n
   */
  async mockCompletePayment(paymentCode, gateway = 'VNPay', success = true, amount) {
    try {
      const response = await paymentAPI.mockCompletePayment(
        paymentCode,
        gateway,
        success,
        amount
      );
      console.log('âœ… Mock complete payment success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Mock complete payment failed:', error);
      throw error;
    }
  },

  /**
   * Láº¥y thÃ´ng tin payment theo code
   * GET /api/payments/by-code/{paymentCode}
   *
   * @param {string} paymentCode - MÃ£ payment
   * @returns Payment details vá»›i status, amount, gatewayTransactionId
   */
  async getPaymentByCode(paymentCode) {
    try {
      // Use the anonymous-friendly endpoint to avoid 401/logout during callbacks
      const response = await paymentAPI.getPaymentByCodePublic(paymentCode);
      console.log('Get payment by code success:', response);
      return response;
    } catch (error) {
      console.error('Get payment by code failed:', error);
      throw error;
    }
  },

  async getPaymentByCodePublic(paymentCode) {
    try {
      const response = await paymentAPI.getPaymentByCodePublic(paymentCode);
      console.log('Get payment by code (public) success:', response);
      return response;
    } catch (error) {
      console.error('Get payment by code (public) failed:', error);
      throw error;
    }
  },

  /**
   * Láº¥y danh sÃ¡ch payments cá»§a má»™t invoice
   * GET /api/payments/by-invoice/{invoiceId}
   *
   * @param {number} invoiceId - ID cá»§a invoice
   * @returns Array of payments
   */
  async getPaymentsByInvoice(invoiceId) {
    try {
      const response = await paymentAPI.getPaymentsByInvoice(invoiceId);
      console.log('âœ… Get payments by invoice success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get payments by invoice failed:', error);
      throw error;
    }
  },

  /**
   * Láº¥y thÃ´ng tin invoice theo ID
   * GET /api/invoices/{invoiceId}
   *
   * @param {number} invoiceId - ID cá»§a invoice
   * @returns Invoice details vá»›i status, amounts, workOrderCode
   */
  async getInvoiceById(invoiceId) {
    try {
      const response = await invoiceAPI.getInvoiceById(invoiceId);
      console.log('âœ… Get invoice by ID success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get invoice by ID failed:', error);
      throw error;
    }
  },

  /**
   * Láº¥y thÃ´ng tin invoice theo code
   * GET /api/invoices/by-code/{invoiceCode}
   *
   * @param {string} invoiceCode - MÃ£ invoice
   * @returns Invoice details
   */
  async getInvoiceByCode(invoiceCode) {
    try {
      const response = await invoiceAPI.getInvoiceByCode(invoiceCode);
      console.log('âœ… Get invoice by code success:', response);
      return response;
    } catch (error) {
      console.error('âŒ Get invoice by code failed:', error);
      throw error;
    }
  },
};

export default paymentService;
