# API Usage Guide

Hướng dẫn sử dụng các API services đã được cập nhật theo Postman Collection.

## 📋 Danh sách Services

### 1. **Auth Service** (`authService.js`)
Xử lý authentication và authorization.

```javascript
import { authService } from './services';

// Login
const response = await authService.login('username', 'password');

// Logout
await authService.logout();

// Social Login
await authService.googleLogin(idToken);
await authService.facebookLogin(accessToken);
```

### 2. **Payment Service** (`paymentService.js`) 🆕
Quản lý thanh toán cho appointments.

```javascript
import { paymentService } from './services';

// Tạo payment intent cho appointment
const payment = await paymentService.createPaymentForAppointment(appointmentId, {
  paymentMethod: 'VNPay',
  returnUrl: 'http://localhost:3000/payment/callback'
});

// Mock complete payment (for testing)
await paymentService.mockCompletePayment(
  payment.data.paymentCode,
  'VNPay',
  true,
  payment.data.amount
);

// Kiểm tra payment status
const paymentStatus = await paymentService.getPaymentByCode(paymentCode);

// Lấy payments của invoice
const payments = await paymentService.getPaymentsByInvoice(invoiceId);

// Lấy invoice
const invoice = await paymentService.getInvoiceByCode(invoiceCode);
```

### 3. **Work Order & Rating Service** (`workOrderService.js`) 🆕
Quản lý work orders và đánh giá dịch vụ.

```javascript
import { workOrderService } from './services';

// Lấy work order
const workOrder = await workOrderService.getWorkOrderByCode('WO-DEMO-0001');

// Kiểm tra có thể đánh giá không
const canRate = await workOrderService.canRateWorkOrder(workOrderId);

// Gửi đánh giá
await workOrderService.submitRating(workOrderId, {
  overallRating: 5,
  serviceQuality: 5,
  staffProfessionalism: 5,
  facilityQuality: 4,
  waitingTime: 4,
  priceValue: 4,
  communicationQuality: 5,
  positiveFeedback: 'Excellent service!',
  wouldRecommend: true,
  wouldReturn: true
});
```

### 4. **Vehicle Maintenance Service** (`vehicleMaintenanceService.js`) 🆕
Quản lý bảo dưỡng xe.

```javascript
import { vehicleMaintenanceService } from './services';

// Lấy maintenance reminders
const reminders = await vehicleMaintenanceService.getReminders();

// Lấy maintenance status của tất cả xe
const status = await vehicleMaintenanceService.getMaintenanceStatus();

// Lấy lịch sử bảo dưỡng của xe
const history = await vehicleMaintenanceService.getVehicleHistory(vehicleId, 1, 10);
```

### 5. **Notification Service** (`notificationService.js`) 🆕
Quản lý thông báo.

```javascript
import { notificationService } from './services';

// Lấy danh sách notifications
const notifications = await notificationService.getNotifications(1, 20);

// Lấy số lượng unread
const unreadCount = await notificationService.getUnreadCount();

// Đánh dấu tất cả là đã đọc
await notificationService.markAllAsRead();
```

### 6. **Appointment Service** (`appointmentService.js`)
Đã cập nhật để hỗ trợ subscriptionId và promotionCode.

```javascript
import { appointmentService } from './services';

// Tạo appointment với subscription
await appointmentService.createAppointment({
  customerId: 1,
  vehicleId: 1,
  serviceCenterId: 1,
  slotId: 123,
  packageId: null,
  subscriptionId: 5,  // 🆕 Support subscription
  serviceIds: [1, 2],
  promotionCode: 'SUMMER2024',  // 🆕 Support promotion code
  customerNotes: 'Please check battery',
  priority: 'Normal',
  source: 'Online'
});

// Hủy appointment (updated body format)
await appointmentService.cancelAppointment(appointmentId, 'Customer requested');
```

### 7. **Subscription Service** (`subscriptionService.js`)
Đã cập nhật query parameter.

```javascript
import { subscriptionService } from './services';

// Lấy subscriptions với status filter
const activeSubscriptions = await subscriptionService.getMySubscriptions('Active');
```

### 8. **Lookup Service** (`lookupService.js`)
Thêm recommended packages API.

