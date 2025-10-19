# 📚 API Documentation - Quản Lý Xe Khách Hàng (Customer Vehicle Management)

> **Tài liệu API dành cho Frontend Team**
> **Dự án**: EV Service Center Management System
> **Module**: Quản lý xe của khách hàng (Customer Role)
> **Version**: 1.0
> **Ngày cập nhật**: 15/10/2025

---

## 📋 MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints](#api-endpoints)
   - [Quản lý xe của tôi](#1-quản-lý-xe-của-tôi-my-vehicles)
   - [Hỗ trợ chọn hãng & model xe](#2-api-hỗ-trợ---chọn-hãng-xe--model-xe)
4. [Data Models](#data-models)
5. [Flow tích hợp](#flow-tích-hợp)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 🎯 TỔNG QUAN

Module này cung cấp các API cho phép **Khách hàng (Customer)** quản lý xe điện của họ trong hệ thống, bao gồm:

- ✅ Xem danh sách xe đã đăng ký
- ✅ Xem chi tiết thông tin từng xe
- ✅ Đăng ký xe mới
- ✅ Theo dõi lịch bảo dưỡng, bảo hiểm, đăng kiểm
- ✅ Xem lịch sử chi tiêu cho mỗi xe

**Base URL**: `https://your-api-domain.com`

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Headers yêu cầu

Tất cả API (trừ API public) đều yêu cầu:

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Phân quyền

| API Group | Policy | Mô tả |
|-----------|--------|-------|
| `/api/customer/profile/my-vehicles/*` | `CustomerOnly` | Chỉ khách hàng đăng nhập |
| `/api/car-brands/active` | `AllowAnonymous` | Public, không cần token |
| `/api/car-models/active` | `AllowAnonymous` | Public, không cần token |
| `/api/car-models/by-brand/{id}` | `AllowAnonymous` | Public, không cần token |

### Lấy CustomerId từ Token

Backend **tự động** extract `CustomerId` từ JWT token, Frontend **KHÔNG** cần truyền `customerId` trong request body.

---

## 📡 API ENDPOINTS

### 1. QUẢN LÝ XE CỦA TÔI (MY VEHICLES)

#### 1.1. Xem danh sách xe của tôi

```http
GET /api/customer/profile/my-vehicles
```

**Description**: Lấy danh sách tất cả xe đã đăng ký dưới tên khách hàng hiện tại.

**Authorization**: ✅ Required (Bearer Token - CustomerOnly)

**Request**:
```http
GET /api/customer/profile/my-vehicles HTTP/1.1
Host: your-api-domain.com
Authorization: Bearer {access_token}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Tìm thấy 2 xe",
  "data": [
    {
      "vehicleId": 1,
      "customerId": 10,
      "customerName": "Nguyễn Văn A",
      "customerCode": "CUS001",

      "modelId": 5,
      "modelName": "Model 3",
      "brandId": 2,
      "brandName": "Tesla",
      "fullModelName": "Tesla Model 3",

      "licensePlate": "30A-12345",
      "vin": "5YJ3E1EA1KF123456",
      "color": "Xanh",
      "purchaseDate": "2023-05-15",
      "mileage": 15000,

      "lastMaintenanceDate": "2024-09-01",
      "nextMaintenanceDate": "2024-12-01",
      "lastMaintenanceMileage": 14000,
      "nextMaintenanceMileage": 20000,

      "batteryHealthPercent": 95.5,
      "vehicleCondition": "Tốt",

      "insuranceNumber": "BH123456",
      "insuranceExpiry": "2025-05-15",
      "registrationExpiry": "2025-05-15",

      "notes": null,
      "isActive": true,
      "createdDate": "2023-05-15T10:00:00",
      "updatedDate": "2024-10-01T14:30:00",

      "isMaintenanceDue": false,
      "isInsuranceExpiring": false,
      "isRegistrationExpiring": false,
      "daysSinceLastMaintenance": 45,
      "daysUntilNextMaintenance": 15,
      "maintenanceStatus": "Bình thường",

      "totalWorkOrders": 5,
      "totalMaintenanceRecords": 8,
      "totalSpentOnVehicle": 15000000.00
    },
    {
      "vehicleId": 2,
      "customerId": 10,
      "customerName": "Nguyễn Văn A",
      "customerCode": "CUS001",
      "modelId": 8,
      "modelName": "VF e34",
      "brandId": 1,
      "brandName": "VinFast",
      "fullModelName": "VinFast VF e34",
      "licensePlate": "51F-67890",
      "vin": "LVVDB11B0KE123456",
      "color": "Đỏ",
      "purchaseDate": "2024-01-10",
      "mileage": 5000,
      "lastMaintenanceDate": "2024-08-15",
      "nextMaintenanceDate": "2024-11-15",
      "lastMaintenanceMileage": 4500,
      "nextMaintenanceMileage": 10000,
      "batteryHealthPercent": 98.2,
      "vehicleCondition": "Tốt",
      "insuranceNumber": "BH789012",
      "insuranceExpiry": "2025-01-10",
      "registrationExpiry": "2025-01-10",
      "notes": null,
      "isActive": true,
      "createdDate": "2024-01-10T09:00:00",
      "updatedDate": "2024-09-20T11:15:00",
      "isMaintenanceDue": true,
      "isInsuranceExpiring": false,
      "isRegistrationExpiring": false,
      "daysSinceLastMaintenance": 60,
      "daysUntilNextMaintenance": 5,
      "maintenanceStatus": "Cần chú ý",
      "totalWorkOrders": 2,
      "totalMaintenanceRecords": 3,
      "totalSpentOnVehicle": 5000000.00
    }
  ],
  "errorCode": null
}
```

**Use Cases**:
- Hiển thị danh sách xe trong trang "Xe của tôi"
- Dropdown chọn xe khi đặt lịch bảo dưỡng
- Dashboard hiển thị tổng số xe và trạng thái

**UI Suggestions**:
- Hiển thị badge cảnh báo nếu `isMaintenanceDue: true`
- Highlight xe có `maintenanceStatus: "Khẩn cấp"` bằng màu đỏ
- Icon pin với % tương ứng `batteryHealthPercent`

---

#### 1.2. Xem chi tiết xe

```http
GET /api/customer/profile/my-vehicles/{vehicleId}
```

**Description**: Lấy thông tin chi tiết của 1 xe cụ thể. Backend sẽ kiểm tra xe có thuộc về customer hiện tại không.

**Authorization**: ✅ Required (Bearer Token - CustomerOnly)

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vehicleId` | integer | ✅ Yes | ID của xe cần xem |

**Request**:
```http
GET /api/customer/profile/my-vehicles/1 HTTP/1.1
Host: your-api-domain.com
Authorization: Bearer {access_token}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy thông tin xe thành công",
  "data": {
    "vehicleId": 1,
    "customerId": 10,
    "customerName": "Nguyễn Văn A",
    "customerCode": "CUS001",
    "modelId": 5,
    "modelName": "Model 3",
    "brandId": 2,
    "brandName": "Tesla",
    "fullModelName": "Tesla Model 3",
    "licensePlate": "30A-12345",
    "vin": "5YJ3E1EA1KF123456",
    "color": "Xanh",
    "purchaseDate": "2023-05-15",
    "mileage": 15000,
    "lastMaintenanceDate": "2024-09-01",
    "nextMaintenanceDate": "2024-12-01",
    "lastMaintenanceMileage": 14000,
    "nextMaintenanceMileage": 20000,
    "batteryHealthPercent": 95.5,
    "vehicleCondition": "Tốt",
    "insuranceNumber": "BH123456",
    "insuranceExpiry": "2025-05-15",
    "registrationExpiry": "2025-05-15",
    "notes": null,
    "isActive": true,
    "createdDate": "2023-05-15T10:00:00",
    "updatedDate": "2024-10-01T14:30:00",
    "isMaintenanceDue": false,
    "isInsuranceExpiring": false,
    "isRegistrationExpiring": false,
    "daysSinceLastMaintenance": 45,
    "daysUntilNextMaintenance": 15,
    "maintenanceStatus": "Bình thường",
    "totalWorkOrders": 5,
    "totalMaintenanceRecords": 8,
    "totalSpentOnVehicle": 15000000.00
  },
  "errorCode": null
}
```

**Response Error (404 Not Found)**:
```json
{
  "success": false,
  "message": "Không tìm thấy xe với ID 999",
  "data": null,
  "errorCode": "VEHICLE_NOT_FOUND"
}
```

**Response Error (403 Forbidden)**:
```json
// HTTP Status 403 - Xe không thuộc về customer này
// Backend tự động kiểm tra ownership
```

**Use Cases**:
- Trang chi tiết xe
- Xem đầy đủ thông tin trước khi đặt lịch
- Kiểm tra lịch sử bảo dưỡng và chi phí

---

#### 1.3. Đăng ký xe mới

```http
POST /api/customer/profile/my-vehicles
```

**Description**: Customer tự đăng ký xe mới. `CustomerId` được tự động gán từ token, **KHÔNG** cần truyền trong request body.

**Authorization**: ✅ Required (Bearer Token - CustomerOnly)

**Request Headers**:
```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Request Body** (`RegisterMyVehicleRequestDto`):
```json
{
  "modelId": 5,
  "licensePlate": "30A-12345",
  "vin": "5YJ3E1EA1KF123456",
  "color": "Xanh",
  "purchaseDate": "2023-05-15",
  "mileage": 0,
  "insuranceNumber": "BH123456",
  "insuranceExpiry": "2025-05-15",
  "registrationExpiry": "2025-05-15"
}
```

**Request Body Schema**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `modelId` | integer | ✅ Yes | ID của model xe (từ API car-models) | > 0 |
| `licensePlate` | string | ✅ Yes | Biển số xe | Unique, format VN |
| `vin` | string | ❌ No | Số khung | Max 17 ký tự |
| `color` | string | ❌ No | Màu xe | Max 50 ký tự |
| `purchaseDate` | string (DateOnly) | ❌ No | Ngày mua xe | Format: `YYYY-MM-DD` |
| `mileage` | integer | ❌ No | Số km hiện tại | >= 0 |
| `insuranceNumber` | string | ❌ No | Số bảo hiểm | Max 50 ký tự |
| `insuranceExpiry` | string (DateOnly) | ❌ No | Hạn bảo hiểm | Format: `YYYY-MM-DD` |
| `registrationExpiry` | string (DateOnly) | ❌ No | Hạn đăng kiểm | Format: `YYYY-MM-DD` |

**⚠️ Lưu ý quan trọng**:
- ❌ **KHÔNG** truyền `customerId` - Backend tự động gán từ token
- ✅ `licensePlate` phải **unique** trong toàn hệ thống
- ✅ `modelId` phải tồn tại và active
- ✅ DateOnly format: `YYYY-MM-DD` (không có time)

**Response Success (201 Created)**:
```json
{
  "success": true,
  "message": "Đăng ký xe thành công",
  "data": {
    "vehicleId": 15,
    "customerId": 10,
    "customerName": "Nguyễn Văn A",
    "customerCode": "CUS001",
    "modelId": 5,
    "modelName": "Model 3",
    "brandId": 2,
    "brandName": "Tesla",
    "fullModelName": "Tesla Model 3",
    "licensePlate": "30A-12345",
    "vin": "5YJ3E1EA1KF123456",
    "color": "Xanh",
    "purchaseDate": "2023-05-15",
    "mileage": 0,
    "lastMaintenanceDate": null,
    "nextMaintenanceDate": null,
    "lastMaintenanceMileage": null,
    "nextMaintenanceMileage": null,
    "batteryHealthPercent": null,
    "vehicleCondition": null,
    "insuranceNumber": "BH123456",
    "insuranceExpiry": "2025-05-15",
    "registrationExpiry": "2025-05-15",
    "notes": null,
    "isActive": true,
    "createdDate": "2024-10-15T10:30:00",
    "updatedDate": null,
    "isMaintenanceDue": false,
    "isInsuranceExpiring": false,
    "isRegistrationExpiring": false,
    "daysSinceLastMaintenance": null,
    "daysUntilNextMaintenance": null,
    "maintenanceStatus": "Chưa có dữ liệu",
    "totalWorkOrders": 0,
    "totalMaintenanceRecords": 0,
    "totalSpentOnVehicle": 0.00
  },
  "errorCode": null
}
```

**Response Error (400 Bad Request) - Validation Error**:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "data": null,
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "licensePlate",
      "message": "Biển số xe không được để trống"
    },
    {
      "field": "modelId",
      "message": "ModelId phải lớn hơn 0"
    }
  ]
}
```

**Response Error (400 Bad Request) - Business Rule**:
```json
{
  "success": false,
  "message": "Biển số xe 30A-12345 đã tồn tại trong hệ thống",
  "data": null,
  "errorCode": "BUSINESS_RULE_VIOLATION"
}
```

**Use Cases**:
- Form đăng ký xe mới
- Customer vừa mua xe
- Thêm xe thứ 2, 3... vào tài khoản

---

### 2. API HỖ TRỢ - CHỌN HÃNG XE & MODEL XE

#### 2.1. Lấy danh sách hãng xe đang hoạt động

```http
GET /api/car-brands/active
```

**Description**: Lấy danh sách tất cả hãng xe đang hoạt động (IsActive = true). API này public, không yêu cầu authentication.

**Authorization**: ❌ Not Required (AllowAnonymous)

**Request**:
```http
GET /api/car-brands/active HTTP/1.1
Host: your-api-domain.com
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "brandId": 1,
      "brandName": "VinFast",
      "country": "Vietnam",
      "logoUrl": "https://example.com/logos/vinfast.png",
      "description": "Hãng xe điện hàng đầu Việt Nam",
      "isActive": true,
      "totalModels": 5,
      "createdDate": "2020-01-01T00:00:00"
    },
    {
      "brandId": 2,
      "brandName": "Tesla",
      "country": "USA",
      "logoUrl": "https://example.com/logos/tesla.png",
      "description": "Công ty xe điện và năng lượng sạch",
      "isActive": true,
      "totalModels": 4,
      "createdDate": "2020-01-01T00:00:00"
    },
    {
      "brandId": 3,
      "brandName": "BYD",
      "country": "China",
      "logoUrl": "https://example.com/logos/byd.png",
      "description": "Build Your Dreams",
      "isActive": true,
      "totalModels": 6,
      "createdDate": "2020-01-01T00:00:00"
    }
  ],
  "errorCode": null
}
```

**Use Cases**:
- Dropdown/Select chọn hãng xe (Bước 1 đăng ký xe)
- Hiển thị logo và thông tin hãng xe
- Filter xe theo hãng

---

#### 2.2. Lấy danh sách model xe theo hãng

```http
GET /api/car-models/by-brand/{brandId}
```

**Description**: Lấy danh sách tất cả model xe của 1 hãng cụ thể. API này public, không yêu cầu authentication.

**Authorization**: ❌ Not Required (AllowAnonymous)

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandId` | integer | ✅ Yes | ID của hãng xe |

