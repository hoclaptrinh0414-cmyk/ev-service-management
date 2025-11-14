// src/pages/staff/MaintenanceChecklist.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getWorkOrderDetail, 
  getWorkOrderChecklist,
  quickCompleteItem,
  uncompleteChecklistItem,
  completeWorkOrder
} from '../../services/staffService';

export default function MaintenanceChecklist() {
  const { workOrderId } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchData();
  }, [workOrderId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [woResponse, checklistResponse] = await Promise.all([
        getWorkOrderDetail(workOrderId),
        getWorkOrderChecklist(workOrderId)
      ]);

      if (woResponse.success) {
        setWorkOrder(woResponse.data);
      }

      if (checklistResponse.success) {
        setChecklist(checklistResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load checklist data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (item) => {
    try {
      setActionLoading(item.checklistItemId);
      
      if (item.isCompleted) {
        await uncompleteChecklistItem(item.checklistItemId);
      } else {
        await quickCompleteItem(item.checklistItemId, '');
      }
      
      await fetchData();
    } catch (error) {
      alert('Failed to update item: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteAllAndFinish = async () => {
    if (!window.confirm('Complete all items and finish this work order?')) return;

    try {
      setLoading(true);
      await completeWorkOrder(workOrderId);
      alert('Work order completed successfully!');
      navigate('/staff/work-orders');
    } catch (error) {
      alert('Failed to complete work order: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!checklist?.items || checklist.items.length === 0) return 0;
    const completed = checklist.items.filter(item => item.isCompleted).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  const getCategories = () => {
    if (!checklist?.items) return [];
    const categories = new Set(checklist.items.map(item => item.categoryName || 'Other'));
    return ['All', ...Array.from(categories)];
  };

  const getFilteredItems = () => {
    if (!checklist?.items) return [];
    if (selectedCategory === 'All') return checklist.items;
    return checklist.items.filter(item => (item.categoryName || 'Other') === selectedCategory);
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

  if (!workOrder || !checklist) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Failed to load checklist data
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/staff/work-orders')}>
          Back to Work Orders
        </button>
      </div>
    );
  }

  const progress = getProgressPercentage();
  const filteredItems = getFilteredItems();

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-link text-decoration-none p-0 mb-2"
            onClick={() => navigate('/staff/work-orders')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Work Orders
          </button>
          <h1 className="h3 fw-bold mb-1">Maintenance Checklist</h1>
          <p className="text-muted mb-0">
            Work Order #{workOrder.workOrderCode} - {workOrder.vehicleLicensePlate}
          </p>
        </div>
        <div className="text-end">
          <div className="h2 fw-bold mb-0 text-primary">{progress}%</div>
          <small className="text-muted">Complete</small>
        </div>
      </div>

      {/* Work Order Info Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <small className="text-muted d-block">Vehicle</small>
              <div className="fw-medium">{workOrder.vehicleMake} {workOrder.vehicleModel}</div>
              <small className="text-muted">{workOrder.vehicleLicensePlate}</small>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Customer</small>
              <div className="fw-medium">{workOrder.customerName}</div>
              <small className="text-muted">{workOrder.customerPhone}</small>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Status</small>
              <span className="badge bg-primary">{workOrder.status}</span>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Progress</small>
              <div className="progress" style={{ height: '24px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {progress}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-3">
        <div className="btn-group" role="group">
          {getCategories().map(category => (
            <button
              key={category}
              type="button"
              className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          {filteredItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-2">No checklist items in this category</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredItems.map((item, index) => (
                <div 
                  key={item.checklistItemId} 
                  className={`list-group-item border-0 ${item.isCompleted ? 'bg-light' : ''}`}
                >
                  <div className="d-flex align-items-start">
                    {/* Checkbox */}
                    <div className="form-check me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => handleToggleItem(item)}
                        disabled={actionLoading === item.checklistItemId}
                        id={`item-${item.checklistItemId}`}
                        style={{ width: '24px', height: '24px' }}
                      />
                    </div>

                    {/* Item Content */}
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <label 
                            htmlFor={`item-${item.checklistItemId}`}
                            className={`mb-1 ${item.isCompleted ? 'text-decoration-line-through text-muted' : 'fw-medium'}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {index + 1}. {item.itemName}
                          </label>
                          {item.description && (
                            <p className="small text-muted mb-1">{item.description}</p>
                          )}
                          <div className="d-flex gap-2 align-items-center">
                            <span className="badge bg-secondary">{item.categoryName || 'Other'}</span>
                            {!item.isRequired && (
                              <span className="badge bg-info">Optional</span>
                            )}
                            {item.estimatedMinutes && (
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                ~{item.estimatedMinutes} min
                              </small>
                            )}
                          </div>
                        </div>

                        {/* Action Loading Spinner */}
                        {actionLoading === item.checklistItemId && (
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        )}
                      </div>

                      {/* Completion Info */}
                      {item.isCompleted && item.completedDate && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <small className="text-success">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Completed on {new Date(item.completedDate).toLocaleString()}
                          </small>
                          {item.completedByName && (
                            <small className="text-muted ms-2">by {item.completedByName}</small>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between">
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/staff/work-orders')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button>
        <div>
          <button 
            className="btn btn-primary me-2"
            onClick={fetchData}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
          {progress === 100 && (
            <button 
              className="btn btn-success"
              onClick={handleCompleteAllAndFinish}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Completing...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Finish Work Order
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
