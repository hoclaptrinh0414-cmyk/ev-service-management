// src/pages/staff/MyWorkOrders.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { searchWorkOrders, startWorkOrder, completeWorkOrder } from '../../services/staffService';

export default function MyWorkOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchWorkOrders();
  }, [selectedStatus]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const params = {
        TechnicianId: user.userId,
        PageSize: 50
      };

      if (selectedStatus !== 'All') {
        params.Status = selectedStatus;
      }

      if (searchTerm) {
        params.SearchTerm = searchTerm;
      }

      const response = await searchWorkOrders(params);
      
      if (response.success && response.data) {
        setWorkOrders(response.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkOrders();
  };

  const handleStartWork = async (workOrderId) => {
    if (!window.confirm('Start this work order?')) return;
    
    try {
      setActionLoading(workOrderId);
      await startWorkOrder(workOrderId);
      alert('Work order started successfully!');
      fetchWorkOrders();
    } catch (error) {
      alert('Failed to start work order: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteWork = async (workOrderId) => {
    if (!window.confirm('Complete this work order? Make sure all checklist items are done.')) return;
    
    try {
      setActionLoading(workOrderId);
      await completeWorkOrder(workOrderId);
      alert('Work order completed successfully!');
      fetchWorkOrders();
    } catch (error) {
      alert('Failed to complete work order: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': { bg: 'warning', icon: 'clock-history' },
      'Assigned': { bg: 'info', icon: 'person-check' },
      'InProgress': { bg: 'primary', icon: 'gear-fill' },
      'Completed': { bg: 'success', icon: 'check-circle-fill' },
      'Cancelled': { bg: 'danger', icon: 'x-circle-fill' }
    };
    return badges[status] || { bg: 'secondary', icon: 'question-circle' };
  };

  const getActionButtons = (wo) => {
    if (wo.status === 'Assigned') {
      return (
        <button 
          className="btn btn-sm btn-success me-2"
          onClick={() => handleStartWork(wo.workOrderId)}
          disabled={actionLoading === wo.workOrderId}
        >
          {actionLoading === wo.workOrderId ? (
            <span className="spinner-border spinner-border-sm me-1"></span>
          ) : (
            <i className="bi bi-play-fill me-1"></i>
          )}
          Start Work
        </button>
      );
    }

    if (wo.status === 'InProgress') {
      return (
        <>
          <button 
            className="btn btn-sm btn-primary me-2"
            onClick={() => navigate(`/staff/maintenance/${wo.workOrderId}`)}
          >
            <i className="bi bi-list-check me-1"></i>
            Checklist
          </button>
          <button 
            className="btn btn-sm btn-success me-2"
            onClick={() => handleCompleteWork(wo.workOrderId)}
            disabled={actionLoading === wo.workOrderId}
          >
            {actionLoading === wo.workOrderId ? (
              <span className="spinner-border spinner-border-sm me-1"></span>
            ) : (
              <i className="bi bi-check-circle me-1"></i>
            )}
            Complete
          </button>
        </>
      );
    }

    return null;
  };

  const filteredWorkOrders = workOrders;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">My Work Orders</h1>
          <p className="text-muted mb-0">Manage your assigned work orders</p>
        </div>
        <button className="btn btn-primary" onClick={fetchWorkOrders}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-6">
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by vehicle plate, customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-primary" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Status Filter */}
            <div className="col-md-6">
              <div className="btn-group w-100" role="group">
                {['All', 'Assigned', 'InProgress', 'Completed'].map(status => (
                  <button
                    key={status}
                    type="button"
                    className={`btn ${selectedStatus === status ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredWorkOrders.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-2">No work orders found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Work Order</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Services</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map(wo => {
                    const statusBadge = getStatusBadge(wo.status);
                    return (
                      <tr key={wo.workOrderId}>
                        <td>
                          <div>
                            <strong>#{wo.workOrderCode || wo.workOrderId}</strong>
                            {wo.appointmentId && (
                              <div className="small text-muted">
                                Appt: {wo.appointmentCode}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{wo.vehicleLicensePlate || 'N/A'}</div>
                            <small className="text-muted">
                              {wo.vehicleMake} {wo.vehicleModel} ({wo.vehicleYear})
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{wo.customerName || 'N/A'}</div>
                            {wo.customerPhone && (
                              <small className="text-muted">{wo.customerPhone}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            {wo.serviceNames?.split(',').slice(0, 2).join(', ') || 'N/A'}
                            {wo.serviceNames?.split(',').length > 2 && (
                              <div className="text-muted">+{wo.serviceNames.split(',').length - 2} more</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${statusBadge.bg}`}>
                            <i className={`bi bi-${statusBadge.icon} me-1`}></i>
                            {wo.status}
                          </span>
                        </td>
                        <td>
                          <small>{new Date(wo.createdDate).toLocaleDateString()}</small>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/staff/work-orders/${wo.workOrderId}`)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {getActionButtons(wo)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
