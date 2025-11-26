import React, { useEffect, useMemo, useState } from "react";
import {
  vehicleAPI,
  carBrandAPI,
  carModelAPI,
  customerAPI,
  handleApiError,
} from "../../services/adminAPI";

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  totalPages: 0,
  totalCount: 0,
};

const unwrapPayload = (value, depth = 0) => {
  if (value == null || depth > 4) return value;
  if (Array.isArray(value)) return value;
  if (typeof value !== "object") return value;
  const unwrapKeys = ["data", "Data", "payload", "Payload", "result", "Result"];
  for (const key of unwrapKeys) {
    if (value[key] !== undefined) return unwrapPayload(value[key], depth + 1);
  }
  if (value.items !== undefined) return unwrapPayload(value.items, depth + 1);
  if (value.Items !== undefined) return unwrapPayload(value.Items, depth + 1);
  return value;
};

const normalizePagedVehicles = (response) => {
  const payload = unwrapPayload(response) ?? {};
  const rawItems =
    payload.items ??
    payload.Items ??
    payload.data ??
    payload.Data ??
    (Array.isArray(payload) ? payload : []);
  const items = Array.isArray(rawItems) ? rawItems : [];
  const toNum = (v, fb) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
  };
  const page = toNum(
    payload.page ??
      payload.Page ??
      payload.pageNumber ??
      payload.PageNumber ??
      payload.currentPage ??
      payload.CurrentPage,
    DEFAULT_PAGINATION.page
  );
  const pageSize = toNum(
    payload.pageSize ?? payload.PageSize ?? payload.limit ?? payload.Limit,
    DEFAULT_PAGINATION.pageSize
  );
  const totalCount = toNum(
    payload.totalCount ??
      payload.TotalCount ??
      payload.totalItems ??
      payload.TotalItems ??
      payload.count ??
      payload.Count ??
      items.length,
    items.length
  );
  const totalPages = (() => {
    const raw = toNum(
      payload.totalPages ??
        payload.TotalPages ??
        payload.pageCount ??
        payload.PageCount,
      0
    );
    if (raw > 0) return Math.trunc(raw);
    if (totalCount === 0) return 0;
    return Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)));
  })();
  return { items, page, pageSize, totalPages, totalCount };
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("vi-VN");
};

const formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

