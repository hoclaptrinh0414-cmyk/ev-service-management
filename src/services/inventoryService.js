import api from './api';

/**
 * Inventory Management Service
 * Stock and inventory operations
 */

// Get inventory
export const getInventory = async (params = {}) => {
    try {
        const response = await api.get('/api/inventory', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
};

// Get inventory by part and service center
export const getInventoryByPartAndCenter = async (partId, serviceCenterId) => {
    try {
        const response = await api.get(`/api/inventory/part/${partId}/center/${serviceCenterId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching inventory for part ${partId} at center ${serviceCenterId}:`, error);
        throw error;
    }
};

// Get low stock alerts
export const getLowStockAlerts = async (params = {}) => {
    try {
        const response = await api.get('/api/inventory/low-stock-alerts', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching low stock alerts:', error);
        throw error;
    }
};

// Get total inventory value
export const getTotalInventoryValue = async (params = {}) => {
    try {
        const response = await api.get('/api/inventory/total-value', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching total inventory value:', error);
        throw error;
    }
};

// Reserve inventory
export const reserveInventory = async (reservationData) => {
    try {
        const response = await api.post('/api/inventory/reserve', reservationData);
        return response.data;
    } catch (error) {
        console.error('Error reserving inventory:', error);
        throw error;
    }
};

// Release inventory
export const releaseInventory = async (releaseData) => {
    try {
        const response = await api.post('/api/inventory/release', releaseData);
        return response.data;
    } catch (error) {
        console.error('Error releasing inventory:', error);
        throw error;
    }
};

// Stock Transactions

// Create stock transaction
export const createStockTransaction = async (transactionData) => {
    try {
        const response = await api.post('/api/stock-transactions', transactionData);
        return response.data;
    } catch (error) {
        console.error('Error creating stock transaction:', error);
        throw error;
    }
};

// Get stock transactions
export const getStockTransactions = async (params = {}) => {
    try {
        const response = await api.get('/api/stock-transactions', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching stock transactions:', error);
        throw error;
    }
};

// Get stock transaction by ID
export const getStockTransactionById = async (id) => {
    try {
        const response = await api.get(`/api/stock-transactions/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching stock transaction ${id}:`, error);
        throw error;
    }
};

// Get recent transactions for part
export const getRecentTransactionsForPart = async (partId, params = {}) => {
    try {
        const response = await api.get(`/api/stock-transactions/part/${partId}/recent`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching recent transactions for part ${partId}:`, error);
        throw error;
    }
};

// Get movement summary
export const getMovementSummary = async (params = {}) => {
    try {
        const response = await api.get('/api/stock-transactions/movement-summary', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching movement summary:', error);
        throw error;
    }
};

const inventoryService = {
    getInventory,
    getInventoryByPartAndCenter,
    getLowStockAlerts,
    getTotalInventoryValue,
    reserveInventory,
    releaseInventory,
    createStockTransaction,
    getStockTransactions,
    getStockTransactionById,
    getRecentTransactionsForPart,
    getMovementSummary,
};

export default inventoryService;
