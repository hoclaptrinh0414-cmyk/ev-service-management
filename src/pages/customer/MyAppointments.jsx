// src/pages/customer/MyAppointments.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import appointmentService from "../../services/appointmentService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  Tag,
  Button,
  Modal,
  DatePicker,
  Select,
  Spin,
  Row,
  Col,
  Space,
  Pagination,
  Input,
  Divider,
} from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Home.css";
import "./MyAppointments.css";
import MainLayout from "../../components/layout/MainLayout";

const statusMap = {
  pending: {
    color: "#faad14",
    text: "Pending confirmation",
    icon: "clock-history",
  },
  confirmed: { color: "#1890ff", text: "Confirmed", icon: "check-circle" },
  rescheduled: { color: "#fa8c16", text: "Rescheduled", icon: "arrow-repeat" },
  inprogress: { color: "#722ed1", text: "In progress", icon: "gear" },
  completed: { color: "#52c41a", text: "Completed", icon: "check-all" },
  completed_partial: {
    color: "#13c2c2",
    text: "Completed (unpaid)",
    icon: "check2-circle",
  },
  cancelled: { color: "#f5222d", text: "Cancelled", icon: "x-circle" },
  noshow: { color: "#595959", text: "No-show", icon: "dash-circle" },
  unknown: { color: "#d9d9d9", text: "Unknown", icon: "question-circle" },
};

const statusIdMap = {
  1: "pending",
  2: "confirmed",
  3: "inprogress",
  4: "inprogress",
  5: "completed",
  6: "cancelled",
  7: "rescheduled",
  8: "noshow",
  9: "completed_partial",
};

