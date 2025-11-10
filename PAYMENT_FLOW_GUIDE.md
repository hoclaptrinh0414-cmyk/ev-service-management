# 💳 Payment Flow Guide - VNPay Integration

## 📋 Overview

Hệ thống thanh toán hỗ trợ 2 modes:
1. **Mock Payment** - Cho development/testing (không cần VNPay sandbox)
2. **Real Payment** - Redirect đến VNPay sandbox/production

---

## 🔄 Complete Payment Flow

### **Step 1-4: Booking Process**
```
User → Step 1 (Vehicle) → Step 2 (Time & Place) → Step 3 (Services) → Step 4 (Confirm)
```

### **Step 4 → Step 5: Payment Intent Creation**
Khi user click **"Proceed to Payment"**:

```javascript
// 1. Create Appointment
POST /api/appointments
Body: {
  customerId, vehicleId, serviceCenterId, slotId,
  serviceIds, packageId, customerNotes, ...
}

Response: {
  appointmentId: 123,
  appointmentCode: "APT-2025-001",
  invoiceId: 456
}

// 2. Create Payment Intent
POST /api/appointments/123/pay
Body: {
  "paymentMethod": "VNPay",
  "returnUrl": "http://localhost:3000/payment/callback"
}

Response: {
  paymentIntentId: 789,
  paymentId: 101112,
  paymentCode: "PAY-2025-001",
  invoiceId: 456,
  invoiceCode: "INV-2025-001",
  amount: 500000,
  paymentUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
}
```

### **Step 5: Payment Selection**

User chọn payment method và click một trong 2 nút:

#### **Option A: Mock Payment (Testing)**
```javascript
// 1. Complete payment via mock API
POST /api/payments/mock/complete
Body: {
  "paymentCode": "PAY-2025-001",
  "gateway": "VNPay",
  "success": true,
  "amount": 500000
}

// 2. Verify payment status
GET /api/payments/by-code/PAY-2025-001

Response: {
  status: "Completed",
  amount: 500000,
  gatewayTransactionId: "MOCK-12345"
}

// 3. Redirect to /my-appointments
```

#### **Option B: Real Payment (VNPay Gateway)**
```javascript
// 1. Redirect to VNPay
window.location.href = paymentUrl

// VNPay URL format:
// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
//   ?vnp_Amount=50000000          (amount * 100)
//   &vnp_Command=pay
//   &vnp_CreateDate=20250103120000
//   &vnp_CurrCode=VND
//   &vnp_IpAddr=127.0.0.1
//   &vnp_Locale=vn
//   &vnp_OrderInfo=Payment+for+appointment
//   &vnp_OrderType=other
//   &vnp_ReturnUrl=http://localhost:3000/payment/callback
//   &vnp_TmnCode=YOUR_TMN_CODE
//   &vnp_TxnRef=PAY-2025-001
//   &vnp_Version=2.1.0
//   &vnp_SecureHash=...

// 2. User completes payment at VNPay

// 3. VNPay redirects back to returnUrl with params:
//    /payment/callback
//      ?vnp_Amount=50000000
//      &vnp_BankCode=NCB
//      &vnp_ResponseCode=00
//      &vnp_TxnRef=PAY-2025-001
//      &vnp_TransactionNo=13995895
//      &vnp_OrderInfo=Payment+for+appointment
```

### **Payment Callback Handling**

File: `src/pages/payment/PaymentCallback.jsx`

```javascript
// 1. Extract VNPay query params
const vnpParams = {
  responseCode: '00',        // 00 = success, 24 = canceled
  txnRef: 'PAY-2025-001',   // paymentCode
  amount: '50000000',        // amount * 100
  transactionNo: '13995895', // VNPay transaction ID
  bankCode: 'NCB'
}

// 2. Check response code
if (responseCode === '00') {
  // Success
  → Verify payment from backend
  → Show success message
  → Redirect to /my-appointments
}
else if (responseCode === '24') {
  // Canceled
  → Show canceled message
  → Redirect to /schedule-service
}
else {
  // Failed
  → Show error message
  → Redirect to /schedule-service
}

// 3. Verify payment status
GET /api/payments/by-code/PAY-2025-001

// 4. Redirect after 2 seconds
```

---

## 🧪 Testing Guide

### **A. Test Mock Payment (Recommended cho Development)**

1. **Complete booking flow:**
   ```
   Step 1: Chọn xe
   Step 2: Chọn service center + time slot
   Step 3: Chọn dịch vụ
   Step 4: Click "Proceed to Payment"
   ```

2. **At Step 5:**
   - Chọn payment method (VNPay/Momo/Google Pay)
   - Click **"Pay with Mock (Testing)"**

3. **Expected console logs:**
   ```
   ✅ Validation passed!
   🛒 Cart Items: [...]
   📦 Extracted serviceIds: [1, 2]
   📝 Creating appointment with data: {...}
   ✅ Appointment created: { appointmentId: 123, ... }
   💳 Creating payment intent for appointment: 123
   ✅ Payment intent created: { paymentCode: "PAY-XXX", ... }
   💰 Processing mock payment for: PAY-XXX
   🔍 Verifying payment status...
   ✅ Payment status: { status: "Completed" }
   ```

4. **Expected result:**
   - Toast: "Payment completed successfully!"
   - Toast: "🎉 Appointment confirmed!"
   - Redirect to `/my-appointments`

---

### **B. Test Real Payment (VNPay Sandbox)**

**Prerequisites:**
- Backend phải có VNPay sandbox credentials
- `paymentUrl` phải được trả về từ API

1. **Complete Steps 1-4** (giống mock payment)

2. **At Step 5:**
   - Chọn payment method
   - Click **"Pay with Real Gateway"**

