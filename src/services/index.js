/**
 * Service Index
 * Central export point cho tất cả services
 * Import theo Postman collection structure
 */

// Core API Service & Utils
export { default as apiService } from './api';
export * from './api';

// Auth & Account Services
export { default as authService } from './authService';

// Customer Profile Service
export { default as customerProfileService } from './customerProfileService';

// Vehicle Service
export { default as vehicleService } from './vehicleService';

// Appointment & Booking Service
export { default as appointmentService } from './appointmentService';

// Package Subscription Service
export { default as subscriptionService } from './subscriptionService';

// Payment Service (NEW)
export { default as paymentService } from './paymentService';

// Work Order & Rating Service (NEW)
export { default as workOrderService } from './workOrderService';

// Vehicle Maintenance Service (NEW)
export { default as vehicleMaintenanceService } from './vehicleMaintenanceService';

// Notification Service (NEW)
export { default as notificationService } from './notificationService';

// Lookup Service
export { default as lookupService } from './lookupService';

// Package Service
export { default as packageService } from './packageService';
