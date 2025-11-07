// src/pages/technician/Attendance.jsx
import React, { useState, useEffect } from 'react';
import technicianService from '../../services/technicianService';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const navigate = useNavigate();
  const [todayShift, setTodayShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check-in form state
  const [checkInData, setCheckInData] = useState({
    serviceCenterId: 1, // Default service center
    shiftType: 'FullDay',
    notes: ''
  });

  // Check-out form state
  const [checkOutData, setCheckOutData] = useState({
    notes: '',
    earlyCheckoutReason: ''
  });

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  // Load today shift on mount
  useEffect(() => {
    loadTodayShift();
  }, []);

  const loadTodayShift = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await technicianService.getTodayShift();
      const shift = response.data || response;
      setTodayShift(shift);
      console.log('Today shift:', shift);
    } catch (err) {
      console.error('Failed to load today shift:', err);
      setError('Không thể tải thông tin ca làm việc hôm nay');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await technicianService.checkIn(checkInData);
      setSuccess('Check-in thành công!');
      setShowCheckInModal(false);
      
      // Reload shift data
      setTimeout(() => {
        loadTodayShift();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Check-in failed:', err);
      setError(err.response?.data?.message || err.message || 'Check-in thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await technicianService.checkOut(checkOutData);
      setSuccess('Check-out thành công!');
      setShowCheckOutModal(false);
      
      // Reload shift data
      setTimeout(() => {
        loadTodayShift();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Check-out failed:', err);
      setError(err.response?.data?.message || err.message || 'Check-out thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Scheduled': 'badge bg-secondary',
      'CheckedIn': 'badge bg-success',
      'CheckedOut': 'badge bg-info',
      'Completed': 'badge bg-primary',
      'Absent': 'badge bg-danger',
      'OnLeave': 'badge bg-warning'
    };
    return badges[status] || 'badge bg-secondary';
  };

  const canCheckIn = () => {
    if (!todayShift) return false;
    return todayShift.status === 'Scheduled' && !todayShift.checkInTime;
  };

  const canCheckOut = () => {
    if (!todayShift) return false;
    return todayShift.status === 'CheckedIn' && todayShift.checkInTime && !todayShift.checkOutTime;
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải thông tin ca làm việc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-clock-history me-2"></i>
          Chấm Công
        </h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/technician/attendance/history')}
        >
          <i className="bi bi-calendar3 me-2"></i>
          Lịch sử chấm công
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Today Shift Card */}
      {todayShift ? (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-calendar-day me-2"></i>
              Ca làm việc hôm nay - {formatDate(todayShift.shiftDate)}
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Shift Info */}
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-3">Thông tin ca làm</h6>
                <div className="mb-2">
                  <strong>Loại ca:</strong> 
                  <span className="ms-2 badge bg-info">{todayShift.shiftType || 'FullDay'}</span>
                </div>
                <div className="mb-2">
                  <strong>Trạng thái:</strong> 
                  <span className={`ms-2 ${getStatusBadge(todayShift.status)}`}>
                    {todayShift.status}
                  </span>
                </div>
                <div className="mb-2">
                  <strong>Giờ bắt đầu:</strong> 
                  <span className="ms-2">{formatTime(todayShift.scheduledStartTime)}</span>
                </div>
                <div className="mb-2">
                  <strong>Giờ kết thúc:</strong> 
                  <span className="ms-2">{formatTime(todayShift.scheduledEndTime)}</span>
                </div>
              </div>

              {/* Attendance Info */}
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-3">Chấm công</h6>
                <div className="mb-2">
                  <strong>Giờ check-in:</strong> 
                  <span className="ms-2">
                    {todayShift.checkInTime ? (
                      <>
                        {formatTime(todayShift.checkInTime)}
                        {todayShift.isLate && (
                          <span className="badge bg-warning ms-2">
                            Trễ {todayShift.lateMinutes} phút
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">Chưa check-in</span>
                    )}
                  </span>
                </div>
                <div className="mb-2">
                  <strong>Giờ check-out:</strong> 
                  <span className="ms-2">
                    {todayShift.checkOutTime ? (
                      <>
                        {formatTime(todayShift.checkOutTime)}
                        {todayShift.isEarlyLeave && (
                          <span className="badge bg-warning ms-2">Về sớm</span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">Chưa check-out</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="row mt-3">
              <div className="col-12">
                {canCheckIn() && (
                  <button 
                    className="btn btn-success btn-lg me-2"
                    onClick={() => setShowCheckInModal(true)}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Check-in
                  </button>
                )}

                {canCheckOut() && (
                  <button 
                    className="btn btn-warning btn-lg"
                    onClick={() => setShowCheckOutModal(true)}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Check-out
                  </button>
                )}

                {todayShift.checkOutTime && (
                  <div className="alert alert-success mt-3 mb-0">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Bạn đã hoàn thành ca làm việc hôm nay!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Không có ca làm việc nào được lên lịch cho hôm nay.
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Check-in
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowCheckInModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCheckIn}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Service Center ID</label>
                    <input
                      type="number"
                      className="form-control"
                      value={checkInData.serviceCenterId}
                      onChange={(e) => setCheckInData({
                        ...checkInData,
                        serviceCenterId: parseInt(e.target.value)
                      })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Loại ca</label>
                    <select
                      className="form-select"
                      value={checkInData.shiftType}
                      onChange={(e) => setCheckInData({
                        ...checkInData,
                        shiftType: e.target.value
                      })}
                    >
                      <option value="FullDay">Ca ngày</option>
                      <option value="Morning">Ca sáng</option>
                      <option value="Afternoon">Ca chiều</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Ghi chú (tùy chọn)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={checkInData.notes}
                      onChange={(e) => setCheckInData({
                        ...checkInData,
                        notes: e.target.value
                      })}
                      placeholder="Nhập ghi chú nếu cần..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCheckInModal(false)}
                    disabled={actionLoading}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang check-in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Xác nhận Check-in
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {showCheckOutModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Check-out
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCheckOutModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCheckOut}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Ghi chú (tùy chọn)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={checkOutData.notes}
                      onChange={(e) => setCheckOutData({
                        ...checkOutData,
                        notes: e.target.value
                      })}
                      placeholder="Nhập ghi chú về ca làm việc..."
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Lý do về sớm (nếu có)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={checkOutData.earlyCheckoutReason}
                      onChange={(e) => setCheckOutData({
                        ...checkOutData,
                        earlyCheckoutReason: e.target.value
                      })}
                      placeholder="Chỉ nhập nếu bạn về sớm..."
                    />
                    <small className="text-muted">
                      Để trống nếu check-out đúng giờ
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCheckOutModal(false)}
                    disabled={actionLoading}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang check-out...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Xác nhận Check-out
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