**Request**:
```http
GET /api/car-models/by-brand/2 HTTP/1.1
Host: your-api-domain.com
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Tìm thấy 3 dòng xe",
  "data": [
    {
      "modelId": 5,
      "brandId": 2,
      "brandName": "Tesla",
      "modelName": "Model 3",
      "year": 2023,
      "batteryCapacity": 75.0,
      "range": 500,
      "fuelType": "Electric",
      "seats": 5,
      "description": "Sedan điện cao cấp với công nghệ Autopilot",
      "imageUrl": "https://example.com/models/model3.png",
      "price": 1200000000.00,
      "isActive": true
    },
    {
      "modelId": 6,
      "brandId": 2,
      "brandName": "Tesla",
      "modelName": "Model Y",
      "year": 2023,
      "batteryCapacity": 82.0,
      "range": 530,
      "fuelType": "Electric",
      "seats": 7,
      "description": "SUV điện 7 chỗ thực dụng",
      "imageUrl": "https://example.com/models/modely.png",
      "price": 1400000000.00,
      "isActive": true
    },
    {
      "modelId": 7,
      "brandId": 2,
      "brandName": "Tesla",
      "modelName": "Model S",
      "year": 2023,
      "batteryCapacity": 100.0,
      "range": 650,
      "fuelType": "Electric",
      "seats": 5,
      "description": "Sedan hạng sang với hiệu suất vượt trội",
      "imageUrl": "https://example.com/models/models.png",
      "price": 2500000000.00,
      "isActive": true
    }
  ],
  "errorCode": null
}
```

