# Phân Tích Kiến Trúc Dịch Vụ - EV Service Center

## Kết Luận: Hệ thống hỗ trợ CẢ HAI mô hình

✅ **Dịch vụ đơn lẻ (Single Services)**: Khách hàng chọn từng dịch vụ riêng lẻ, trả tiền theo dịch vụ
✅ **Gói dịch vụ (Package Subscriptions)**: Khách hàng mua gói trước, sử dụng dịch vụ theo subscription

---

## 1. Tổng Quan Kiến Trúc

### 1.1. Các Entity Chính

```
┌─────────────────────┐
│ MaintenanceService  │  ◄── Dịch vụ đơn lẻ (Oil Change, Tire Rotation, etc.)
│ - ServiceID         │
│ - ServiceCode       │
│ - ServiceName       │
│ - BasePrice         │
│ - StandardTime      │
└─────────────────────┘
          ▲
          │
          ├──────────────────────┐
          │                      │
┌─────────────────────┐  ┌─────────────────────┐
│ AppointmentService  │  │ PackageService      │  ◄── Many-to-Many: Package ↔ Service
│ - ServiceSource     │  │ - PackageID         │
│   "Subscription"    │  │ - ServiceID         │
│   "Extra"           │  │ - Quantity (x2, x3) │
│   "Package"         │  └─────────────────────┘
└─────────────────────┘            │
          │                        │
          │                        ▼
          │              ┌─────────────────────┐
          │              │ MaintenancePackage  │  ◄── Gói dịch vụ (Gold Package, Premium, etc.)
          │              │ - PackageID         │
          │              │ - PackageCode       │
          │              │ - PackageName       │
          │              │ - TotalPrice        │
          │              │ - ValidityPeriod    │
          │              └─────────────────────┘
          │                        │
          │                        ▼
          │         ┌──────────────────────────────┐
          │         │ CustomerPackageSubscription │  ◄── Customer mua gói
          │         │ - SubscriptionID            │
          │         │ - CustomerID                │
          │         │ - PackageID                 │
          │         │ - StartDate, ExpiryDate     │
          │         │ - Status (Active/Expired)   │
          │         │ - RemainingServices         │
          │         └──────────────────────────────┘
          │                        │
          │                        ▼
          │              ┌─────────────────────┐
          │              │ PackageServiceUsage │  ◄── Track usage cho từng service
          │              │ - SubscriptionID    │
          │              │ - ServiceID         │
          │              │ - TotalAllowed (x2) │
          │              │ - UsedQuantity (1)  │
          │              │ - Remaining (1)     │
          │              └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│ Appointment         │  ◄── Lịch hẹn (hỗ trợ cả 2 loại)
│ - ServiceID         │      NULL nếu dùng subscription
│ - PackageID         │      DEPRECATED
│ - SubscriptionID    │      Dùng subscription để đặt lịch
└─────────────────────┘
```

---

## 2. Chi Tiết Từng Mô Hình

### 2.1. Dịch Vụ Đơn Lẻ (Single Services)

**Cách hoạt động:**
1. Customer chọn dịch vụ từ danh sách `MaintenanceServices`
2. Đặt lịch hẹn với `ServiceIds = [1, 2, 3]` (có thể chọn nhiều dịch vụ)
3. Giá tính theo `BasePrice` hoặc `ModelServicePricing` (giá custom theo model xe)
4. Thanh toán sau khi hoàn thành dịch vụ

**Entity liên quan:**
- `MaintenanceService`: Danh mục dịch vụ
- `Appointment`: Lịch hẹn với `ServiceId` hoặc `ServiceIds`
- `AppointmentService`: Junction table, `ServiceSource = "Extra"`
- `ModelServicePricing`: Giá custom theo model xe (VD: Tesla Model 3 có giá khác VinFast VF8)

**API endpoints:**
```http
GET  /api/services                    # Xem danh sách dịch vụ
POST /api/appointments                # Đặt lịch với ServiceIds
```

**Request DTO:**
```csharp
public class CreateAppointmentRequestDto
{
    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public int ServiceCenterId { get; set; }
    public int SlotId { get; set; }
    public List<int> ServiceIds { get; set; } = new(); // ◄── Dịch vụ đơn lẻ
    public string? CustomerNotes { get; set; }
}
```

**Ví dụ:**
```json
{
  "customerId": 123,
  "vehicleId": 456,
  "serviceCenterId": 1,
  "slotId": 789,
  "serviceIds": [10, 11, 12],  // Oil change, Tire rotation, Battery check
  "customerNotes": "Xe kêu tiếng lạ"
}
```

---

