// src/pages/technician/MyPerformance.jsx
import React, { useState, useEffect } from 'react';
import technicianService from '../../services/technicianService';
import { useNavigate } from 'react-router-dom';

const MyPerformance = () => {
  const navigate = useNavigate();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date range filter
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });

  // Initialize with current month
  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange({
      fromDate: startOfMonth.toISOString().split('T')[0],
      toDate: endOfMonth.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (dateRange.fromDate && dateRange.toDate) {
      loadPerformance();
    }
  }, [dateRange]);

  const loadPerformance = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        FromDate: dateRange.fromDate,
        ToDate: dateRange.toDate
      };

      const response = await technicianService.getMyPerformance(params);
      const data = response.data || response;
      setPerformance(data);
    } catch (err) {
      console.error('Failed to load performance:', err);
      setError('Không thể tải dữ liệu hiệu suất');
      setPerformance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange({
      fromDate: startOfMonth.toISOString().split('T')[0],
      toDate: endOfMonth.toISOString().split('T')[0]
    });
  };

  const handleLastMonth = () => {
    const today = new Date();
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    setDateRange({
      fromDate: startOfLastMonth.toISOString().split('T')[0],
      toDate: endOfLastMonth.toISOString().split('T')[0]
    });
  };

  const handleLast3Months = () => {
    const today = new Date();
    const start3MonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange({
      fromDate: start3MonthsAgo.toISOString().split('T')[0],
      toDate: endOfMonth.toISOString().split('T')[0]
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-graph-up me-2"></i>
          Hiệu suất làm việc
        </h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/technician')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
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
            <div className="col-md-3">
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
            <div className="col-md-6">
              <div className="btn-group" role="group">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleThisMonth}
                >
                  Tháng này
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleLastMonth}
                >
                  Tháng trước
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleLast3Months}
                >
                  3 tháng
                </button>
              </div>
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
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Performance Data */}
      {!loading && performance && (
        <>
          {/* KPI Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <i className="bi bi-clipboard-check text-primary fs-1 mb-3"></i>
                  <h6 className="text-muted mb-2">Công việc hoàn thành</h6>
                  <h2 className="mb-0">{performance.completedWorkOrders || 0}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <i className="bi bi-star-fill text-warning fs-1 mb-3"></i>
                  <h6 className="text-muted mb-2">Đánh giá trung bình</h6>
                  <h2 className="mb-0">
                    {performance.averageRating ? performance.averageRating.toFixed(1) : '--'}
                    <small className="text-muted fs-6">/5.0</small>
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <i className="bi bi-clock-history text-info fs-1 mb-3"></i>
                  <h6 className="text-muted mb-2">Tổng giờ làm</h6>
                  <h2 className="mb-0">{performance.totalWorkHours || 0}h</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <i className="bi bi-speedometer2 text-success fs-1 mb-3"></i>
                  <h6 className="text-muted mb-2">Hiệu suất</h6>
                  <h2 className="mb-0">
                    {performance.performancePercentage || 0}%
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Chỉ số công việc
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tỷ lệ hoàn thành đúng hạn</span>
                      <strong>{performance.onTimeCompletionRate || 0}%</strong>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className={`progress-bar bg-${getProgressColor(performance.onTimeCompletionRate || 0)}`}
                        style={{ width: `${performance.onTimeCompletionRate || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tỷ lệ chất lượng</span>
                      <strong>{performance.qualityRate || 0}%</strong>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className={`progress-bar bg-${getProgressColor(performance.qualityRate || 0)}`}
                        style={{ width: `${performance.qualityRate || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-0">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tỷ lệ chấm công đúng giờ</span>
                      <strong>{performance.attendanceRate || 0}%</strong>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className={`progress-bar bg-${getProgressColor(performance.attendanceRate || 0)}`}
                        style={{ width: `${performance.attendanceRate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-award me-2"></i>
                    Thành tích
                  </h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Công việc đã làm</span>
                      <strong>{performance.totalWorkOrders || 0}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Hoàn thành</span>
                      <strong className="text-success">{performance.completedWorkOrders || 0}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Đang thực hiện</span>
                      <strong className="text-warning">{performance.inProgressWorkOrders || 0}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Số lần trễ giờ</span>
                      <strong className="text-danger">{performance.lateCount || 0}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Khách hàng hài lòng</span>
                      <strong className="text-success">{performance.satisfiedCustomers || 0}</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !performance && (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle me-2"></i>
          Không có dữ liệu hiệu suất trong khoảng thời gian này
        </div>
      )}
    </div>
  );
};

export default MyPerformance;
