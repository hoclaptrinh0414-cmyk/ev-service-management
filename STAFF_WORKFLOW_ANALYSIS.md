# 📋 LUỒNG HOẠT ĐỘNG STAFF - PHÂN TÍCH CHI TIẾT

## 🎯 TỔNG QUAN LUỒNG

```
📱 Customer Call/Walk-in → 📝 Create Appointment → ✅ Confirm
→ 🚗 Customer Arrives → ✓ Check-in → 🔧 Create WorkOrder
→ 👨‍🔧 Assign Technician → ▶️ Start Work → ✅ Complete Checklist
→ ✓ Quality Check → 🚘 Validate Delivery → 💳 Payment
→ 🎉 Complete & Handover
```

---

## 📍 1. APPOINTMENTS PAGE (`Appointments.jsx`)

### **Chức năng chính:**
- Quản lý lịch hẹn (View, Create, Confirm, Check-in)
- Lọc theo trạng thái, ngày, trung tâm dịch vụ
- Check-in khách hàng (tạo WorkOrder tự động)

### **API Calls trong Appointments.jsx:**

#### 🔹 **Line 172: Load Service Centers**
```javascript
// Lấy danh sách trung tâm dịch vụ đang hoạt động
// API: GET /service-centers/active
const response = await staffService.getActiveServiceCenters();
```
**Mục đích:** Hiển thị dropdown chọn trung tâm để lọc appointments

---

#### 🔹 **Line 222: Fetch Appointment Statistics**
```javascript
// Lấy thống kê số lượng appointment theo từng trạng thái (Pending, Confirmed, etc.)
// API: GET /appointment-management/statistics/by-status
const res = await staffService.getAppointmentStatistics();
```
**Mục đích:** Hiển thị số đếm trên các tab filter (ví dụ: "Pending (12)")

---

#### 🔹 **Line 288: Fetch Appointments by Date**
```javascript
// Lấy danh sách appointment theo trung tâm và ngày cụ thể
// API: GET /appointment-management/by-service-center/{serviceCenterId}/date/{slotDate}
// ⚠️ Backend có bug timezone nên phải +1 ngày
response = await staffService.getAppointmentsByDate(
  serviceCenterId,
  adjustedDate, // slotDate + 1 day (workaround)
);
```
**Mục đích:** Lọc appointments theo ngày được chọn

---

#### 🔹 **Line 297: Fetch All Appointments (General)**
```javascript
// Lấy tất cả appointments (không filter ngày)
// API: GET /appointment-management?Page=1&PageSize=9&StatusId=...
response = await staffService.getStaffAppointments(params);
```
**Mục đích:** Load danh sách appointments với pagination

---

#### 🔹 **Line 411: Get Appointment Detail**
```javascript
// Lấy chi tiết một appointment khi click "View Details"
// API: GET /appointment-management/{appointmentId}
const detail = await staffService.getAppointmentDetail(appointmentId);
```
**Mục đích:** Hiển thị modal chi tiết appointment

---

#### 🔹 **Line 425: Confirm Appointment**
```javascript
// Xác nhận appointment (từ Pending → Confirmed)
// API: POST /appointment-management/{id}/confirm
// Body: { confirmationMethod, notes, sendConfirmationEmail, sendConfirmationSMS }
await staffService.confirmAppointment(appointmentId, {
  appointmentId,
  confirmationMethod: formValues.method || 'In-Person',
  notes: formValues.notes || 'Confirmed by staff via portal',
  sendConfirmationEmail: !!formValues.sendEmail,
  sendConfirmationSMS: !!formValues.sendSMS,
});
```
**Mục đích:** Xác nhận lịch hẹn sau khi gọi điện cho khách

---

#### 🔹 **Line 460: Check-in Appointment**
```javascript
// Check-in khách hàng khi họ đến trung tâm
// API: POST /appointment-management/{id}/check-in
// ✅ Tự động tạo WorkOrder và Checklist
await staffService.checkInAppointment(appointmentId);
```
**Mục đích:** Chuyển appointment sang WorkOrder, bắt đầu quy trình sửa chữa

---

## 📍 2. WORK ORDERS PAGE (`WorkOrders.jsx`)

### **Chức năng chính:**
- Quản lý WorkOrders (View, Search, Assign Technician, Track Progress)
- Apply Checklist Template
- Complete Work Order
- Quality Check
- Validate Delivery & Payment