### 2.2. Gói Dịch Vụ & Subscription (Package Subscriptions)

**Cách hoạt động:**

#### Bước 1: Customer mua gói
```http
POST /api/package-subscriptions/purchase
```

```json
{
  "packageId": 5,           // Gold Package
  "vehicleId": 456,
  "paymentMethodId": 2,
  "purchaseAmount": 2999000
}
```

**Hệ thống tự động:**
1. Tạo `CustomerPackageSubscription` (Status = Active)
2. Tạo `PackageServiceUsage` cho mỗi service trong gói
3. VD: Gold Package có:
   - Oil Change x3 lần → `TotalAllowedQuantity = 3, UsedQuantity = 0, RemainingQuantity = 3`
   - Tire Rotation x2 lần → `TotalAllowedQuantity = 2, UsedQuantity = 0, RemainingQuantity = 2`
   - Battery Check x1 lần → `TotalAllowedQuantity = 1, UsedQuantity = 0, RemainingQuantity = 1`

#### Bước 2: Customer đặt lịch bằng subscription
```http
POST /api/appointments
```

```json
{
  "customerId": 123,
  "vehicleId": 456,
  "serviceCenterId": 1,
  "slotId": 789,
  "subscriptionId": 999,    // ◄── Dùng subscription
  "serviceIds": []           // Rỗng hoặc extra services
}
```

**Hệ thống tự động:**
1. Validate subscription còn active không
2. Lấy danh sách services có `RemainingQuantity > 0`
3. Tạo appointment với `ServiceSource = "Subscription"`
4. **KHÔNG tính tiền** (đã trả trước khi mua gói)

#### Bước 3: Hoàn thành appointment
Khi technician hoàn thành:
```csharp
await _commandService.CompleteAppointmentAsync(appointmentId, userId);
```

**Hệ thống tự động:**
1. Update `PackageServiceUsage`:
   - `UsedQuantity += 1`
   - `RemainingQuantity -= 1`
   - `LastUsedDate = DateTime.UtcNow`
   - `LastUsedAppointmentId = appointmentId`

2. Check xem subscription còn services không:
   - Nếu `RemainingQuantity = 0` cho TẤT CẢ services → Status = "Exhausted"
   - Nếu hết hạn → Status = "Expired"

**Entity liên quan:**
- `MaintenancePackage`: Gói dịch vụ (Gold, Premium, Basic)
- `PackageService`: Many-to-many (Package ↔ Service) với Quantity
- `CustomerPackageSubscription`: Customer đã mua gói nào
- `PackageServiceUsage`: Track usage cho từng service trong subscription
- `Appointment`: Lịch hẹn với `SubscriptionId`
- `AppointmentService`: Junction table, `ServiceSource = "Subscription"`

---

## 3. Smart Subscription - Race Condition Handling

### 3.1. Vấn Đề Race Condition

**Scenario:**
```
Customer có subscription S với ServiceX, RemainingQuantity = 1
┌──────────────────────┬──────────────────────┐
│   Appointment A1     │   Appointment A2     │
│   (dùng ServiceX)    │   (dùng ServiceX)    │
└──────────────────────┴──────────────────────┘
        ▼                        ▼
    Check:                   Check:
    RemainingQty = 1         RemainingQty = 1
    → OK                     → OK
        ▼                        ▼
    Complete A1              Complete A2
    UsedQty = 1              UsedQty = 2 ❌ RACE!
    RemainingQty = 0         RemainingQty = -1 ❌
```

### 3.2. Giải Pháp: Auto Degrade

**Cơ chế xử lý (AppointmentCommandService.cs:612-783):**

```csharp
try
{
    // Try update subscription usage
    await _subscriptionCommandRepository.UpdateServiceUsageAsync(
        subscriptionId, serviceId, quantityUsed: 1);

    // ✅ SUCCESS: Service được cover bởi subscription
}
catch (InvalidOperationException ex)
    when (ex.Message.Contains("không đủ lượt"))
{
    // 🔥 RACE CONDITION DETECTED 🔥

    // 1. Degrade ServiceSource từ "Subscription" → "Extra"
    appointmentService.ServiceSource = "Extra";

    // 2. Customer phải trả tiền cho service này
    decimal newPrice = appointmentService.Price;
    extraChargeAmount += newPrice;

    // 3. Log audit trail (transparency)
    await _auditService.LogServiceSourceChangeAsync(
        oldServiceSource: "Subscription",
        newServiceSource: "Extra",
        changeReason: "Race condition: Subscription ran out");

    // 4. Mark appointment status
    appointment.Status = AppointmentStatusEnum.CompletedWithUnpaid;
}
```

