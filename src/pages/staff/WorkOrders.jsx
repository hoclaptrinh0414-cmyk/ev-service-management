// src/pages/staff/WorkOrders.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import staffService from '../../services/staffService';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import TechnicianCandidatesModal from './TechnicianCandidatesModal';
import AddServicesModal from './AddServicesModal';
import DeliveryPaymentModal from './DeliveryPaymentModal';

const ensureUtcDateTime = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value !== 'string' || value.trim() === '') return null;

  const trimmed = value.trim();
  if (!trimmed.includes('T')) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const hasOffset = /[zZ]|[+-]\d{2}:\d{2}$/.test(trimmed);
  const isoString = hasOffset ? trimmed : `${trimmed}Z`;
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatVietnamDateTime = (value, options = {}) => {
  const date = ensureUtcDateTime(value);
  if (!date) return null;
  try {
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      ...options,
    });
  } catch {
    return null;
  }
};

const vietnamDateISOFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const getDateIdentifier = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }

  const date = ensureUtcDateTime(value);
  if (!date || Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};

const doesWorkOrderMatchDate = (workOrder, targetDate) => {
  if (!targetDate) return true;
  const candidates = [
    workOrder.workDate,
    workOrder.WorkDate,
    workOrder.slotDate,
    workOrder.SlotDate,
    workOrder.slotDay,
    workOrder.SlotDay,
    workOrder.appointmentDate,
    workOrder.AppointmentDate,
    workOrder.appointmentSlotDate,
    workOrder.AppointmentSlotDate,
    workOrder.bookingDate,
    workOrder.BookingDate,
    workOrder.startDate,
    workOrder.StartDate,
    workOrder.createdDate,
    workOrder.CreatedDate,
    workOrder.estimatedCompletionDate,
    workOrder.EstimatedCompletionDate,
    workOrder.checkInDate,
    workOrder.CheckInDate,
    workOrder.actualStartDate,
    workOrder.ActualStartDate,
  ];

  return candidates.some(
    (candidate) => getDateIdentifier(candidate) === targetDate,
  );
};

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
  const [searchDate, setSearchDate] = useState('');
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [lastAutoContext, setLastAutoContext] = useState(null);
  const autoContextHandled = useRef(false);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeSearchCenter, setActiveSearchCenter] = useState(null);
  const [activeSearchDate, setActiveSearchDate] = useState('');
  const [qcRating, setQcRating] = useState(5);
  const [qcNotes, setQcNotes] = useState('');
  const [existingQC, setExistingQC] = useState(null);
  const [canCustomerRate, setCanCustomerRate] = useState(false);
  const [qcLoading, setQcLoading] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [showAddServicesModal, setShowAddServicesModal] = useState(false);
  const [deliveryPaymentModal, setDeliveryPaymentModal] = useState({ show: false, mode: 'validate' });
  const [parts, setParts] = useState([]);
  const [partId, setPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchPart, setSearchPart] = useState('');
  const [loadingParts, setLoadingParts] = useState(false);
  const [outstandingAmount, setOutstandingAmount] = useState(0);
  const [invoiceId, setInvoiceId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [outstandingLoading, setOutstandingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const getTechnicianDisplay = useCallback(
    (wo) => {
      if (!wo) return 'Unassigned';
      const byName =
        wo.technicianName ||
        wo.TechnicianName ||
        wo.assignedTechnicianName ||
        wo.AssignedTechnicianName;
      if (byName) return byName;

      const assignedTech =
        wo.assignedTechnician ||
        wo.AssignedTechnician ||
        wo.technician ||
        wo.Technician;
      const nestedName =
        assignedTech?.fullName ||
        assignedTech?.name ||
        assignedTech?.technicianName ||
        assignedTech?.username ||
        assignedTech?.userName;
      if (nestedName) return nestedName;

      const techId =
        wo.technicianId ||
        wo.TechnicianId ||
        wo.assignedTechnicianId ||
        wo.AssignedTechnicianId;
      if (techId && technicians.length) {
        const matched = technicians.find(
          (t) => Number(t.userId || t.technicianId || t.id) === Number(techId),
        );
        if (matched) {
          return (
            matched.fullName ||
            matched.name ||
            matched.technicianName ||
            matched.username ||
            matched.userName ||
            `#${techId}`
          );
        }
      }

      return 'Unassigned';
    },
    [technicians],
  );

  const updateTechnicianInState = useCallback(
    (workOrderId, technicianId, technicianName) => {
      if (!workOrderId || !technicianId) return;

      setSelectedWO((prev) => {
        if (!prev) return prev;
        const idMatches =
          prev.workOrderId === workOrderId || prev.id === workOrderId;
        if (!idMatches) return prev;
        return {
          ...prev,
          technicianId,
          assignedTechnicianId: technicianId,
          technicianName: technicianName || prev.technicianName,
          assignedTechnicianName: technicianName || prev.assignedTechnicianName,
        };
      });

      setWorkOrders((prev) =>
        prev.map((wo) => {
          const idMatches =
            wo.workOrderId === workOrderId || wo.id === workOrderId;
          if (!idMatches) return wo;
          return {
            ...wo,
            technicianId,
            assignedTechnicianId: technicianId,
            technicianName: technicianName || wo.technicianName,
            assignedTechnicianName: technicianName || wo.assignedTechnicianName,
          };
        }),
      );
    },
    [],
  );

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

      // Enrich technician names in work order items
      const enrichedItems = Array.isArray(items) ? items.map(wo => {
        const techId = wo.technicianId || wo.assignedTechnicianId;
        if (techId && !wo.technicianName && !wo.assignedTechnicianName && technicians.length > 0) {
          const tech = technicians.find(t => Number(t.userId || t.technicianId || t.id) === Number(techId));
          if (tech) {
            const techName = tech.fullName || tech.name || tech.technicianName || tech.username || '';
            return {
              ...wo,
              technicianName: techName,
              assignedTechnicianName: techName,
            };
          }
        }
        return wo;
      }) : [];

      return {
        items: enrichedItems,
        totalPages: normalizedTotalPages || 1,
        pageNumber: normalizedPage || fallbackPage,
      };
    },
    [PAGE_SIZE, technicians],
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
      console.log('[WorkOrders] getActiveServiceCenters response:', response);
      const payload = response?.data?.data || response?.data || response;
      console.log('[WorkOrders] Extracted payload:', payload);
      const centers = Array.isArray(payload)
        ? payload
        : payload?.items || payload?.data || [];
      console.log('[WorkOrders] Service Centers loaded:', centers);
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

    if (isSearchMode) {
      const plate = activeSearchTerm || searchTerm;
      const center = activeSearchCenter || serviceCenterId;
      searchByLicensePlate({
        licensePlate: plate,
        centerId: center,
        pageNumber: nextPage,
        updatePageState: false,
        workDate: activeSearchDate || searchDate,
      });
    }

    setPage(nextPage);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    searchByLicensePlate({
      licensePlate: searchTerm,
      centerId: serviceCenterId,
      autoOpen: false,
      workDate: searchDate,
    });
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    setSearchTerm('');
    setSearchDate('');
    setActiveSearchTerm('');
    setActiveSearchCenter(null);
    setActiveSearchDate('');
    setPage(1);
    fetchWorkOrders(1);
  };

  useEffect(() => {
    fetchTechnicians();
    fetchTemplates();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const response = await staffService.getTechnicians();
      console.log('[WorkOrders] getTechnicians response:', response);
      const data = response.data || response;
      console.log('[WorkOrders] Technicians data:', data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('[WorkOrders] Sample technician:', data[0]);
      }
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
      const woData = detailResponse.data || detailResponse;

      // Enrich technician name if only ID is present
      const techId = woData.technicianId || woData.assignedTechnicianId;
      if (techId && !woData.technicianName && !woData.assignedTechnicianName && technicians.length > 0) {
        const tech = technicians.find(t => Number(t.userId || t.technicianId || t.id) === Number(techId));
        if (tech) {
          const techName = tech.fullName || tech.name || tech.technicianName || tech.username || '';
          woData.technicianName = techName;
          woData.assignedTechnicianName = techName;
        }
      }

      setSelectedWO(woData);

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
  }, [loadQualityCheckData, technicians]);

  const searchByLicensePlate = useCallback(
    async ({
      licensePlate,
      centerId,
      workDate,
      autoOpen = false,
      pageNumber = 1,
      updatePageState = true,
    } = {}) => {
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
        const normalizedDate =
          typeof workDate === 'string'
            ? workDate
            : workDate
            ? `${workDate}`
            : searchDate;
        const sanitizedDate = getDateIdentifier(normalizedDate);
        setActiveSearchDate(sanitizedDate);

        const queryParams = {
          SearchTerm: trimmedPlate,
          ServiceCenterId: centerToUse,
          Page: pageNumber,
          PageNumber: pageNumber,
          PageIndex: Math.max(0, pageNumber - 1),
          PageSize: PAGE_SIZE,
          SortBy: 'CreatedDate',
          SortDirection: 'desc',
        };

        if (sanitizedDate) {
          queryParams.WorkDate = sanitizedDate;
          queryParams.SlotDate = sanitizedDate;
          queryParams.StartDate = sanitizedDate;
          queryParams.Date = sanitizedDate;
          queryParams.AppointmentDate = sanitizedDate;
        }

        const response = await staffService.searchWorkOrders(queryParams);

        const { items, totalPages: total } = normalizeWorkOrdersResponse(
          response,
          pageNumber,
        );
        const filteredItems = sanitizedDate
          ? items.filter((wo) => doesWorkOrderMatchDate(wo, sanitizedDate))
          : items;

        if (!filteredItems.length) {
          const message = sanitizedDate
            ? 'Không tìm thấy WorkOrder cho xe này vào ngày đã chọn'
            : 'Không tìm thấy WorkOrder cho xe này';
          toast.warn(message);
          setWorkOrders([]);
          setIsSearchMode(true);
          setTotalPages(1);
          if (updatePageState) {
            setPage(1);
          }
          return;
        }

        setWorkOrders(filteredItems);
        setTotalPages(Math.max(1, total || 1));
        if (updatePageState) {
          setPage(pageNumber);
        }
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
    [
      normalizeWorkOrdersResponse,
      serviceCenterId,
      viewWorkOrderDetail,
      PAGE_SIZE,
      searchDate,
    ],
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
      const restoredDate = parsed.slotDate
        ? parsed.slotDate.split('T')[0]
        : parsed.workDate || '';
      if (restoredDate) {
        setSearchDate(restoredDate);
      }
      autoContextHandled.current = true;
      searchByLicensePlate({
        licensePlate: parsed.licensePlate,
        centerId: parsed.serviceCenterId,
        autoOpen: true,
        workDate: restoredDate,
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

      console.log('[WorkOrders] Auto-select technician response:', bestTech);
      console.log('[WorkOrders] Response data object:', bestTech.data);
      console.log('[WorkOrders] Available IDs:', {
        'data.userId': bestTech.data?.userId,
        'userId': bestTech.userId,
        'data.technicianId': bestTech.data?.technicianId,
        'technicianId': bestTech.technicianId,
        'data.id': bestTech.data?.id,
        'id': bestTech.id
      });

      // Ưu tiên userId trước
      const techId =
        bestTech.data?.userId ||
        bestTech.userId ||
        bestTech.data?.technicianId ||
        bestTech.technicianId ||
        bestTech.data?.id ||
        bestTech.id;

      console.log('[WorkOrders] Auto-assigned technician ID:', techId);

      if (techId) {
        await staffService.assignTechnician(
          selectedWO.workOrderId || selectedWO.id,
          techId,
        );

        // Lấy tên từ response hoặc tìm trong technicians list
        let techName =
          bestTech.data?.fullName ||
          bestTech.data?.name ||
          bestTech.fullName ||
          bestTech.name ||
          bestTech.technicianName ||
          bestTech.data?.username ||
          bestTech.username ||
          '';

        // Nếu không có tên trong response, tìm trong technicians list
        if (!techName && technicians.length > 0) {
          const foundTech = technicians.find(
            t => Number(t.userId || t.technicianId || t.id) === Number(techId)
          );
          if (foundTech) {
            techName = foundTech.fullName || foundTech.name || foundTech.username || '';
          }
        }

        console.log('[WorkOrders] Auto-assigned technician name:', techName);

        updateTechnicianInState(
          selectedWO.workOrderId || selectedWO.id,
          techId,
          techName,
        );
        toast.success(`Auto-assigned technician successfully! ${techName || ''}`);
        viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
      } else {
        toast.error('No suitable technician found');
      }
    } catch (err) {
      console.error('Auto assign failed:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.response?.data?.message || err.message
      });

      const errorMsg = err.response?.data?.message ||
                       err.response?.data?.title ||
                       err.response?.data?.error ||
                       err.message ||
                       'Auto-assign failed';

      toast.error(`Auto-assign failed: ${errorMsg}`);
    }
  };

  const handleManualAssign = async (techId) => {
    const numericTechId = Number(techId);
    if (!selectedWO || !numericTechId) return;

    try {
      console.log('[WorkOrders] Manual assign technician with ID:', numericTechId);

      await staffService.assignTechnician(
        selectedWO.workOrderId || selectedWO.id,
        numericTechId,
      );

      const assignedTech =
        technicians.find(
          (tech) =>
            Number(tech.userId || tech.technicianId || tech.id) === numericTechId ||
            normaliseKey(tech.username || tech.userName) ===
              normaliseKey(selectedWO.technicianName),
        ) || {};

      console.log('[WorkOrders] Found assigned tech:', assignedTech);

      const techName =
        assignedTech.fullName ||
        assignedTech.name ||
        assignedTech.technicianName ||
        assignedTech.username ||
        '';
      updateTechnicianInState(
        selectedWO.workOrderId || selectedWO.id,
        numericTechId,
        techName,
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

  const handleSkipChecklistItem = async (item) => {
    if (!item || item.isRequired) {
      toast.error('Cannot skip required items');
      return;
    }

    const skipReason = window.prompt(
      `Skip reason for "${item.itemDescription}":\n(Min 10 characters)`,
      'Customer declined this service'
    );

    if (!skipReason) {
      return; // User cancelled
    }

    if (skipReason.length < 10) {
      toast.error('Skip reason must be at least 10 characters');
      return;
    }

    try {
      await staffService.skipChecklistItem({
        itemId: item.itemId,
        workOrderId: selectedWO.workOrderId || selectedWO.id,
        skipReason: skipReason,
      });
      toast.success('Item skipped successfully!');
      viewWorkOrderDetail(selectedWO.workOrderId || selectedWO.id);
    } catch (err) {
      console.error('Skip item failed:', err);
      toast.error(err.response?.data?.message || 'Failed to skip item');
    }
  };

  const handleCompleteWorkOrder = async () => {
    if (!selectedWO) return;

    try {
      const woId = selectedWO.workOrderId || selectedWO.id;

      // Step 1: ensure outstanding amount is 0 before completing
      const deliveryInfo = await fetchOutstanding(woId, { silent: true });
      const latestOutstanding =
        Number(deliveryInfo?.outstandingAmount) || outstandingAmount || 0;
      if (latestOutstanding > 0) {
        toast.error(
          `Work order còn công nợ ${latestOutstanding.toLocaleString(
            'vi-VN',
          )} VND. Vui lòng thu đủ trước khi hoàn tất.`,
        );
        return;
      }

      // Validate checklist first
      const validationResponse = await staffService.validateChecklist(
        woId,
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
        woId,
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

  useEffect(() => {
    const loadParts = async () => {
      try {
        setLoadingParts(true);
        const params = new URLSearchParams();
        if (serviceCenterId) {
          params.append('ServiceCenterId', serviceCenterId);
        }
        params.append('PageSize', 100);
        if (searchPart.trim()) {
          params.append('SearchTerm', searchPart.trim());
        }
        const endpoint = `/inventory${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await apiService.request(endpoint);
        const rawList =
          (Array.isArray(response?.data?.items) && response.data.items) ||
          (Array.isArray(response?.data) && response.data) ||
          (Array.isArray(response?.items) && response.items) ||
          (Array.isArray(response) && response) ||
          [];
        const normalizedParts = rawList
          .map((item) => {
            const id =
              item.partId ??
              item.PartId ??
              item.inventoryId ??
              item.InventoryId ??
              item.id;
            const name =
              item.partName ??
              item.PartName ??
              item.name ??
              item.Name ??
              (id ? `Part #${id}` : '');
            if (!id || !name) return null;
            return {
              id,
              name,
              price:
                item.sellingPrice ??
                item.SellingPrice ??
                item.price ??
                item.Price ??
                0,
              stock:
                item.availableStock ??
                item.AvailableStock ??
                item.currentStock ??
                item.CurrentStock ??
                null,
            };
          })
          .filter(Boolean);
        setParts(normalizedParts);
      } catch (err) {
        console.error('Load parts error:', err);
        toast.error('Không thể tải danh sách phụ tùng');
        setParts([]);
      } finally {
        setLoadingParts(false);
      }
    };
    const timer = setTimeout(loadParts, 300);
    return () => clearTimeout(timer);
  }, [searchPart, serviceCenterId]);

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!selectedWO || !partId || quantity < 1) {
      toast.warn('Please select part and quantity.');
      return;
    }
    try {
      const woId = selectedWO.workOrderId || selectedWO.id;
      await apiService.request(
        `/work-orders/${woId}/parts/${partId}?quantity=${quantity}`,
        {
          method: 'POST',
        },
      );
      toast.success('Part added to work order.');
      setPartId('');
      setQuantity(1);
      setSearchPart('');
      await viewWorkOrderDetail(woId);
    } catch (err) {
      console.error('Add part error:', err);
      toast.error('Failed to add part.');
    }
  };

  const fetchOutstanding = useCallback(
    async (workOrderIdOverride, options = {}) => {
      const { silent = false } = options;
      const targetWoId =
        workOrderIdOverride ||
        selectedWO?.workOrderId ||
        selectedWO?.id;

      if (!targetWoId) {
        if (!silent) {
          toast.warn('No work order selected.');
        }
        return null;
      }

      setOutstandingLoading(true);
      try {
        const response = await apiService.request(
          `/work-orders/${targetWoId}/validate-delivery`,
        );
        const payload = response?.data || response;
        const amount = Number(payload?.outstandingAmount) || 0;
        const invoice = payload?.invoiceId ?? null;

        setOutstandingAmount(amount);
        setInvoiceId(invoice);

        if (!silent) {
          if (amount > 0) {
            toast.info(
              `Outstanding: ${amount.toLocaleString('vi-VN')} VND`,
            );
          } else {
            toast.success('Không còn công nợ. Có thể bàn giao xe.');
          }
        }

        return payload;
      } catch (err) {
        console.error('Fetch outstanding error:', err);
        if (!silent) {
          toast.error(
            err.response?.data?.message ||
              err.message ||
              'Failed to fetch outstanding amount.',
          );
        }
        throw err;
      } finally {
        setOutstandingLoading(false);
      }
    },
    [selectedWO],
  );

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!invoiceId || outstandingAmount <= 0) {
      toast.warn('No payment needed or invoice not found.');
      return;
    }
    try {
      const woId = selectedWO?.workOrderId || selectedWO?.id;
      if (!woId) {
        toast.warn('No work order selected.');
        return;
      }

      setPaymentLoading(true);
      await apiService.request('/payments/manual', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId,
          amount: outstandingAmount,
          method: paymentMethod,
          note: 'Thanh toán tại quầy',
        }),
      });

      toast.success('Payment successful.');
      await fetchOutstanding(woId, { silent: true });
      await viewWorkOrderDetail(woId);
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(
        err.response?.data?.message || err.message || 'Payment failed.',
      );
    } finally {
      setPaymentLoading(false);
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
  const displayedWorkOrders = workOrders;

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
              <div className='search-inputs'>
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
                      onChange={(e) => {
                        const newValue = e.target.value ? Number(e.target.value) : null;
                        console.log('[WorkOrders] Service Center changed to:', newValue);
                        setServiceCenterId(newValue);
                      }}
                    >
                      <option value=''>-- Chọn trung tâm --</option>
                      {serviceCenters.map((center, index) => {
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
                        console.log(`[WorkOrders] Rendering option ${index + 1}:`, {
                          centerValue,
                          centerLabel,
                          center
                        });
                        return (
                          <option key={centerValue} value={centerValue}>
                            {centerLabel}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
                <div className='search-input-group'>
                  <label>Ngày</label>
                  <input
                    type='date'
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>
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
              <span className='count-badge'>{displayedWorkOrders.length}</span>
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
                {activeSearchDate && (
                  <>
                    {' '}
                    vào{' '}
                    <strong>
                      {formatVietnamDateTime(`${activeSearchDate}T00:00:00`, {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }) || activeSearchDate}
                    </strong>
                  </>
                )}
              </div>
            )}

            {displayedWorkOrders.length === 0 ? (
              <div className='empty-state'>
                <i className='bi bi-inbox'></i>
                <h3>No Work Orders</h3>
                <p>No work orders have been created yet</p>
              </div>
            ) : (
              <div className='workorders-grid'>
                {displayedWorkOrders.map((wo) => {
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
                            {formatVietnamDateTime(wo.startDate, {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) || 'N/A'}
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
            {totalPages > 1 && (
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
                      {getTechnicianDisplay(selectedWO)}
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
                      <button
                        className='btn-action primary'
                        onClick={() => setShowCandidatesModal(true)}
                      >
                        <i className='bi bi-list-stars'></i>
                        Chọn từ danh sách
                      </button>
                      <select
                        className='select-technician'
                        onChange={(e) => handleManualAssign(e.target.value)}
                        defaultValue=''
                      >
                        <option value='' disabled>
                          Manual Assign...
                        </option>
                        {technicians.map((tech) => {
                          const techValue = tech.userId || tech.technicianId || tech.id;
                          const techLabel = tech.fullName || tech.name || tech.username || `Tech #${techValue}`;
                          return (
                            <option
                              key={techValue}
                              value={techValue}
                            >
                              {techLabel}
                            </option>
                          );
                        })}
                      </select>
                    </>
                  )}

                  {selectedWO.assignedTechnician && selectedWOStatus === 'inprogress' && (
                    <button
                      className='btn-action primary'
                      onClick={() => setShowAddServicesModal(true)}
                    >
                      <i className='bi bi-plus-circle'></i>
                      Thêm dịch vụ
                    </button>
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

                  {selectedWOStatus === 'completed' && (
                    <>
                      <button
                        className='btn-action primary'
                        onClick={() => setDeliveryPaymentModal({ show: true, mode: 'validate' })}
                      >
                        <i className='bi bi-shield-check'></i>
                        Kiểm tra bàn giao
                      </button>
                      <button
                        className='btn-action primary'
                        onClick={() => setDeliveryPaymentModal({ show: true, mode: 'payment' })}
                      >
                        <i className='bi bi-credit-card'></i>
                        Ghi nhận thanh toán
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
                    {checklist.map((item, index) => {
                      const completedLabel = formatVietnamDateTime(
                        item.completedDate,
                      );
                      return (
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
                                {completedLabel ? ` • ${completedLabel}` : ''}
                              </p>
                            )}
                          </div>

                        {!item.isCompleted && selectedWOStatus === 'inprogress' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className='btn-complete-item'
                                onClick={() =>
                                  handleCompleteChecklistItem(item.itemId)
                                }
                                title="Complete this item"
                              >
                                <i className='bi bi-check'></i>
                              </button>
                              {!item.isRequired && (
                                <button
                                  className='btn-skip-item'
                                  onClick={() => handleSkipChecklistItem(item)}
                                  title="Skip this optional item"
                                  style={{
                                    backgroundColor: '#ffc107',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                  }}
                                >
                                  <i className='bi bi-skip-forward'></i> Skip
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                            {formatVietnamDateTime(existingQC.updatedAt) ||
                              'N/A'}
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

              {/* Add Parts & Payment Card */}
              <div className='detail-card'>
                <div className='card-header-detail'>
                  <h2>Add Service, Parts & Payment</h2>
                </div>
                <div className='card-body-detail'>
                  {/* Add Service Section */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Add Service</h3>
                    <button
                      className='btn-action primary'
                      onClick={() => setShowAddServicesModal(true)}
                      style={{ width: '100%' }}
                    >
                      <i className='bi bi-plus-circle'></i> Add Service to Work Order
                    </button>
                  </div>

                  {/* Add Part Section */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Add Part</h3>
                    <form onSubmit={handleAddPart}>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Search Part</label>
                        <input
                          type='text'
                          value={searchPart}
                          onChange={(e) => setSearchPart(e.target.value)}
                          placeholder='Lọc theo tên phụ tùng...'
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Part</label>
                        <select
                          value={partId}
                          onChange={(e) => setPartId(e.target.value)}
                          disabled={loadingParts}
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value=''>-- Select part --</option>
                          {parts.map((part) => (
                            <option key={part.id} value={part.id}>
                              {part.name}
                              {typeof part.stock === 'number' ? ` • Tồn: ${part.stock}` : ''}
                              {' - '}
                              {(part.price || 0).toLocaleString('vi-VN')} VND
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Quantity</label>
                        <input
                          type='number'
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          min='1'
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <button type='submit' className='btn-action primary' style={{ width: '100%' }}>
                        <i className='bi bi-plus-lg'></i> Add Part
                      </button>
                    </form>
                  </div>

                  {/* Payment Section */}
                  <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Counter Payment</h3>
                    <button
                      className='btn-action secondary'
                      onClick={() => fetchOutstanding()}
                      disabled={outstandingLoading}
                      style={{ width: '100%', marginBottom: '12px' }}
                    >
                      {outstandingLoading ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2'></span>
                          Đang kiểm tra...
                        </>
                      ) : (
                        <>
                          <i className='bi bi-calculator'></i> Fetch Outstanding Amount
                        </>
                      )}
                    </button>
                    {outstandingAmount > 0 && invoiceId && (
                      <form onSubmit={handlePayment}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Outstanding Amount</label>
                          <input
                            type='text'
                            value={`${outstandingAmount.toLocaleString()} VND`}
                            disabled
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', background: '#e9ecef' }}
                          />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                          >
                            <option value='Cash'>Cash</option>
                            <option value='BankTransfer'>Bank Transfer</option>
                          </select>
                        </div>
                        <button
                          type='submit'
                          className='btn-action success'
                          style={{ width: '100%' }}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? (
                            <>
                              <span className='spinner-border spinner-border-sm me-2'></span>
                              Đang thanh toán...
                            </>
                          ) : (
                            <>
                              <i className='bi bi-credit-card'></i> Process Payment
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Technician Candidates Modal */}
      <TechnicianCandidatesModal
        show={showCandidatesModal}
        onClose={() => setShowCandidatesModal(false)}
        onSelect={(tech) => {
          const techId = tech.userId || tech.technicianId || tech.id;
          console.log('[WorkOrders] Selected tech from modal:', tech, 'Using ID:', techId);
          handleManualAssign(techId);
          setShowCandidatesModal(false);
        }}
        workOrder={selectedWO}
        serviceCenterId={serviceCenterId}
      />

      {/* Add Services Modal */}
      <AddServicesModal
        show={showAddServicesModal}
        onClose={() => setShowAddServicesModal(false)}
        onSuccess={() => {
          viewWorkOrderDetail(selectedWO?.workOrderId || selectedWO?.id);
        }}
        appointment={selectedWO}
      />

      {/* Delivery & Payment Modal */}
      <DeliveryPaymentModal
        show={deliveryPaymentModal.show}
        onClose={() => setDeliveryPaymentModal({ show: false, mode: 'validate' })}
        onSuccess={() => {
          viewWorkOrderDetail(selectedWO?.workOrderId || selectedWO?.id);
        }}
        workOrder={selectedWO}
        mode={deliveryPaymentModal.mode}
      />

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
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-inputs {
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
          flex-direction: column;
          gap: 12px;
        }

        .btn-action {
          padding: 12px 20px;
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
          width: 100%;
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
          padding: 12px 16px;
          border: 2px solid #1a1a1a;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          background: #1a1a1a;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: center;
        }

        .select-technician:focus,
        .select-template:focus {
          outline: none;
          border-color: #333;
          background: #333;
        }

        .select-technician option,
        .select-template option {
          background: white;
          color: #1a1a1a;
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