**Use Cases**:
- Dropdown/Select chọn model xe (Bước 2 đăng ký xe)
- Hiển thị thông tin chi tiết model (battery, range, seats)
- So sánh các model trong cùng hãng

---

#### 2.3. Lấy tất cả model xe đang hoạt động

```http
GET /api/car-models/active
```

**Description**: Lấy danh sách tất cả model xe đang hoạt động (không phân theo hãng).

**Authorization**: ❌ Not Required (AllowAnonymous)

**Request**:
```http
GET /api/car-models/active HTTP/1.1
Host: your-api-domain.com
```

**Response Success (200 OK)**: Giống như API `/by-brand/{brandId}` nhưng trả về tất cả model từ tất cả hãng.

**Use Cases**:
- Search/autocomplete tìm model xe
- Hiển thị tất cả model không cần phân theo hãng

---

## 📦 DATA MODELS

### CustomerVehicleResponseDto

```typescript
interface CustomerVehicleResponseDto {
  // Vehicle Info
  vehicleId: number;
  customerId: number;
  customerName: string;
  customerCode: string;

  // Model & Brand Info
  modelId: number;
  modelName: string;
  brandId: number;
  brandName: string;
  fullModelName: string;

  // Vehicle Details
  licensePlate: string;
  vin?: string;
  color?: string;
  purchaseDate?: string; // DateOnly: "YYYY-MM-DD"
  mileage?: number;

  // Maintenance Info
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  lastMaintenanceMileage?: number;
  nextMaintenanceMileage?: number;

  // Health Info
  batteryHealthPercent?: number;
  vehicleCondition?: string;

  // Insurance & Registration
  insuranceNumber?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;

  // Meta
  notes?: string;
  isActive: boolean;
  createdDate: string; // DateTime ISO 8601
  updatedDate?: string;

  // Computed Fields - Warning Flags
  isMaintenanceDue: boolean;
  isInsuranceExpiring: boolean;
  isRegistrationExpiring: boolean;
  daysSinceLastMaintenance?: number;
  daysUntilNextMaintenance?: number;
  maintenanceStatus: string; // "Bình thường" | "Cần chú ý" | "Khẩn cấp"

  // Statistics
  totalWorkOrders?: number;
  totalMaintenanceRecords?: number;
  totalSpentOnVehicle?: number;
}
```

