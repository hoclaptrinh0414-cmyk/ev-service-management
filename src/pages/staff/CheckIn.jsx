// src/pages/staff/CheckIn.jsx
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import staffService from '../../services/staffService';
import useDebounce from '../../hooks/useDebounce';

export default function CheckIn() {
  const [appointments, setAppointments] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const controllerRef = useRef(null);
  const debouncedSearch = useDebounce(search, 500); // 500ms cho “nhẹ nhàng”
  const [hasSearched, setHasSearched] = useState(false);

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

  useEffect(() => {
    fetchConfirmed();
  }, []);

  const fetchConfirmed = async () => {
    setLoading(true);
    try {
      const response = await staffService.getStaffAppointments({
        status: 'Confirmed',
        pageSize: 20,
      });
      const data = response.data || response;
      const items = Array.isArray(data)
        ? data
        : data.items || data.appointments || [];
      setAppointments(items);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await staffService.checkInAppointment(appointmentId);
      toast.success('Check-in successful! WorkOrder created.');
      fetchConfirmed();
    } catch (err) {
      console.error('Check-in failed:', err);
      const message =
        err.response?.data?.error || // "Khách hàng chưa thanh toán..."
        err.response?.data?.message ||
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

  if (loading)
    return (
      <div className='loading-container'>
        <div className='spinner'></div>
        <p>Loading...</p>
      </div>
    );

  return (
    <div className='checkin-page'>
      {/* Header */}
      <div className='page-header'>
        <div className='header-left'>
          <h1>Check-in & Work Orders</h1>
          <p>Manage customer check-in and search work orders</p>
        </div>
      </div>

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
          <div className='section-title'>
            <i className='bi bi-clipboard-check'></i>
            <h2>Ready for Check-in</h2>
            <span className='count-badge'>{appointments.length}</span>
          </div>

          {appointments.length === 0 ? (
            <div className='empty-state'>
              <i className='bi bi-calendar-x'></i>
              <h3>No Appointments</h3>
              <p>No appointments ready for check-in at the moment</p>
            </div>
          ) : (
            <div className='appointments-grid'>
              {appointments.map((app) => (
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
                        {app.licensePlate || app.vehicle?.licensePlate || 'N/A'}
                      </span>
                    </div>
                    <div className='info-row'>
                      <i className='bi bi-calendar'></i>
                      <span className='label'>Date:</span>
                      <span className='value'>
                        {app.slotDate
                          ? new Date(app.slotDate).toLocaleDateString('en-GB') // format dd/mm/yyyy
                          : 'N/A'}
                      </span>
                    </div>
                    <div className='info-row'>
                      <i className='bi bi-clock'></i>
                      <span className='label'>Time:</span>
                      <span className='value'>
                        {app.slotDate && app.slotStartTime
                          ? `${app.slotStartTime} - ${app.slotEndTime}`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className='card-footer-checkin'>
                    <button
                      className='btn-checkin'
                      onClick={() => handleCheckIn(app.appointmentId || app.id)}
                    >
                      <i className='bi bi-check-circle'></i>
                      Check-in
                    </button>
                  </div>
                </div>
              ))}
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
          align-items: start;
        }

        /* Section */
        .search-section,
        .checkin-section {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          padding: 24px;
          height: fit-content;
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
        }

        .btn-checkin {
          width: 100%;
          padding: 10px;
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

        /* Responsive */
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