### **API Calls trong WorkOrders.jsx:**

#### 🔹 **Line 147: Load Service Centers**
```javascript
// Lấy danh sách trung tâm dịch vụ (giống Appointments)
// API: GET /service-centers/active
const response = await staffService.getActiveServiceCenters();
```
**Mục đích:** Dropdown chọn trung tâm để search WorkOrders

---

#### 🔹 **Line 180: Fetch All Work Orders (List View)**
```javascript
// Lấy danh sách tất cả WorkOrders với pagination
// API: GET /work-orders?Page=1&PageSize=9
const response = await staffService.searchWorkOrders({
  Page: pageToLoad,
  PageNumber: pageToLoad,
  PageIndex: Math.max(0, pageToLoad - 1),
  PageSize: PAGE_SIZE,
});
```
**Mục đích:** Hiển thị danh sách WorkOrders trong grid view

---

#### 🔹 **Line 252: Fetch Technicians List**
```javascript
// Lấy danh sách tất cả technicians (cho dropdown manual assign)
// API: GET /technicians
const response = await staffService.getTechnicians();
```
**Mục đích:** Dropdown "Manual Assign Technician"

---

#### 🔹 **Line 262: Fetch Checklist Templates**
```javascript
// Lấy danh sách checklist templates
// API: GET /checklist-templates?IsActive=true&PageSize=50
const response = await staffService.getChecklistTemplates({
  IsActive: true,
  PageSize: 50,
});
```
**Mục đích:** Dropdown "Apply Checklist Template"

---

#### 🔹 **Line 277-279: Load Quality Check Data**
```javascript
// Lấy thông tin Quality Check của WorkOrder
// API: GET /work-orders/{id}/quality-check
const qcInfo = await staffService.getQualityCheckInfo(woId);

// Kiểm tra xem khách hàng đã có thể đánh giá chưa
// API: GET /work-orders/{id}/can-rate
const canRateInfo = await staffService.canRateWorkOrder(woId);
```
**Mục đích:** Hiển thị QC rating và trạng thái "Customer can rate"

---

#### 🔹 **Line 305: Get Work Order Detail**
```javascript
// Lấy chi tiết WorkOrder khi click vào card
// API: GET /work-orders/{id}
const detailResponse = await staffService.getWorkOrderDetail(woId);
```
**Mục đích:** Hiển thị detail view với đầy đủ thông tin

---

#### 🔹 **Line 311: Get Work Order Checklist**
```javascript
// Lấy checklist của WorkOrder
// API: GET /checklists/work-orders/{workOrderId}
// Response: { data: { items: [], totalItems, completedItems, completionPercentage } }
const checklistResponse = await staffService.getWorkOrderChecklist(woId);
```
**Mục đích:** Hiển thị danh sách checklist items và progress

---

#### 🔹 **Line 362: Search Work Orders by License Plate**
```javascript
// Tìm WorkOrder theo biển số xe
// API: GET /work-orders?SearchTerm={licensePlate}&ServiceCenterId={id}
const response = await staffService.searchWorkOrders({
  SearchTerm: trimmedPlate,
  ServiceCenterId: centerToUse,
  PageSize: 5,
  SortBy: 'CreatedDate',
  SortDirection: 'desc',
});
```
**Mục đích:** Quick search WorkOrder sau khi check-in

---

#### 🔹 **Line 460: Auto Select Best Technician**
```javascript
// Tự động chọn technician tốt nhất dựa trên AI/ML
// API: POST /technicians/auto-assign/best
// Body: { serviceCenterId, workDate, estimatedDurationMinutes }
const bestTech = await staffService.autoSelectTechnician({
  serviceCenterId: centerForAuto,
  workDate,
  estimatedDurationMinutes: estimatedDuration,
});
```
**Mục đích:** Button "Auto Assign Technician"

---

#### 🔹 **Line 490: Manual Assign Technician**
```javascript
// Gán technician thủ công cho WorkOrder
// API: PATCH /work-orders/{id}/assign-technician/{technicianId}
await staffService.assignTechnician(
  selectedWO.workOrderId || selectedWO.id,
  numericTechId,
);
```
**Mục đích:** Dropdown "Manual Assign" hoặc chọn từ Candidates Modal

---

