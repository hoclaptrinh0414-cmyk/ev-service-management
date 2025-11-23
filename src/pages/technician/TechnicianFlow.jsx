import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService, { lookupAPI, workOrderAPI } from "../../services/api";
import "./TechnicianFlow.css";

const fetchMyWorkOrders = async () => {
  const res = await apiService.request("/technicians/my-work-orders");
  return res?.data || res?.items || res || [];
};
const fetchServiceCenters = async () => {
  const res = await lookupAPI.getActiveServiceCenters();
  return res?.data || res?.items || res || [];
};

const getErrorMessage = (err) => {
  try {
    if (err?.response?.data?.error) return err.response.data.error;
    if (err?.response?.data?.message) return err.response.data.message;
    if (typeof err?.message === "string") return err.message;
    return "Có lỗi xảy ra";
  } catch {
    return "Có lỗi xảy ra";
  }
};

const checkIn = (serviceCenterId) =>
  apiService.request("/technicians/attendance/check-in", {
    method: "POST",
    body: JSON.stringify({
      serviceCenterId: Number(serviceCenterId),
    }),
  });
const checkOut = (serviceCenterId) =>
  apiService.request("/technicians/attendance/check-out", {
    method: "POST",
    body: JSON.stringify({
      serviceCenterId: Number(serviceCenterId),
    }),
  });
const startWorkOrder = (id) =>
  apiService.request(`/work-orders/${id}/start`, {
    method: "POST",
    body: JSON.stringify({ request: {} }),
  });