**Kết quả:**
- Customer KHÔNG BỊ HỦY appointment
- Service vẫn được thực hiện
- System auto chuyển thành "Extra" → Customer trả thêm tiền
- Audit log ghi rõ lý do để customer hiểu

---

## 4. Booking Flow Diagrams

### 4.1. Single Service Booking Flow

```
┌─────────┐
│ Customer│
└────┬────┘
     │
     ▼
[Browse Services]
     │
     ▼
[Select Services: Oil Change, Tire Rotation]
     │
     ▼
[Choose Time Slot]
     │
     ▼
[Create Appointment]
     │  ServiceIds = [10, 11]
     ▼
┌──────────────┐
│  Appointment │  ServiceSource = "Extra"
│  - ServiceId │  Price = ΣBasePrice (or ModelServicePricing)
└──────────────┘
     │
     ▼
[Technician performs service]
     │
     ▼
[Complete Appointment]
     │
     ▼
[Generate Invoice] → Customer pays
```

### 4.2. Subscription-based Booking Flow

```
┌─────────┐
│ Customer│
└────┬────┘
     │
     ▼
[Browse Packages]
     │
     ▼
[Purchase "Gold Package" - 2,999,000 VND]
     │  PackageId = 5
     ▼
┌─────────────────────────┐
│ CustomerPackageSubscription │
│ - Status: Active             │
│ - ExpiryDate: +6 months     │
└─────────────────────────┘
     │
     ├──► PackageServiceUsage: Oil Change (x3, Remaining: 3)
     ├──► PackageServiceUsage: Tire Rotation (x2, Remaining: 2)
     └──► PackageServiceUsage: Battery Check (x1, Remaining: 1)

     │
     ▼
[Customer books appointment]
     │  SubscriptionId = 999
     ▼
┌──────────────┐
│  Appointment │  ServiceSource = "Subscription"
│  - SubsID    │  Price = 0 (already paid)
└──────────────┘
     │
     ▼
[Technician performs service]
     │
     ▼
[Complete Appointment]
     │
     ▼
[Update PackageServiceUsage]
  UsedQuantity: 0 → 1
  RemainingQuantity: 3 → 2
     │
     ▼
[No invoice needed - already paid]
```

---

## 5. Database Schema

### 5.1. Core Tables

```sql
-- Dịch vụ đơn lẻ
MaintenanceServices (
    ServiceID PK,
    ServiceCode,
    ServiceName,
    BasePrice,
    StandardTime,
    CategoryID FK → ServiceCategories
)

-- Gói dịch vụ
MaintenancePackages (
    PackageID PK,
    PackageCode,
    PackageName,
    TotalPrice,
    ValidityPeriod,
    ValidityMileage
)

-- Many-to-many: Package ↔ Service
PackageServices (
    PackageServiceID PK,
    PackageID FK → MaintenancePackages,
    ServiceID FK → MaintenanceServices,
    Quantity,              -- x2, x3 lần
    IncludedInPackage,
    AdditionalCost
)

-- Customer mua gói
CustomerPackageSubscriptions (
    SubscriptionID PK,
    CustomerID FK → Customers,
    PackageID FK → MaintenancePackages,
    VehicleID FK → CustomerVehicles,
    StartDate,
    ExpirationDate,
    Status,                -- Active, Expired, Cancelled, Exhausted
    RemainingServices,     -- Tổng số services còn lại
    UsedServices          -- Tổng số services đã dùng
)

-- Track usage từng service trong subscription
PackageServiceUsages (
    UsageID PK,
    SubscriptionID FK → CustomerPackageSubscriptions,
    ServiceID FK → MaintenanceServices,
    TotalAllowedQuantity,  -- VD: 3 lần
    UsedQuantity,          -- VD: 1 lần đã dùng
    RemainingQuantity,     -- VD: 2 lần còn lại
    LastUsedDate,
    LastUsedAppointmentID
)

-- Lịch hẹn (hỗ trợ cả 2 loại)
Appointments (
    AppointmentID PK,
    CustomerID FK → Customers,
    VehicleID FK → CustomerVehicles,
    ServiceCenterID FK → ServiceCenters,
    SlotID FK → TimeSlots,
    ServiceID FK,          -- NULLABLE (legacy, deprecated)
    PackageID FK,          -- NULLABLE (deprecated, dùng SubscriptionID)
    SubscriptionID FK → CustomerPackageSubscriptions,  -- NEW
    StatusID FK → AppointmentStatuses,
    EstimatedCost,
    EstimatedDuration,
    AppointmentDate,
    ...
)

-- Junction table: Appointment ↔ Service (many-to-many)
AppointmentServices (
    AppointmentServiceID PK,
    AppointmentID FK → Appointments,
    ServiceID FK → MaintenanceServices,
    ServiceSource,         -- "Subscription" | "Extra" | "Package"
    Price,
    EstimatedTime,
    Notes
)
```

