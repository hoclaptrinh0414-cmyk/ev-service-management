// src/pages/technician/MySchedule.jsx
import React, { useState, useEffect } from 'react';
import technicianService from '../../services/technicianService';
import { useNavigate } from 'react-router-dom';

const MySchedule = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  // Date range filter
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Initialize with current week
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Saturday

    setDateRange({
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const loadSchedule = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {};
      if (dateRange.startDate) {
        params.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }

      const response = await technicianService.getMySchedule(params);
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        setSchedules(data);
      } else if (data.items) {
        setSchedules(data.items);
      } else {
        setSchedules([]);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
      setError('Không thể tải lịch làm việc');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    setDateRange({
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0]
    });
  };

  const handleNextWeek = () => {
    const today = new Date();
    const startOfNextWeek = new Date(today);
    startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()));
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    setDateRange({
      startDate: startOfNextWeek.toISOString().split('T')[0],
      endDate: endOfNextWeek.toISOString().split('T')[0]
    });
  };

  const handleThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getShiftTypeBadge = (shiftType) => {
    const badges = {
      'FullDay': { class: 'bg-primary', text: 'Ca ngày' },
      'Morning': { class: 'bg-info', text: 'Ca sáng' },
      'Afternoon': { class: 'bg-warning', text: 'Ca chiều' },
      'Night': { class: 'bg-dark', text: 'Ca đêm' }
    };
    const badge = badges[shiftType] || { class: 'bg-secondary', text: shiftType };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
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

  const groupSchedulesByDate = () => {
    const grouped = {};
    schedules.forEach(schedule => {
      // Validate date before parsing
      if (!schedule.shiftDate) return;
      
      const dateObj = new Date(schedule.shiftDate);
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid shiftDate:', schedule.shiftDate);
        return;
      }
      
      const date = dateObj.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(schedule);
    });
    return grouped;
  };

  const renderListView = () => {
    const groupedSchedules = groupSchedulesByDate();
    const sortedDates = Object.keys(groupedSchedules).sort();

    if (sortedDates.length === 0) {
      return (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle me-2"></i>
          Không có lịch làm việc trong khoảng thời gian này
        </div>
      );
    }

    return (
      <div className="schedule-list">
        {sortedDates.map(date => (
          <div key={date} className="card mb-3 shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                {formatDate(date)}
              </h6>
            </div>
            <div className="card-body">
              {groupedSchedules[date].map((schedule, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center mb-2 p-3 border rounded">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      {getShiftTypeBadge(schedule.shiftType)}
                      <span className="ms-2">{getStatusBadge(schedule.status)}</span>
                    </div>
                    <div className="text-muted small">
                      <i className="bi bi-clock me-1"></i>
                      {formatTime(schedule.scheduledStartTime)} - {formatTime(schedule.scheduledEndTime)}
                    </div>
                    {schedule.serviceCenterName && (
                      <div className="text-muted small mt-1">
                        <i className="bi bi-geo-alt me-1"></i>
                        {schedule.serviceCenterName}
                      </div>
                    )}
                  </div>
                  {schedule.checkInTime && (
                    <div className="text-end">
                      <small className="text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Check-in: {formatTime(schedule.checkInTime)}
                      </small>
                      {schedule.checkOutTime && (
                        <small className="text-info d-block mt-1">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Check-out: {formatTime(schedule.checkOutTime)}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarView = () => {
    // Simple calendar grid for the week/month
    const groupedSchedules = groupSchedulesByDate();
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const days = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return (
      <div className="row g-3">
        {days.map((day, idx) => {
          const dateKey = day.toISOString().split('T')[0];
          const daySchedules = groupedSchedules[dateKey] || [];
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <div key={idx} className="col-md-6 col-lg-4 col-xl-3">
              <div className={`card h-100 ${isToday ? 'border-primary' : ''}`}>
                <div className={`card-header ${isToday ? 'bg-primary text-white' : 'bg-light'}`}>
                  <h6 className="mb-0">
                    {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    <br />
                    <small>{day.getDate()}/{day.getMonth() + 1}</small>
                  </h6>
                </div>
                <div className="card-body p-2">
                  {daySchedules.length > 0 ? (
                    daySchedules.map((schedule, sidx) => (
                      <div key={sidx} className="p-2 mb-2 bg-light rounded">
                        <div className="mb-1">
                          {getShiftTypeBadge(schedule.shiftType)}
                        </div>
                        <small className="text-muted d-block">
                          <i className="bi bi-clock"></i> {formatTime(schedule.scheduledStartTime)}
                        </small>
                        <small>{getStatusBadge(schedule.status)}</small>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small mb-0">Không có ca</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-calendar3 me-2"></i>
          Lịch làm việc của tôi
        </h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/technician')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </button>
      </div>

      {/* Filters & View Controls */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* Date Range */}
            <div className="col-md-3">
              <label className="form-label">Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  startDate: e.target.value
                })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  endDate: e.target.value
                })}
              />
            </div>

            {/* Quick Filters */}
            <div className="col-md-6">
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={handleThisWeek}
                >
                  <i className="bi bi-calendar-week me-1"></i>
                  Tuần này
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={handleNextWeek}
                >
                  <i className="bi bi-calendar-week me-1"></i>
                  Tuần sau
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={handleThisMonth}
                >
                  <i className="bi bi-calendar-month me-1"></i>
                  Tháng này
                </button>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="mt-3">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
              >
                <i className="bi bi-list-ul me-2"></i>
                Danh sách
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('calendar')}
              >
                <i className="bi bi-calendar3 me-2"></i>
                Lịch
              </button>
            </div>
          </div>
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
          <p className="mt-2">Đang tải lịch làm việc...</p>
        </div>
      )}

      {/* Schedule Content */}
      {!loading && (
        <>
          {/* Summary Stats */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 opacity-75">Tổng ca làm</h6>
                      <h2 className="mb-0">{schedules.length}</h2>
                    </div>
                    <i className="bi bi-calendar-check fs-1 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 opacity-75">Đã hoàn thành</h6>
                      <h2 className="mb-0">
                        {schedules.filter(s => s.status === 'Completed' || s.status === 'CheckedOut').length}
                      </h2>
                    </div>
                    <i className="bi bi-check-circle fs-1 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 opacity-75">Sắp tới</h6>
                      <h2 className="mb-0">
                        {schedules.filter(s => s.status === 'Scheduled').length}
                      </h2>
                    </div>
                    <i className="bi bi-hourglass-split fs-1 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Render based on view mode */}
          {viewMode === 'list' ? renderListView() : renderCalendarView()}
        </>
      )}
    </div>
  );
};

export default MySchedule;
