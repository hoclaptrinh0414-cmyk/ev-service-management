// src/pages/customer/TrackingHistory.jsx
import React, { useState, useEffect } from "react";
import appointmentService from "../../services/appointmentService";
import vehicleService from "../../services/vehicleService";

const TrackingHistory = () => {
  const [view, setView] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy danh sách cuộc hẹn
  useEffect(() => {
    if (view === "appointments") {
      setLoading(true);
      appointmentService
        .getMyAppointments()
        .then((res) => setAppointments(res.data || []))
        .catch(() => setError("Không thể tải lịch sử cuộc hẹn"))
        .finally(() => setLoading(false));
    }
  }, [view]);

  // Lấy lịch sử bảo trì xe
  const fetchMaintenance = async () => {
    if (!vehicleId) {
      setError("Vui lòng nhập Vehicle ID");
      return;
    }
    setLoading(true);
    try {
      const res = await vehicleService.getMaintenanceHistory(vehicleId);
      setMaintenance(res.data || []);
      setError("");
    } catch {
      setError("Không thể tải lịch sử bảo trì");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Theo dõi & Lịch sử</h3>
      <div className="mb-3">
        <button
          className={`btn btn-${
            view === "appointments" ? "dark" : "outline-dark"
          } me-2`}
          onClick={() => setView("appointments")}
        >
          Lịch sử cuộc hẹn
        </button>
        <button
          className={`btn btn-${view === "vehicle" ? "dark" : "outline-dark"}`}
          onClick={() => setView("vehicle")}
        >
          Lịch sử bảo trì xe
        </button>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && view === "appointments" && (
        <ul className="list-group">
          {appointments.length > 0 ? (
            appointments.map((a) => (
              <li key={a.appointmentId} className="list-group-item">
                <strong>{a.appointmentCode}</strong> — {a.status}
              </li>
            ))
          ) : (
            <li className="list-group-item">Không có lịch hẹn nào.</li>
          )}
        </ul>
      )}

      {!loading && view === "vehicle" && (
        <div>
          <input
            type="text"
            placeholder="Nhập Vehicle ID..."
            className="form-control mb-2"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
          />
          <button className="btn btn-dark mb-3" onClick={fetchMaintenance}>
            Tải lịch sử bảo trì
          </button>

          {maintenance.length > 0 ? (
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(maintenance, null, 2)}
            </pre>
          ) : (
            <p>Chưa có dữ liệu bảo trì.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackingHistory;
