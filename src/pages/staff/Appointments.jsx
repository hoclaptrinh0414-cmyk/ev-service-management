// src/pages/staff/Appointments.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import CheckIn from './CheckIn';
import CreateAppointmentModal from './CreateAppointmentModal';
import CancelUpdateAppointmentModal from './CancelUpdateAppointmentModal';

const getLocalTodayISO = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

const normalizeISODate = (value) => {
  if (!value) return '';

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const str = String(value).trim();
  if (!str) return '';

  const splitParts = str.split(/[T\s]/);
  const firstPart = splitParts[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(firstPart)) {
    return firstPart;
  }

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameISODate = (value, targetISO) => {
  if (!targetISO) return false;
  const normalizedValue = normalizeISODate(value);
  return normalizedValue === normalizeISODate(targetISO);
};

const extractAppointmentDateISO = (apt) => {
  const candidate =
    apt.slotDate ||
    apt.SlotDate ||
    apt.slotDateOnly ||
    apt.SlotDateOnly ||
    apt.slotDateTime ||
    apt.SlotDateTime ||
    apt.appointmentDate ||
    apt.AppointmentDate ||
    apt.date ||
    apt.Date;

  return normalizeISODate(candidate);
};

const formatAppointmentDate = (apt) => {
  const iso = extractAppointmentDateISO(apt);
  if (!iso) return 'N/A';
  const displayDate = new Date(`${iso}T00:00:00`);
  return displayDate.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};

export default function Appointments({ isDashboard = false }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    appointment: null,
  });
  const [confirmForm, setConfirmForm] = useState({
    method: 'Phone Call',
    notes: '',
    sendEmail: true,
    sendSMS: false,
  });
  const [checkInPrompt, setCheckInPrompt] = useState({
    open: false,
    appointment: null,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cancelUpdateModal, setCancelUpdateModal] = useState({
    show: false,
    appointment: null,
    mode: 'cancel', // 'cancel' or 'update'
  });

  // Added Logic Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalCount, setTotalCount] = useState(0);

  // Added Logic Statistic
  const [statusSummary, setStatusSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => getLocalTodayISO());

  const previousDateRef = useRef(selectedDate);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [serviceCenterId, setServiceCenterId] = useState(null);
  const [serviceCenterLoading, setServiceCenterLoading] = useState(true);
  const [serviceCenterError, setServiceCenterError] = useState('');

  const preferredCenterId = useMemo(() => {
    if (!user) return process.env.REACT_APP_DEFAULT_SERVICE_CENTER_ID || null;
    return (
      user.serviceCenterId ||
      user.ServiceCenterId ||
      user.serviceCenter?.serviceCenterId ||
      user.serviceCenter?.id ||
      user.staffProfile?.serviceCenterId ||
      user.StaffProfile?.serviceCenterId ||
      process.env.REACT_APP_DEFAULT_SERVICE_CENTER_ID ||
      null
    );
  }, [user]);

  const navigate = useNavigate();

  const statusFilters = [
    { value: 'all', label: 'All', color: '#86868b', summaryKey: 'all' },
    { value: '1', label: 'Pending', color: '#FF9500', summaryKey: 'Pending' },
    { value: '2', label: 'Confirmed', color: '#34C759', summaryKey: 'Confirmed' },
    { value: 'checkin', label: 'Check-in', color: '#0EA5E9', summaryKey: 'Check-in' },
    { value: '4', label: 'In Progress', color: '#007AFF', summaryKey: 'InProgress' },
    { value: '5', label: 'Completed', color: '#5856D6', summaryKey: 'Completed' },
    { value: '6', label: 'Cancelled', color: '#FF3B30', summaryKey: 'Cancelled' },
  ];

  useEffect(() => {
    if (previousDateRef.current !== selectedDate) {
      previousDateRef.current = selectedDate;
      setPage(1);
    }
  }, [selectedDate]);

  useEffect(() => {
    const loadServiceCenters = async () => {
      setServiceCenterLoading(true);
      setServiceCenterError('');
      try {
        const response = await staffService.getActiveServiceCenters();
        console.log('Service Centers Response:', response);

        // Handle multiple response structures
        const payload = response?.data?.data || response?.data || response;
        const centers = Array.isArray(payload)
          ? payload
          : payload?.items || payload?.data || [];

        console.log('Parsed Centers:', centers);
        console.log('First Center Object:', centers[0]);
        console.log('All keys of first center:', centers[0] ? Object.keys(centers[0]) : 'No centers');
        setServiceCenters(centers);

        const firstCenter = centers[0];
        const defaultId =
          preferredCenterId ||
          firstCenter?.centerId ||  // ✅ CORRECT FIELD NAME
          firstCenter?.serviceCenterId ||
          firstCenter?.ServiceCenterId ||
          firstCenter?.id ||
          null;

        console.log('✅ Selected Service Center ID:', defaultId);
        console.log('Preferred Center ID:', preferredCenterId);
        setServiceCenterId(defaultId);
      } catch (error) {
        console.error('Failed to load service centers:', error);
        setServiceCenters([]);
        setServiceCenterError(
          error.response?.data?.message ||
            'Không thể tải danh sách trung tâm dịch vụ',
        );
        setServiceCenterId(preferredCenterId || null);
      } finally {
        setServiceCenterLoading(false);
      }
    };

    loadServiceCenters();
  }, [preferredCenterId]);

  // Fetch status summary for all contexts (used for counts + dashboard)
  useEffect(() => {
    fetchStatusSummary();
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
      setTotalAppointmentsCount(data.total || 0);
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
        ...(serviceCenterId && { ServiceCenterId: serviceCenterId }),
        ...(selectedDate && { SlotDate: selectedDate }),
      };

      console.group('🔍 Fetch Appointments Debug');
      console.log('📋 Params:', params);
      console.log('📅 Selected Date:', selectedDate);
      console.log('🏢 Service Center ID:', serviceCenterId);
      console.log('📄 Current Page:', page);
      console.log('📊 Page Size:', pageSize);

      let response;
      let data;
      let items = [];

      // IMPORTANT: Backend's /appointment-management does NOT filter by SlotDate
      // Must use /appointment-management/by-service-center/{id}/date/{date} for date filtering
      if (selectedDate) {
        if (!serviceCenterId) {
          console.warn('⚠️ Date selected but no service center! Cannot filter by date without service center.');
          toast.warning('Vui lòng chọn trung tâm để xem lịch hẹn theo ngày');
          setAppointments([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        // ⚠️ WORKAROUND: Backend timezone bug - add 1 day offset
        const dateObj = new Date(selectedDate + 'T00:00:00');
        dateObj.setDate(dateObj.getDate() + 1);
        const adjustedDate = dateObj.toISOString().split('T')[0];

        console.log('🎯 API: getAppointmentsByDate (date filtering requires service center)');
        console.log('⚠️ Timezone workaround: sending', adjustedDate, 'to get', selectedDate);

        response = await staffService.getAppointmentsByDate(
          serviceCenterId,
          adjustedDate,
        );
        data = response?.data?.data || response?.data || response;
        items = Array.isArray(data) ? data : data.items || data.data || [];
      } else {
        // No date filter - use general API
        console.log('🎯 API: getStaffAppointments (general - all appointments)');
        response = await staffService.getStaffAppointments(params);
        data = response?.data?.data || response?.data || response;
        items = Array.isArray(data) ? data : data.items || data.data || [];
      }

      console.log('📦 Raw Response:', response);
      console.log('📦 Parsed Data:', data);
      console.log('📦 Parsed Items Count:', items.length);
      console.log('📦 First Item:', items[0]);

      const serverTotal =
        data?.totalCount ||
        data?.TotalCount ||
        data?.total ||
        data?.Total ||
        items.length;

      const totalPages = Math.ceil(serverTotal / pageSize);

      console.log('📊 Server Total Count:', serverTotal);
      console.log('📊 Total Pages:', totalPages);
      console.log('📊 Pagination Info:', data?.pagination || 'No pagination in response');
      console.groupEnd();

      const totalForCount =
        selectedDate && Array.isArray(items) ? items.length : serverTotal;

      setAppointments(items);
      setTotalCount(totalForCount);

      if (!totalAppointmentsCount) {
        setTotalAppointmentsCount(serverTotal);
      }
    } catch (error) {
      console.group('❌ Fetch Appointments Error');
      console.error('Error:', error);
      console.error('Error Response:', error.response);
      console.error('Error Data:', error.response?.data);
      console.groupEnd();

      toast.error(error.response?.data?.message || 'Failed to load appointments');
      setAppointments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStatus === 'checkin') {
      setLoading(false);
      return;
    }
    fetchAppointments();
  }, [selectedStatus, selectedDate, page, serviceCenterId]);

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setPage(newPage);
  };

  const todayISO = useMemo(() => getLocalTodayISO(), []);

  const handleDateChange = (event) => {
    const { value } = event.target;
    setSelectedDate(value);
  };

  const handleTodayClick = () => {
    setSelectedDate(todayISO);
  };

  const handleClearDate = () => {
    setSelectedDate('');
  };

  const openConfirmModal = (appointment) => {
    setConfirmForm({
      method: 'Phone Call',
      notes: '',
      sendEmail: true,
      sendSMS: false,
    });
    setConfirmModal({
      open: true,
      appointment,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, appointment: null });
  };

  const openCheckInPrompt = (appointment) => {
    setCheckInPrompt({ open: true, appointment });
  };

  const closeCheckInPrompt = () => {
    setCheckInPrompt({ open: false, appointment: null });
  };

  const handleServiceCenterChange = (event) => {
    const value = event.target.value;
    setServiceCenterId(value ? Number(value) : null);
    setPage(1);
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

  const handleConfirm = async (appointmentId, formValues = {}) => {
    try {
      setConfirmingId(appointmentId);
      await staffService.confirmAppointment(appointmentId, {
        appointmentId,
        confirmationMethod: formValues.method || 'In-Person',
        notes: formValues.notes || 'Confirmed by staff via portal',
        sendConfirmationEmail: !!formValues.sendEmail,
        sendConfirmationSMS: !!formValues.sendSMS,
      });

      toast.success('Appointment confirmed successfully!');
      fetchAppointments();
      setShowModal(false);
      closeConfirmModal();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error(
        error.response?.data?.message || 'Failed to confirm appointment',
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const submitConfirmModal = () => {
    if (!confirmModal.appointment) return;
    const appointmentId =
      confirmModal.appointment.appointmentId ||
      confirmModal.appointment.AppointmentId;
    handleConfirm(appointmentId, confirmForm);
  };

  const handleCheckIn = async (appointment) => {
    if (!appointment) return;
    const appointmentId = appointment.appointmentId || appointment.AppointmentId;
    try {
      setCheckingInId(appointmentId);
      await staffService.checkInAppointment(appointmentId);
      toast.success('Check-in successful! WorkOrder created.');

      const contextPayload = {
        appointmentId,
        appointmentCode:
          appointment.appointmentCode ||
          appointment.AppointmentCode ||
          `#${appointmentId}`,
        customerId: appointment.customerId || appointment.CustomerId || null,
        customerName: appointment.customerName || appointment.CustomerName || '',
        vehicleId: appointment.vehicleId || appointment.VehicleId || null,
        licensePlate:
          appointment.licensePlate || appointment.LicensePlate || 'N/A',
        slotDate:
          appointment.slotDate ||
          appointment.SlotDate ||
          selectedDate ||
          null,
        slotStartTime:
          appointment.slotStartTime || appointment.SlotStartTime || null,
        slotEndTime: appointment.slotEndTime || appointment.SlotEndTime || null,
        estimatedDuration:
          appointment.estimatedDuration ||
          appointment.EstimatedDuration ||
          appointment.service?.estimatedDuration ||
          null,
        serviceCenterId:
          appointment.serviceCenterId ||
          appointment.ServiceCenterId ||
          serviceCenterId ||
          preferredCenterId ||
          null,
      };

      try {
        sessionStorage.setItem(
          'staff:lastCheckInContext',
          JSON.stringify(contextPayload),
        );
      } catch (storageError) {
        console.warn('Unable to store check-in context:', storageError);
      }

      closeCheckInPrompt();
      fetchAppointments();
      navigate('/staff/work-orders', { state: { fromCheckIn: true } });
    } catch (error) {
      console.error('Error checking in appointment:', error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to check-in appointment',
      );
    } finally {
      setCheckingInId(null);
    }
  };

  const confirmCheckInPrompt = () => {
    if (!checkInPrompt.appointment) return;
    handleCheckIn(checkInPrompt.appointment);
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

  const normaliseKey = (value = '') =>
    value.toString().replace(/\s+/g, '').toLowerCase();

  const isPendingAppointment = (appointment = {}) => {
    const statusId = String(appointment.statusId || appointment.StatusId || '');
    const statusName = normaliseKey(
      appointment.statusName || appointment.StatusName || '',
    );
    return statusId === '1' || statusName === 'pending';
  };

  const isConfirmedAppointment = (appointment = {}) => {
    const statusId = String(appointment.statusId || appointment.StatusId || '');
    const statusName = normaliseKey(
      appointment.statusName || appointment.StatusName || '',
    );
    return statusId === '2' || statusName === 'confirmed';
  };

  const matchesStatusFilter = (appointment, statusValue) => {
    if (!statusValue || statusValue === 'all') return true;
    if (statusValue === 'checkin') {
      return isConfirmedAppointment(appointment);
    }

    const statusId = String(
      appointment.statusId || appointment.StatusId || '',
    );
    if (statusId === statusValue) return true;

    const targetFilter = statusFilters.find(
      (filter) => filter.value === statusValue,
    );
    const targetKey = normaliseKey(
      targetFilter?.summaryKey || targetFilter?.label || '',
    );
    const statusName = normaliseKey(
      appointment.statusName || appointment.StatusName || '',
    );
    return targetKey ? statusName === targetKey : false;
  };

  const visibleAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    if (selectedStatus === 'all') return appointments;
    if (selectedStatus === 'checkin') {
      return appointments.filter((apt) => isConfirmedAppointment(apt));
    }
    return appointments.filter((apt) =>
      matchesStatusFilter(apt, selectedStatus),
    );
  }, [appointments, selectedStatus]);

  const countByStatus = (statusValue) => {
    if (statusValue === 'checkin') {
      return checkInCount;
    }

    const useLocalCounts = Boolean(selectedDate);
    if (useLocalCounts) {
      if (statusValue === 'all') {
        return appointments.length;
      }
      return appointments.filter((apt) =>
        matchesStatusFilter(apt, statusValue),
      ).length;
    }

    if (statusValue === 'all') {
      return totalAppointmentsCount || totalCount || appointments.length;
    }

    const filter = statusFilters.find((f) => f.value === statusValue);
    if (!filter) return 0;

    const summaryMatch = statusSummary.find(
      (item) =>
        normaliseKey(item.status) ===
        normaliseKey(filter.summaryKey || filter.label),
    );
    if (summaryMatch) {
      return summaryMatch.count || 0;
    }

    return appointments.filter((apt) =>
      matchesStatusFilter(apt, statusValue),
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

      {!isDashboard && (
        <div className='service-center-filter' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label>Trung tâm:</label>
            {serviceCenterLoading ? (
              <span className='service-center-status'>Đang tải...</span>
            ) : serviceCenters.length > 0 ? (
              <select
                value={serviceCenterId ?? ''}
                onChange={handleServiceCenterChange}
              >
                {serviceCenters.map((center) => {
                  const centerId = center.centerId || center.serviceCenterId || center.id;
                  const centerName = center.centerName || center.name || center.serviceCenterName || center.centerCode || `Center ${centerId}`;
                  return (
                    <option key={centerId} value={centerId}>
                      {centerName}
                    </option>
                  );
                })}
              </select>
            ) : (
              <span className='service-center-status empty'>
                Không có trung tâm hoạt động
              </span>
            )}
            {serviceCenterError && (
              <p className='service-center-error'>{serviceCenterError}</p>
            )}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '25px',
              border: 'none',
              background: '#000',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              width: 'auto'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#333'}
            onMouseOut={(e) => e.currentTarget.style.background = '#000'}
          >
            <i className="bi bi-plus-lg"></i>
            Tạo lịch hẹn
          </button>
        </div>
      )}

      {!isDashboard && (
        <div className='date-filter'>
          <div className='date-filter-left'>
            <label htmlFor='appointments-date-filter'>Chọn ngày:</label>
            <input
              id='appointments-date-filter'
              type='date'
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          <div className='date-filter-actions'>
            <button
              type='button'
              className={`btn-date-filter ${
                selectedDate === todayISO ? 'active' : ''
              }`}
              onClick={handleTodayClick}
            >
              Hôm nay
            </button>
            <button
              type='button'
              className={`btn-date-filter secondary ${
                !selectedDate ? 'active' : ''
              }`}
              onClick={handleClearDate}
            >
              Hiển thị tất cả
            </button>
          </div>
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
                  {statusFilters
                    .filter((filter) => filter.value !== 'all')
                    .map((filter) => {
                      const stat =
                        statusSummary.find(
                          (s) =>
                            normaliseKey(s.status) ===
                            normaliseKey(filter.summaryKey || filter.label),
                        ) || {};
                      return (
                        <div
                          key={filter.value}
                          className='summary-card fancy'
                          style={{
                            borderColor: `${filter.color}33`,
                            background: `${filter.color}10`,
                          }}
                        >
                          <div
                            className='summary-icon'
                            style={{ backgroundColor: filter.color }}
                          ></div>
                          <div className='summary-info'>
                            <span
                              className='summary-status'
                              style={{ color: filter.color }}
                            >
                              {filter.label}
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
        <div
          className={`checkin-tab-container ${
            selectedStatus === 'checkin' ? 'visible' : 'hidden'
          }`}
        >
          <CheckIn
            embedded
            serviceCenterOverride={serviceCenterId ?? preferredCenterId ?? null}
            dateOverride={selectedDate || undefined}
            onAppointmentCountChange={setCheckInCount}
          />
        </div>
      )}

      {!isDashboard && selectedStatus !== 'checkin' && (
        <div className='appointments-container'>
          {loading ? (
            <div className='loading-state'>
              <div className='spinner'></div>
              <p>Loading appointments...</p>
            </div>
          ) : visibleAppointments.length === 0 ? (
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
              {visibleAppointments.map((apt) => {
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
                          {formatAppointmentDate(apt)}
                        </span>
                      </div>
                      <div className='info-row'>
                        <i className='bi bi-clock'></i>
                        <span>
                          {apt.slotStartTime || apt.SlotStartTime
                            ? `${apt.slotStartTime || apt.SlotStartTime} - ${
                                apt.slotEndTime || apt.SlotEndTime || ''
                              }`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className='card-actions'>
                      <button
                        className='btn-secondary'
                        onClick={() => handleViewDetail(apt)}
                      >
                        View Details
                      </button>
                      {isPendingAppointment(apt) && (
                        <button
                          className='btn-primary'
                          onClick={() => openConfirmModal(apt)}
                          disabled={confirmingId === appointmentId}
                        >
                          {confirmingId === appointmentId
                            ? 'Confirming...'
                            : 'Confirm'}
                        </button>
                      )}
                      {isConfirmedAppointment(apt) && (
                        <button
                          className='btn-outline'
                          onClick={() => openCheckInPrompt(apt)}
                          disabled={checkingInId === appointmentId}
                        >
                          {checkingInId === appointmentId
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
          {!selectedDate && totalCount > pageSize && (
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
                        selectedAppointment.LicensePlate ||
                        'N/A'}
                    </span>
                  </div>

                  <div className='detail-item'>
                    <label>Model</label>
                    <span>
                      {selectedAppointment.vehicleName ||
                        selectedAppointment.VehicleName ||
                        'N/A'}
                    </span>
                  </div>

                  <div className='detail-item'>
                    <label>Year</label>
                    <span>
                      {selectedAppointment.vehicleName
                        ? selectedAppointment.vehicleName.split(' ').pop()
                        : 'N/A'}
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
                      {selectedAppointment.slotStartTime ||
                      selectedAppointment.SlotStartTime
                        ? `${
                            selectedAppointment.slotStartTime ||
                            selectedAppointment.SlotStartTime
                          } - ${
                            selectedAppointment.slotEndTime ||
                            selectedAppointment.SlotEndTime
                          }`
                        : 'N/A'}
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
              {isPendingAppointment(selectedAppointment) && (
                <button
                  className='btn-primary'
                  onClick={() => openConfirmModal(selectedAppointment)}
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
              {isConfirmedAppointment(selectedAppointment) && (
                <button
                  className='btn-outline'
                  onClick={() => openCheckInPrompt(selectedAppointment)}
                  disabled={
                    checkingInId ===
                    (selectedAppointment.appointmentId ||
                      selectedAppointment.AppointmentId)
                  }
                >
                  {checkingInId ===
                  (selectedAppointment.appointmentId ||
                    selectedAppointment.AppointmentId)
                    ? 'Checking in...'
                    : 'Check-in'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && confirmModal.appointment && (
        <div className='modal-overlay' onClick={closeConfirmModal}>
          <div
            className='modal-content confirm-modal'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h2>Confirm Appointment</h2>
              <button className='btn-close' onClick={closeConfirmModal}>
                <i className='bi bi-x-lg'></i>
              </button>
            </div>
            <div className='modal-body'>
              <p className='confirm-description'>
                Xác nhận lịch hẹn{' '}
                <strong>
                  {confirmModal.appointment.appointmentCode ||
                    confirmModal.appointment.AppointmentCode ||
                    `#${confirmModal.appointment.appointmentId || ''}`}
                </strong>{' '}
                cho khách{' '}
                <strong>
                  {confirmModal.appointment.customerName ||
                    confirmModal.appointment.CustomerName ||
                    'N/A'}
                </strong>{' '}
                ({confirmModal.appointment.licensePlate ||
                  confirmModal.appointment.LicensePlate ||
                  'N/A'})
                ?
              </p>
              <div className='confirm-form'>
                <div className='form-group'>
                  <label>Phương thức xác nhận</label>
                  <select
                    value={confirmForm.method}
                    onChange={(e) =>
                      setConfirmForm((prev) => ({
                        ...prev,
                        method: e.target.value,
                      }))
                    }
                  >
                    <option value='Phone Call'>Phone Call</option>
                    <option value='In-Person'>In Person</option>
                    <option value='Email'>Email</option>
                    <option value='SMS'>SMS</option>
                  </select>
                </div>
                <div className='form-group'>
                  <label>Ghi chú thêm</label>
                  <textarea
                    rows={3}
                    value={confirmForm.notes}
                    onChange={(e) =>
                      setConfirmForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder='Thông tin cần lưu ý (tuỳ chọn)'
                  ></textarea>
                </div>
                <div className='form-checkboxes'>
                  <label>
                    <input
                      type='checkbox'
                      checked={confirmForm.sendEmail}
                      onChange={(e) =>
                        setConfirmForm((prev) => ({
                          ...prev,
                          sendEmail: e.target.checked,
                        }))
                      }
                    />
                    Gửi email xác nhận
                  </label>
                  <label>
                    <input
                      type='checkbox'
                      checked={confirmForm.sendSMS}
                      onChange={(e) =>
                        setConfirmForm((prev) => ({
                          ...prev,
                          sendSMS: e.target.checked,
                        }))
                      }
                    />
                    Gửi SMS xác nhận
                  </label>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <button className='btn-secondary' onClick={closeConfirmModal}>
                Huỷ
              </button>
              <button
                className='btn-primary'
                onClick={submitConfirmModal}
                disabled={
                  confirmingId ===
                  (confirmModal.appointment.appointmentId ||
                    confirmModal.appointment.AppointmentId)
                }
              >
                {confirmingId ===
                (confirmModal.appointment.appointmentId ||
                  confirmModal.appointment.AppointmentId)
                  ? 'Đang xác nhận...'
                  : 'Xác nhận lịch hẹn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {checkInPrompt.open && checkInPrompt.appointment && (
        <div className='modal-overlay' onClick={closeCheckInPrompt}>
          <div
            className='modal-content confirm-modal'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h2>Check-in khách hàng</h2>
              <button className='btn-close' onClick={closeCheckInPrompt}>
                <i className='bi bi-x-lg'></i>
              </button>
            </div>
            <div className='modal-body'>
              <p className='confirm-description'>
                Xác nhận khách{' '}
                <strong>
                  {checkInPrompt.appointment.customerName ||
                    checkInPrompt.appointment.CustomerName ||
                    'N/A'}
                </strong>{' '}
                với biển số{' '}
                <strong>
                  {checkInPrompt.appointment.licensePlate ||
                    checkInPrompt.appointment.LicensePlate ||
                    'N/A'}
                </strong>{' '}
                đã có mặt tại trung tâm và bắt đầu dịch vụ?
              </p>
              <div className='checkin-summary'>
                <div>
                  <span className='summary-label'>Lịch hẹn</span>
                  <span className='summary-value'>
                    {formatAppointmentDate(checkInPrompt.appointment)}
                  </span>
                </div>
                <div>
                  <span className='summary-label'>Khung giờ</span>
                  <span className='summary-value'>
                    {checkInPrompt.appointment.slotStartTime ||
                    checkInPrompt.appointment.SlotStartTime
                      ? `${
                          checkInPrompt.appointment.slotStartTime ||
                          checkInPrompt.appointment.SlotStartTime
                        } - ${
                          checkInPrompt.appointment.slotEndTime ||
                          checkInPrompt.appointment.SlotEndTime ||
                          ''
                        }`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <button className='btn-secondary' onClick={closeCheckInPrompt}>
                Huỷ
              </button>
              <button
                className='btn-primary'
                onClick={confirmCheckInPrompt}
                disabled={
                  checkingInId ===
                  (checkInPrompt.appointment.appointmentId ||
                    checkInPrompt.appointment.AppointmentId)
                }
              >
                {checkingInId ===
                (checkInPrompt.appointment.appointmentId ||
                  checkInPrompt.appointment.AppointmentId)
                  ? 'Đang check-in...'
                  : 'Xác nhận Check-in'}
              </button>
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

        .service-center-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 20px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .service-center-filter label {
          font-weight: 600;
          color: #1a1a1a;
        }

        .service-center-filter select {
          min-width: 220px;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          color: #1a1a1a;
        }

        .service-center-status {
          font-size: 14px;
          color: #6b7280;
        }

        .service-center-status.empty {
          color: #ef4444;
        }

        .service-center-error {
          width: 100%;
          font-size: 13px;
          color: #ef4444;
          margin: 0;
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

        .date-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 20px;
          margin-bottom: 24px;
        }

        .date-filter-left {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #1a1a1a;
        }

        .date-filter-left input {
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 14px;
          color: #1a1a1a;
        }

        .date-filter-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-date-filter {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #d1d5db;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          background: #fff;
          color: #1a1a1a;
        }

        .btn-date-filter.secondary {
          background: #f5f5f7;
        }

        .btn-date-filter.active {
          background: #000;
          border-color: #000;
          color: #fff;
        }

        .btn-date-filter:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-date-filter.active:disabled,
        .btn-date-filter.secondary.active:disabled {
          opacity: 1;
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

        .btn-primary, .btn-secondary, .btn-outline {
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

        .btn-outline {
          background: #1a1a1a;
          color: white;
          border: none;
        }

        .btn-outline:hover:not(:disabled) {
          background: #000;
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

        .confirm-modal {
          max-width: 480px;
        }

        .confirm-description {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .confirm-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .confirm-form label {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }

        .confirm-form select,
        .confirm-form textarea {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-checkboxes label {
          font-size: 14px;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-checkboxes input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .checkin-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: #f9fafb;
        }

        .summary-label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-value {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
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
          .checkin-tab-container {
            margin-top: 24px;
          }
          .checkin-tab-container.hidden {
            display: none;
          }
      `}</style>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchAppointments();
        }}
      />

      {/* Cancel/Update Appointment Modal */}
      <CancelUpdateAppointmentModal
        show={cancelUpdateModal.show}
        onClose={() => setCancelUpdateModal({ show: false, appointment: null, mode: 'cancel' })}
        onSuccess={() => {
          fetchAppointments();
        }}
        appointment={cancelUpdateModal.appointment}
        mode={cancelUpdateModal.mode}
      />
    </div>
  );
}
