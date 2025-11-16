# 🧪 Frontend Unit Test - Customer Module

## 📦 Quick Start

```bash
# Install dependencies (nếu chưa cài)
npm install

# Chạy tất cả tests
npm test

# Chạy tests cho Customer module
npm test -- src/__tests__/customer

# Chạy tests với coverage report
npm run test:coverage

# Chạy tests ở chế độ watch (tự động re-run khi có thay đổi)
npm run test:watch
```

## 📂 Cấu Trúc Test Files

```
src/
├── __tests__/
│   └── customer/
│       ├── Profile.test.jsx           (18 tests) ✅
│       ├── MyAppointments.test.jsx    (30 tests) ✅
│       └── RegisterVehicle.test.jsx   (30 tests) ✅
```

## 📊 Test Summary

- **Total Tests:** 78
- **Pass Rate:** 100% ✅
- **Coverage:** > 85% ✅
- **Time:** ~15-20 seconds

## 📚 Documents

- **Hướng dẫn chi tiết:** `FRONTEND_UNIT_TEST_GUIDE.md`
- **Báo cáo kết quả:** `FRONTEND_UNIT_TEST_REPORT.md`

## ⚡ Components Tested

1. **Profile** - Quản lý thông tin cá nhân
2. **MyAppointments** - Quản lý lịch hẹn
3. **RegisterVehicle** - Đăng ký xe mới

## 🎯 Test Coverage

| Component | Lines | Statements | Branches | Functions |
|-----------|-------|------------|----------|-----------|
| Profile.jsx | 88% | 88% | 82% | 90% |
| MyAppointments.jsx | 85% | 85% | 80% | 87% |
| RegisterVehicle.jsx | 86% | 86% | 81% | 88% |

## ✨ Highlights

- ✅ Mock đầy đủ API calls và dependencies
- ✅ Test cả success và error scenarios
- ✅ Isolated tests (không phụ thuộc lẫn nhau)
- ✅ Clear test names và structure
- ✅ Follow best practices của React Testing Library

## 🐛 Troubleshooting

**Lỗi "Cannot find module":**
```bash
npm install
```

**Clear cache:**
```bash
npm test -- --clearCache
```

**Xem help:**
```bash
npm test -- --help
```

## 📖 Learn More

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Note:** Tests không ảnh hưởng đến code production. Tất cả test files nằm riêng trong thư mục `__tests__/`.
