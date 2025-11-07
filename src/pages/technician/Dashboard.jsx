// src/pages/technician/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  
  const name = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('technician_user') || 'null');
      return u?.fullName || u?.FullName || '';
    } catch {
      return '';
    }
  })();

  const menuItems = [
    {
      title: 'Chấm công',
      description: 'Check-in, Check-out và xem lịch sử chấm công',
      icon: 'bi-clock-history',
      color: 'primary',
      path: '/technician/attendance'
    },
    {
      title: 'Công việc',
      description: 'Xem danh sách công việc được giao',
      icon: 'bi-clipboard-check',
      color: 'success',
      path: '/technician/work-orders'
    },
    {
      title: 'Lịch làm việc',
      description: 'Xem lịch làm việc của tôi',
      icon: 'bi-calendar3',
      color: 'info',
      path: '/technician/schedule'
    },
    {
      title: 'Hiệu suất',
      description: 'Xem báo cáo hiệu suất làm việc',
      icon: 'bi-graph-up',
      color: 'warning',
      path: '/technician/performance'
    },
    {
      title: 'API Tester',
      description: 'Test tất cả Technician APIs',
      icon: 'bi-code-slash',
      color: 'danger',
      path: '/technician/api-tester'
    }
  ];

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="mb-4">
        <h2>
          <i className="bi bi-speedometer2 me-2"></i>
          Technician Dashboard
        </h2>
        <p className="text-muted">
          Chào mừng {name ? name : 'Technician'}!
        </p>
      </div>

      {/* Menu Grid */}
      <div className="row g-4">
        {menuItems.map((item, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div 
              className="card h-100 border-0 shadow-sm cursor-pointer hover-lift"
              onClick={() => navigate(item.path)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body text-center p-4">
                <div className={`mb-3 text-${item.color}`}>
                  <i className={`${item.icon} fs-1`}></i>
                </div>
                <h5 className="card-title mb-2">{item.title}</h5>
                <p className="card-text text-muted small">
                  {item.description}
                </p>
                <button className={`btn btn-${item.color} btn-sm mt-2`}>
                  <i className="bi bi-arrow-right me-1"></i>
                  Truy cập
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1 opacity-75">Công việc hôm nay</h6>
                  <h2 className="mb-0">--</h2>
                </div>
                <i className="bi bi-clipboard-check fs-1 opacity-50"></i>
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
                  <h2 className="mb-0">--</h2>
                </div>
                <i className="bi bi-check-circle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1 opacity-75">Đang thực hiện</h6>
                  <h2 className="mb-0">--</h2>
                </div>
                <i className="bi bi-hourglass-split fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;