### RegisterMyVehicleRequestDto

```typescript
interface RegisterMyVehicleRequestDto {
  modelId: number;                    // ✅ Required
  licensePlate: string;               // ✅ Required
  vin?: string;                       // Optional
  color?: string;                     // Optional
  purchaseDate?: string;              // Optional - DateOnly: "YYYY-MM-DD"
  mileage?: number;                   // Optional - Default: 0
  insuranceNumber?: string;           // Optional
  insuranceExpiry?: string;           // Optional - DateOnly: "YYYY-MM-DD"
  registrationExpiry?: string;        // Optional - DateOnly: "YYYY-MM-DD"

  // ❌ DO NOT SEND customerId - Auto-assigned from JWT token
}
```

### CarBrandResponseDto

```typescript
interface CarBrandResponseDto {
  brandId: number;
  brandName: string;
  country: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  totalModels?: number;
  createdDate: string;
}
```

### CarModelResponseDto

```typescript
interface CarModelResponseDto {
  modelId: number;
  brandId: number;
  brandName: string;
  modelName: string;
  year?: number;
  batteryCapacity?: number;           // kWh
  range?: number;                     // km
  fuelType?: string;                  // "Electric", "Hybrid", etc.
  seats?: number;
  description?: string;
  imageUrl?: string;
  price?: number;
  isActive: boolean;
}
```

