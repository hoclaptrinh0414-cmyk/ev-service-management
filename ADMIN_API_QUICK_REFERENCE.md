# 🚀 Quick API Reference - Admin Panel

## 📌 Quick Links
- [Work Orders](#work-orders)
- [Technicians](#technicians)
- [Financial Reports](#financial-reports)
- [Invoices & Payments](#invoices--payments)
- [Inventory](#inventory)
- [Customers](#customers)
- [Vehicles](#vehicles)
- [Appointments](#appointments)
- [Chat](#chat)
- [Users](#users)

---

## Work Orders

### Basic Operations
```javascript
import workOrderService from '../../services/workOrderService';

// GET all work orders
const orders = await workOrderService.getWorkOrders({ status: 'Pending' });

// GET by ID
const order = await workOrderService.getWorkOrderById(orderId);

// GET by code
const order = await workOrderService.getWorkOrderByCode('WO-2025-001');

// CREATE
const newOrder = await workOrderService.createWorkOrder(data);

// UPDATE status
await workOrderService.updateWorkOrderStatus(orderId, 'InProgress');

// DELETE
await workOrderService.deleteWorkOrder(orderId);
```

### Lifecycle
```javascript
// Start
await workOrderService.startWorkOrder(orderId);

// Complete
await workOrderService.completeWorkOrder(orderId);

// Force complete
await workOrderService.forceCompleteWorkOrder(orderId, { reason: '...' });

// Cancel
await workOrderService.cancelWorkOrder(orderId, { reason: '...' });
```

### Technician
```javascript
// Assign
await workOrderService.assignTechnician(orderId, technicianId);

// Unassign
await workOrderService.unassignTechnician(orderId, technicianId);
```

### Timeline & Notes
```javascript
// Timeline
const timeline = await workOrderService.getWorkOrderTimeline(orderId);
await workOrderService.addTimelineEntry(orderId, data);

// Notes
await workOrderService.addCustomerNote(orderId, note);
await workOrderService.addInternalNote(orderId, note);
```

### Checklist
```javascript
// Get checklist
const checklist = await workOrderService.getWorkOrderChecklist(orderId);

// Apply template
await workOrderService.applyChecklistTemplate(orderId, templateId);
```

### Quality & Rating
```javascript
// Quality check
await workOrderService.performQualityCheck(orderId, data);
const result = await workOrderService.getQualityCheck(orderId);

// Rating
const canRate = await workOrderService.canRate(orderId);
await workOrderService.addRating(orderId, { rating: 5, comment: '...' });
const rating = await workOrderService.getRating(orderId);
```

---

## Technicians

### Basic Operations
```javascript
import technicianService from '../../services/technicianService';

// GET all
const technicians = await technicianService.getTechnicians();

// GET available
const available = await technicianService.getAvailableTechnicians();

// GET by ID
const tech = await technicianService.getTechnicianById(techId);
```

### Schedule
```javascript
// Get schedule
const schedule = await technicianService.getTechnicianSchedule(techId, {
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});
```

### Skills
```javascript
// Get skills
const skills = await technicianService.getTechnicianSkills(techId);

// Add skill
await technicianService.addTechnicianSkill(techId, {
  skillId: skillId,
  level: 'Expert'
});

// Remove skill
await technicianService.removeTechnicianSkill(techId, skillId);

// Verify skill
await technicianService.verifyTechnicianSkill(techId, skillId, data);
```

### Performance
```javascript
// Get performance
const perf = await technicianService.getTechnicianPerformance(techId, {
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});
```

### Workload
```javascript
// Get balance
const balance = await technicianService.getWorkloadBalance(centerId);
```

### Auto-Assignment
```javascript
// Get candidates
const candidates = await technicianService.getAutoAssignCandidates({
  workOrderId: orderId
});

// Auto assign
const result = await technicianService.autoAssignBestTechnician({
  workOrderId: orderId
});
```

### Attendance
```javascript
// Check in
await technicianService.checkIn({ technicianId: techId });

// Check out
await technicianService.checkOut({ technicianId: techId });

// Today's attendance
const attendance = await technicianService.getTodayAttendance();
```

---

## Financial Reports

### Revenue
```javascript
import financialReportService from '../../services/financialReportService';

// Revenue report
const revenue = await financialReportService.getRevenueReport({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  groupBy: 'day'
});

// Today's revenue
const today = await financialReportService.getTodayRevenue();

// This month's revenue
const month = await financialReportService.getThisMonthRevenue();

// Compare periods
const comparison = await financialReportService.compareRevenue({
  period1Start: '2025-01-01',
  period1End: '2025-01-31',
  period2Start: '2025-02-01',
  period2End: '2025-02-28'
});
```

### Payments
```javascript
// Payments report
const payments = await financialReportService.getPaymentsReport({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  status: 'Completed'
});

// Today's payments
const todayPayments = await financialReportService.getTodayPayments();

// Gateway comparison
const gateways = await financialReportService.getPaymentGatewayComparison({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});
```

### Invoices
```javascript
// Invoices report
const invoices = await financialReportService.getInvoicesReport({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  status: 'Outstanding'
});

// Outstanding invoices
const outstanding = await financialReportService.getOutstandingInvoices();

// This month's invoices
const monthInvoices = await financialReportService.getThisMonthInvoices();

// Discount analysis
const discounts = await financialReportService.getDiscountAnalysis({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});
```

### General
```javascript
// Profit report
const profit = await financialReportService.getProfitReport({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  groupBy: 'month'
});

// Popular services
const popular = await financialReportService.getPopularServicesReport({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  limit: 10
});

// Today's report
const todayReport = await financialReportService.getTodayReport();

// This month's report
const monthReport = await financialReportService.getThisMonthReport();
```

---

## Invoices & Payments

### Invoices
```javascript
import invoiceService from '../../services/invoiceService';

// GET all
const invoices = await invoiceService.getInvoices({ status: 'Outstanding' });

// GET by ID
const invoice = await invoiceService.getInvoiceById(invoiceId);

// CREATE
const newInvoice = await invoiceService.createInvoice(data);

// UPDATE
await invoiceService.updateInvoice(invoiceId, data);

// CANCEL
await invoiceService.cancelInvoice(invoiceId, { reason: '...' });

// Send email
await invoiceService.sendInvoice(invoiceId, { email: 'customer@email.com' });

// Get PDF
const pdfBlob = await invoiceService.getInvoicePdf(invoiceId);
```

### Payments
```javascript
// CREATE payment
const payment = await invoiceService.createPayment({
  invoiceId: invoiceId,
  amount: 1000000,
  method: 'VNPay'
});

// Manual payment
await invoiceService.createManualPayment({
  invoiceId: invoiceId,
  amount: 1000000,
  method: 'Cash',
  transactionId: 'CASH-001'
});

// GET payment by ID
const payment = await invoiceService.getPaymentById(paymentId);
```

---

## Inventory

### Basic Operations
```javascript
import inventoryService from '../../services/inventoryService';

// GET all
const inventory = await inventoryService.getInventory({
  serviceCenterId: centerId
});

// GET by part
const stock = await inventoryService.getInventoryByPart(partId, centerId);

// Low stock alerts
const alerts = await inventoryService.getLowStockAlerts({ serviceCenterId: centerId });

// Total value
const value = await inventoryService.getTotalInventoryValue({ serviceCenterId: centerId });
```

### Reservations
```javascript
// Reserve
await inventoryService.reserveInventory({
  partId: partId,
  quantity: 5,
  workOrderId: orderId,
  serviceCenterId: centerId
});

// Release
await inventoryService.releaseInventory({ reservationId: resId });
```

### Transactions
```javascript
// CREATE transaction
await inventoryService.createStockTransaction({
  partId: partId,
  serviceCenterId: centerId,
  type: 'IN',
  quantity: 100,
  reason: 'Purchase'
});

// GET recent transactions
const transactions = await inventoryService.getRecentTransactionsForPart(partId, {
  limit: 20
});

// Movement summary
const summary = await inventoryService.getMovementSummary({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  serviceCenterId: centerId
});
```

---

## Customers

```javascript
import { getCustomers, getCustomerById, updateCustomer, addLoyaltyPoints } from '../../services/staffService';

// GET all
const customers = await getCustomers({ search: 'John' });

// GET by ID
const customer = await getCustomerById(customerId);

// UPDATE
await updateCustomer(customerId, data);

// Add loyalty points
await addLoyaltyPoints(customerId, { points: 100, reason: 'Purchase' });
```

---

## Vehicles

```javascript
import { getVehicles, getVehicleById, updateVehicleMileage } from '../../services/staffService';

// GET all
const vehicles = await getVehicles({ customerId: customerId });

// GET by ID
const vehicle = await getVehicleById(vehicleId);

// Update mileage
await updateVehicleMileage(vehicleId, { currentMileage: 50000 });
```

---

## Appointments

```javascript
import { 
  getAppointments, 
  getAppointmentById, 
  confirmAppointment, 
  cancelAppointment 
} from '../../services/staffService';

// GET all
const appointments = await getAppointments({ 
  status: 'Pending',
  date: '2025-01-20'
});

// GET by ID
const appointment = await getAppointmentById(appointmentId);

// CONFIRM
await confirmAppointment(appointmentId);

// CANCEL
await cancelAppointment(appointmentId, { reason: 'Customer request' });
```

---

## Chat

```javascript
import chatService from '../../services/chatService';

// Create channel
const channel = await chatService.createChatChannel({
  customerId: customerId,
  staffId: staffId
});

// Send message
await chatService.sendMessage({
  channelId: channelId,
  message: 'Hello!',
  senderId: userId
});

// Get history
const history = await chatService.getChatHistory({
  channelId: channelId,
  limit: 50
});

// Mark as read
await chatService.markChannelAsRead(channelId);

// Close channel
await chatService.closeChannel(channelId);

// Get channels
const channels = await chatService.getChatChannels({ status: 'active' });
```

---

## Users

```javascript
import userService from '../../services/userService';

// GET all
const users = await userService.getUsers({ role: 'admin' });

// GET by ID
const user = await userService.getUserById(userId);

// UPDATE
await userService.updateUser(userId, data);

// DELETE
await userService.deleteUser(userId);
```

---

## 🎯 Common Patterns

### Pagination
```javascript
const response = await someService.getData({
  page: 1,
  limit: 20
});
// response.items, response.totalPages, response.totalItems
```

### Date Filtering
```javascript
const data = await someService.getData({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});
```

### Search
```javascript
const results = await someService.getData({
  search: 'keyword'
});
```

### Status Filtering
```javascript
const items = await someService.getData({
  status: 'Active' // or 'Pending', 'Completed', etc.
});
```

### Sorting
```javascript
const sorted = await someService.getData({
  sortBy: 'createdAt',
  sortOrder: 'desc' // or 'asc'
});
```

---

## 🔧 Error Handling Template

```javascript
const handleApiCall = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const data = await someService.someMethod();
    setData(data);
    toast.success('Success!');
  } catch (error) {
    console.error('Error:', error);
    setError(error.message);
    toast.error('Failed to perform action');
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 Notes

- All services are in `src/services/`
- Import only what you need
- Always handle errors
- Use loading states
- Show user feedback (toast)
- Refresh data after mutations

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** 2025-11-21
