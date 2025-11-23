// src/pages/customer/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import VehicleFlipCard from "../../components/VehicleFlipCard";
import appointmentService from "../../services/appointmentService";
import {
  getActiveSubscriptionsByVehicle,
  getApplicableServicesByVehicle,
  getSubscriptionDetail,
  getSubscriptionUsage,
} from "../../services/productService";
import MainLayout from "../../components/layout/MainLayout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../Home.css";
import "./Dashboard.css";

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
};

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
    return value;
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

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleModalLoading, setVehicleModalLoading] = useState(false);
  const [vehicleModalError, setVehicleModalError] = useState("");
  const [modalVehicle, setModalVehicle] = useState(null);
  const [modalPackages, setModalPackages] = useState([]);
  const [modalServices, setModalServices] = useState([]);

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

    // Reload data when user navigates back to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👀 Page visible again - reloading data");
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

      console.log("🚗 Vehicles from API:", vehiclesRes);

      // Map vehicles to dashboard format - chỉ filter xe đã xóa từ backend
      const mappedVehicles = (vehiclesRes.data || [])
        .filter((vehicle) => {
          // Chỉ filter out backend soft-deleted vehicles
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
          id: vehicle.vehicleId,
          model: vehicle.fullModelName || vehicle.modelName,
          vin: vehicle.vin,
          year: vehicle.purchaseDate
            ? new Date(vehicle.purchaseDate).getFullYear()
            : null,
          nextService: vehicle.nextMaintenanceDate,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
          mileage: vehicle.mileage,
        }));

      setVehicles(mappedVehicles);
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = async (vehicleId, updatedData) => {
    try {
      console.log("✏️ Attempting to edit vehicle ID:", vehicleId);

      const response = await appointmentService.updateMyVehicle(
        vehicleId,
        updatedData
      );
      console.log("✅ Vehicle updated successfully:", response);

      toast.success("✏️ Cập nhật thông tin xe thành công!", {
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

    try {
      console.log("Attempting to delete vehicle ID:", vehicleId);
      const response = await appointmentService.deleteVehicle(
        vehicleId
      );
      console.log("Vehicle deleted (customer endpoint) response:", response);

      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      toast.success("Đã xóa xe thành công.", toastCfg);
      setTimeout(() => loadDashboardData(), 600);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        (error.response?.status === 403
          ? "Bạn không có quyền xóa xe này."
          : error.response?.status === 404
          ? "Không tìm thấy xe cần xóa."
          : error.response?.status === 400
          ? "Không thể xóa xe có lịch hẹn hoặc phiếu công việc."
          : "Không thể xóa xe. Vui lòng thử lại.");
      toast.error(errMsg, toastCfg);
    }
  };

  const handleViewVehicleDetails = async (vehicle) => {
    if (!vehicle) return;
    const vehicleId = vehicle.id || vehicle.vehicleId;
    setModalVehicle(vehicle);
    setShowVehicleModal(true);
    setVehicleModalLoading(true);
    setVehicleModalError("");
    try {
      const [packagesRes, servicesRes] = await Promise.all([
        getActiveSubscriptionsByVehicle(vehicleId),
        getApplicableServicesByVehicle(vehicleId),
      ]);
      setModalPackages(extractApiList(packagesRes));
      setModalServices(extractApiList(servicesRes));
    } catch (err) {
      console.error("Error loading vehicle entitlements:", err);
      setVehicleModalError(
        "Unable to load package and service data for this vehicle."
      );
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
      // Collapse if already showing
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
  };

  return (
    <MainLayout>
      {/* Dashboard Content */}
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
            {/* <p className="text-muted">Quản lý thông tin xe và lịch dịch vụ của bạn</p> */}
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
                          key={pkg.subscriptionId || pkg.packageId}
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
                            (pkg.subscriptionId || pkg.packageId)
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
                                        ? ` · Còn: ${remaining}`
                                        : ""}
                                      {service.lastUsedDate
                                        ? ` · Lần cuối: ${formatDate(
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
                                  ? ` · Còn lại: ${
                                      entry.remainingUses ??
                                      entry.remainingCount
                                    }`
                                  : ""}
                                {entry.lastUsedDate || entry.usedAt
                                  ? ` · Lần cuối: ${formatDate(
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
    </MainLayout>
  );
};

export default CustomerDashboard;