const completeWorkOrder = (id) =>
  apiService.request(`/work-orders/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ request: {} }),
  });
const addService = ({ id, serviceId }) =>
  apiService.request(`/work-orders/${id}/services/${serviceId}`, {
    method: "POST",
    body: JSON.stringify({ request: {} }),
  });
const addPart = ({ id, partId }) =>
  apiService.request(`/work-orders/${id}/parts/${partId}`, {
    method: "POST",
    body: JSON.stringify({ request: {} }),
  });

const TechnicianFlow = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedWo, setSelectedWo] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [partId, setPartId] = useState("");
  const [serviceCenterId, setServiceCenterId] = useState("");

  const workOrdersQuery = useQuery({
    queryKey: ["tech-my-workorders"],
    queryFn: fetchMyWorkOrders,
  });
  const centersQuery = useQuery({
    queryKey: ["service-centers-active"],
    queryFn: fetchServiceCenters,
  });

  const checkInMut = useMutation({
    mutationFn: checkIn,
    onError: (err) => window.alert(getErrorMessage(err)),
    onSuccess: () => window.alert("Check-in thành công!"),
  });
  const checkOutMut = useMutation({
    mutationFn: checkOut,
    onError: (err) => window.alert(getErrorMessage(err)),
    onSuccess: () => window.alert("Check-out thành công!"),
  });
  const startMut = useMutation({
    mutationFn: startWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["tech-my-workorders"]);
      window.alert("Đã bắt đầu Work Order!");
    },
    onError: (err) => window.alert(getErrorMessage(err)),
  });
  const completeMut = useMutation({
    mutationFn: completeWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["tech-my-workorders"]);
      window.alert("Đã hoàn thành Work Order!");
    },
    onError: (err) => window.alert(getErrorMessage(err)),
  });
  const addServiceMut = useMutation({
    mutationFn: addService,
    onSuccess: () => {
      queryClient.invalidateQueries(["tech-my-workorders"]);
      window.alert("Đã thêm dịch vụ!");
    },
    onError: (err) => window.alert(getErrorMessage(err)),
  });
  const addPartMut = useMutation({
    mutationFn: addPart,
    onSuccess: () => {
      queryClient.invalidateQueries(["tech-my-workorders"]);
      window.alert("Đã thêm phụ tùng!");
    },
    onError: (err) => window.alert(getErrorMessage(err)),
  });

  const workOrders = useMemo(() => {
    const data = workOrdersQuery.data || [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }, [workOrdersQuery.data]);

  const activeWO =
    workOrders.find(
      (w) =>
        String(w.workOrderId || w.id) === String(selectedWo) ||
        String(w.id) === String(selectedWo)
    ) || null;

  const statusNormalized = (activeWO?.status || activeWO?.state || "").toLowerCase();
  const isCompleted =
    statusNormalized === "completed" ||
    statusNormalized === "complete" ||
    statusNormalized === "done";

  const handleStart = () => {
    if (!selectedWo) return;
    if (isCompleted) {
      window.alert("Work order này đã hoàn thành, không thể bắt đầu lại.");
      return;
    }
    startMut.mutate(selectedWo);
  };

  const handleComplete = () => {
    if (!selectedWo) return;
    if (isCompleted) {
      window.alert("Work order này đã hoàn thành rồi.");
      return;
    }
    // Validate before completing
    if (window.confirm("Bạn có chắc chắn muốn hoàn thành Work Order này? Hãy đảm bảo checklist đã được hoàn tất.")) {
      completeMut.mutate(selectedWo);
    }
  };

  const handleOpenChecklist = () => {
    if (!selectedWo) return;
    navigate(`/technician/maintenance/${selectedWo}`);
  };

  const handleValidate = async () => {
    if (!selectedWo) return;
    try {
      const res = await workOrderAPI.validateChecklist(selectedWo);
      if (res && res.isValid) {
        window.alert("Checklist hợp lệ! Bạn có thể hoàn thành Work Order.");
      } else {
        window.alert(`Checklist chưa hoàn tất! ${res?.message || ''}`);
      }
    } catch (err) {
      window.alert(`Lỗi validate: ${getErrorMessage(err)}`);
    }
  };

  return (
    <div className="tech-flow-page">
      <div className="page-head">
        <h1>Luồng công việc Kỹ thuật viên</h1>
        <p>Check-in, nhận và hoàn tất Work Order, thêm dịch vụ/phụ tùng.</p>
      </div>

      <div className="panel grid-2">
        <div className="card-block">
          <h3>Chấm công</h3>
          <div className="btn-row">
            <div className="field-inline">
              <label>
                Trung tâm
                <select
                  value={serviceCenterId}
                  onChange={(e) => setServiceCenterId(e.target.value)}
                >
                  <option value="">-- Chọn trung tâm --</option>
                  {centersQuery.data &&
                    centersQuery.data.map((c) => (
                      <option key={c.centerId || c.id} value={c.centerId || c.id}>
                        {(c.centerName || c.name || "Trung tâm") +
                          (c.city ? ` - ${c.city}` : "")}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <button
              className="btn primary"
              onClick={() => serviceCenterId && checkInMut.mutate(serviceCenterId)}
              disabled={checkInMut.isPending || !serviceCenterId}
            >
              {checkInMut.isPending ? "Đang check-in..." : "Check-in"}
            </button>
            <button
              className="btn"
              onClick={() => serviceCenterId && checkOutMut.mutate(serviceCenterId)}
              disabled={checkOutMut.isPending || !serviceCenterId}
            >
              {checkOutMut.isPending ? "Đang check-out..." : "Check-out"}
            </button>
          </div>
        </div>

        <div className="card-block">
          <h3>Chọn Work Order</h3>
          <select
            value={selectedWo}
            onChange={(e) => setSelectedWo(e.target.value)}
            className="wo-select"
          >
            <option value="">-- Chọn work order --</option>
            {workOrders.map((wo) => (
              <option key={wo.id || wo.workOrderId} value={wo.id || wo.workOrderId}>
                #{wo.id || wo.workOrderId} - {wo.customerName || wo.customer?.fullName || "Khách"} -{" "}
                {wo.status || wo.state}
              </option>
            ))}
          </select>

          {selectedWo && (
            <div className="wo-actions">
              <div className="btn-row">
                <button
                  className="btn primary"
                  onClick={handleStart}
                  disabled={startMut.isPending || isCompleted}
                >
                  {startMut.isPending ? "Đang bắt đầu..." : "Bắt đầu"}
                </button>
                <button
                  className="btn info"
                  onClick={handleOpenChecklist}
                >
                  Mở Checklist
                </button>
                <button
                  className="btn warning"
                  onClick={handleValidate}
                >
                  Validate
                </button>
                <button
                  className="btn success"
                  onClick={handleComplete}
                  disabled={completeMut.isPending || isCompleted}
                >
                  {completeMut.isPending ? "Đang hoàn tất..." : "Hoàn tất"}
                </button>
              </div>
              {isCompleted && (
                <div className="inline-note warning">
                  Work order này đã Completed.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="panel grid-2">
        <div className="card-block">
          <h3>Thêm dịch vụ phát sinh</h3>
          <label>
            ID Dịch vụ
            <input
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              placeholder="serviceId"
            />
          </label>
          <button
            className="btn primary"
            onClick={() =>
              selectedWo && serviceId && addServiceMut.mutate({ id: selectedWo, serviceId })
            }
            disabled={!selectedWo || !serviceId || addServiceMut.isPending}
          >
            {addServiceMut.isPending ? "Đang thêm..." : "Thêm dịch vụ"}
          </button>
        </div>

        <div className="card-block">
          <h3>Thêm phụ tùng</h3>
          <label>
            ID Phụ tùng
            <input
              value={partId}
              onChange={(e) => setPartId(e.target.value)}
              placeholder="partId"
            />
          </label>
          <button
            className="btn primary"
            onClick={() =>
              selectedWo && partId && addPartMut.mutate({ id: selectedWo, partId })
            }
            disabled={!selectedWo || !partId || addPartMut.isPending}
          >
            {addPartMut.isPending ? "Đang thêm..." : "Thêm phụ tùng"}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="table-head">
          <h3>Work Orders của tôi</h3>
          {workOrdersQuery.isFetching && <span className="muted">Đang tải...</span>}
        </div>
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Biển số</th>
                <th>Trạng thái</th>
                <th>Dịch vụ</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workOrdersQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Đang tải...
                  </td>
                </tr>
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Không có work order
                  </td>
                </tr>
              ) : (
                workOrders.map((wo) => (
                  <tr key={wo.id || wo.workOrderId} className={String(wo.id || wo.workOrderId) === String(selectedWo) ? "selected-row" : ""}>
                    <td>{wo.workOrderId || wo.id}</td>
                    <td>{wo.customerName || wo.customer?.fullName || "-"}</td>
                    <td>{wo.licensePlate || wo.vehicle?.licensePlate || "-"}</td>
                    <td>
                      <span className={`badge status-${(wo.status || wo.state || "").toLowerCase()}`}>{wo.status || wo.state || "N/A"}</span>
                    </td>
                    <td>
                      {wo.services && wo.services.length > 0
                        ? wo.services.map((s) => s.serviceName || s.name).join(", ")
                        : "-"}
                    </td>
                    <td>
                      <button className="btn-link" onClick={() => {
                        setSelectedWo(wo.id || wo.workOrderId);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}>
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TechnicianFlow;
