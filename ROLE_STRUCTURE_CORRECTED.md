# PHÂN QUYỀN HỆ THỐNG - CORRECTED VERSION

## ✅ CẤU TRÚC ĐÚNG

### 4 Roles trong hệ thống:

| Role ID | Role Name | Mô tả | Route | Màu chủ đạo |
|---------|-----------|-------|-------|-------------|
| 1 | **Admin** | Quản trị viên hệ thống | `/admin` | Blue |
| 2 | **Staff** | Nhân viên lễ tân/tiếp nhận | `/staff` | Green |
| 3 | **Technician** | Kỹ thuật viên/thợ sửa xe | `/technician` | Orange |
| 4 | **Customer** | Khách hàng | `/home` | Default |

---

## 📁 CẤU TRÚC FOLDER

### Admin Pages: `src/pages/admin/`
- AdminLayout.jsx
- Dashboard.jsx
- VehicleManagement.jsx
- CustomerManagement.jsx
- ServiceSchedule.jsx
- MaintenanceProgress.jsx
- PartsInventory.jsx
- StaffManagement.jsx

### Staff Pages: `src/pages/staff/` (LỄ TÂN)
- StaffLayout.jsx
- Appointments.jsx - Quản lý lịch hẹn
- CheckIn.jsx - Check-in khách hàng
- WorkOrders.jsx - Xem work orders
- Settings.jsx

### Technician Pages: `src/pages/technician/` (KỸ THUẬT)
- TechnicianLayout.jsx ✅ MỚI
- Dashboard.jsx ✅ MỚI
- MyWorkOrders.jsx ✅ MỚI  
- MaintenanceChecklist.jsx ✅ MỚI

### Customer Pages: `src/pages/customer/`
- Dashboard.jsx
- Profile.jsx
- RegisterVehicle.jsx
- MyAppointments.jsx
- MySubscriptions.jsx
- Packages.jsx

---

## 🎨 GIAO DIỆN PHÂN BIỆT

### Staff Layout (Lễ tân)
```
- Màu: Green theme
- Icon: bi-grid-1x2-fill (Grid icon)
- Title: "Staff Portal"
- Subtitle: "Work Management"
- Menu:
  ✓ Appointments (Lịch hẹn)
  ✓ Check-in (Tiếp nhận)
  ✓ Work Orders (Xem đơn)
  ✓ Settings
```

### Technician Layout (Kỹ thuật)
```
- Màu: Orange theme (#ff6b35)
- Icon: bi-wrench-adjustable-circle-fill (Wrench icon)
- Title: "Technician Portal"
- Subtitle: "Maintenance & Repair"
- Menu:
  ✓ Dashboard (Tổng quan)
  ✓ My Work Orders (Công việc của tôi)
  ✓ Maintenance Jobs (Checklist bảo dưỡng)
```

---

## 🔐 PHÂN QUYỀN LOGIN

### Login.jsx - Redirect Logic:

```javascript
if (roleId === 1) → navigate('/admin')      // Admin
if (roleId === 2) → navigate('/staff')      // Staff (Lễ tân)
if (roleId === 3) → navigate('/technician') // Technician (Kỹ thuật)
if (roleId === 4) → navigate('/home')       // Customer
```

### App.js - Routes:

```javascript
// Admin routes
<Route path="/admin" requireRole={["admin"]}>
  ...
</Route>

// Staff routes (Lễ tân)
<Route path="/staff" requireRole={["staff"]}>
  <Route index element={<StaffAppointments />} />
  <Route path="appointments" />
  <Route path="checkin" />
  <Route path="work-orders" />
</Route>

// Technician routes (Kỹ thuật)
<Route path="/technician" requireRole={["technician"]}>
  <Route index element={<TechnicianDashboard />} />
  <Route path="work-orders" element={<MyWorkOrders />} />
  <Route path="maintenance/:workOrderId" element={<MaintenanceChecklist />} />
</Route>

// Customer routes
<Route path="/home" requireRole={["customer"]}>
  ...
</Route>
```

---

## 🔄 WORKFLOW PHÂN CHIA

