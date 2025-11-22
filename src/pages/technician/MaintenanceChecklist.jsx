// src/pages/technician/MaintenanceChecklist.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import workOrderService from '../../services/workOrderService';
import { toast } from 'react-toastify';
import './MaintenanceChecklist.css';

export default function MaintenanceChecklist() {
  const { workOrderId } = useParams();
  const navigate = useNavigate();

  const [workOrder, setWorkOrder] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form States
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrderId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [woRes, checklistRes] = await Promise.all([
        workOrderService.getWorkOrderDetails(workOrderId),
        workOrderService.getChecklist(workOrderId)
      ]);

      setWorkOrder(woRes?.data || woRes);
      setChecklist(checklistRes?.data || checklistRes);

    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load checklist data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompleteModal = (item) => {
    setSelectedItem(item);
    setNotes('');
    setPhotoUrl('');
    setShowCompleteModal(true);
  };

  const handleOpenSkipModal = (item) => {
    setSelectedItem(item);
    setSkipReason('');
    setShowSkipModal(true);
  };

  const handleCompleteItem = async () => {
    if (!selectedItem) return;

    try {
      setActionLoading(selectedItem.itemId);
      const payload = {
        workOrderId: parseInt(workOrderId),
        itemId: selectedItem.itemId,
        notes: notes,
        photoUrls: photoUrl ? [photoUrl] : []
      };

      await workOrderService.completeChecklistItem(payload);
      toast.success('Item completed successfully');
      setShowCompleteModal(false);
      await fetchData();
    } catch (error) {
      console.error('Complete item error:', error);
      toast.error('Failed to complete item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkipItem = async () => {
    if (!selectedItem) return;
    if (!skipReason.trim()) {
      toast.warning('Please provide a reason for skipping');
      return;
    }

    try {
      setActionLoading(selectedItem.itemId);
      const payload = {
        workOrderId: parseInt(workOrderId),
        itemId: selectedItem.itemId,
        skipReason: skipReason
      };

      await workOrderService.skipChecklistItem(payload);
      toast.success('Item skipped successfully');
      setShowSkipModal(false);
      await fetchData();
    } catch (error) {
      console.error('Skip item error:', error);
      toast.error('Failed to skip item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleValidateAndFinish = async () => {
    try {
      setLoading(true);
      const validateRes = await workOrderService.validateChecklist(workOrderId);
      const validationData = validateRes?.data || validateRes;

      if (!validationData.isValid) {
        const missing = validationData.missingRequired?.map(i => i.title).join(', ');
        toast.error(`Cannot complete: Missing required items (${missing})`);
        return;
      }

      if (window.confirm('All items validated. Are you sure you want to complete this work order?')) {
        await workOrderService.completeWorkOrder(workOrderId);
        toast.success('Work order completed successfully!');
        navigate('/technician/my-work-orders');
      }

    } catch (error) {
      console.error('Finish work order error:', error);
      if (error.response?.data?.errors?.includes('PAYMENT_REQUIRED')) {
        toast.error('Payment required before completion.');
      } else if (error.response?.data?.errors?.includes('CHECKLIST_INCOMPLETE')) {
        toast.error('Checklist is incomplete.');
      } else {
        toast.error('Failed to complete work order');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    if (!checklist?.items) return [];
    const categories = new Set(checklist.items.map(item => item.category || 'Other'));
    return ['All', ...Array.from(categories)];
  };

  const getFilteredItems = () => {
    if (!checklist?.items) return [];
    if (selectedCategory === 'All') return checklist.items;
    return checklist.items.filter(item => (item.category || 'Other') === selectedCategory);
  };

  const getProgress = () => {
    if (!checklist?.items?.length) return 0;
    const completed = checklist.items.filter(i => i.isCompleted || i.skipped).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  if (loading && !checklist) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!workOrder || !checklist) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">Failed to load work order data.</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const progress = getProgress();
  const filteredItems = getFilteredItems();

  return (
    <div className="tech-page-container">
      {/* Header */}
      <header className="tech-header">
        <div className="container">
          <button className="tech-back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i> Back to List
          </button>
          <h1 className="tech-wo-title">Maintenance Checklist</h1>
          <div className="tech-wo-meta">
            <span>WO: <strong>{workOrder.workOrderCode}</strong></span>
            <span>•</span>
            <span>Vehicle: <strong>{workOrder.vehicleLicensePlate}</strong></span>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Progress Card */}
        <div className="tech-progress-card">
          <div className="tech-progress-label">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="tech-progress-bar-bg">
            <div
              className="tech-progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Filters */}
        <div className="tech-filters mb-4">
          {getCategories().map(cat => (
            <button
              key={cat}
              className={`tech-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Checklist Items */}
        <div className="tech-checklist-items">
          {filteredItems.map((item) => {
            const statusClass = item.isCompleted ? 'completed' : item.skipped ? 'skipped' : 'pending';

            return (
              <div key={item.itemId} className={`tech-item-card ${statusClass}`}>
                <div className="tech-item-header">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="tech-badge tech-badge-cat">{item.category || 'General'}</span>
                      {item.isRequired ? (
                        <span className="tech-badge tech-badge-req">Required</span>
                      ) : (
                        <span className="tech-badge tech-badge-opt">Optional</span>
                      )}
                    </div>
                    <h3 className="tech-item-title">{item.itemDescription || item.title}</h3>
                    {item.description && <p className="tech-item-desc">{item.description}</p>}
                  </div>
                  <div className="ms-3">
                    {item.isCompleted && <i className="bi bi-check-circle-fill text-success fs-4"></i>}
                    {item.skipped && <i className="bi bi-dash-circle-fill text-warning fs-4"></i>}
                    {!item.isCompleted && !item.skipped && <i className="bi bi-circle text-secondary fs-4"></i>}
                  </div>
                </div>

                {/* Status Details */}
                {(item.isCompleted || item.skipped) && (
                  <div className="tech-status-box">
                    <div className="tech-status-row">
                      <i className="bi bi-person-circle"></i>
                      <strong>{item.isCompleted ? (item.completedBy || 'Technician') : (item.skippedBy || 'Technician')}</strong>
                      <span className="text-muted">•</span>
                      <span>{new Date(item.isCompleted ? item.completedAt : item.skippedAt).toLocaleString()}</span>
                    </div>

                    {item.notes && (
                      <div className="tech-status-note mt-2">
                        <i className="bi bi-sticky me-2"></i>"{item.notes}"
                      </div>
                    )}

                    {item.skipReason && (
                      <div className="tech-status-note mt-2 text-danger">
                        <i className="bi bi-exclamation-circle me-2"></i>Skipped: {item.skipReason}
                      </div>
                    )}

                    {item.photoUrls && item.photoUrls.length > 0 && (
                      <div className="mt-2">
                        {item.photoUrls.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noreferrer" className="tech-photo-link">
                            <i className="bi bi-image"></i> View Photo
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {!item.isCompleted && !item.skipped && (
                  <div className="tech-item-actions">
                    <button
                      className="tech-btn tech-btn-complete"
                      onClick={() => handleOpenCompleteModal(item)}
                      disabled={actionLoading === item.itemId}
                    >
                      <i className="bi bi-check-lg"></i> Complete
                    </button>
                    {!item.isRequired && (
                      <button
                        className="tech-btn tech-btn-skip"
                        onClick={() => handleOpenSkipModal(item)}
                        disabled={actionLoading === item.itemId}
                      >
                        <i className="bi bi-skip-forward"></i> Skip
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-clipboard-x fs-1 d-block mb-3"></i>
              <p>No items found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="tech-footer">
        <div className="tech-footer-info">
          <span className="text-muted small">Total Items</span>
          <strong className="text-dark">{checklist.items.length} Tasks</strong>
        </div>
        <button
          className="tech-footer-btn"
          onClick={handleValidateAndFinish}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Finish Work Order'}
        </button>
      </footer>

      {/* Complete Modal */}
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)} centered contentClassName="border-0 rounded-4 overflow-hidden">
        <div className="tech-modal-header">
          <h5 className="tech-modal-title">Complete Task</h5>
          <button type="button" className="btn-close" onClick={() => setShowCompleteModal(false)}></button>
        </div>
        <div className="tech-modal-body">
          <p className="mb-4 text-muted">{selectedItem?.itemDescription || selectedItem?.title}</p>

          <div className="mb-3">
            <label className="tech-form-label">Notes (Optional)</label>
            <textarea
              className="tech-form-input"
              rows="3"
              placeholder="Enter inspection results or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="tech-form-label">Photo URL (Optional)</label>
            <input
              type="text"
              className="tech-form-input"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-light flex-grow-1 py-2 fw-medium" onClick={() => setShowCompleteModal(false)}>Cancel</button>
            <button
              className="btn btn-primary flex-grow-1 py-2 fw-medium"
              onClick={handleCompleteItem}
              disabled={!!actionLoading}
            >
              {actionLoading ? <Spinner size="sm" animation="border" /> : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Skip Modal */}
      <Modal show={showSkipModal} onHide={() => setShowSkipModal(false)} centered contentClassName="border-0 rounded-4 overflow-hidden">
        <div className="tech-modal-header">
          <h5 className="tech-modal-title text-warning">Skip Task</h5>
          <button type="button" className="btn-close" onClick={() => setShowSkipModal(false)}></button>
        </div>
        <div className="tech-modal-body">
          <p className="mb-4 text-muted">{selectedItem?.itemDescription || selectedItem?.title}</p>

          <Alert variant="warning" className="border-0 bg-warning-subtle text-warning-emphasis mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Skipping this item requires a valid reason.
          </Alert>

          <div className="mb-4">
            <label className="tech-form-label">Reason <span className="text-danger">*</span></label>
            <textarea
              className="tech-form-input"
              rows="3"
              placeholder="Why is this item being skipped?"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
            ></textarea>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-light flex-grow-1 py-2 fw-medium" onClick={() => setShowSkipModal(false)}>Cancel</button>
            <button
              className="btn btn-warning text-white flex-grow-1 py-2 fw-medium"
              onClick={handleSkipItem}
              disabled={!!actionLoading}
            >
              {actionLoading ? <Spinner size="sm" animation="border" /> : 'Skip Item'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