#### 🔹 **Line 506: Apply Checklist Template**
```javascript
// Áp dụng checklist template cho WorkOrder
// API: POST /work-orders/{id}/apply-checklist
// Body: { templateId: 123 }
await staffService.applyChecklistTemplate(
  selectedWO.workOrderId || selectedWO.id,
  { templateId: Number(templateId) },
);
```
**Mục đích:** Dropdown "Select Template..."

---

#### 🔹 **Line 524: Start Work Order**
```javascript
// Bắt đầu WorkOrder (Assigned → InProgress)
// API: POST /work-orders/{id}/start
await staffService.startWorkOrder(
  selectedWO.workOrderId || selectedWO.id,
);
```
**Mục đích:** Button "Start Work Order"

---

#### 🔹 **Line 537: Complete Checklist Item**
```javascript
// Đánh dấu hoàn thành một checklist item
// API: PATCH /checklist-items/{id}/complete
// Body: raw string (notes)
await staffService.quickCompleteItem(itemId, 'Completed by staff');
```
**Mục đích:** Button "✓" bên cạnh mỗi checklist item

---

#### 🔹 **Line 551: Validate Checklist Before Complete**
```javascript
// Kiểm tra xem checklist đã hoàn thành 100% chưa
// API: GET /checklists/work-orders/{id}/validate
// Response: { canComplete: true/false, missingItems: [...] }
const validationResponse = await staffService.validateChecklist(
  selectedWO.workOrderId || selectedWO.id,
);
```
**Mục đích:** Ngăn staff complete WorkOrder khi checklist chưa xong

---

#### 🔹 **Line 574: Complete Work Order**
```javascript
// Hoàn thành WorkOrder (InProgress → Completed)
// API: POST /work-orders/{id}/complete
await staffService.completeWorkOrder(
  selectedWO.workOrderId || selectedWO.id,
);
```
**Mục đích:** Button "Complete Work Order"

---

#### 🔹 **Line 608: Perform Quality Check**
```javascript
// Ghi nhận Quality Check (staff đánh giá công việc)
// API: POST /work-orders/{id}/quality-check
// Body: { rating: 1-5, notes: "..." }
await staffService.performQualityCheck(
  selectedWO.workOrderId || selectedWO.id,
  {
    rating: qcRating,
    notes: qcNotes.trim(),
  },
);
```
**Mục đích:** Button "Save Quality Check"

---

## 📍 3. MODALS (Các chức năng phụ)

### **CreateAppointmentModal.jsx**

#### 🔹 **Search Customer by Phone**
```javascript
// API: GET /customers/search?phone={phoneNumber}
const response = await api.get('/customers/search', {
  params: { phone: phoneNumber }
});
```

#### 🔹 **Get Customer Vehicles**
```javascript
// API: GET /customers/{id}/vehicles
const response = await api.get(`/customers/${customerId}/vehicles`);
```

#### 🔹 **Get Available Services**
```javascript
// API: GET /services/active
const response = await api.get('/services/active');
```

#### 🔹 **Get Available Time Slots**
```javascript
// API: GET /time-slots/available?date={date}&serviceCenterId={id}
const response = await api.get('/time-slots/available', {
  params: { date, serviceCenterId }
});
```

#### 🔹 **Create New Appointment**
```javascript
// API: POST /appointment-management
// Body: { customerId, vehicleId, serviceCenterId, slotDate, timeSlotId, serviceIds, priority, notes }
const response = await staffService.createAppointment(appointmentData);
```

---

### **TechnicianCandidatesModal.jsx**

#### 🔹 **Get Top N Technician Candidates**
```javascript
// API: POST /technicians/auto-assign/candidates?topN=5
// Body: { serviceCenterId, workDate, estimatedDurationMinutes }
const response = await staffService.getTechnicianCandidates(
  {
    serviceCenterId,
    workDate,
    estimatedDurationMinutes,
  },
  topN
);
```
**Response:** Danh sách technicians với điểm số, kỹ năng, rating

---

### **AddServicesModal.jsx**

#### 🔹 **Search Services**
```javascript
// API: GET /services/active?search={term}
const response = await api.get('/services/active', {
  params: { search: searchTerm }
});
```

#### 🔹 **Add Services to Appointment**
```javascript
// API: POST /appointment-management/{id}/add-services
// Body: { serviceIds: [1, 2, 3] }
await staffService.addServicesToAppointment(appointmentId, serviceIds);
```

---

### **DeliveryPaymentModal.jsx**

