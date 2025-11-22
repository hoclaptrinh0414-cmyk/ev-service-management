// src/pages/admin/VehicleManagement.jsx - HOÀN CHỈNH - THAY THẾ FILE CŨ
import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../../services/api';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🚗 Fetching vehicles from API...');
      
      // Tạo params cho API
      const params = {
        page: currentPage,
        pageSize: pageSize,
      };

      // Thêm search term nếu có
      if (searchTerm && searchTerm.trim() !== '') {
        params.searchTerm = searchTerm.trim();
      }

      // Thêm filter nếu không phải 'all'
      if (filterStatus !== 'all') {
        params.maintenanceStatus = filterStatus;
      }

      console.log('📋 Request params:', params);

      // GỌI API THẬT
      const response = await vehicleAPI.getCustomerVehicles(params);
      console.log('✅ API Response:', response);
      
      // Xử lý response
      if (response.success && response.data) {
        const vehicleData = response.data.items || response.data;
        const pages = response.data.totalPages || 1;
        
        setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
        setTotalPages(pages);
        console.log(`✅ Loaded ${vehicleData.length} vehicles`);
      } else if (Array.isArray(response)) {
        setVehicles(response);
        setTotalPages(1);
        console.log(`✅ Loaded ${response.length} vehicles`);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      
      if (error.message === 'Network error - Cannot connect to server') {
        setError('Không thể kết nối đến server. Đang hiển thị dữ liệu mẫu.');
      } else {
        setError('Không thể tải dữ liệu từ API. Đang hiển thị dữ liệu mẫu.');
      }
      
      // Fallback: Mock data
      const mockData = [
        {
          vehicleId: 9,
          customerName: "Nguyễn Văn An",
          fullModelName: "Tesla Model 3 Long Range 2023",
          licensePlate: "29A-99999",
          nextMaintenanceDate: "2025-04-01",
          lastMaintenanceDate: "2024-10-15",
          mileage: 15000,
          batteryHealthPercent: 100.00,
          maintenanceStatus: "Cần bảo dưỡng"
        },
        {
          vehicleId: 8,
          customerName: "Trần Thị Bình",
          fullModelName: "Tesla Model Y Performance 2024",
          licensePlate: "30B-88888",
          nextMaintenanceDate: "2025-05-15",
          lastMaintenanceDate: "2024-11-20",
          mileage: 8500,
          batteryHealthPercent: 95.50,
          maintenanceStatus: "Bình thường"
        },
        {
          vehicleId: 7,
          customerName: "Lê Văn Cường",
          fullModelName: "VinFast VF8 Plus 2024",
          licensePlate: "51C-77777",
          nextMaintenanceDate: "2025-03-20",
          lastMaintenanceDate: "2024-09-10",
          mileage: 22000,
          batteryHealthPercent: 88.00,
          maintenanceStatus: "Cần bảo dưỡng"
        },
        {
          vehicleId: 6,
          customerName: "Phạm Minh Đức",
          fullModelName: "Tesla Model S Plaid 2023",
          licensePlate: "59D-66666",
          nextMaintenanceDate: "2025-06-10",
          lastMaintenanceDate: "2024-12-05",
          mileage: 5000,
          batteryHealthPercent: 98.00,
          maintenanceStatus: "Bình thường"
        },
        {
          vehicleId: 5,
          customerName: "Hoàng Thị Em",
          fullModelName: "Tesla Model X Long Range 2023",
          licensePlate: "92E-55555",
          nextMaintenanceDate: "2025-02-28",
          lastMaintenanceDate: "2024-08-25",
          mileage: 35000,
          batteryHealthPercent: 82.00,
          maintenanceStatus: "Cần bảo dưỡng"
        }
      ];
      
      setVehicles(mockData);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return dateString;
    }
  };

  const getBatteryHealthColor = (percent) => {
    if (percent >= 90) return '#28a745';
    if (percent >= 70) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Đang tải dữ liệu xe...</p>
      </div>
    );
  }

  return (
    <div className="vehicle-management">
      <div className="section-header">
        <h2>🚗 Quản lý Xe Điện</h2>
        <button className="btn-add">
          <i className="bi bi-plus-circle me-2"></i>
          Thêm xe mới
        </button>
      </div>

      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-container">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng, biển số, model..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Tất cả ({vehicles.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Cần bảo dưỡng' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Cần bảo dưỡng')}
          >
            Cần bảo dưỡng ({vehicles.filter(v => v.maintenanceStatus === 'Cần bảo dưỡng').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Bình thường' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Bình thường')}
          >
            Bình thường ({vehicles.filter(v => v.maintenanceStatus === 'Bình thường').length})
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="bi bi-car-front-fill"></i>
          </div>
          <div className="stat-content">
            <h3>{vehicles.length}</h3>
            <p>Tổng số xe</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon yellow">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="stat-content">
            <h3>{vehicles.filter(v => v.maintenanceStatus === 'Cần bảo dưỡng').length}</h3>
            <p>Cần bảo dưỡng</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-content">
            <h3>{vehicles.filter(v => v.maintenanceStatus === 'Bình thường').length}</h3>
            <p>Trạng thái tốt</p>
          </div>
        </div>
      </div>

      {/* Table - HIỂN THỊ ĐÚNG YÊU CẦU */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>👤 Tên khách hàng</th>
              <th>🚗 Model xe (Full)</th>
              <th>🔖 Biển số</th>
              <th>🔧 Sửa chữa lần cuối</th>
              <th>📅 Bảo dưỡng tiếp theo</th>
              <th>📏 Km đã chạy</th>
              <th>🔋 Sức khỏe pin</th>
              <th>📊 Trạng thái</th>
              <th>⚙️ Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                  <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <p className="mt-2 text-muted">Không có dữ liệu xe</p>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle, index) => (
                <tr key={vehicle.vehicleId}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>
                    <strong>{vehicle.customerName}</strong>
                  </td>
                  <td>
                    <strong>{vehicle.fullModelName}</strong>
                  </td>
                  <td>
                    <span className="license-plate">{vehicle.licensePlate}</span>
                  </td>
                  <td><strong>{formatDate(vehicle.lastMaintenanceDate)}</strong></td>
                  <td>{formatDate(vehicle.nextMaintenanceDate)}</td>
                  <td>{vehicle.mileage?.toLocaleString() || 0} km</td>
                  <td>
                    <div className="battery-bar">
                      <div 
                        className="battery-fill" 
                        style={{
                          width: `${vehicle.batteryHealthPercent}%`,
                          backgroundColor: getBatteryHealthColor(vehicle.batteryHealthPercent)
                        }}
                      ></div>
                      <span>{vehicle.batteryHealthPercent}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${vehicle.maintenanceStatus === "Cần bảo dưỡng" ? "warning" : "normal"}`}>
                      {vehicle.maintenanceStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" title="Xem chi tiết">
                        <i className="bi bi-eye"></i>
                      </button>
                      <button className="btn-edit" title="Chỉnh sửa">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-delete" title="Xóa">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}

  <style>{`
        .loading {
          text-align: center;
          padding: 3rem;
        }

        .spinner-border {
          width: 3rem;
          height: 3rem;
          border: 0.25em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border 0.75s linear infinite;
        }

        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }

        .search-filter-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
          max-width: 400px;
        }

        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .search-box input {
          width: 100%;
          padding: 10px 15px 10px 40px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .search-box input:focus {
          outline: none;
          border-color: #000;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          background: #f8f9fa;
        }

        .filter-btn.active {
          background: #000;
          color: white;
          border-color: #000;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .stat-icon.yellow { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-icon.green { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

        .stat-content h3 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #000;
        }

        .stat-content p {
          margin: 0;
          font-size: 14px;
          color: #6c757d;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .btn-view, .btn-edit, .btn-delete {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .btn-view {
          background: #007bff;
          color: white;
        }

        .btn-view:hover {
          background: #0056b3;
        }

        .btn-edit {
          background: #28a745;
          color: white;
        }

        .btn-edit:hover {
          background: #218838;
        }

        .btn-delete {
          background: #dc3545;
          color: white;
        }

        .btn-delete:hover {
          background: #c82333;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .page-btn {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          min-width: 38px;
        }

        .page-btn:hover:not(:disabled) {
          background: #f8f9fa;
        }

        .page-btn.active {
          background: #000;
          color: white;
          border-color: #000;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .alert {
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 5px;
          display: flex;
          align-items: center;
        }

        .alert-warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
        }

        .btn-close {
          margin-left: auto;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.5;
        }

        .btn-close:hover {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .search-filter-container {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: 100%;
          }

          .filter-buttons {
            justify-content: center;
          }

          .stats-cards {
            grid-template-columns: 1fr;
          }

          .table-wrapper {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleManagement;