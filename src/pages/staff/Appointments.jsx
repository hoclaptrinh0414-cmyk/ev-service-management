// src/pages/staff/Appointments.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as staffService from '../../services/staffService';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Appointments({ isDashboard = false }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  // Added Logic Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalCount, setTotalCount] = useState(0);

  // Added Logic Statistic
  const [statusSummary, setStatusSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const navigate = useNavigate();

  const statusFilters = [
    { value: 'all', label: 'All', color: '#86868b' },
    { value: '1', label: 'Pending', color: '#FF9500' },
    { value: '2', label: 'Confirmed', color: '#34C759' },
    { value: '4', label: 'In Progress', color: '#007AFF' },
    { value: '5', label: 'Completed', color: '#5856D6' },
    { value: '6', label: 'Cancelled', color: '#FF3B30' },
  ];

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus, page]);

  // Fetch status summary for dashboard
  useEffect(() => {
    if (isDashboard) {
      fetchStatusSummary();
    }
  }, [isDashboard]);

  const fetchStatusSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await staffService.getAppointmentStatistics();
      const data = res.data || res;
      // Convert object -> array để dễ map hiển thị
      const statsArray = Object.entries(data.byStatus || {}).map(
        ([status, count]) => {
          const percentage = data.total
            ? ((count / data.total) * 100).toFixed(1)
            : 0;
          return { status, count, percentage };
        },
      );

      setStatusSummary(statsArray);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to load status summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Edited logic pagination
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        Page: page,
        PageSize: pageSize,
        ...(selectedStatus !== 'all' && { StatusId: selectedStatus }),
      };

      const response = await staffService.getStaffAppointments(params);
      const data = response.data || response;
      const items = Array.isArray(data) ? data : data.items || [];

      setAppointments(items);
      setTotalCount(data.totalCount || 0); // tổng số bản ghi để tính số trang
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setPage(newPage);
  };

  const handleViewDetail = async (appointment) => {
    if (isDashboard) {
      navigate('/staff/appointments');
      return;
    }

    try {
      const detail = await staffService.getAppointmentDetail(
        appointment.appointmentId || appointment.AppointmentId,
      );
      setSelectedAppointment(detail.data || detail);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching appointment detail:', error);
      toast.error('Failed to load appointment details');
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      setConfirmingId(appointmentId);
      await staffService.confirmAppointment(appointmentId, {
        appointmentId,
        confirmationMethod: 'In-Person',
        notes: 'Confirmed by staff',
        sendConfirmationEmail: true,
        sendConfirmationSMS: false,
      });

      toast.success('Appointment confirmed successfully!');
      fetchAppointments();
      if (showModal) setShowModal(false);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error(
        error.response?.data?.message || 'Failed to confirm appointment',
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusBadge = (statusName) => {
    const status = statusFilters.find(
      (s) => s.label.toLowerCase() === (statusName || '').toLowerCase(),
    ) || { color: '#ccc', label: statusName || 'Unknown' };
    return {
      color: status.color,
      label: status.label,
    };
  };

  const countByStatus = (status) => {
    if (status === 'all') return appointments.length;
    return appointments.filter(
      (apt) => (apt.statusName || apt.StatusName) === status,
    ).length;
  };

  return (
    <div className='appointments-page'>
      {/* Header */}
      <div className='page-header'>
        <div>
          <h1>Appointments</h1>
          <p>Manage customer appointments and scheduling</p>
        </div>
      </div>

      {/* Filter Tabs */}
      {!isDashboard && (
        <div className='filter-tabs'>
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              className={`tab ${
                selectedStatus === filter.value ? 'active' : ''
              }`}
              onClick={() => setSelectedStatus(filter.value)}
            >
              {filter.label}
              <span className='count'>{countByStatus(filter.value)}</span>
            </button>
          ))}
        </div>
      )}

      {isDashboard && (
        <div className='status-summary'>
          <h3>Appointment Status Overview</h3>

          {summaryLoading ? (
            <div className='loading-summary'>Loading summary...</div>
          ) : (
            <div className='dashboard-summary'>
              {/* Thẻ tổng hợp theo trạng thái */}
              <div className='summary-cards colorful'>
                {[
                  { key: 'Pending', label: 'Pending', color: '#FFB020' },
                  { key: 'Confirmed', label: 'Confirmed', color: '#34C759' },
                  { key: 'InProgress', label: 'In Progress', color: '#007AFF' },
                  { key: 'Completed', label: 'Completed', color: '#5E5CE6' },
                  { key: 'Cancelled', label: 'Cancelled', color: '#FF3B30' },
                ].map((status) => {
                  const stat =
                    statusSummary.find(
                      (s) =>
                        s.status.toLowerCase() === status.key.toLowerCase(),
                    ) || {};
                  return (
                    <div
                      key={status.key}
                      className='summary-card fancy'
                      style={{
                        borderColor: `${status.color}33`,
                        background: `${status.color}10`,
                      }}
                    >
                      <div
                        className='summary-icon'
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <div className='summary-info'>
                        <span
                          className='summary-status'
                          style={{ color: status.color }}
                        >
                          {status.label}
                        </span>
                        <span className='summary-count'>
                          {stat.count || 0} appts
                        </span>
                        <span className='summary-percent'>
                          {stat.percentage ? `${stat.percentage}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Biểu đồ tròn */}
              <div className='chart-container'>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={statusSummary.filter((item) =>
                        [
                          'Pending',
                          'Confirmed',
                          'InProgress',
                          'Completed',
                          'Cancelled',
                        ].includes(item.status),
                      )}
                      dataKey='count'
                      nameKey='status'
                      outerRadius={110}
                      label
                    >
                      {statusSummary
                        .filter((item) =>
                          [
                            'Pending',
                            'Confirmed',
                            'InProgress',
                            'Completed',
                            'Cancelled',
                          ].includes(item.status),
                        )
                        .map((entry) => {
                          const colorMap = {
                            Pending: '#FFB020',
                            Confirmed: '#34C759',
                            InProgress: '#007AFF',
                            Completed: '#5E5CE6',
                            Cancelled: '#FF3B30',
                          };
                          return (
                            <Cell
                              key={entry.status}
                              fill={colorMap[entry.status] || '#ccc'}
                            />
                          );
                        })}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign='bottom' height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className='dashboard-actions'>
                <button
                  className='btn-view-all'
                  onClick={() => navigate('/staff/appointments')}
                >
                  View All Appointments
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appointments List */}
      {!isDashboard && (
        <div className='appointments-container'>
          {loading ? (
            <div className='loading-state'>
              <div className='spinner'></div>
              <p>Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className='empty-state'>
              <i className='bi bi-calendar-x'></i>
              <h3>No appointments found</h3>
              <p>
                There are no{' '}
                {selectedStatus !== 'all' ? selectedStatus.toLowerCase() : ''}{' '}
                appointments at the moment.
              </p>
            </div>
          ) : (
            <div className='appointments-grid'>
              {appointments.map((apt) => {
                const statusBadge = getStatusBadge(
                  apt.statusName || apt.StatusName,
                );
                const appointmentId = apt.appointmentId || apt.AppointmentId;

                return (
                  <div key={appointmentId} className='appointment-card'>
                    <div className='card-header'>
                      <div className='appointment-code'>
                        {apt.appointmentCode ||
                          apt.AppointmentCode ||
                          `#${appointmentId}`}
                      </div>
                      <div
                        className='status-badge'
                        style={{
                          backgroundColor: `${statusBadge.color}15`,
                          color: statusBadge.color,
                        }}
                      >
                        {statusBadge.label}
                      </div>
                    </div>

                    <div className='card-body'>
                      <div className='info-row'>
                        <i className='bi bi-person'></i>
                        <span>
                          {apt.customerName || apt.CustomerName || 'N/A'}
                        </span>
                      </div>
                      <div className='info-row'>
                        <i className='bi bi-car-front'></i>
                        <span>
                          {apt.licensePlate || apt.LicensePlate || 'N/A'}
                        </span>
                      </div>
                      <div className='info-row'>
                        <i className='bi bi-calendar'></i>
                        <span>
                          {apt.slotDate
                            ? new Date(apt.slotDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className='info-row'>
                        <i className='bi bi-clock'></i>
                        <span>{apt.slotTime || apt.SlotTime || 'N/A'}</span>
                      </div>
                    </div>

                    <div className='card-actions'>
                      <button
                        className='btn-secondary'
                        onClick={() => handleViewDetail(apt)}
                      >
                        View Details
                      </button>
                      {apt.statusName === 'Pending' && (
                        <button
                          className='btn-primary'
                          onClick={() => handleConfirm(appointmentId)}
                          disabled={confirmingId === appointmentId}
                        >
                          {confirmingId === appointmentId
                            ? 'Confirming...'
                            : 'Confirm'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {totalCount > pageSize && (
            <div className='pagination'>
              <button
                className='page-btn'
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <i className='bi bi-chevron-left'></i>
              </button>

              <div className='page-numbers'>
                {Array.from({ length: Math.ceil(totalCount / pageSize) })
                  .slice(
                    Math.max(0, page - 3),
                    Math.min(Math.ceil(totalCount / pageSize), page + 2),
                  )
                  .map((_, idx) => {
                    const pageNumber = Math.max(0, page - 3) + idx + 1;
                    return (
                      <button
                        key={pageNumber}
                        className={`page-number ${
                          pageNumber === page ? 'active' : ''
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
              </div>

              <button
                className='page-btn'
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= Math.ceil(totalCount / pageSize)}
              >
                <i className='bi bi-chevron-right'></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedAppointment && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Appointment Details</h2>
              <button className='btn-close' onClick={() => setShowModal(false)}>
                <i className='bi bi-x-lg'></i>
              </button>
            </div>

            <div className='modal-body'>
              <div className='detail-section'>
                <h3>Customer Information</h3>
                <div className='detail-grid'>
                  <div className='detail-item'>
                    <label>Name</label>
                    <span>
                      {selectedAppointment.customerName ||
                        selectedAppointment.CustomerName}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <label>Phone</label>
                    <span>
                      {selectedAppointment.customerPhone ||
                        selectedAppointment.CustomerPhone ||
                        'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <label>Email</label>
                    <span>
                      {selectedAppointment.customerEmail ||
                        selectedAppointment.CustomerEmail ||
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='detail-section'>
                <h3>Vehicle Information</h3>
                <div className='detail-grid'>
                  <div className='detail-item'>
                    <label>License Plate</label>
                    <span>
                      {selectedAppointment.licensePlate ||
                        selectedAppointment.LicensePlate}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <label>Model</label>
                    <span>
                      {selectedAppointment.vehicleModel ||
                        selectedAppointment.VehicleModel ||
                        'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <label>Year</label>
                    <span>
                      {selectedAppointment.vehicleYear ||
                        selectedAppointment.VehicleYear ||
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='detail-section'>
                <h3>Appointment Information</h3>
                <div className='detail-grid'>
                  <div className='detail-item'>
                    <label>Date</label>
                    <span>
                      {selectedAppointment.slotDate
                        ? new Date(
                            selectedAppointment.slotDate,
                          ).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <label>Time</label>
                    <span>
                      {selectedAppointment.slotTime ||
                        selectedAppointment.SlotTime}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <label>Status</label>
                    <span
                      className='status-text'
                      style={{
                        color: getStatusBadge(selectedAppointment.statusName)
                          .color,
                      }}
                    >
                      {getStatusBadge(selectedAppointment.statusName).label}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAppointment.customerNotes && (
                <div className='detail-section'>
                  <h3>Customer Notes</h3>
                  <p className='notes-text'>
                    {selectedAppointment.customerNotes}
                  </p>
                </div>
              )}
            </div>

            <div className='modal-footer'>
              <button
                className='btn-secondary'
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              {selectedAppointment.statusName === 'Pending' && (
                <button
                  className='btn-primary'
                  onClick={() =>
                    handleConfirm(
                      selectedAppointment.appointmentId ||
                        selectedAppointment.AppointmentId,
                    )
                  }
                  disabled={
                    confirmingId ===
                    (selectedAppointment.appointmentId ||
                      selectedAppointment.AppointmentId)
                  }
                >
                  {confirmingId ===
                  (selectedAppointment.appointmentId ||
                    selectedAppointment.AppointmentId)
                    ? 'Confirming...'
                    : 'Confirm Appointment'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .appointments-page {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .page-header p {
          font-size: 14px;
          color: #86868b;
          margin: 0;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .tab {
          padding: 10px 20px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .tab:hover {
          background: #f5f5f7;
        }

        .tab.active {
          background: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }

        .tab .count {
          background: rgba(134, 134, 139, 0.15);
          padding: 2px 8px;
          border-radius: 25px;
          font-size: 12px;
        }

        .tab.active .count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        /* Appointments Grid */
        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .appointment-card {
          background: white;
          border-radius: 25px;
          border: 1px solid #e5e5e5;
          padding: 20px;
          transition: all 0.2s;
        }

        .appointment-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f5f5f7;
        }

        .appointment-code {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 25px;
          font-size: 12px;
          font-weight: 600;
        }

        .card-body {
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #1a1a1a;
        }

        .info-row i {
          color: #86868b;
          font-size: 16px;
          width: 20px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 10px 16px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #1a1a1a;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #000;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f5f5f7;
          color: #1a1a1a;
        }

        .btn-secondary:hover {
          background: #e5e5e5;
        }

        /* Loading & Empty States */
        .loading-state, .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f5f5f7;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state i {
          font-size: 48px;
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

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 25px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .btn-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: #f5f5f7;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #e5e5e5;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: #86868b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 16px 0;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .detail-item label {
          display: block;
          font-size: 12px;
          color: #86868b;
          margin-bottom: 4px;
        }

        .detail-item span {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
        }

        .notes-text {
          padding: 16px;
          background: #f5f5f7;
          border-radius: 25px;
          font-size: 14px;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.6;
        }

        .modal-footer {
          padding: 24px;
          border-top: 1px solid #e5e5e5;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .appointments-page {
            padding: 20px;
          }

          .appointments-grid {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
          .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            margin-top: 32px;
          }

          .page-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 1px solid #e5e5e5;
            background: white;
            color: #1a1a1a;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .page-btn:hover:not(:disabled) {
            background: #f5f5f7;
            transform: translateY(-1px);
          }

          .page-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          .page-numbers {
            display: flex;
            gap: 6px;
          }

          .page-number {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: white;
            border: 1px solid #e5e5e5;
            font-size: 14px;
            color: #1a1a1a;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .page-number:hover {
            background: #f5f5f7;
          }

          .page-number.active {
            background: #1a1a1a;
            color: white;
            border-color: #1a1a1a;
            font-weight: 600;
          }
            .status-summary {
            margin-bottom: 28px;
          }

          .status-summary h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 12px;
          }

          .summary-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }

          .summary-card {
            display: flex;
            align-items: center;
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 16px;
            padding: 10px 16px;
            min-width: 160px;
            flex: 1 1 auto;
          }

          .summary-circle {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 12px;
          }

          .summary-info {
            display: flex;
            flex-direction: column;
          }

          .summary-status {
            font-size: 13px;
            font-weight: 600;
            color: #1a1a1a;
          }

          .summary-count {
            font-size: 12px;
            color: #86868b;
          }

          .summary-percent {
            font-size: 11px;
            color: #86868b;
          }

          .loading-summary,
          .empty-summary {
            font-size: 13px;
            color: #86868b;
          }
          .dashboard-summary {
            display: flex;
            flex-direction: column;
            gap: 32px;
          }
          .chart-container {
            width: 100%;
            height: 320px;
            margin-top: 8px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            padding: 16px;
          }
          .summary-cards.colorful {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
          }
          .summary-card.fancy {
            display: flex;
            align-items: center;
            border: 2px solid transparent;
            border-radius: 16px;
            padding: 16px;
            transition: all 0.25s ease;
            background: white;
          }
          .summary-card.fancy:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
          }
          .summary-icon {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            margin-right: 12px;
          }
            .dashboard-actions {
            text-align: center;
            margin-top: 12px;
          }

          .btn-view-all {
            background: #1a1a1a;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 28px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-view-all:hover {
            background: #000;
            transform: translateY(-1px);
          }
      `}</style>
    </div>
  );
}