const numberFrom = (obj, keys, fallback = null) => {
  for (const key of keys) {
    const value = obj?.[key];
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(null);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [filters, setFilters] = useState({
    searchTerm: "",
    tab: "all", // all | maintenance | normal
    status: "all", // all | active | inactive
    brandId: "",
    modelId: "",
    customerId: "",
    sortBy: "LicensePlate",
    sortOrder: "asc",
  });

  const [pagination, setPagination] = useState({ ...DEFAULT_PAGINATION });

  const [modalMode, setModalMode] = useState(null); // create | edit | view | mileage
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [healthLatest, setHealthLatest] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: null,
    customerId: "",
    modelId: "",
    licensePlate: "",
    vin: "",
    color: "",
    purchaseDate: "",
    mileage: "",
    lastMaintenanceDate: "",
    nextMaintenanceDate: "",
    lastMaintenanceMileage: "",
    nextMaintenanceMileage: "",
    batteryHealthPercent: "",
    vehicleCondition: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    registrationExpiry: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    loadBrands();
    loadCustomers();
    fetchStats();
  }, []);

  useEffect(() => {
    loadModels(filters.brandId);
  }, [filters.brandId]);

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.searchTerm,
    filters.tab,
    filters.status,
    filters.brandId,
    filters.modelId,
    filters.customerId,
    filters.sortBy,
    filters.sortOrder,
    pagination.page,
    pagination.pageSize,
  ]);

  const loadBrands = async () => {
    try {
      const response = await carBrandAPI.getAll();
      const payload = unwrapPayload(response);
      const items = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];
      setBrands(items);
    } catch (err) {
      console.warn("Could not load brands", err);
    }
  };

  const loadModels = async (brandId) => {
    try {
      const params = brandId ? { brandId } : undefined;
      const response = await carModelAPI.getAll(params);
      const payload = unwrapPayload(response);
      const items = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];
      setModels(items);
    } catch (err) {
      console.warn("Could not load models", err);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll({ page: 1, pageSize: 200 });
      const payload = unwrapPayload(response);
      const items = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];
      setCustomers(items);
    } catch (err) {
      console.warn("Could not load customers", err);
    }
  };

  const resetDetailData = () => {
    setVehicleStats(null);
    setMaintenanceStatus(null);
    setMaintenanceHistory([]);
    setHealthLatest(null);
  };

  const fetchStats = async () => {
    try {
      const response = await vehicleAPI.getStatistics();
      const payload = unwrapPayload(response) ?? {};
      setStats({
        total:
          Number(
            payload.totalVehicles ??
              payload.TotalVehicles ??
              payload.totalCount ??
              payload.TotalCount
          ) || 0,
        maintenanceDue:
          Number(
            payload.maintenanceDueVehicles ??
              payload.MaintenanceDueVehicles ??
              payload.maintenanceDue ??
              payload.MaintenanceDue
          ) || 0,
        active:
          Number(
            payload.activeVehicles ??
              payload.ActiveVehicles ??
              payload.activeCount ??
              payload.ActiveCount
          ) || 0,
        inactive:
          Number(
            payload.inactiveVehicles ??
              payload.InactiveVehicles ??
              payload.inactiveCount ??
              payload.InactiveCount
          ) || 0,
      });
    } catch (err) {
      console.warn("Could not load vehicle stats", err);
    }
  };

  const mapVehicle = (item) => {
    const vehicleId =
      item?.vehicleId ?? item?.VehicleId ?? item?.id ?? item?.Id;
    const brandId = item?.brandId ?? item?.BrandId ?? null;
    const modelId = item?.modelId ?? item?.ModelId ?? null;
    const maintenanceDue =
      item?.maintenanceDue ?? item?.MaintenanceDue ?? false;
    const isActive = item?.isActive ?? item?.IsActive ?? true;
    const brandName =
      item?.brandName ??
      item?.BrandName ??
      brands.find((b) => (b.brandId ?? b.BrandId) === brandId)?.brandName ??
      brands.find((b) => (b.brandId ?? b.BrandId) === brandId)?.BrandName ??
      "N/A";
    const modelName =
      item?.modelName ??
      item?.ModelName ??
      models.find((m) => (m.modelId ?? m.ModelId) === modelId)?.modelName ??
      models.find((m) => (m.modelId ?? m.ModelId) === modelId)?.ModelName ??
      "N/A";

    const lastMaintenanceDate =
      item?.lastMaintenanceDate ??
      item?.LastMaintenanceDate ??
      item?.lastServiceDate;
    const nextMaintenanceDate =
      item?.nextMaintenanceDate ??
      item?.NextMaintenanceDate ??
      item?.nextServiceDate;

    const customerName =
      item?.customerName ??
      item?.CustomerName ??
      item?.customer?.fullName ??
      item?.Customer?.FullName ??
      customers.find(
        (c) =>
          (c.customerId ?? c.CustomerId ?? c.id ?? c.Id) ===
          (item?.customerId ?? item?.CustomerId)
      )?.fullName ??
      customers.find(
        (c) =>
          (c.customerId ?? c.CustomerId ?? c.id ?? c.Id) ===
          (item?.customerId ?? item?.CustomerId)
      )?.FullName ??
      "Khong ten";

    return {
      id: vehicleId ?? `vehicle-${modelId ?? Math.random()}`,
      vehicleId,
      customerName,
      brandId,
      modelId,
      brandName,
      modelName,
      licensePlate: item?.licensePlate ?? item?.LicensePlate ?? "N/A",
      vin: item?.vin ?? item?.VIN ?? item?.Vin ?? "",
      mileage: item?.mileage ?? item?.Mileage ?? 0,
      batteryHealthPercent:
        item?.batteryHealthPercent ?? item?.BatteryHealthPercent ?? null,
      maintenanceDue,
      isActive,
      lastMaintenanceDate,
      nextMaintenanceDate,
      nextMaintenanceMileage:
        item?.nextMaintenanceMileage ?? item?.NextMaintenanceMileage,
      lastMaintenanceMileage:
        item?.lastMaintenanceMileage ?? item?.LastMaintenanceMileage,
      vehicleCondition: item?.vehicleCondition ?? item?.VehicleCondition,
      insuranceNumber: item?.insuranceNumber ?? item?.InsuranceNumber,
      insuranceExpiry: item?.insuranceExpiry ?? item?.InsuranceExpiry,
      registrationExpiry: item?.registrationExpiry ?? item?.RegistrationExpiry,
      notes: item?.notes ?? item?.Notes,
    };
  };

  const fetchVehicles = async () => {
    setLoading(true);
    setError("");
    const params = {
      includeStats: true,
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    if (filters.searchTerm.trim())
      params.searchTerm = filters.searchTerm.trim();
    if (filters.tab === "maintenance") {
      params.maintenanceDue = true;
    } else if (filters.tab === "normal") {
      params.maintenanceDue = false;
      params.isActive = true;
    }
    if (filters.status === "active") params.isActive = true;
    else if (filters.status === "inactive") params.isActive = false;
    if (filters.brandId) params.brandId = filters.brandId;
    if (filters.modelId) params.modelId = filters.modelId;
    if (filters.customerId) params.customerId = filters.customerId;

    try {
      const response = await vehicleAPI.getAll(params);
      const paged = normalizePagedVehicles(response);
      const mapped = paged.items.map(mapVehicle);
      setVehicles(mapped);
      setPagination((prev) => ({
        ...prev,
        page: paged.page,
        pageSize: paged.pageSize,
        totalPages: paged.totalPages,
        totalCount: paged.totalCount,
      }));
    } catch (err) {
      setError(handleApiError(err));
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setFilters((prev) => ({ ...prev, searchTerm: event.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleTabChange = (tab) => {
    setFilters((prev) => ({ ...prev, tab }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleStatusChange = (event) => {
    setFilters((prev) => ({ ...prev, status: event.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleBrandChange = (event) => {
    const value = event.target.value;
    setFilters((prev) => ({ ...prev, brandId: value, modelId: "" }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleCustomerChange = (event) => {
    setFilters((prev) => ({ ...prev, customerId: event.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleModelChange = (event) => {
    setFilters((prev) => ({ ...prev, modelId: event.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleSortChange = (event) => {
    const [sortBy, sortOrder] = event.target.value.split(":");
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handlePageChange = (page) => {
    const nextPage = Number(page);
    if (
      Number.isFinite(nextPage) &&
      nextPage >= 1 &&
      nextPage <= Math.max(1, pagination.totalPages || 1)
    ) {
      setPagination((prev) => ({ ...prev, page: nextPage }));
    }
  };

  const openMileageModal = (vehicle) => {
    setModalError("");
    resetDetailData();
    setActiveVehicle(vehicle);
    setFormData((prev) => ({
      ...prev,
      vehicleId: vehicle.vehicleId,
      mileage: vehicle.mileage ?? "",
    }));
    setModalMode("mileage");
  };
  const openCreateModal = () => {
    setModalError("");
    resetDetailData();
    setActiveVehicle(null);
    setFormData({
      vehicleId: null,
      customerId: "",
      modelId: "",
      licensePlate: "",
      vin: "",
      color: "",
      purchaseDate: "",
      mileage: "",
      lastMaintenanceDate: "",
      nextMaintenanceDate: "",
      lastMaintenanceMileage: "",
      nextMaintenanceMileage: "",
      batteryHealthPercent: "",
      vehicleCondition: "",
      insuranceNumber: "",
      insuranceExpiry: "",
      registrationExpiry: "",
      notes: "",
      isActive: true,
    });
    setModalMode("create");
  };
  const loadVehicleDetail = async (vehicleId, nextMode) => {
    try {
      setModalError("");
      setIsSubmitting(true);
      resetDetailData();
      const response = await vehicleAPI.getById(vehicleId);
      const payload = unwrapPayload(response) ?? {};
      setActiveVehicle(payload);
      setFormData((prev) => ({
        ...prev,
        vehicleId: payload.vehicleId ?? payload.VehicleId ?? vehicleId,
        customerId: payload.customerId ?? payload.CustomerId ?? "",
        modelId: payload.modelId ?? payload.ModelId ?? "",
        licensePlate: payload.licensePlate ?? payload.LicensePlate ?? "",
        vin: payload.vin ?? payload.VIN ?? payload.Vin ?? "",
        color: payload.color ?? "",
        purchaseDate: payload.purchaseDate ?? "",
        mileage: payload.mileage ?? "",
        lastMaintenanceDate:
          payload.lastMaintenanceDate ?? payload.LastMaintenanceDate ?? "",
        nextMaintenanceDate:
          payload.nextMaintenanceDate ?? payload.NextMaintenanceDate ?? "",
        lastMaintenanceMileage:
          payload.lastMaintenanceMileage ??
          payload.LastMaintenanceMileage ??
          "",
        nextMaintenanceMileage:
          payload.nextMaintenanceMileage ??
          payload.NextMaintenanceMileage ??
          "",
        batteryHealthPercent:
          payload.batteryHealthPercent ?? payload.BatteryHealthPercent ?? "",
        vehicleCondition:
          payload.vehicleCondition ?? payload.VehicleCondition ?? "",
        insuranceNumber: payload.insuranceNumber ?? "",
        insuranceExpiry: payload.insuranceExpiry ?? "",
        registrationExpiry: payload.registrationExpiry ?? "",
        notes: payload.notes ?? "",
        isActive: payload.isActive ?? payload.IsActive ?? true,
      }));
      const resolvedVehicleId =
        payload.vehicleId ?? payload.VehicleId ?? vehicleId;
      if (resolvedVehicleId) {
        const detailResults = await Promise.allSettled([
          vehicleAPI.getStatisticsByVehicle(resolvedVehicleId),
          vehicleAPI.getMaintenanceStatus(resolvedVehicleId),
          vehicleAPI.getMaintenanceHistory(resolvedVehicleId),
          vehicleAPI.getHealthLatest(resolvedVehicleId),
        ]);
        const [statsRes, statusRes, historyRes, healthRes] = detailResults;
        if (statsRes.status === "fulfilled") {
          setVehicleStats(unwrapPayload(statsRes.value) ?? null);
        }
        if (statusRes.status === "fulfilled") {
          setMaintenanceStatus(unwrapPayload(statusRes.value) ?? null);
        }
        if (historyRes.status === "fulfilled") {
          const historyPayload = unwrapPayload(historyRes.value);
          const historyItems = Array.isArray(historyPayload?.items)
            ? historyPayload.items
            : Array.isArray(historyPayload)
            ? historyPayload
            : [];
          setMaintenanceHistory(historyItems);
        }
        if (healthRes.status === "fulfilled") {
          setHealthLatest(unwrapPayload(healthRes.value) ?? null);
        }
      }
      setModalMode(nextMode);
    } catch (err) {
      setModalError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  const openEditModal = (vehicle) =>
    vehicle?.vehicleId && loadVehicleDetail(vehicle.vehicleId, "edit");
  const openViewModal = (vehicle) =>
    vehicle?.vehicleId && loadVehicleDetail(vehicle.vehicleId, "view");
  const closeModal = () => {
    setModalMode(null);
    setModalError("");
    setActiveVehicle(null);
    resetDetailData();
    setIsSubmitting(false);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = (data) => {
    const numberOrNull = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    return {
      vehicleId: data.vehicleId || undefined,
      customerId: numberOrNull(data.customerId),
      modelId: numberOrNull(data.modelId),
      licensePlate: data.licensePlate?.trim() || null,
      vin: data.vin?.trim() || null,
      color: data.color?.trim() || null,
      purchaseDate: data.purchaseDate || null,
      mileage: numberOrNull(data.mileage),
      lastMaintenanceDate: data.lastMaintenanceDate || null,
      nextMaintenanceDate: data.nextMaintenanceDate || null,
      lastMaintenanceMileage: numberOrNull(data.lastMaintenanceMileage),
      nextMaintenanceMileage: numberOrNull(data.nextMaintenanceMileage),
      batteryHealthPercent: numberOrNull(data.batteryHealthPercent),
      vehicleCondition: data.vehicleCondition || null,
      insuranceNumber: data.insuranceNumber?.trim() || null,
      insuranceExpiry: data.insuranceExpiry || null,
      registrationExpiry: data.registrationExpiry || null,
      notes: data.notes?.trim() || null,
      isActive: !!data.isActive,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setModalError("");
    setIsSubmitting(true);
    try {
      const payload = buildPayload(formData);
      if (!payload.customerId || !payload.modelId || !payload.licensePlate) {
        setModalError("Vui long nhap CustomerId, ModelId va Bien so.");
        setIsSubmitting(false);
        return;
      }
      if (modalMode === "create") {
        await vehicleAPI.create(payload);
        setFeedback("Tao xe thanh cong.");
      } else if (modalMode === "edit" && payload.vehicleId) {
        await vehicleAPI.update(payload.vehicleId, payload);
        setFeedback("Cap nhat xe thanh cong.");
      }
      closeModal();
      fetchStats();
      fetchVehicles();
    } catch (err) {
      setModalError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!vehicle?.vehicleId) return;
    setIsSubmitting(true);
    setModalError("");
    try {
      const canDeleteRes = await vehicleAPI.canDelete(vehicle.vehicleId);
      const unwrapped = unwrapPayload(canDeleteRes);
      const allow = unwrapped?.canDelete ?? unwrapped?.CanDelete ?? true;
      if (!allow) {
        setModalError(
          unwrapped?.reason ?? unwrapped?.Reason ?? "Xe khong the xoa."
        );
        setIsSubmitting(false);
        return;
      }
      await vehicleAPI.delete(vehicle.vehicleId);
      setFeedback("Xoa xe thanh cong.");
      fetchStats();
      fetchVehicles();
    } catch (err) {
      setModalError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMileageUpdate = async (event) => {
    event.preventDefault();
    if (!activeVehicle?.vehicleId) return;
    setIsSubmitting(true);
    setModalError("");
    try {
      const mileageNumber = Number(formData.mileage);
      if (!Number.isFinite(mileageNumber)) {
        setModalError("Vui long nhap so km hop le.");
        setIsSubmitting(false);
        return;
      }
      await vehicleAPI.updateMileage(activeVehicle.vehicleId, {
        mileage: mileageNumber,
      });
      setFeedback("Cap nhat so km thanh cong.");
      closeModal();
      fetchVehicles();
    } catch (err) {
      setModalError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  const pageSummary = useMemo(() => {
    if (pagination.totalCount === 0) {
      return {
        start: vehicles.length ? 1 : 0,
        end: vehicles.length,
        total: vehicles.length,
      };
    }
    const start =
      (pagination.page - 1) * pagination.pageSize + (vehicles.length ? 1 : 0);
    const end = (pagination.page - 1) * pagination.pageSize + vehicles.length;
    return {
      start: Math.max(0, start),
      end: Math.max(start, end),
      total: pagination.totalCount,
    };
  }, [pagination, vehicles.length]);

  const derivedStats = useMemo(() => {
    const fallbackTotal =
      stats?.total ?? pagination.totalCount ?? vehicles.length;
    const maintenanceCount =
      stats?.maintenanceDue ??
      vehicles.filter((v) => v.maintenanceDue === true).length;
    const activeCount =
      stats?.active ?? vehicles.filter((v) => v.isActive === true).length;
    const inactiveCount =
      stats?.inactive ?? vehicles.filter((v) => v.isActive === false).length;
    return {
      total: fallbackTotal || 0,
      maintenanceDue: maintenanceCount || 0,
      normal: Math.max(0, (fallbackTotal || 0) - (maintenanceCount || 0)),
      active: activeCount || 0,
      inactive: inactiveCount || 0,
    };
  }, [stats, pagination.totalCount, vehicles]);

  const maintenanceHistorySorted = Array.isArray(maintenanceHistory)
    ? [...maintenanceHistory].sort((a, b) => {
        const toTime = (item) => {
          const raw =
            item?.serviceDate ??
            item?.ServiceDate ??
            item?.maintenanceDate ??
            item?.MaintenanceDate ??
            item?.date ??
            item?.Date;
          const d = new Date(raw);
          return Number.isNaN(d.getTime()) ? 0 : d.getTime();
        };
        return toTime(b) - toTime(a);
      })
    : [];
  const latestMaintenance =
    maintenanceHistorySorted.length > 0 ? maintenanceHistorySorted[0] : null;
  const maintenanceNextDate =
    maintenanceStatus?.nextMaintenanceDate ??
    maintenanceStatus?.NextMaintenanceDate ??
    maintenanceStatus?.dueDate ??
    maintenanceStatus?.DueDate ??
    null;
  const maintenanceNextMileage =
    maintenanceStatus?.nextMaintenanceMileage ??
    maintenanceStatus?.NextMaintenanceMileage ??
    maintenanceStatus?.dueMileage ??
    maintenanceStatus?.DueMileage ??
    null;
  const maintenanceRemainingKm =
    maintenanceStatus?.remainingMileage ??
    maintenanceStatus?.RemainingMileage ??
    maintenanceStatus?.kmRemaining ??
    maintenanceStatus?.KmRemaining ??
    null;
  const vehicleServiceCount = numberFrom(
    vehicleStats,
    [
      "totalServices",
      "TotalServices",
      "serviceCount",
      "ServiceCount",
      "services",
      "Services",
    ],
    null
  );
  const vehicleWorkOrders = numberFrom(
    vehicleStats,
    ["workOrders", "WorkOrders", "workOrderCount", "WorkOrderCount"],
    null
  );
  const vehicleAppointments = numberFrom(
    vehicleStats,
    ["appointments", "Appointments", "appointmentCount", "AppointmentCount"],
    null
  );
  const vehicleMaintenanceDue = numberFrom(
    vehicleStats,
    [
      "maintenanceDue",
      "MaintenanceDue",
      "maintenanceDueCount",
      "MaintenanceDueCount",
    ],
    null
  );
  const batteryHealthLatest =
    healthLatest?.batteryHealthPercent ??
    healthLatest?.BatteryHealthPercent ??
    null;
  const healthCheckedAt =
    healthLatest?.recordedAt ??
    healthLatest?.RecordedAt ??
    healthLatest?.createdAt ??
    healthLatest?.CreatedAt ??
    null;
  const sortOptions = [
    { label: "Bien so (A-Z)", value: "LicensePlate:asc" },
    { label: "Bien so (Z-A)", value: "LicensePlate:desc" },
    { label: "Km cao -> thap", value: "Mileage:desc" },
    { label: "Km thap -> cao", value: "Mileage:asc" },
    { label: "Pin cao -> thap", value: "BatteryHealthPercent:desc" },
    { label: "Pin thap -> cao", value: "BatteryHealthPercent:asc" },
  ];

  const batteryColor = (percent) => {
    if (percent == null) return "#6c757d";
    if (percent >= 90) return "#2ecc71";
    if (percent >= 70) return "#f1c40f";
    return "#e74c3c";
  };

  return (
    <div className="vehicle-management">
      <div className="section-header">
        <div>
          <h2>Quan ly Xe Dien</h2>
          <p className="subtitle">
            Theo doi tinh trang xe, bao duong, suc khoe pin.
          </p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      ) : null}

      <div className="filters">
        <div className="search-box">
          <i className="bi bi-search" />
          <input
            type="text"
            placeholder="Tim theo khach hang, bien so, model..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <select value={filters.status} onChange={handleStatusChange}>
          <option value="all">Tat ca trang thai</option>
          <option value="active">Dang hoat dong</option>
          <option value="inactive">Da vo hieu</option>
        </select>
        <select value={filters.customerId} onChange={handleCustomerChange}>
          <option value="">Tat ca khach hang</option>
          {customers.map((customer) => (
            <option
              key={
                customer.customerId ??
                customer.CustomerId ??
                customer.id ??
                customer.Id
              }
              value={
                customer.customerId ??
                customer.CustomerId ??
                customer.id ??
                customer.Id
              }
            >
              {customer.fullName ?? customer.FullName ?? customer.name}
            </option>
          ))}
        </select>
        <select value={filters.brandId} onChange={handleBrandChange}>
          <option value="">Tat ca hang</option>
          {brands.map((brand) => (
            <option
              key={brand.brandId ?? brand.BrandId}
              value={brand.brandId ?? brand.BrandId}
            >
              {brand.brandName ?? brand.BrandName}
            </option>
          ))}
        </select>
        <select
          value={filters.modelId}
          onChange={handleModelChange}
          disabled={!filters.brandId && models.length === 0}
        >
          <option value="">Tat ca model</option>
          {models.map((model) => (
            <option
              key={model.modelId ?? model.ModelId}
              value={model.modelId ?? model.ModelId}
            >
              {model.modelName ?? model.ModelName}
            </option>
          ))}
        </select>
        <select
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={handleSortChange}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="tabs">
        {[
          { key: "all", label: "Tat ca" },
          { key: "maintenance", label: "Can bao duong" },
          { key: "normal", label: "Binh thuong" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${filters.tab === tab.key ? "active" : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="bi bi-car-front-fill" />
          </div>
          <div>
            <h3>{formatNumber(derivedStats.total)}</h3>
            <p>Tong so xe</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="bi bi-tools" />
          </div>
          <div>
            <h3>{formatNumber(derivedStats.maintenanceDue)}</h3>
            <p>Can bao duong</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <i className="bi bi-check-circle-fill" />
          </div>
          <div>
            <h3>{formatNumber(derivedStats.normal)}</h3>
            <p>Binh thuong</p>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">
            <i className="bi bi-activity" />
          </div>
          <div>
            <h3>{formatNumber(derivedStats.active)}</h3>
            <p>Dang hoat dong</p>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Danh sach xe</h3>
            <p>
              Hien thi {formatNumber(pageSummary.start)}-
              {formatNumber(pageSummary.end)} /{" "}
              {formatNumber(pageSummary.total)} xe
            </p>
          </div>
          <div className="table-actions">
            <button className="primary-btn" onClick={openCreateModal}>
              <i className="bi bi-plus-circle me-2" />
              Them xe moi
            </button>
            {feedback ? (
              <span className="text-success ms-2">{feedback}</span>
            ) : null}
          </div>
        </div>

        <div className={`table-wrapper${loading ? " is-loading" : ""}`}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Khach hang</th>
                <th>Hang / Model</th>
                <th>Bien so</th>
                <th>Lan bao duong cuoi</th>
                <th>Bao duong tiep theo</th>
                <th>Km hien tai</th>
                <th>Pin</th>
                <th>Trang thai</th>
                <th>Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted">
                    <div className="loading-spinner" />
                    Dang tai du lieu xe...
                  </td>
                </tr>
              ) : vehicles.length ? (
                vehicles.map((vehicle, idx) => (
                  <tr key={vehicle.id ?? idx}>
                    <td>
                      {(pagination.page - 1) * pagination.pageSize + idx + 1}
                    </td>
                    <td>
                      <div className="cell-title">{vehicle.customerName}</div>
                      <small className="muted-text">
                        {vehicle.vin || "Khong co VIN"}
                      </small>
                    </td>
                    <td>
                      <div className="cell-title">
                        {vehicle.brandName} / {vehicle.modelName}
                      </div>
                      <small className="muted-text">
                        Model ID: {vehicle.modelId || "N/A"}
                      </small>
                    </td>
                    <td>
                      <span className="license-plate">
                        {vehicle.licensePlate}
                      </span>
                    </td>
                    <td>{formatDate(vehicle.lastMaintenanceDate)}</td>
                    <td>{formatDate(vehicle.nextMaintenanceDate)}</td>
                    <td>{formatNumber(vehicle.mileage)} km</td>
                    <td>
                      {vehicle.batteryHealthPercent != null ? (
                        <div className="battery-cell">
                          <div
                            className="battery-bar"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, vehicle.batteryHealthPercent)
                              )}%`,
                              backgroundColor: batteryColor(
                                vehicle.batteryHealthPercent
                              ),
                            }}
                          />
                          <span>{vehicle.batteryHealthPercent}%</span>
                        </div>
                      ) : (
                        <span className="muted-text">N/A</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          vehicle.maintenanceDue
                            ? "warning"
                            : vehicle.isActive
                            ? "success"
                            : "inactive"
                        }`}
                      >
                        {vehicle.maintenanceDue
                          ? "Can bao duong"
                          : vehicle.isActive
                          ? "Binh thuong"
                          : "Da vo hieu"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          title="Xem chi tiet"
                          onClick={() => openViewModal(vehicle)}
                          disabled={isSubmitting}
                        >
                          <i className="bi bi-eye" />
                        </button>
                        <button
                          className="btn-edit"
                          title="Chinh sua"
                          onClick={() => openEditModal(vehicle)}
                          disabled={isSubmitting}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn-edit"
                          title="Cap nhat so km"
                          onClick={() => openMileageModal(vehicle)}
                          disabled={isSubmitting}
                        >
                          <i className="bi bi-speedometer2" />
                        </button>
                        <button
                          className="btn-delete"
                          title="Xoa xe"
                          onClick={() => handleDelete(vehicle)}
                          disabled={isSubmitting}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center text-muted">
                    <i className="bi bi-inbox display-6 d-block mb-2" />
                    Khong tim thay xe phu hop bo loc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading ? (
            <div className="table-loading-overlay" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton-row">
                  <span className="skeleton-block skeleton-block--wide" />
                  <span className="skeleton-block skeleton-block--medium" />
                  <span className="skeleton-block skeleton-block--narrow" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {Math.max(1, pagination.totalPages || 0) > 1 && (
          <div className="pagination">
            <div className="page-info">
              Trang {formatNumber(pagination.page)} /{" "}
              {formatNumber(Math.max(1, pagination.totalPages || 1))}
            </div>
            <div className="page-controls">
              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <i className="bi bi-chevron-left" />
              </button>
              {[...Array(Math.max(1, pagination.totalPages || 1))].map(
                (_, idx) => (
                  <button
                    key={idx + 1}
                    className={`page-btn ${
                      pagination.page === idx + 1 ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(idx + 1)}
                    disabled={pagination.page === idx + 1}
                  >
                    {idx + 1}
                  </button>
                )
              )}
              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={
                  pagination.page >= Math.max(1, pagination.totalPages || 1)
                }
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalMode ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h4>
                {modalMode === "create"
                  ? "Them xe moi"
                  : modalMode === "edit"
                  ? "Chinh sua xe"
                  : modalMode === "mileage"
                  ? "Cap nhat so km"
                  : "Chi tiet xe"}
              </h4>
              <button
                className="btn-close"
                onClick={closeModal}
                aria-label="Dong"
              >
                x
              </button>
            </div>

            {modalError ? (
              <div className="alert alert-warning" role="alert">
                {modalError}
              </div>
            ) : null}

            {modalMode === "view" ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <strong>Khach hang:</strong>{" "}
                    {activeVehicle?.customerName ?? "N/A"}
                  </div>
                  <div>
                    <strong>Bien so:</strong>{" "}
                    {activeVehicle?.licensePlate ?? "N/A"}
                  </div>
                  <div>
                    <strong>Hang/Model:</strong>{" "}
                    {activeVehicle?.brandName ?? "N/A"} /{" "}
                    {activeVehicle?.modelName ?? "N/A"}
                  </div>
                  <div>
                    <strong>VIN:</strong> {activeVehicle?.vin ?? "N/A"}
                  </div>
                  <div>
                    <strong>Mileage:</strong>{" "}
                    {formatNumber(activeVehicle?.mileage)} km
                  </div>
                  <div>
                    <strong>Pin:</strong>{" "}
                    {activeVehicle?.batteryHealthPercent ?? "N/A"}%
                  </div>
                  <div>
                    <strong>Lan bao duong cuoi:</strong>{" "}
                    {formatDate(activeVehicle?.lastMaintenanceDate)}
                  </div>
                  <div>
                    <strong>Bao duong tiep theo:</strong>{" "}
                    {formatDate(activeVehicle?.nextMaintenanceDate)}
                  </div>
                  <div>
                    <strong>Bao hiem:</strong>{" "}
                    {activeVehicle?.insuranceNumber ?? "N/A"} -{" "}
                    {formatDate(activeVehicle?.insuranceExpiry)}
                  </div>
                  <div>
                    <strong>Dang kiem:</strong>{" "}
                    {formatDate(activeVehicle?.registrationExpiry)}
                  </div>
                  <div>
                    <strong>Ghi chu:</strong> {activeVehicle?.notes ?? "N/A"}
                  </div>
                </div>

                {vehicleStats ||
                maintenanceStatus ||
                latestMaintenance ||
                healthLatest ? (
                  <div className="detail-section">
                    {vehicleStats ? (
                      <div className="detail-subcard">
                        <h5>Thong ke xe</h5>
                        <div className="detail-grid compact">
                          <div>
                            <strong>Dich vu:</strong>{" "}
                            {vehicleServiceCount != null
                              ? formatNumber(vehicleServiceCount)
                              : "N/A"}
                          </div>
                          <div>
                            <strong>Work orders:</strong>{" "}
                            {vehicleWorkOrders != null
                              ? formatNumber(vehicleWorkOrders)
                              : "N/A"}
                          </div>
                          <div>
                            <strong>Lich hen:</strong>{" "}
                            {vehicleAppointments != null
                              ? formatNumber(vehicleAppointments)
                              : "N/A"}
                          </div>
                          <div>
                            <strong>So lan can bao duong:</strong>{" "}
                            {vehicleMaintenanceDue != null
                              ? formatNumber(vehicleMaintenanceDue)
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {maintenanceStatus || latestMaintenance ? (
                      <div className="detail-subcard">
                        <h5>Tinh trang bao duong</h5>
                        <div className="detail-grid compact">
                          <div>
                            <strong>Lan gan nhat:</strong>{" "}
                            {formatDate(
                              latestMaintenance?.serviceDate ??
                                latestMaintenance?.maintenanceDate ??
                                latestMaintenance?.date ??
                                activeVehicle?.lastMaintenanceDate
                            )}
                          </div>
                          <div>
                            <strong>Km lan gan nhat:</strong>{" "}
                            {formatNumber(
                              latestMaintenance?.mileage ??
                                latestMaintenance?.maintenanceMileage ??
                                latestMaintenance?.serviceMileage ??
                                activeVehicle?.lastMaintenanceMileage
                            )}{" "}
                            km
                          </div>
                          <div>
                            <strong>Ke hoach tiep:</strong>{" "}
                            {formatDate(
                              maintenanceNextDate ??
                                activeVehicle?.nextMaintenanceDate
                            )}
                          </div>
                          <div>
                            <strong>Km bao duong tiep:</strong>{" "}
                            {maintenanceNextMileage != null
                              ? `${formatNumber(maintenanceNextMileage)} km`
                              : "N/A"}
                          </div>
                          <div>
                            <strong>Km con lai:</strong>{" "}
                    {maintenanceRemainingKm != null
                      ? `${formatNumber(maintenanceRemainingKm)} km`
                      : "N/A"}
                  </div>
                </div>
              </div>
            ) : null}

            {maintenanceHistorySorted.length ? (
              <div className="detail-subcard">
                <h5>Lich su bao duong</h5>
                <div className="history-list">
                  {maintenanceHistorySorted.slice(0, 5).map((item, idx) => {
                    const dateValue =
                      item?.serviceDate ??
                      item?.ServiceDate ??
                      item?.maintenanceDate ??
                      item?.MaintenanceDate ??
                      item?.date ??
                      item?.Date;
                    const mileageValue =
                      item?.mileage ??
                      item?.Mileage ??
                      item?.maintenanceMileage ??
                      item?.MaintenanceMileage ??
                      item?.serviceMileage ??
                      item?.ServiceMileage;
                    const title =
                      item?.serviceName ??
                      item?.ServiceName ??
                      item?.maintenanceType ??
                      item?.MaintenanceType ??
                      item?.description ??
                      item?.Description ??
                      `Lan ${idx + 1}`;
                    const note = item?.notes ?? item?.Notes ?? "";
                    const key =
                      item?.id ??
                      item?.Id ??
                      item?.maintenanceId ??
                      item?.MaintenanceId ??
                      idx;
                    return (
                      <div className="history-row" key={key}>
                        <div className="history-title">{title}</div>
                        <div className="muted-text">
                          {formatDate(dateValue)}
                          {mileageValue != null
                            ? ` - ${formatNumber(mileageValue)} km`
                            : ""}
                        </div>
                        {note ? (
                          <div className="muted-text">{note}</div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {healthLatest ? (
              <div className="detail-subcard">
                <h5>Suc khoe pin</h5>
                <div className="detail-grid compact">
                          <div>
                            <strong>Battery health:</strong>{" "}
                            {batteryHealthLatest != null
                              ? `${batteryHealthLatest}%`
                              : "N/A"}
                          </div>
                          <div>
                            <strong>Trang thai:</strong>{" "}
                            {healthLatest?.status ??
                              healthLatest?.Status ??
                              "N/A"}
                          </div>
                          <div>
                            <strong>Thoi gian do:</strong>{" "}
                            {formatDate(healthCheckedAt)}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : modalMode === "mileage" ? (
              <form onSubmit={handleMileageUpdate} className="modal-form">
                <label>
                  So km hien tai
                  <input
                    name="mileage"
                    type="number"
                    value={formData.mileage ?? ""}
                    onChange={handleFormChange}
                    required
                  />
                </label>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Huy
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Dang luu..." : "Luu"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-grid">
                  <label>
                    CustomerId *
                    <input
                      name="customerId"
                      type="number"
                      value={formData.customerId}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    ModelId *
                    <input
                      name="modelId"
                      type="number"
                      value={formData.modelId}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    Bien so *
                    <input
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    VIN
                    <input
                      name="vin"
                      value={formData.vin}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Mau
                    <input
                      name="color"
                      value={formData.color}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Ngay mua
                    <input
                      name="purchaseDate"
                      type="date"
                      value={formData.purchaseDate || ""}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Mileage
                    <input
                      name="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Pin (%)
                    <input
                      name="batteryHealthPercent"
                      type="number"
                      value={formData.batteryHealthPercent}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Lan bao duong cuoi
                    <input
                      name="lastMaintenanceDate"
                      type="date"
                      value={formData.lastMaintenanceDate || ""}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Bao duong tiep theo
                    <input
                      name="nextMaintenanceDate"
                      type="date"
                      value={formData.nextMaintenanceDate || ""}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Km bao duong cuoi
                    <input
                      name="lastMaintenanceMileage"
                      type="number"
                      value={formData.lastMaintenanceMileage}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Km bao duong tiep theo
                    <input
                      name="nextMaintenanceMileage"
                      type="number"
                      value={formData.nextMaintenanceMileage}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Tinh trang xe
                    <input
                      name="vehicleCondition"
                      value={formData.vehicleCondition}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    So bao hiem
                    <input
                      name="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Het han bao hiem
                    <input
                      name="insuranceExpiry"
                      type="date"
                      value={formData.insuranceExpiry || ""}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Het han dang kiem
                    <input
                      name="registrationExpiry"
                      type="date"
                      value={formData.registrationExpiry || ""}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Ghi chu
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows={2}
                    />
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={!!formData.isActive}
                      onChange={handleFormChange}
                    />
                    Dang hoat dong
                  </label>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Huy
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Dang luu..." : "Luu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      <style>{`
        .vehicle-management { display: flex; flex-direction: column; gap: 1rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; }
        .subtitle { margin: 0.15rem 0 0; color: #6c757d; }
        .filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; align-items: center; }
        .search-box { position: relative; display: flex; align-items: center; }
        .search-box i { position: absolute; left: 12px; color: #6c757d; }
        .search-box input { width: 100%; padding: 10px 12px 10px 34px; border: 1px solid #dee2e6; border-radius: 8px; }
        .filters select { width: 100%; padding: 10px 12px; border: 1px solid #dee2e6; border-radius: 8px; background: #fff; }
        .tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .tab-btn { padding: 10px 14px; border: 1px solid #dee2e6; border-radius: 20px; background: #fff; cursor: pointer; }
        .tab-btn.active { background: #000; color: #fff; border-color: #000; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; }
        .stat-card { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-radius: 12px; background: #fff; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05); }
        .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%); color: #fff; }
        .stat-card.warning .stat-icon { background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%); }
        .stat-card.success .stat-icon { background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%); }
        .stat-card.info .stat-icon { background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%); }
        .table-card { background: #fff; border-radius: 12px; padding: 1rem; box-shadow: 0 6px 20px rgba(0,0,0,0.05); }
        .table-header { display: flex; justify-content: space-between; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
        .table-actions { display: flex; align-items: center; gap: 0.5rem; }
        .primary-btn { padding: 10px 14px; border: none; background: #000; color: #fff; border-radius: 8px; cursor: pointer; }
        .table-wrapper { position: relative; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #f1f3f5; vertical-align: middle; }
        thead tr { background: #f8f9fa; }
        .license-plate { display: inline-block; padding: 6px 10px; border-radius: 6px; background: #eef2ff; color: #233876; font-weight: 600; }
        .cell-title { font-weight: 600; }
        .muted-text { color: #6c757d; }
        .battery-cell { display: flex; align-items: center; gap: 8px; }
        .battery-bar { height: 8px; border-radius: 6px; background: #e9ecef; width: 100%; }
        .status-badge { padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .status-badge.success { background: #e6f4ea; color: #0f9d58; }
        .status-badge.warning { background: #fff4e5; color: #f29d38; }
        .status-badge.inactive { background: #f1f3f5; color: #6c757d; }
        .action-buttons { display: flex; gap: 0.35rem; justify-content: center; }
        .btn-view, .btn-edit, .btn-delete { padding: 6px 9px; border: 1px solid #dee2e6; background: #fff; border-radius: 6px; cursor: pointer; }
        .btn-view:hover { background: #f1f5ff; }
        .btn-edit:hover { background: #f5fff3; }
        .btn-delete:hover { background: #fff3f3; }
        .loading-spinner { width: 28px; height: 28px; border: 3px solid #dee2e6; border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .table-wrapper.is-loading { opacity: 0.7; }
        .table-loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: grid; place-items: center; }
        .skeleton-row { display: flex; gap: 10px; margin: 4px 0; }
        .skeleton-block { height: 12px; border-radius: 6px; background: linear-gradient(90deg, #f5f5f5 0%, #ececec 50%, #f5f5f5 100%); animation: shimmer 1.2s ease-in-out infinite; }
        .skeleton-block--wide { width: 180px; }
        .skeleton-block--medium { width: 120px; }
        .skeleton-block--narrow { width: 80px; }
        .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; gap: 0.5rem; flex-wrap: wrap; }
        .page-controls { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .page-btn { border: 1px solid #dee2e6; background: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
        .page-btn.active { background: #000; color: #fff; border-color: #000; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .alert { padding: 0.75rem 1rem; border-radius: 10px; }
        .alert-warning { background: #fff4e5; color: #8a6d3b; border: 1px solid #fcd9a3; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: grid; place-items: center; z-index: 1000; padding: 1rem; }
        .modal-card { background: #fff; border-radius: 12px; width: min(960px, 100%); max-height: 90vh; overflow: auto; padding: 1rem 1.25rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .btn-close { background: transparent; border: none; font-size: 22px; cursor: pointer; }
        .modal-form { display: flex; flex-direction: column; gap: 0.75rem; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }
        .modal-form label { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
        .modal-form input, .modal-form textarea { padding: 10px; border: 1px solid #dee2e6; border-radius: 8px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
        .btn-outline { padding: 10px 14px; border: 1px solid #dee2e6; background: #fff; border-radius: 8px; cursor: pointer; }
        .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.5rem; }
        .detail-grid.compact { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.4rem; }
        .detail-stack { display: flex; flex-direction: column; gap: 1rem; }
        .detail-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75rem; }
        .detail-subcard { padding: 0.75rem; border: 1px solid #edf0f3; border-radius: 10px; background: #fdfefe; }
        .detail-subcard h5 { margin: 0 0 0.5rem; font-size: 15px; }
        .history-list { display: flex; flex-direction: column; gap: 0.4rem; }
        .history-row { padding: 0.35rem 0; border-top: 1px solid #f0f2f4; }
        .history-row:first-child { border-top: none; }
        .history-title { font-weight: 600; }
        .checkbox { flex-direction: row; align-items: center; gap: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -100px; } 50% { background-position: 100px; } 100% { background-position: -100px; } }
        @media (max-width: 900px) {
          th:nth-child(5), td:nth-child(5),
          th:nth-child(6), td:nth-child(6),
          th:nth-child(9), td:nth-child(9) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleManagement;




