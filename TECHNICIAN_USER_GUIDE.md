# 🔧 Hướng Dẫn Sử Dụng - Technician Portal

## 📱 Đăng Nhập

1. Truy cập trang login: `http://localhost:3001/login`
2. Nhập thông tin tài khoản Technician:
   - **Username**: `Techtest001`
   - **Password**: *(mật khẩu của bạn)*
3. Click **"Sign in"**
4. Hệ thống tự động chuyển đến trang Dashboard

---

## 🏠 Dashboard - Trang Chủ

### Thông Tin Hiển Thị:

**Stats Cards** (4 thẻ thống kê):
- **Today's Work Orders**: Số lượng work order được giao hôm nay
- **Pending Tasks**: Số task đang chờ xử lý
- **In Progress**: Số work order đang thực hiện
- **Completed Today**: Số work order hoàn thành hôm nay

**Recent Work Orders**:
- Danh sách 5 work order gần nhất
- Thông tin: Mã WO, Biển số xe, Khách hàng, Trạng thái, Ngày tạo
- Nút **View** để xem chi tiết

### Các Thao Tác:
- Click **Refresh** để cập nhật dữ liệu mới nhất
- Click **View** để xem chi tiết work order

---

## 🛠️ My Work Orders - Quản Lý Công Việc

### Tìm Kiếm & Lọc:

**Thanh tìm kiếm**:
- Tìm theo biển số xe
- Tìm theo tên khách hàng

**Bộ lọc trạng thái**:
- **All**: Tất cả work orders
- **Assigned**: Đã được giao việc (chưa bắt đầu)
- **InProgress**: Đang thực hiện
- **Completed**: Đã hoàn thành

### Trạng Thái Work Order:

| Trạng thái | Màu | Ý nghĩa | Hành động |
|-----------|-----|---------|-----------|
| Assigned | Xanh dương | Đã giao việc | Click **Start Work** |
| InProgress | Xanh lam | Đang làm | Click **Checklist** hoặc **Complete** |
| Completed | Xanh lá | Đã xong | Chỉ xem |

### Các Thao Tác:

#### 1. **Start Work** (Bắt đầu công việc)
- **Khi nào**: Work order có trạng thái "Assigned"
- **Cách làm**: Click nút **"Start Work"**
- **Kết quả**: Trạng thái chuyển sang "InProgress"
- **Lưu ý**: Xác nhận trước khi bắt đầu

#### 2. **Checklist** (Mở danh sách công việc)
- **Khi nào**: Work order có trạng thái "InProgress"
- **Cách làm**: Click nút **"Checklist"**
- **Kết quả**: Mở trang Maintenance Checklist
- **Mục đích**: Thực hiện các bước bảo dưỡng

#### 3. **Complete** (Hoàn thành công việc)
- **Khi nào**: Đã hoàn thành 100% checklist
- **Cách làm**: Click nút **"Complete"**
- **Kết quả**: Work order chuyển sang "Completed"
- **Lưu ý**: Kiểm tra kỹ trước khi hoàn thành

---

## ✅ Maintenance Checklist - Danh Sách Công Việc

### Thông Tin Header:

**Work Order Info**:
- Số Work Order
- Thông tin xe: Hãng, Model, Biển số
- Thông tin khách hàng: Tên, SĐT
- Trạng thái hiện tại
- **Progress Bar**: Hiển thị % hoàn thành

### Danh Sách Công Việc:

**Mỗi item bao gồm**:
- ☐ **Checkbox**: Đánh dấu hoàn thành
- **Tên công việc**: Mô tả chi tiết
- **Category**: Loại công việc (Engine, Brakes, Electrical...)
- **Badge**:
  - **Optional**: Công việc không bắt buộc
  - Không có badge = **Required** (bắt buộc)
- **Estimated Time**: Thời gian ước tính (phút)

### Cách Thực Hiện:

#### Bước 1: Lọc theo Category (nếu cần)
```
[All] [Engine] [Brakes] [Electrical] [Body]...
```
- Click vào category để xem từng loại
- Click **All** để xem tất cả

#### Bước 2: Thực hiện từng công việc
1. Đọc kỹ tên công việc và mô tả
2. Thực hiện công việc thực tế
3. Click vào **checkbox** để đánh dấu hoàn thành
4. Hệ thống tự động lưu

#### Bước 3: Kiểm tra tiến độ
- Xem **Progress Bar** để biết % hoàn thành
- Màu xanh lá = đã hoàn thành
- Màu trắng = chưa hoàn thành

#### Bước 4: Hoàn thành Work Order
- Khi **100% complete**
- Nút **"Finish Work Order"** sẽ hiển thị màu xanh
- Click để hoàn thành

### Trạng Thái Checklist Item:

**Chưa hoàn thành**:
```
☐ Kiểm tra áp suất lốp
```

**Đã hoàn thành**:
```
☑ Kiểm tra áp suất lốp (màu xám, gạch ngang)
✅ Completed on 11/11/2025 10:30 AM by Techtest001
```

### Các Tính Năng Đặc Biệt:

#### 1. **Undo** (Hoàn tác)
- Click lại checkbox đã đánh dấu
- Hệ thống tự động bỏ đánh dấu
- Dùng khi thực hiện nhầm

#### 2. **Refresh** (Làm mới)
- Click nút **Refresh** ở góc phải
- Cập nhật dữ liệu mới nhất
- Dùng khi có thay đổi từ hệ thống khác

