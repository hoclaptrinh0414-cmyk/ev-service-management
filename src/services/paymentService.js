// src/services/paymentService.js
import { paymentAPI, invoiceAPI } from './api';

/**
 * Payment Service
 * Quản lý thanh toán cho appointments theo Postman collection
 */
export const paymentService = {
  /**
   * Tạo payment intent cho appointment (tiền cọc/thanh toán trước)
   * POST /api/appointments/{appointmentId}/pay
   *
   * @param {number} appointmentId - ID của appointment
   * @param {object} paymentData - { paymentMethod: 'VNPay', returnUrl: '...' }
   * @returns Response với paymentIntentId, invoiceId, paymentUrl, paymentCode, amount
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
      console.log('✅ Create payment for appointment success:', response);
      return response;
    } catch (error) {
      console.error('❌ Create payment for appointment failed:', error);
      throw error;
    }
  },

  /**
   * Mock complete payment (cho testing)
   * POST /api/payments/mock/complete
   *
   * @param {string} paymentCode - Mã payment
   * @param {string} gateway - Gateway (VNPay, Momo, etc.)
   * @param {boolean} success - Thành công hay thất bại
   * @param {number} amount - Số tiền
   */
  async mockCompletePayment(paymentCode, gateway = 'VNPay', success = true, amount) {
    try {
      const response = await paymentAPI.mockCompletePayment(
        paymentCode,
        gateway,
        success,
        amount
      );
      console.log('✅ Mock complete payment success:', response);
      return response;
    } catch (error) {
      console.error('❌ Mock complete payment failed:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin payment theo code
   * GET /api/payments/by-code/{paymentCode}
   *
   * @param {string} paymentCode - Mã payment
   * @returns Payment details với status, amount, gatewayTransactionId
   */
  async getPaymentByCode(paymentCode) {
    try {
      const response = await paymentAPI.getPaymentByCode(paymentCode);
      console.log('✅ Get payment by code success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get payment by code failed:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách payments của một invoice
   * GET /api/payments/by-invoice/{invoiceId}
   *
   * @param {number} invoiceId - ID của invoice
   * @returns Array of payments
   */
  async getPaymentsByInvoice(invoiceId) {
    try {
      const response = await paymentAPI.getPaymentsByInvoice(invoiceId);
      console.log('✅ Get payments by invoice success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get payments by invoice failed:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin invoice theo ID
   * GET /api/invoices/{invoiceId}
   *
   * @param {number} invoiceId - ID của invoice
   * @returns Invoice details với status, amounts, workOrderCode
   */
  async getInvoiceById(invoiceId) {
    try {
      const response = await invoiceAPI.getInvoiceById(invoiceId);
      console.log('✅ Get invoice by ID success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get invoice by ID failed:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin invoice theo code
   * GET /api/invoices/by-code/{invoiceCode}
   *
   * @param {string} invoiceCode - Mã invoice
   * @returns Invoice details
   */
  async getInvoiceByCode(invoiceCode) {
    try {
      const response = await invoiceAPI.getInvoiceByCode(invoiceCode);
      console.log('✅ Get invoice by code success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get invoice by code failed:', error);
      throw error;
    }
  },
};

export default paymentService;
