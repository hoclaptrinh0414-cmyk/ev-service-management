import api from './api';

/**
 * Invoice Service
 * Invoice management and operations
 */

// Get all invoices
export const getInvoices = async (params = {}) => {
    try {
        const response = await api.get('/api/invoices', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

// Create invoice
export const createInvoice = async (invoiceData) => {
    try {
        const response = await api.post('/api/invoices', invoiceData);
        return response.data;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
};

// Get invoice by ID
export const getInvoiceById = async (id) => {
    try {
        const response = await api.get(`/api/invoices/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching invoice ${id}:`, error);
        throw error;
    }
};

// Update invoice
export const updateInvoice = async (id, invoiceData) => {
    try {
        const response = await api.put(`/api/invoices/${id}`, invoiceData);
        return response.data;
    } catch (error) {
        console.error(`Error updating invoice ${id}:`, error);
        throw error;
    }
};

// Get invoice by code
export const getInvoiceByCode = async (code) => {
    try {
        const response = await api.get(`/api/invoices/by-code/${code}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching invoice by code ${code}:`, error);
        throw error;
    }
};

// Get invoice by work order
export const getInvoiceByWorkOrder = async (workOrderId) => {
    try {
        const response = await api.get(`/api/invoices/by-work-order/${workOrderId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching invoice by work order ${workOrderId}:`, error);
        throw error;
    }
};

// Send invoice
export const sendInvoice = async (id, sendData) => {
    try {
        const response = await api.post(`/api/invoices/${id}/send`, sendData);
        return response.data;
    } catch (error) {
        console.error(`Error sending invoice ${id}:`, error);
        throw error;
    }
};

// Get invoice PDF
export const getInvoicePdf = async (id) => {
    try {
        const response = await api.get(`/api/invoices/${id}/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching invoice PDF ${id}:`, error);
        throw error;
    }
};

// Cancel invoice
export const cancelInvoice = async (id, cancelData) => {
    try {
        const response = await api.post(`/api/invoices/${id}/cancel`, cancelData);
        return response.data;
    } catch (error) {
        console.error(`Error canceling invoice ${id}:`, error);
        throw error;
    }
};

// Get payment by ID
export const getPaymentById = async (id) => {
    try {
        const response = await api.get(`/api/payments/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching payment ${id}:`, error);
        throw error;
    }
};

// Get payment by code
export const getPaymentByCode = async (code) => {
    try {
        const response = await api.get(`/api/payments/by-code/${code}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching payment by code ${code}:`, error);
        throw error;
    }
};

// Get payment by invoice
export const getPaymentByInvoice = async (invoiceId) => {
    try {
        const response = await api.get(`/api/payments/by-invoice/${invoiceId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching payment by invoice ${invoiceId}:`, error);
        throw error;
    }
};

// Create payment
export const createPayment = async (paymentData) => {
    try {
        const response = await api.post('/api/payments', paymentData);
        return response.data;
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
};

// Create manual payment
export const createManualPayment = async (paymentData) => {
    try {
        const response = await api.post('/api/payments/manual', paymentData);
        return response.data;
    } catch (error) {
        console.error('Error creating manual payment:', error);
        throw error;
    }
};

// Mock complete payment (for testing)
export const mockCompletePayment = async (paymentId) => {
    try {
        const response = await api.post(`/api/payments/mock/complete`, { paymentId });
        return response.data;
    } catch (error) {
        console.error('Error mock completing payment:', error);
        throw error;
    }
};

const invoiceService = {
    getInvoices,
    createInvoice,
    getInvoiceById,
    updateInvoice,
    getInvoiceByCode,
    getInvoiceByWorkOrder,
    sendInvoice,
    getInvoicePdf,
    cancelInvoice,
    getPaymentById,
    getPaymentByCode,
    getPaymentByInvoice,
    createPayment,
    createManualPayment,
    mockCompletePayment,
};

export default invoiceService;