```javascript
import { lookupService } from './services';

// Lấy recommended packages cho model
const recommended = await lookupService.getRecommendedPackages(modelId, 5);
```

## 🔄 Flow hoàn chỉnh theo Postman Collection

### Dashboard Flow
```javascript
// 1. Lấy profile
const profile = await customerProfileService.getProfile();

// 2. Lấy vehicles
const vehicles = await vehicleService.getMyVehicles();

// 3. Lấy reminders
const reminders = await vehicleMaintenanceService.getReminders();

// 4. Lấy upcoming appointments
const upcoming = await appointmentService.getUpcomingAppointments(5);

// 5. Lấy notifications
const notifications = await notificationService.getNotifications(1, 20);

// 6. Lấy maintenance status
const status = await vehicleMaintenanceService.getMaintenanceStatus();
```

### Booking Flow
```javascript
// 1. Lấy service centers
const centers = await appointmentService.getActiveServiceCenters();

// 2. Tìm services theo model
const services = await appointmentService.searchServicesByModel(modelId);

// 3. Lấy recommended packages
const packages = await lookupService.getRecommendedPackages(modelId, 5);

// 4. Lấy subscriptions
const subscriptions = await subscriptionService.getMySubscriptions('Active');

// 5. Lấy available time slots
const slots = await appointmentService.getAvailableSlots(centerId, date);

// 6. Tạo appointment
const appointment = await appointmentService.createAppointment({...});
```

### Payment Flow
```javascript
// 1. Tạo payment cho appointment
const payment = await paymentService.createPaymentForAppointment(appointmentId, {
  paymentMethod: 'VNPay',
  returnUrl: window.location.origin + '/payment/callback'
});

// 2. Mock complete payment (testing)
await paymentService.mockCompletePayment(
  payment.data.paymentCode,
  'VNPay',
  true,
  payment.data.amount
);

// 3. Verify payment status
const status = await paymentService.getPaymentByCode(payment.data.paymentCode);

// 4. Get invoice
const invoice = await paymentService.getInvoiceByCode(payment.data.invoiceCode);
```

### Rating Flow
```javascript
// 1. Lấy work order từ invoice
const invoice = await paymentService.getInvoiceByCode(invoiceCode);
const workOrderCode = invoice.data.workOrderCode;

// 2. Lấy work order detail
const workOrder = await workOrderService.getWorkOrderByCode(workOrderCode);

// 3. Kiểm tra có thể rate không
const canRate = await workOrderService.canRateWorkOrder(workOrder.data.workOrderId);

// 4. Submit rating
if (canRate.data.canRate) {
  await workOrderService.submitRating(workOrder.data.workOrderId, {
    overallRating: 5,
    serviceQuality: 5,
    staffProfessionalism: 5,
    positiveFeedback: 'Great service!',
    wouldRecommend: true,
    wouldReturn: true
  });
}
```

## 📝 Response Format

Tất cả API đều trả về format chuẩn:

```javascript
{
  success: true,
  data: { ... },
  message: "Success message"
}
```

Hoặc khi có lỗi:

```javascript
{
  success: false,
  errorCode: "ERROR_CODE",
  message: "Error message",
  errors: { ... }
}
```

## ⚠️ Important Notes

1. **Authentication**: Tất cả API (trừ public endpoints) đều cần Bearer token trong header
2. **Error Handling**: Luôn wrap API calls trong try-catch
3. **Token Refresh**: Axios interceptor tự động handle token refresh
4. **Pagination**: Sử dụng Page/PageSize (PascalCase) cho pagination
5. **Date Format**: Sử dụng ISO 8601 format (YYYY-MM-DD)

## 🔧 Configuration

Update base URL trong `api.js`:

```javascript
const API_CONFIG = {
  baseURL: 'https://your-ngrok-url.ngrok-free.app/api',
  // hoặc
  baseURL: process.env.REACT_APP_API_URL,
};
```

## 🧪 Testing

Để test các API:

1. Start backend server
2. Update baseURL trong `api.js`
3. Use Postman collection để verify endpoints
4. Test từng flow trong React app

## 📚 Related Files

- `src/services/api.js` - Core API service
- `src/services/axiosInterceptor.js` - Token refresh logic
- `src/contexts/AuthContext.jsx` - Auth state management
- `CUSTOMER_API_ENDPOINTS.md` - API documentation
