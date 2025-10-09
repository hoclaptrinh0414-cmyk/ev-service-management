// src/pages/admin/Dashboard.jsx - UI GIỐNG HTML MẪU
import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../../components/dashboard/StatCard";
import MiniAreaChart from "../../components/dashboard/MiniAreaChart";
import TrendBadge from "../../components/dashboard/TrendBadge";
import ProgressStat from "../../components/dashboard/ProgressStat";
import TrendAreaChart from "../../components/dashboard/TrendAreaChart";
import { motion } from "framer-motion";
import DonutChart from "../../components/dashboard/DonutChart";
import { appointmentsAPI, customersAPI, vehicleAPI } from "../../services/api";

const COLOR_PALETTE = [
  "#0d6efd",
  "#198754",
  "#6f42c1",
  "#fd7e14",
  "#0dcaf0",
  "#20c997",
  "#ffc107",
];

const DEFAULT_TOP_MODELS = [
  { name: "VF 8", share: 32, color: "#0d6efd" },
  { name: "Model 3", share: 26, color: "#198754" },
  { name: "Model Y", share: 18, color: "#6f42c1" },
  { name: "VF e34", share: 12, color: "#fd7e14" },
  { name: "Others", share: 12, color: "#6c757d" },
];

const extractData = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  if (Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "Data")) {
    return payload.Data;
  }
  return payload;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number.isFinite(value) ? value : 0);

const pickColor = (index) => COLOR_PALETTE[index % COLOR_PALETTE.length];

const normalizeTimeString = (value) => {
  if (typeof value !== "string") return value;
  return value.length === 5 ? `${value}:00` : value;
};