### ApiResponse<T>

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

---

## 🔄 FLOW TÍCH HỢP

### Flow 1: Đăng ký xe mới

```
┌─────────────────────────────────────────────────────────────┐
│                    ĐĂNG KÝ XE MỚI                           │
└─────────────────────────────────────────────────────────────┘

Step 1: Load danh sách hãng xe
┌──────────────────────────────┐
│ GET /api/car-brands/active   │
└──────────────────────────────┘
         │
         ▼
    Hiển thị dropdown hãng xe
    (VinFast, Tesla, BYD...)
         │
         ▼
Step 2: User chọn hãng (ví dụ: Tesla, brandId=2)
         │
         ▼
┌─────────────────────────────────────┐
│ GET /api/car-models/by-brand/2     │
└─────────────────────────────────────┘
         │
         ▼
    Hiển thị dropdown model xe
    (Model 3, Model Y, Model S...)
         │
         ▼
Step 3: User chọn model và điền thông tin
    - Model: Model 3 (modelId=5)
    - Biển số: 30A-12345
    - Màu: Xanh
    - Số km: 0
    - Bảo hiểm, đăng kiểm...
         │
         ▼
Step 4: Submit form
┌───────────────────────────────────────────────┐
│ POST /api/customer/profile/my-vehicles       │
│ Body: {                                       │
│   "modelId": 5,                              │
│   "licensePlate": "30A-12345",               │
│   "color": "Xanh",                           │
│   ...                                        │
│ }                                            │
└───────────────────────────────────────────────┘
         │
         ▼
    ✅ Success (201) → Redirect to vehicle list
    ❌ Error (400) → Show validation errors
```

