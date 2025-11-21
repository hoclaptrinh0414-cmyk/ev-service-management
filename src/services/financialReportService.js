import api from './apiWrapper';

/**
 * Financial Reports Service
 * Based on actual API endpoints from backend
 */

// ==================== REVENUE REPORTS ====================

// Get revenue report with date range
// API: GET /financial-reports/revenue
// Parameters: StartDate, EndDate, CenterId, PaymentMethod, GroupBy, 
//             IncludePaymentMethodBreakdown, IncludeServiceCenterBreakdown
export const getRevenueReport = async (params = {}) => {
    try {
        const apiParams = {
            StartDate: params.dateFrom || params.startDate,
            EndDate: params.dateTo || params.endDate,
            CenterId: params.serviceCenterId || params.centerId,
            PaymentMethod: params.paymentMethod,
            GroupBy: params.groupBy || 'Daily', // 'Daily', 'Weekly', 'Monthly'
            IncludePaymentMethodBreakdown: params.includePaymentMethodBreakdown !== undefined ? params.includePaymentMethodBreakdown : true,
            IncludeServiceCenterBreakdown: params.includeServiceCenterBreakdown !== undefined ? params.includeServiceCenterBreakdown : false
        };

        // Remove undefined values
        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/financial-reports/revenue', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching revenue report:', error);
        throw error;
    }
};

// Get today's revenue
// API: GET /financial-reports/revenue/today
export const getTodayRevenue = async () => {
    try {
        const response = await api.get('/financial-reports/revenue/today');
        return response.data;
    } catch (error) {
        console.error('Error fetching today\'s revenue:', error);
        throw error;
    }
};

// Get this month's revenue
// API: GET /financial-reports/revenue/this-month
export const getThisMonthRevenue = async () => {
    try {
        const response = await api.get('/financial-reports/revenue/this-month');
        return response.data;
    } catch (error) {
        console.error('Error fetching this month\'s revenue:', error);
        throw error;
    }
};

// Compare revenue between two periods
// API: GET /financial-reports/revenue/compare
// Parameters: period1Start, period1End, period2Start, period2End, groupBy
export const compareRevenue = async (params = {}) => {
    try {
        const apiParams = {
            period1Start: params.period1Start,
            period1End: params.period1End,
            period2Start: params.period2Start,
            period2End: params.period2End,
            groupBy: params.groupBy || 'Daily'
        };

        const response = await api.get('/financial-reports/revenue/compare', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error comparing revenue:', error);
        throw error;
    }
};

// Alternative revenue endpoint
// API: GET /api/reports/revenue
export const getRevenueReportAlt = async (params = {}) => {
    try {
        const apiParams = {
            from: params.dateFrom || params.from,
            to: params.dateTo || params.to,
            centerId: params.serviceCenterId || params.centerId,
            groupBy: params.groupBy || 'Daily'
        };

        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/api/reports/revenue', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching revenue report (alt):', error);
        throw error;
    }
};

// ==================== PAYMENT REPORTS ====================

// Get payments report
export const getPaymentsReport = async (params = {}) => {
    try {
        const apiParams = {
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            status: params.status,
            method: params.method,
            serviceCenterId: params.serviceCenterId
        };

        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/financial-reports/payments', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching payments report:', error);
        throw error;
    }
};

// Get today's payments
export const getTodayPayments = async () => {
    try {
        const response = await api.get('/financial-reports/payments/today');
        return response.data;
    } catch (error) {
        console.error('Error fetching today\'s payments:', error);
        throw error;
    }
};

// Get payment gateway comparison
// API: GET /financial-reports/payments/gateway-comparison
// Parameters: startDate, endDate
export const getPaymentGatewayComparison = async (params = {}) => {
    try {
        const apiParams = {
            startDate: params.dateFrom || params.startDate,
            endDate: params.dateTo || params.endDate
        };

        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/financial-reports/payments/gateway-comparison', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching payment gateway comparison:', error);
        throw error;
    }
};

