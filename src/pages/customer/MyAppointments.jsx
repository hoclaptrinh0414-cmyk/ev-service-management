// src/pages/customer/MyAppointments.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import appointmentService from "../../services/appointmentService";
import { ToastContainer, toast } from "react-toastify";
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
          Trang {page}/{totalPages} - {totalCount} lich hen
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
  }, [activeTab, statusFilter, sortBy, dateFilter]);

  useEffect(() => {
    loadAppointments();
  }, [activeTab, statusFilter, sortBy, dateFilter, page, pageSize]);

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

    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments(params);
      const payload = response?.data?.data || response?.data || response || {};
      console.log("API Response Payload:", payload);
      const items = payload.items || payload.data || payload || [];
      console.log("Extracted Items:", items);

      setAppointments(items);
      const total =
        payload.totalCount ?? payload.TotalCount ?? items.length ?? 0;
      setTotalCount(total);
      console.log("Total Count:", total);
      const pages =
        payload.totalPages ??
        payload.TotalPages ??
        Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
      setTotalPages(pages);
      console.log("Total Pages:", pages);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setMessage("Khong the tai danh sach lich hen. Vui long thu lai.");
      toast.error(
        "Không thể tải danh sách lịch hẹn. Vui lòng thử lại.",
        toastConfig
      );
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
        "Không thể tải danh sách trung tâm. Vui lòng thử lại.",
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

  const handleReschedule = async (appointment) => {
    if (!appointment) return;
    if (
      !canReschedule(
        appointment.statusName || appointment.statusId || appointment.status
      )
    ) {
      toast.info(
        "Chi lich co trang thai Pending/Confirmed/In progress moi duoc doi lich.",
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
        setMessage("Trung tam nay khong con khung gio trong ngay ban chon.");
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
      setMessage(
        "Khong tai duoc khung gio. Thu lai hoac chon trung tam/ ngay khac."
      );
    }
  };

  useEffect(() => {
    loadSlotsForReschedule();
  }, [rescheduleDate, selectedCenterId]);

  // No need to re-fetch centers per date because BE /service-centers/available is 403; use active list once.

  const confirmReschedule = async () => {
    if (!selectedCenterId) {
      setMessage("Vui long chon trung tam moi.");
      return;
    }
    if (!rescheduleDate) {
      setMessage("Vui long chon ngay moi.");
      return;
    }
    if (!selectedSlot) {
      setMessage("Vui long chon khung gio moi.");
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
        "Khong the doi lich. Vui long thu lai.";
      setMessage(errMsg);
      toast.error(errMsg, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      setMessage("Vui long nhap ly do huy lich.");
      return;
    }

    try {
      setLoading(true);
      await appointmentService.cancelAppointment(
        selectedAppointment.appointmentId,
        cancelReason
      );
      setMessage("Huy lich thanh cong!");
      toast.success("Đã hủy lịch hẹn.", toastConfig);
      setShowCancelModal(false);
      setCancelReason("");
      loadAppointments();
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Error cancelling:", error);
      const errMsg =
        error.response?.data?.message ||
        "Khong the huy lich. Vui long thu lai.";
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
      setMessage("Xoa lich hen thanh cong!");
      toast.success("Đã xóa lịch hẹn.", toastConfig);
      loadAppointments();
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Error deleting:", error);
      const errMsg =
        error.response?.data?.message ||
        "Khong the xoa lich hen. Chi xoa duoc lich dang Pending.";
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
      toast.error("Không thể tải chi tiết lịch hẹn.", toastConfig);
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
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
      />
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
                Lich hen cua toi
              </h2>
              <p className="text-muted mb-0">
                Xem, doi lich, huy lich nhanh chong
              </p>
            </div>
            <Link to="/schedule-service" className="btn btn-primary btn-lg">
              <i className="bi bi-plus-circle me-1"></i>
              Dat lich moi
            </Link>
          </div>

          {message && (
            <div
              className={`alert ${
                message.toLowerCase().includes("thanh cong")
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
              style={{ width: 120 }}
              onChange={setActiveTab}
            >
              <Select.Option value="all">
                Tat ca ({totalCount || appointments.length || 0})
              </Select.Option>
              <Select.Option value="upcoming">Sap toi</Select.Option>
            </Select>

            <Select
              value={statusFilter}
              style={{ width: 180 }}
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
              onChange={(date, dateString) => setDateFilter(dateString)}
            />

            <Select value={sortBy} style={{ width: 120 }} onChange={setSortBy}>
              <Select.Option value="dateDesc">Moi nhat</Select.Option>
              <Select.Option value="dateAsc">Cu nhat</Select.Option>
            </Select>

            {/* Pagination inline with filters */}
            {totalPages > 1 && (
              <div className="d-flex align-items-center gap-2 ms-auto">
                <span className="text-muted small">
                  Trang {page}/{totalPages}
                </span>
                <Select
                  value={page}
                  style={{ width: 80 }}
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
                  style={{ width: 90 }}
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
                <p className="mt-3 text-muted">Khong co lich hen nao</p>
                <Link to="/schedule-service" className="btn btn-primary mt-2">
                  Dat lich ngay
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
                            Chi tiết
                          </Button>,
                          <Space>
                            {canReschedule(canonStatus) && (
                              <Button
                                type="primary"
                                ghost
                                onClick={() => handleReschedule(appointment)}
                              >
                                Doi lich
                              </Button>
                            )}
                            {canCancel(canonStatus) && (
                              <Button
                                danger
                                onClick={() =>
                                  handleCancelAppointment(appointment)
                                }
                              >
                                Huy
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
                                Xoa
                              </Button>
                            )}
                          </Space>,
                        ]}
                        bodyStyle={{ paddingBottom: 12, paddingTop: 12 }}
                        style={{ marginBottom: 12 }}
                      >
                        <p>
                          <strong>Xe:</strong>{" "}
                          {appointment.vehicleName ||
                            appointment.vehicleModel ||
                            "N/A"}{" "}
                          ({appointment.vehicleLicensePlate || ""})
                        </p>
                        <p>
                          <strong>Trung tam:</strong>{" "}
                          {appointment.serviceCenterName || "N/A"}
                        </p>
                        <p>
                          <strong>Thoi gian:</strong>{" "}
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
                            <strong>Thanh toan:</strong>{" "}
                            <Tag color="blue">{paymentStatus}</Tag>
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
        title="Doi lich hen"
        visible={showRescheduleModal}
        onOk={confirmReschedule}
        onCancel={() => setShowRescheduleModal(false)}
        confirmLoading={loading}
        okText="Xac nhan doi lich"
        cancelText="Huy"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            placeholder="Chon trung tam moi"
            style={{ width: "100%" }}
            value={selectedCenterId}
            loading={centersLoading}
            notFoundContent={
              centersLoading ? "Dang tai..." : "Khong co trung tam"
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
                  "Trung tam";

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
                Khong co khung gio trong hoac chua tai khung gio.
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
        title="Huy lich hen"
        visible={showCancelModal}
        onOk={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
        confirmLoading={loading}
        okText="Xac nhan huy"
        cancelText="Khong"
      >
        <p>Ban co chac muon huy lich hen nay?</p>
        <Input.TextArea
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Nhap ly do huy lich..."
        />
      </Modal>

      <Modal
        title="Xóa lịch hẹn"
        visible={showDeleteModal}
        onOk={handleDeleteAppointment}
        onCancel={() => setShowDeleteModal(false)}
        confirmLoading={loading}
        okText="Xac nhan xoa"
        cancelText="Huy"
      >
        <p>
          Ban co chac muon xoa lich hen nay? (Chi xoa duoc lich dang Pending)
        </p>
      </Modal>

      <Modal
        title={
          detailData
            ? `Chi tiet lich hen #${
                detailData.appointmentCode || detailData.appointmentId
              }`
            : "Chi tiet lich hen"
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
              {/* Khách hàng & nguồn */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  👤 Khach hang & Nguon
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    {renderDetailRow(
                      "Khach hang",
                      `${detailData.customerName || ""} (${
                        detailData.customerPhone || ""
                      })`
                    )}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow("Nguon", detailData.source || "N/A")}
                  </Col>
                  <Col span={24}>
                    {renderDetailRow(
                      "Ghi chu",
                      detailData.customerNotes || "—"
                    )}
                  </Col>
                </Row>
              </div>

              {/* Xe & trung tâm */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  🚗 Xe & Trung tam
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    {renderDetailRow(
                      "Xe",
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
                      "Trung tam",
                      `${detailData.serviceCenterName || ""} - ${
                        detailData.serviceCenterAddress || ""
                      }`
                    )}
                  </Col>
                </Row>
              </div>

              {/* Thời gian & thanh toán */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  🕒 Thoi gian & 💳 Thanh toan
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    {renderDetailRow(
                      "Thoi gian",
                      `${formatDate(detailData.slotDate)} ${formatTimeRange(
                        detailData.slotStartTime,
                        detailData.slotEndTime
                      )}`
                    )}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow("Uu tien", detailData.priority || "N/A")}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow(
                      "Thanh toan",
                      `${
                        detailData.paymentStatus || "N/A"
                      } • Da tra: ${formatCurrency(
                        detailData.paidAmount || 0
                      )} • Con lai: ${formatCurrency(
                        detailData.outstandingAmount || 0
                      )}`
                    )}
                  </Col>
                  <Col span={12}>
                    {renderDetailRow(
                      "Nguoi tao",
                      `${detailData.createdByName || ""} - ${formatDate(
                        detailData.createdDate
                      )}`
                    )}
                  </Col>
                </Row>
              </div>

              {/* Tổng quan thanh toán */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  💰 Tong quan thanh toan
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <Row gutter={[12, 8]}>
                  <Col span={8}>
                    {renderDetailRow(
                      "Tong tien",
                      formatCurrency(
                        detailData.estimatedCost || detailData.finalCost
                      )
                    )}
                  </Col>
                  <Col span={8}>
                    {renderDetailRow(
                      "Da thanh toan",
                      formatCurrency(detailData.paidAmount || 0)
                    )}
                  </Col>
                  <Col span={8}>
                    {renderDetailRow(
                      "Con lai",
                      formatCurrency(detailData.outstandingAmount || 0)
                    )}
                  </Col>
                </Row>
              </div>

              {/* Dịch vụ / gói */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  🧰 Dich vu / Goi
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
                    Huy lich
                  </Button>
                )}
                {canReschedule(
                  detailData.statusName || detailData.statusId
                ) && (
                  <Button
                    onClick={() => handleReschedule(detailData)}
                    disabled={loading}
                  >
                    Doi lich
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Dong
                </Button>
              </div>
            </Space>
          </div>
        ) : (
          <div className="text-muted">Khong co du lieu chi tiet.</div>
        )}
      </Modal>
    </MainLayout>
  );
};

export default MyAppointments;
