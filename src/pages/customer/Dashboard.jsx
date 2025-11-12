// src/pages/customer/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UserMenu from '../../components/UserMenu';
import NotificationDropdown from '../../components/NotificationDropdown';
import useNotifications from '../../hooks/useNotifications';
import VehicleFlipCard from '../../components/VehicleFlipCard';
import appointmentService from '../../services/appointmentService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Home.css';
import './Dashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead, dismissNotification } = useNotifications();
  const [vehicles, setVehicles] = useState([]);
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    // Xóa localStorage cũ (không còn dùng nữa)
    localStorage.removeItem('deletedVehicles');

    loadDashboardData();

    // Reload data when user navigates back to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible again - reloading data');
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load vehicles and appointments in parallel
      const [vehiclesRes, appointmentsRes] = await Promise.all([
        appointmentService.getMyVehicles(),
        appointmentService.getUpcomingAppointments(5)
      ]);

      console.log('🚗 Vehicles from API:', vehiclesRes);
      console.log('📅 Appointments from API:', appointmentsRes);

      // Map vehicles to dashboard format - chỉ filter xe đã xóa từ backend
      const mappedVehicles = (vehiclesRes.data || [])
        .filter(vehicle => {
          // Chỉ filter out backend soft-deleted vehicles
          const isDeleted = vehicle.isDeleted || vehicle.IsDeleted || false;
          if (isDeleted) {
            console.log(`🗑️ Filtering out deleted vehicle: ${vehicle.licensePlate}`);
            return false;
          }
          return true;
        })
        .map(vehicle => ({
          id: vehicle.vehicleId,
          model: vehicle.fullModelName || vehicle.modelName,
          vin: vehicle.vin,
          year: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).getFullYear() : null,
          nextService: vehicle.nextMaintenanceDate,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
          mileage: vehicle.mileage
        }));

      // Map appointments to dashboard format
      const mappedAppointments = (appointmentsRes.data || []).map(apt => ({
        id: apt.appointmentId,
        type: apt.services?.map(s => s.serviceName).join(', ') || 'Dịch vụ',
        date: new Date(apt.appointmentDate).toLocaleDateString('vi-VN'),
        status: apt.statusName || apt.status
      }));

      setVehicles(mappedVehicles);
      setUpcomingServices(mappedAppointments);

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi click vào notification
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type === 'appointment_reminder' && notification.appointmentId) {
      navigate('/my-appointments');
    }
  };

  const handleEditVehicle = async (vehicleId, updatedData) => {
    try {
      console.log('✏️ Attempting to edit vehicle ID:', vehicleId);

      // Gọi API để update xe trong database
      const response = await appointmentService.updateMyVehicle(vehicleId, updatedData);
      console.log('✅ Vehicle updated successfully:', response);

      // Hiển thị thông báo thành công
      toast.success('✏️ Cập nhật thông tin xe thành công!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reload lại dữ liệu từ server để đảm bảo đồng bộ
      setTimeout(() => {
        loadDashboardData();
      }, 500);

    } catch (error) {
      console.error('❌ Error editing vehicle:', error);

      // Lấy thông báo lỗi chi tiết
      let errorMessage = 'Có lỗi xảy ra khi cập nhật xe. Vui lòng thử lại.';

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền sửa xe này.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy xe cần sửa.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      throw error;
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      console.log('🗑️ Attempting to delete vehicle ID:', vehicleId);

      // Gọi API để xóa xe trong database
      const response = await appointmentService.deleteMyVehicle(vehicleId);
      console.log('✅ Vehicle deleted successfully in database:', response);

      // Xóa xe khỏi UI sau khi API thành công
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));

      // Hiển thị thông báo thành công
      toast.success('🗑️ Xóa xe thành công!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reload lại dữ liệu từ server để đảm bảo đồng bộ
      setTimeout(() => {
        loadDashboardData();
      }, 1000);

    } catch (error) {
      console.error('❌ Error deleting vehicle:', error);

      // Lấy thông báo lỗi chi tiết
      let errorMessage = 'Có lỗi xảy ra khi xóa xe. Vui lòng thử lại.';

      if (error.response?.status === 405) {
        errorMessage = 'Phương thức xóa không được hỗ trợ. Vui lòng liên hệ quản trị viên.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xóa xe này.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy xe cần xóa.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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

      {/* Dashboard Content */}
      <div className="dashboard-container" style={{ marginTop: '180px', minHeight: '60vh' }}>
        <div className="container">
          <header className="dashboard-header mb-5">
            <h1 className="mb-2 text-center" style={{ fontSize: '2rem', fontWeight: 600 }}>
              Welcome  , {user?.fullName || user?.name || user?.username || 'Khách hàng'}!
            </h1>
            {/* <p className="text-muted">Quản lý thông tin xe và lịch dịch vụ của bạn</p> */}
          </header>

          <div className="dashboard-content">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              <>
                <section className="dashboard-section mb-5">
                  <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Xe của bạn</h2>
                  <div>
                    {vehicles.length > 0 ? (
                      <div className="vehicles-grid d-flex flex-wrap" style={{ gap: '0.75rem' }}>
                        {vehicles.map(vehicle => (
                          <div key={vehicle.id} style={{ width: 'calc(50% - 0.375rem)' }}>
                            <VehicleFlipCard
                              vehicle={vehicle}
                              onEdit={handleEditVehicle}
                              onDelete={handleDeleteVehicle}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        Bạn chưa đăng ký xe nào. <Link to="/register-vehicle">Đăng ký xe ngay</Link>
                      </div>
                    )}
                  </div>
                </section>

                <section className="dashboard-section">
                  <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Lịch dịch vụ sắp tới</h2>
                  <div className="services-list">
                    {upcomingServices.length > 0 ? (
                      upcomingServices.map(service => (
                        <div key={service.id} className="service-item p-4 mb-3" style={{
                          background: 'white',
                          borderRadius: '10px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div className="service-info">
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{service.type}</h4>
                            <p className="mb-1 text-muted">Ngày: {service.date}</p>
                            <span className="badge bg-success">{service.status}</span>
                          </div>
                          <button className="btn btn-outline-dark">
                            Xem chi tiết
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="alert alert-info">
                        Bạn chưa có lịch dịch vụ nào. <Link to="/schedule-service">Đặt lịch ngay</Link>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

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

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default CustomerDashboard;
