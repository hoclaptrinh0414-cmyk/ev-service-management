// src/pages/customer/MyAppointments.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../Home.css';
import './MyAppointments.css';
import MainLayout from '../../components/layout/MainLayout';

const statusMap = {
  pending: { color: 'warning', text: 'Pending confirmation', icon: 'clock-history' },
  confirmed: { color: 'info', text: 'Confirmed', icon: 'check-circle' },
  inprogress: { color: 'primary', text: 'In progress', icon: 'gear' },
  completed: { color: 'success', text: 'Completed', icon: 'check-all' },
  completed_partial: { color: 'success', text: 'Completed (unpaid)', icon: 'check2-circle' },
  cancelled: { color: 'danger', text: 'Cancelled', icon: 'x-circle' },
  noshow: { color: 'secondary', text: 'No-show', icon: 'dash-circle' },
  unknown: { color: 'secondary', text: 'Unknown', icon: 'question-circle' },
};

const canonicalStatus = (status) => {
  const raw = (status || '').toString().trim().toLowerCase();
  if (['pending', 'pendingpayment', 'awaitingpayment'].includes(raw)) return 'pending';
  if (['confirmed'].includes(raw)) return 'confirmed';
  if (['inprogress', 'processing', 'ongoing'].includes(raw)) return 'inprogress';
  if (['completed'].includes(raw)) return 'completed';
  if (['completedwithunpaidbalance', 'completed_partial', 'completedpartiallypaid'].includes(raw)) return 'completed_partial';
  if (['cancelled', 'canceled', 'cancelledbystaff', 'cancelled_by_staff', 'customer_cancelled'].includes(raw)) return 'cancelled';
  if (['noshow', 'no_show', 'no-show'].includes(raw)) return 'noshow';
  return raw || 'unknown';
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming'
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateDesc'); // dateAsc | dateDesc
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeCenters, setActiveCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadAppointments();
    loadCenters();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [activeTab, appointments, statusFilter, sortBy, dateFilter]);

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

  const loadCenters = async () => {
    const extract = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.data?.items)) return payload.data.items;
      return [];
    };

    try {
      const res = await appointmentService.getActiveServiceCenters();
      let centers = extract(res);

      if (!centers.length) {
        // fallback to full list
        const all = await appointmentService.getServiceCenters?.();
        centers = extract(all);
      }

      setActiveCenters(centers);
    } catch (error) {
      console.error('Error loading centers:', error);
      setActiveCenters([]);
    }
  };

  const filterAppointments = () => {
    let list = [...appointments];

    const isSameDay = (d1, d2) => {
      if (!d1 || !d2) return false;
      const a = new Date(d1);
      const b = new Date(d2);
      return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
      );
    };

    if (activeTab !== 'all') {
      const now = new Date();
      list = list.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate || apt.slotDate);
        const canon = canonicalStatus(apt.statusName || apt.status);
        return aptDate >= now && canon !== 'cancelled' && canon !== 'completed';
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter((apt) => canonicalStatus(apt.statusName || apt.status) === statusFilter);
    }

    if (dateFilter) {
      list = list.filter((apt) =>
        isSameDay(dateFilter, apt.appointmentDate || apt.slotDate)
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
    const canon = canonicalStatus(status);
    const info = statusMap[canon] || statusMap.unknown;
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
    if (!activeCenters.length) {
      await loadCenters();
    }
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    setMessage('');
    setAvailableSlots([]);
    setSelectedSlot(null);
    setSelectedCenterId(appointment.serviceCenterId || null);
    setRescheduleDate('');
    setRescheduleReason('');
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
    setMessage('');
    setCancelReason('');
  };

  const loadSlotsForReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !selectedCenterId) return;

    try {
      const response = await appointmentService.getAvailableSlots(
        selectedCenterId,
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
  }, [rescheduleDate, selectedCenterId]);

  const confirmReschedule = async () => {
    if (!selectedCenterId) {
      setMessage('Vui long chon trung tam moi.');
      return;
    }
    if (!rescheduleDate) {
      setMessage('Vui long chon ngay moi.');
      return;
    }
    if (!selectedSlot) {
      setMessage('Vui long chon khung gio moi.');
      return;
    }

    try {
      setLoading(true);
      const res = await appointmentService.rescheduleAppointment(
        selectedAppointment.appointmentId,
        selectedSlot.slotId,
        rescheduleReason || 'Customer requested reschedule'
      );
      const newId =
        res?.data?.appointmentId ||
        res?.data?.newAppointmentId ||
        res?.appointmentId ||
        res?.newAppointmentId;
      setMessage(newId ? `Rescheduled successfully. New appointment #${newId}` : 'Rescheduled successfully!');
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

  return (
    <MainLayout>
      {/* Main Content */}
      <section style={{ marginTop: '20px', minHeight: '60vh' }}>
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
                <option value="all">Status: all</option>
                <option value="pending">Pending confirmation</option>
                <option value="confirmed">Confirmed</option>
                <option value="inprogress">In progress</option>
                <option value="completed">Completed</option>
                <option value="completed_partial">Completed (unpaid)</option>
                <option value="cancelled">Cancelled</option>
                <option value="noshow">No-show</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-calendar3"></i>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button
                  className="btn btn-link btn-sm text-decoration-none"
                  onClick={() => setDateFilter('')}
                >
                  Clear
                </button>
              )}
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
                const paymentStatus =
                  appointment.paymentStatusName ||
                  appointment.paymentStatus ||
                  appointment.paymentIntentStatus ||
                  '';
                const canonStatus = canonicalStatus(appointment.statusName || appointment.status);
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
                          {getStatusBadge(canonStatus)}
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
                          <div className="info-value">
                            {appointment.vehicleName || appointment.vehicleModel || 'N/A'}
                          </div>
                          <div className="info-sub">{appointment.vehicleLicensePlate || ''}</div>
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
                          {(canonStatus === 'pending' || canonStatus === 'confirmed') && (
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => handleReschedule(appointment)}
                            >
                              <i className="bi bi-calendar-range me-1"></i>
                              Doi lich
                            </button>
                          )}
                          {(canonStatus === 'pending' || canonStatus === 'confirmed') && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleCancelAppointment(appointment)}
                            >
                              <i className="bi bi-x-circle me-1"></i>
                              Huy
                            </button>
                          )}
                          {canonStatus === 'cancelled' && (
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
                  <label className="form-label">Chon trung tam moi</label>
                  <select
                    className="form-select"
                    value={selectedCenterId || ''}
                    onChange={(e) => {
                      setSelectedCenterId(e.target.value ? Number(e.target.value) : null);
                      setSelectedSlot(null);
                      setAvailableSlots([]);
                    }}
                  >
                    <option value="">Select center</option>
                  {activeCenters.map((c) => {
                    const id = c.serviceCenterId || c.id || c.centerId;
                    const name = c.name || c.serviceCenterName || c.centerName;
                    return (
                      <option key={id} value={id}>
                        {name || 'Unnamed center'}
                      </option>
                    );
                  })}
                </select>
              </div>

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
                          {(() => {
                            const isAvailable =
                              slot.isAvailable !== false &&
                              (slot.availableSlots === undefined || Number(slot.availableSlots) > 0);
                            const isSelected = selectedSlot?.slotId === slot.slotId;
                            return (
                              <div
                                className={`card ${isSelected ? 'border-primary' : ''} ${!isAvailable ? 'opacity-50' : ''}`}
                                style={{ cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                                onClick={() => {
                                  if (!isAvailable) return;
                                  setSelectedSlot(slot);
                                }}
                                aria-disabled={!isAvailable}
                              >
                                <div className="card-body p-2 text-center">
                                  <small>{slot.startTime} - {slot.endTime}</small>
                                  <br />
                                  <span className={`badge ${isAvailable ? 'bg-success' : 'bg-secondary'} badge-sm`}>
                                    {slot.availableSlots !== undefined
                                      ? `${slot.availableSlots} slot${slot.availableSlots === 1 ? '' : 's'}`
                                      : isAvailable ? 'Available' : 'Full'}
                                  </span>
                                  {!isAvailable && (
                                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                                      Full
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCenterId && rescheduleDate && availableSlots.length === 0 && (
                  <div className="alert alert-warning mb-2">
                    Khong co khung gio trong cho trung tam va ngay nay. Vui long chon ngay/center khac.
                  </div>
                )}

                <div className="mb-3 mt-3">
                  <label className="form-label">Ly do doi lich (tuy chon, bat buoc tu lan 2)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Vi du: Khach yeu cau doi sang chi nhanh khac/khung gio khac"
                  />
                </div>
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
    </MainLayout>
  );
};

export default MyAppointments;