#### 🔹 **Validate Delivery (Mode: validate)**
```javascript
// API: GET /work-orders/{id}/validate-delivery
// Response: { canDeliver: true/false, reasons: [...], unpaidAmount: 0 }
const response = await staffService.validateDelivery(workOrderId);
```
**Mục đích:** Kiểm tra xe có thể bàn giao không (đã thanh toán, đã QC, etc.)

---

#### 🔹 **Record Payment (Mode: payment)**
```javascript
// API: POST /appointment-management/{id}/payments/record-result
// Body: {
//   paymentMethod: 'Banking/VNPay/Cash',
//   amount: 1000000,
//   transactionCode: 'TXN123',
//   paymentStatus: 'Completed/Pending/Failed',
//   notes: '...'
// }
await staffService.recordPaymentResult(appointmentId, paymentData);
```
**Mục đích:** Ghi nhận thanh toán khi khách trả tiền trực tiếp/chuyển khoản

---

## 🔄 LUỒNG HOÀN CHỈNH (E2E Workflow)

### **Bước 1: Customer Walk-in/Call**
```
Staff → Appointments → Click "Tạo lịch hẹn"
→ CreateAppointmentModal → Nhập SĐT → Tìm khách hàng
→ Chọn xe → Chọn dịch vụ → Chọn ngày giờ → Submit
→ API: POST /appointment-management
```

### **Bước 2: Confirm Appointment**
```
Staff → Appointments → Filter "Pending" → Click appointment
→ View Details → Click "Confirm" → Chọn method (Phone/Email)
→ API: POST /appointment-management/{id}/confirm
→ Status: Pending → Confirmed
```

### **Bước 3: Customer Arrives - Check-in**
```
Staff → Appointments → Filter "Confirmed" → Click appointment
→ Click "Check-in" → Confirm
→ API: POST /appointment-management/{id}/check-in
→ ✅ Auto tạo WorkOrder + Checklist
→ Status: Confirmed → InProgress
→ Navigate to WorkOrders page
```

### **Bước 4: Assign Technician**
```
Staff → WorkOrders → Search by biển số
→ Click WorkOrder card → Detail View
→ Option 1: Click "Auto Assign"
  → API: POST /technicians/auto-assign/best
→ Option 2: Click "Chọn từ danh sách"
  → API: POST /technicians/auto-assign/candidates?topN=5
  → Pick từ modal
→ API: PATCH /work-orders/{id}/assign-technician/{technicianId}
```

### **Bước 5: Start Work Order**
```
Staff → WorkOrders Detail → Click "Start Work Order"
→ API: POST /work-orders/{id}/start
→ Status: Assigned → InProgress
```

### **Bước 6: Apply Checklist (nếu chưa có)**
```
Staff → WorkOrders Detail → Dropdown "Select Template"
→ API: POST /work-orders/{id}/apply-checklist
→ Checklist items xuất hiện
```

### **Bước 7: Complete Checklist Items**
```
Technician/Staff → WorkOrders Detail → Click "✓" bên mỗi item
→ API: PATCH /checklist-items/{id}/complete
→ Progress bar update (0% → 100%)
```

### **Bước 8: (Optional) Add Services During Work**
```
Staff → WorkOrders Detail → Click "Thêm dịch vụ"
→ AddServicesModal → Chọn services → Submit
→ API: POST /appointment-management/{id}/add-services
```

### **Bước 9: Complete Work Order**
```
Staff → WorkOrders Detail → Click "Complete Work Order"
→ API: GET /checklists/work-orders/{id}/validate (check 100%)
→ If OK → API: POST /work-orders/{id}/complete
→ Status: InProgress → Completed
```

### **Bước 10: Quality Check**
```
Staff → WorkOrders Detail → Rating (1-5) + Notes
→ Click "Save Quality Check"
→ API: POST /work-orders/{id}/quality-check
→ Customer now can rate (canRate = true)
```

### **Bước 11: Validate Delivery**
```
Staff → WorkOrders Detail → Click "Kiểm tra bàn giao"
→ DeliveryPaymentModal (mode: validate)
→ API: GET /work-orders/{id}/validate-delivery
→ Check: canDeliver, unpaidAmount, QC status
```

### **Bước 12: Record Payment**
```
Staff → WorkOrders Detail → Click "Ghi nhận thanh toán"
→ DeliveryPaymentModal (mode: payment)
→ Chọn Banking/VNPay/Cash → Nhập amount, transaction code
→ API: POST /appointment-management/{id}/payments/record-result
```

