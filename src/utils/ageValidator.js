// src/utils/ageValidator.js
// Utility để kiểm tra tuổi người dùng

/**
 * Tính tuổi từ ngày sinh
 * @param {string} dateOfBirth - Ngày sinh dạng ISO string (YYYY-MM-DD)
 * @returns {number} - Tuổi của người dùng
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Nếu chưa đến tháng sinh hoặc đến tháng sinh nhưng chưa đến ngày sinh
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Kiểm tra xem người dùng đã đủ 18 tuổi chưa
 * @param {string} dateOfBirth - Ngày sinh dạng ISO string (YYYY-MM-DD)
 * @returns {boolean} - true nếu đủ 18 tuổi
 */
export const isAdult = (dateOfBirth) => {
  if (!dateOfBirth) return false;
  return calculateAge(dateOfBirth) >= 18;
};

/**
 * Validate age requirement cho service booking
 * @param {object} user - User object từ localStorage
 * @returns {object} - { isValid, message, needsDateOfBirth }
 */
export const validateAgeForService = (user) => {
  console.log('🔍 validateAgeForService called with user:', user);

  // Check nếu user không tồn tại
  if (!user) {
    console.log('❌ No user found');
    return {
      isValid: false,
      message: 'Vui lòng đăng nhập để đăng ký dịch vụ',
      needsDateOfBirth: false
    };
  }

  // Check nếu chưa có ngày sinh (bao gồm cả string rỗng)
  const dob = user.dateOfBirth?.trim();
  console.log('📅 Date of birth (trimmed):', dob);

  if (!dob || dob === '' || dob === 'null' || dob === 'undefined') {
    console.log('⚠️ Date of birth is empty or invalid');
    return {
      isValid: false,
      message: 'Vui lòng cập nhật ngày sinh trong trang Thông tin cá nhân trước khi đăng ký dịch vụ',
      needsDateOfBirth: true
    };
  }

  // Check nếu chưa đủ 18 tuổi
  const age = calculateAge(dob);
  console.log('🎂 Calculated age:', age);

  if (age < 18) {
    console.log(`❌ User is ${age} years old, under 18`);
    return {
      isValid: false,
      message: `Bạn chưa đủ 18 tuổi để đăng ký dịch vụ. Tuổi hiện tại: ${age} tuổi`,
      needsDateOfBirth: false,
      age: age
    };
  }

  // Đủ điều kiện
  console.log(`✅ User is ${age} years old, eligible for service`);
  return {
    isValid: true,
    message: '',
    needsDateOfBirth: false,
    age: age
  };
};

export default {
  calculateAge,
  isAdult,
  validateAgeForService
};
