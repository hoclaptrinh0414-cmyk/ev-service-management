import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  customersAPI,
  customerTypesAPI,
  handleApiError,
} from "../../services/apiService";

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  totalPages: 0,
  totalCount: 0,
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === "string" ? value : "—";
    }
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.debug("Failed to format date", { value, error });
    return typeof value === "string" ? value : "—";
  }
};

const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatOverdueDuration = (value, referenceDate = new Date()) => {
  const visitDate = parseDateValue(value);
  if (!visitDate) return "";

  const diffMs = referenceDate.getTime() - visitDate.getTime();
  if (diffMs <= 0) return "Vừa ghé";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Vừa ghé";

  if (diffDays < 7) {
    return `Quá ${diffDays} ngày`;
  }

  if (diffDays < 30) {
    const diffWeeks = Math.max(1, Math.floor(diffDays / 7));
    return `Quá ${diffWeeks} tuần`;
  }

  if (diffDays < 365) {
    const diffMonths = Math.max(1, Math.floor(diffDays / 30));
    return `Quá ${diffMonths} tháng`;
  }

  const diffYears = Math.max(1, Math.floor(diffDays / 365));
  return `Quá ${diffYears} năm`;
};

const buildCustomerCacheKey = ({
  page,
  pageSize,
  searchTerm,
  statusFilter,
  typeFilter,
  sortOption,
}) =>
  JSON.stringify({
    page,
    pageSize,
    search: (searchTerm || "").trim().toLowerCase(),
    status: statusFilter || "all",
    type: typeFilter || "all",
    sort: sortOption || "",
  });

const formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const resolveCustomerId = (customer, fallback) =>
  customer?.customerId ??
  customer?.CustomerId ??
  customer?.customerCode ??
  customer?.CustomerCode ??
  fallback;

const mapMaintenanceCustomers = (items) =>
  (Array.isArray(items) ? items : []).reduce((accumulator, customer, index) => {
    const lastVisitRaw = customer?.lastVisitDate ?? customer?.LastVisitDate ?? null;
    const lastVisitDate = parseDateValue(lastVisitRaw);
    if (!lastVisitDate) {
      return accumulator;
    }

    const vehicles =
      customer?.recentVehicles ?? customer?.RecentVehicles ?? [];
    const primaryVehicle = vehicles[0];

    const vehicleNameParts = [
      primaryVehicle?.brandName ?? primaryVehicle?.BrandName,
      primaryVehicle?.modelName ?? primaryVehicle?.ModelName,
    ].filter(Boolean);

    accumulator.push({
      id:
        customer?.customerId ??
        customer?.CustomerId ??
        customer?.customerCode ??
        customer?.CustomerCode ??
        `maintenance-${index}`,
      customerId: customer?.customerId ?? customer?.CustomerId ?? null,
      name:
        customer?.displayName ??
        customer?.fullName ??
        customer?.FullName ??
        "Không rõ tên",
      vehicle: vehicleNameParts.length
        ? vehicleNameParts.join(" ")
        : "Chưa cập nhật",
      lastVisit: formatDate(lastVisitDate),
      overdueLabel: formatOverdueDuration(lastVisitDate),
      phone: customer?.phoneNumber ?? customer?.PhoneNumber ?? "—",
    });

    return accumulator;
  }, []);

const sortOptions = [
  { label: "Tên (A → Z)", value: "FullName:asc" },
  { label: "Tên (Z → A)", value: "FullName:desc" },
  { label: "Ngày tạo mới nhất", value: "CreatedDate:desc" },
  { label: "Ngày tạo cũ nhất", value: "CreatedDate:asc" },
  { label: "Tổng chi tiêu cao nhất", value: "TotalSpent:desc" },
  { label: "Điểm loyalty cao nhất", value: "LoyaltyPoints:desc" },
];

const createEmptyForm = () => ({
  customerId: null,
  fullName: "",
  phoneNumber: "",
  email: "",
  address: "",
  dateOfBirth: "",
  gender: "",
  typeId: "",
  notes: "",
  identityNumber: "",
  preferredLanguage: "vi-VN",
  marketingOptIn: true,
  isActive: true,
});

const normalizeDateInput = (value) => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }
  return "";
};

const resolveApiMessage = (response, fallback = "") => {
  if (!response || typeof response !== "object") {
    return fallback;
  }
  if (response.message) return response.message;
  if (response.Message) return response.Message;
  return fallback;
};

const extractPayload = (response) => {
  if (response == null) return null;

  if (Array.isArray(response)) return response;

  if (typeof response === "object") {
    if (response.data !== undefined) return response.data;
    if (response.Data !== undefined) return response.Data;
    if (response.payload !== undefined) return response.payload;
    if (response.Payload !== undefined) return response.Payload;
    if (response.result !== undefined) return response.result;
    if (response.Result !== undefined) return response.Result;
    if (response.items !== undefined) return response.items;
    if (response.Items !== undefined) return response.Items;
  }

  return response;
};

