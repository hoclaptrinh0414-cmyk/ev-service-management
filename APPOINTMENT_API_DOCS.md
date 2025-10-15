# Appointment API Documentation

## 📋 Tổng quan

Tài liệu này mô tả các API endpoints cho chức năng đặt lịch dịch vụ (Appointments) theo spec Backend.

---

## 🔐 Authentication

Hầu hết các endpoints yêu cầu authentication với Bearer Token, trừ endpoint `GET /time-slots/available` là **AllowAnonymous**.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 📍 API Endpoints

### 1. Time Slots APIs

#### GET `/api/time-slots/available`
Lấy danh sách khung giờ khả dụng cho một trung tâm và ngày cụ thể.

**🔓 AllowAnonymous** - Không yêu cầu authentication

**Query Parameters:**
- `centerId` (required): ID của trung tâm dịch vụ
- `date` (required): Ngày cần xem khung giờ (format: YYYY-MM-DD)

**Example Request:**
```
GET /api/time-slots/available?centerId=1&date=2025-10-15
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "slotId": 1,
      "startTime": "08:00",
      "endTime": "10:00",
      "availableSlots": 5,
      "totalSlots": 10
    },
    {
      "slotId": 2,
      "startTime": "10:00",
      "endTime": "12:00",
      "availableSlots": 2,
      "totalSlots": 10
    }
  ]
}
```

---

### 2. Appointment APIs (Customer Only)

Tất cả các endpoints dưới đây yêu cầu `[Authorize(Policy = "CustomerOnly")]`

#### POST `/api/appointments`
Tạo lịch hẹn mới.

**Request Body:**
```json
{
  "customerId": 1,
  "vehicleId": 123,
  "serviceCenterId": 1,
  "slotId": 5,
  "serviceIds": [1, 2, 3],
  "customerNotes": "Xe có tiếng kêu lạ ở động cơ",
  "priority": "Normal",
  "source": "Online"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đặt lịch thành công",
  "data": {
    "appointmentId": 456,
    "appointmentCode": "APT-20251009-001",
    "status": "Pending"
  }
}
```

---

#### GET `/api/appointments/my-appointments`
Lấy danh sách tất cả lịch hẹn của customer.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "appointmentId": 456,
      "appointmentCode": "APT-20251009-001",
      "appointmentDate": "2025-10-15",
      "slotStartTime": "08:00",
      "slotEndTime": "10:00",
      "status": "Pending",
      "vehicleLicensePlate": "51A-12345",
      "serviceCenterName": "Tesla Service Center HCM",
      "services": [
        {
          "serviceId": 1,
          "serviceName": "Bảo dưỡng định kỳ"
        }
      ]
    }
  ]
}
```

---

#### GET `/api/appointments/my-appointments/upcoming`
Lấy danh sách lịch hẹn sắp tới của customer.

**Query Parameters:**
- `limit` (optional): Số lượng lịch hẹn muốn lấy (default: 5)

**Example Request:**
```
GET /api/appointments/my-appointments/upcoming?limit=10
```

---

#### GET `/api/appointments/{id}`
Xem chi tiết lịch hẹn của mình.

**Path Parameters:**
- `id`: Appointment ID

**Example Request:**
```
GET /api/appointments/456
```

---

#### GET `/api/appointments/by-code/{code}`
Tra cứu lịch hẹn theo mã.

**Path Parameters:**
- `code`: Mã lịch hẹn (ví dụ: APT-20251009-001)

**Example Request:**
```
GET /api/appointments/by-code/APT-20251009-001
```

---

#### PUT `/api/appointments/{id}`
Cập nhật lịch hẹn (dịch vụ, ghi chú).

**Path Parameters:**
- `id`: Appointment ID

**Request Body:**
```json
{
  "serviceIds": [1, 2, 4],
  "customerNotes": "Cập nhật: Cần kiểm tra thêm hệ thống phanh"
}
```

---

#### POST `/api/appointments/{id}/reschedule`
Dời lịch hẹn.

**Path Parameters:**
- `id`: Appointment ID

**Request Body:**
```json
{
  "appointmentId": 456,
  "newSlotId": 8,
  "reason": "Khách hàng có việc đột xuất"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dời lịch thành công"
}
```

---

#### POST `/api/appointments/{id}/cancel`
Hủy lịch hẹn.

**Path Parameters:**
- `id`: Appointment ID

**Request Body:**
```json
{
  "appointmentId": 456,
  "cancellationReason": "Khách hàng không có nhu cầu nữa"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hủy lịch thành công"
}
```

---

#### DELETE `/api/appointments/{id}`
Xóa lịch hẹn (chỉ khi ở trạng thái Pending).

**Path Parameters:**
- `id`: Appointment ID

**Response:**
```json
{
  "success": true,
  "message": "Xóa lịch hẹn thành công"
}
```

**Error Response (nếu không phải Pending):**
```json
{
  "success": false,
  "message": "Chỉ có thể xóa lịch hẹn ở trạng thái Pending"
}
```

---

## 🔄 Luồng hoạt động (Sequence)

```
1. Customer xem khung giờ khả dụng:
   GET /api/time-slots/available?centerId=1&date=2025-10-15
   → [AllowAnonymous] Trả về danh sách slots khả dụng