#### 3. **Back** (Quay lại)
- Click nút **Back** ở góc trái
- Quay về trang My Work Orders
- Tiến độ vẫn được lưu

---

## 🎯 Quy Trình Làm Việc Hoàn Chỉnh

### Ví Dụ: Bảo dưỡng định kỳ 10,000 km

#### **1. Nhận Nhiệm Vụ**
```
Dashboard → Thấy work order mới trong "Recent Work Orders"
Status: Assigned (màu xanh dương)
```

#### **2. Bắt Đầu Công Việc**
```
My Work Orders → Tìm work order → Click "Start Work"
Status chuyển: Assigned → InProgress
```

#### **3. Mở Checklist**
```
Click nút "Checklist" → Mở trang Maintenance Checklist
Progress: 0%
```

#### **4. Thực Hiện Bảo Dưỡng**
```
Category: Engine
  ☑ 1. Kiểm tra mức dầu động cơ (~5 min)
  ☑ 2. Kiểm tra lọc dầu (~3 min)
  ☑ 3. Thay dầu động cơ (~15 min)

Category: Brakes
  ☑ 4. Kiểm tra má phanh (~10 min)
  ☑ 5. Kiểm tra dầu phanh (~5 min)

Category: Tires
  ☑ 6. Kiểm tra áp suất lốp (~5 min)
  ☑ 7. Kiểm tra độ mòn lốp (~5 min)
  
Progress: 100%
```

#### **5. Hoàn Thành**
```
Click "Finish Work Order"
Xác nhận → Work order chuyển sang "Completed"
```

#### **6. Kiểm Tra Kết Quả**
```
Dashboard → "Completed Today" tăng lên 1
My Work Orders → Work order có status "Completed" (màu xanh lá)
```

---

## 💡 Tips & Tricks

### ⚡ Làm Việc Hiệu Quả:

1. **Kiểm tra Dashboard mỗi sáng**
   - Xem có work order mới không
   - Ưu tiên work order cũ nhất

2. **Sử dụng bộ lọc Status**
   - Filter "Assigned" để xem việc mới
   - Filter "InProgress" để tiếp tục việc dở

3. **Làm từng category**
   - Hoàn thành hết Engine rồi mới sang Brakes
   - Tránh nhảy lung tung

4. **Kiểm tra kỹ trước khi Complete**
   - Xem lại Progress = 100%
   - Đọc lại các item bắt buộc (Required)

5. **Refresh thường xuyên**
   - Cập nhật dữ liệu mới từ hệ thống
   - Tránh bị lỗi đồng bộ

### ⚠️ Lưu Ý Quan Trọng:

**⛔ KHÔNG được:**
- Complete work order khi checklist chưa 100%
- Bỏ qua các item **Required**
- Đánh dấu hoàn thành khi chưa thực hiện thực tế

**✅ NÊN làm:**
- Đọc kỹ mô tả từng công việc
- Thực hiện đúng quy trình kỹ thuật
- Báo cáo ngay khi phát hiện vấn đề bất thường
- Cập nhật tiến độ liên tục

---

## ❓ Xử Lý Sự Cố

### Vấn Đề 1: Không thấy work order mới
**Nguyên nhân**: Chưa được assign
**Giải pháp**: 
- Liên hệ Staff/Admin để assign work order
- Check email hoặc thông báo hệ thống

### Vấn Đề 2: Không Start được work order
**Nguyên nhân**: Status không phải "Assigned"
**Giải pháp**:
- Kiểm tra status hiện tại
- Nếu là "InProgress" → Vào Checklist luôn
- Nếu là "Completed" → Không thể Start lại

### Vấn Đề 3: Checklist không load
**Nguyên nhân**: Chưa có checklist template
**Giải pháp**:
- Báo Staff apply checklist template
- Hoặc liên hệ Admin

### Vấn Đề 4: Không Complete được
**Nguyên nhân**: Checklist chưa 100%
**Giải pháp**:
- Kiểm tra Progress Bar
- Tìm item chưa đánh dấu (chưa có ☑)
- Hoàn thành hết rồi mới Complete

### Vấn Đề 5: Đánh dấu nhầm item
**Giải pháp**: 
- Click lại checkbox để bỏ đánh dấu
- Hệ thống hỗ trợ Undo

---

## 📞 Hỗ Trợ

### Khi Cần Trợ Giúp:

1. **Vấn đề kỹ thuật xe**: Hỏi Supervisor
2. **Vấn đề hệ thống**: Liên hệ IT Support
3. **Vấn đề assign work order**: Liên hệ Staff/Admin

### Thông Tin Liên Hệ:
- **IT Support**: [Số điện thoại IT]
- **Staff**: [Số điện thoại Staff]
- **Admin**: [Số điện thoại Admin]

---

## 🎓 Video Hướng Dẫn

*(Coming Soon)*

### Danh Sách Video:
1. Đăng nhập và tổng quan Dashboard
2. Cách nhận và bắt đầu Work Order
3. Thực hiện Maintenance Checklist
4. Hoàn thành Work Order
5. Tips làm việc hiệu quả

---

**Phiên bản**: 1.0  
**Cập nhật lần cuối**: 11/11/2025  
**Dành cho**: Technician (Kỹ thuật viên bảo dưỡng)