### 5.2. ServiceSource Values

| Value          | Ý nghĩa                                               |
|----------------|-------------------------------------------------------|
| `Subscription` | Service từ subscription (đã trả trước, không tính phí) |
| `Extra`        | Service đơn lẻ hoặc thêm ngoài gói (tính phí)         |
| `Package`      | DEPRECATED - Service từ package (legacy)              |

---

## 6. API Endpoints Summary

### 6.1. Single Services

```http
# Browse services
GET /api/services?category=Battery&isActive=true

# Get service pricing for vehicle
GET /api/services/{serviceId}/pricing?modelId=5

# Book appointment with single services
POST /api/appointments
{
  "serviceIds": [10, 11, 12],  // Oil, Tire, Battery
  "slotId": 123,
  ...
}
```

### 6.2. Package Subscriptions

```http
# Browse packages
GET /api/packages?isActive=true&isPopular=true

# Get package details
GET /api/packages/{packageId}

# Purchase package
POST /api/package-subscriptions/purchase
{
  "packageId": 5,
  "vehicleId": 456,
  "paymentMethodId": 2
}

# View my subscriptions
GET /api/package-subscriptions/my-subscriptions?statusFilter=Active

# Get subscription usage details
GET /api/package-subscriptions/{subscriptionId}/usage

# Get active subscriptions for vehicle (khi đặt lịch)
GET /api/package-subscriptions/vehicle/{vehicleId}/active

# Book appointment with subscription
POST /api/appointments
{
  "subscriptionId": 999,       // ◄── Dùng subscription
  "serviceIds": [13],          // Optional: Extra services (tính phí thêm)
  "slotId": 123,
  ...
}

# Cancel subscription
POST /api/package-subscriptions/{subscriptionId}/cancel
{
  "cancellationReason": "Đã bán xe"
}
```

---

## 7. Business Rules

### 7.1. Subscription Validity

**Hết hạn theo TIME:**
```csharp
if (subscription.ExpiryDate < DateTime.UtcNow)
    Status = "Expired";
```

**Hết hạn theo MILEAGE:**
```csharp
int mileageDriven = vehicle.Mileage - subscription.InitialVehicleMileage;
if (subscription.ValidityMileage.HasValue
    && mileageDriven >= subscription.ValidityMileage)
    Status = "Expired";
```

**Hết lượt sử dụng:**
```csharp
if (subscription.PackageServiceUsages.All(u => u.RemainingQuantity == 0))
    Status = "Exhausted";
```

### 7.2. Subscription Booking Validation

**Các validation khi đặt lịch với subscription:**
1. Subscription phải `Status = Active`
2. Subscription phải thuộc về Customer đang đặt
3. Vehicle phải khớp với Vehicle của subscription
4. Chưa hết hạn (ExpiryDate)
5. Ít nhất 1 service có `RemainingQuantity > 0`

**Code (AppointmentCommandService.cs:90-144):**
```csharp
if (request.SubscriptionId.HasValue)
{
    var subscription = await _subscriptionRepository
        .GetSubscriptionByIdAsync(request.SubscriptionId.Value);

    // Validation 1: Active
    if (subscription.Status != SubscriptionStatusEnum.Active)
        throw new InvalidOperationException(
            $"Subscription không active (Status: {subscription.StatusDisplayName})");

    // Validation 2: Ownership
    if (subscription.CustomerId != request.CustomerId)
        throw new InvalidOperationException(
            "Subscription không thuộc về khách hàng");

    // Validation 3: Vehicle match
    if (subscription.VehicleId != request.VehicleId)
        throw new InvalidOperationException(
            $"Subscription dành cho xe {subscription.VehiclePlateNumber}");

    // Validation 4: Not expired
    if (subscription.ExpiryDate.HasValue
        && subscription.ExpiryDate.Value < DateTime.UtcNow)
        throw new InvalidOperationException(
            $"Subscription đã hết hạn");

    // Validation 5: Has remaining services
    var availableServices = subscription.ServiceUsages
        .Where(u => u.RemainingQuantity > 0)
        .ToList();

    if (!availableServices.Any())
        throw new InvalidOperationException(
            "Subscription đã sử dụng hết tất cả dịch vụ");
}
```

---

## 8. Lợi Ích Của Dual System

### 8.1. Linh Hoạt Cho Customer

