/**
 * API Endpoints Documentation
 * EV Service Management System
 * 
 * Base URL: https://unprepared-kade-nonpossibly.ngrok-free.dev
 */

// ==================== WORK ORDER MANAGEMENT ====================

/**
 * GET /api/work-orders
 * Get all work orders with filters
 * 
 * Parameters:
 * - WorkOrderCode: string (query) - Filter by work order code
 * - CustomerId: integer (query) - Filter by customer ID
 * - VehicleId: integer (query) - Filter by vehicle ID
 * - ServiceCenterId: integer (query) - Filter by service center ID
 * - TechnicianId: integer (query) - Filter by technician ID
 * - StatusId: integer (query) - Filter by status ID
 * - Priority: string (query) - Filter by priority (Low, Normal, High, Urgent)
 * - StartDateFrom: string (date-time) - Start date range from
 * - StartDateTo: string (date-time) - Start date range to
 * - CompletedDateFrom: string (date-time) - Completed date range from
 * - CompletedDateTo: string (date-time) - Completed date range to
 * - RequiresApproval: boolean (query) - Filter by approval requirement
 * - QualityCheckRequired: boolean (query) - Filter by quality check requirement
 * - SearchTerm: string (query) - Search term
 * - PageNumber: integer (query) - Page number
 * - PageSize: integer (query) - Page size
 * - SortBy: string (query) - Sort field
 * - SortDirection: string (query) - Sort direction (asc/desc)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "items": [
 *       {
 *         "workOrderId": 1026,
 *         "workOrderCode": "WO202511142393",
 *         "customerName": "Phạm Nhật Nghĩa",
 *         "vehiclePlate": "MAIN-TEST-001",
 *         "vehicleModel": "Model 3",
 *         "serviceCenterName": "EV Service Center - Quận 1 (Updated)",
 *         "statusId": 1,
 *         "statusName": "Created",
 *         "statusColor": "#FFA500",
 *         "priority": "Normal",
 *         "sourceType": "Scheduled",
 *         "startDate": "2025-11-14T21:10:54.5549695",
 *         "estimatedCompletionDate": "2025-11-15T00:40:54.5550424",
 *         "createdDate": "2025-11-14T21:10:54.5552913",
 *         "technicianName": null,
 *         "progressPercentage": 0,
 *         "finalAmount": 0,
 *         "requiresApproval": false,
 *         "qualityCheckRequired": true
 *       }
 *     ],
 *     "totalPages": 1,
 *     "totalItems": 1,
 *     "currentPage": 1
 *   }
 * }
 * 
 * Example cURL:
 * curl -X 'GET' \
 *   'https://unprepared-kade-nonpossibly.ngrok-free.dev/api/work-orders' \
 *   -H 'accept: text/plain' \
 *   -H 'Authorization: Bearer YOUR_TOKEN'
 */

/**
 * GET /api/work-orders/{id}
 * Get work order by ID
 * 
 * Parameters:
 * - id: integer (path) - Work order ID
 * 
 * Response: Work order details object
 * 
 * Example cURL:
 * curl -X 'GET' \
 *   'https://unprepared-kade-nonpossibly.ngrok-free.dev/api/work-orders/1026' \
 *   -H 'accept: text/plain' \
 *   -H 'Authorization: Bearer YOUR_TOKEN'
 */

/**
 * POST /api/work-orders
 * Create new work order
 * 
 * Request Body:
 * {
 *   "customerId": 1,
 *   "vehicleId": 1,
 *   "serviceCenterId": 1,
 *   "priority": "Normal",
 *   "description": "Service description",
 *   "estimatedCompletionDate": "2025-11-22T00:00:00"
 * }
 * 
 * Response: Created work order object
 * 
 * Example cURL:
 * curl -X 'POST' \
 *   'https://unprepared-kade-nonpossibly.ngrok-free.dev/api/work-orders' \
 *   -H 'accept: text/plain' \
 *   -H 'Authorization: Bearer YOUR_TOKEN' \
 *   -H 'Content-Type: application/json' \
 *   -d '{ "customerId": 1, "vehicleId": 1, "serviceCenterId": 1 }'
 */

/**
 * PUT /api/work-orders/{id}
 * Update work order
 * 
 * Parameters:
 * - id: integer (path) - Work order ID
 * 
 * Request Body: Updated work order data
 * 
 * Response: Updated work order object
 * 
 * Example cURL:
 * curl -X 'PUT' \
 *   'https://unprepared-kade-nonpossibly.ngrok-free.dev/api/work-orders/1026' \
 *   -H 'accept: text/plain' \
 *   -H 'Authorization: Bearer YOUR_TOKEN' \
 *   -H 'Content-Type: application/json' \
 *   -d '{ "priority": "High" }'
 */

