// src/pages/customer/VehicleDetail.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';
import NotificationDropdown from '../../components/NotificationDropdown';
import useNotifications from '../../hooks/useNotifications';
import FancyButton from '../../components/FancyButton';
import appointmentService from '../../services/appointmentService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Home.css';

const VehicleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notifications, markAsRead, dismissNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    modelName: '',
    licensePlate: '',
    vin: '',
    color: '',
    purchaseDate: '',
    mileage: 0,
    insuranceNumber: '',
    insuranceExpiry: '',
    registrationExpiry: ''
  });
  const [editData, setEditData] = useState({
    licensePlate: '',
    vin: '',
    color: '',
    mileage: 0
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    loadVehicleData();
  }, [id]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyVehicles();
      const vehicle = response.data?.find(v => v.vehicleId === parseInt(id));

      if (vehicle) {
        setVehicleData({
          modelName: vehicle.fullModelName || vehicle.modelName || '',
          licensePlate: vehicle.licensePlate || '',
          vin: vehicle.vin || '',
          color: vehicle.color || '',
          purchaseDate: vehicle.purchaseDate || '',
          mileage: vehicle.mileage || 0,
          insuranceNumber: vehicle.insuranceNumber || '',
          insuranceExpiry: vehicle.insuranceExpiry || '',
          registrationExpiry: vehicle.registrationExpiry || ''
        });
        setEditData({
          licensePlate: vehicle.licensePlate || '',
          vin: vehicle.vin || '',
          color: vehicle.color || '',
          mileage: vehicle.mileage || 0
        });
      } else {
        toast.error('Không tìm thấy thông tin xe');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin xe');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      licensePlate: vehicleData.licensePlate,
      vin: vehicleData.vin,
      color: vehicleData.color,
      mileage: vehicleData.mileage
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type === 'appointment_reminder' && notification.appointmentId) {
      navigate('/my-appointments');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('📤 Updating vehicle with data:', editData);
      const response = await appointmentService.updateMyVehicle(id, editData);
      console.log('✅ Vehicle updated successfully:', response);

      // Cập nhật state sau khi API thành công
      setVehicleData(prev => ({
        ...prev,
        licensePlate: editData.licensePlate,
        vin: editData.vin,
        color: editData.color,
        mileage: editData.mileage
      }));

      setIsEditing(false);
      toast.success('Cập nhật thông tin xe thành công!', {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('❌ Error updating vehicle:', error);
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật thông tin xe.', {
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
                    <li><Link className="dropdown-item" to="/track-reminder">Theo dõi & Nhắc nhở</Link></li>
                    <li><Link className="dropdown-item" to="/schedule-service">Đặt lịch dịch vụ</Link></li>
                    <li><a className="dropdown-item" href="#">Quản lý chi phí</a></li>
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

      {/* Vehicle Detail Section */}
      <section className="profile-section" style={{ marginTop: '180px', minHeight: '60vh' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="profile-card">
                {/* Header với car icon và nút Edit */}
                <div className="profile-header d-flex justify-content-between align-items-start mb-4">
                  <div className="d-flex align-items-center">
                    <div className="profile-avatar me-3">
                      <i className="bi bi-car-front-fill" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                    </div>
                    <div>
                      <h4 className="mb-1">{vehicleData.modelName || 'Tên xe'}</h4>
                      <p className="text-muted mb-0">{vehicleData.licensePlate || 'Biển số xe'}</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <FancyButton variant="dark" onClick={handleEdit}>
                      Edit
                    </FancyButton>
                  )}
                </div>

                {/* Form thông tin */}
                <div className="row">
                  {/* Model - Read Only */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">MODEL</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={vehicleData.modelName}
                      disabled
                      placeholder="Model xe"
                    />
                  </div>

                  {/* Biển số - Editable */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">BIỂN SỐ</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="licensePlate"
                      value={isEditing ? editData.licensePlate : vehicleData.licensePlate}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Nhập biển số"
                    />
                  </div>

                  {/* VIN - Editable */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">VIN</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="vin"
                      value={isEditing ? editData.vin : vehicleData.vin}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Nhập VIN"
                    />
                  </div>

                  {/* Màu - Editable */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">MÀU SẮC</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="color"
                      value={isEditing ? editData.color : vehicleData.color}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Nhập màu sắc"
                    />
                  </div>

                  {/* Số km - Editable */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">SỐ KM</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="mileage"
                      value={isEditing ? editData.mileage : vehicleData.mileage}
                      onChange={handleChange}
                      disabled={!isEditing}
                      min="0"
                      placeholder="Nhập số km"
                    />
                  </div>

                  {/* Ngày mua - Read Only */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">NGÀY MUA</label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={vehicleData.purchaseDate ? vehicleData.purchaseDate.split('T')[0] : ''}
                      disabled
                    />
                  </div>

                  {/* Số bảo hiểm - Read Only */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">SỐ BẢO HIỂM</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={vehicleData.insuranceNumber}
                      disabled
                      placeholder="Số bảo hiểm"
                    />
                  </div>

                  {/* Hết hạn bảo hiểm - Read Only */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">HẾT HẠN BẢO HIỂM</label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={vehicleData.insuranceExpiry ? vehicleData.insuranceExpiry.split('T')[0] : ''}
                      disabled
                    />
                  </div>

                  {/* Hết hạn đăng ký - Read Only */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">HẾT HẠN ĐĂNG KÝ</label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={vehicleData.registrationExpiry ? vehicleData.registrationExpiry.split('T')[0] : ''}
                      disabled
                    />
                  </div>
                </div>

                {/* Buttons khi đang edit */}
                {isEditing && (
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <FancyButton variant="dark" onClick={handleSave} disabled={loading}>
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

                {/* Button quay lại Dashboard */}
                {!isEditing && (
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => navigate('/dashboard')}
                      style={{ padding: '1em 2em', fontWeight: 600 }}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Quay lại Dashboard
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
          border: solid #DB0000;
        }

        .btn-outline-dark {
          border: 2px solid #000;
          border-radius: 0;
        }

        .btn-outline-dark:hover {
          background: #000;
          color: white;
        }
      `}</style>

      <ToastContainer />
    </>
  );
};

export default VehicleDetail;
