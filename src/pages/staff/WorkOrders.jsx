// src/pages/staff/WorkOrders.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import staffService from '../../services/staffService';
import { useAuth } from '../../contexts/AuthContext';

const resolveServiceCenterId = (user) =>
  user?.serviceCenterId ||
  user?.ServiceCenterId ||
  user?.serviceCenter?.serviceCenterId ||
  user?.serviceCenter?.id ||
  user?.staffProfile?.serviceCenterId ||
  user?.StaffProfile?.serviceCenterId ||
  process.env.REACT_APP_DEFAULT_SERVICE_CENTER_ID ||
  null;

const normaliseKey = (value = '') =>
  value.toString().replace(/\s+/g, '').toLowerCase();

export default function WorkOrders() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWO, setSelectedWO] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'detail'

  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [serviceCenterId, setServiceCenterId] = useState(
    () => resolveServiceCenterId(user) || null,
  );
  const [serviceCenterLoading, setServiceCenterLoading] = useState(false);
  const [serviceCenterError, setServiceCenterError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [lastAutoContext, setLastAutoContext] = useState(null);
  const autoContextHandled = useRef(false);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeSearchCenter, setActiveSearchCenter] = useState(null);
  const [qcRating, setQcRating] = useState(5);
  const [qcNotes, setQcNotes] = useState('');
  const [existingQC, setExistingQC] = useState(null);
  const [canCustomerRate, setCanCustomerRate] = useState(false);
  const [qcLoading, setQcLoading] = useState(false);

  const normalizeWorkOrdersResponse = useCallback(
    (response, fallbackPage) => {
      const primaryData =
        response?.data?.data ||
        response?.data ||
        response?.Data?.Data ||
        response?.Data ||
        response;

      const nestedData = primaryData?.data || primaryData?.Data;
      const payload = nestedData || primaryData || {};

      const items =
        (Array.isArray(payload) && payload) ||
        payload.items ||
        payload.Items ||
        nestedData?.items ||
        nestedData?.Items ||
        [];

      const pagination =
        payload.pagination ||
        payload.Pagination ||
        nestedData?.pagination ||
        nestedData?.Pagination ||
        {};

      const totalItemsCount =
        pagination.totalCount ??
        pagination.TotalCount ??
        payload.totalCount ??
        payload.TotalCount ??
        items.length;

      const normalizedTotalPages =
        pagination.totalPages ??
        pagination.TotalPages ??
        payload.totalPages ??
        payload.TotalPages ??
        payload.pageCount ??
        payload.PageCount ??
        (totalItemsCount && PAGE_SIZE
          ? Math.max(1, Math.ceil(totalItemsCount / PAGE_SIZE))
          : 1);

      const normalizedPage =
        pagination.pageNumber ??
        pagination.PageNumber ??
        pagination.currentPage ??
        pagination.CurrentPage ??
        payload.pageNumber ??
        payload.PageNumber ??
        payload.currentPage ??
        payload.CurrentPage ??
        fallbackPage;

      return {
        items: Array.isArray(items) ? items : [],
        totalPages: normalizedTotalPages || 1,
        pageNumber: normalizedPage || fallbackPage,
      };
    },
    [PAGE_SIZE],
  );

  const getServiceCenterLabel = useCallback(
    (id) => {
      if (!id) return '';
      const numericId = Number(id);
      const center = serviceCenters.find(
        (sc) =>
          Number(sc.centerId || sc.serviceCenterId || sc.id) === numericId,
      );
      return (
        center?.centerName ||
        center?.serviceCenterName ||
        center?.name ||
        center?.centerCode ||
        `#${id}`
      );
    },
    [serviceCenters],
  );

  const loadServiceCenters = useCallback(async () => {
    setServiceCenterLoading(true);
    setServiceCenterError('');
    try {
      const response = await staffService.getActiveServiceCenters();
      const payload = response?.data?.data || response?.data || response;
      const centers = Array.isArray(payload)
        ? payload
        : payload?.items || payload?.data || [];
      setServiceCenters(centers);

      setServiceCenterId((prev) => {
        if (prev) return prev;
        const firstCenter = centers[0];
        return (
          resolveServiceCenterId(user) ||
          firstCenter?.centerId ||
          firstCenter?.serviceCenterId ||
          firstCenter?.ServiceCenterId ||
          firstCenter?.id ||
          null
        );
      });
    } catch (err) {
      console.error('Failed to load service centers:', err);
      setServiceCenterError(
        err.response?.data?.message || 'Failed to load service centers',
      );
    } finally {
      setServiceCenterLoading(false);
    }
  }, [user]);

  const fetchWorkOrders = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const response = await staffService.searchWorkOrders({
          Page: pageToLoad,
          PageNumber: pageToLoad,
          PageIndex: Math.max(0, pageToLoad - 1),
          PageSize: PAGE_SIZE,
        });

        const { items, totalPages: total } = normalizeWorkOrdersResponse(
          response,
          pageToLoad,
        );

        setWorkOrders(items);
        setTotalPages(Math.max(1, total));

      } catch (err) {
        console.error('Failed to load work orders:', err);
        toast.error('Failed to load work orders list');
      } finally {
        setLoading(false);
      }
    },
    [PAGE_SIZE, normalizeWorkOrdersResponse],
  );

  useEffect(() => {
    if (isSearchMode) return;
    fetchWorkOrders(page);
  }, [fetchWorkOrders, page, isSearchMode]);

  useEffect(() => {
    loadServiceCenters();
  }, [loadServiceCenters]);

  useEffect(() => {
    if (!serviceCenterId) {
      const fallback = resolveServiceCenterId(user);
      if (fallback) {
        setServiceCenterId(fallback);
      }
    }
  }, [serviceCenterId, user]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    searchByLicensePlate({
      licensePlate: searchTerm,
      centerId: serviceCenterId,
      autoOpen: true,
    });
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    setSearchTerm('');
    setActiveSearchTerm('');
    setActiveSearchCenter(null);
    fetchWorkOrders(1);
  };

  useEffect(() => {
    fetchTechnicians();
    fetchTemplates();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const response = await staffService.getTechnicians();
      const data = response.data || response;
      setTechnicians(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load technicians:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await staffService.getChecklistTemplates({
        IsActive: true,
        PageSize: 50,
      });
      const data = response.data || response;
      const items = Array.isArray(data) ? data : data.items || [];
      setTemplates(items);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadQualityCheckData = useCallback(async (woId) => {
    if (!woId) return;
    try {
      const [qcInfo, canRateInfo] = await Promise.all([
        staffService.getQualityCheckInfo(woId),
        staffService.canRateWorkOrder(woId),
      ]);

      const qcPayload = qcInfo?.data || qcInfo;
      if (qcPayload && Object.keys(qcPayload).length > 0) {
        setExistingQC(qcPayload);
        setQcRating(qcPayload.rating || 5);
        setQcNotes(qcPayload.notes || '');
      } else {
        setExistingQC(null);
        setQcRating(5);
        setQcNotes('');
      }

      const canRatePayload = canRateInfo?.data || canRateInfo;
      setCanCustomerRate(Boolean(canRatePayload?.canRate));
    } catch (err) {
      console.error('Failed to load quality check data:', err);
      setExistingQC(null);
      setCanCustomerRate(false);
    }
  }, []);

  const viewWorkOrderDetail = useCallback(async (woId) => {
    setDetailLoading(true);
    try {
      const detailResponse = await staffService.getWorkOrderDetail(woId);
      setSelectedWO(detailResponse.data || detailResponse);

      // Load checklist if exists
      // Load checklist if exists (new schema)
      try {
        const checklistResponse = await staffService.getWorkOrderChecklist(
          woId,
        );
        const raw = checklistResponse.data || checklistResponse;

        const checklistPayload = raw.data || raw; // because backend wraps inside data:{...}
        const items = checklistPayload.items || [];

        setChecklist(items);

        // attach progress info from backend
        setSelectedWO((prev) => ({
          ...prev,
          checklistTotal: checklistPayload.totalItems || items.length,
          checklistCompleted:
            checklistPayload.completedItems ||
            items.filter((i) => i.isCompleted).length,
          checklistCompletion: checklistPayload.completionPercentage ?? 0,
        }));
      } catch (err) {
        setChecklist([]);
      }

      setView('detail');
      loadQualityCheckData(woId);
    } catch (err) {
      console.error('Failed to load work order detail:', err);
      toast.error('Failed to load work order detail');
    } finally {
      setDetailLoading(false);
    }
  }, [loadQualityCheckData]);

  const searchByLicensePlate = useCallback(
    async ({ licensePlate, centerId, autoOpen = false } = {}) => {
      const trimmedPlate = (licensePlate || '').trim();
      if (!trimmedPlate) {
        toast.warn('Vui lòng nhập biển số xe để tìm WorkOrder');
        return;
      }

      const centerToUse = centerId || serviceCenterId;
      if (!centerToUse) {
        toast.warn('Vui lòng chọn trung tâm dịch vụ');
        return;
      }

      setSearching(true);
      try {
        setActiveSearchTerm(trimmedPlate);
        setActiveSearchCenter(centerToUse);
        const response = await staffService.searchWorkOrders({
          SearchTerm: trimmedPlate,
          ServiceCenterId: centerToUse,
          PageSize: 5,
          SortBy: 'CreatedDate',
          SortDirection: 'desc',
        });

        const { items } = normalizeWorkOrdersResponse(response, 1);
        if (!items.length) {
          toast.warn('Không tìm thấy WorkOrder cho xe này');
          setWorkOrders([]);
          setIsSearchMode(true);
          setTotalPages(1);
          return;
        }

        setWorkOrders(items);
        setTotalPages(1);
        setPage(1);
        setIsSearchMode(true);

        if (autoOpen) {
          const activeWorkOrder =
            items.find(
              (wo) =>
                (wo.statusName || wo.status) !== 'Completed' &&
                (wo.statusName || wo.status) !== 'Cancelled',
            ) || items[0];
          if (activeWorkOrder?.workOrderId) {
            viewWorkOrderDetail(activeWorkOrder.workOrderId);
          }
        }
      } catch (err) {
        console.error('Failed to search work orders:', err);
        toast.error('Failed to search work orders');
      } finally {
        setSearching(false);
      }
    },
    [normalizeWorkOrdersResponse, serviceCenterId, viewWorkOrderDetail],
  );

  useEffect(() => {
    if (autoContextHandled.current) return;
    try {
      const stored = sessionStorage.getItem('staff:lastCheckInContext');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!parsed?.licensePlate) return;

      setLastAutoContext(parsed);
      setSearchTerm(parsed.licensePlate);
      if (parsed.serviceCenterId) {
        setServiceCenterId(Number(parsed.serviceCenterId));
      }
      autoContextHandled.current = true;
      searchByLicensePlate({
        licensePlate: parsed.licensePlate,
        centerId: parsed.serviceCenterId,
        autoOpen: true,
      });
      sessionStorage.removeItem('staff:lastCheckInContext');
    } catch (err) {
      console.error('Failed to restore check-in context:', err);
    }
  }, [searchByLicensePlate]);

  const handleAutoAssign = async () => {
    if (!selectedWO) return;

    try {
      const workDate =
        selectedWO.workDate ||
        selectedWO.slotDate ||
        selectedWO.appointmentDate ||
        selectedWO.bookingDate ||
        lastAutoContext?.slotDate ||
        (selectedWO.startDate
          ? selectedWO.startDate.split('T')[0]
          : new Date().toISOString().split('T')[0]);
      const estimatedDuration =
        Number(
          selectedWO.estimatedDuration ||
            selectedWO.estimatedDurationMinutes ||
            selectedWO.serviceDuration ||
            lastAutoContext?.estimatedDuration,
        ) || 60;

      const centerForAuto = Number(
        selectedWO.serviceCenterId ||
          lastAutoContext?.serviceCenterId ||
          serviceCenterId,
      );
      if (!centerForAuto) {
        toast.warn('Thiếu thông tin trung tâm dịch vụ cho WorkOrder này');
        return;
      }
      const bestTech = await staffService.autoSelectTechnician({
        serviceCenterId: centerForAuto,
        workDate,
        estimatedDurationMinutes: estimatedDuration,
      });

      const techId =
        bestTech.data?.technicianId ||
        bestTech.technicianId ||
        bestTech.userId;

      if (techId) {
        await staffService.assignTechnician(
          selectedWO.workOrderId || selectedWO.id,
          techId,
        );
        toast.success('Auto-assigned technician successfully!');
        viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
      }
    } catch (err) {
      console.error('Auto assign failed:', err);
      toast.error(err.response?.data?.message || 'Auto-assign failed');
    }
  };

  const handleManualAssign = async (techId) => {
    const numericTechId = Number(techId);
    if (!selectedWO || !numericTechId) return;

    try {
      await staffService.assignTechnician(
        selectedWO.workOrderId || selectedWO.id,
        numericTechId,
      );
      toast.success('Assigned technician successfully!');
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error('Manual assign failed:', err);
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleApplyTemplate = async (templateId) => {
    if (!selectedWO) return;

    try {
      await staffService.applyChecklistTemplate(
        selectedWO.workOrderId || selectedWO.id,
        {
          templateId: Number(templateId),
        },
      );
      toast.success('Applied checklist template successfully!');
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error('Apply template failed:', err);
      toast.error(err.response?.data?.message || 'Failed to apply template');
    }
  };

  const handleStartWorkOrder = async () => {
    if (!selectedWO) return;

    try {
      await staffService.startWorkOrder(
        selectedWO.workOrderId || selectedWO.id,
      );
      toast.success('Work order started successfully!');
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error('Start work order failed:', err);
      toast.error(err.response?.data?.message || 'Failed to start work order');
    }
  };

  const handleCompleteChecklistItem = async (itemId) => {
    try {
      await staffService.quickCompleteItem(itemId, 'Completed by staff');
      toast.success('Item completed successfully!');
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error('Complete item failed:', err);
      toast.error(err.response?.data?.message || 'Failed to complete item');
    }
  };

  const handleCompleteWorkOrder = async () => {
    if (!selectedWO) return;

    try {
      // Validate checklist first
      const validationResponse = await staffService.validateChecklist(
        selectedWO.workOrderId || selectedWO.id,
      );
      const validationPayload =
        validationResponse?.data || validationResponse || {};
      if (validationPayload.canComplete === false) {
        const missing = validationPayload.missingItems || [];
        toast.error(
          missing.length
            ? `Checklist chưa hoàn thành:\n${missing.join('\n')}`
            : 'Checklist chưa hoàn thành. Vui lòng hoàn tất trước khi đóng WorkOrder.',
        );
        return;
      }

      const confirmComplete = window.confirm(
        'Xác nhận hoàn tất WorkOrder? Hành động này không thể hoàn tác.',
      );
      if (!confirmComplete) {
        return;
      }

      // Complete work order
      await staffService.completeWorkOrder(
        selectedWO.workOrderId || selectedWO.id,
      );
      toast.success('Work order completed successfully!');

      setView('list');
      setIsSearchMode(false);
      fetchWorkOrders(page);
    } catch (err) {
      console.error('Complete work order failed:', err);
      toast.error(
        err.response?.data?.message || 'Failed to complete work order',
      );
    }
  };

  const handleQualityCheck = async () => {
    if (!selectedWO) return;
    if (qcRating < 1 || qcRating > 5) {
      toast.error('Điểm QC phải nằm trong khoảng 1-5');
      return;
    }
    if (!qcNotes.trim()) {
      toast.error('Vui lòng nhập ghi chú QC');
      return;
    }

    const confirmQC = window.confirm(
      'Lưu kết quả Quality Check cho WorkOrder này?',
    );
    if (!confirmQC) return;

    setQcLoading(true);
    try {
      await staffService.performQualityCheck(
        selectedWO.workOrderId || selectedWO.id,
        {
          rating: qcRating,
          notes: qcNotes.trim(),
        },
      );
      toast.success('Đã lưu Quality Check');
      loadQualityCheckData(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error('Quality check failed:', err);
      toast.error(err.response?.data?.message || 'Quality check failed');
    } finally {
      setQcLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='spinner'></div>
        <p>Loading...</p>
      </div>
    );
  }

  const selectedWOStatus = selectedWO
    ? normaliseKey(selectedWO.statusName || selectedWO.status || '')
    : '';

  return (
    <div className='workorders-page'>
      {view === 'list' ? (
        <>
          {/* Header */}
          <div className='page-header'>
            <div className='header-left'>
              <h1>Work Orders</h1>
              <p>Manage work orders and checklists</p>
            </div>
          </div>

          {/* Quick Search */}
          <div className='search-card'>
            <div className='search-card-header'>
              <div>
                <h2>Quick WorkOrder Search</h2>
                <p className='search-caption'>
                  Tìm work order theo biển số và trung tâm dịch vụ
                </p>
              </div>
              {lastAutoContext?.licensePlate && (
                <span className='last-context'>
                  Last check-in: {lastAutoContext.licensePlate}
                </span>
              )}
            </div>
            <form className='search-form' onSubmit={handleSearchSubmit}>
              <div className='search-input-group'>
                <label>Biển số</label>
                <input
                  type='text'
                  placeholder='VD: 29A-12345'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className='search-input-group'>
                <label>Trung tâm</label>
                {serviceCenterLoading ? (
                  <span className='helper-text'>Đang tải...</span>
                ) : (
                  <select
                    value={serviceCenterId ?? ''}
                    onChange={(e) =>
                      setServiceCenterId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value=''>-- Chọn trung tâm --</option>
                    {serviceCenters.map((center) => {
                      const centerValue =
                        center.centerId ||
                        center.serviceCenterId ||
                        center.id;
                      const centerLabel =
                        center.centerName ||
                        center.serviceCenterName ||
                        center.name ||
                        center.centerCode ||
                        `Center ${centerValue}`;
                      return (
                        <option key={centerValue} value={centerValue}>
                          {centerLabel}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
              <div className='search-actions'>
                <button
                  type='submit'
                  className='btn-action primary'
                  disabled={searching || !searchTerm.trim()}
                >
                  {searching ? 'Đang tìm...' : 'Search'}
                </button>
                {isSearchMode && (
                  <button
                    type='button'
                    className='btn-action secondary'
                    onClick={handleClearSearch}
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
            {serviceCenterError && (
              <p className='error-text'>{serviceCenterError}</p>
            )}
          </div>

          {/* Work Orders List */}
          <div className='workorders-section'>
            <div className='section-title'>
              <i className='bi bi-tools'></i>
              <h2>All Work Orders</h2>
              <span className='count-badge'>{workOrders.length}</span>
            </div>

            {isSearchMode && (
              <div className='search-result-info'>
                Đang hiển thị kết quả cho{' '}
                <strong>
                  {activeSearchTerm ||
                    searchTerm ||
                    lastAutoContext?.licensePlate}
                </strong>
                {activeSearchCenter && (
                  <>
                    {' '}
                    tại{' '}
                    <strong>{getServiceCenterLabel(activeSearchCenter)}</strong>
                  </>
                )}
              </div>
            )}

            {workOrders.length === 0 ? (
              <div className='empty-state'>
                <i className='bi bi-inbox'></i>
                <h3>No Work Orders</h3>
                <p>No work orders have been created yet</p>
              </div>
            ) : (
              <div className='workorders-grid'>
                {workOrders.map((wo) => {
                  const cardWOId = wo.workOrderId || wo.id;
                  return (
                    <div
                      key={cardWOId}
                      className='workorder-card'
                      onClick={() => viewWorkOrderDetail(cardWOId)}
                    >
                      <div className='card-header-wo'>
                        <span className='wo-id'>
                          {wo.workOrderCode || `WO #${cardWOId}`}
                        </span>
                        <span
                          className='status-badge'
                          style={{
                            color: wo.statusColor || '#1a1a1a',
                            backgroundColor: 'transparent',
                            fontWeight: 600,
                          }}
                        >
                          {wo.statusName || 'Pending'}
                        </span>
                      </div>

                      <div className='card-body-wo'>
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

                        <div className='info-item'>
                          <i className='bi bi-clock-history'></i>
                          <span>
                            {wo.startDate
                              ? new Date(wo.startDate).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </span>
                        </div>

                        <div className='progress-section'>
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
                    </div>
                  );
                })}
              </div>
            )}
            {!isSearchMode && totalPages > 1 && (
              <div className='pagination-container'>
                <button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className='btn-page nav'
                >
                  <i className='bi bi-chevron-left'></i>
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`btn-page number ${
                      page === i + 1 ? 'active' : ''
                    }`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className='btn-page nav'
                >
                  <i className='bi bi-chevron-right'></i>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Detail View */}
          <div className='page-header'>
            <button className='btn-back' onClick={() => setView('list')}>
              <i className='bi bi-arrow-left'></i>
              Back to List
            </button>
          </div>

          {detailLoading ? (
            <div className='loading-container'>
              <div className='spinner'></div>
              <p>Loading details...</p>
            </div>
          ) : selectedWO ? (
            <div className='detail-container'>
              {/* Work Order Info Card */}
              <div className='detail-card'>
                <div className='card-header-detail'>
                  <h2>
                    {selectedWO.workOrderCode ||
                      `WO #${selectedWO.workOrderId}`}
                  </h2>
                  <span
                    className='status-badge'
                    style={{
                      color: selectedWO.statusColor || '#1a1a1a',
                      backgroundColor: 'transparent',
                      fontWeight: 600,
                    }}
                  >
                    {selectedWO.statusName || 'Pending'}
                  </span>
                </div>

                <div className='card-body-detail'>
                  <div className='detail-row'>
                    <span className='label'>Customer:</span>
                    <span className='value'>
                      {selectedWO.customerName || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='label'>Phone:</span>
                    <span className='value'>
                      {selectedWO.customerPhone || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='label'>Vehicle:</span>
                    <span className='value'>
                      {selectedWO.vehiclePlate ||
                        selectedWO.vehicleModel ||
                        'N/A'}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='label'>Technician:</span>
                    <span className='value'>
                      {selectedWO.technicianName || 'Unassigned'}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='label'>Progress:</span>
                    <span className='value'>
                      {selectedWO.checklistCompletion ??
                        selectedWO.progressPercentage ??
                        0}
                      %
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className='card-actions'>
                  {!selectedWO.assignedTechnician && (
                    <>
                      <button
                        className='btn-action primary'
                        onClick={handleAutoAssign}
                      >
                        <i className='bi bi-magic'></i>
                        Auto Assign
                      </button>
                      <select
                        className='select-technician'
                        onChange={(e) => handleManualAssign(e.target.value)}
                        defaultValue=''
                      >
                        <option value='' disabled>
                          Manual Assign...
                        </option>
                        {technicians.map((tech) => (
                          <option
                            key={tech.technicianId || tech.id}
                            value={tech.technicianId || tech.id}
                          >
                            {tech.fullName || tech.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {selectedWO.technicianId &&
                    ['pending', 'assigned'].includes(selectedWOStatus) && (
                      <button
                        className='btn-action success'
                        onClick={handleStartWorkOrder}
                      >
                        <i className='bi bi-play-circle'></i>
                        Start Work Order
                      </button>
                    )}

                  {selectedWOStatus === 'inprogress' &&
                    selectedWO.progress === 100 && (
                      <>
                        <button
                          className='btn-action success'
                          onClick={handleCompleteWorkOrder}
                        >
                          <i className='bi bi-check-circle'></i>
                          Complete Work Order
                        </button>
                        <button
                          className='btn-action primary'
                          onClick={handleQualityCheck}
                        >
                          <i className='bi bi-shield-check'></i>
                          Quality Check
                        </button>
                      </>
                    )}
                </div>
              </div>

              {/* Checklist Card */}
              {checklist.length > 0 ? (
                <div className='detail-card'>
                  <div className='card-header-detail'>
                    <h2>Checklist</h2>
                    <span className='count-badge'>
                      {selectedWO.checklistCompleted ??
                        checklist.filter((i) => i.isCompleted).length}{' '}
                      /{selectedWO.checklistTotal ?? checklist.length}
                    </span>
                  </div>

                  <div className='checklist-items'>
                    {checklist.map((item, index) => (
                      <div
                        key={item.itemId || index}
                        className='checklist-item'
                      >
                        <div className='item-content'>
                          <div className='item-header'>
                            <span className='item-title'>
                              {item.itemDescription || `Item ${index + 1}`}
                            </span>
                            <span
                              className={`item-status ${
                                item.isCompleted ? 'completed' : 'pending'
                              }`}
                            >
                              {item.isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          </div>

                          {item.notes && (
                            <p className='item-notes'>{item.notes}</p>
                          )}

                          {item.completedByName && (
                            <p className='item-notes'>
                              By: {item.completedByName}{' '}
                              {item.completedDate
                                ? ` • ${new Date(
                                    item.completedDate,
                                  ).toLocaleString('vi-VN')}`
                                : ''}
                            </p>
                          )}
                        </div>

                        {!item.isCompleted && selectedWOStatus === 'inprogress' && (
                            <button
                              className='btn-complete-item'
                              onClick={() =>
                                handleCompleteChecklistItem(item.itemId)
                              }
                            >
                              <i className='bi bi-check'></i>
                            </button>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                selectedWOStatus === 'inprogress' && (
                  <div className='detail-card'>
                    <div className='card-header-detail'>
                      <h2>Apply Checklist Template</h2>
                    </div>

                    <div className='card-body-detail'>
                      <p className='no-checklist-msg'>
                        No checklist found. Apply a template to start:
                      </p>
                      <select
                        className='select-template'
                        onChange={(e) =>
                          e.target.value && handleApplyTemplate(e.target.value)
                        }
                        defaultValue=''
                      >
                        <option value='' disabled>
                          Select Template...
                        </option>
                        {templates.map((template) => (
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
                )
              )}

              <div className='detail-card'>
                <div className='card-header-detail qc-header'>
                  <h2>Quality Check</h2>
                  <span
                    className={`qc-status ${
                      canCustomerRate ? 'ready' : 'pending'
                    }`}
                  >
                    {canCustomerRate
                      ? 'Customer can rate'
                      : 'Waiting for QC'}
                  </span>
                </div>
                <div className='card-body-detail qc-body'>
                  <div className='qc-existing'>
                    {existingQC ? (
                      <>
                        <p>
                          Last QC:{' '}
                          <strong>{existingQC.rating || 0}/5</strong>
                        </p>
                        {existingQC.notes && (
                          <p className='qc-notes'>“{existingQC.notes}”</p>
                        )}
                        {existingQC.updatedAt && (
                          <p className='qc-meta'>
                            Updated at:{' '}
                            {new Date(
                              existingQC.updatedAt,
                            ).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className='qc-empty'>Chưa có kết quả QC.</p>
                    )}
                  </div>
                  <div className='qc-form'>
                    <label>Rating (1-5)</label>
                    <select
                      value={qcRating}
                      onChange={(e) => setQcRating(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <label>Notes</label>
                    <textarea
                      rows={3}
                      value={qcNotes}
                      onChange={(e) => setQcNotes(e.target.value)}
                      placeholder='Ghi chú QC nội bộ...'
                    ></textarea>
                    <button
                      className='btn-action primary'
                      onClick={handleQualityCheck}
                      disabled={qcLoading || !selectedWO}
                    >
                      {qcLoading ? 'Saving...' : 'Save Quality Check'}
                    </button>
                  </div>
                </div>
              </div>
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

        .search-card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .search-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .search-card-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .search-caption {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .last-context {
          font-size: 13px;
          color: #0EA5E9;
          font-weight: 600;
        }

        .search-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          align-items: end;
        }

        .search-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .search-input-group label {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .search-input-group input,
        .search-input-group select {
          border: 1px solid #e5e5e5;
          border-radius: 20px;
          padding: 10px 14px;
          font-size: 14px;
          color: #1a1a1a;
        }

        .search-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-result-info {
          font-size: 13px;
          color: #2563eb;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .helper-text {
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
        }

        .error-text {
          font-size: 13px;
          color: #ef4444;
          margin-top: 8px;
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
          font-weight: 600;
          background: transparent;
          color: #1a1a1a;
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

        .btn-action.secondary {
          background: #f5f5f7;
          color: #1a1a1a;
        }

        .btn-action.secondary:hover {
          background: #e5e5e5;
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

        .qc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .qc-status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 25px;
          text-transform: uppercase;
        }

        .qc-status.ready {
          background: #ecfdf5;
          color: #047857;
        }

        .qc-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .qc-body {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .qc-existing {
          background: #f9fafb;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          padding: 16px;
          font-size: 14px;
          color: #1f2937;
        }

        .qc-notes {
          margin: 8px 0 0;
          font-style: italic;
        }

        .qc-empty {
          margin: 0;
          color: #6b7280;
        }

        .qc-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .qc-form select {
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          padding: 8px 12px;
          font-size: 14px;
        }

        .qc-form label {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .qc-form textarea {
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          padding: 10px 12px;
          font-size: 14px;
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
          .pagination-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 24px;
          }

          .btn-page {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            background: #f5f5f7;
            color: #1a1a1a;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-page.number {
            font-size: 14px;
          }

          .btn-page.nav i {
            font-size: 18px;
          }

          .btn-page:hover:not(:disabled) {
            background: #e5e5e5;
          }

          .btn-page.active {
            background: #1a1a1a;
            color: white;
          }

          .btn-page:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
      `}</style>
    </div>
  );
}