/**
 * DELETE /api/work-orders/{id}
 * Delete work order
 * 
 * Parameters:
 * - id: integer (path) - Work order ID
 * 
 * Response: Success message
 * 
 * Example cURL:
 * curl -X 'DELETE' \
 *   'https://unprepared-kade-nonpossibly.ngrok-free.dev/api/work-orders/1026' \
 *   -H 'accept: text/plain' \
 *   -H 'Authorization: Bearer YOUR_TOKEN'
 */

// ==================== TECHNICIAN MANAGEMENT ====================

/**
 * GET /api/technicians
 * Get all technicians with filters
 * 
 * Parameters:
 * - ServiceCenterId: integer (query)
 * - Department: string (query)
 * - SkillName: string (query)
 * - MinSkillLevel: integer (query)
 * - IsActive: boolean (query)
 * - SearchTerm: string (query)
 * - SortBy: string (query)
 * - SortDirection: string (query)
 * - PageNumber: integer (query)
 * - PageSize: integer (query)
 * 
 * Response Fields:
 * - userId: number
 * - fullName: string
 * - email: string
 * - phoneNumber: string
 * - employeeCode: string
 * - department: string
 * - currentWorkload: number
 * - isAvailable: boolean
 * - topSkills: string (comma-separated)
 * - averageRating: number
 * - isActive: boolean
 */

/**
 * GET /api/technicians/{id}
 * Get technician by ID
 */

/**
 * GET /api/technicians/{id}/schedule
 * Get technician schedule
 */

/**
 * GET /api/technicians/{id}/skills
 * Get technician skills
 */

/**
 * GET /api/technicians/{id}/performance
 * Get technician performance metrics
 */

// ==================== FINANCIAL REPORTS ====================

/**
 * GET /api/financial-reports/revenue/today
 * Get today's revenue summary
 * 
 * Response:
 * {
 *   "date": "2025-11-21T00:00:00+07:00",
 *   "totalRevenue": 9700000,
 *   "paymentCount": 9,
 *   "averagePaymentAmount": 1077777.78,
 *   "collectionRate": 0,
 *   "paymentMethodBreakdown": [...]
 * }
 */

/**
 * GET /api/financial-reports/revenue/this-month
 * Get current month revenue summary
 */

/**
 * GET /api/financial-reports/revenue
 * Get revenue report with date range
 * 
 * Parameters:
 * - StartDate: string (date-time)
 * - EndDate: string (date-time)
 * - CenterId: integer
 * - PaymentMethod: string
 * - GroupBy: string (Daily, Weekly, Monthly)
 * - IncludePaymentMethodBreakdown: boolean
 * - IncludeServiceCenterBreakdown: boolean
 */

/**
 * GET /api/financial-reports/payments/gateway-comparison
 * Get payment gateway comparison
 * 
 * Parameters:
 * - startDate: string (date-time)
 * - endDate: string (date-time)
 */

/**
 * GET /api/financial-reports/invoices
 * Get invoice reports
 * 
 * Parameters:
 * - StartDate: string (date-time)
 * - EndDate: string (date-time)
 * - CenterId: integer
 * - Status: string (Outstanding, Paid, etc.)
 * - IncludeAgingAnalysis: boolean
 * - IncludeDiscountAnalysis: boolean
 * - IncludeTaxSummary: boolean
 */

module.exports = {
    baseURL: 'https://unprepared-kade-nonpossibly.ngrok-free.dev',
    endpoints: {
        workOrders: {
            getAll: '/api/work-orders',
            getById: '/api/work-orders/{id}',
            create: '/api/work-orders',
            update: '/api/work-orders/{id}',
            delete: '/api/work-orders/{id}'
        },
        technicians: {
            getAll: '/api/technicians',
            getById: '/api/technicians/{id}',
            getSchedule: '/api/technicians/{id}/schedule',
            getSkills: '/api/technicians/{id}/skills',
            getPerformance: '/api/technicians/{id}/performance'
        },
        financialReports: {
            todayRevenue: '/api/financial-reports/revenue/today',
            thisMonthRevenue: '/api/financial-reports/revenue/this-month',
            revenue: '/api/financial-reports/revenue',
            gatewayComparison: '/api/financial-reports/payments/gateway-comparison',
            invoices: '/api/financial-reports/invoices'
        }
    }
};