### Flow 2: Xem danh sách xe và chi tiết

```
┌─────────────────────────────────────────────────────────────┐
│                 XEM DANH SÁCH XE                            │
└─────────────────────────────────────────────────────────────┘

Step 1: Load danh sách xe
┌────────────────────────────────────────┐
│ GET /api/customer/profile/my-vehicles  │
└────────────────────────────────────────┘
         │
         ▼
    Hiển thị danh sách (Card/Table view)
    - 30A-12345 | Tesla Model 3 | 15,000 km
    - 51F-67890 | VinFast VF e34 | 5,000 km
         │
         ▼
Step 2: User click vào xe để xem chi tiết
         │
         ▼
┌─────────────────────────────────────────────────┐
│ GET /api/customer/profile/my-vehicles/1        │
└─────────────────────────────────────────────────┘
         │
         ▼
    Hiển thị trang chi tiết xe
    - Thông tin cơ bản
    - Lịch bảo dưỡng
    - Bảo hiểm/Đăng kiểm
    - Thống kê chi phí
    - Cảnh báo (nếu có)
```

### Flow 3: Cảnh báo & Nhắc nhở

```typescript
// Frontend Logic để hiển thị cảnh báo

const getMaintenanceAlert = (vehicle: CustomerVehicleResponseDto) => {
  if (vehicle.isMaintenanceDue && vehicle.maintenanceStatus === "Khẩn cấp") {
    return {
      type: "error",
      message: `Xe ${vehicle.licensePlate} cần bảo dưỡng gấp! Đã quá ${vehicle.daysSinceLastMaintenance} ngày kể từ lần bảo dưỡng cuối.`
    };
  }

  if (vehicle.isMaintenanceDue && vehicle.maintenanceStatus === "Cần chú ý") {
    return {
      type: "warning",
      message: `Xe ${vehicle.licensePlate} sắp đến lịch bảo dưỡng (còn ${vehicle.daysUntilNextMaintenance} ngày).`
    };
  }

  if (vehicle.isInsuranceExpiring) {
    return {
      type: "warning",
      message: `Bảo hiểm xe ${vehicle.licensePlate} sắp hết hạn (${vehicle.insuranceExpiry}).`
    };
  }

  if (vehicle.isRegistrationExpiring) {
    return {
      type: "warning",
      message: `Đăng kiểm xe ${vehicle.licensePlate} sắp hết hạn (${vehicle.registrationExpiry}).`
    };
  }

  return null;
};
```

---

## ⚠️ ERROR HANDLING

### HTTP Status Codes

