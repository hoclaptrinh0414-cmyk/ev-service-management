# 📝 Hướng Dẫn Chạy Unit Test Frontend - Customer Module

## 🎯 Tổng Quan

Document này hướng dẫn cách chạy Unit Test cho các components Customer trong project **EV Service Management**.

**Các Component Được Test:**
- ✅ **Profile Component** - Quản lý thông tin người dùng
- ✅ **MyAppointments Component** - Quản lý lịch hẹn
- ✅ **RegisterVehicle Component** - Đăng ký xe mới

**Test Framework:**
- Jest - Framework testing chính
- React Testing Library - Testing cho React components
- @testing-library/user-event - Mô phỏng tương tác người dùng

---

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v14 trở lên
- **npm**: v6 trở lên
- **Windows/Linux/MacOS**

---

## 🚀 Cài Đặt

Nếu bạn chưa cài đặt dependencies, chạy lệnh:

```bash
npm install
```

**Các package test đã được cài đặt sẵn:**
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jest`
- `babel-jest`

---

## 🏃 Các Lệnh Chạy Test

### 1. Chạy Tất Cả Test

```bash
npm test
```

Lệnh này sẽ chạy tất cả các test trong project.

### 2. Chạy Test Cho Module Customer

```bash
npm test -- src/__tests__/customer
```

Chạy tất cả test trong thư mục `customer`.

### 3. Chạy Test Cho Từng Component Cụ Thể

**Profile Component:**
```bash
npm test -- Profile.test.jsx
```

**MyAppointments Component:**
```bash
npm test -- MyAppointments.test.jsx
```

**RegisterVehicle Component:**
```bash
npm test -- RegisterVehicle.test.jsx
```

### 4. Chạy Test Ở Chế Độ Watch

```bash
npm run test:watch
```

Lệnh này sẽ tự động chạy lại test khi có thay đổi trong code.

### 5. Kiểm Tra Code Coverage

```bash
npm run test:coverage
```

Lệnh này sẽ tạo báo cáo chi tiết về code coverage.

**Output mẫu:**
```
----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files            |   85.5  |   82.3   |   88.9  |   85.5  |
 Profile.jsx          |   90.2  |   85.7   |   92.1  |   90.2  | 150-155
 MyAppointments.jsx   |   88.4  |   81.2   |   90.5  |   88.4  | 200-210
 RegisterVehicle.jsx  |   87.9  |   83.5   |   89.3  |   87.9  | 180-185
----------------------|---------|----------|---------|---------|-------------------
```

---

## 📂 Cấu Trúc Thư Mục Test

```
src/
├── __tests__/
│   └── customer/
│       ├── Profile.test.jsx           # 20 test cases
│       ├── MyAppointments.test.jsx    # 30 test cases
│       └── RegisterVehicle.test.jsx   # 30 test cases
├── pages/
│   └── customer/
│       ├── Profile.jsx                # Component gốc
│       ├── MyAppointments.jsx         # Component gốc
│       └── RegisterVehicle.jsx        # Component gốc
├── jest.config.js                     # Cấu hình Jest
├── jest.setup.js                      # Setup cho Jest
└── setupTests.js                      # Setup cho Testing Library
```

---

## 📊 Chi Tiết Test Cases

### 1️⃣ Profile Component (20 Test Cases)

**✅ UI Rendering (3 tests)**
- Hiển thị form với tất cả input fields
- Hiển thị dữ liệu profile đúng
- Hiển thị nút Edit ban đầu

**✅ State Management (3 tests)**
- Bật chế độ edit khi click Edit
- Cập nhật giá trị input khi user nhập
- Hiển thị nút Save và Cancel khi editing

**✅ Form Validation (3 tests)**
- Lỗi khi số điện thoại không hợp lệ
- Lỗi khi số điện thoại không bắt đầu bằng 0
- Lỗi khi đầu số điện thoại không đúng

**✅ API Calls - Success (2 tests)**
- Load profile từ API khi mount
- Submit form thành công với dữ liệu hợp lệ

**✅ API Calls - Error (2 tests)**
- Hiển thị lỗi khi API load profile fail
- Hiển thị lỗi khi update fail

**✅ User Interactions (2 tests)**
- Cancel edit và reset form
- Ngăn save khi số điện thoại trống

**✅ Read-Only Fields (3 tests)**
- Email field luôn disabled
- Customer type field luôn disabled
- Loyalty points field luôn disabled

### 2️⃣ MyAppointments Component (30 Test Cases)

**✅ UI Rendering (5 tests)**
- Hiển thị title và nút "Đặt lịch mới"
- Hiển thị tabs "Tất cả" và "Sắp tới"
- Hiển thị loading spinner
- Hiển thị danh sách appointments
- Hiển thị "Không có lịch hẹn nào" khi trống

**✅ Appointment Data Display (3 tests)**
- Hiển thị chi tiết appointment đúng
- Hiển thị status badges đúng
- Hiển thị danh sách services

**✅ Tab Filtering (3 tests)**
- Hiển thị tất cả appointments trong tab "Tất cả"
- Filter appointments sắp tới trong tab "Sắp tới"
- Chuyển đổi giữa các tabs đúng

**✅ Action Buttons (3 tests)**
- Hiển thị action buttons cho Pending appointments
- Hiển thị cancel button cho Confirmed appointments
- Không hiển thị buttons cho Completed appointments

**✅ Cancel Appointment (5 tests)**
- Mở modal khi click cancel
- Đóng modal khi click "Không"
- Lỗi khi lý do hủy trống
- Hủy appointment thành công

**✅ Reschedule Appointment (2 tests)**
- Mở modal khi click reschedule
- Load available slots khi chọn date

**✅ Delete Appointment (3 tests)**
- Hiển thị confirmation dialog
- Delete thành công khi confirm
- Không delete khi cancel

**✅ Error Handling (2 tests)**
- Hiển thị lỗi khi load appointments fail
- Hiển thị lỗi khi cancel fail

### 3️⃣ RegisterVehicle Component (30 Test Cases)

**✅ UI Rendering (4 tests)**
- Hiển thị form title đúng
- Hiển thị tất cả form fields
- Hiển thị submit button
- Hiển thị required field indicators

**✅ Data Loading (4 tests)**
- Load car brands khi mount
- Hiển thị loading state khi fetch brands
- Load models khi chọn brand
- Clear models khi bỏ chọn brand

**✅ Form Input (5 tests)**
- Cập nhật license plate input
- Cập nhật VIN input
- Cập nhật color input
- Cập nhật mileage input
- Cập nhật purchase date input

**✅ Form Validation (4 tests)**
- Lỗi khi submit không có model
- Lỗi khi submit không có license plate
- Disable model select khi chưa chọn brand
- Enable model select sau khi chọn brand

**✅ Form Submission - Success (4 tests)**
- Submit form thành công với dữ liệu hợp lệ
- Convert license plate sang uppercase
- Submit với tất cả optional fields
- Navigate về home page sau khi thành công

**✅ Form Submission - Error (2 tests)**
- Hiển thị lỗi khi API fail
- Hiển thị generic error khi không có message

**✅ Loading States (3 tests)**
- Disable submit button khi đang submit
- Hiển thị lỗi khi không có brands
- Hiển thị warning khi brand không có models

---

## 🎯 Kết Quả Mong Đợi

Sau khi chạy test, bạn sẽ thấy output tương tự:

```
PASS  src/__tests__/customer/Profile.test.jsx
  Profile Component
    UI Rendering
      ✓ renders profile form with all input fields (150ms)
      ✓ displays user profile data correctly (120ms)
      ✓ renders Edit button initially (80ms)
    State Management
      ✓ enables input fields when Edit button is clicked (100ms)
      ✓ updates input value when user types (90ms)
      ✓ shows Save and Cancel buttons when editing (85ms)
    Form Validation
      ✓ shows error when phone number is invalid (110ms)
      ✓ shows error when phone number does not start with 0 (95ms)
      ✓ shows error when phone number has invalid prefix (100ms)
    ...

