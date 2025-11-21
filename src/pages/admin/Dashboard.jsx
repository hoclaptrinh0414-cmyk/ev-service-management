import React, { useEffect, useState } from "react";
import StatCard from "../../components/dashboard/StatCard";
import MiniAreaChart from "../../components/dashboard/MiniAreaChart";
import { motion } from "framer-motion";
import { customersAPI, vehicleAPI, inventoryAPI } from "../../services/apiService";
import { Link } from "react-router-dom";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(value);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalVehicles: 0,
    lowStockItems: 0,
    inventoryValue: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [maintenanceDue, setMaintenanceDue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel API calls
        const [
          customersStatsRes,
          vehiclesRes,
          lowStockRes,
          inventoryValueRes,
          transactionsRes,
          maintenanceDueRes
        ] = await Promise.allSettled([
          customersAPI.getStatistics(),
          vehicleAPI.getCustomerVehicles({ PageSize: 1 }), // Get total count
          inventoryAPI.getLowStockAlerts(),
          inventoryAPI.getTotalValue(),
          inventoryAPI.getTransactions({ PageSize: 5, SortBy: 'TransactionDate', SortDirection: 'desc' }),
          customersAPI.getMaintenanceDue({ PageSize: 5 })
        ]);

        const newStats = { ...stats };

        // Process Customers Stats
        if (customersStatsRes.status === 'fulfilled' && customersStatsRes.value?.success) {
          const data = customersStatsRes.value.data;
          newStats.totalCustomers = data.totalCustomers || 0;
          newStats.activeCustomers = data.activeCustomers || 0;
        }

        // Process Vehicles
        if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value?.success) {
          newStats.totalVehicles = vehiclesRes.value.data.totalItems || 0;
        }

        // Process Low Stock
        if (lowStockRes.status === 'fulfilled' && lowStockRes.value?.success) {
          newStats.lowStockItems = lowStockRes.value.data.length || 0;
        }

        // Process Inventory Value
        if (inventoryValueRes.status === 'fulfilled' && inventoryValueRes.value?.success) {
          newStats.inventoryValue = inventoryValueRes.value.data.totalValue || 0;
        }

        setStats(newStats);

        // Process Recent Transactions
        if (transactionsRes.status === 'fulfilled' && transactionsRes.value?.success) {
          setRecentTransactions(transactionsRes.value.data.items || []);
        }

        // Process Maintenance Due
        if (maintenanceDueRes.status === 'fulfilled' && maintenanceDueRes.value?.success) {
          // The API might return a list directly or a paginated object
          const data = maintenanceDueRes.value.data;
          setMaintenanceDue(Array.isArray(data) ? data : (data.items || []));
        }

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Không thể tải một số dữ liệu dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="dashboard-container">
      {error && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="stats-grid">
        <motion.div variants={cardVariant} initial="hidden" animate="show">
          <StatCard
            title="Tổng Khách Hàng"
            value={loading ? "..." : formatNumber(stats.totalCustomers)}
            trend={`${formatNumber(stats.activeCustomers)} đang hoạt động`}
            icon="bi bi-people"
            color="blue"
          >
            <MiniAreaChart color="#0d6efd" height={50} width={120} />
          </StatCard>
        </motion.div>

        <motion.div variants={cardVariant} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <StatCard
            title="Tổng Xe Quản Lý"
            value={loading ? "..." : formatNumber(stats.totalVehicles)}
            trend="Phương tiện đăng ký"
            icon="bi bi-car-front"
            color="green"
          >
            <MiniAreaChart color="#198754" height={50} width={120} />
          </StatCard>
        </motion.div>

        <motion.div variants={cardVariant} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
          <StatCard
            title="Cảnh Báo Kho"
            value={loading ? "..." : formatNumber(stats.lowStockItems)}
            trend="Sản phẩm sắp hết hàng"
            icon="bi bi-box-seam"
            color="orange"
            isWarning={stats.lowStockItems > 0}
          >
            <MiniAreaChart color="#fd7e14" height={50} width={120} />
          </StatCard>
        </motion.div>

        <motion.div variants={cardVariant} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <StatCard
            title="Giá Trị Tồn Kho"
            value={loading ? "..." : formatCurrency(stats.inventoryValue)}
            trend="Tổng giá trị hiện tại"
            icon="bi bi-cash-stack"
            color="purple"
          >
            <MiniAreaChart color="#6f42c1" height={50} width={120} />
          </StatCard>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">

        {/* Left Column: Recent Activity & Maintenance */}
        <div className="content-column">

          {/* Maintenance Due */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3><i className="bi bi-tools me-2"></i>Xe Cần Bảo Dưỡng Sắp Tới</h3>
              <Link to="/admin/vehicles" className="btn-link">Xem tất cả</Link>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Xe</th>
                    <th>Ngày bảo dưỡng cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" className="text-center py-3">Đang tải...</td></tr>
                  ) : maintenanceDue.length > 0 ? (
                    maintenanceDue.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="fw-bold">{item.displayName || item.fullName}</div>
                          <small className="text-muted">{item.phoneNumber}</small>
                        </td>
                        <td>
                          {item.recentVehicles && item.recentVehicles[0] ? (
                            <>
                              <div>{item.recentVehicles[0].modelName}</div>
                              <small className="badge bg-light text-dark border">{item.recentVehicles[0].licensePlate}</small>
                            </>
                          ) : "N/A"}
                        </td>
                        <td>{formatDate(item.lastVisitDate)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="text-center py-3 text-muted">Không có xe nào cần bảo dưỡng gấp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card mt-4">
            <div className="card-header">
              <h3><i className="bi bi-lightning-charge me-2"></i>Thao Tác Nhanh</h3>
            </div>
            <div className="quick-actions-grid">
              <Link to="/admin/customers" className="quick-action-btn">
                <i className="bi bi-person-plus-fill text-primary"></i>
                <span>Thêm Khách Hàng</span>
              </Link>
              <Link to="/admin/vehicles" className="quick-action-btn">
                <i className="bi bi-car-front-fill text-success"></i>
                <span>Thêm Xe Mới</span>
              </Link>
              <Link to="/admin/parts" className="quick-action-btn">
                <i className="bi bi-box-seam-fill text-warning"></i>
                <span>Nhập Kho</span>
              </Link>
              <Link to="/admin/work-orders" className="quick-action-btn">
                <i className="bi bi-file-earmark-text-fill text-info"></i>
                <span>Tạo Phiếu Dịch Vụ</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Inventory Transactions */}
        <div className="content-column">
          <div className="dashboard-card h-100">
            <div className="card-header">
              <h3><i className="bi bi-arrow-left-right me-2"></i>Giao Dịch Kho Gần Đây</h3>
              <Link to="/admin/parts" className="btn-link">Quản lý kho</Link>
            </div>
            <div className="card-body p-0">
              <div className="transaction-list">
                {loading ? (
                  <div className="text-center py-4">Đang tải...</div>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.transactionId} className="transaction-item">
                      <div className={`transaction-icon ${tx.transactionType.toLowerCase()}`}>
                        <i className={`bi ${tx.transactionType === 'Import' ? 'bi-arrow-down' : tx.transactionType === 'Export' ? 'bi-arrow-up' : 'bi-arrow-repeat'}`}></i>
                      </div>
                      <div className="transaction-details">
                        <div className="tx-title">
                          <span className="fw-bold">{tx.partName}</span>
                          <span className={`badge-type ${tx.transactionType.toLowerCase()}`}>
                            {tx.transactionType === 'Import' ? 'Nhập' : tx.transactionType === 'Export' ? 'Xuất' : 'Điều chỉnh'}
                          </span>
                        </div>
                        <div className="tx-meta">
                          <span>{formatDate(tx.transactionDate)}</span> •
                          <span>{tx.performedByName}</span>
                        </div>
                      </div>
                      <div className="transaction-amount">
                        <span className={tx.transactionType === 'Import' ? 'text-success' : 'text-danger'}>
                          {tx.transactionType === 'Import' ? '+' : '-'}{tx.quantity}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">Chưa có giao dịch nào.</div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .dashboard-container {
          padding: 20px;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .dashboard-content-grid {
          display: grid;
          grid-template-columns: 2fr 1.5fr;
          gap: 25px;
        }

        @media (max-width: 992px) {
          .dashboard-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          overflow: hidden;
          height: 100%;
        }

        .card-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
        }

        .btn-link {
          color: #0d6efd;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-link:hover {
          text-decoration: underline;
        }

        .table th {
          font-weight: 600;
          color: #666;
          font-size: 13px;
          background: #f9fafb;
          border-bottom: 1px solid #eee;
        }

        .table td {
          vertical-align: middle;
          font-size: 14px;
        }

        /* Quick Actions */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          padding: 20px;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          text-decoration: none;
          color: #333;
          transition: all 0.2s;
          border: 1px solid #eee;
        }

        .quick-action-btn:hover {
          background: white;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          border-color: #ddd;
        }

        .quick-action-btn i {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .quick-action-btn span {
          font-weight: 500;
          font-size: 14px;
        }

        /* Transaction List */
        .transaction-list {
          padding: 0;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .transaction-item:last-child {
          border-bottom: none;
        }

        .transaction-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 18px;
        }

        .transaction-icon.import { background: #d1e7dd; color: #0f5132; }
        .transaction-icon.export { background: #f8d7da; color: #842029; }
        .transaction-icon.adjustment { background: #fff3cd; color: #664d03; }

        .transaction-details {
          flex: 1;
        }

        .tx-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .badge-type {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .badge-type.import { background: #e6f8eb; color: #198754; }
        .badge-type.export { background: #fbeaea; color: #dc3545; }
        .badge-type.adjustment { background: #fff8e1; color: #ffc107; }

        .tx-meta {
          font-size: 12px;
          color: #888;
        }

        .transaction-amount {
          font-weight: 700;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