| Status Code | Description | When it occurs |
|-------------|-------------|----------------|
| `200 OK` | Success | Request thành công |
| `201 Created` | Resource created | Tạo xe mới thành công |
| `400 Bad Request` | Validation error | Dữ liệu không hợp lệ |
| `401 Unauthorized` | Missing/invalid token | Chưa đăng nhập hoặc token hết hạn |
| `403 Forbidden` | Permission denied | Truy cập xe của người khác |
| `404 Not Found` | Resource not found | Không tìm thấy xe |
| `500 Internal Server Error` | Server error | Lỗi server |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message: string;              // Human-readable error message
  data: null;
  errorCode: string;            // Machine-readable error code
  errors?: Array<{              // Optional validation errors
    field: string;
    message: string;
  }>;
}
```

### Common Error Codes

| Error Code | Description | HTTP Status | Solution |
|------------|-------------|-------------|----------|
| `VALIDATION_ERROR` | Dữ liệu không hợp lệ | 400 | Check request body format |
| `BUSINESS_RULE_VIOLATION` | Vi phạm business rule | 400 | Xem message để biết chi tiết |
| `VEHICLE_NOT_FOUND` | Không tìm thấy xe | 404 | Check vehicleId có đúng không |
| `CUSTOMER_NOT_FOUND` | Không tìm thấy customer | 404 | User chưa có profile customer |
| `INTERNAL_ERROR` | Lỗi server | 500 | Contact backend team |

### Frontend Error Handling Example

```typescript
const registerVehicle = async (data: RegisterMyVehicleRequestDto) => {
  try {
    const response = await fetch('/api/customer/profile/my-vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle error
      if (response.status === 400) {
        if (result.errorCode === 'VALIDATION_ERROR' && result.errors) {
          // Show validation errors
          result.errors.forEach(err => {
            showFieldError(err.field, err.message);
          });
        } else {
          // Show business rule error
          showToast('error', result.message);
        }
      } else if (response.status === 401) {
        // Redirect to login
        redirectToLogin();
      } else {
        // Generic error
        showToast('error', 'Có lỗi xảy ra, vui lòng thử lại');
      }
      return null;
    }

    // Success
    showToast('success', result.message);
    return result.data;

  } catch (error) {
    // Network error
    showToast('error', 'Không thể kết nối đến server');
    return null;
  }
};
```

---

## ✅ BEST PRACTICES

### 1. Authentication

```typescript
// Tạo axios instance với interceptor
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://your-api-domain.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Date Handling

```typescript
// Format DateOnly cho API (YYYY-MM-DD)
const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Parse DateOnly từ API
const parseDateFromAPI = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

// Example usage
const request: RegisterMyVehicleRequestDto = {
  modelId: 5,
  licensePlate: '30A-12345',
  purchaseDate: formatDateForAPI(new Date()),
  insuranceExpiry: formatDateForAPI(new Date('2025-05-15'))
};
```

### 3. Form Validation (Frontend)

```typescript
// Validate biển số xe VN
const validateLicensePlate = (plate: string): boolean => {
  // Format: 30A-12345, 51F-67890, etc.
  const regex = /^\d{2}[A-Z]-\d{4,5}$/;
  return regex.test(plate);
};

// Validate VIN (17 ký tự)
const validateVIN = (vin: string): boolean => {
  return vin.length === 17;
};

// Validate mileage
const validateMileage = (mileage: number): boolean => {
  return mileage >= 0 && mileage <= 999999;
};
```

### 4. Caching Strategy

```typescript
// Cache danh sách hãng xe (ít thay đổi)
const getCarBrands = async (): Promise<CarBrandResponseDto[]> => {
  const cacheKey = 'car_brands';
  const cacheTime = 24 * 60 * 60 * 1000; // 24 hours

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheTime) {
      return data;
    }
  }

  const response = await apiClient.get('/api/car-brands/active');
  const data = response.data.data;

  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));

  return data;
};

// KHÔNG cache danh sách xe của customer (thường xuyên thay đổi)
const getMyVehicles = async (): Promise<CustomerVehicleResponseDto[]> => {
  const response = await apiClient.get('/api/customer/profile/my-vehicles');
  return response.data.data;
};
```

### 5. Loading & Error States

```typescript
interface VehicleListState {
  vehicles: CustomerVehicleResponseDto[];
  loading: boolean;
  error: string | null;
}

const [state, setState] = useState<VehicleListState>({
  vehicles: [],
  loading: true,
  error: null
});

const loadVehicles = async () => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    const vehicles = await getMyVehicles();
    setState({ vehicles, loading: false, error: null });
  } catch (error) {
    setState(prev => ({
      ...prev,
      loading: false,
      error: 'Không thể tải danh sách xe'
    }));
  }
};
```