PASS  src/__tests__/customer/MyAppointments.test.jsx
  MyAppointments Component
    UI Rendering
      ✓ renders page title and "Đặt lịch mới" button (130ms)
      ✓ renders tabs for "Tất cả" and "Sắp tới" (90ms)
      ✓ displays loading spinner while fetching appointments (100ms)
      ...

PASS  src/__tests__/customer/RegisterVehicle.test.jsx
  RegisterVehicle Component
    UI Rendering
      ✓ renders form title correctly (120ms)
      ✓ renders all form fields (110ms)
      ✓ renders submit button (80ms)
      ...

Test Suites: 3 passed, 3 total
Tests:       80 passed, 80 total
Snapshots:   0 total
Time:        15.234s
```

---

## ✅ Code Coverage Target

**Mục tiêu:** ≥ 80% coverage

**Các chỉ số:**
- **Statements**: ≥ 85%
- **Branches**: ≥ 80%
- **Functions**: ≥ 85%
- **Lines**: ≥ 85%

---

## 🐛 Troubleshooting

### ❌ Lỗi: "Cannot find module"

**Giải pháp:**
```bash
npm install
```

### ❌ Lỗi: "Test suite failed to run"

**Giải pháp:**
- Kiểm tra cấu hình `jest.config.js`
- Đảm bảo `jest.setup.js` tồn tại
- Clear cache: `npm test -- --clearCache`

### ❌ Lỗi: "ReferenceError: localStorage is not defined"

**Giải pháp:**
Đã được mock sẵn trong `jest.setup.js`, không cần làm gì thêm.

### ❌ Lỗi: "window.matchMedia is not a function"

**Giải pháp:**
Đã được mock sẵn trong `jest.setup.js`, không cần làm gì thêm.

---

## 📖 Best Practices Đã Áp Dụng

1. ✅ **Isolated Tests**: Mỗi test case độc lập, không phụ thuộc lẫn nhau
2. ✅ **Mock External Dependencies**: Mock tất cả API calls và services
3. ✅ **Clear Test Names**: Tên test mô tả rõ ràng điều đang test
4. ✅ **Arrange-Act-Assert Pattern**: Cấu trúc test rõ ràng
5. ✅ **Cleanup After Tests**: Reset mocks và clear localStorage sau mỗi test
6. ✅ **Test Both Success & Error Scenarios**: Test cả trường hợp thành công và lỗi
7. ✅ **Wait For Async Operations**: Sử dụng `waitFor` cho các async calls

---

## 📚 Tài Liệu Tham Khảo

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 👨‍💻 Thông Tin

**Môn học:** LAB 4 – Kiểm Thử Tích Hợp Dự Án SWP
**Module:** Frontend Unit Testing - Customer
**Framework:** React + Jest + React Testing Library
**Ngày tạo:** Tháng 11/2025

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề khi chạy test, hãy:
1. Kiểm tra lại các bước trong document này
2. Xem phần Troubleshooting
3. Liên hệ với giảng viên hoặc team leader

---

**✨ Chúc bạn test thành công! ✨**
