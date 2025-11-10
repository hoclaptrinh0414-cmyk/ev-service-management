// src/pages/staff/WorkOrders.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import staffService from "../../services/staffService";

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWO, setSelectedWO] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'detail'

  useEffect(() => {
    fetchWorkOrders();
    fetchTechnicians();
    fetchTemplates();
  }, []);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await staffService.searchWorkOrders({});
      const data = response.data || response;
      const items = Array.isArray(data) ? data : (data.items || []);
      setWorkOrders(items);
    } catch (err) {
      console.error("Failed to load work orders:", err);
      toast.error("Failed to load work orders list");
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await staffService.getTechnicians();
      const data = response.data || response;
      setTechnicians(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load technicians:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await staffService.getChecklistTemplates({ IsActive: true, PageSize: 50 });
      const data = response.data || response;
      const items = Array.isArray(data) ? data : (data.items || []);
      setTemplates(items);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  const viewWorkOrderDetail = async (woId) => {
    setDetailLoading(true);
    try {
      const detailResponse = await staffService.getWorkOrderDetail(woId);
      setSelectedWO(detailResponse.data || detailResponse);

      // Load checklist if exists
      try {
        const checklistResponse = await staffService.getWorkOrderChecklist(woId);
        const checklistData = checklistResponse.data || checklistResponse;
        setChecklist(Array.isArray(checklistData) ? checklistData : (checklistData.items || []));
      } catch (err) {
        // Checklist might not exist yet
        setChecklist([]);
      }

      setView('detail');
    } catch (err) {
      console.error("Failed to load work order detail:", err);
      toast.error("Failed to load work order detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedWO) return;

    try {
      const bestTech = await staffService.autoSelectTechnician({
        serviceCenterId: selectedWO.serviceCenterId,
        requiredSkills: selectedWO.requiredSkills || []
      });

      const techId = bestTech.data?.technicianId || bestTech.technicianId;

      if (techId) {
        await staffService.assignTechnician(selectedWO.workOrderId || selectedWO.id, techId);
        toast.success("Auto-assigned technician successfully!");
        viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
      }
    } catch (err) {
      console.error("Auto assign failed:", err);
      toast.error(err.response?.data?.message || "Auto-assign failed");
    }
  };

  const handleManualAssign = async (techId) => {
    if (!selectedWO) return;

    try {
      await staffService.assignTechnician(selectedWO.workOrderId || selectedWO.id, techId);
      toast.success("Assigned technician successfully!");
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error("Manual assign failed:", err);
      toast.error(err.response?.data?.message || "Assignment failed");
    }
  };

  const handleApplyTemplate = async (templateId) => {
    if (!selectedWO) return;

    try {
      await staffService.applyChecklistTemplate(selectedWO.workOrderId || selectedWO.id, {
        templateId: Number(templateId)
      });
      toast.success("Applied checklist template successfully!");
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error("Apply template failed:", err);
      toast.error(err.response?.data?.message || "Failed to apply template");
    }
  };

  const handleStartWorkOrder = async () => {
    if (!selectedWO) return;

    try {
      await staffService.startWorkOrder(selectedWO.workOrderId || selectedWO.id);
      toast.success("Work order started successfully!");
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error("Start work order failed:", err);
      toast.error(err.response?.data?.message || "Failed to start work order");
    }
  };

  const handleCompleteChecklistItem = async (itemId) => {
    try {
      await staffService.quickCompleteItem(itemId, "Completed by staff");
      toast.success("Item completed successfully!");
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error("Complete item failed:", err);
      toast.error(err.response?.data?.message || "Failed to complete item");
    }
  };

  const handleCompleteWorkOrder = async () => {
    if (!selectedWO) return;

    try {
      // Validate checklist first
      await staffService.validateChecklist(selectedWO.workOrderId || selectedWO.id);

      // Complete work order
      await staffService.completeWorkOrder(selectedWO.workOrderId || selectedWO.id);
      toast.success("Work order completed successfully!");

      setView('list');
      fetchWorkOrders();
    } catch (err) {
      console.error("Complete work order failed:", err);
      toast.error(err.response?.data?.message || "Failed to complete work order");
    }
  };

  const handleQualityCheck = async () => {
    if (!selectedWO) return;

    try {
      await staffService.performQualityCheck(selectedWO.workOrderId || selectedWO.id, {
        inspectedBy: "Staff",
        passed: true,
        notes: "Quality check passed"
      });
      toast.success("Quality check completed successfully!");
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error("Quality check failed:", err);
      toast.error(err.response?.data?.message || "Quality check failed");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="workorders-page">
      {view === 'list' ? (
        <>
          {/* Header */}
          <div className="page-header">
            <div className="header-left">
              <h1>Work Orders</h1>
              <p>Manage work orders and checklists</p>
            </div>
          </div>

          {/* Work Orders List */}
          <div className="workorders-section">
            <div className="section-title">
              <i className="bi bi-tools"></i>
              <h2>All Work Orders</h2>
              <span className="count-badge">{workOrders.length}</span>
            </div>

            {workOrders.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inbox"></i>
                <h3>No Work Orders</h3>
                <p>No work orders have been created yet</p>
              </div>
            ) : (
              <div className="workorders-grid">
                {workOrders.map((wo) => (
                  <div
                    key={wo.workOrderId || wo.id}
                    className="workorder-card"
                    onClick={() => viewWorkOrderDetail(wo.workOrderId || wo.id)}
                  >
                    <div className="card-header-wo">
                      <span className="wo-id">WO #{wo.workOrderId || wo.id}</span>
                      <span className={`status-badge ${(wo.status || '').toLowerCase()}`}>
                        {wo.status || 'Pending'}
                      </span>
                    </div>

                    <div className="card-body-wo">
                      <div className="info-item">
                        <i className="bi bi-person"></i>
                        <span>{wo.customerName || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-car-front"></i>
                        <span>{wo.licensePlate || wo.vehicle?.licensePlate || 'N/A'}</span>
                      </div>
                      {wo.assignedTechnician && (
                        <div className="info-item">
                          <i className="bi bi-wrench"></i>
                          <span>{wo.assignedTechnician}</span>
                        </div>
                      )}

                      <div className="progress-section">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${wo.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{wo.progress || 0}% completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Detail View */}
          <div className="page-header">
            <button className="btn-back" onClick={() => setView('list')}>
              <i className="bi bi-arrow-left"></i>
              Back to List
            </button>
          </div>

          {detailLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading details...</p>
            </div>
          ) : selectedWO ? (
            <div className="detail-container">
              {/* Work Order Info Card */}
              <div className="detail-card">
                <div className="card-header-detail">
                  <h2>Work Order #{selectedWO.workOrderId || selectedWO.id}</h2>
                  <span className={`status-badge ${(selectedWO.status || '').toLowerCase()}`}>
                    {selectedWO.status || 'Pending'}
                  </span>
                </div>

                <div className="card-body-detail">
                  <div className="detail-row">
                    <span className="label">Customer:</span>
                    <span className="value">{selectedWO.customerName || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Vehicle:</span>
                    <span className="value">{selectedWO.licensePlate || selectedWO.vehicle?.licensePlate || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Technician:</span>
                    <span className="value">{selectedWO.assignedTechnician || 'Not assigned'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Progress:</span>
                    <span className="value">{selectedWO.progress || 0}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  {!selectedWO.assignedTechnician && (
                    <>
                      <button className="btn-action primary" onClick={handleAutoAssign}>
                        <i className="bi bi-magic"></i>
                        Auto Assign
                      </button>
                      <select
                        className="select-technician"
                        onChange={(e) => handleManualAssign(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Manual Assign...</option>
                        {technicians.map(tech => (
                          <option key={tech.technicianId || tech.id} value={tech.technicianId || tech.id}>
                            {tech.fullName || tech.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {selectedWO.assignedTechnician && selectedWO.status === 'Pending' && (
                    <button className="btn-action success" onClick={handleStartWorkOrder}>
                      <i className="bi bi-play-circle"></i>
                      Start Work Order
                    </button>
                  )}

                  {selectedWO.status === 'InProgress' && selectedWO.progress === 100 && (
                    <>
                      <button className="btn-action success" onClick={handleCompleteWorkOrder}>
                        <i className="bi bi-check-circle"></i>
                        Complete Work Order
                      </button>
                      <button className="btn-action primary" onClick={handleQualityCheck}>
                        <i className="bi bi-shield-check"></i>
                        Quality Check
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Checklist Card */}
              {checklist.length > 0 ? (
                <div className="detail-card">
                  <div className="card-header-detail">
                    <h2>Checklist</h2>
                    <span className="count-badge">
                      {checklist.filter(item => item.status === 'Completed').length} / {checklist.length}
                    </span>
                  </div>

                  <div className="checklist-items">
                    {checklist.map((item, index) => (
                      <div key={item.checklistItemId || item.id || index} className="checklist-item">
                        <div className="item-content">
                          <div className="item-header">
                            <span className="item-title">{item.taskDescription || item.description || `Item ${index + 1}`}</span>
                            <span className={`item-status ${(item.status || '').toLowerCase()}`}>
                              {item.status || 'Pending'}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="item-notes">{item.notes}</p>
                          )}
                        </div>

                        {item.status !== 'Completed' && selectedWO.status === 'InProgress' && (
                          <button
                            className="btn-complete-item"
                            onClick={() => handleCompleteChecklistItem(item.checklistItemId || item.id)}
                          >
                            <i className="bi bi-check"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedWO.status === 'InProgress' && (
                <div className="detail-card">
                  <div className="card-header-detail">
                    <h2>Apply Checklist Template</h2>
                  </div>

                  <div className="card-body-detail">
                    <p className="no-checklist-msg">No checklist found. Apply a template to start:</p>
                    <select
                      className="select-template"
                      onChange={(e) => e.target.value && handleApplyTemplate(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Select Template...</option>
                      {templates.map(template => (
                        <option
                          key={template.templateId || template.id}
                          value={template.templateId || template.id}
                        >
                          {template.templateName || template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </>
      )}

      <style>{`
        .workorders-page {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .header-left h1 {
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .header-left p {
          font-size: 14px;
          color: #86868b;
          margin: 0;
        }

        .btn-back {
          padding: 10px 20px;
          background: #f5f5f7;
          color: #1a1a1a;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-back:hover {
          background: #e5e5e5;
        }

        /* Section */
        .workorders-section {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          padding: 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .section-title i {
          font-size: 24px;
          color: #1a1a1a;
        }

        .section-title h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .count-badge {
          background: #f5f5f7;
          color: #1a1a1a;
          padding: 4px 12px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          margin-left: auto;
        }

        /* Work Orders Grid */
        .workorders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .workorder-card {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }

        .workorder-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .card-header-wo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e5e5e5;
          background: white;
        }

        .wo-id {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 25px;
          font-size: 12px;
          font-weight: 500;
          background: #f5f5f7;
          color: #86868b;
        }

        .status-badge.pending {
          background: #FFF4E6;
          color: #E67E00;
        }

        .status-badge.inprogress {
          background: #E6F4FF;
          color: #0066CC;
        }

        .status-badge.completed {
          background: #E6F7ED;
          color: #00875A;
        }

        .card-body-wo {
          padding: 16px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #1a1a1a;
        }

        .info-item i {
          color: #86868b;
        }

        .progress-section {
          margin-top: 12px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e5e5e5;
          border-radius: 25px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .progress-fill {
          height: 100%;
          background: #1a1a1a;
          transition: width 0.3s;
        }

        .progress-text {
          font-size: 12px;
          color: #86868b;
        }

        /* Detail View */
        .detail-container {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .detail-card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          overflow: hidden;
        }

        .card-header-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e5e5;
        }

        .card-header-detail h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .card-body-detail {
          padding: 16px 24px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f7;
          gap: 24px;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row .label {
          font-size: 15px;
          font-weight: 600;
          color: #86868b;
          flex-shrink: 0;
        }

        .detail-row .value {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          text-align: right;
        }

        .card-actions {
          padding: 20px 24px;
          border-top: 1px solid #e5e5e5;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-action {
          padding: 10px 20px;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-action.primary {
          background: #1a1a1a;
          color: white;
        }

        .btn-action.primary:hover {
          background: #000;
        }

        .btn-action.success {
          background: #00875A;
          color: white;
        }

        .btn-action.success:hover {
          background: #006644;
        }

        .select-technician,
        .select-template {
          padding: 10px 16px;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          font-size: 14px;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .select-technician:focus,
        .select-template:focus {
          outline: none;
          border-color: #1a1a1a;
        }

        .no-checklist-msg {
          font-size: 14px;
          color: #86868b;
          margin-bottom: 16px;
        }

        /* Checklist */
        .checklist-items {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
        }

        .item-content {
          flex: 1;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .item-title {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
        }

        .item-status {
          padding: 2px 8px;
          border-radius: 25px;
          font-size: 11px;
          font-weight: 500;
          background: #f5f5f7;
          color: #86868b;
        }

        .item-status.completed {
          background: #E6F7ED;
          color: #00875A;
        }

        .item-notes {
          font-size: 13px;
          color: #86868b;
          margin: 4px 0 0 0;
        }

        .btn-complete-item {
          width: 36px;
          height: 36px;
          background: #00875A;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .btn-complete-item:hover {
          background: #006644;
          transform: scale(1.1);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state i {
          font-size: 64px;
          color: #d1d1d6;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          font-size: 14px;
          color: #86868b;
          margin: 0;
        }

        /* Loading */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e5e5;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          margin-top: 16px;
          color: #86868b;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .workorders-page {
            padding: 20px;
          }

          .card-actions {
            flex-direction: column;
          }

          .btn-action,
          .select-technician {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
