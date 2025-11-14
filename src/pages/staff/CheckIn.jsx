// src/pages/staff/CheckIn.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import staffService from '../../services/staffService';
import useDebounce from '../../hooks/useDebounce';
import { useAuth } from '../../contexts/AuthContext';
import {
  buildCheckInWindow,
  formatDateYMD,
  formatHumanDate,
  formatTimeRange,
  getVNNow,
  isSameYMD,
  parseDateFromYMD,
  startOfDay,
} from '../../utils/time';

const EARLY_CHECKIN_MINUTES = 15;
const LATE_CHECKIN_MINUTES = 30;
const DEFAULT_DURATION_MINUTES = 60;
const ENV_FALLBACK_SERVICE_CENTER =
  process.env.REACT_APP_DEFAULT_SERVICE_CENTER_ID || null;

const resolveServiceCenterId = (user) =>
  user?.serviceCenterId ||
  user?.ServiceCenterId ||
  user?.serviceCenter?.serviceCenterId ||
  user?.serviceCenter?.id ||
  user?.staffProfile?.serviceCenterId ||
  user?.StaffProfile?.serviceCenterId ||
  ENV_FALLBACK_SERVICE_CENTER;

const resolveSlotDateTime = (appointment = {}) => {
  const withTime =
    appointment.slotDateTime ||
    appointment.slotDate ||
    appointment.SlotDate ||
    appointment.appointmentDate ||
    appointment.AppointmentDate;

  if (typeof withTime === 'string' && withTime.includes('T')) {
    return withTime;
  }

  const datePart =
    appointment.slotDateOnly ||
    appointment.slotDate ||
    appointment.SlotDate ||
    appointment.appointmentDate ||
    appointment.AppointmentDate ||
    appointment.date;

  const timePart =
    appointment.slotStartTime ||
    appointment.SlotStartTime ||
    appointment.time ||
    appointment.slotTime ||
    appointment.Time;

  if (datePart && timePart) {
    return `${datePart}T${timePart}`;
  }

  return datePart || null;
};

const resolveEstimatedDuration = (appointment = {}) => {
  const raw =
    appointment.estimatedDuration ||
    appointment.estimatedMinutes ||
    appointment.estimatedDurationMinutes ||
    appointment.EstimatedDuration ||
    appointment.Duration ||
    appointment.serviceDuration ||
    appointment.durationMinutes;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_DURATION_MINUTES;
};

const CHECKIN_ERROR_MESSAGES = {
  APPT_STATUS_INVALID:
    'Chỉ được check-in khi lịch ở trạng thái Pending hoặc Confirmed.',
  APPT_DATE_MISMATCH: 'Chỉ được check-in đúng ngày hẹn.',
  APPT_TOO_EARLY: 'Chưa đến cửa sổ cho phép check-in.',
  APPT_TOO_LATE: 'Đã quá thời gian cho phép check-in.',
  APPT_ALREADY_CHECKEDIN: 'Lịch hẹn này đã được check-in trước đó.',
};

