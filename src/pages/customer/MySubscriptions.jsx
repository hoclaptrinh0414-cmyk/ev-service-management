// src/pages/customer/MySubscriptions.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';
import NotificationDropdown from '../../components/NotificationDropdown';
import useNotifications from '../../hooks/useNotifications';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../Home.css';

const MySubscriptions = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, dismissNotification } = useNotifications();
  const [statusFilter, setStatusFilter] = useState(null);
  const { subscriptions, isLoading, cancelSubscription, isCancelling } = useSubscriptions(statusFilter);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [message, setMessage] = useState('');

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
  };

  const handleCancelClick = (subscription) => {
    setSelectedSubscription(subscription);
    setShowCancelModal(true);
    setCancelReason('');
    setMessage('');
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      setMessage('Vui lòng nhập lý do hủy gói đăng ký');
      return;
    }

    try {
      await cancelSubscription({
        id: selectedSubscription.subscriptionId,
        reason: cancelReason
      });
      setMessage('Hủy gói đăng ký thành công!');
      setShowCancelModal(false);
      setCancelReason('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể hủy gói đăng ký');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Active': { color: 'success', text: 'Đang hoạt động', icon: 'check-circle' },
      'Expired': { color: 'warning', text: 'Đã hết hạn', icon: 'clock-history' },
      'Cancelled': { color: 'danger', text: 'Đã hủy', icon: 'x-circle' },
      'Suspended': { color: 'secondary', text: 'Tạm ngưng', icon: 'pause-circle' }
    };
    const statusInfo = statusMap[status] || { color: 'secondary', text: status, icon: 'question-circle' };
    return (
      <span className={`badge bg-${statusInfo.color}`}>
        <i className={`bi bi-${statusInfo.icon} me-1`}></i>
        {statusInfo.text}
      </span>
    );
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>
              <i className="bi bi-box-seam me-2"></i>
              Gói đăng ký của tôi
            </h2>
            <Link to="/packages" className="btn btn-primary">
              <i className="bi bi-plus-circle me-1"></i>
              Xem các gói đăng ký
            </Link>
          </div>

          {message && (
            <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          {/* Filter */}
          <div className="mb-4">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${!statusFilter ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setStatusFilter(null)}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`btn ${statusFilter === 'Active' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setStatusFilter('Active')}
              >
                Đang hoạt động
              </button>
              <button
                type="button"
                className={`btn ${statusFilter === 'Expired' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setStatusFilter('Expired')}
              >
                Đã hết hạn
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="mt-3 text-muted">Bạn chưa có gói đăng ký nào</p>
              <Link to="/packages" className="btn btn-primary mt-2">
                Xem các gói đăng ký
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {subscriptions.map(sub => (
                <div key={sub.subscriptionId} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{sub.packageName}</h5>
                      {getStatusBadge(sub.status)}
                    </div>
                    <div className="card-body">
                      <p className="mb-2">
                        <strong><i className="bi bi-car-front me-1"></i>Xe:</strong> {sub.vehiclePlate || sub.vehicleLicensePlate}
                      </p>
                      <p className="mb-2">
                        <strong><i className="bi bi-calendar-range me-1"></i>Thời hạn:</strong>
                        <br />
                        <small>{formatDate(sub.startDate)} - {formatDate(sub.endDate)}</small>
                      </p>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Sử dụng:</small>
                          <small><strong>{sub.usedServices || 0}/{sub.totalServices}</strong></small>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${((sub.usedServices || 0) / sub.totalServices) * 100}%` }}
                            aria-valuenow={(sub.usedServices || 0)}
                            aria-valuemin="0"
                            aria-valuemax={sub.totalServices}
                          ></div>
                        </div>
                        <small className="text-muted">
                          Còn lại: <strong className="text-success">{sub.remainingServices || sub.totalServices}</strong> dịch vụ
                        </small>
                      </div>

                      <div className="mb-2">
                        <p className="mb-1">
                          <strong>Giá trị:</strong> {formatCurrency(sub.purchasePrice || sub.price)}
                        </p>
                        {sub.discountPercent > 0 && (
                          <span className="badge bg-danger">-{sub.discountPercent}%</span>
                        )}
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary flex-fill"
                          onClick={() => navigate(`/subscriptions/${sub.subscriptionId}`)}
                        >
                          <i className="bi bi-eye"></i> Chi tiết
                        </button>
                        {sub.status === 'Active' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCancelClick(sub)}
                            disabled={isCancelling}
                          >
                            <i className="bi bi-x-circle"></i> Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hủy gói đăng ký</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc muốn hủy gói đăng ký <strong>{selectedSubscription?.packageName}</strong>?</p>
                <div className="mb-3">
                  <label className="form-label">Lý do hủy *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy gói đăng ký..."
                  />
                </div>
                {message && <div className="alert alert-danger">{message}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                  Đóng
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmCancel} disabled={isCancelling}>
                  {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
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

export default MySubscriptions;