const canonicalStatus = (status) => {
  const raw = (status || "").toString().trim().toLowerCase();
  if (["pending", "pendingpayment", "awaitingpayment"].includes(raw))
    return "pending";
  if (["confirmed"].includes(raw)) return "confirmed";
  if (["rescheduled", "reschedule"].includes(raw)) return "rescheduled";
  if (["inprogress", "processing", "ongoing"].includes(raw))
    return "inprogress";
  if (["completed"].includes(raw)) return "completed";
  if (
    [
      "completedwithunpaidbalance",
      "completed_partial",
      "completedpartiallypaid",
    ].includes(raw)
  )
    return "completed_partial";
  if (
    [
      "cancelled",
      "canceled",
      "cancelledbystaff",
      "cancelled_by_staff",
      "customer_cancelled",
    ].includes(raw)
  )
    return "cancelled";
  if (["noshow", "no_show", "no-show"].includes(raw)) return "noshow";
  return raw || "unknown";
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'upcoming'
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc"); // dateAsc | dateDesc
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD
  const [licensePlateFilter, setLicensePlateFilter] = useState("");

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeCenters, setActiveCenters] = useState([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const toastConfig = {
    autoClose: 10000,
    closeOnClick: true,
    pauseOnHover: true,
  };

  const normalizeStatus = (status) => {
    if (status === undefined || status === null) return "unknown";
    if (typeof status === "number") return statusIdMap[status] || "unknown";
    return canonicalStatus(status);
  };

  const canReschedule = (status) => {
    const canon = normalizeStatus(status);
    return ["pending", "confirmed", "inprogress"].includes(canon);
  };

  const canCancel = (status) => {
    const canon = normalizeStatus(status);
    return ["pending", "confirmed"].includes(canon);
  };

  const renderPagination = () => {
    const hasMultiple = totalPages > 1 || totalCount > pageSize;
    if (!hasMultiple) return null;

    return (
      <div className="d-flex flex-wrap align-items-center justify-content-between my-3">
        <div className="text-muted small">
          Page {page}/{totalPages} - {totalCount} appointments
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0 small text-muted">Page size</label>
          <select
            className="form-select form-select-sm"
            style={{ width: "90px" }}
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            disabled={loading}
          >
            {[6, 9, 12, 15].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="btn-group btn-group-sm">
            <button
              className="btn btn-outline-dark"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="btn btn-outline-dark"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCenters();
  }, []);

  useEffect(() => {
    // Reset trang khi đổi filter
    setPage(1);
  }, [activeTab, statusFilter, sortBy, dateFilter, licensePlateFilter]);

  useEffect(() => {
    loadAppointments();
  }, [
    activeTab,
    statusFilter,
    sortBy,
    dateFilter,
    licensePlateFilter,
    page,
    pageSize,
  ]);

  const loadAppointments = async () => {
    const statusMapIds = {
      pending: 1,
      confirmed: 2,
      inprogress: 4,
      completed: 5,
      cancelled: 6,
      rescheduled: 7,
      noshow: 8,
      completed_partial: 9,
    };

    const params = {
      page,
      pageSize,
      sortBy: "appointmentDate",
      sortOrder: sortBy === "dateAsc" ? "asc" : "desc",
    };

    if (statusFilter !== "all" && statusMapIds[statusFilter]) {
      params.statusId = statusMapIds[statusFilter];
    }

    if (activeTab === "upcoming") {
      params.startDate = new Date().toISOString().split("T")[0];
    }

    if (dateFilter) {
      params.startDate = dateFilter;
      params.endDate = dateFilter;
    }

    const plate = licensePlateFilter.trim();
    if (plate) {
      params.licensePlate = plate;
      params.vehicleLicensePlate = plate;
    }

    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments(params);
      const payload = response?.data?.data || response?.data || response || {};
      console.log("API Response Payload:", payload);
      const items = payload.items || payload.data || payload || [];
      console.log("Extracted Items:", items);

      const filteredItems = items.filter((item) => {
        const dateMatches =
          !dateFilter ||
          (item.appointmentDate || item.slotDate || "")
            .toString()
            .slice(0, 10) === dateFilter;

        const plateInput = normalizePlate(licensePlateFilter);
        const plateValue = normalizePlate(
          item.vehicleLicensePlate ||
            item.licensePlate ||
            item.vehiclePlate ||
            ""
        );
        const plateMatches = !plateInput || plateValue.includes(plateInput);

        return dateMatches && plateMatches;
      });

      setAppointments(filteredItems);
      const total =
        filteredItems.length ||
        payload.totalCount ||
        payload.TotalCount ||
        items.length ||
        0;
      setTotalCount(total);
      console.log("Total Count (filtered):", total);
      const pages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
      setTotalPages(pages);
      console.log("Total Pages (filtered):", pages);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setMessage("Unable to load appointments. Please try again.");
      toast.error("Unable to load appointments. Please try again.", toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const loadCenters = async () => {
    const extract = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.data?.items)) return payload.data.items;
      return [];
    };

    try {
      setCentersLoading(true);

      const res = await appointmentService.getActiveServiceCenters();
      let centers = extract(res);

      if (!centers.length) {
        // fallback to full list
        const all = await appointmentService.getServiceCenters?.();
        centers = extract(all);
      }

      setActiveCenters(centers);
    } catch (error) {
      console.error("Error loading centers:", error);
      setActiveCenters([]);
      toast.warning(
        "Unable to load service centers. Please try again.",
        toastConfig
      );
    } finally {
      setCentersLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const canon = canonicalStatus(status);
    const info = statusMap[canon] || statusMap.unknown;
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString("vi-VN");
    } catch {
      return value;
    }
  };

  const formatTimeRange = (start, end) => {
    if (!start || !end) return "";
    return `${start} - ${end}`;
  };

  const normalizePlate = (value) =>
    (value || "").toString().trim().toLowerCase().replace(/[\s-]/g, "");

  const filterControlStyle = {
    borderRadius: 25,
    border: "1px solid #000",
  };

  const getPaymentStatusColor = (status) => {
    const s = (status || "").toString().trim().toLowerCase();
    if (["paid", "success", "completed"].includes(s)) return "#52c41a"; // green
    if (["failed", "error", "declined"].includes(s)) return "#f5222d"; // red
    if (["pending", "processing", "inprogress"].includes(s)) return "#faad14"; // amber
    return "#1890ff"; // default blue
  };

  const handleReschedule = async (appointment) => {
    if (!appointment) return;
    if (
      !canReschedule(
        appointment.statusName || appointment.statusId || appointment.status
      )
    ) {
      toast.info(
        "Only Pending/Confirmed/In progress appointments can be rescheduled.",
        toastConfig
      );
      return;
    }
    const defaultDate =
      appointment.slotDate || appointment.appointmentDate || "";
    await loadCenters();
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    setMessage("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setSelectedCenterId(appointment.serviceCenterId || undefined);
    setRescheduleDate(defaultDate ? defaultDate.toString().split("T")[0] : "");
    setRescheduleReason("");
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
    setMessage("");
    setCancelReason("");
  };

  const loadSlotsForReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !selectedCenterId) return;

    try {
      const response = await appointmentService.getAvailableSlots(
        selectedCenterId,
        rescheduleDate
      );
      const slots = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setAvailableSlots(slots);
      if (!slots.length) {
        setMessage("No slots available for this center on the selected day.");
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
      setMessage(
        "Unable to load time slots. Please try again or pick another center/date."
      );
    }
  };

  useEffect(() => {
    loadSlotsForReschedule();
  }, [rescheduleDate, selectedCenterId]);

  // No need to re-fetch centers per date because BE /service-centers/available is 403; use active list once.

  const confirmReschedule = async () => {
    if (!selectedCenterId) {
      setMessage("Please choose a service center.");
      return;
    }
    if (!rescheduleDate) {
      setMessage("Please choose a date.");
      return;
    }
    if (!selectedSlot) {
      setMessage("Please choose a time slot.");
      return;
    }

    try {
      setLoading(true);
      const res = await appointmentService.rescheduleAppointment(
        selectedAppointment.appointmentId,
        selectedSlot.slotId,
        rescheduleReason || "Customer requested reschedule"
      );
      const newId =
        res?.data?.appointmentId ||
        res?.data?.newAppointmentId ||
        res?.appointmentId ||
        res?.newAppointmentId;
      const successMsg = newId
        ? `Rescheduled successfully. New appointment #${newId}`
        : "Rescheduled successfully!";
      setMessage(successMsg);
      toast.success(successMsg, toastConfig);
      setShowRescheduleModal(false);
      loadAppointments();
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Error rescheduling:", error);
      const errMsg =
        error.response?.data?.message ||
        "Unable to reschedule. Please try again.";
      setMessage(errMsg);
      toast.error(errMsg, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      setMessage("Please enter a cancellation reason.");
      return;
    }

    try {
      setLoading(true);
      await appointmentService.cancelAppointment(
        selectedAppointment.appointmentId,
        cancelReason
      );
      setMessage("Appointment cancelled successfully!");
      toast.success("Appointment cancelled.", toastConfig);
      setShowCancelModal(false);
      setCancelReason("");
      loadAppointments();
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Error cancelling:", error);
      const errMsg =
        error.response?.data?.message ||
        "Unable to cancel this appointment. Please try again.";
      setMessage(errMsg);
      toast.error(errMsg, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!pendingDeleteId) return;

    try {
      setLoading(true);
      await appointmentService.deleteAppointment(pendingDeleteId);
      setMessage("Appointment deleted successfully!");
      toast.success("Appointment deleted.", toastConfig);
      loadAppointments();
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Error deleting:", error);
      const errMsg =
        error.response?.data?.message ||
        "Unable to delete this appointment. Only pending appointments can be removed.";
      setMessage(errMsg);
      toast.error(errMsg, toastConfig);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  const loadAppointmentDetail = async (appointmentId) => {
    try {
      setDetailLoading(true);
      const response = await appointmentService.getAppointmentById(
        appointmentId
      );
      const payload = response?.data || response || {};
      setDetailData(payload);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading appointment detail:", error);
      toast.error("Unable to load appointment details.", toastConfig);
    } finally {
      setDetailLoading(false);
    }
  };

  const renderDetailRow = (label, value) => (
    <div style={{ marginBottom: 8 }}>
      <strong>{label}: </strong>
      <span>{value || "N/A"}</span>
    </div>
  );

  const renderDetailServices = (services = []) => {
    if (!services.length)
      return <div className="text-muted">Chưa có thông tin dịch vụ</div>;

    if (services.length === 1) {
      const s = services[0];
      return (
        <Card
          size="small"
          style={{ background: "#f9fafb", borderColor: "#e5e7eb" }}
          title={
            <span>
              <i className="bi bi-wrench me-1" />
              {s.serviceName || s.name || "Dịch vụ"}
            </span>
          }
        >
          <Space direction="vertical" size={4}>
            <div>
              <strong>Mã:</strong> {s.serviceCode || "N/A"}
            </div>
            <div>
              <strong>Loại:</strong> {s.serviceSource || "N/A"}
            </div>
            {s.price !== undefined && (
              <div>
                <strong>Giá:</strong> {formatCurrency(s.price)}
              </div>
            )}
            {s.estimatedTime && (
              <div>
                <strong>Thời lượng:</strong> {s.estimatedTime} phút
              </div>
            )}
            {s.notes && (
              <div className="text-muted">
                <em>{s.notes}</em>
              </div>
            )}
          </Space>
        </Card>
      );
    }

    return (
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        {services.map((s, idx) => (
          <div
            key={idx}
            style={{
              padding: "8px 10px",
              background: "#f9fafb",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {s.serviceName || s.name || "Dịch vụ"}{" "}
              <span className="text-muted">({s.serviceCode || "N/A"})</span>
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Loại: {s.serviceSource || "N/A"} • Giá:{" "}
              {s.price !== undefined ? formatCurrency(s.price) : "N/A"} • Thời
              lượng: {s.estimatedTime || "N/A"} phút
            </div>
          </div>
        ))}
      </Space>
    );
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "N/A";
    return Number(value).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <MainLayout>

      {/* Main Content */}
      <section style={{ marginTop: "20px", minHeight: "60vh" }}>
        <div className="container">
          <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
            <div>
              <h2
                className="mb-1"
                style={{ fontSize: "1.75rem", fontWeight: 600 }}
              >
                <i className="bi bi-calendar-check me-2"></i>
                My Appointments
              </h2>
              <p className="text-muted mb-0">
                View, reschedule, and cancel your bookings fast
              </p>
            </div>
            <Link
              to="/schedule-service"
              className="btn btn-dark btn-lg"
              style={{
                backgroundColor: "#000",
                color: "#fff",
                borderColor: "#000",
              }}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Schedule service
            </Link>
          </div>

          {message && (
            <div
              className={`alert ${
                message.toLowerCase().includes("success")
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {message}
            </div>
          )}

          <div className="appointments-filter-bar d-flex flex-wrap align-items-center gap-3 mb-3">
            <Select
              value={activeTab}
              style={{ width: 120, ...filterControlStyle }}
              onChange={setActiveTab}
            >
              <Select.Option value="all">
                All ({totalCount || appointments.length || 0})
              </Select.Option>
              <Select.Option value="upcoming">Upcoming</Select.Option>
            </Select>

            <Select
              value={statusFilter}
              style={{ width: 180, ...filterControlStyle }}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">Status: all</Select.Option>
              <Select.Option value="pending">
                Pending confirmation
              </Select.Option>
              <Select.Option value="confirmed">Confirmed</Select.Option>
              <Select.Option value="inprogress">In progress</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="completed_partial">
                Completed (unpaid)
              </Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
              <Select.Option value="noshow">No-show</Select.Option>
            </Select>

            <DatePicker
              style={filterControlStyle}
              onChange={(date, dateString) => setDateFilter(dateString)}
            />

            <Input
              allowClear
              placeholder="Enter license plate"
              value={licensePlateFilter}
              onChange={(e) => setLicensePlateFilter(e.target.value)}
              style={{ width: 180, ...filterControlStyle }}
            />

            <Select
              value={sortBy}
              style={{ width: 120, ...filterControlStyle }}
              onChange={setSortBy}
            >
              <Select.Option value="dateDesc">Newest</Select.Option>
              <Select.Option value="dateAsc">Oldest</Select.Option>
            </Select>

            {/* Pagination inline with filters */}
            {totalPages > 1 && (
              <div className="d-flex align-items-center gap-2 ms-auto">
                <span className="text-muted small">
                  Page {page}/{totalPages}
                </span>
                <Select
                  value={page}
                  style={{ width: 80, ...filterControlStyle }}
                  onChange={(p) => setPage(p)}
                  disabled={loading}
                >
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (p) => (
                      <Select.Option key={p} value={p}>
                        {p}
                      </Select.Option>
                    )
                  )}
                </Select>
                <Select
                  value={pageSize}
                  style={{ width: 90, ...filterControlStyle }}
                  onChange={(ps) => {
                    setPage(1);
                    setPageSize(ps);
                  }}
                  disabled={loading}
                >
                  {[6, 9, 12, 15, 20].map((s) => (
                    <Select.Option key={s} value={s}>
                      {s}/trang
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <Spin spinning={loading} size="large">
            {appointments.length === 0 ? (
              <div className="text-center py-5">
                <i
                  className="bi bi-calendar-x"
                  style={{ fontSize: "3rem", color: "#ccc" }}
                ></i>
                <p className="mt-3 text-muted">No appointments yet</p>
                <Link
                  to="/schedule-service"
                  className="btn btn-dark mt-2"
                  style={{
                    backgroundColor: "#000",
                    color: "#fff",
                    borderColor: "#000",
                  }}
                >
                  Book now
                </Link>
              </div>
            ) : (
              <Row gutter={[16, 24]}>
                {appointments.map((appointment) => {
                  const paymentStatus =
                    appointment.paymentStatusName ||
                    appointment.paymentStatus ||
                    appointment.paymentIntentStatus ||
                    "";
                  const canonStatus = canonicalStatus(
                    appointment.statusName || appointment.status
                  );
                  const statusInfo =
                    statusMap[canonStatus] || statusMap.unknown;
                  const licensePlate =
                    appointment.vehicleLicensePlate ||
                    appointment.licensePlate ||
                    appointment.vehiclePlate ||
                    "";

                  return (
                    <Col
                      key={appointment.appointmentId}
                      xs={24}
                      sm={24}
                      md={12}
                      lg={8}
                    >
                      <Card
                        title={`#${
                          appointment.appointmentCode ||
                          appointment.appointmentId
                        }`}
                        headStyle={{ textAlign: "left" }}
                        extra={
                          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                        }
                        actions={[
                          <Button
                            type="link"
                            onClick={() =>
                              loadAppointmentDetail(appointment.appointmentId)
                            }
                          >
                            Details
                          </Button>,
                          <Space>
                            {canReschedule(canonStatus) && (
                              <Button
                                type="primary"
                                ghost
                                onClick={() => handleReschedule(appointment)}
                              >
                                Reschedule
                              </Button>
                            )}
                            {canCancel(canonStatus) && (
                              <Button
                                danger
                                onClick={() =>
                                  handleCancelAppointment(appointment)
                                }
                              >
                                Cancel
                              </Button>
                            )}
                            {canonStatus === "cancelled" && (
                              <Button
                                type="dashed"
                                danger
                                onClick={() => {
                                  setPendingDeleteId(appointment.appointmentId);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete
                              </Button>
                            )}
                          </Space>,
                        ]}
                        bodyStyle={{ paddingBottom: 12, paddingTop: 12 }}
                        style={{ marginBottom: 12 }}
                      >
                        <p>
                          <strong>Vehicle:</strong>{" "}
                          {appointment.vehicleName ||
                            appointment.vehicleModel ||
                            "N/A"}{" "}
                        </p>
                        {licensePlate && (
                          <p className="text-muted mb-1">
                            License plate: <strong>{licensePlate}</strong>
                          </p>
                        )}
                        <p>
                          <strong>Service center:</strong>{" "}
                          {appointment.serviceCenterName || "N/A"}
                        </p>
                        <p>
                          <strong>Time:</strong>{" "}
                          {formatDate(
                            appointment.appointmentDate || appointment.slotDate
                          )}{" "}
                          -{" "}
                          {formatTimeRange(
                            appointment.slotStartTime,
                            appointment.slotEndTime
                          )}
                        </p>
                        {paymentStatus && (
                          <p>
                            <strong>Payment:</strong>{" "}
                            <Tag color={getPaymentStatusColor(paymentStatus)}>
                              {paymentStatus}
                            </Tag>
                          </p>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Spin>

          {totalPages > 1 && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Pagination
                current={page}
                total={totalCount}
                pageSize={pageSize}
                onChange={(p, ps) => {
                  setPage(p);
                  if (ps !== pageSize) {
                    setPageSize(ps);
                    setPage(1);
                  }
                }}
                showSizeChanger
                pageSizeOptions={["6", "9", "12", "15", "20"]}
                responsive
              />
            </div>
          )}
        </div>
      </section>

      <Modal
        title="Reschedule appointment"
        visible={showRescheduleModal}
        onOk={confirmReschedule}
        onCancel={() => setShowRescheduleModal(false)}
        confirmLoading={loading}
        okText="Confirm reschedule"
        cancelText="Cancel"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            placeholder="Select new service center"
            style={{ width: "100%" }}
            value={selectedCenterId}
            loading={centersLoading}
            notFoundContent={
              centersLoading ? "Loading..." : "No service center"
            }
            onChange={(value) => {
              setSelectedCenterId(value);
              setSelectedSlot(null);
              setAvailableSlots([]);
              setMessage("");
            }}
          >
            {activeCenters
              .map((c) => {
                const id = c.centerId || c.serviceCenterId || c.id;
                const label =
                  c.centerName ||
                  c.serviceCenterName ||
                  c.name ||
                  c.centerCode ||
                  "Service center";

                if (!id) return null;

                return (
                  <Select.Option key={id} value={id} label={label}>
                    <div style={{ lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 600 }}>{label}</div>
                      {(c.fullAddress || c.address) && (
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {c.fullAddress || c.address}
                        </div>
                      )}
                    </div>
                  </Select.Option>
                );
              })
              .filter(Boolean)}
          </Select>
          <DatePicker
            style={{ width: "100%" }}
            onChange={(date, dateString) => {
              setRescheduleDate(dateString);
              setSelectedSlot(null);
              setAvailableSlots([]);
              setMessage("");
            }}
            disabledDate={(current) =>
              current && current < new Date().setHours(0, 0, 0, 0)
            }
          />
          {selectedCenterId &&
            rescheduleDate &&
            availableSlots.length === 0 && (
              <div
                className="alert alert-info"
                role="alert"
                style={{ padding: 8 }}
              >
                No available slots or slots not loaded yet.
              </div>
            )}
          {availableSlots.length > 0 && (
            <Row gutter={[8, 8]}>
              {availableSlots.map((slot) => (
                <Col key={slot.slotId} span={12}>
                  <Card
                    hoverable
                    onClick={() => setSelectedSlot(slot)}
                    role="button"
                    style={{
                      cursor: "pointer",
                      borderColor:
                        selectedSlot?.slotId === slot.slotId
                          ? "#1677ff"
                          : undefined,
                      boxShadow:
                        selectedSlot?.slotId === slot.slotId
                          ? "0 0 0 2px rgba(22, 119, 255, 0.15)"
                          : undefined,
                    }}
                    className={
                      selectedSlot?.slotId === slot.slotId
                        ? "ant-card-active"
                        : ""
                    }
                  >
                    {slot.startTime} - {slot.endTime}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Space>
      </Modal>

      <Modal
        title="Cancel appointment"
        visible={showCancelModal}
        onOk={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
        confirmLoading={loading}
        okText="Confirm cancel"
        cancelText="No"
      >
        <p>Are you sure you want to cancel this appointment?</p>
        <Input.TextArea
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Enter cancellation reason..."
        />
      </Modal>

      <Modal
        title="Delete appointment"
        visible={showDeleteModal}
        onOk={handleDeleteAppointment}
        onCancel={() => setShowDeleteModal(false)}
        confirmLoading={loading}
        okText="Confirm delete"
        cancelText="Cancel"
      >
        <p>Delete this appointment? (Only pending appointments can be deleted)</p>
      </Modal>

      <Modal
        title={
          detailData
            ? `Appointment details #${
                detailData.appointmentCode || detailData.appointmentId
              }`
            : "Appointment details"
        }
        visible={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={760}
        bodyStyle={{ paddingTop: 0, paddingBottom: 16 }}
      >
        {detailLoading ? (
          <div className="text-center py-4">
            <Spin />
          </div>
        ) : detailData ? (
          <div style={{ padding: "16px 16px 0 16px" }}>
            {/* Header with status/payment */}
            <div
              style={{
                background: "#f9fafb",
                padding: "12px 16px",
                borderBottom: "1px solid #e5e7eb",
                borderRadius: "8px 8px 0 0",
                marginBottom: 12,
              }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    #{detailData.appointmentCode || detailData.appointmentId}
                  </div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    {formatDate(detailData.slotDate)} •{" "}
                    {formatTimeRange(
                      detailData.slotStartTime,
                      detailData.slotEndTime
                    )}
                  </div>
                </div>
                <Space>
                  {detailData.statusName && (
                    <Tag
                      color={detailData.statusColor || "#1890ff"}
                      style={{ fontSize: 13 }}
                    >
                      {detailData.statusName}
                    </Tag>
                  )}
                  {detailData.paymentStatus && (
                    <Tag color="#1677ff" style={{ fontSize: 13 }}>
                      Thanh toan: {detailData.paymentStatus}
                    </Tag>
                  )}
                </Space>
              </div>
            </div>

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {/* Customer & source */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  👤 Customer & Source
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    {renderDetailRow(
                      "Customer",
                      `${detailData.customerName || ""} (${
                        detailData.customerPhone || ""
                      })`
                    )}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow("Source", detailData.source || "N/A")}
                  </Col>
                  <Col span={24}>
                    {renderDetailRow(
                      "Notes",
                      detailData.customerNotes || "—"
                    )}
                  </Col>
                </Row>
              </div>

              {/* Vehicle & center */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  🚗 Vehicle & Service center
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    {renderDetailRow(
                      "Vehicle",
                      `${detailData.vehicleName || ""} (${
                        detailData.licensePlate || ""
                      })`
                    )}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow("VIN", detailData.vin || "N/A")}
                  </Col>
                  <Col span={24}>
                    {renderDetailRow(
                      "Service center",
                      `${detailData.serviceCenterName || ""} - ${
                        detailData.serviceCenterAddress || ""
                      }`
                    )}
                  </Col>
                </Row>
              </div>

              {/* Time & payment */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  🕒 Time & 💳 Payment
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    {renderDetailRow(
                      "Time",
                      `${formatDate(detailData.slotDate)} ${formatTimeRange(
                        detailData.slotStartTime,
                        detailData.slotEndTime
                      )}`
                    )}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow("Priority", detailData.priority || "N/A")}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow(
                      "Payment",
                      `${detailData.paymentStatus || "N/A"} • Paid: ${formatCurrency(
                        detailData.paidAmount || 0
                      )} • Outstanding: ${formatCurrency(
                        detailData.outstandingAmount || 0
                      )}`
                    )}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow(
                      "Created by",
                      `${detailData.createdByName || ""} - ${formatDate(
                        detailData.createdDate
                      )}`
                    )}
                  </Col>
                </Row>
              </div>

              {/* Payment summary */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  💰 Payment overview
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <Row gutter={[12, 8]}>
                  <Col span={8}>
                    {renderDetailRow(
                      "Total",
                      formatCurrency(
                        detailData.estimatedCost || detailData.finalCost
                      )
                    )}
                  </Col>
                  <Col span={8}>
                    {renderDetailRow(
                      "Paid",
                      formatCurrency(detailData.paidAmount || 0)
                    )}
                  </Col>
                  <Col span={8}>
                    {renderDetailRow(
                      "Outstanding",
                      formatCurrency(detailData.outstandingAmount || 0)
                    )}
                  </Col>
                </Row>
              </div>

              {/* Services / packages */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  🧰 Services / Packages
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ marginTop: 4 }}>
                  {renderDetailServices(detailData.services)}
                  {detailData.packageName && (
                    <div style={{ marginTop: 6 }}>
                      <Tag color="green">{detailData.packageName}</Tag>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="d-flex justify-content-end gap-2 mt-2">
                {canCancel(detailData.statusName || detailData.statusId) && (
                  <Button
                    danger
                    onClick={() => handleCancelAppointment(detailData)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                {canReschedule(
                  detailData.statusName || detailData.statusId
                ) && (
                  <Button
                    onClick={() => handleReschedule(detailData)}
                    disabled={loading}
                  >
                    Reschedule
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </Button>
              </div>
            </Space>
          </div>
        ) : (
          <div className="text-muted">No detail data available.</div>
        )}
      </Modal>
    </MainLayout>
  );
};

export default MyAppointments;
