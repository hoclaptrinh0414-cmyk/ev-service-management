import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaCalendarAlt, FaWrench, FaRoad, FaTag, FaListAlt } from 'react-icons/fa';
import { maintenanceService } from '../services/maintenanceService';
import './VehicleHistoryModal.css';

// Helper to normalize date strings to YYYY-MM-DD for consistent comparison
const toYYYYMMDD = (date) => {
    const d = new Date(date);
    // Adjust for timezone offset to avoid off-by-one day errors
    const dUTC = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    const year = dUTC.getFullYear();
    const month = String(dUTC.getMonth() + 1).padStart(2, '0');
    const day = String(dUTC.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const VehicleHistoryModal = ({ vehicleId, show, onHide }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); // null or a Date object

  useEffect(() => {
    if (show && vehicleId) {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          setError('');
          setSelectedDate(null); // Reset selection on new modal open
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

  const historyDates = useMemo(() => {
    // A set of YYYY-MM-DD strings for quick lookup
    return new Set(history.map(item => toYYYYMMDD(item.serviceDate)));
  }, [history]);

  const displayHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
    if (!selectedDate) {
      return sorted; // Show all, sorted newest first
    }
    const selectedDayStr = toYYYYMMDD(selectedDate);
    return history.filter(item => toYYYYMMDD(item.serviceDate) === selectedDayStr);
  }, [history, selectedDate]);

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

  const handleDayClick = (date) => {
    setSelectedDate(date);
  };

  return (
    <Dialog.Root open={show} onOpenChange={onHide}>
      <Dialog.Portal>
        <Dialog.Overlay className="vh-backdrop" />
        <Dialog.Content className="vh-modal">
          <div className="vh-header">
            <Dialog.Title className="vh-title-text">
              Lịch sử Bảo dưỡng
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="vh-close" aria-label="Close">×</button>
            </Dialog.Close>
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
            {!loading && !error && (
              <>
                {/* Calendar Column */}
                <div className="vh-calendar-container">
                  <Calendar
                    onClickDay={handleDayClick}
                    value={selectedDate}
                    tileClassName={({ date, view }) => {
                      if (view === 'month' && historyDates.has(toYYYYMMDD(date))) {
                        return 'has-history';
                      }
                      return null;
                    }}
                    locale="vi-VN"
                  />
                  <button className="vh-show-all-btn" onClick={() => setSelectedDate(null)}>
                    <FaListAlt className="vh-icon" /> Xem tất cả
                  </button>
                </div>

                {/* Timeline Column */}
                <div className="vh-timeline-container">
                  {displayHistory.length > 0 ? (
                    <div className="vh-timeline">
                      {displayHistory.map((item) => (
                        <div key={item.historyId} className="vh-timeline-item">
                          <div className="vh-timeline-dot"></div>
                          <div className="vh-timeline-content">
                            <div className="vh-timeline-header">
                              <span className="vh-timeline-date">
                                <FaCalendarAlt className="vh-icon" />
                                {formatDate(item.serviceDate)}
                              </span>
                              <h6 className="vh-timeline-service">
                                <FaWrench className="vh-icon" />
                                {item.serviceType}
                              </h6>
                            </div>
                            <div className="vh-timeline-details">
                              <span className="vh-detail-item">
                                <FaRoad className="vh-icon" />
                                Odo: {item.mileageAtService ?? 'N/A'} km
                              </span>
                              <span className="vh-detail-item">
                                <FaTag className="vh-icon" />
                                Cost: {formatCurrency(item.totalCost)}
                              </span>
                            </div>
                            {item.notes && <p className="vh-timeline-notes">{item.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="vh-empty">
                        <div className="vh-empty-icon">🗓️</div>
                        <div>
                          {history.length === 0
                            ? 'Chưa có lịch sử bảo dưỡng cho xe này.'
                            : 'Không có dữ liệu cho ngày được chọn.'
                          }
                        </div>
                      </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default VehicleHistoryModal;
