// src/pages/technician/AttendanceHistory.jsx
import React, { useState, useEffect } from 'react';
import technicianService from '../../services/technicianService';
import { useNavigate } from 'react-router-dom';

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    loadShifts();
  }, [currentPage]);

  const loadShifts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        Page: currentPage,
        PageSize: pageSize
      };

      // Add date filters if provided
      if (dateRange.fromDate) {
        params.FromDate = dateRange.fromDate;
      }
      if (dateRange.toDate) {
        params.ToDate = dateRange.toDate;
      }

      const response = await technicianService.getMyShifts(params);
      const data = response.data || response;
      
      if (data.items) {
        setShifts(data.items);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setShifts(data);
      } else {
        setShifts([]);
      }
    } catch (err) {
      console.error('Failed to load shifts:', err);
      setError('Không thể tải lịch sử chấm công');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadShifts();
  };

  const resetFilter = () => {
    setDateRange({ fromDate: '', toDate: '' });
    setCurrentPage(1);
    setTimeout(loadShifts, 100);
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
      'Scheduled': { class: 'bg-secondary', text: 'Đã lên lịch' },
      'CheckedIn': { class: 'bg-success', text: 'Đã check-in' },
      'CheckedOut': { class: 'bg-info', text: 'Đã check-out' },
      'Completed': { class: 'bg-primary', text: 'Hoàn thành' },
      'Absent': { class: 'bg-danger', text: 'Vắng mặt' },
      'OnLeave': { class: 'bg-warning', text: 'Nghỉ phép' }
    };
    const badge = badges[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-calendar3 me-2"></i>
          Lịch sử chấm công
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/technician/attendance')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleFilter}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Từ ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.fromDate}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    fromDate: e.target.value
                  })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Đến ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.toDate}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    toDate: e.target.value
                  })}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary me-2">
                  <i className="bi bi-search me-2"></i>
                  Lọc
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={resetFilter}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Xóa lọc
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Shifts Table */}
      {!loading && (
        <>
          {shifts.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>Ngày</th>
                      <th>Loại ca</th>
                      <th>Trạng thái</th>
                      <th>Giờ dự kiến</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Số giờ làm</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift, index) => (
                      <tr key={shift.shiftId || index}>
                        <td>{formatDate(shift.shiftDate)}</td>
                        <td>
                          <span className="badge bg-info">
                            {shift.shiftType || 'FullDay'}
                          </span>
                        </td>
                        <td>{getStatusBadge(shift.status)}</td>
                        <td>
                          {formatTime(shift.scheduledStartTime)} - {formatTime(shift.scheduledEndTime)}
                        </td>
                        <td>
                          {shift.checkInTime ? (
                            <>
                              {formatTime(shift.checkInTime)}
                              {shift.isLate && (
                                <span className="badge bg-warning ms-1" title={`Trễ ${shift.lateMinutes} phút`}>
                                  <i className="bi bi-exclamation-triangle"></i>
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted">--</span>
                          )}
                        </td>
                        <td>
                          {shift.checkOutTime ? (
                            <>
                              {formatTime(shift.checkOutTime)}
                              {shift.isEarlyLeave && (
                                <span className="badge bg-warning ms-1" title="Về sớm">
                                  <i className="bi bi-exclamation-triangle"></i>
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted">--</span>
                          )}
                        </td>
                        <td>
                          {calculateWorkHours(shift.checkInTime, shift.checkOutTime)}
                        </td>
                        <td>
                          {shift.notes ? (
                            <small className="text-muted">{shift.notes}</small>
                          ) : (
                            '--'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <li 
                        key={i + 1}
                        className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              Không tìm thấy lịch sử chấm công
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceHistory;
