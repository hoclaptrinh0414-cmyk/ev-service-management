// src/pages/customer/MyAppointments.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';
import NotificationDropdown from '../../components/NotificationDropdown';
import useNotifications from '../../hooks/useNotifications';
import appointmentService from '../../services/appointmentService';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../Home.css';

const MyAppointments = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, dismissNotification } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'upcoming'
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [activeTab, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments();
      const data = Array.isArray(response.data) ? response.data :
                   Array.isArray(response) ? response : [];
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setMessage('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (activeTab === 'all') {
      setFilteredAppointments(appointments);
    } else {
      const now = new Date();
      const upcoming = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate || apt.slotDate);
        return aptDate >= now && apt.status !== 'Cancelled' && apt.status !== 'Completed';
      });
      setFilteredAppointments(upcoming);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { color: 'warning', text: 'Chờ xác nhận', icon: 'clock-history' },
      'Confirmed': { color: 'info', text: 'Đã xác nhận', icon: 'check-circle' },
      'InProgress': { color: 'primary', text: 'Đang thực hiện', icon: 'gear' },
      'Completed': { color: 'success', text: 'Hoàn thành', icon: 'check-all' },
      'Cancelled': { color: 'danger', text: 'Đã hủy', icon: 'x-circle' },
      'NoShow': { color: 'secondary', text: 'Không đến', icon: 'dash-circle' }
    };
    const statusInfo = statusMap[status] || { color: 'secondary', text: status, icon: 'question-circle' };
    return (
      <span className={`badge bg-${statusInfo.color}`}>
        <i className={`bi bi-${statusInfo.icon} me-1`}></i>
        {statusInfo.text}
      </span>
    );
  };

  const handleReschedule = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    setMessage('');

    // Load available slots for the center
    if (appointment.serviceCenterId && rescheduleDate) {
      try {
        const response = await appointmentService.getAvailableSlots(
          appointment.serviceCenterId,
          rescheduleDate
        );
        const slots = Array.isArray(response.data) ? response.data :
                     Array.isArray(response) ? response : [];
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error loading slots:', error);
      }
    }
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
    setMessage('');
  };

  const confirmReschedule = async () => {
    if (!selectedSlot) {
      setMessage('Vui lòng chọn khung giờ mới.');
      return;
    }

    try {
      setLoading(true);
      await appointmentService.rescheduleAppointment(
        selectedAppointment.appointmentId,
        selectedSlot.slotId,
        'Khách hàng yêu cầu dời lịch'
      );
      setMessage('Dời lịch thành công!');
      setShowRescheduleModal(false);
      loadAppointments();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error rescheduling:', error);
      setMessage(error.response?.data?.message || 'Không thể dời lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      setMessage('Vui lòng nhập lý do hủy lịch.');
      return;
    }

    try {
      setLoading(true);
      await appointmentService.cancelAppointment(
        selectedAppointment.appointmentId,
        cancelReason
      );
      setMessage('Hủy lịch thành công!');
      setShowCancelModal(false);
      setCancelReason('');
      loadAppointments();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error cancelling:', error);
      setMessage(error.response?.data?.message || 'Không thể hủy lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch hẹn này? (Chỉ xóa được lịch ở trạng thái Pending)')) {
      return;
    }

    try {
      setLoading(true);
      await appointmentService.deleteAppointment(appointmentId);
      setMessage('Xóa lịch hẹn thành công!');
      loadAppointments();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage(error.response?.data?.message || 'Không thể xóa lịch hẹn. Chỉ có thể xóa lịch ở trạng thái Pending.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type === 'appointment_reminder' && notification.appointmentId) {
      navigate('/my-appointments');
    }
  };

  const loadSlotsForReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate) return;

    try {
      const response = await appointmentService.getAvailableSlots(
        selectedAppointment.serviceCenterId,
        rescheduleDate
      );
      const slots = Array.isArray(response.data) ? response.data :
                   Array.isArray(response) ? response : [];
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    loadSlotsForReschedule();
  }, [rescheduleDate]);

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
              <i className="bi bi-calendar-check me-2"></i>
              Lịch hẹn của tôi
            </h2>
            <Link to="/schedule-service" className="btn btn-primary">
              <i className="bi bi-plus-circle me-1"></i>
              Đặt lịch mới
            </Link>
          </div>

          {message && (
            <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Tất cả ({appointments.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Sắp tới
              </button>
            </li>
          </ul>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="mt-3 text-muted">Không có lịch hẹn nào</p>
              <Link to="/schedule-service" className="btn btn-primary mt-2">
                Đặt lịch ngay
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {filteredAppointments.map(appointment => (
                <div key={appointment.appointmentId} className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-3">
                          <h6 className="mb-1">
                            <i className="bi bi-hash"></i>
                            {appointment.appointmentCode || appointment.appointmentId}
                          </h6>
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(appointment.appointmentDate || appointment.slotDate).toLocaleDateString('vi-VN')}
                          </small>
                          <br />
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {appointment.slotStartTime} - {appointment.slotEndTime}
                          </small>
                        </div>

                        <div className="col-md-3">
                          <small className="text-muted d-block">Xe</small>
                          <strong>{appointment.vehicleLicensePlate || 'N/A'}</strong>
                          <br />
                          <small>{appointment.vehicleModel || ''}</small>
                        </div>

                        <div className="col-md-3">
                          <small className="text-muted d-block">Trung tâm</small>
                          <strong>{appointment.serviceCenterName || 'N/A'}</strong>
                        </div>

                        <div className="col-md-3 text-end">
                          <div className="mb-2">
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="btn-group btn-group-sm">
                            {appointment.status === 'Pending' && (
                              <>
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleReschedule(appointment)}
                                  title="Dời lịch"
                                >
                                  <i className="bi bi-calendar-event"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleCancelAppointment(appointment)}
                                  title="Hủy lịch"
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => handleDeleteAppointment(appointment.appointmentId)}
                                  title="Xóa lịch"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}
                            {appointment.status === 'Confirmed' && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancelAppointment(appointment)}
                                title="Hủy lịch"
                              >
                                <i className="bi bi-x-circle"></i> Hủy
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {appointment.services && appointment.services.length > 0 && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-muted">Dịch vụ: </small>
                          {appointment.services.map((service, idx) => (
                            <span key={idx} className="badge bg-light text-dark me-1">
                              {service.serviceName || service}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Dời lịch hẹn</h5>
                <button type="button" className="btn-close" onClick={() => setShowRescheduleModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Chọn ngày mới</label>
                  <input
                    type="date"
                    className="form-control"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {availableSlots.length > 0 && (
                  <div>
                    <label className="form-label">Chọn khung giờ</label>
                    <div className="row g-2">
                      {availableSlots.map(slot => (
                        <div key={slot.slotId} className="col-6">
                          <div
                            className={`card ${selectedSlot?.slotId === slot.slotId ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div className="card-body p-2 text-center">
                              <small>{slot.startTime} - {slot.endTime}</small>
                              <br />
                              <span className="badge bg-success badge-sm">
                                {slot.availableSlots} trống
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRescheduleModal(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={confirmReschedule} disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận dời lịch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hủy lịch hẹn</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc muốn hủy lịch hẹn này?</p>
                <div className="mb-3">
                  <label className="form-label">Lý do hủy *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy lịch..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                  Không
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmCancel} disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận hủy'}
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

export default MyAppointments;