export default function CheckIn({
  embedded = false,
  serviceCenterOverride = null,
  dateOverride = null,
  onAppointmentCountChange = () => {},
} = {}) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [now, setNow] = useState(() => getVNNow());

  const todayDateStr = useMemo(() => formatDateYMD(now), [now]);

  console.group('📅 CheckIn Date Calculation');
  console.log('✅ Real browser date:', now);
  console.log('✅ Today date string:', todayDateStr);
  console.groupEnd();

  // CheckIn shows today's appointments unless overridden (embedded mode)
  const selectedDate = dateOverride || todayDateStr;
  const selectedDateObj = selectedDate ? parseDateFromYMD(selectedDate) : null;

  const controllerRef = useRef(null);
  const debouncedSearch = useDebounce(search, 500); // 500ms cho “nhẹ nhàng”
  const [hasSearched, setHasSearched] = useState(false);
  const preferredServiceCenterId = useMemo(
    () => serviceCenterOverride ?? resolveServiceCenterId(user),
    [serviceCenterOverride, user],
  );
  const [serviceCenters, setServiceCenters] = useState([]);
  const [serviceCenterId, setServiceCenterId] = useState(
    preferredServiceCenterId || null,
  );
  const [serviceCenterLoading, setServiceCenterLoading] = useState(true);
  const [serviceCenterError, setServiceCenterError] = useState('');
  const showMissingServiceCenter =
    !serviceCenterLoading && !(serviceCenterId && selectedDate);
  const handleServiceCenterChange = (event) => {
    const value = event.target.value;
    setServiceCenterId(value ? Number(value) : null);
  };

  useEffect(() => {
    if (preferredServiceCenterId) {
      setServiceCenterId(preferredServiceCenterId);
    }
  }, [preferredServiceCenterId]);

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => setNow(getVNNow()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadCenters = async () => {
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
          preferredServiceCenterId ||
          firstCenter?.centerId ||  // ✅ CORRECT FIELD NAME
          firstCenter?.serviceCenterId ||
          firstCenter?.ServiceCenterId ||
          firstCenter?.id ||
          null;

        console.log('✅ Selected Service Center ID:', defaultId);
        console.log('Preferred Service Center ID:', preferredServiceCenterId);
        setServiceCenterId(defaultId);
      } catch (error) {
        console.error('Failed to load service centers:', error);
        setServiceCenters([]);
        setServiceCenterError(
          error.response?.data?.message ||
            'Không thể tải danh sách trung tâm dịch vụ',
        );
        setServiceCenterId(preferredServiceCenterId || null);
      } finally {
        setServiceCenterLoading(false);
      }
    };

    loadCenters();
  }, [preferredServiceCenterId]);

  // Auto search theo debounce
  useEffect(() => {
    // nếu rỗng -> clear kết quả & không gọi API
    if (!debouncedSearch.trim()) {
      setWorkOrders([]);
      return;
    }
    runSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const fetchConfirmed = useCallback(
    async (targetDateStr) => {
      if (!serviceCenterId) {
        if (user) {
          console.warn('No service center id found for current staff user');
        }
        setAppointments([]);
        setLoading(false);
        return;
      }

      // Use the date as-is, no timezone workaround
      let normalizedDate = targetDateStr && targetDateStr.length === 10
        ? targetDateStr
        : todayDateStr;

      console.group('📅 Fetching Appointments');
      console.log('Date to fetch:', normalizedDate);
      console.log('Service Center ID:', serviceCenterId);
      console.groupEnd();

      setLoading(true);
      try {
        const response = await staffService.getAppointmentsByDate(
          serviceCenterId,
          normalizedDate,
        );
        const payload =
          response?.data?.data ||
          response?.data ||
          response?.appointments ||
          response;
        const allItems = Array.isArray(payload)
          ? payload
          : payload.items ||
            payload.appointments ||
            payload.Appointments ||
            [];

        console.log('📦 All appointments from API:', allItems.length);
        console.log('📦 First appointment:', allItems[0]);

        // DEBUG: Check appointment dates
        if (allItems.length > 0) {
          console.group('🔍 Appointment Dates Debug');
          allItems.forEach((apt, index) => {
            console.log(`Appointment ${index + 1}:`, {
              appointmentId: apt.appointmentId,
              slotDate: apt.slotDate,
              slotDateTime: apt.slotDateTime,
              appointmentDate: apt.appointmentDate,
              slotStartTime: apt.slotStartTime,
              allDateFields: Object.keys(apt).filter(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('slot'))
            });
          });
          console.groupEnd();
        }

        const normalizedTargetDate = normalizeDateOnly(normalizedDate);

        // ✅ FILTER: Only show CONFIRMED appointments for check-in
        const confirmedItems = allItems.filter((apt) => {
          const statusName = (apt.statusName || apt.StatusName || '').toLowerCase();
          const statusId = apt.statusId || apt.StatusId;

          // Status "Confirmed" = statusId 2 or statusName "confirmed"
          const isConfirmed = statusId === 2 || statusName === 'confirmed';
          if (!isConfirmed) return false;

          // Also enforce the selected date on FE to avoid BE drift
          const appointmentDateISO = normalizeDateOnly(
            apt.slotDate ||
              apt.slotDateOnly ||
              apt.SlotDate ||
              apt.SlotDateOnly ||
              apt.slotDateTime ||
              apt.SlotDateTime ||
              apt.appointmentDate ||
              apt.AppointmentDate ||
              apt.date ||
              apt.Date,
          );

          return !normalizedTargetDate || appointmentDateISO === normalizedTargetDate;
        });

        console.log('✅ Confirmed appointments:', confirmedItems.length);
        setAppointments(confirmedItems);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        toast.error('Failed to load appointments for selected day');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    },
    [serviceCenterId, user],
  );

  useEffect(() => {
    if (!serviceCenterId || !selectedDate) return;
    fetchConfirmed(selectedDate);
  }, [serviceCenterId, selectedDate, fetchConfirmed]);

  // Removed auto-reset to today - let user freely select date
  // useEffect(() => {
  //   if (!todayDateStr) return;
  //   setSelectedDate((prev) => (prev === todayDateStr ? prev : todayDateStr));
  // }, [todayDateStr]);

  const getCheckInState = useCallback(
    (appointment) => {
      const slotValue = resolveSlotDateTime(appointment);
      const estimatedMinutes = resolveEstimatedDuration(appointment);
      const window = buildCheckInWindow(
        slotValue,
        estimatedMinutes,
        EARLY_CHECKIN_MINUTES,
        LATE_CHECKIN_MINUTES,
      );

      if (!window) {
        return {
          window: null,
          allow: false,
          reason: 'Không xác định được khung giờ hẹn',
        };
      }

      if (!selectedDateObj || !isSameYMD(window.slotStart, selectedDateObj)) {
        return {
          window,
          allow: false,
          reason: 'Chỉ hiển thị lịch thuộc ngày đang chọn',
        };
      }

      // Use real browser time for comparison
      if (!isSameYMD(now, window.slotStart)) {
        return {
          window,
          allow: false,
          reason: 'Chỉ được check-in đúng ngày hẹn',
        };
      }

      if (now < window.windowStart) {
        return {
          window,
          allow: false,
          reason: `Chưa tới giờ. Cửa sổ: ${formatTimeRange(
            window.windowStart,
            window.windowEnd,
          )}`,
        };
      }

      if (now > window.windowEnd) {
        return {
          window,
          allow: false,
          reason: `Đã trễ so với cửa sổ ${formatTimeRange(
            window.windowStart,
            window.windowEnd,
          )}`,
        };
      }

      return {
        window,
        allow: true,
        reason: '',
      };
    },
    [now, selectedDateObj],
  );

  const selectedDateLabel = selectedDateObj
    ? formatHumanDate(selectedDateObj)
    : '--';

  const todaysAppointments = useMemo(() => {
    if (!selectedDateObj) {
      return [];
    }

    const targetISO = formatDateYMD(selectedDateObj);

    return appointments.filter((appointment) => {
      const appointmentDateISO = normalizeDateOnly(
        appointment.slotDate ||
          appointment.slotDateOnly ||
          appointment.SlotDate ||
          appointment.SlotDateOnly ||
          appointment.slotDateTime ||
          appointment.SlotDateTime ||
          appointment.appointmentDate ||
          appointment.AppointmentDate ||
          appointment.date ||
          appointment.Date,
      );

      return appointmentDateISO === targetISO;
    });
  }, [appointments, selectedDateObj]);

  useEffect(() => {
    if (typeof onAppointmentCountChange === 'function') {
      onAppointmentCountChange(todaysAppointments.length);
    }
  }, [todaysAppointments, onAppointmentCountChange]);

  const handleCheckIn = async (appointmentId) => {
    try {
      await staffService.checkInAppointment(appointmentId);
      toast.success('Check-in successful! WorkOrder created.');
      fetchConfirmed(selectedDate);
    } catch (err) {
      console.error('Check-in failed:', err);
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        CHECKIN_ERROR_MESSAGES[code] ||
        'Check-in failed. Please try again.';

      toast.error(message);
    }
  };

  const runSearch = async (keyword) => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    setSearchLoading(true);
    setHasSearched(false); // reset trước khi gọi API

    try {
      const response = await staffService.searchWorkOrders(
        { SearchTerm: keyword.trim() },
        { signal: controllerRef.current.signal },
      );
      const data = response.data || response;
      const items = Array.isArray(data) ? data : data.items || [];
      setWorkOrders(items);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Search failed:', err);
        toast.error(err.response?.data?.message || 'Search failed');
        setWorkOrders([]);
      }
    } finally {
      setSearchLoading(false);
      setHasSearched(true); // chỉ bật sau khi API hoàn tất
    }
  };

  const handleSearch = () => {
    if (!search.trim()) {
      toast.warning('Please enter license plate or Work Order ID');
      return;
    }
    runSearch(search);
  };

  return (
    <div className={`checkin-page${embedded ? ' embedded' : ''}`}>

      {/* Two Column Layout */}
      <div className='two-column-container'>
        {/* Search Work Order Section */}
        <div className='search-section'>
          <div className='section-title'>
            <i className='bi bi-search'></i>
            <h2>Search Work Order</h2>
          </div>
          <div className='search-container'>
            <i className='bi bi-search search-icon'></i>
            <input
              type='text'
              className='search-input'
              placeholder='Search work order by license plate or ID...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchLoading && (
              <span className='search-spinner' aria-label='loading' />
            )}
          </div>

          {hasSearched &&
            !searchLoading &&
            workOrders.length === 0 &&
            search.trim() && (
              <div className='empty-search'>
                <i className='bi bi-search'></i>
                <h3>No Work Orders Found</h3>
                <p>Try searching with a different license plate or ID.</p>
              </div>
            )}

          {/* Search Results */}
          {workOrders.length > 0 && (
            <div className='search-results'>
              <h3>Search Results ({workOrders.length})</h3>
              <div className='results-grid'>
                {workOrders.map((wo) => (
                  <div key={wo.workOrderId || wo.id} className='result-card'>
                    <div className='result-header'>
                      <span className='wo-id'>
                        {wo.workOrderCode || `WO #${wo.workOrderId}`}
                      </span>
                      <span
                        className='status-badge'
                        style={{
                          backgroundColor: wo.statusColor || '#f5f5f7',
                          color: '#1a1a1a',
                        }}
                      >
                        {wo.statusName || 'Unknown'}
                      </span>
                    </div>

                    <div className='result-body'>
                      <div className='info-item'>
                        <i className='bi bi-person'></i>
                        <span>{wo.customerName || 'N/A'}</span>
                      </div>

                      <div className='info-item'>
                        <i className='bi bi-car-front'></i>
                        <span>
                          {wo.vehiclePlate || wo.vehicleModel || 'N/A'}
                        </span>
                      </div>

                      <div className='info-item'>
                        <i className='bi bi-tools'></i>
                        <span>{wo.technicianName || 'Unassigned'}</span>
                      </div>

                      <div className='progress-bar'>
                        <div
                          className='progress-fill'
                          style={{ width: `${wo.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                      <span className='progress-text'>
                        {wo.progressPercentage || 0}% completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ready for Check-in Section */}
        <div className='checkin-section'>
          <div className='section-title checkin-title'>
            <div className='title-stack'>
              <i className='bi bi-clipboard-check'></i>
              <div>
                <h2>Ready for Check-in</h2>
                <p className='date-label'>Lịch ngày {selectedDateLabel}</p>
                <p className='timezone-note'>
                  Giờ hệ thống: Asia/Ho_Chi_Minh (UTC+7)
                </p>
              </div>
            </div>
            <span className='count-badge'>
              {loading ? '...' : todaysAppointments.length}
            </span>
          </div>

          <p className='history-note'>
            Chỉ hiển thị lịch đã confirm trong ngày hiện tại.
          </p>

          {showMissingServiceCenter ? (
            <div className='empty-state'>
              <i className='bi bi-exclamation-triangle'></i>
              <h3>Missing service center</h3>
              <p>
                Không tìm thấy service center trong hồ sơ. Vui lòng cập nhật hồ sơ
                hoặc cấu hình <code>REACT_APP_DEFAULT_SERVICE_CENTER_ID</code>.
              </p>
            </div>
          ) : loading ? (
            <div className='empty-state'>
              <div className='spinner'></div>
              <p>Loading appointments...</p>
            </div>
          ) : todaysAppointments.length === 0 ? (
            <div className='empty-state'>
              <i className='bi bi-calendar-x'></i>
              <h3>No appointments</h3>
              <p>Không có lịch hẹn trong ngày {selectedDateLabel}.</p>
            </div>
          ) : (
            <div className='appointments-grid'>
               {todaysAppointments.map((app) => {
                const state = getCheckInState(app);
                const windowRange = state.window
                  ? formatTimeRange(
                      state.window.windowStart,
                      state.window.windowEnd,
                    )
                  : null;
                const slotTimeRange = state.window
                  ? formatTimeRange(state.window.slotStart, state.window.slotEnd)
                  : app.slotStartTime && app.slotEndTime
                    ? `${app.slotStartTime} - ${app.slotEndTime}`
                    : app.slotStartTime || app.slotEndTime || 'N/A';
                const slotDateText = state.window
                  ? formatHumanDate(state.window.slotStart)
                  : formatAppointmentDateLabel(
                      app.slotDate ||
                        app.slotDateOnly ||
                        app.slotDateTime ||
                        app.appointmentDate ||
                        app.date,
                    );
                const tooltip = state.allow
                  ? 'Check-in khách'
                  : state.reason ||
                    (windowRange
                      ? `Cửa sổ: ${windowRange}`
                      : 'Ngoài khung giờ check-in');

                return (
                  <div
                    key={app.appointmentId || app.id}
                    className='appointment-card'
                  >
                    <div className='card-header-checkin'>
                      <div className='appointment-id'>
                        <span className='id-label'>ID</span>
                        <span className='id-value'>
                          #{app.appointmentId || app.id}
                        </span>
                      </div>
                      <span className='status-confirmed'>Confirmed</span>
                    </div>

                    <div className='card-body-checkin'>
                      <div className='info-row'>
                        <i className='bi bi-person'></i>
                        <span className='label'>Customer:</span>
                        <span className='value'>
                          {app.customerName || app.customer?.fullName || 'N/A'}
                        </span>
                      </div>
                      <div className='info-row'>
                        <i className='bi bi-car-front'></i>
                        <span className='label'>Vehicle:</span>
                        <span className='value'>
                          {app.licensePlate ||
                            app.vehicle?.licensePlate ||
                            'N/A'}
                        </span>
                      </div>
                      <div className='info-row'>
                        <i className='bi bi-calendar'></i>
                        <span className='label'>Date:</span>
                        <span className='value'>{slotDateText}</span>
                      </div>
                      <div className='info-row'>
                        <i className='bi bi-clock'></i>
                        <span className='label'>Service time:</span>
                        <span className='value'>{slotTimeRange}</span>
                      </div>
                      <div className='info-row'>
                        <i className='bi bi-hourglass-split'></i>
                        <span className='label'>Check-in window:</span>
                        <span className='value'>
                          {windowRange || 'Không xác định'}
                        </span>
                      </div>
                    </div>

                    <div className='card-footer-checkin'>
                      <div className='window-meta'>
                        {windowRange && (
                          <span className='window-label'>
                            Cửa sổ: {windowRange}
                          </span>
                        )}
                        {!state.allow && state.reason && (
                          <span className='checkin-hint'>{state.reason}</span>
                        )}
                      </div>
                      <button
                        className='btn-checkin'
                        disabled={!state.allow}
                        title={tooltip}
                        onClick={() =>
                          handleCheckIn(app.appointmentId || app.id)
                        }
                      >
                        <i className='bi bi-check-circle'></i>
                        Check-in
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .checkin-page {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .checkin-page.embedded {
          padding: 0;
          max-width: 100%;
        }

        .checkin-page.embedded .two-column-container {
          height: auto;
        }

        .checkin-page.embedded .search-section,
        .checkin-page.embedded .checkin-section {
          height: auto;
          max-height: none;
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

        .two-column-container {
          display: grid;
          grid-template-columns: 4fr 6fr;
          gap: 20px;
          align-items: stretch;
          height: calc(100vh - 220px);
          overflow: hidden;
        }

        .service-center-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 20px;
          padding: 14px 20px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .service-center-meta label {
          font-weight: 600;
          color: #1a1a1a;
        }

        .service-center-meta select {
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

        /* Section */
        .search-section,
        .checkin-section {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          padding: 24px;
          height: 100%;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(17, 24, 39, 0.04);
        }

        .search-section::-webkit-scrollbar,
        .checkin-section::-webkit-scrollbar {
          width: 6px;
        }

        .search-section::-webkit-scrollbar-thumb,
        .checkin-section::-webkit-scrollbar-thumb {
          background: #bfbfc5;
          border-radius: 999px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
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

        .checkin-title {
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .title-stack {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .date-label {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0;
        }

        .timezone-note {
          font-size: 12px;
          color: #9ca3af;
          margin: 4px 0 0;
        }

        .history-note {
          width: 100%;
          font-size: 12px;
          color: #6b7280;
          margin: 4px 0 0;
        }

        /* Search Container */
        .search-container {
          position: relative;
          width: 100%;
        }

        .search-spinner {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          border: 2px solid #e5e5e5;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: #86868b;
        }

        .search-input {
          width: 100%;
          padding: 12px 20px 12px 42px; /* chừa chỗ cho icon */
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          background: #fafafa;
          font-size: 14px;
          color: #1a1a1a;
          transition: all 0.2s;
        }

        .search-input:focus {
          background: #fff;
          outline: none;
          border-color: #1a1a1a;
          box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
        }

        .search-input::placeholder {
          color: #d1d1d6;
        }


        /* Search Results */
        .search-results {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e5e5;
        }

        .search-results h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 16px 0;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .result-card {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          padding: 16px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
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

        .status-badge.inprogress {
          background: #FFF4E6;
          color: #E67E00;
        }

        .status-badge.completed {
          background: #E6F7ED;
          color: #00875A;
        }

        .result-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #1a1a1a;
        }

        .info-item i {
          color: #86868b;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e5e5e5;
          border-radius: 25px;
          overflow: hidden;
          margin-top: 8px;
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

        /* Appointments Grid */
        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .appointment-card {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .appointment-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .card-header-checkin {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e5e5e5;
          background: white;
        }

        .appointment-id {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .id-label {
          font-size: 12px;
          color: #86868b;
          font-weight: 500;
        }

        .id-value {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .status-confirmed {
          background: #E6F7FF;
          color: #0066CC;
          padding: 4px 12px;
          border-radius: 25px;
          font-size: 13px;
          font-weight: 500;
        }

        .card-body-checkin {
          padding: 16px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 20px auto 1fr;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-row i {
          color: #86868b;
        }

        .info-row .label {
          color: #86868b;
          font-weight: 500;
        }

        .info-row .value {
          color: #1a1a1a;
          font-weight: 500;
          text-align: right;
        }

        .card-footer-checkin {
          padding: 16px;
          border-top: 1px solid #e5e5e5;
          background: white;
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .window-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .window-label {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .checkin-hint {
          font-size: 12px;
          color: #d97706;
          margin: 0;
        }

        .btn-checkin {
          min-width: 140px;
          padding: 10px 18px;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-checkin:hover {
          background: #000;
        }

        .btn-checkin:disabled {
          background: #e5e5e5;
          color: #9ca3af;
          cursor: not-allowed;
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

        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          margin-top: 16px;
          color: #86868b;
          font-size: 14px;
        }

        @media (max-width: 992px) {
          .two-column-container {
            grid-template-columns: 1fr;
            height: auto;
          }

          .search-section,
          .checkin-section {
            height: auto;
            max-height: 520px;
          }
        }

        @media (max-width: 768px) {
          .checkin-page {
            padding: 20px;
          }

          .search-container {
            flex-direction: column;
          }

          .search-btn {
            width: 100%;
            justify-content: center;
          }

          .two-column-container {
            grid-template-columns: 1fr;
          }

        }
          .empty-search {
            text-align: center;
            padding: 60px 20px;
            color: #86868b;
          }

          .empty-search i {
            font-size: 64px;
            color: #d1d1d6;
            margin-bottom: 16px;
          }

          .empty-search h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 8px 0;
          }

          .empty-search p {
            font-size: 14px;
            color: #86868b;
            margin: 0;
          }

      `}</style>
    </div>
  );
}
const normalizeDateOnly = (value) => {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  const str = String(value).trim();
  if (!str) return '';
  const [datePart] = str.split(/[T\s]/);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
};

const formatAppointmentDateLabel = (value) => {
  const iso = normalizeDateOnly(value);
  if (!iso) return 'N/A';
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};