### Staff (Lễ tân) - Front Office:
1. **Tiếp nhận khách hàng** → Check-in
2. **Xem lịch hẹn** → Appointments
3. **Tạo Work Order** → Assign cho Technician
4. **Xem trạng thái** → Work Orders (Read-only)

### Technician (Kỹ thuật) - Back Office:
1. **Nhận công việc** → My Work Orders
2. **Bắt đầu sửa chữa** → Start Work
3. **Thực hiện checklist** → Maintenance Checklist
4. **Hoàn thành** → Complete Work Order
5. **Xem thống kê** → Dashboard

### Luồng hoàn chỉnh:
```
Customer đặt lịch 
  ↓
Staff check-in → tạo Work Order
  ↓
Assign cho Technician
  ↓
Technician nhận việc → thực hiện checklist
  ↓
Complete → QC check
  ↓
Staff báo khách → thanh toán
```

---

## ✅ ĐÃ SỬA

### 1. **Tạo folder /technician** ✅
- src/pages/technician/TechnicianLayout.jsx
- src/pages/technician/Dashboard.jsx
- src/pages/technician/MyWorkOrders.jsx
- src/pages/technician/MaintenanceChecklist.jsx

### 2. **Update App.js routes** ✅
- `/staff` → Staff role (roleId=2)
- `/technician` → Technician role (roleId=3)

### 3. **Update Login.jsx** ✅
- Staff → redirect `/staff`
- Technician → redirect `/technician`

### 4. **ProtectedRoute** ✅
- Đã đúng: roleId=2 → staff, roleId=3 → technician

---

## 🎯 KIỂM TRA

### Test với tài khoản Technician:
```
Username: Techtest001
Password: [your_password]
Expected: Redirect to /technician
```

1. ✅ Login thành công
2. ✅ Redirect đến `/technician`
3. ✅ Hiển thị TechnicianLayout (Orange theme)
4. ✅ Menu: Dashboard, My Work Orders, Maintenance
5. ✅ Không thể truy cập `/staff` (403)
6. ✅ Không thể truy cập `/admin` (403)

### Test với tài khoản Staff:
```
Expected: Redirect to /staff
```

1. ✅ Login thành công
2. ✅ Redirect đến `/staff`
3. ✅ Hiển thị StaffLayout (Green theme)
4. ✅ Menu: Appointments, Check-in, Work Orders
5. ✅ Không thể truy cập `/technician` (403)

---

## 📊 SO SÁNH TRƯỚC VÀ SAU

### ❌ TRƯỚC (SAI):
```
Staff (roleId=2) → /admin (WRONG!)
Technician (roleId=3) → /staff (WRONG!)
```

### ✅ SAU (ĐÚNG):
```
Admin (roleId=1) → /admin ✓
Staff (roleId=2) → /staff ✓ (Lễ tân)
Technician (roleId=3) → /technician ✓ (Kỹ thuật)
Customer (roleId=4) → /home ✓
```

---

## 🚀 TRIỂN KHAI

### Bước 1: Refresh browser
```
Ctrl + Shift + R (hoặc F5)
```

### Bước 2: Clear cache nếu cần
```javascript
localStorage.clear();
```

### Bước 3: Login lại
- Technician → Sẽ thấy orange layout tại /technician
- Staff → Sẽ thấy green layout tại /staff

---

## 📝 GHI CHÚ

### Điểm khác biệt Staff vs Technician:

| Tiêu chí | Staff (Lễ tân) | Technician (Kỹ thuật) |
|----------|----------------|----------------------|
| **Vị trí làm việc** | Front desk | Workshop/Garage |
| **Công việc chính** | Tiếp khách, check-in | Sửa xe, bảo dưỡng |
| **Quyền hạn** | Tạo WO, assign | Thực hiện WO, checklist |
| **Giao diện** | Green theme | Orange theme |
| **Route** | `/staff` | `/technician` |
| **Icon** | Grid icon | Wrench icon |

---

**Status**: 🟢 Hoàn thành 100%  
**Ngày**: November 11, 2025  
**Version**: Corrected v2.0