// ==================== INVOICE REPORTS ====================

// Get invoices report
// API: GET /financial-reports/invoices
// Parameters: StartDate, EndDate, CenterId, Status, IncludeAgingAnalysis, 
//             IncludeDiscountAnalysis, IncludeTaxSummary
export const getInvoicesReport = async (params = {}) => {
    try {
        const apiParams = {
            StartDate: params.dateFrom || params.startDate,
            EndDate: params.dateTo || params.endDate,
            CenterId: params.serviceCenterId || params.centerId,
            Status: params.status,
            IncludeAgingAnalysis: params.includeAgingAnalysis !== undefined ? params.includeAgingAnalysis : true,
            IncludeDiscountAnalysis: params.includeDiscountAnalysis !== undefined ? params.includeDiscountAnalysis : true,
            IncludeTaxSummary: params.includeTaxSummary !== undefined ? params.includeTaxSummary : true
        };

        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/financial-reports/invoices', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching invoices report:', error);
        throw error;
    }
};

// Get outstanding invoices
export const getOutstandingInvoices = async () => {
    try {
        const response = await api.get('/financial-reports/invoices/outstanding');
        return response.data;
    } catch (error) {
        console.error('Error fetching outstanding invoices:', error);
        throw error;
    }
};

// Get this month's invoices
export const getThisMonthInvoices = async () => {
    try {
        const response = await api.get('/financial-reports/invoices/this-month');
        return response.data;
    } catch (error) {
        console.error('Error fetching this month\'s invoices:', error);
        throw error;
    }
};

// Get discount analysis
export const getDiscountAnalysis = async (params = {}) => {
    try {
        const apiParams = {
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            serviceCenterId: params.serviceCenterId
        };

        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/financial-reports/invoices/discount-analysis', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching discount analysis:', error);
        throw error;
    }
};

// ==================== GENERAL REPORTS ====================

// Get profit report
export const getProfitReport = async (params = {}) => {
    try {
        const apiParams = {
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            serviceCenterId: params.serviceCenterId,
            groupBy: params.groupBy || 'month'
        };

        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/financial-reports/profit', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching profit report:', error);
        throw error;
    }
};

// Get popular services report
export const getPopularServicesReport = async (params = {}) => {
    try {
        const apiParams = {
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            serviceCenterId: params.serviceCenterId,
            limit: params.limit || 10
        };

        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/financial-reports/popular-services', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching popular services report:', error);
        throw error;
    }
};

// Get today's report (comprehensive)
export const getTodayReport = async () => {
    try {
        const response = await api.get('/financial-reports/today');
        return response.data;
    } catch (error) {
        console.error('Error fetching today\'s report:', error);
        throw error;
    }
};

// Get this month's report (comprehensive)
export const getThisMonthReport = async () => {
    try {
        const response = await api.get('/financial-reports/this-month');
        return response.data;
    } catch (error) {
        console.error('Error fetching this month\'s report:', error);
        throw error;
    }
};

// Get financial summary
export const getFinancialSummary = async (params = {}) => {
    try {
        const apiParams = {
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            serviceCenterId: params.serviceCenterId
        };

        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/financial-reports/summary', { params: apiParams });
        return response.data;
    } catch (error) {
        console.error('Error fetching financial summary:', error);
        throw error;
    }
};

const financialReportService = {
    // Revenue
    getRevenueReport,
    getTodayRevenue,
    getThisMonthRevenue,
    compareRevenue,
    getRevenueReportAlt,

    // Payments
    getPaymentsReport,
    getTodayPayments,
    getPaymentGatewayComparison,

    // Invoices
    getInvoicesReport,
    getOutstandingInvoices,
    getThisMonthInvoices,
    getDiscountAnalysis,

    // General
    getProfitReport,
    getPopularServicesReport,
    getTodayReport,
    getThisMonthReport,
    getFinancialSummary,
};

export default financialReportService;