const formatDate = (value) => {
  if (!value) return "—";

  try {
    const baseValue =
      typeof value === "string" && !value.includes("T")
        ? `${value}T00:00:00`
        : value;
    const date = new Date(baseValue);
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

const mapMaintenanceCustomers = (items) =>
  (Array.isArray(items) ? items : []).map((customer, index) => {
    const vehicles = customer?.recentVehicles ?? customer?.RecentVehicles ?? [];
    const primaryVehicle = vehicles[0];

    const vehicleNameParts = [
      primaryVehicle?.brandName ?? primaryVehicle?.BrandName,
      primaryVehicle?.modelName ?? primaryVehicle?.ModelName,
    ].filter(Boolean);

    return {
      id:
        customer?.customerId ??
        customer?.CustomerId ??
        customer?.customerCode ??
        customer?.CustomerCode ??
        `customer-${index}`,
      name:
        customer?.displayName ??
        customer?.fullName ??
        customer?.FullName ??
        "Không rõ tên",
      vehicle: vehicleNameParts.length
        ? vehicleNameParts.join(" ")
        : "Chưa cập nhật",
      vin:
        primaryVehicle?.licensePlate ??
        primaryVehicle?.LicensePlate ??
        customer?.customerCode ??
        customer?.CustomerCode ??
        "—",
      lastService: formatDate(
        customer?.lastVisitDate ?? customer?.LastVisitDate
      ),
      phone: customer?.phoneNumber ?? customer?.PhoneNumber ?? "—",
    };
  });

const mapRecentBookings = (items) =>
  (Array.isArray(items) ? items : []).map((item, index) => {
    const services = item?.services ?? item?.Services ?? [];
    const serviceNames = services
      .map((service) => service?.serviceName ?? service?.ServiceName)
      .filter(Boolean);

    const slotDate = item?.slotDate ?? item?.SlotDate ?? null;
    const slotStartTime =
      item?.slotStartTime ?? item?.SlotStartTime ?? undefined;

    let dateValue = item?.createdDate ?? item?.CreatedDate ?? slotDate;

    if (slotDate) {
      const normalized = normalizeTimeString(slotStartTime);
      dateValue = normalized
        ? `${slotDate}T${normalized}`
        : `${slotDate}T00:00:00`;
    }

    return {
      id:
        item?.appointmentId ??
        item?.AppointmentId ??
        item?.appointmentCode ??
        item?.AppointmentCode ??
        `booking-${index}`,
      customer: item?.customerName ?? item?.CustomerName ?? "Không rõ",
      service:
        serviceNames.slice(0, 2).join(", ") ||
        item?.packageName ||
        item?.PackageName ||
        "—",
      date: formatDate(dateValue),
      status: item?.statusName ?? item?.StatusName ?? "Unknown",
      color: item?.statusColor ?? item?.StatusColor ?? null,
    };
  });

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    activeVehicles: 0,
    maintenanceDueCustomers: 0,
    maintenanceDueVehicles: 0,
    activeAppointments: 0,
    totalAppointments: 0,
    completedAppointments: 0,
  });

  const [customers, setCustomers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [vehicleBreakdown, setVehicleBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const completionRate = useMemo(() => {
    if (!stats.totalAppointments) return 0;
    const rate =
      (stats.completedAppointments / Math.max(stats.totalAppointments, 1)) * 100;
    return Math.max(0, Math.min(100, Math.round(rate)));
  }, [stats.completedAppointments, stats.totalAppointments]);

  const maintenanceSharePercent = useMemo(() => {
    if (!stats.totalCustomers) return 0;
    const share =
      (stats.maintenanceDueCustomers /
        Math.max(stats.totalCustomers, 1)) *
      100;
    return Math.max(0, Math.min(100, Math.round(share)));
  }, [stats.maintenanceDueCustomers, stats.totalCustomers]);

  const topModels = useMemo(() => {
    if (!vehicleBreakdown.length) return DEFAULT_TOP_MODELS;

    const total = vehicleBreakdown.reduce(
      (sum, item) => sum + (item?.count ?? item?.Count ?? 0),
      0
    );

    if (!total) return DEFAULT_TOP_MODELS;

    return vehicleBreakdown.slice(0, 5).map((item, index) => {
      const count = item?.count ?? item?.Count ?? 0;
      const name =
        item?.brandName ?? item?.BrandName ?? item?.name ?? "Khác";

      return {
        name,
        share: Math.max(0, Math.round((count / total) * 100)),
        color: item?.color ?? pickColor(index),
      };
    });
  }, [vehicleBreakdown]);

  const cardVariant = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      if (
        !customersAPI.getStatistics ||
        !customersAPI.getMaintenanceDue ||
        !vehicleAPI.getVehicleStatistics ||
        !appointmentsAPI.getStatisticsByStatus ||
        !appointmentsAPI.getAppointments
      ) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const errors = [];

      try {
        const results = await Promise.allSettled([
          customersAPI.getStatistics(),
          vehicleAPI.getVehicleStatistics(),
          customersAPI.getMaintenanceDue(),
          appointmentsAPI.getStatisticsByStatus(),
          appointmentsAPI.getAppointments({
            page: 1,
            pageSize: 4,
            sortBy: "AppointmentDate",
            sortOrder: "desc",
          }),
        ]);

        if (!isMounted) return;

        const nextStats = {};
        let nextCustomers = null;
        let nextBookings = null;
        let nextVehicleBreakdown = null;

        results.forEach((result, index) => {
          if (result.status !== "fulfilled") {
            const reason = result.reason;
            const message =
              reason?.message || reason?.statusText || "Không thể tải dữ liệu";
            errors.push(message);
            return;
          }

          const payload = extractData(result.value);

          switch (index) {
            case 0: {
              if (!payload) break;

              nextStats.totalCustomers =
                payload?.totalCustomers ?? payload?.TotalCustomers ?? 0;
              nextStats.activeCustomers =
                payload?.activeCustomers ?? payload?.ActiveCustomers ?? 0;
              nextStats.maintenanceDueCustomers =
                payload?.maintenanceDueCustomers ??
                payload?.MaintenanceDueCustomers ??
                0;
              break;
            }
            case 1: {
              if (!payload) break;

              nextStats.activeVehicles =
                payload?.activeVehicles ?? payload?.ActiveVehicles ?? 0;
              nextStats.maintenanceDueVehicles =
                payload?.maintenanceDueVehicles ??
                payload?.MaintenanceDueVehicles ??
                0;
              nextVehicleBreakdown =
                payload?.vehiclesByBrand ?? payload?.VehiclesByBrand ?? [];
              break;
            }
            case 2: {
              nextCustomers = mapMaintenanceCustomers(payload);
              break;
            }
            case 3: {
              if (!payload) break;

              const byStatus = payload?.byStatus ?? payload?.ByStatus ?? {};
              nextStats.totalAppointments =
                payload?.total ?? payload?.Total ?? 0;
              nextStats.activeAppointments =
                payload?.activeAppointments ??
                payload?.ActiveAppointments ??
                0;
              nextStats.completedAppointments =
                byStatus?.Completed ?? byStatus?.completed ?? 0;
              break;
            }
            case 4: {
              const items = payload?.items ?? payload?.Items ?? [];
              nextBookings = mapRecentBookings(items);
              break;
            }
            default:
              break;
          }
        });

        setStats((prev) => ({
          ...prev,
          ...nextStats,
        }));

        if (nextCustomers) {
          setCustomers(nextCustomers);
        }

        if (nextBookings) {
          setRecentBookings(nextBookings);
        }

        if (nextVehicleBreakdown) {
          setVehicleBreakdown(nextVehicleBreakdown);
        }
      } catch (fetchError) {
        errors.push(fetchError?.message ?? "Không thể tải dữ liệu");
      } finally {
        if (!isMounted) return;

        if (errors.length) {
          setError(errors.join(" | "));
        }

        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {error && (
        <div
          className="alert alert-warning mb-3"
          role="alert"
          style={{ border: "1px solid #facc15" }}
        >
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="main-content">
        <div
          className="d-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          {[
            <StatCard
              key="c1"
              title="Total Customers"
              value={loading ? "…" : formatNumber(stats.totalCustomers)}
              trend={
                loading
                  ? "Đang tải dữ liệu..."
                  : `${formatNumber(stats.activeCustomers)} active`
              }
              icon="bi bi-people"
            >
              <MiniAreaChart color="#198754" height={60} width={220} />
            </StatCard>,
            <StatCard
              key="c2"
              title="Active Vehicles"
              value={loading ? "…" : formatNumber(stats.activeVehicles)}
              trend={
                loading
                  ? "Đang tải dữ liệu..."
                  : `${formatNumber(stats.maintenanceDueVehicles)} due soon`
              }
              icon="bi bi-car-front"
            >
              <MiniAreaChart color="#0d6efd" height={60} width={220} />
            </StatCard>,
            <StatCard
              key="c3"
              title="Maintenance Due Customers"
              value={
                loading ? "…" : formatNumber(stats.maintenanceDueCustomers)
              }
              trend={
                loading
                  ? "Đang tải dữ liệu..."
                  : stats.totalCustomers
                  ? `${maintenanceSharePercent}% of base`
                  : "Chưa có dữ liệu"
              }
              icon="bi bi-tools"
            >
              <ProgressStat
                label="Reminder Coverage"
                value={maintenanceSharePercent}
                color="#6f42c1"
              />
            </StatCard>,
            <StatCard
              key="c4"
              title="Active Appointments"
              value={loading ? "…" : formatNumber(stats.activeAppointments)}
              trend={
                loading
                  ? "Đang tải dữ liệu..."
                  : `Total ${formatNumber(stats.totalAppointments)}`
              }
              icon="bi bi-calendar-check"
            >
              <div className="d-flex align-items-center gap-2">
                <TrendBadge
                  value={`${completionRate}% completed`}
                  type={completionRate >= 50 ? "up" : "down"}
                />
                <MiniAreaChart color="#0dcaf0" height={60} width={220} />
              </div>
            </StatCard>,
          ].map((node, idx) => (
            <motion.div key={idx} variants={cardVariant} initial="hidden" animate="show">
              {node}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick glance chart */}
      <div className="table-card-container">
        <div className="table-card">
          <div className="table-header-row">
            <h3>Weekly Service Trends</h3>
            <button className="add-button">
              <i className="bi bi-download"></i> Export
            </button>
          </div>
          <TrendAreaChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="table-card-container">
        <div className="table-card">
          <div className="table-header-row">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            {[
              { icon: "bi bi-plus-square", label: "Add Vehicle" },
              { icon: "bi bi-calendar2-plus", label: "New Booking" },
              { icon: "bi bi-people", label: "New Customer" },
              { icon: "bi bi-download", label: "Export Report" },
            ].map((a, i) => (
              <motion.button
                key={i}
                type="button"
                className="quick-action btn text-start"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <i className={a.icon}></i>
                <span>{a.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="table-card-container">
        <div className="table-card">
          <div className="table-header-row">
            <h3>Service Mix & Monthly Trend</h3>
          </div>
          <div className="row g-3">
            <div className="col-md-5">
              <DonutChart
                data={topModels.map((item) => ({
                  name: item.name,
                  value: item.share,
                }))}
                colors={topModels.map((item) => item.color)}
              />
            </div>
            <div className="col-md-7">
              <TrendAreaChart height={220} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Top Models */}
      <div className="table-card-container">
        <div className="table-card">
          <div className="row g-3">
            <div className="col-lg-7">
              <div className="table-header-row">
                <h3>Recent Bookings</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          Đang tải dữ liệu lịch hẹn...
                        </td>
                      </tr>
                    ) : recentBookings.length ? (
                      recentBookings.map((b) => {
                        const statusColor =
                          b.color ??
                          (b.status === "Completed"
                            ? "#22c55e"
                            : b.status === "In Progress"
                            ? "#f59e0b"
                            : "#0d6efd");

                        return (
                          <tr key={b.id}>
                            <td>{b.customer}</td>
                            <td>{b.service}</td>
                            <td>{b.date}</td>
                            <td>
                              <span className="chip">
                                <span
                                  className="status-dot"
                                  style={{ background: statusColor }}
                                />
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          Chưa có dữ liệu lịch hẹn.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="table-header-row">
                <h3>Top Models</h3>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {topModels.map((m) => (
                  <span
                    key={m.name}
                    className="chip"
                    style={{ borderColor: m.color, background: m.color + "22" }}
                  >
                    <span className="status-dot" style={{ background: m.color }} />
                    {m.name} · {m.share}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="table-card-container">
        <div className="table-card">
          <div className="table-header-row">
            <h3>Customer List</h3>
            <button className="add-button">
              <i className="bi bi-plus-circle"></i> Add New Customer
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vehicle</th>
                  <th>VIN</th>
                  <th>Last Service</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      Đang tải danh sách khách hàng...
                    </td>
                  </tr>
                ) : customers.length ? (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.vehicle}</td>
                      <td>{customer.vin}</td>
                      <td>{customer.lastService}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <div className="action-icons">
                          <button
                            type="button"
                            title="View"
                            className="action-icon view-icon btn btn-link p-0"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            title="Edit"
                            className="action-icon edit-icon btn btn-link p-0"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            className="action-icon delete-icon btn btn-link p-0"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      Không có khách hàng nào cần bảo dưỡng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