### 6. TypeScript Types

```typescript
// types/vehicle.ts
export interface CustomerVehicleResponseDto {
  // ... (như đã định nghĩa ở trên)
}

export interface RegisterMyVehicleRequestDto {
  // ... (như đã định nghĩa ở trên)
}

export interface CarBrandResponseDto {
  // ... (như đã định nghĩa ở trên)
}

export interface CarModelResponseDto {
  // ... (như đã định nghĩa ở trên)
}

// Enum for maintenance status
export enum MaintenanceStatus {
  Normal = "Bình thường",
  Attention = "Cần chú ý",
  Urgent = "Khẩn cấp",
  NoData = "Chưa có dữ liệu"
}
```

---

## 🎨 UI/UX RECOMMENDATIONS

### 1. Vehicle Card Component

```jsx
<VehicleCard vehicle={vehicle}>
  <VehicleImage src={vehicle.modelImageUrl} />

  <VehicleInfo>
    <h3>{vehicle.fullModelName}</h3>
    <LicensePlate>{vehicle.licensePlate}</LicensePlate>
    <Mileage>{vehicle.mileage?.toLocaleString()} km</Mileage>
  </VehicleInfo>

  {/* Battery Health */}
  <BatteryIndicator percentage={vehicle.batteryHealthPercent} />

  {/* Warning Badges */}
  {vehicle.isMaintenanceDue && (
    <Badge type="warning">Cần bảo dưỡng</Badge>
  )}
  {vehicle.isInsuranceExpiring && (
    <Badge type="error">Bảo hiểm sắp hết hạn</Badge>
  )}

  {/* Maintenance Status */}
  <StatusChip status={vehicle.maintenanceStatus}>
    {vehicle.maintenanceStatus}
  </StatusChip>

  <ViewDetailsButton onClick={() => navigate(`/vehicles/${vehicle.vehicleId}`)}>
    Xem chi tiết
  </ViewDetailsButton>
</VehicleCard>
```

### 2. Register Vehicle Form Flow

```
Step 1: Chọn hãng xe
[Dropdown với logo] VinFast | Tesla | BYD

Step 2: Chọn model xe
[Card grid với hình ảnh]
□ Model 3    □ Model Y    □ Model S
  500km        530km        650km
  5 chỗ        7 chỗ        5 chỗ

Step 3: Thông tin xe
[Form]
- Biển số xe: [_________] (Required)
- Số khung (VIN): [_________]
- Màu xe: [_________]
- Ngày mua: [📅 Date picker]
- Số km hiện tại: [_________] km

Step 4: Bảo hiểm & Đăng kiểm (Optional)
[Form]
- Số bảo hiểm: [_________]
- Hạn bảo hiểm: [📅 Date picker]
- Hạn đăng kiểm: [📅 Date picker]

[Đăng ký xe] [Hủy]
```

### 3. Color Coding

- 🟢 **Green**: Battery health > 90%, maintenance status "Bình thường"
- 🟡 **Yellow**: Battery health 70-90%, maintenance status "Cần chú ý"
- 🔴 **Red**: Battery health < 70%, maintenance status "Khẩn cấp"

---

## 📞 SUPPORT & CONTACT

Nếu có vấn đề hoặc câu hỏi:

1. **API Issues**: Contact Backend Team
2. **Business Logic Questions**: Contact Product Owner
3. **Documentation Updates**: Submit PR to this file

---

## 📝 CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-15 | Initial documentation |

---

## 📎 APPENDIX

### Sample API Calls (cURL)

#### Get My Vehicles
```bash
curl -X GET "https://your-api-domain.com/api/customer/profile/my-vehicles" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Register New Vehicle
```bash
curl -X POST "https://your-api-domain.com/api/customer/profile/my-vehicles" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": 5,
    "licensePlate": "30A-12345",
    "color": "Xanh",
    "mileage": 0
  }'
```

#### Get Car Brands
```bash
curl -X GET "https://your-api-domain.com/api/car-brands/active"
```

#### Get Car Models by Brand
```bash
curl -X GET "https://your-api-domain.com/api/car-models/by-brand/2"
```

---

**End of Documentation**
