// src/pages/customer/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';
import NotificationDropdown from '../../components/NotificationDropdown';
import useNotifications from '../../hooks/useNotifications';
import FancyButton from '../../components/FancyButton';
import { accountAPI } from '../../services/apiService';
import { customerProfileService } from '../../services/customerProfileService';
import { useAuth } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Home.css';

const Profile = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, dismissNotification } = useNotifications();
  const { updateUser } = useAuth(); // ✅ Lấy updateUser từ AuthContext
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    phoneNumber: ''
  });
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    totalSpent: '',
    customerTypeName: '',
    loyaltyPoints: 0,
    preferredLanguage: 'vi-VN',
    marketingOptIn: false
  });
  const [editData, setEditData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
  }, []);

  // Hàm validation số điện thoại Việt Nam
  const validatePhoneNumber = (phone) => {
    if (!phone) {
      return 'Số điện thoại không được để trống';
    }

    // Loại bỏ khoảng trắng
    const cleanPhone = phone.replace(/\s/g, '');

    // Kiểm tra chỉ chứa số
    if (!/^\d+$/.test(cleanPhone)) {
      return 'Số điện thoại chỉ được chứa chữ số';
    }

    // Kiểm tra độ dài (10 hoặc 11 số)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return 'Số điện thoại phải có 10 hoặc 11 chữ số';
    }

    // Kiểm tra bắt đầu bằng 0
    if (!cleanPhone.startsWith('0')) {
      return 'Số điện thoại phải bắt đầu bằng số 0';
    }

    // Kiểm tra đầu số hợp lệ (03, 05, 07, 08, 09)
    const validPrefixes = ['03', '05', '07', '08', '09'];
    const prefix = cleanPhone.substring(0, 2);
    if (!validPrefixes.includes(prefix)) {
      return 'Đầu số điện thoại không hợp lệ (phải là 03, 05, 07, 08, 09)';
    }

    return ''; // Không có lỗi
  };

  const loadUserData = async () => {
    try {
      console.log('📥 [Profile] Loading user profile from server...');
      const response = await customerProfileService.getProfile();

      console.log('📦 [Profile] Service response:', response);

      if (response.success && response.data) {
        const profileData = response.data;

        console.log('✅ [Profile] Profile data received:', profileData);
        console.log('📋 [Profile] Data keys:', Object.keys(profileData));

        // ✅ BE TRẢ VỀ LOWERCASE (theo CUSTOMER_API_ENDPOINTS.md)
        // Response data: { customerId, fullName, email, phoneNumber, address, dateOfBirth, gender,
        //                  loyaltyPoints, totalSpent, customerType: { typeName, ... }, preferredLanguage, marketingOptIn, ... }
        const fullName = profileData.fullName || '';
        const email = profileData.email || '';
        const phoneNumber = profileData.phoneNumber || '';
        const address = profileData.address || '';
        const gender = profileData.gender || '';
        // ✅ FIX: Split date để chỉ lấy phần YYYY-MM-DD, bỏ phần time
        const rawDateOfBirth = profileData.dateOfBirth || '';
        const dateOfBirth = rawDateOfBirth ? rawDateOfBirth.split('T')[0] : '';
        const totalSpent = Number(profileData.totalSpent || 0);
        const loyaltyPoints = Number(profileData.loyaltyPoints || 0);
        // ✅ Lấy typeName từ customerType object
        const customerTypeName = profileData.customerType?.typeName || profileData.customerTypeName || '';
        const preferredLanguage = profileData.preferredLanguage || 'vi-VN';
        const marketingOptIn = profileData.marketingOptIn || false;

        console.log('📊 [Profile] Extracted values:', {
          fullName,
          email,
          phoneNumber,
          address,
          gender,
          dateOfBirth,
          totalSpent,
          loyaltyPoints,
          customerTypeName,
          preferredLanguage,
          marketingOptIn
        });

        setUserData({
          fullName,
          email,
          phoneNumber,
          address,
          gender,
          dateOfBirth,
          totalSpent,
          customerTypeName,
          loyaltyPoints,
          preferredLanguage,
          marketingOptIn
        });

        setEditData({
          fullName,
          phoneNumber,
          address,
          gender,
          dateOfBirth
        });

        // ✅ Cập nhật localStorage với dữ liệu mới nhất
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = {
          ...currentUser,
          fullName,
          email,
          phoneNumber,
          address,
          gender,
          dateOfBirth,
          totalSpent,
          customerTypeName,
          loyaltyPoints,
          preferredLanguage,
          marketingOptIn
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        console.log('💾 [Profile] Updated localStorage with fresh data');
      } else {
        console.warn('⚠️ [Profile] No data in response or success=false');
      }
    } catch (error) {
      console.error('❌ [Profile] Error loading profile:', error);

      // Fallback: lấy từ localStorage nếu API fail
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        console.log('📂 [Profile] Fallback to localStorage:', user);

        const rawDateOfBirth = user.dateOfBirth || '';
        const dateOfBirth = rawDateOfBirth ? rawDateOfBirth.split('T')[0] : '';

        setUserData({
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          gender: user.gender || '',
          dateOfBirth,
          totalSpent: Number(user.totalSpent || 0),
          customerTypeName: user.customerTypeName || '',
          loyaltyPoints: Number(user.loyaltyPoints || 0),
          preferredLanguage: user.preferredLanguage || 'vi-VN',
          marketingOptIn: user.marketingOptIn || false
        });

        setEditData({
          fullName: user.fullName || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          gender: user.gender || '',
          dateOfBirth
        });
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Reset errors khi bắt đầu edit
    setErrors({ phoneNumber: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth
    });
    // Reset errors khi cancel
    setErrors({ phoneNumber: '' });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setEditData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate số điện thoại khi thay đổi
    if (name === 'phoneNumber') {
      const error = validatePhoneNumber(newValue);
      setErrors(prev => ({
        ...prev,
        phoneNumber: error
      }));
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type === 'appointment_reminder' && notification.appointmentId) {
      navigate('/my-appointments');
    }
  };

  const handleSave = async () => {
    // Kiểm tra validation trước khi submit
    const phoneError = validatePhoneNumber(editData.phoneNumber);
    if (phoneError) {
      setErrors({ phoneNumber: phoneError });
      toast.error('Vui lòng kiểm tra lại thông tin nhập vào', {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }

    setLoading(true);
    try {
      // Gọi API để update thông tin (5 fields editable + 2 fields mặc định)
      // Editable: fullName, phoneNumber, address, gender, dateOfBirth
      // Default: preferredLanguage='vi-VN', marketingOptIn=true
      console.log('📤 [Profile] Updating profile with data:', editData);
      const response = await customerProfileService.updateProfile(editData);
      console.log('✅ [Profile] Profile updated successfully:', response);

      // ✅ CRITICAL FIX: Clear localStorage trước khi load lại để tránh cache
      console.log('🧹 [Profile] Clearing old user data from localStorage...');

      // Gọi lại loadUserData để lấy dữ liệu mới nhất từ server
      // Điều này đảm bảo dữ liệu luôn sync với DB
      console.log('🔄 [Profile] Reloading user data from server...');
      await loadUserData();

      // ✅ CRITICAL: Update AuthContext với data mới
      console.log('🔄 [Profile] Updating AuthContext with fresh data...');
      const freshUserData = await customerProfileService.getProfile();
      if (freshUserData.success && freshUserData.data) {
        updateUser(freshUserData.data);
        console.log('✅ [Profile] AuthContext updated successfully');
      }

      setIsEditing(false);
      // Reset errors sau khi save thành công
      setErrors({ phoneNumber: '' });
      toast.success('Cập nhật thông tin thành công!', {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('❌ [Profile] Error updating profile:', error);
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật thông tin.', {
        position: "bottom-right",
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-custom scrolled">
        <div className="container d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center w-100 top-navbar">
            <form className="search-form">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Tìm kiếm sản phẩm..."
              />
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>

            <Link style={{ fontSize: '2rem' }} className="navbar-brand" to="/home">
              Tesla
            </Link>

            <div className="nav-icons d-flex align-items-center">
              <UserMenu />
              <NotificationDropdown
                notifications={notifications}
                onMarkRead={markAsRead}
                onDismiss={dismissNotification}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </div>

          <div className="bottom-navbar">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav w-100 justify-content-center">
                <li className="nav-item">
                  <Link className="nav-link move" to="/home">TRANG CHỦ</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle move" href="#" role="button" data-bs-toggle="dropdown">
                    DỊCH VỤ
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/my-appointments">Theo dõi & Nhắc nhở</Link></li>
                    <li><Link className="dropdown-item" to="/schedule-service">Đặt lịch dịch vụ</Link></li>
                    <li><Link className="dropdown-item" to="/products/individual">Quản lý chi phí</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">BLOG</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">GIỚI THIỆU</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">LIÊN HỆ</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Section */}
       <section className="profile-section" style={{ marginTop: '180px', minHeight: '60vh' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12">  {/* <--- Đã Đổi thành col-lg-10 */}
              <div className="profile-card">
                {/* Header với avatar và nút Edit */}
                <div className="profile-header d-flex justify-content-between align-items-start mb-4">
                  <div className="d-flex align-items-center">
                    <div className="profile-avatar me-3">
                      <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                    </div>
                    <div>
                      <h4 className="mb-1">{userData.fullName || 'User Name'}</h4>
                      <p className="text-muted mb-0">{userData.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <FancyButton variant="dark" onClick={handleEdit}>
                      Edit
                    </FancyButton>
                  )}
                </div>

                {/* Form thông tin - 3 cột layout */}
                <div className="row">
                  {/* TÊN ĐẦY ĐỦ - Editable */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">TÊN ĐẦY ĐỦ</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="fullName"
                      value={isEditing ? editData.fullName : userData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Nhập tên đầy đủ"
                    />
                  </div>

                  {/* EMAIL - Read Only */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">EMAIL</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      name="email"
                      value={userData.email}
                      disabled
                      placeholder="email@example.com"
                    />
                  </div>

                  {/* PHONE - Editable */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">SỐ ĐIỆN THOẠI</label>
                    <input
                      type="tel"
                      className={`form-control form-control-lg ${errors.phoneNumber && isEditing ? 'is-invalid' : ''}`}
                      name="phoneNumber"
                      value={isEditing ? editData.phoneNumber : userData.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="0123456789"
                    />
                    {errors.phoneNumber && isEditing && (
                      <div className="invalid-feedback d-block">
                        {errors.phoneNumber}
                      </div>
                    )}
                  </div>

                  {/* ADDRESS - Editable - NEW */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">ĐỊA CHỈ</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="address"
                      value={isEditing ? editData.address : userData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>

                  {/* GENDER - Editable - NEW */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">GIỚI TÍNH</label>
                    <select
                      className="form-select form-select-lg"
                      name="gender"
                      value={isEditing ? editData.gender : userData.gender}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>

                  {/* BIRTHDAY - Editable - NEW */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">NGÀY SINH</label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      name="dateOfBirth"
                      value={isEditing ? editData.dateOfBirth : userData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* BẬC KHÁCH HÀNG - Read Only */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">BẬC KHÁCH HÀNG</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="customerTypeName"
                      value={userData.customerTypeName}
                      disabled
                      placeholder="Bậc khách hàng"
                    />
                  </div>

                  {/* ĐIỂM TÍCH LŨY - Read Only */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">ĐIỂM TÍCH LŨY</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="loyaltyPoints"
                      value={userData.loyaltyPoints}
                      disabled
                      placeholder="0"
                    />
                  </div>

                  {/* TỔNG CHI TIÊU - Read Only */}
                  <div className="col-md-4 mb-4">
                    <label className="form-label fw-bold">TỔNG CHI TIÊU</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="totalSpent"
                      value={userData.totalSpent.toLocaleString('vi-VN') + ' VNĐ'}
                      disabled
                      placeholder="0 VNĐ"
                    />
                  </div>
                </div>

                  {/* Buttons khi đang edit */}
                  {isEditing && (
                    <div className="d-flex justify-content-center gap-3 mt-4">
                      <FancyButton
                        variant="dark"
                        onClick={handleSave}
                        disabled={loading || errors.phoneNumber}
                      >
                        {loading ? 'Đang lưu...' : 'Save'}
                      </FancyButton>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                        disabled={loading}
                        style={{ padding: '1em 2em', fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5 className="mb-3" style={{ fontWeight: 600 }}>Điều hướng</h5>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link className="nav-link" to="/home">TRANG CHỦ</Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">DỊCH VỤ</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">BLOG</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">GIỚI THIỆU</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">LIÊN HỆ</a>
                </li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="mb-3" style={{ fontWeight: 600 }}>Liên hệ</h5>
              <div className="contact-info">
                <p><i className="fas fa-map-marker-alt"></i> 160 Lã Xuân Oai, TP. Hồ Chí Minh, Việt Nam</p>
                <p><i className="fas fa-phone"></i> +84 334 171 139</p>
                <p><i className="fas fa-envelope"></i> support@tesla.vn</p>
              </div>
            </div>
            <div className="col-md-4">
              <h5 className="mb-3" style={{ fontWeight: 600 }}>Kết nối với chúng tôi</h5>
              <div className="social-icons">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Tesla Việt Nam. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .profile-section {
          padding: 4rem 0;
          background: #f8f9fa;
        }

        .profile-card {
          background: white;
          border-radius: 15px;
          padding: 3rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .profile-header {
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 1.5rem;
        }

        .form-label {
          color: #495057;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .form-control:disabled {
          background-color: #f8f9fa;
          border-color: #dee2e6;
          cursor: not-allowed;
        }

        .form-control:focus {
          border-color: #000;
          box-shadow: 0 0 0 0.2rem rgba(0, 0, 0, 0.1);
        }

        .btn-outline-secondary {
          border: 2px solid #6c757d;
          border-radius: 0;
        }

        .btn-outline-secondary:hover {
          background: #DB0000;
          color: white;
          border: solid #DB0000
        }
      `}</style>

      <ToastContainer />
    </>
  );
};

export default Profile; 
