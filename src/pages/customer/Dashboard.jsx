// src/pages/customer/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import VehicleFlipCard from "../../components/VehicleFlipCard";
import appointmentService from "../../services/appointmentService";
import { maintenanceService } from "../../services/maintenanceService";
import {
  getActiveSubscriptionsByVehicle,
  getApplicableServicesByVehicle,
  getSubscriptionDetail,
  getSubscriptionUsage,
} from "../../services/productService";
import MainLayout from "../../components/layout/MainLayout";

import "antd/dist/reset.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../Home.css";
import "./Dashboard.css";

import { Card, List, Tag, Button, Skeleton, Result, Modal, InputNumber } from "antd";

const extractApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const asArray = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.value)) return value.value;
  return null;
};

const findArrayDeep = (obj, preferredKeys = [], visited = new WeakSet()) => {
  if (!obj || typeof obj !== "object") return [];
  if (visited.has(obj)) return [];
  visited.add(obj);

  for (const key of preferredKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const arr = asArray(obj[key]);
      if (arr && arr.length) return arr;
    }
  }

  for (const value of Object.values(obj)) {
    const arr = asArray(value);
    if (arr && arr.length) return arr;
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const arr = findArrayDeep(value, preferredKeys, visited);
      if (arr.length) return arr;
    }
  }

  return [];
};

const normalizeServiceEntry = (service, fallbackKey = "") => {
  if (!service) {
    return {
      serviceId: fallbackKey,
      serviceName: "Service",
      includedUses: null,
      remainingUses: null,
      usedCount: 0,
      lastUsedDate: null,
      lastUsedAppointmentId: null,
      usagePercentage: null,
      isFullyUsed: null,
    };
  }

  const serviceId =
    service.serviceId ||
    service.id ||
    service.maintenanceServiceId ||
    service.subscriptionServiceId ||
    service.service?.serviceId ||
    fallbackKey;

  return {
    serviceId,
    serviceName:
      service.serviceName ||
      service.name ||
      service.maintenanceServiceName ||
      service.service?.serviceName ||
      "Service",
    includedUses:
      service.includedUses ??
      service.totalAllowedQuantity ??
      service.quantity ??
      service.totalUses ??
      service.allowedUses ??
      service.usageLimit ??
      service.quota ??
      service.maxUsage ??
      null,
    remainingUses:
      service.remainingUses ??
      service.remainingCount ??
      service.remainingQuantity ??
      service.remaining ??
      null,
    usedCount:
      service.usedCount ??
      service.timesUsed ??
      service.quantityUsed ??
      service.usageCount ??
      service.usedQuantity ??
      0,
    lastUsedDate: service.lastUsedDate ?? service.usedAt ?? null,
    lastUsedAppointmentId: service.lastUsedAppointmentId ?? null,
    usagePercentage: service.usagePercentage ?? null,
    isFullyUsed: service.isFullyUsed ?? null,
  };
}; // ✅ FIX: đóng hàm đúng cú pháp

const extractSubscriptionServices = (detail) => {
  if (!detail) return [];
  const preferredKeys = [
    "packageServices",
    "services",
    "includedServices",
    "packageServiceDetails",
    "subscriptionServices",
    "serviceList",
  ];
  const arr = findArrayDeep(detail, preferredKeys);
  return arr.map((service, index) =>
    normalizeServiceEntry(service, `detail-${index}`)
  );
};

const extractUsageEntries = (usage) => {
  if (!usage) return [];
  const preferredKeys = [
    "serviceUsages",
    "services",
    "usageDetails",
    "entries",
    "history",
    "items",
    "subscriptionServices",
  ];
  return findArrayDeep(usage, preferredKeys);
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return String(value);
  }
};

const deriveServicesFromUsage = (entries = []) => {
  const deduped = [];
  const seen = new Set();

  entries.forEach((entry, index) => {
    const key =
      entry.serviceId ||
      entry.maintenanceServiceId ||
      entry.subscriptionServiceId ||
      entry.id ||
      entry.serviceName ||
      `usage-${index}`;

    if (seen.has(key)) return;
    seen.add(key);

    deduped.push(normalizeServiceEntry(entry, key));
  });

  return deduped;
};

const computeMaintenanceView = (item = {}) => {
  const remainingKm = item.remainingKm ?? item.RemainingKm;
  const status = item.status || item.Status || "Normal";
  const message = item.message || item.Message || "";
  const distanceLabel =
    remainingKm != null && remainingKm > 0
      ? `Còn khoảng ${Number(remainingKm).toLocaleString()} km`
      : null;

  return {
    ...item,
    remainingKm,
    status,
    message,
    distanceLabel,
  };
};

