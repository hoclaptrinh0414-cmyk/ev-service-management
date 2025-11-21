import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../services/maintenanceService';
import './VehicleHistoryModal.css';

const VehicleHistoryModal = ({ vehicleId, show, onHide }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && vehicleId) {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          setError('');
          const res = await maintenanceService.getVehicleMaintenanceHistory(vehicleId);
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setHistory(list);
        } catch (err) {
          console.error('Error loading maintenance history:', err);
          setError(err?.response?.data?.message || 'Unable to load maintenance history');
          setHistory([]);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [show, vehicleId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!show) return null;

  return (
    <>
      <div className="vh-backdrop" onClick={onHide}></div>
      <div className="vh-modal">
        <div className="vh-header">
          <h5>Maintenance history</h5>
          <button className="vh-close" onClick={onHide} aria-label="Close">×</button>
        </div>
        <div className="vh-body">
          {loading && (
            <div className="vh-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {!loading && !error && history.length === 0 && (
            <div className="vh-empty">
              <div className="vh-empty-icon">🚗</div>
              <div>No maintenance history for this vehicle.</div>
            </div>
          )}
          {!loading && !error && history.length > 0 && (
            <div className="vh-timeline">
              {history.map((item) => (
                <div key={item.historyId} className="vh-item">
                  <div className="vh-date">{formatDate(item.serviceDate)}</div>
                  <div className="vh-title">{item.serviceType}</div>
                  <div className="vh-meta">
                    <span>Odo: {item.mileageAtService ?? 'N/A'} km</span>
                    <span>Cost: {formatCurrency(item.totalCost)}</span>
                  </div>
                  {item.notes && <div className="vh-notes">{item.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="vh-footer">
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default VehicleHistoryModal;
