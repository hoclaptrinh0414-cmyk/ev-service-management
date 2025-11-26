import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../../services/api";
import "./TimeSlots.css";

const buildQuery = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};

const fetchServiceCenters = async () => {
  const res = await apiService.request("/service-centers/active");
  // Backend returns: { data: [...], isSuccess: true, message: "..." }
  if (res?.data && Array.isArray(res.data)) {
    return res.data;
  }
  // Fallback if structure is different
  if (Array.isArray(res)) {
    return res;
  }
  return [];
};

const fetchTimeSlots = async (filters) => {
  const query = buildQuery(filters);
  const res = await apiService.request(`/time-slots${query}`);
  return res?.data || res?.items || res || [];
};

const createSlot = async (payload) => {
  return apiService.request("/time-slots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const generateSlots = async (payload) => {
  return apiService.request("/time-slots/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const blockSlot = async ({ slotId, isBlocked }) => {
  return apiService.request(`/time-slots/${slotId}/block`, {
    method: "PATCH",
    body: JSON.stringify({ isBlocked }),
  });
};

const deleteSlot = async (slotId) => {
  return apiService.request(`/time-slots/${slotId}`, { method: "DELETE" });
};

const deleteEmptySlots = async ({ centerId, date }) => {
  return apiService.request(
    `/time-slots/center/${centerId}/date/${date}/empty`,
    { method: "DELETE" }
  );
};

const TimeSlots = () => {
  const queryClient = useQueryClient();

  const [mode, setMode] = useState("single");

  const [dateFilterMode, setDateFilterMode] = useState("single"); // "single" or "range"

  const [filters, setFilters] = useState({
    centerId: "",
    startDate: "",
    endDate: "",
    isBlocked: "", // Changed from "status" to match API
    page: 1,
    pageSize: 20,
  });

  const [singlePayload, setSinglePayload] = useState({
    centerId: "",
    slotDate: "",
    startTime: "",
    endTime: "",
    maxBookings: 1,
    slotType: "Standard",
    isBlocked: false,
    notes: "", // Added notes field
  });

  const [bulkPayload, setBulkPayload] = useState({
    centerId: "",
    startDate: "",
    endDate: "",
    slotDurationMinutes: 60,
    maxBookingsPerSlot: 1,
    slotType: "Standard",
    overwriteExisting: false,
  });

  const centersQuery = useQuery({
    queryKey: ["service-centers"],
    queryFn: fetchServiceCenters,
  });

  const slotsQuery = useQuery({
    queryKey: ["time-slots", filters],
    queryFn: () => fetchTimeSlots(filters),
    enabled: !!filters.centerId, // Only fetch when centerId is selected
  });

  const createMutation = useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      queryClient.invalidateQueries(["time-slots"]);
      // Reset form
      setSinglePayload({
        centerId: "",
        slotDate: "",
        startTime: "",
        endTime: "",
        maxBookings: 1,
        slotType: "Standard",
        isBlocked: false,
        notes: "",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateSlots,
    onSuccess: () => {
      queryClient.invalidateQueries(["time-slots"]);
      // Reset form
      setBulkPayload({
        centerId: "",
        startDate: "",
        endDate: "",
        slotDurationMinutes: 60,
        maxBookingsPerSlot: 1,
        slotType: "Standard",
        overwriteExisting: false,
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: blockSlot,
    onSuccess: () => queryClient.invalidateQueries(["time-slots"]),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSlot,
    onSuccess: () => queryClient.invalidateQueries(["time-slots"]),
  });

  const deleteEmptyMutation = useMutation({
    mutationFn: deleteEmptySlots,
    onSuccess: () => queryClient.invalidateQueries(["time-slots"]),
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate" && dateFilterMode === "single") {
      // Nếu chế độ single date, tự động set endDate = startDate
      setFilters((prev) => ({ ...prev, startDate: value, endDate: value }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateFilterModeChange = (newMode) => {
    setDateFilterMode(newMode);
    if (newMode === "single") {
      // Khi chuyển sang single, nếu có startDate thì set endDate = startDate
      setFilters((prev) => ({
        ...prev,
        endDate: prev.startDate || prev.endDate,
      }));
    }
  };

  const handleSingleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSinglePayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBulkChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBulkPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...singlePayload,
      centerId: Number(singlePayload.centerId),
      maxBookings: Number(singlePayload.maxBookings || 1),
    });
  };

  const onGenerate = (e) => {
    e.preventDefault();
    generateMutation.mutate({
      ...bulkPayload,
      centerId: Number(bulkPayload.centerId),
      slotDurationMinutes: Number(bulkPayload.slotDurationMinutes || 60),
      maxBookingsPerSlot: Number(bulkPayload.maxBookingsPerSlot || 1),
    });
  };

  const slots = useMemo(() => {
    const data = slotsQuery.data || [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    return [];
  }, [slotsQuery.data]);

  const serviceCenters = useMemo(() => {
    return centersQuery.data || [];
  }, [centersQuery.data]);

  const getCenterName = (centerId) => {
    const center = serviceCenters.find((c) => c.centerId === centerId);
    return center ? (center.centerName || center.name) : `Trung tâm #${centerId}`;
  };

  const handleDeleteEmptySlots = () => {
    if (!filters.centerId) {
      alert("Vui lòng chọn trung tâm");
      return;
    }
    if (!filters.startDate) {
      alert("Vui lòng chọn ngày");
      return;
    }
    if (window.confirm(`Xác nhận xóa tất cả slots trống ngày ${filters.startDate}?`)) {
      deleteEmptyMutation.mutate({
        centerId: filters.centerId,
        date: filters.startDate,
      });
    }
  };

  return (
    <div className="timeslots-page">
      <div className="page-head">
        <h1>Quản lý khung giờ</h1>
        <p>Tạo, xem và điều chỉnh khung giờ cho các trung tâm dịch vụ.</p>
      </div>

      <div className="panel">
        <h3>Bộ lọc</h3>
        <div className="filters">
          <label>
            Trung tâm dịch vụ
            <select
              name="centerId"
              value={filters.centerId}
              onChange={handleFilterChange}
              required
              disabled={centersQuery.isLoading}
              style={{ color: '#333', backgroundColor: '#fff' }}
            >
              <option value="" style={{ color: '#333' }}>
                {centersQuery.isLoading
                  ? "Đang tải..."
                  : serviceCenters.length === 0
                    ? "Không có trung tâm nào"
                    : "-- Chọn trung tâm --"}
              </option>
              {serviceCenters.map((center) => (
                <option
                  key={center.centerId}
                  value={center.centerId}
                  style={{ color: '#333', backgroundColor: '#fff' }}
                >
                  {center.centerName || center.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Lọc theo ngày
            <select
              value={dateFilterMode}
              onChange={(e) => handleDateFilterModeChange(e.target.value)}
            >
              <option value="single">Một ngày cụ thể</option>
              <option value="range">Khoảng thời gian</option>
            </select>
          </label>

          {dateFilterMode === "single" ? (
            <label>
              Chọn ngày
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                placeholder="Chọn một ngày"
              />
            </label>
          ) : (
            <>
              <label>
                Từ ngày
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </label>
              <label>
                Đến ngày
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </label>
            </>
          )}

            <label>
              Trạng thái khóa
              <select
                name="isBlocked"
                value={filters.isBlocked}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả</option>
                <option value="true">Đã khóa</option>
                <option value="false">Chưa khóa</option>
              </select>
            </label>
            <button
              type="button"
              className="btn"
              onClick={() => slotsQuery.refetch()}
              disabled={!filters.centerId}
            >
              Tải danh sách
            </button>
            {dateFilterMode === "single" && filters.startDate && filters.centerId && (
              <button
                type="button"
                className="btn danger"
                onClick={handleDeleteEmptySlots}
                disabled={deleteEmptyMutation.isLoading}
              >
                {deleteEmptyMutation.isLoading ? "Đang xóa..." : "Xóa slots trống"}
              </button>
            )}
          </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Tạo khung giờ</h3>
          <div className="mode-switch">
            <label htmlFor="mode">Chế độ</label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="single">Đơn lẻ</option>
              <option value="bulk">Hàng loạt</option>
            </select>
          </div>
        </div>

        {mode === "single" ? (
          <form className="form-grid two-col" onSubmit={onCreate}>
            <label>
              Trung tâm dịch vụ
              <select
                name="centerId"
                value={singlePayload.centerId}
                onChange={handleSingleChange}
                required
                disabled={centersQuery.isLoading}
                style={{ color: '#333', backgroundColor: '#fff' }}
              >
                <option value="" style={{ color: '#333' }}>
                  {centersQuery.isLoading ? "Đang tải..." : "-- Chọn trung tâm --"}
                </option>
                {serviceCenters.map((center) => (
                  <option
                    key={center.centerId}
                    value={center.centerId}
                    style={{ color: '#333', backgroundColor: '#fff' }}
                  >
                    {center.centerName || center.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ngày
              <input
                type="date"
                name="slotDate"
                value={singlePayload.slotDate}
                onChange={handleSingleChange}
                required
              />
            </label>
            <label>
              Bắt đầu
              <input
                type="time"
                name="startTime"
                value={singlePayload.startTime}
                onChange={handleSingleChange}
                required
              />
            </label>
            <label>
              Kết thúc
              <input
                type="time"
                name="endTime"
                value={singlePayload.endTime}
                onChange={handleSingleChange}
                required
              />
            </label>
            <label>
              Số booking tối đa
              <input
                type="number"
                min="1"
                name="maxBookings"
                value={singlePayload.maxBookings}
                onChange={handleSingleChange}
              />
            </label>
            <label>
              Loại khung giờ
              <select
                name="slotType"
                value={singlePayload.slotType}
                onChange={handleSingleChange}
              >
                <option value="Standard">Standard</option>
                <option value="Repair">Repair</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Emergency">Emergency</option>
              </select>
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              Ghi chú
              <textarea
                name="notes"
                value={singlePayload.notes}
                onChange={handleSingleChange}
                placeholder="Ghi chú thêm về slot này (tùy chọn)"
                rows="2"
              />
            </label>
            <div className="form-actions inline" style={{ gridColumn: "1 / -1" }}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="isBlocked"
                  checked={singlePayload.isBlocked}
                  onChange={handleSingleChange}
                />
                Khóa khi tạo
              </label>
              <button
                className="btn primary"
                type="submit"
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? "Đang tạo..." : "Tạo khung giờ"}
              </button>
            </div>
          </form>
        ) : (
          <form className="form-grid two-col" onSubmit={onGenerate}>
            <label>
              Trung tâm dịch vụ
              <select
                name="centerId"
                value={bulkPayload.centerId}
                onChange={handleBulkChange}
                required
                disabled={centersQuery.isLoading}
                style={{ color: '#333', backgroundColor: '#fff' }}
              >
                <option value="" style={{ color: '#333' }}>
                  {centersQuery.isLoading ? "Đang tải..." : "-- Chọn trung tâm --"}
                </option>
                {serviceCenters.map((center) => (
                  <option
                    key={center.centerId}
                    value={center.centerId}
                    style={{ color: '#333', backgroundColor: '#fff' }}
                  >
                    {center.centerName || center.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Từ ngày
              <input
                type="date"
                name="startDate"
                value={bulkPayload.startDate}
                onChange={handleBulkChange}
                required
              />
            </label>
            <label>
              Đến ngày
              <input
                type="date"
                name="endDate"
                value={bulkPayload.endDate}
                onChange={handleBulkChange}
                required
              />
            </label>
            <label>
              Thời lượng (phút)
              <input
                type="number"
                min="15"
                step="15"
                name="slotDurationMinutes"
                value={bulkPayload.slotDurationMinutes}
                onChange={handleBulkChange}
              />
            </label>
            <label>
              Số tối đa mỗi khung
              <input
                type="number"
                min="1"
                name="maxBookingsPerSlot"
                value={bulkPayload.maxBookingsPerSlot}
                onChange={handleBulkChange}
              />
            </label>
            <label>
              Loại khung giờ
              <select
                name="slotType"
                value={bulkPayload.slotType}
                onChange={handleBulkChange}
              >
                <option value="Standard">Standard</option>
                <option value="Repair">Repair</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Emergency">Emergency</option>
              </select>
            </label>
            <div className="form-actions inline" style={{ gridColumn: "1 / -1" }}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="overwriteExisting"
                  checked={bulkPayload.overwriteExisting}
                  onChange={handleBulkChange}
                />
                Ghi đè khung đã có
              </label>
              <button
                className="btn primary"
                type="submit"
                disabled={generateMutation.isLoading}
              >
                {generateMutation.isLoading ? "Đang tạo..." : "Tạo hàng loạt"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="panel">
        <div className="table-head">
          <h3>Danh sách slot</h3>
          {slotsQuery.isFetching && <span className="muted">Đang tải...</span>}
        </div>
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Trung tâm</th>
                <th>Tối đa</th>
                <th>Đã đặt</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
              {slots.map((slot) => {
                const bookingCount =
                  slot.bookingCount ??
                  slot.bookingsCount ??
                  slot.bookings?.length ??
                  0;
                const blocked =
                  slot.isBlocked ?? slot.status === "Blocked" ?? false;
                const centerId = slot.centerId || slot.CenterId;
                return (
                  <tr key={slot.slotId || slot.id}>
                    <td>{slot.slotDate || slot.date}</td>
                    <td>
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td>{getCenterName(centerId)}</td>
                    <td>{slot.maxBookings ?? "-"}</td>
                    <td>{bookingCount}</td>
                    <td>{slot.slotType || "-"}</td>
                    <td>
                      <span className={`status ${blocked ? "blocked" : "open"}`}>
                        {blocked ? "Đã khóa" : "Mở"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn"
                        onClick={() =>
                          blockMutation.mutate({
                            slotId: slot.slotId || slot.id,
                            isBlocked: !blocked,
                          })
                        }
                        disabled={blockMutation.isLoading}
                      >
                        {blocked ? "Mở khóa" : "Khóa"}
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => {
                          if (window.confirm("Xác nhận xóa slot này?")) {
                            deleteMutation.mutate(slot.slotId || slot.id);
                          }
                        }}
                        disabled={deleteMutation.isLoading}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeSlots;
