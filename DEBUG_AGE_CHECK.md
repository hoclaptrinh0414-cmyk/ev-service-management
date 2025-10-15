# DEBUG HƯỚNG DẪN KIỂM TRA TUỔI

## Bước 1: Kiểm tra localStorage
Mở Console (F12) và chạy:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User data:', user);
console.log('Date of birth:', user?.dateOfBirth);
```

## Bước 2: Test age validator
Mở Console (F12) và chạy:
```javascript
// Import utility (nếu cần)
import { validateAgeForService, calculateAge } from './src/utils/ageValidator';

// Hoặc test inline
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const user = JSON.parse(localStorage.getItem('user'));
console.log('Age:', calculateAge(user?.dateOfBirth));
```

## Bước 3: Test với ngày sinh giả
```javascript
// Set ngày sinh giả (chưa đủ 18 tuổi)
const user = JSON.parse(localStorage.getItem('user'));
user.dateOfBirth = '2010-01-01'; // 15 tuổi
localStorage.setItem('user', JSON.stringify(user));
// Refresh trang Đặt lịch dịch vụ

// Set ngày sinh giả (đủ 18 tuổi)
const user2 = JSON.parse(localStorage.getItem('user'));
user2.dateOfBirth = '2000-01-01'; // 25 tuổi
localStorage.setItem('user', JSON.stringify(user2));
// Refresh trang Đặt lịch dịch vụ
```

## Flow đúng:
1. **Vào trang Profile** (`/profile`)
2. **Click nút Edit**
3. **Nhập ngày sinh** vào ô "NGÀY SINH"
4. **Click Save** và đợi thông báo "Cập nhật thông tin thành công!"
5. **Vào trang Đặt lịch dịch vụ** (`/schedule-service`)

Nếu chưa có ngày sinh → Sẽ hiện popup "Bạn cần cập nhật ngày sinh..."
Nếu chưa đủ 18 tuổi → Sẽ hiện alert đỏ "Bạn chưa đủ 18 tuổi..."

## Kiểm tra API response format
Backend trả về dateOfBirth định dạng gì?
- ISO: "2000-01-01T00:00:00Z"
- Date only: "2000-01-01"
- Timestamp: 946684800000

Cần đảm bảo format giống nhau giữa API response và localStorage.