### **Bước 13: Handover Vehicle**
```
✅ Payment confirmed → Staff bàn giao xe cho khách
→ WorkOrder Status: Completed
→ Customer receives email/SMS with invoice
```

---

## 📊 API SUMMARY TABLE

| Page/Modal | API Endpoint | Method | Purpose |
|------------|-------------|--------|---------|
| **Appointments** |
| Appointments | `/service-centers/active` | GET | Load service centers dropdown |
| Appointments | `/appointment-management/statistics/by-status` | GET | Get appointment counts by status |
| Appointments | `/appointment-management/by-service-center/{id}/date/{date}` | GET | Filter appointments by date |
| Appointments | `/appointment-management` | GET | Get all appointments (pagination) |
| Appointments | `/appointment-management/{id}` | GET | Get appointment detail |
| Appointments | `/appointment-management/{id}/confirm` | POST | Confirm appointment |
| Appointments | `/appointment-management/{id}/check-in` | POST | Check-in → Create WorkOrder |
| **Work Orders** |
| WorkOrders | `/service-centers/active` | GET | Load service centers dropdown |
| WorkOrders | `/work-orders` | GET | Get all work orders (pagination/search) |
| WorkOrders | `/work-orders/{id}` | GET | Get work order detail |
| WorkOrders | `/technicians` | GET | Get all technicians list |
| WorkOrders | `/checklist-templates` | GET | Get checklist templates |
| WorkOrders | `/work-orders/{id}/quality-check` | GET | Get QC info |
| WorkOrders | `/work-orders/{id}/can-rate` | GET | Check if customer can rate |
| WorkOrders | `/checklists/work-orders/{id}` | GET | Get checklist items |
| WorkOrders | `/technicians/auto-assign/best` | POST | Auto select best technician |
| WorkOrders | `/work-orders/{id}/assign-technician/{techId}` | PATCH | Assign technician |
| WorkOrders | `/work-orders/{id}/apply-checklist` | POST | Apply checklist template |
| WorkOrders | `/work-orders/{id}/start` | POST | Start work order |
| WorkOrders | `/checklist-items/{id}/complete` | PATCH | Complete checklist item |
| WorkOrders | `/checklists/work-orders/{id}/validate` | GET | Validate checklist before complete |
| WorkOrders | `/work-orders/{id}/complete` | POST | Complete work order |
| WorkOrders | `/work-orders/{id}/quality-check` | POST | Perform quality check |
| **Modals** |
| CreateAppointment | `/customers/search?phone={phone}` | GET | Search customer by phone |
| CreateAppointment | `/customers/{id}/vehicles` | GET | Get customer vehicles |
| CreateAppointment | `/services/active` | GET | Get available services |
| CreateAppointment | `/time-slots/available` | GET | Get available time slots |
| CreateAppointment | `/appointment-management` | POST | Create new appointment |
| TechnicianCandidates | `/technicians/auto-assign/candidates?topN={n}` | POST | Get Top N technician suggestions |
| AddServices | `/services/active` | GET | Search services |
| AddServices | `/appointment-management/{id}/add-services` | POST | Add services to appointment |
| DeliveryPayment | `/work-orders/{id}/validate-delivery` | GET | Validate delivery conditions |
| DeliveryPayment | `/appointment-management/{id}/payments/record-result` | POST | Record payment result |

---

## 🎯 KEY POINTS

### ✅ Tự động hóa:
- Check-in → Tự động tạo WorkOrder + Checklist
- Auto Assign → AI chọn technician tốt nhất
- Validate Checklist → Không cho complete nếu chưa 100%

### 🔐 Business Rules:
- Phải Confirm trước khi Check-in
- Phải Check-in trước khi có WorkOrder
- Phải Assign Technician trước khi Start
- Phải Complete Checklist 100% trước khi Complete WorkOrder
- Phải Quality Check trước khi Deliver
- Phải Validate Delivery trước khi Handover

### 📱 Staff UX:
- Quick search bằng biển số xe
- Auto-fill sau Check-in (navigate to WorkOrders)
- Toast notifications cho mọi action
- Loading states cho async operations
- Error handling với user-friendly messages

---

**Tổng số API endpoints:** 30+
**Tổng số modals:** 5
**Tổng số pages:** 2

✅ **100% coverage** của Backend workflow requirements