2. Customer tạo lịch hẹn:
   POST /api/appointments (với slotId)
   → [CustomerOnly] Backend validate + check conflicts
   → ✅ Tạo appointment thành công

3. Customer xem danh sách lịch hẹn:
   GET /api/appointments/my-appointments
   → [CustomerOnly] Danh sách lịch hẹn của customer

4. Customer dời lịch:
   POST /api/appointments/{id}/reschedule
   → [CustomerOnly] Backend validate reschedule policy
   → ✅ Dời lịch thành công
```

---

## 📊 Appointment Status

| Status | Mô tả | Actions khả dụng |
|--------|-------|------------------|
| Pending | Chờ xác nhận | Reschedule, Cancel, Delete |
| Confirmed | Đã xác nhận | Cancel |
| InProgress | Đang thực hiện | - |
| Completed | Hoàn thành | - |
| Cancelled | Đã hủy | - |
| NoShow | Không đến | - |

---

## 🛠️ Frontend Implementation

### Service Layer
File: `src/services/appointmentService.js`

Đã implement đầy đủ các endpoints:
- ✅ `getAvailableSlots(centerId, date)`
- ✅ `createAppointment(appointmentData)`
- ✅ `getMyAppointments()`
- ✅ `getUpcomingAppointments(limit)`
- ✅ `getAppointmentById(appointmentId)`
- ✅ `getAppointmentByCode(code)`
- ✅ `updateAppointment(appointmentId, updateData)`
- ✅ `rescheduleAppointment(appointmentId, newSlotId, reason)`
- ✅ `cancelAppointment(appointmentId, reason)`
- ✅ `deleteAppointment(appointmentId)`

### UI Components

#### 1. ScheduleService.jsx (`/schedule-service`)
- Form đặt lịch với UI cards cho time slots
- Visual indicators (badges) cho số slots còn trống
- Auto-fetch slots khi chọn center + date
- Validation và error handling

#### 2. MyAppointments.jsx (`/my-appointments`)
- Danh sách tất cả appointments
- Tab "Tất cả" và "Sắp tới"
- Actions: View, Reschedule, Cancel, Delete
- Modal cho Reschedule và Cancel
- Status badges với màu sắc phù hợp

---

## ✅ Testing Checklist

- [ ] Xem khung giờ khả dụng (không cần login)
- [ ] Đặt lịch mới với validate
- [ ] Xem danh sách lịch hẹn
- [ ] Xem chi tiết lịch hẹn
- [ ] Dời lịch (reschedule)
- [ ] Hủy lịch (cancel)
- [ ] Xóa lịch (chỉ khi Pending)
- [ ] Test error handling (conflict, validation)
- [ ] Test các status khác nhau
- [ ] Test responsive design

---

## 🎨 UI Features

### Time Slots Grid
- Card-based layout (2 columns)
- Color-coded badges:
  - 🟢 Green: >30% slots available
  - 🟡 Yellow: ≤30% slots available
  - 🔴 Red: Sold out
- Selected state với border và check icon
- Click to select
- Empty states và loading states

### Appointment Cards
- Hiển thị đầy đủ thông tin
- Status badges với icons
- Quick actions (Reschedule, Cancel, Delete)
- Responsive grid layout
- Services tags

---

## 🚀 Deployment Notes

**Environment Variables:**
```env
REACT_APP_API_URL=https://your-backend-api.com/api
```

**Required Dependencies:**
- axios ^1.12.2
- react-router-dom ^6.8.0
- bootstrap ^5.3.8
- bootstrap-icons ^1.13.1

---

## 📞 Support

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Token authentication có hợp lệ không
2. API endpoint có đúng không
3. Request body có đúng format không
4. Status của appointment có cho phép action không

---

**Last Updated:** 2025-10-09
**Version:** 1.0.0