const normalizePagedResult = (response) => {
  const fallback = {
    items: [],
    page: DEFAULT_PAGINATION.page,
    pageSize: DEFAULT_PAGINATION.pageSize,
    totalPages: DEFAULT_PAGINATION.totalPages,
    totalCount: DEFAULT_PAGINATION.totalCount,
  };

  const payload = extractPayload(response) ?? {};

  if (Array.isArray(payload)) {
    const itemArray = payload;
    const inferredCount = itemArray.length;
    return {
      ...fallback,
      items: itemArray,
      totalCount: inferredCount,
      totalPages: inferredCount > 0 ? 1 : 0,
    };
  }

  const rawItems =
    payload.items ??
    payload.Items ??
    payload.data ??
    payload.Data ??
    [];
  const items = Array.isArray(rawItems) ? rawItems : [];

  const coercePositiveInt = (value, defaultValue) => {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? Math.trunc(num) : defaultValue;
  };

  const page = coercePositiveInt(
    payload.page ??
      payload.Page ??
      payload.pageNumber ??
      payload.PageNumber ??
      payload.currentPage ??
      payload.CurrentPage,
    fallback.page
  );

  const pageSize = coercePositiveInt(
    payload.pageSize ??
      payload.PageSize ??
      payload.limit ??
      payload.Limit,
    fallback.pageSize
  );

  const rawTotalCount =
    payload.totalCount ??
    payload.TotalCount ??
    payload.totalItems ??
    payload.TotalItems ??
    payload.count ??
    payload.Count ??
    items.length;
  const totalCount = Math.max(0, Number(rawTotalCount) || items.length || 0);

  const rawTotalPages =
    payload.totalPages ??
    payload.TotalPages ??
    payload.pageCount ??
    payload.PageCount;
  const totalPages = (() => {
    const coerced = Number(rawTotalPages);
    if (Number.isFinite(coerced) && coerced > 0) {
      return Math.trunc(coerced);
    }
    if (totalCount === 0) {
      return 0;
    }
    return Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)));
  })();

  return {
    items,
    page,
    pageSize,
    totalPages,
    totalCount,
  };
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState(sortOptions[0].value);

  const [customerTypes, setCustomerTypes] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [maintenanceCustomers, setMaintenanceCustomers] = useState([]);
  const [maintenanceError, setMaintenanceError] = useState("");

  const [modalMode, setModalMode] = useState(null);
  const [formData, setFormData] = useState(() => createEmptyForm());
  const [formErrors, setFormErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [maintenanceLoadingId, setMaintenanceLoadingId] = useState(null);
  const [revealedSpendCustomerIds, setRevealedSpendCustomerIds] = useState(() => new Set());
  const [pageCache, setPageCache] = useState(() => ({}));
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const resetFormState = () => {
    setFormData(createEmptyForm());
    setFormErrors({});
    setModalError("");
    setIsSubmitting(false);
  };

  const openCreateModal = () => {
    resetFormState();
    setModalMode("create");
  };

  const mapCustomerToForm = (customer) => {
    const base = createEmptyForm();
    if (!customer) {
      return base;
    }

    const typeFromCustomer =
      customer?.typeId ??
      customer?.TypeId ??
      customer?.customerType?.typeId ??
      customer?.customerType?.TypeId ??
      "";

    return {
      ...base,
      customerId: customer?.customerId ?? customer?.CustomerId ?? null,
      fullName: customer?.fullName ?? customer?.FullName ?? "",
      phoneNumber: customer?.phoneNumber ?? customer?.PhoneNumber ?? "",
      email: customer?.email ?? customer?.Email ?? "",
      address: customer?.address ?? customer?.Address ?? "",
      dateOfBirth: normalizeDateInput(
        customer?.dateOfBirth ?? customer?.DateOfBirth
      ),
      gender: customer?.gender ?? customer?.Gender ?? "",
      typeId: typeFromCustomer ? String(typeFromCustomer) : "",
      notes: customer?.notes ?? customer?.Notes ?? "",
      identityNumber:
        customer?.identityNumber ?? customer?.IdentityNumber ?? "",
      preferredLanguage:
        customer?.preferredLanguage ??
        customer?.PreferredLanguage ??
        "vi-VN",
      marketingOptIn:
        customer?.marketingOptIn ?? customer?.MarketingOptIn ?? true,
      isActive: customer?.isActive ?? customer?.IsActive ?? true,
    };
  };

  const openEditModal = (customer) => {
    const mapped = mapCustomerToForm(customer);
    setFormData(mapped);
    setFormErrors({});
    setModalError("");
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    resetFormState();
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const validateForm = () => {
    const errors = {};
    const phonePattern = /^[0-9+()\s.-]{8,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ tên khách hàng.";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Vui lòng nhập số điện thoại.";
    } else if (!phonePattern.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = "Số điện thoại không hợp lệ.";
    }

    if (
      formData.email &&
      formData.email.trim() &&
      !emailPattern.test(formData.email.trim())
    ) {
      errors.email = "Email không hợp lệ.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildCreatePayload = (form) => {
    const typeIdValue = form.typeId === "" ? null : Number(form.typeId);
    return {
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email?.trim() || null,
      address: form.address?.trim() || null,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      typeId: Number.isNaN(typeIdValue) ? null : typeIdValue,
      notes: form.notes?.trim() || null,
    };
  };

  const buildUpdatePayload = (form) => {
    const typeIdValue = form.typeId === "" ? null : Number(form.typeId);
    return {
      customerId: form.customerId,
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email?.trim() || null,
      address: form.address?.trim() || null,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      identityNumber: form.identityNumber?.trim() || null,
      typeId: Number.isNaN(typeIdValue) ? null : typeIdValue,
      preferredLanguage: form.preferredLanguage || "vi-VN",
      marketingOptIn: !!form.marketingOptIn,
      notes: form.notes?.trim() || null,
      isActive: !!form.isActive,
    };
  };

  const handleModalSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      if (modalMode === "create") {
        const payload = buildCreatePayload(formData);
        const response = await customersAPI.create(payload);
        const message = resolveApiMessage(
          response,
          "Tạo khách hàng thành công."
        );
        setFeedbackMessage(message);
        await loadCustomers();
        await loadStatistics();
        await loadMaintenanceCustomers();
        closeModal();
      } else if (modalMode === "edit") {
        const payload = buildUpdatePayload(formData);
        const response = await customersAPI.update(
          formData.customerId,
          payload
        );
        const message = resolveApiMessage(
          response,
          "Cập nhật khách hàng thành công."
        );
        setFeedbackMessage(message);
        await loadCustomers();
        await loadStatistics();
        await loadMaintenanceCustomers();
        closeModal();
      }
    } catch (error) {
      console.error("Không thể lưu khách hàng", error);
      setModalError(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (customer) => {
    setDeleteTarget(customer);
    setDeleteError("");
    setDeleteLoading(false);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteError("");
    setDeleteLoading(false);
  };

  const toggleSpendVisibility = (customerId) => {
    if (!customerId) return;
    setRevealedSpendCustomerIds((previous) => {
      const next = new Set(previous);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    const customerId =
      deleteTarget.customerId ?? deleteTarget.CustomerId ?? null;
    if (!customerId) {
      setDeleteError("Không xác định được khách hàng cần xóa.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const response = await customersAPI.remove(customerId);
      const message = resolveApiMessage(
        response,
        "Xóa khách hàng thành công."
      );
      setFeedbackMessage(message);
      await loadCustomers();
      await loadStatistics();
      await loadMaintenanceCustomers();
      closeDeleteModal();
    } catch (error) {
      console.error("Không thể xóa khách hàng", error);
      setDeleteError(handleApiError(error));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDismissFeedback = () => setFeedbackMessage("");

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setFeedbackMessage("");
    }, 4000);

    return () => clearTimeout(timeout);
  }, [feedbackMessage]);

  const handleMaintenanceSelect = async (maintenanceCustomer) => {
    const customerId =
      maintenanceCustomer?.customerId ??
      maintenanceCustomer?.CustomerId ??
      maintenanceCustomer?.id ??
      null;

    if (!customerId) {
      setMaintenanceError("Không tìm được mã khách hàng.");
      return;
    }

    setMaintenanceLoadingId(customerId);
    setMaintenanceError("");

    try {
      const response = await customersAPI.getById(customerId, {
        includeStats: false,
      });
      const payload = extractPayload(response);
      const customerDetail =
        payload?.data ?? payload?.Data ?? payload ?? maintenanceCustomer;

      openEditModal(customerDetail);
    } catch (error) {
      console.error("Không thể mở chi tiết khách hàng", error);
      setMaintenanceError(handleApiError(error));
    } finally {
      setMaintenanceLoadingId(null);
    }
  };

  const parseSortOption = (option) => {
    const [sortBy, direction] = (option || "").split(":");
    return {
      sortBy: sortBy || "FullName",
      sortDesc: direction === "desc",
    };
  };

  const loadCustomerTypes = async () => {
    try {
      const response = await customerTypesAPI.getActive();
      const payload = extractPayload(response);
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : payload?.data ?? [];
      setCustomerTypes(Array.isArray(items) ? items : []);
    } catch (error) {
      console.debug("Không thể tải loại khách hàng", error);
    }
  };

  const loadStatistics = async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const response = await customersAPI.getStatistics();
      const payload = extractPayload(response) ?? {};
      const customersByType = payload.customersByType ?? payload.CustomersByType;
      const typeEntries =
        customersByType && typeof customersByType === "object"
          ? Object.entries(customersByType).map(([key, value]) => ({
              key,
              value,
            }))
          : [];

      setStats({
        totalCustomers:
          payload.totalCustomers ?? payload.TotalCustomers ?? 0,
        activeCustomers:
          payload.activeCustomers ?? payload.ActiveCustomers ?? 0,
        inactiveCustomers:
          payload.inactiveCustomers ?? payload.InactiveCustomers ?? 0,
        maintenanceDueCustomers:
          payload.maintenanceDueCustomers ?? payload.MaintenanceDueCustomers ?? 0,
        newCustomersThisMonth:
          payload.newCustomersThisMonth ?? payload.NewCustomersThisMonth ?? 0,
        averageCustomerValue:
          payload.averageCustomerValue ?? payload.AverageCustomerValue ?? 0,
        customerRetentionRate:
          payload.customerRetentionRate ?? payload.CustomerRetentionRate ?? 0,
        customersByType: typeEntries,
      });
    } catch (error) {
      console.error("Không thể tải thống kê khách hàng", error);
      setStatsError("Không thể tải thống kê khách hàng.");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadMaintenanceCustomers = async () => {
    setMaintenanceError("");
    try {
      const response = await customersAPI.getMaintenanceDue();
      const payload = extractPayload(response);
      const mapped = mapMaintenanceCustomers(payload).slice(0, 8);
      setMaintenanceCustomers(mapped);
    } catch (error) {
      console.error("Không thể tải danh sách khách cần bảo dưỡng", error);
      setMaintenanceError("Không thể tải danh sách khách cần bảo dưỡng.");
      setMaintenanceCustomers([]);
    }
  };

  const loadCustomers = async () => {
    const normalizedSearchTerm = searchTerm.trim();
    const cacheKey = buildCustomerCacheKey({
      page: pagination.page,
      pageSize: pagination.pageSize,
      searchTerm: normalizedSearchTerm,
      statusFilter,
      typeFilter,
      sortOption,
    });

  const cachedPage = pageCache[cacheKey];
  if (cachedPage?.items) {
      setCustomers(cachedPage.items);
      setPagination((prev) => {
        const nextTotalPages = cachedPage.pagination?.totalPages ?? prev.totalPages;
        const nextTotalCount = cachedPage.pagination?.totalCount ?? prev.totalCount;
        if (prev.totalPages === nextTotalPages && prev.totalCount === nextTotalCount) {
          return prev;
        }
        return {
          ...prev,
          totalPages: nextTotalPages,
          totalCount: nextTotalCount,
        };
      });
    }

    setListLoading(true);
    setListError("");

    const { sortBy, sortDesc } = parseSortOption(sortOption);

    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      includeStats: true,
      sortBy,
      sortDesc,
    };

    if (normalizedSearchTerm) {
      params.searchTerm = normalizedSearchTerm;
    }

    if (statusFilter === "active") {
      params.isActive = true;
    } else if (statusFilter === "inactive") {
      params.isActive = false;
    }

    if (typeFilter !== "all") {
      params.typeId = Number(typeFilter);
    }

    try {
      const response = await customersAPI.getCustomers(params);

      if (response?.success === false) {
        throw new Error(
          response?.message ?? "Không thể tải danh sách khách hàng"
        );
      }

      const pagedResult = normalizePagedResult(response);
      setCustomers(pagedResult.items);
      setPagination((prev) => ({
        ...prev,
        page: pagedResult.page,
        pageSize: pagedResult.pageSize,
        totalPages: pagedResult.totalPages,
        totalCount: pagedResult.totalCount,
      }));
      setPageCache((prev) => {
        const next = { ...prev };
        next[cacheKey] = {
          items: pagedResult.items,
          pagination: {
            page: pagedResult.page,
            pageSize: pagedResult.pageSize,
            totalPages: pagedResult.totalPages,
            totalCount: pagedResult.totalCount,
          },
          timestamp: Date.now(),
        };

        const keys = Object.keys(next);
        if (keys.length > 12) {
          keys
            .sort((a, b) => (next[a].timestamp ?? 0) - (next[b].timestamp ?? 0))
            .slice(0, keys.length - 12)
            .forEach((key) => {
              delete next[key];
            });
        }

        return next;
      });
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    } catch (error) {
      console.error("Lỗi tải khách hàng", error);
      if (!initialLoadComplete) {
        setCustomers([]);
      }
      setListError(
        error?.message ?? "Không thể tải danh sách khách hàng từ server."
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerTypes();
    loadStatistics();
    loadMaintenanceCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize, searchTerm, statusFilter, typeFilter, sortOption]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    startTransition(() => {
      setPagination((prev) => ({ ...prev, page }));
    });
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value) || DEFAULT_PAGINATION.pageSize;
    startTransition(() => {
      setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      setSearchTerm("");
      setStatusFilter("all");
      setTypeFilter("all");
      setSortOption(sortOptions[0].value);
      setPagination({ ...DEFAULT_PAGINATION });
    });
  };

  const typeFilterOptions = useMemo(
    () => [
      { label: "Tất cả loại khách hàng", value: "all" },
      ...customerTypes.map((type) => ({
        label: type.typeName ?? type.TypeName ?? "Không rõ",
        value: type.typeId ?? type.TypeId ?? "",
      })),
    ],
    [customerTypes]
  );

  const maintenanceSummary = useMemo(() => {
    if (!stats) return null;
    const due = stats.maintenanceDueCustomers || 0;
    const total = stats.totalCustomers || 1;
    const percent = Math.min(100, Math.round((due / total) * 100));
    return { due, total, percent };
  }, [stats]);

  const pageSummary = useMemo(() => {
    if (!pagination || pagination.totalCount === 0) {
      return {
        start: customers.length > 0 ? 1 : 0,
        end: customers.length,
        total: customers.length,
      };
    }

    const start = (pagination.page - 1) * pagination.pageSize + (customers.length ? 1 : 0);
    const end = (pagination.page - 1) * pagination.pageSize + customers.length;
    return {
      start: Math.max(0, start),
      end: Math.max(start, end),
      total: pagination.totalCount,
    };
  }, [customers.length, pagination]);

  const totalPagesDisplay = useMemo(() => {
    const numeric = Number(pagination.totalPages);
    if (Number.isFinite(numeric) && numeric > 0) {
      return Math.trunc(numeric);
    }

    const totalCount = Number(pagination.totalCount || 0);
    const pageSize = Number(pagination.pageSize || DEFAULT_PAGINATION.pageSize);

    if (totalCount > 0 && pageSize > 0) {
      return Math.max(1, Math.ceil(totalCount / pageSize));
    }

    return totalCount > 0 ? 1 : 0;
  }, [pagination.totalPages, pagination.totalCount, pagination.pageSize]);

  const statTrends = useMemo(() => {
    if (!stats) {
      return {
        totalCustomers: "Theo dõi tăng trưởng khách hàng",
        activeCustomers: "Giữ chân khách hàng ổn định",
        maintenanceDue: "Nhắc lịch bảo dưỡng định kỳ",
        averageValue: "Theo dõi doanh thu khách hàng",
      };
    }

    const newThisMonth = stats.newCustomersThisMonth || stats.NewCustomersThisMonth || 0;
    const retentionRate = Math.round(stats.customerRetentionRate || stats.CustomerRetentionRate || 0);
    const maintenancePercent = maintenanceSummary
      ? maintenanceSummary.percent
      : 0;

    return {
      totalCustomers:
        newThisMonth > 0
          ? `🔼 +${formatNumber(newThisMonth)} khách mới tháng này`
          : "Chưa có dữ liệu khách mới",
      activeCustomers:
        retentionRate > 0
          ? `🔼 Giữ chân ${retentionRate}% khách hiện hữu`
          : "Cập nhật tỷ lệ giữ chân",
      maintenanceDue:
        maintenancePercent > 0
          ? `⚠ ${maintenancePercent}% tổng khách cần nhắc bảo dưỡng`
          : "Tạm thời không có lịch nhắc",
      averageValue:
        stats.averageCustomerValue || stats.AverageCustomerValue
          ? "📈 Giá trị trung bình mỗi khách"
          : "Chưa có dữ liệu chi tiêu",
    };
  }, [stats, maintenanceSummary]);

  const showLoadingOverlay = useMemo(
    () => (listLoading || isPending) && initialLoadComplete,
    [initialLoadComplete, isPending, listLoading]
  );

  const showInitialLoader = listLoading && !initialLoadComplete;

  const skeletonRowCount = useMemo(
    () => Math.min(6, Number(pagination.pageSize) || DEFAULT_PAGINATION.pageSize),
    [pagination.pageSize]
  );

  const renderStatusBadge = (isActive) => {
    if (isActive === true) {
      return <span className="status-badge active">Đang hoạt động</span>;
    }
    if (isActive === false) {
      return <span className="status-badge inactive">Đã vô hiệu</span>;
    }
    return <span className="status-badge pending">Chưa xác định</span>;
  };

  const isEditMode = modalMode === "edit";
  const deleteName =
    deleteTarget?.fullName ?? deleteTarget?.FullName ?? "khách hàng";

  return (
    <div className="customer-management">
      <div className="section-header">
        <div className="section-header__title">
          <div className="section-header__icon" aria-hidden="true">
            <i className="bi bi-people-fill" />
          </div>
          <div className="section-header__copy">
            <h2>Quản lý Khách hàng</h2>
            <p className="section-subtitle">
              Theo dõi khách hàng, trạng thái hoạt động và lịch sử bảo dưỡng.
            </p>
          </div>
        </div>
        <div className="section-header__actions">
          <button
            type="button"
            className="primary-action"
            onClick={openCreateModal}
          >
            <i className="bi bi-person-plus" aria-hidden="true" />
            <span>Thêm khách hàng mới</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className="toast-card">
            <i className="bi bi-check-circle-fill" />
            <div className="toast-content">
              <span>{feedbackMessage}</span>
              <small>Tự động ẩn sau vài giây</small>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={handleDismissFeedback}
              aria-label="Đóng thông báo"
            >
              <i className="bi bi-x" />
            </button>
          </div>
        </div>
      )}

      {(listError || statsError) && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {listError || statsError}
        </div>
      )}

      <div className="filters-row">
        <div className="filters-group">
          <div className="search-box">
            <i className="bi bi-search" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Tìm theo tên, mã khách hàng, email hoặc SĐT"
            />
          </div>

          <div className="filter-controls">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã vô hiệu</option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              {typeFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(event) => {
                setSortOption(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select value={pagination.pageSize} onChange={handlePageSizeChange}>
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} dòng / trang
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="filter-reset"
            onClick={resetFilters}
            title="Đặt lại bộ lọc"
          >
            <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="bi bi-people-fill" />
          </div>
          <div>
            <h3>{statsLoading ? "…" : formatNumber(stats?.totalCustomers)}</h3>
            <p>Tổng khách hàng</p>
            {!statsLoading && (
              <>
                <small>
                  {formatNumber(stats?.activeCustomers)} đang hoạt động ·{" "}
                  {formatNumber(stats?.inactiveCustomers)} đã vô hiệu
                </small>
                <div className="stat-trend">{statTrends.totalCustomers}</div>
              </>
            )}
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <i className="bi bi-person-check-fill" />
          </div>
          <div>
            <h3>{statsLoading ? "…" : formatNumber(stats?.activeCustomers)}</h3>
            <p>Khách đang hoạt động</p>
            {!statsLoading && (
              <>
                <small>
                  Tỉ lệ hoạt động: {stats?.totalCustomers
                    ? Math.round(
                        ((stats?.activeCustomers || 0) /
                          Math.max(stats?.totalCustomers || 1, 1)) *
                          100
                      )
                    : 0}
                  %
                </small>
                <div className="stat-trend">{statTrends.activeCustomers}</div>
              </>
            )}
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="bi bi-tools" />
          </div>
          <div>
            <h3>
              {statsLoading
                ? "…"
                : formatNumber(stats?.maintenanceDueCustomers)}
            </h3>
            <p>Khách cần bảo dưỡng</p>
            {maintenanceSummary && !statsLoading && (
              <>
                <small>
                  {maintenanceSummary.percent}% tổng khách ({
                    maintenanceSummary.due
                  }
                  /{maintenanceSummary.total})
                </small>
                <div className="stat-trend">{statTrends.maintenanceDue}</div>
              </>
            )}
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div>
            <h3>
              {statsLoading
                ? "…"
                : formatCurrency(stats?.averageCustomerValue)}
            </h3>
            <p>Giá trị trung bình</p>
            {!statsLoading && (
              <>
                <small>
                  Giữ chân khách: {Math.round(stats?.customerRetentionRate || 0)}%
                </small>
                <div className="stat-trend">{statTrends.averageValue}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {stats?.customersByType?.length ? (
        <div className="type-chips">
          {stats.customersByType.map((item) => (
            <span key={item.key} className="type-chip">
              <span className="dot" />
              {item.key}: {formatNumber(item.value)} khách
            </span>
          ))}
        </div>
      ) : null}

      <div className="content-layout">
        <div className="table-card">
          <div className="table-header">
            <div>
              <h3>Danh sách khách hàng</h3>
              <p>
                Hiển thị
                {" "}
                {pageSummary.total
                  ? `${formatNumber(pageSummary.start)}–${formatNumber(pageSummary.end)} / ${formatNumber(pageSummary.total)}`
                  : formatNumber(customers.length)}
                {" "}
                khách hàng
              </p>
            </div>
            <button className="btn btn-outline-primary">
              <i className="bi bi-download me-2" />
              Xuất danh sách
            </button>
          </div>

          <div className={`table-wrapper${showLoadingOverlay ? " is-loading" : ""}`}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Loại & Loyalty</th>
                  <th>Xe</th>
                  <th>Lần ghé gần nhất</th>
                  <th>Trạng thái</th>
                  <th>Tổng chi tiêu</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {showInitialLoader ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      <div className="loading-spinner" />
                      Đang tải dữ liệu khách hàng...
                    </td>
                  </tr>
                ) : customers.length ? (
                  customers.map((customer, index) => {
                    const resolvedId = resolveCustomerId(customer, `customer-${index}`);
                    const isSpendRevealed = revealedSpendCustomerIds.has(resolvedId);
                    const lastVisitRaw = customer?.lastVisitDate ?? customer?.LastVisitDate ?? null;
                    const lastVisitDate = parseDateValue(lastVisitRaw);
                    const hasVisited = !!lastVisitDate;
                    const lastVisitDisplay = hasVisited ? formatDate(lastVisitDate) : "Chưa từng ghé";
                    const overdueLabel = hasVisited ? formatOverdueDuration(lastVisitDate) : "";

                    return (
                    <tr key={resolvedId}>
                      <td>
                        {(pagination.page - 1) * pagination.pageSize +
                          index +
                          1}
                      </td>
                      <td>
                        <div className="cell-title">{customer.fullName ?? customer.FullName}</div>
                        <small className="muted-text">
                          Mã: {customer.customerCode ?? customer.CustomerCode ?? "—"}
                        </small>
                      </td>
                      <td>
                        <div>{customer.phoneNumber ?? customer.PhoneNumber ?? "—"}</div>
                        <small className="muted-text">
                          {customer.email ?? customer.Email ?? "Không có email"}
                        </small>
                      </td>
                      <td>
                        <div>
                          {customer.customerType?.typeName ??
                            customer.customerType?.TypeName ??
                            "Không phân loại"}
                        </div>
                        <small className="muted-text">
                          Loyalty: {formatNumber(customer.loyaltyPoints ?? customer.LoyaltyPoints)} điểm
                        </small>
                      </td>
                      <td>
                        <div className="cell-pill">
                          <i className="bi bi-truck" />
                          {formatNumber(customer.activeVehicleCount ?? customer.ActiveVehicleCount ?? 0)} / {formatNumber(customer.vehicleCount ?? customer.VehicleCount ?? 0)}
                        </div>
                      </td>
                      <td>
                        <div className="visit-column">
                          <span className={hasVisited ? "visit-date" : "visit-date muted-text"}>{lastVisitDisplay}</span>
                          {hasVisited && overdueLabel ? (
                            <span className="visit-overdue">
                              <i className="bi bi-clock-history" aria-hidden="true" /> {overdueLabel}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>{renderStatusBadge(customer.isActive ?? customer.IsActive)}</td>
                      <td>
                        <div className="spend-cell">
                          <span className={`currency ${isSpendRevealed ? "" : "muted-text"}`}>
                            {isSpendRevealed
                              ? formatCurrency(
                                  customer.totalSpent ?? customer.TotalSpent
                                )
                              : "••••••"}
                          </span>
                          <button
                            type="button"
                            className={`btn-icon spend-toggle ${isSpendRevealed ? "is-active" : ""}`}
                            title={
                              isSpendRevealed
                                ? "Ẩn tổng chi tiêu"
                                : "Hiện tổng chi tiêu"
                            }
                            aria-label={
                              isSpendRevealed
                                ? "Ẩn tổng chi tiêu"
                                : "Hiện tổng chi tiêu"
                            }
                            onClick={() => toggleSpendVisibility(resolvedId)}
                          >
                            <i className={`bi ${isSpendRevealed ? "bi-eye-slash" : "bi-eye"}`} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Chỉnh sửa khách hàng"
                            aria-label="Chỉnh sửa khách hàng"
                            onClick={() => openEditModal(customer)}
                          >
                            <i className="bi bi-pencil" />
                          </button>
                          <button
                            type="button"
                            className="btn-icon danger"
                            title="Xóa khách hàng"
                            aria-label="Xóa khách hàng"
                            onClick={() => openDeleteModal(customer)}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      <i className="bi bi-inbox display-6 d-block mb-2" />
                      Không tìm thấy khách hàng nào phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {showLoadingOverlay ? (
              <div className="table-loading-overlay" aria-hidden="true">
                {Array.from({ length: Math.max(3, skeletonRowCount) }).map((_, overlayIdx) => (
                  <div key={overlayIdx} className="skeleton-row">
                    <span className="skeleton-block skeleton-block--wide" />
                    <span className="skeleton-block skeleton-block--medium" />
                    <span className="skeleton-block skeleton-block--narrow" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {(customers.length > 0 || pagination.totalCount > 0) && (
            <div className="pagination">
              <div className="page-info">
                Trang {formatNumber(pagination.page)} / {formatNumber(Math.max(1, totalPagesDisplay))}
              </div>
              <div className="page-controls">
                {(() => {
                  const totalPagesToRender = Math.max(1, totalPagesDisplay || 0);
                  const showNumberButtons = totalPagesToRender > 1;
                  const disablePrev = pagination.page <= 1;
                  const disableNext = pagination.page >= totalPagesToRender;
                  return (
                    <>
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={disablePrev}
                >
                  <i className="bi bi-chevron-left" />
                </button>

                      {showNumberButtons &&
                        [...Array(totalPagesToRender)].map((_, idx) => (
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
                        ))}

                <button
                  className="page-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={disableNext}
                >
                  <i className="bi bi-chevron-right" />
                </button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <aside className="sidebar-card">
          <div className="sidebar-header">
            <h4>Khách cần bảo dưỡng</h4>
            <span className="badge rounded-pill bg-warning text-dark">
              {maintenanceCustomers.length}
            </span>
          </div>
          {maintenanceError && (
            <div className="alert alert-light" role="alert">
              {maintenanceError}
            </div>
          )}
          <ul className="maintenance-list">
            {maintenanceCustomers.length ? (
              maintenanceCustomers.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`maintenance-card${
                      maintenanceLoadingId === item.id ? " loading" : ""
                    }`}
                    onClick={() => handleMaintenanceSelect(item)}
                    disabled={maintenanceLoadingId === item.id}
                    title="Mở chi tiết khách hàng"
                  >
                    <div className="maintenance-card-header">
                      <span className="maintenance-icon">
                        <i className="bi bi-exclamation-triangle-fill" />
                      </span>
                      <div className="maintenance-info">
                        <div className="list-title">{item.name}</div>
                        <span className="list-tag">
                          Lần ghé gần nhất: {item.lastVisit}
                          {item.overdueLabel ? (
                            <span className="list-tag-overdue">• {item.overdueLabel}</span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                    <div className="list-meta">
                      <i className="bi bi-car-front" /> {item.vehicle}
                    </div>
                    <div className="list-meta">
                      <i className="bi bi-telephone" /> {item.phone}
                    </div>
                    {maintenanceLoadingId === item.id && (
                      <div className="mini-spinner" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))
            ) : (
              <li className="empty-state">
                <i className="bi bi-check2-circle" />
                <p>Tất cả khách hàng đã được bảo dưỡng đúng hạn.</p>
              </li>
            )}
          </ul>
        </aside>
      </div>

      {modalMode && (
        <div
          className="modal-backdrop-custom"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              closeModal();
            }
          }}
        >
          <div className="modal-panel">
            <div className="modal-header">
              <h3>{modalMode === "create" ? "Thêm khách hàng mới" : "Chỉnh sửa khách hàng"}</h3>
              <button
                type="button"
                className="modal-close"
                aria-label="Đóng"
                onClick={closeModal}
              />
            </div>
            <form className="modal-body" onSubmit={handleModalSubmit}>
              <div className="modal-grid">
                <div className="form-group">
                  <label>
                    Họ và tên <span className="required">*</span>
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    placeholder="VD: Nguyễn Văn Anh"
                  />
                  {formErrors.fullName && (
                    <small className="form-error">{formErrors.fullName}</small>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Số điện thoại <span className="required">*</span>
                  </label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    placeholder="VD: 0901234567"
                  />
                  {formErrors.phoneNumber && (
                    <small className="form-error">{formErrors.phoneNumber}</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="VD: khachhang@example.com"
                  />
                  {formErrors.email && (
                    <small className="form-error">{formErrors.email}</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Số nhà, đường, quận/huyện"
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select name="gender" value={formData.gender || ""} onChange={handleFormChange}>
                    <option value="">Không xác định</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Loại khách hàng</label>
                  <select name="typeId" value={formData.typeId} onChange={handleFormChange}>
                    <option value="">Chưa phân loại</option>
                    {customerTypes.map((type) => {
                      const typeId = type?.typeId ?? type?.TypeId;
                      const optionValue =
                        typeId === null || typeId === undefined
                          ? ""
                          : String(typeId);
                      const typeName = type?.typeName ?? type?.TypeName ?? "Không rõ";
                      const optionKey = optionValue || typeName;
                      return (
                        <option key={optionKey} value={optionValue}>
                          {typeName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Số CCCD/CMND</label>
                  <input
                    name="identityNumber"
                    value={formData.identityNumber}
                    onChange={handleFormChange}
                    placeholder="Tùy chọn"
                  />
                </div>
                <div className="form-group">
                  <label>Ngôn ngữ ưu tiên</label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleFormChange}
                  >
                    <option value="vi-VN">Tiếng Việt</option>
                    <option value="en-US">English</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      name="marketingOptIn"
                      checked={!!formData.marketingOptIn}
                      onChange={handleFormChange}
                    />
                    Nhận thông tin khuyến mãi
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={!!formData.isActive}
                      onChange={handleFormChange}
                      disabled={!isEditMode}
                    />
                    Đang hoạt động
                  </label>
                </div>
                <div className="form-group wide">
                  <label>Ghi chú nội bộ</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Thông tin quan trọng, lưu ý chăm sóc khách hàng..."
                  />
                </div>
              </div>

              {modalError && (
                <div className="alert alert-danger" role="alert">
                  {modalError}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Đang lưu..."
                    : modalMode === "create"
                    ? "Tạo khách hàng"
                    : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="modal-backdrop-custom danger"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget && !deleteLoading) {
              closeDeleteModal();
            }
          }}
        >
          <div className="modal-panel">
            <div className="modal-header">
              <h3>Xóa khách hàng</h3>
              <button
                type="button"
                className="modal-close"
                aria-label="Đóng"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              />
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc muốn xóa khách hàng {" "}
                <strong>{deleteName}</strong>? Hành động này không thể hoàn tác.
              </p>
              {deleteError && (
                <div className="alert alert-danger" role="alert">
                  {deleteError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Đang xóa..." : "Xóa khách hàng"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --brand-primary: #3b82f6;
          --brand-primary-soft: rgba(59, 130, 246, 0.12);
          --brand-accent: #f59e0b;
          --brand-success: #16a34a;
          --brand-warning: #f97316;
          --brand-surface: #f3f4f6;
          --brand-border: #d0d7de;
          --brand-text: #0f172a;
          --brand-muted: #6b7280;
          --brand-bg: #f8fafc;
        }

        .customer-management {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
          color: var(--brand-text);
          background: transparent;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: 1.75rem;
          padding: 32px 36px;
          border-radius: 20px;
          background: linear-gradient(160deg, rgba(245, 241, 236, 0.7), rgba(255, 255, 255, 0.9));
          border: 1px solid rgba(59, 47, 37, 0.08);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
          flex-wrap: wrap;
        }

        .section-header__title {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .section-header__icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(59, 47, 37, 0.1));
          color: #4338ca;
          display: grid;
          place-items: center;
          font-size: 1.8rem;
        }

        .section-header__copy h2 {
          margin: 0 0 0.6rem;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 0.6px;
          color: #21160f;
        }

        .section-subtitle {
          margin: 0;
          font-size: 1.05rem;
          color: rgba(59, 47, 37, 0.72);
          letter-spacing: 0.1px;
        }

        .section-header__actions {
          display: flex;
          align-items: center;
        }

        .primary-action {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.85rem 1.5rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.3px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          border: none;
          box-shadow: 0 18px 40px rgba(34, 197, 94, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .primary-action i {
          font-size: 1.15rem;
        }

        .primary-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 55px rgba(22, 163, 74, 0.4);
        }

        .filters-row {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          margin-bottom: 1.75rem;
        }

        .filters-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          padding: 14px 18px;
          border-radius: 16px;
          background: rgba(245, 241, 236, 0.65);
          border: 1px solid rgba(59, 47, 37, 0.08);
        }

        .filter-reset {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          border-radius: 12px;
          border: none;
          background: rgba(34, 197, 94, 0.12);
          color: #047857;
          font-weight: 600;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
          margin-left: auto;
        }

        .filter-reset:hover {
          background: rgba(16, 185, 129, 0.18);
          transform: translateY(-1px);
        }

        .search-box {
          flex: 1 1 320px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.9rem;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 12px;
          background: var(--brand-bg);
        }

        .search-box i {
          color: var(--brand-muted);
        }

        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
        }

        .filter-controls {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-controls select {
          padding: 0.5rem 0.9rem;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #fff;
          min-width: 150px;
          color: var(--brand-text);
        }

        .filter-controls select:focus {
          outline: none;
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px var(--brand-primary-soft);
        }

        .toast-container {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 1100;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: modalFadeIn 0.25s ease;
        }

        .toast-card {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          min-width: 280px;
          max-width: 360px;
          background: #fff;
          border-radius: 14px;
          padding: 0.85rem 1rem;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.18);
          border: 1px solid rgba(59, 130, 246, 0.18);
        }

        .toast-card i {
          font-size: 1.25rem;
          color: var(--brand-success);
        }

        .toast-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          color: var(--brand-text);
          font-size: 0.9rem;
        }

        .toast-content small {
          color: var(--brand-muted);
          font-size: 0.75rem;
        }

        .toast-close {
          border: none;
          background: transparent;
          color: var(--brand-muted);
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0;
        }

        .toast-close:hover {
          color: var(--brand-text);
        }

        @media (max-width: 992px) {
          .section-header {
            flex-direction: column;
            align-items: stretch;
          }

          .section-header__actions {
            width: 100%;
            justify-content: flex-start;
          }

          .primary-action {
            width: 100%;
            justify-content: center;
          }

          .filters-group {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-controls {
            width: 100%;
          }

          .filter-reset {
            width: 100%;
            justify-content: center;
            margin-left: 0;
          }
        }

        @media (max-width: 768px) {
          .toast-container {
            left: 1rem;
            right: 1rem;
            top: 1rem;
          }

          .section-header {
            padding: 24px 20px;
          }

          .section-header__title {
            gap: 0.75rem;
          }

          .section-header__icon {
            width: 48px;
            height: 48px;
            font-size: 1.5rem;
            border-radius: 14px;
          }

          .section-header__copy h2 {
            font-size: 1.8rem;
          }

          .section-subtitle {
            font-size: 0.95rem;
          }

          .filters-group {
            padding: 12px 14px;
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.25rem;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
          position: relative;
          overflow: hidden;
        }

        .stat-card::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.18;
        }

        .stat-card.primary::after {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(59, 130, 246, 0));
        }

        .stat-card.success::after {
          background: linear-gradient(135deg, rgba(22, 163, 74, 0.9), rgba(22, 163, 74, 0));
        }

        .stat-card.warning::after {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.9), rgba(249, 115, 22, 0));
        }

        .stat-card.info::after {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(14, 165, 233, 0));
        }

        .stat-card > * {
          position: relative;
          z-index: 1;
        }

        .stat-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: rgba(59, 130, 246, 0.18);
          color: var(--brand-primary);
          font-size: 1.6rem;
        }

        .stat-card.success .stat-icon { background: rgba(22, 163, 74, 0.18); color: var(--brand-success); }
        .stat-card.warning .stat-icon { background: rgba(249, 115, 22, 0.18); color: var(--brand-warning); }
        .stat-card.info .stat-icon { background: rgba(14, 165, 233, 0.18); color: #0284c7; }

        .stat-card h3 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--brand-text);
        }

        .stat-card p {
          margin: 0.25rem 0;
          color: rgba(15, 23, 42, 0.75);
          font-weight: 500;
        }

        .stat-card small {
          color: var(--brand-muted);
        }

        .stat-trend {
          margin-top: 0.3rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--brand-primary);
        }

        .stat-card.success .stat-trend {
          color: var(--brand-success);
        }

        .stat-card.warning .stat-trend {
          color: var(--brand-warning);
        }

        .stat-card.info .stat-trend {
          color: #0ea5e9;
        }

        .type-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .type-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.75rem;
          background: var(--brand-bg);
          border-radius: 999px;
          color: var(--brand-text);
          font-weight: 500;
          border: 1px solid rgba(15, 23, 42, 0.06);
        }

        .type-chip .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--brand-primary);
        }

        .content-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 1.5rem;
        }

        @media (max-width: 1200px) {
          .content-layout {
            grid-template-columns: 1fr;
          }
        }

        .table-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
        }

        .table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.95), #ffffff);
        }

        .table-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--brand-text);
        }

        .table-header p {
          margin: 0.25rem 0 0;
          color: var(--brand-muted);
          font-size: 0.9rem;
        }

        .table-wrapper {
          overflow: auto;
          position: relative;
          border-radius: 0 0 16px 16px;
          transition: opacity 0.25s ease, filter 0.25s ease;
        }

        .table-wrapper.is-loading {
          filter: saturate(0.92);
        }

        table {
          width: 100%;
          min-width: 960px;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 0.9rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
          font-size: 0.95rem;
        }

        thead tr {
          background: rgba(248, 250, 252, 0.95);
        }

        th {
          font-weight: 600;
          color: rgba(15, 23, 42, 0.72);
          font-size: 0.9rem;
          position: sticky;
          top: 0;
          z-index: 2;
          backdrop-filter: blur(6px);
        }

        tbody tr:nth-child(even) {
          background: rgba(248, 250, 252, 0.6);
        }

        tbody tr:hover {
          background: #f9fafb;
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.12);
        }

        .table-loading-overlay {
          position: absolute;
          inset: 0;
          padding: 4rem 1.5rem 1.5rem;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.92) 65%, rgba(255, 255, 255, 0.96) 100%);
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          animation: fadeIn 0.2s ease;
        }

        .skeleton-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .skeleton-block {
          display: block;
          height: 14px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(226, 232, 240, 0.25), rgba(226, 232, 240, 0.7), rgba(226, 232, 240, 0.25));
          background-size: 200% 100%;
          animation: skeletonShimmer 1.4s ease-in-out infinite;
        }

        .skeleton-block--wide {
          flex: 1 1 45%;
          max-width: 45%;
        }

        .skeleton-block--medium {
          flex: 1 1 30%;
          max-width: 30%;
        }

        .skeleton-block--narrow {
          flex: 0 1 18%;
          max-width: 18%;
        }

        .cell-title {
          font-weight: 600;
          color: #0f172a;
        }

        .muted-text {
          color: #6b7280;
        }

        .cell-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 600;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .status-badge.active {
          background: rgba(34, 197, 94, 0.15);
          color: #15803d;
        }

        .status-badge.inactive {
          background: rgba(239, 68, 68, 0.15);
          color: #b91c1c;
        }

        .status-badge.pending {
          background: rgba(234, 179, 8, 0.15);
          color: #b45309;
        }

        .currency {
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
        }

        .spend-cell {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .spend-toggle {
          border-radius: 999px;
          border-color: rgba(99, 102, 241, 0.25);
          background: rgba(99, 102, 241, 0.08);
          color: #4338ca;
          box-shadow: none;
        }

        .spend-toggle:hover {
          background: rgba(99, 102, 241, 0.18);
          color: #312e81;
          box-shadow: none;
          transform: translateY(-1px);
        }

        .spend-toggle.is-active {
          background: rgba(99, 102, 241, 0.24);
          color: #312e81;
        }

        .action-buttons {
          display: flex;
          gap: 0.4rem;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.25);
          background: #fff;
          color: var(--brand-primary);
          transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
        }

        .btn-icon:hover {
          background: var(--brand-primary);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(59, 130, 246, 0.2);
        }

        .btn-icon.danger {
          color: #dc2626;
          border-color: rgba(220, 38, 38, 0.3);
        }

        .btn-icon.danger:hover {
          background: #dc2626;
          color: #fff;
          box-shadow: 0 10px 18px rgba(220, 38, 38, 0.25);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.5rem;
          flex-wrap: wrap;
        }

        .page-info {
          font-size: 0.9rem;
          color: var(--brand-muted);
        }

        .page-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-btn {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid rgba(59, 130, 246, 0.25);
          background: #fff;
          color: var(--brand-primary);
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }

        .page-btn.active,
        .page-btn:hover {
          background: var(--brand-primary);
          color: #fff;
          transform: translateY(-1px);
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sidebar-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.35rem;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 720px;
          overflow: hidden;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .maintenance-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .maintenance-list li {
          list-style: none;
        }

        .maintenance-card {
          width: 100%;
          text-align: left;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 14px;
          padding: 0.85rem 1rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.85));
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
        }

        .maintenance-card:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
          border-color: rgba(59, 130, 246, 0.25);
        }

        .maintenance-card:disabled {
          opacity: 0.8;
          cursor: wait;
        }

        .maintenance-card.loading {
          opacity: 0.85;
          pointer-events: none;
        }

        .maintenance-card:focus-visible {
          outline: 3px solid var(--brand-primary-soft);
          outline-offset: 2px;
        }

        .maintenance-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .maintenance-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.18);
          color: var(--brand-warning);
          font-size: 1.1rem;
        }

        .maintenance-info .list-title {
          font-weight: 600;
          margin: 0;
        }

        .maintenance-list .list-title {
          font-weight: 600;
          margin-bottom: 0.2rem;
        }

        .maintenance-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .maintenance-list .list-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #475569;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .maintenance-list .list-tag {

        .maintenance-list .list-tag-overdue {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-left: 0.4rem;
          color: #b45309;
          font-weight: 600;
        }
          display: inline-block;
          margin-top: 0.2rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: rgba(245, 158, 11, 0.12);
          color: var(--brand-warning);
          font-size: 0.75rem;
        }

        .maintenance-list .empty-state {
          text-align: center;
          color: #6b7280;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 1.5rem 1rem;
          border: 1px dashed rgba(15, 23, 42, 0.12);
        }

        .mini-spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-top-color: var(--brand-primary);
          animation: spin 0.7s linear infinite;
          align-self: flex-end;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid rgba(59, 130, 246, 0.3);
          border-top-color: #3b82f6;
          margin: 0 auto 0.75rem;
          animation: spin 0.8s linear infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes skeletonShimmer {
          0% {
            background-position: 200% 0;
          }
          50% {
            background-position: 100% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .customer-management .modal-backdrop-custom {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          z-index: 1050;
        }

        .customer-management .modal-backdrop-custom.danger {
          background: rgba(239, 68, 68, 0.28);
        }

        .customer-management .modal-panel {
          width: min(680px, 100%);
          max-height: min(90vh, 760px);
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(15, 23, 42, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: modalFadeIn 0.25s ease;
        }

        .customer-management .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #f8fafc, #fff);
        }

        .customer-management .modal-header h3 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #0f172a;
        }

        .customer-management .modal-close {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(15, 23, 42, 0.08);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .customer-management .modal-close::before,
        .customer-management .modal-close::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 16px;
          height: 2px;
          background: #1f2937;
          transform-origin: center;
        }

        .customer-management .modal-close::before {
          transform: translate(-50%, -50%) rotate(45deg);
        }

        .customer-management .modal-close::after {
          transform: translate(-50%, -50%) rotate(-45deg);
        }

        .customer-management .modal-close:hover {
          background: rgba(37, 99, 235, 0.12);
        }

        .customer-management .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .customer-management .modal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .customer-management .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .customer-management .form-group label {
          font-weight: 600;
          color: #0f172a;
        }

        .customer-management .form-group input,
        .customer-management .form-group select,
        .customer-management .form-group textarea {
          border: 1px solid #d0d7de;
          border-radius: 10px;
          padding: 0.65rem 0.75rem;
          background: #fff;
          transition: border 0.2s ease, box-shadow 0.2s ease;
        }

        .customer-management .form-group input:focus,
        .customer-management .form-group select:focus,
        .customer-management .form-group textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .customer-management .form-group textarea {
          resize: vertical;
        }

        .customer-management .form-group.wide {
          grid-column: 1 / -1;
        }

        .customer-management .checkbox-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.5rem;
          align-items: start;
        }

        .customer-management .checkbox {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: #1f2937;
          cursor: pointer;
        }

        .customer-management .form-error {
          color: #dc2626;
          font-size: 0.8rem;
        }

        .customer-management .required {
          color: #dc2626;
        }

        .customer-management .modal-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .customer-management .modal-footer .btn {
          min-width: 140px;
        }

        .customer-management .modal-body .modal-footer {
          margin: 0 -1.5rem -1.5rem;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
        }

        .text-center {
          text-align: center;
        }

        .text-muted {
          color: #6b7280 !important;
        }
      `}</style>
    </div>
  );
};

export default CustomerManagement;