3. **Expected behavior:**
   - Toast: "Redirecting to payment gateway..."
   - Browser redirect đến VNPay sandbox
   - URL: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...`

4. **At VNPay Sandbox:**
   - Select bank: NCB (Test Bank)
   - Card number: `9704198526191432198`
   - Card holder: `NGUYEN VAN A`
   - Expiry: `07/15`
   - OTP: `123456`

5. **After payment:**
   - VNPay redirects back to `/payment/callback?vnp_ResponseCode=00&...`
   - PaymentCallback component handles response
   - Shows success/failure message
   - Redirects to `/my-appointments`

---

## 🔍 VNPay Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| `00` | Success | Show success → redirect to appointments |
| `07` | Successful transaction, suspicious (require contact) | Show warning → redirect to appointments |
| `09` | Card not registered for Internet Banking | Show error → redirect to booking |
| `10` | Incorrect card authentication (3 times) | Show error → redirect to booking |
| `11` | Payment timeout | Show error → redirect to booking |
| `12` | Card locked | Show error → redirect to booking |
| `13` | Incorrect OTP | Show error → redirect to booking |
| `24` | Customer canceled | Show canceled → redirect to booking |
| `51` | Insufficient balance | Show error → redirect to booking |
| `65` | Daily transaction limit exceeded | Show error → redirect to booking |
| `75` | Payment bank under maintenance | Show error → redirect to booking |
| `79` | Exceeded number of password entries | Show error → redirect to booking |
| Other | Transaction failed | Show generic error → redirect to booking |

---

## 📁 File Structure

```
src/
├── pages/
│   ├── customer/
│   │   └── ScheduleServiceNew.jsx    # Booking flow (Steps 1-5)
│   └── payment/
│       └── PaymentCallback.jsx        # VNPay callback handler
├── services/
│   ├── paymentService.js              # Payment API wrapper
│   ├── api.js                         # Base API service
│   └── axiosInterceptor.js            # Token handling
└── App.js                             # Routes setup
```

---

## 🔧 Configuration

### **Backend ENV Variables**
```env
# VNPay Sandbox Credentials
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5000/api/payments/vnpay-callback
```

### **Frontend ENV Variables**
```env
# API Base URL
REACT_APP_API_URL=http://localhost:5000/api

# App URL (for returnUrl)
REACT_APP_APP_URL=http://localhost:3000
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: 401 Unauthorized khi tạo payment**
**Cause:** Token expired hoặc chưa login

**Solution:**
- Logout và login lại
- Check `localStorage.getItem('accessToken')`
- Check axios interceptor logs

---

### **Issue 2: Payment URL is not available**
**Cause:** Backend chưa config VNPay credentials

**Solution:**
- Check backend ENV variables
- Verify VNPay TMN_CODE và HASH_SECRET
- Test bằng Mock Payment thay vì Real Payment

---

### **Issue 3: VNPay callback không redirect đúng**
**Cause:** returnUrl format sai

**Solution:**
- Check `returnUrl` trong payment request
- Format: `http://localhost:3000/payment/callback`
- Phải dùng full URL (không relative path)
- Backend phải forward đúng returnUrl đến VNPay

---

### **Issue 4: Mock payment success nhưng appointment vẫn Pending**
**Cause:** Mock payment API không update trạng thái

**Solution:**
- Check mock payment response
- Verify payment status API
- Check backend logs
- Test lại bằng Postman

---

## 📊 Payment State Diagram

```
                    ┌────────────────┐
                    │  Step 4        │
                    │  (Confirm)     │
                    └────────┬───────┘
                             │
                    Click "Proceed to Payment"
                             │
                             ▼
                    ┌────────────────┐
                    │ Create         │
                    │ Appointment    │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Create Payment │
                    │ Intent         │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Step 5        │
                    │  (Payment)     │
                    └────┬───────┬───┘
                         │       │
          ┌──────────────┘       └──────────────┐
          │                                     │
   Mock Payment                          Real Payment
          │                                     │
          ▼                                     ▼
   ┌─────────────┐                    ┌─────────────┐
   │ POST mock/  │                    │ Redirect to │
   │ complete    │                    │ VNPay       │
   └──────┬──────┘                    └──────┬──────┘
          │                                  │
          │                         ┌────────▼────────┐
          │                         │ User pays at    │
          │                         │ VNPay sandbox   │
          │                         └────────┬────────┘
          │                                  │
          │                         ┌────────▼────────┐
          │                         │ VNPay redirects │
          │                         │ to /callback    │
          │                         └────────┬────────┘
          │                                  │
          └──────────┬───────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Verify Payment │
            │ Status         │
            └────────┬───────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
     Success    Canceled    Failed
          │          │          │
          ▼          ▼          ▼
    /my-appointments  /schedule-service
```

---

## ✅ Final Checklist

### **Frontend**
- [x] PaymentCallback component created
- [x] Route `/payment/callback` added
- [x] returnUrl format: `${window.location.origin}/payment/callback`
- [x] Mock payment flow
- [x] Real payment redirect
- [x] VNPay response handling
- [x] Error handling & logging
- [x] User feedback (toast messages)

### **Backend** (cần verify)
- [ ] VNPay credentials configured
- [ ] Payment API endpoints working
- [ ] Mock payment API working
- [ ] returnUrl được forward đến VNPay
- [ ] Payment status update correctly
- [ ] Invoice generation

### **Testing**
- [ ] Mock payment works end-to-end
- [ ] Real payment redirects to VNPay sandbox
- [ ] VNPay callback handles success (code 00)
- [ ] VNPay callback handles cancel (code 24)
- [ ] VNPay callback handles failure
- [ ] Payment verification works
- [ ] Redirect after payment works

---

**Last Updated:** 2025-01-10
**Version:** 1.0
**Author:** Claude Code Assistant