const getStatusTag = (status) => {
  switch (status) {
    case "Urgent":
      return <Tag color="error">Urgent</Tag>;
    case "NeedAttention":
      return <Tag color="warning">Need Attention</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const getErrorMessage = (err, fallback = "Something went wrong") => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.Message ||
    err?.message ||
    fallback
  );
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const normalizeReminderServiceIds = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "object") {
          return toNumberOrNull(
            entry.serviceId ??
              entry.ServiceId ??
              entry.maintenanceServiceId ??
              entry.MaintenanceServiceId ??
              entry.id ??
              entry.service?.serviceId ??
              entry.service?.id
          );
        }
        return toNumberOrNull(entry);
      })
      .filter((v) => v !== null);
  }

  const single = toNumberOrNull(value);
  return single !== null ? [single] : [];
};

const buildReminderAppointmentPayload = (item = {}) => {
  const vehicleId =
    toNumberOrNull(item.vehicleId) ??
    toNumberOrNull(item.VehicleId) ??
    toNumberOrNull(item.id);

  const serviceCenterId =
    toNumberOrNull(item.serviceCenterId) ??
    toNumberOrNull(item.ServiceCenterId) ??
    toNumberOrNull(item.serviceCenterID) ??
    toNumberOrNull(item.preferredServiceCenterId) ??
    toNumberOrNull(item.PreferredServiceCenterId) ??
    toNumberOrNull(item.recommendedServiceCenterId) ??
    toNumberOrNull(item.RecommendedServiceCenterId) ??
    toNumberOrNull(item.serviceCenter?.serviceCenterId) ??
    toNumberOrNull(item.serviceCenter?.id);

  const slotId =
    toNumberOrNull(item.slotId) ??
    toNumberOrNull(item.SlotId) ??
    toNumberOrNull(item.recommendedSlotId) ??
    toNumberOrNull(item.RecommendedSlotId) ??
    toNumberOrNull(item.nextSlotId) ??
    toNumberOrNull(item.NextSlotId) ??
    toNumberOrNull(item.nextAvailableSlotId) ??
    toNumberOrNull(item.NextAvailableSlotId);

  const serviceIds = normalizeReminderServiceIds(
    item.serviceIds ??
      item.ServiceIds ??
      item.maintenanceServiceIds ??
      item.MaintenanceServiceIds ??
      item.serviceId ??
      item.ServiceId ??
      item.maintenanceServiceId ??
      item.MaintenanceServiceId ??
      item.services ??
      item.Services ??
      item.recommendedServiceIds ??
      item.RecommendedServiceIds ??
      item.recommendedServices
  );

  const packageId =
    toNumberOrNull(item.packageId) ??
    toNumberOrNull(item.PackageId) ??
    toNumberOrNull(item.subscriptionPackageId) ??
    toNumberOrNull(item.SubscriptionPackageId);

  const customerNotes =
    item.message || item.Message || item.note || item.Note || "";

  return {
    vehicleId,
    serviceCenterId,
    slotId,
    serviceIds,
    packageId,
    customerNotes,
  };
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // (giữ lại nếu có use sau này)

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleModalLoading, setVehicleModalLoading] = useState(false);
  const [vehicleModalError, setVehicleModalError] = useState("");
  const [modalVehicle, setModalVehicle] = useState(null);
  const [modalPackages, setModalPackages] = useState([]);
  const [modalServices, setModalServices] = useState([]);
  const [maintenanceStatuses, setMaintenanceStatuses] = useState({});
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [reminderSummary, setReminderSummary] = useState(null);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const [mileageModalVehicleId, setMileageModalVehicleId] = useState(null);
  const [mileageInput, setMileageInput] = useState(null);
  const [mileageModalSubmitting, setMileageModalSubmitting] = useState(false);
  const [modalMaintenanceStatus, setModalMaintenanceStatus] = useState(null);

  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [selectedSubscriptionTitle, setSelectedSubscriptionTitle] =
    useState("");
  const [subscriptionDetailLoading, setSubscriptionDetailLoading] =
    useState(false);
  const [subscriptionDetailError, setSubscriptionDetailError] = useState("");
  const [selectedSubscriptionDetail, setSelectedSubscriptionDetail] =
    useState(null);
  const [selectedSubscriptionUsage, setSelectedSubscriptionUsage] =
    useState(null);

  const subscriptionInfo = useMemo(() => {
    if (!selectedSubscriptionDetail) return null;
    if (selectedSubscriptionDetail.subscription)
      return selectedSubscriptionDetail.subscription;
    if (selectedSubscriptionDetail.data?.subscription)
      return selectedSubscriptionDetail.data.subscription;
    return selectedSubscriptionDetail;
  }, [selectedSubscriptionDetail]);

  const usageEntries = useMemo(
    () => extractUsageEntries(selectedSubscriptionUsage),
    [selectedSubscriptionUsage]
  );

  const usageDerivedServices = useMemo(
    () => deriveServicesFromUsage(usageEntries),
    [usageEntries]
  );

  const includedServices = useMemo(() => {
    const source = subscriptionInfo || selectedSubscriptionDetail;
    const fromDetail = extractSubscriptionServices(source || {});
    if (fromDetail.length > 0) return fromDetail;
    return usageDerivedServices;
  }, [subscriptionInfo, selectedSubscriptionDetail, usageDerivedServices]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Xóa localStorage cũ (không còn dùng nữa)
    localStorage.removeItem("deletedVehicles");

    loadDashboardData();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("✅ Page visible again - reloading data");
        loadDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const vehiclesRes = await appointmentService.getMyVehicles();
      console.log("✅ Vehicles from API:", vehiclesRes);

      // Robust extract list
      const rawVehicles = extractApiList(vehiclesRes);

      // Filter xe bị soft delete ở backend
      const mappedVehicles = rawVehicles
        .filter((vehicle) => {
          const isDeleted = vehicle.isDeleted || vehicle.IsDeleted || false;
          if (isDeleted) {
            console.log(
              `🗑️ Filtering out deleted vehicle: ${vehicle.licensePlate}`
            );
            return false;
          }
          return true;
        })
        .map((vehicle) => ({
          id: vehicle.vehicleId ?? vehicle.id,
          model: vehicle.fullModelName || vehicle.modelName,
          vin: vehicle.vin,
          year: vehicle.purchaseDate
            ? new Date(vehicle.purchaseDate).getFullYear()
            : null,
          nextService: vehicle.nextMaintenanceDate,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
          mileage: vehicle.mileage,
        }))
        .filter((v) => !!v.id);

      setVehicles(mappedVehicles);

      await Promise.all([
        fetchMaintenanceStatuses(),
        fetchMaintenanceReminders(),
      ]);
    } catch (err) {
      console.error("❌ Error loading dashboard data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceStatuses = async () => {
    try {
      setMaintenanceLoading(true);
      const res = await maintenanceService.getMyVehiclesMaintenanceStatus();

      const list =
        res?.data ||
        res?.Data ||
        (Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []);

      const map = {};
      list.forEach((item) => {
        const id = item.vehicleId || item.VehicleId;
        if (!id) return;

        map[id] = computeMaintenanceView({
          ...item,
          estimatedDaysUntilMaintenance:
            item.estimatedDaysUntilMaintenance ??
            item.EstimatedDaysUntilMaintenance,
          progressPercent:
            item.progressPercent ??
            item.ProgressPercent ??
            item.progress ??
            item.Progress,
          lastMaintenanceKm:
            item.lastMaintenanceKm ?? item.LastMaintenanceKm ?? null,
          lastMaintenanceDate:
            item.lastMaintenanceDate ?? item.LastMaintenanceDate ?? null,
          estimatedCurrentKm:
            item.estimatedCurrentKm ??
            item.EstimatedCurrentKm ??
            item.currentMileage ??
            item.CurrentMileage,
          nextMaintenanceKm:
            item.nextMaintenanceKm ?? item.NextMaintenanceKm ?? null,
          hasSufficientHistory:
            item.hasSufficientHistory ?? item.HasSufficientHistory,
          historyCount: item.historyCount ?? item.HistoryCount,
          estimatedNextMaintenanceDate:
            item.estimatedNextMaintenanceDate ??
            item.EstimatedNextMaintenanceDate ??
            null,
        });
      });

      setMaintenanceStatuses(map);
    } catch (err) {
      console.error("Failed to load maintenance status:", err);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const fetchMaintenanceReminders = async () => {
    try {
      setRemindersLoading(true);
      const res = await maintenanceService.getMaintenanceReminders();

      const data =
        res?.data ||
        res?.Data ||
        (Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []);

      const rawList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      const processed = rawList.map((item) => computeMaintenanceView(item));
      const summary = processed.reduce(
        (acc, cur) => {
          if (cur.status === "Urgent") acc.urgent += 1;
          else if (cur.status === "NeedAttention") acc.needsAttention += 1;
          else acc.normal += 1;
          return acc;
        },
        { urgent: 0, needsAttention: 0, normal: 0 }
      );

      setReminders(processed);
      setReminderSummary(summary);
    } catch (err) {
      console.error("Failed to load maintenance reminders:", err);
    } finally {
      setRemindersLoading(false);
    }
  };

  const handleEditVehicle = async (vehicleId, updatedData) => {
    try {
      console.log("✅ Attempting to edit vehicle ID:", vehicleId);

      const response = await appointmentService.updateMyVehicle(
        vehicleId,
        updatedData
      );
      console.log("✅ Vehicle updated successfully:", response);

      toast.success("✅ Cập nhật thông tin xe thành công!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } catch (error) {
      console.error("❌ Error editing vehicle:", error);

      let errorMessage = "Có lỗi xảy ra khi cập nhật xe. Vui lòng thử lại.";

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Dữ liệu không hợp lệ.";
      } else if (error.response?.status === 403) {
        errorMessage = "Bạn không có quyền sửa xe này.";
      } else if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy xe cần sửa.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      throw error;
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!vehicleId) return;

    const toastCfg = {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    };

    await toast.promise(
      (async () => {
        console.log("Attempting to delete vehicle ID:", vehicleId);
        const response = await appointmentService.deleteVehicle(vehicleId);
        console.log("Vehicle deleted (customer endpoint) response:", response);
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        setTimeout(() => loadDashboardData(), 600);
        return response;
      })(),
      {
        pending: "Deleting vehicle...",
        success: "Vehicle deleted successfully.",
        error: {
          render({ data }) {
            const error = data;
            if (error?.response?.status === 403)
              return "Bạn không có quyền xóa xe này.";
            if (error?.response?.status === 404)
              return "Không tìm thấy xe cần xóa.";
            if (error?.response?.status === 400)
              return "Không thể xóa xe có lịch hẹn hoặc phiếu công việc.";
            return getErrorMessage(error, "Không thể xóa xe. Vui lòng thử lại.");
          },
        },
      },
      toastCfg
    );
  };

  const openMileageModal = (vehicleId) => {
    if (!vehicleId) {
      toast.error("Could not find vehicle to update mileage.");
      return;
    }

    const status = maintenanceStatuses[vehicleId];
    const suggested =
      status?.estimatedCurrentKm ||
      status?.estimatedCurrentMileage ||
      status?.currentMileage ||
      "";
    const numericSuggested =
      suggested === "" || suggested === null || suggested === undefined
        ? null
        : Number(suggested);

    setMileageModalVehicleId(vehicleId);
    setMileageInput(
      Number.isNaN(numericSuggested) ? null : numericSuggested
    );
    setMileageModalOpen(true);
  };

  const closeMileageModal = () => {
    setMileageModalOpen(false);
    setMileageModalVehicleId(null);
    setMileageInput(null);
  };

  const submitMileageUpdate = async () => {
    const value = mileageInput;
    const vehicleId = mileageModalVehicleId;

    if (value === null || value === undefined || value === "") {
      toast.error("Please enter mileage.");
      return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error("Mileage is not valid.");
      return;
    }

    try {
      setMileageModalSubmitting(true);
      await toast.promise(
        maintenanceService.updateVehicleMileage(vehicleId, {
          currentMileage: parsed,
        }),
        {
          pending: "Updating mileage...",
          success: {
            render({ data }) {
              const msg =
                data?.data?.message ||
                data?.message ||
                `Mileage updated to ${parsed.toLocaleString()} km.`;
              return msg;
            },
          },
          error: {
            render({ data }) {
              return getErrorMessage(data, "Unable to update mileage.");
            },
          },
        }
      );
      closeMileageModal();
      await Promise.all([
        fetchMaintenanceStatuses(),
        fetchMaintenanceReminders(),
      ]);
    } catch (error) {
      // toast.promise already shows the error toast.
      // We catch the error here to prevent an uncaught promise rejection crash.
      console.error("Handled mileage update error:", error);
    } finally {
      setMileageModalSubmitting(false);
    }
  };

  const handleReminderMileageUpdate = (reminder) => {
    const vehicleId =
      reminder?.vehicleId || reminder?.VehicleId || reminder?.id || null;
    if (!vehicleId) {
      toast.error(
        "Could not find vehicle ID for this reminder to update mileage."
      );
      return;
    }

    openMileageModal(vehicleId);
  };

  const handleBookReminderAppointment = async (reminder) => {
    const payload = buildReminderAppointmentPayload(reminder);
    const vehicleId = payload.vehicleId;

    if (!vehicleId) {
      toast.error("Khong tim thay vehicleId cua nhac nho.");
      return;
    }

    navigate("/schedule-service", {
      state: {
        vehicleId,
        fromReminder: true,
      },
    });
  };

  const handleViewVehicleDetails = async (vehicle) => {
    if (!vehicle) return;

    const vehicleId = vehicle.id || vehicle.vehicleId;

    setModalVehicle(vehicle);
    setShowVehicleModal(true);
    setVehicleModalLoading(true);
    setVehicleModalError("");
    setModalMaintenanceStatus(null);

    try {
      const [packagesRes, servicesRes, statusRes] = await Promise.all([
        getActiveSubscriptionsByVehicle(vehicleId),
        getApplicableServicesByVehicle(vehicleId),
        maintenanceService.getVehicleMaintenanceStatus(vehicleId),
      ]);

      setModalPackages(extractApiList(packagesRes));
      setModalServices(extractApiList(servicesRes));
      setModalMaintenanceStatus(
        computeMaintenanceView(statusRes?.data || statusRes)
      );
    } catch (err) {
      console.error("Error loading vehicle entitlements:", err);
      setVehicleModalError("Không thể tải dữ liệu gói và dịch vụ cho xe này.");
      setModalPackages([]);
      setModalServices([]);
    } finally {
      setVehicleModalLoading(false);
    }
  };

  const handleViewSubscriptionDetail = async (subscription) => {
    const subscriptionId = subscription?.subscriptionId || subscription?.id;
    if (!subscriptionId) {
      toast.error("Không tìm thấy thông tin subscription để xem chi tiết.");
      return;
    }

    const sameSelection = subscriptionId === selectedSubscriptionId;
    if (
      sameSelection &&
      selectedSubscriptionDetail &&
      !subscriptionDetailLoading
    ) {
      // Collapse nếu đang mở
      setSelectedSubscriptionId(null);
      setSelectedSubscriptionTitle("");
      setSelectedSubscriptionDetail(null);
      setSelectedSubscriptionUsage(null);
      setSubscriptionDetailError("");
      return;
    }

    setSelectedSubscriptionId(subscriptionId);
    setSelectedSubscriptionTitle(
      subscription.packageName || subscription.name || "Subscription"
    );
    setSubscriptionDetailLoading(true);
    setSubscriptionDetailError("");
    setSelectedSubscriptionDetail(null);
    setSelectedSubscriptionUsage(null);

    try {
      const [detailRes, usageRes] = await Promise.all([
        getSubscriptionDetail(subscriptionId),
        getSubscriptionUsage(subscriptionId),
      ]);
      setSelectedSubscriptionDetail(detailRes?.data || detailRes);
      setSelectedSubscriptionUsage(usageRes?.data || usageRes);
    } catch (err) {
      console.error("Error loading subscription detail:", err);
      setSubscriptionDetailError(
        "Không thể tải chi tiết gói. Vui lòng thử lại sau."
      );
    } finally {
      setSubscriptionDetailLoading(false);
    }
  };

  const closeVehicleModal = () => {
    setShowVehicleModal(false);
    setVehicleModalLoading(false);
    setVehicleModalError("");
    setModalVehicle(null);
    setModalPackages([]);
    setModalServices([]);
    setSelectedSubscriptionId(null);
    setSelectedSubscriptionTitle("");
    setSelectedSubscriptionDetail(null);
    setSelectedSubscriptionUsage(null);
    setSubscriptionDetailLoading(false);
    setSubscriptionDetailError("");
    setModalMaintenanceStatus(null);
  };

  const renderReminderActions = (item) => {
    const status = item.status || item.Status || "Normal";
    const vehicleId = item.vehicleId || item.VehicleId || item.id;

    const actions = [];

    if (status === "Urgent") {
      actions.push(
        <Button
          key="book-now"
          type="primary"
          danger
          size="small"
          onClick={() => handleBookReminderAppointment(item)}
        >
          Book now
        </Button>
      );
      actions.push(
        <Button
          key="update-km"
          size="small"
          onClick={() => handleReminderMileageUpdate(item)}
        >
          Update mileage
        </Button>
      );
    } else if (status === "NeedAttention") {
      actions.push(
        <Button
          key="book"
          type="primary"
          size="small"
          onClick={() => handleBookReminderAppointment(item)}
        >
          Schedule
        </Button>
      );
      actions.push(
        <Button
          key="update-km"
          size="small"
          onClick={() => handleReminderMileageUpdate(item)}
        >
          Update mileage
        </Button>
      );
    }

    actions.push(
      <div key="status" style={{ minWidth: "90px", textAlign: "right" }}>
        {getStatusTag(status)}
      </div>
    );

    return actions;
  };

  return (
    <MainLayout>
      <div
        className="dashboard-container"
        style={{ marginTop: "20px", minHeight: "60vh" }}
      >
        <div className="container">
          <header className="dashboard-header mb-5">
            <h1
              className="mb-2 text-center"
              style={{ fontSize: "2rem", fontWeight: 600 }}
            >
              Welcome,{" "}
              {user?.fullName || user?.name || user?.username || "Khách hàng"}!
            </h1>
          </header>

          <div className="dashboard-content">
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                ></button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <section className="dashboard-section mb-4">
                  <Card
                    title={
                      <h2
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        Maintenance Reminders
                      </h2>
                    }
                    extra={
                      <Button
                        onClick={() => fetchMaintenanceReminders()}
                        disabled={remindersLoading}
                      >
                        Refresh
                      </Button>
                    }
                  >
                    {remindersLoading ? (
                      <Skeleton active paragraph={{ rows: 3 }} />
                    ) : reminders.length > 0 ? (
                      <>
                        <div
                          style={{ marginBottom: "16px", fontWeight: "bold" }}
                        >
                          <span>{reminderSummary?.urgent || 0} urgent</span> /{" "}
                          <span>
                            {reminderSummary?.needsAttention || 0} need
                            attention
                          </span>
                        </div>

                        <List
                          itemLayout="horizontal"
                          dataSource={reminders}
                          renderItem={(item) => (
                            <List.Item actions={renderReminderActions(item)}>
                              <List.Item.Meta
                                title={
                                  item.licensePlate || item.LicensePlate || "Xe"
                                }
                                description={
                                  <>
                                    {item.message || item.Message || ""}
                                    {item.distanceLabel
                                      ? ` • ${item.distanceLabel}`
                                      : ""}
                                  </>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </>
                    ) : (
                      <Result
                        status="success"
                        title="All caught up!"
                        subTitle="No maintenance reminders at the moment."
                      />
                    )}
                  </Card>
                </section>

                <section className="dashboard-section mb-5">
                  <h2
                    className="mb-4"
                    style={{ fontSize: "1.5rem", fontWeight: 600 }}
                  >
                    Your Vehicles
                  </h2>

                  <div>
                    {vehicles.length > 0 ? (
                      <div
                        className="vehicles-grid d-flex flex-wrap"
                        style={{ gap: "0.75rem" }}
                      >
                        {vehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            style={{ width: "calc(50% - 0.375rem)" }}
                          >
                            <VehicleFlipCard
                              vehicle={vehicle}
                              onEdit={handleEditVehicle}
                              onDelete={handleDeleteVehicle}
                              onViewDetails={() =>
                                handleViewVehicleDetails(vehicle)
                              }
                              maintenanceStatus={
                                maintenanceStatuses[vehicle.id]
                              }
                              onUpdateMileage={() =>
                                openMileageModal(vehicle.id)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        You have not registered any vehicles yet.{" "}
                        <Link to="/register-vehicle">
                          Register a vehicle now
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {showVehicleModal && (
        <div className="vehicle-modal-backdrop" role="dialog" aria-modal="true">
          <div className="vehicle-modal">
            <div className="vehicle-modal-header">
              <div>
                <p className="vehicle-modal-kicker">Gói & dịch vụ</p>
                <h3 className="vehicle-modal-title">
                  {modalVehicle?.model || "Vehicle"}
                </h3>
                <div className="vehicle-meta-row">
                  <span className="pill">
                    {modalVehicle?.licensePlate || "N/A"}
                  </span>
                  <span className="pill pill-ghost">
                    VIN: {modalVehicle?.vin || "N/A"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="vehicle-modal-close"
                aria-label="Close"
                onClick={closeVehicleModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {vehicleModalError && (
              <div className="alert alert-danger">{vehicleModalError}</div>
            )}

            {vehicleModalLoading ? (
              <div className="vehicle-modal-loading">
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              <div className="vehicle-modal-grid">
                {modalMaintenanceStatus && (
                  <div className="vehicle-modal-card">
                    <div className="vehicle-card-header">
                      <div>
                        <p className="vehicle-card-kicker">Bảo dưỡng</p>
                        <h4>
                          {modalMaintenanceStatus.status ||
                            modalMaintenanceStatus.Status ||
                            "Status"}
                        </h4>
                      </div>
                    </div>

                    <p className="maintenance-message">
                      {modalMaintenanceStatus.message ||
                        modalMaintenanceStatus.Message ||
                        "No message"}
                    </p>

                    <div
                      className="subscription-info-grid"
                      style={{ marginTop: "12px" }}
                    >
                      <div>
                        <p className="muted-label">Còn lại</p>
                        <strong>
                          {modalMaintenanceStatus.remainingKm != null
                            ? `${Number(
                                modalMaintenanceStatus.remainingKm
                              ).toLocaleString()} km`
                            : "-"}
                        </strong>
                      </div>

                      <div>
                        <p className="muted-label">Dự kiến còn</p>
                        <strong>
                          {modalMaintenanceStatus.estimatedDaysUntilMaintenance >
                          0
                            ? `~${modalMaintenanceStatus.estimatedDaysUntilMaintenance} ngày`
                            : "-"}
                        </strong>
                      </div>

                      <div>
                        <p className="muted-label">Mốc km kế tiếp</p>
                        <strong>
                          {modalMaintenanceStatus.nextMaintenanceKm != null
                            ? `${Number(
                                modalMaintenanceStatus.nextMaintenanceKm
                              ).toLocaleString()} km`
                            : "-"}
                        </strong>
                      </div>

                      <div>
                        <p className="muted-label">Ngày dự kiến</p>
                        <strong>
                          {modalMaintenanceStatus.estimatedNextMaintenanceDate
                            ? new Date(
                                modalMaintenanceStatus.estimatedNextMaintenanceDate
                              ).toLocaleDateString("vi-VN")
                            : "-"}
                        </strong>
                      </div>

                      <div>
                        <p className="muted-label">Lần cuối</p>
                        <strong>
                          {modalMaintenanceStatus.lastMaintenanceDate
                            ? new Date(
                                modalMaintenanceStatus.lastMaintenanceDate
                              ).toLocaleDateString("vi-VN")
                            : "-"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="vehicle-modal-card">
                  <div className="vehicle-card-header">
                    <div>
                      <p className="vehicle-card-kicker">Gói đang kích hoạt</p>
                      <h4>Active combo packages</h4>
                    </div>
                  </div>

                  {modalPackages.length > 0 ? (
                    <div className="combo-list">
                      {modalPackages.map((pkg) => (
                        <div
                          className="combo-item"
                          key={pkg.subscriptionId || pkg.packageId || pkg.id}
                        >
                          <div className="combo-title-row">
                            <h5>{pkg.packageName || pkg.name}</h5>
                            <span className="status-badge">
                              {pkg.statusName || pkg.status || "Active"}
                            </span>
                          </div>

                          <div className="combo-meta">
                            Hiệu lực:{" "}
                            {pkg.startDate
                              ? new Date(pkg.startDate).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "—"}{" "}
                            -{" "}
                            {pkg.expiryDate
                              ? new Date(pkg.expiryDate).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "—"}
                          </div>

                          <button
                            type="button"
                            className="subscription-detail-btn"
                            onClick={() => handleViewSubscriptionDetail(pkg)}
                          >
                            {selectedSubscriptionId ===
                            (pkg.subscriptionId || pkg.packageId || pkg.id)
                              ? "Thu gọn"
                              : "Xem chi tiết"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="vehicle-modal-empty">
                      Chưa có combo đang hoạt động cho xe này.
                    </p>
                  )}
                </div>

                <div className="vehicle-modal-card">
                  <div className="vehicle-card-header">
                    <div>
                      <p className="vehicle-card-kicker">Dịch vụ đi kèm</p>
                      <h4>Services included</h4>
                    </div>
                  </div>

                  {modalServices.length > 0 ? (
                    <div className="vehicle-modal-tags">
                      {modalServices.map((service) => (
                        <span
                          key={
                            service.serviceId ||
                            service.maintenanceServiceId ||
                            service.id
                          }
                        >
                          {service.serviceName || service.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="vehicle-modal-empty">
                      Chưa có dịch vụ nào cho xe này (hoặc chưa mua combo).
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedSubscriptionId && !vehicleModalLoading && (
              <div className="vehicle-modal-card">
                <div className="vehicle-card-header">
                  <div>
                    <p className="vehicle-card-kicker">Thông tin gói</p>
                    <h4>{selectedSubscriptionTitle || "Subscription"}</h4>
                  </div>
                </div>

                {subscriptionDetailError && (
                  <div className="alert alert-danger">
                    {subscriptionDetailError}
                  </div>
                )}

                {subscriptionDetailLoading ? (
                  <div className="vehicle-modal-loading">
                    <div className="spinner-border text-dark" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                ) : selectedSubscriptionDetail ? (
                  <>
                    <div className="subscription-info-grid">
                      <div>
                        <p className="muted-label">Mã gói</p>
                        <strong>
                          {subscriptionInfo?.subscriptionCode ||
                            subscriptionInfo?.code ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <p className="muted-label">Trạng thái</p>
                        <strong>
                          {subscriptionInfo?.statusName ||
                            subscriptionInfo?.status ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <p className="muted-label">Kích hoạt</p>
                        <strong>
                          {formatDate(
                            subscriptionInfo?.startDate ||
                              subscriptionInfo?.activatedAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <p className="muted-label">Hết hạn</p>
                        <strong>
                          {formatDate(
                            subscriptionInfo?.expiryDate ||
                              subscriptionInfo?.endDate
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="vehicle-modal-section">
                      <h5>Services in this package</h5>
                      {includedServices.length > 0 ? (
                        <ul className="vehicle-modal-list">
                          {includedServices.map((service, index) => {
                            const total = service.includedUses ?? null;
                            const remaining = service.remainingUses ?? null;
                            const used =
                              total != null && remaining != null
                                ? Math.max(total - remaining, 0)
                                : service.usedCount ?? 0;

                            const progress = total
                              ? Math.min(100, Math.round((used / total) * 100))
                              : service.usagePercentage != null
                              ? Math.min(
                                  100,
                                  Math.round(service.usagePercentage)
                                )
                              : null;

                            return (
                              <li
                                key={service.serviceId || service.id || index}
                              >
                                <div className="service-row">
                                  <div>
                                    <span>
                                      {service.serviceName || "Service"}
                                    </span>
                                    <div className="muted-label mt-1">
                                      {total != null
                                        ? `Tổng: ${total}`
                                        : "Chưa có quota"}
                                      {remaining != null
                                        ? ` • Còn: ${remaining}`
                                        : ""}
                                      {service.lastUsedDate
                                        ? ` • Lần cuối: ${formatDate(
                                            service.lastUsedDate
                                          )}`
                                        : ""}
                                    </div>
                                  </div>

                                  {progress !== null && (
                                    <span className="pill pill-ghost">
                                      {progress}% used
                                    </span>
                                  )}
                                </div>

                                {progress !== null && (
                                  <div className="usage-bar">
                                    <div
                                      className="usage-bar-fill"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="vehicle-modal-empty">
                          Không tìm thấy danh sách dịch vụ của gói này.
                        </p>
                      )}
                    </div>

                    <div className="vehicle-modal-section">
                      <h5>Usage history</h5>
                      {usageEntries.length > 0 ? (
                        <ul className="vehicle-modal-list">
                          {usageEntries.map((entry, index) => (
                            <li key={entry.usageId || entry.serviceId || index}>
                              <div>
                                <strong>
                                  {entry.serviceName || entry.name || "Dịch vụ"}
                                </strong>
                              </div>
                              <small>
                                Đã dùng:{" "}
                                {entry.usedCount ??
                                  entry.timesUsed ??
                                  entry.quantityUsed ??
                                  entry.usageCount ??
                                  0}
                                {entry.remainingUses ?? entry.remainingCount
                                  ? ` • Còn lại: ${
                                      entry.remainingUses ??
                                      entry.remainingCount
                                    }`
                                  : ""}
                                {entry.lastUsedDate || entry.usedAt
                                  ? ` • Lần cuối: ${formatDate(
                                      entry.lastUsedDate || entry.usedAt
                                    )}`
                                  : ""}
                              </small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="vehicle-modal-empty">
                          Chưa có lịch sử sử dụng cho gói này.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  !subscriptionDetailError && (
                    <p className="vehicle-modal-empty">
                      Chọn &quot;Xem chi tiết&quot; để tải thông tin gói.
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={mileageModalOpen}
        title="Update mileage"
        okText="Update"
        cancelText="Cancel"
        confirmLoading={mileageModalSubmitting}
        onOk={submitMileageUpdate}
        onCancel={closeMileageModal}
        destroyOnClose
      >
        <p style={{ marginBottom: 8 }}>
          Enter current odometer (km) for this vehicle.
        </p>
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          step={100}
          value={mileageInput}
          onChange={(val) => setMileageInput(val ?? null)}
          placeholder="Enter mileage"
        />
      </Modal>
    </MainLayout>
  );
};

export default CustomerDashboard;
