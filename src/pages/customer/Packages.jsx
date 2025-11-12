// src/pages/customer/Packages.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';
import NotificationDropdown from '../../components/NotificationDropdown';
import useNotifications from '../../hooks/useNotifications';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { appointmentService } from '../../services/appointmentService';
import packageService from '../../services/packageService';
import { formatCurrency } from '../../utils/currencyUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../Home.css';

const Packages = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, dismissNotification } = useNotifications();
  const { purchasePackageAsync, isPurchasing } = useSubscriptions();
  const [packages, setPackages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [packagesRes, vehiclesRes] = await Promise.all([
        packageService.getAllPackages(),
        appointmentService.getMyVehicles()
      ]);

      const packagesData = Array.isArray(packagesRes.data) ? packagesRes.data :
                          Array.isArray(packagesRes) ? packagesRes : [];
      const vehiclesData = Array.isArray(vehiclesRes.data) ? vehiclesRes.data :
                          Array.isArray(vehiclesRes) ? vehiclesRes : [];

      setPackages(packagesData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
  };

  const handlePurchaseClick = (pkg) => {
    if (vehicles.length === 0) {
      setMessage('Bạn cần đăng ký xe trước khi mua gói đăng ký');
      setTimeout(() => navigate('/register-vehicle'), 2000);
      return;
    }
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
    setSelectedVehicle('');
    setMessage('');
  };

  const confirmPurchase = async () => {
    if (!selectedVehicle) {
      setMessage('Vui lòng chọn xe');
      return;
    }

    try {
      const purchaseData = {
        packageId: selectedPackage.packageId,
        vehicleId: parseInt(selectedVehicle),
        paymentMethodId: 1, // Default payment method
        autoRenew: false
      };

      const response = await purchasePackageAsync(purchaseData);

      if (response.success || response.data) {
        setMessage('Mua gói đăng ký thành công!');
        setShowPurchaseModal(false);
        setTimeout(() => navigate('/my-subscriptions'), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể mua gói đăng ký. Vui lòng thử lại.');
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
                placeholder="Tìm kiếm..."
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
                    <li><Link className="dropdown-item" to="/products/combo">Lịch hẹn của tôi</Link></li>
                    <li><Link className="dropdown-item" to="/my-subscriptions">Gói đăng ký của tôi</Link></li>
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

      {/* Main Content */}
      <section style={{ marginTop: '180px', minHeight: '60vh' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>
              <i className="bi bi-box-seam me-2"></i>
              Các Gói Bảo Dưỡng
            </h2>
            <p className="text-muted">Chọn gói bảo dưỡng phù hợp với nhu cầu của bạn</p>
          </div>

          {message && (
            <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-warning'}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="mt-3 text-muted">Hiện không có gói bảo dưỡng nào</p>
            </div>
          ) : (
            <div className="row g-4">
              {packages.map(pkg => (
                <div key={pkg.packageId} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-header bg-primary text-white text-center">
                      <h4 className="mb-0">{pkg.packageName}</h4>
                    </div>
                    <div className="card-body">
                      <div className="text-center mb-4">
                        <h2 className="text-primary mb-0">
                          {formatCurrency(pkg.price)}
                        </h2>
                        {pkg.discountPercent > 0 && (
                          <div>
                            <span className="badge bg-danger">Tiết kiệm {pkg.discountPercent}%</span>
                          </div>
                        )}
                      </div>

                      <p className="text-muted">{pkg.description}</p>

                      <ul className="list-unstyled mb-4">
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          <strong>{pkg.totalServices}</strong> dịch vụ
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-clock-fill text-info me-2"></i>
                          Thời hạn: <strong>{pkg.validityPeriod}</strong> ngày
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-shield-check text-warning me-2"></i>
                          Bảo hành chính hãng
                        </li>
                      </ul>

                      {pkg.services && pkg.services.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold">Dịch vụ bao gồm:</h6>
                          <ul className="small">
                            {pkg.services.map((service, idx) => (
                              <li key={idx}>
                                {service.serviceName} ({service.quantity}x)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="card-footer bg-transparent">
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handlePurchaseClick(pkg)}
                        disabled={isPurchasing}
                      >
                        <i className="bi bi-cart-plus me-1"></i>
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mua Gói Đăng Ký</h5>
                <button type="button" className="btn-close" onClick={() => setShowPurchaseModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6>{selectedPackage?.packageName}</h6>
                  <p className="text-muted">{selectedPackage?.description}</p>
                  <h4 className="text-primary">{formatCurrency(selectedPackage?.price)}</h4>
                </div>

                <div className="mb-3">
                  <label className="form-label">Chọn xe *</label>
                  <select
                    className="form-select"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                  >
                    <option value="">-- Chọn xe --</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                        {vehicle.licensePlate} - {vehicle.modelName}
                      </option>
                    ))}
                  </select>
                </div>

                {message && <div className="alert alert-warning">{message}</div>}

                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-1"></i>
                    Sau khi mua gói, bạn sẽ được sử dụng {selectedPackage?.totalServices} dịch vụ
                    trong vòng {selectedPackage?.validityPeriod} ngày.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPurchaseModal(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={confirmPurchase} disabled={isPurchasing}>
                  {isPurchasing ? 'Đang xử lý...' : 'Xác nhận mua'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer mt-5">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; 2025 Tesla Việt Nam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Packages;
