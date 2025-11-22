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
import './MyAppointments.css';

const statusMap = {
  Pending: { color: 'warning', text: 'Cho xac nhan', icon: 'clock-history' },
  Confirmed: { color: 'info', text: 'Da xac nhan', icon: 'check-circle' },
  InProgress: { color: 'primary', text: 'Dang thuc hien', icon: 'gear' },
  Completed: { color: 'success', text: 'Hoan thanh', icon: 'check-all' },
  Cancelled: { color: 'danger', text: 'Da huy', icon: 'x-circle' },
  NoShow: { color: 'secondary', text: 'Khong den', icon: 'dash-circle' },
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, dismissNotification } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming'
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateDesc'); // dateAsc | dateDesc

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [activeTab, appointments, statusFilter, sortBy]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments();
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setMessage('Khong the tai danh sach lich hen. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let list = [...appointments];

    if (activeTab !== 'all') {
      const now = new Date();
      list = list.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate || apt.slotDate);
        return aptDate >= now && apt.status !== 'Cancelled' && apt.status !== 'Completed';
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter(
        (apt) => (apt.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    list.sort((a, b) => {
      const aDate = new Date(a.appointmentDate || a.slotDate || 0).getTime();
      const bDate = new Date(b.appointmentDate || b.slotDate || 0).getTime();
      return sortBy === 'dateAsc' ? aDate - bDate : bDate - aDate;
    });

    setFilteredAppointments(list);
  };

  const getStatusBadge = (status) => {
    const info = statusMap[status] || { color: 'secondary', text: status || 'Unknown', icon: 'question-circle' };
    return (
      <span className={`badge bg-${info.color}`}>
        <i className={`bi bi-${info.icon} me-1`}></i>
        {info.text}
      </span>
    );
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('vi-VN');
    } catch {
      return value;
    }
  };

  const formatTimeRange = (start, end) => {
    if (!start || !end) return '';
    return `${start} - ${end}`;
  };

  const handleReschedule = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    setMessage('');
    setAvailableSlots([]);
    setSelectedSlot(null);
    setRescheduleDate('');
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
    setMessage('');
    setCancelReason('');
  };

  const loadSlotsForReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate) return;

    try {
      const response = await appointmentService.getAvailableSlots(
        selectedAppointment.serviceCenterId,
        rescheduleDate
      );
      const slots = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    loadSlotsForReschedule();
  }, [rescheduleDate]);

  const confirmReschedule = async () => {
    if (!selectedSlot) {
      setMessage('Vui long chon khung gio moi.');
      return;
    }

    try {
      setLoading(true);
      await appointmentService.rescheduleAppointment(
        selectedAppointment.appointmentId,
        selectedSlot.slotId,
        'Khach hang yeu cau doi lich'
      );
      setMessage('Doi lich thanh cong!');
      setShowRescheduleModal(false);
      loadAppointments();
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Error rescheduling:', error);
      setMessage(error.response?.data?.message || 'Khong the doi lich. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      setMessage('Vui long nhap ly do huy lich.');
      return;
    }

    try {
      setLoading(true);
      await appointmentService.cancelAppointment(
        selectedAppointment.appointmentId,
        cancelReason
      );
      setMessage('Huy lich thanh cong!');
      setShowCancelModal(false);
      setCancelReason('');
      loadAppointments();
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Error cancelling:', error);
      setMessage(error.response?.data?.message || 'Khong the huy lich. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Ban co chac muon xoa lich hen nay? (Chi xoa duoc lich dang Pending)')) {
      return;
    }

    try {
      setLoading(true);
      await appointmentService.deleteAppointment(appointmentId);
      setMessage('Xoa lich hen thanh cong!');
      loadAppointments();
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage(error.response?.data?.message || 'Khong the xoa lich hen. Chi xoa duoc lich dang Pending.');
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
                placeholder="Tim kiem..."
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
                  <Link className="nav-link move" to="/home">TRANG CHU</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle move" href="#" role="button" data-bs-toggle="dropdown">
                    DICH VU
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/my-appointments">Theo doi & Nhac nho</Link></li>
                    <li><Link className="dropdown-item" to="/schedule-service">Dat lich dich vu</Link></li>
                    <li><Link className="dropdown-item" to="/products/combo">Lich hen cua toi</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">BLOG</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">GIOI THIEU</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">LIEN HE</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section style={{ marginTop: '180px', minHeight: '60vh' }}>
        <div className="container">
          <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                <i className="bi bi-calendar-check me-2"></i>
                Lich hen cua toi
              </h2>
              <p className="text-muted mb-0">Xem, doi lich, huy lich nhanh chong</p>
            </div>
            <Link to="/schedule-service" className="btn btn-primary btn-lg">
              <i className="bi bi-plus-circle me-1"></i>
              Dat lich moi
            </Link>
          </div>

          {message && (
            <div className={`alert ${message.toLowerCase().includes('thanh cong') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          <div className="appointments-filter-bar d-flex flex-wrap align-items-center gap-3 mb-4">
            <div className="btn-group" role="group" aria-label="tabs">
              <button
                className={`btn btn-sm ${activeTab === 'all' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setActiveTab('all')}
              >
                Tat ca ({appointments.length})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'upcoming' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Sap toi
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-funnel"></i>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Trang thai: tat ca</option>
                <option value="Pending">Cho xac nhan</option>
                <option value="Confirmed">Da xac nhan</option>
                <option value="InProgress">Dang thuc hien</option>
                <option value="Completed">Hoan thanh</option>
                <option value="Cancelled">Da huy</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <i className="bi bi-sort-down"></i>
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dateDesc">Moi nhat</option>
                <option value="dateAsc">Cu nhat</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="mt-3 text-muted">Khong co lich hen nao</p>
              <Link to="/schedule-service" className="btn btn-primary mt-2">
                Dat lich ngay
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {filteredAppointments.map((appointment) => {
                const paymentStatus = appointment.paymentStatus || appointment.paymentIntentStatus || '';
                return (
                  <div key={appointment.appointmentId} className="col-12 col-md-6 col-lg-4">
                    <div className="appointment-card">
                      <div className="appointment-card-header">
                        <div>
                          <div className="appointment-code">#{appointment.appointmentCode || appointment.appointmentId}</div>
                          <div className="appointment-datetime">
                            <span><i className="bi bi-calendar-event me-1"></i>{formatDate(appointment.appointmentDate || appointment.slotDate)}</span>
                            <span className="dot-separator"></span>
                            <span><i className="bi bi-clock me-1"></i>{formatTimeRange(appointment.slotStartTime, appointment.slotEndTime)}</span>
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2">
                          {getStatusBadge(appointment.status)}
                          {paymentStatus && (
                            <span className="payment-pill">
                              <i className="bi bi-wallet2 me-1"></i>
                              {paymentStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="appointment-card-body">
                        <div className="info-block">
                          <p className="muted-label mb-1"><i className="bi bi-car-front me-1"></i>Xe</p>
                          <div className="info-value">{appointment.vehicleLicensePlate || 'N/A'}</div>
                          <div className="info-sub">{appointment.vehicleModel || ''}</div>
                        </div>

                        <div className="info-block">
                          <p className="muted-label mb-1"><i className="bi bi-building me-1"></i>Trung tam</p>
                          <div className="info-value">{appointment.serviceCenterName || 'N/A'}</div>
                          <div className="info-sub">{appointment.serviceCenterAddress || ''}</div>
                        </div>

                        <div className="info-block align-items-start">
                          <p className="muted-label mb-1"><i className="bi bi-tools me-1"></i>Dich vu</p>
                          {appointment.services && appointment.services.length > 0 ? (
                            <div className="service-chips">
                              {appointment.services.map((service, idx) => (
                                <span key={idx}>{service.serviceName || service.name || service}</span>
                              ))}
                            </div>
                          ) : (
                            <div className="info-sub">Chua co thong tin dich vu</div>
                          )}
                        </div>
                      </div>

                      <div className="appointment-card-footer">
                        <div className="action-group">
                          {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => handleReschedule(appointment)}
                            >
                              <i className="bi bi-calendar-range me-1"></i>
                              Doi lich
                            </button>
                          )}
                          {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleCancelAppointment(appointment)}
                            >
                              <i className="bi bi-x-circle me-1"></i>
                              Huy
                            </button>
                          )}
                          {appointment.status === 'Cancelled' && (
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleDeleteAppointment(appointment.appointmentId)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Xoa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                <h5 className="modal-title">Doi lich hen</h5>
                <button type="button" className="btn-close" onClick={() => setShowRescheduleModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Chon ngay moi</label>
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
                    <label className="form-label">Chon khung gio</label>
                    <div className="row g-2">
                      {availableSlots.map((slot) => (
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
                                {slot.availableSlots} trong
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
                  Huy
                </button>
                <button type="button" className="btn btn-primary" onClick={confirmReschedule} disabled={loading}>
                  {loading ? 'Dang xu ly...' : 'Xac nhan doi lich'}
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
                <h5 className="modal-title">Huy lich hen</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Ban co chac muon huy lich hen nay?</p>
                <div className="mb-3">
                  <label className="form-label">Ly do huy *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhap ly do huy lich..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                  Khong
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmCancel} disabled={loading}>
                  {loading ? 'Dang xu ly...' : 'Xac nhan huy'}
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
            <p>&copy; 2025 Tesla Viet Nam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default MyAppointments;