| Tình huống                          | Phù hợp với         |
|-------------------------------------|---------------------|
| Bảo dưỡng định kỳ thường xuyên      | **Subscription**    |
| Tiết kiệm chi phí dài hạn           | **Subscription**    |
| Sửa chữa đột xuất                   | **Single Service**  |
| Không chắc sẽ dùng dịch vụ bao lâu  | **Single Service**  |
| Mới mua xe, muốn gói bảo dưỡng     | **Subscription**    |
| Sắp bán xe, chỉ cần 1-2 lần dịch vụ | **Single Service**  |

### 8.2. Tăng Revenue Cho Business

1. **Upfront payment**: Subscription thu tiền trước → Cashflow tốt hơn
2. **Customer retention**: Subscription → Customer quay lại nhiều lần
3. **Predictable revenue**: Biết trước doanh thu từ subscriptions
4. **Upselling**: Customer mua subscription vẫn có thể mua extra services

---

## 9. So Sánh Chi Tiết

| Tiêu chí                | Single Services        | Package Subscriptions    |
|-------------------------|------------------------|--------------------------|
| **Thanh toán**          | Sau khi dùng          | Trả trước khi mua gói    |
| **Giá**                 | Theo BasePrice/Model   | Giá gói (thường rẻ hơn)  |
| **Ràng buộc**           | Không                 | Theo validity period     |
| **Flexibility**         | Cao (chọn service bất kỳ) | Thấp (theo gói định sẵn) |
| **Cost saving**         | Không                 | Có (discount khi mua gói) |
| **Tracking**            | Không cần             | PackageServiceUsage      |
| **Expiry**              | Không                 | Có (time/mileage)        |
| **API**                 | POST /appointments    | POST /package-subscriptions/purchase → POST /appointments |

---

## 10. Files Quan Trọng

### 10.1. Core Entities
- `EVServiceCenter.Core/Domains/MaintenanceServices/Entities/MaintenanceService.cs`
- `EVServiceCenter.Core/Entities/MaintenancePackage.cs`
- `EVServiceCenter.Core/Entities/CustomerPackageSubscription.cs`
- `EVServiceCenter.Core/Entities/PackageService.cs`
- `EVServiceCenter.Core/Entities/PackageServiceUsage.cs`
- `EVServiceCenter.Core/Domains/AppointmentManagement/Entities/Appointment.cs`
- `EVServiceCenter.Core/Domains/AppointmentManagement/Entities/AppointmentService.cs`

### 10.2. Controllers
- `EVServiceCenter.API/Controllers/Appointments/AppointmentController.cs`
  - Customer đặt lịch (cả single & subscription)
- `EVServiceCenter.API/Controllers/PackageSubscriptions/PackageSubscriptionController.cs`
  - Customer mua gói, xem usage, cancel subscription

### 10.3. Services
- `EVServiceCenter.Infrastructure/Domains/AppointmentManagement/Services/AppointmentCommandService.cs`
  - Lines 64-211: CreateAsync (xử lý cả 2 loại booking)
  - Lines 612-783: CompleteAppointmentAsync (Smart Subscription with Race Condition Handling)
  - Lines 790-833: CalculatePricingAsync (set ServiceSource based on subscriptionId)

### 10.4. Database
- `EVServiceCenter.Infrastructure/Data/EVDbContext.cs`
  - Lines 417-436: AppointmentService configuration (ServiceSource default = "Extra")
  - Lines 486-510: CustomerPackageSubscription configuration
  - Lines 795-810: PackageService configuration

---

## 11. Kết Luận

Hệ thống EV Service Center được thiết kế với **dual service model** hỗ trợ cả:

✅ **Single Services**: Linh hoạt, pay-as-you-go, phù hợp sửa chữa đột xuất
✅ **Package Subscriptions**: Tiết kiệm, prepaid, phù hợp bảo dưỡng định kỳ

**Điểm nổi bật:**
- Kiến trúc linh hoạt: Customer có thể MIX cả 2 (dùng subscription + extra services)
- Smart Subscription với Race Condition Handling (auto degrade to "Extra")
- Audit logging đầy đủ cho transparency
- Business rules rõ ràng (validity period, mileage, usage tracking)

**Use case thực tế:**
1. Customer mua Gold Package (3 lần thay dầu, 2 lần xoay lốp)
2. Đặt lịch lần 1: Dùng subscription cho "Thay dầu" (FREE)
3. Thêm service "Vệ sinh nội thất" (Extra - tính phí)
4. → Appointment có cả "Subscription" services LẪN "Extra" services

**Kết quả:** Hệ thống vừa đảm bảo flexibility cho customer, vừa tạo recurring revenue cho business.
