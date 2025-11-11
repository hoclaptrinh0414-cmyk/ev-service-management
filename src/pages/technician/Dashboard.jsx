// src/pages/staff/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { searchWorkOrders } from '../../services/staffService';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayWorkOrders: 0,
    pendingTasks: 0,
    completedToday: 0,
    inProgress: 0
  });
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await searchWorkOrders({
        TechnicianId: user.userId,
        PageSize: 10
      });

      if (response.success && response.data) {
        const workOrders = response.data.items || [];
        
        // Calculate stats
        const today = new Date().toDateString();
        const todayOrders = workOrders.filter(wo => 
          new Date(wo.createdDate).toDateString() === today
        );
        
        setStats({
          todayWorkOrders: todayOrders.length,
          pendingTasks: workOrders.filter(wo => wo.status === 'Pending' || wo.status === 'Assigned').length,
          completedToday: todayOrders.filter(wo => wo.status === 'Completed').length,
          inProgress: workOrders.filter(wo => wo.status === 'InProgress').length
        });

        setRecentWorkOrders(workOrders.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-warning',
      'Assigned': 'bg-info',
      'InProgress': 'bg-primary',
      'Completed': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Dashboard</h1>
        <p className="text-muted">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Today's Work Orders</p>
                  <h2 className="mb-0 fw-bold">{stats.todayWorkOrders}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-calendar-check text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Pending Tasks</p>
                  <h2 className="mb-0 fw-bold">{stats.pendingTasks}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-clock-history text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">In Progress</p>
                  <h2 className="mb-0 fw-bold">{stats.inProgress}</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-gear-fill text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Completed Today</p>
                  <h2 className="mb-0 fw-bold">{stats.completedToday}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-check-circle-fill text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Work Orders */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">Recent Work Orders</h5>
            <button className="btn btn-sm btn-outline-primary" onClick={fetchDashboardData}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>

          {recentWorkOrders.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-2">No work orders assigned yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Work Order ID</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWorkOrders.map(wo => (
                    <tr key={wo.workOrderId}>
                      <td>
                        <strong>#{wo.workOrderCode || wo.workOrderId}</strong>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{wo.vehicleLicensePlate || 'N/A'}</div>
                          <small className="text-muted">{wo.vehicleMake} {wo.vehicleModel}</small>
                        </div>
                      </td>
                      <td>{wo.customerName || 'N/A'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(wo.status)}`}>
                          {wo.status}
                        </span>
                      </td>
                      <td>
                        <small>{new Date(wo.createdDate).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => window.location.href = `/staff/work-orders/${wo.workOrderId}`}
                        >
                          <i className="bi bi-eye me-1"></i>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
