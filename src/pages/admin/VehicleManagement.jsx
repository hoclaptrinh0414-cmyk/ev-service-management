// src/pages/admin/VehicleManagement.jsx
import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../../services/apiService';
import VehicleDetailModal from './VehicleDetailModal';

const VehicleManagement = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal State
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'

    const pageSize = 10;

    const fetchVehicles = async () => {
        setLoading(true);
        setError('');

        try {
            console.log('Fetching vehicles from API...');

            // Tạo params cho API
            const params = {
                Page: currentPage,
                PageSize: pageSize,
                IncludeCustomer: true,
                IncludeModel: true,
                IncludeStats: true,
                SortBy: 'CreatedDate',
                SortOrder: 'desc'
            };

            // Thêm search term nếu có
            if (searchTerm && searchTerm.trim() !== '') {
                params.SearchTerm = searchTerm.trim();
            }

            // Thêm filter
            if (filterStatus === 'Cần bảo dưỡng') {
                params.MaintenanceDue = true;
            } else if (filterStatus === 'Bình thường') {
                params.MaintenanceDue = false;
            }
            // Nếu filterStatus là 'all', không gửi MaintenanceDue để lấy tất cả

            console.log('Request params:', params);

            // GỌI API ADMIN
            const response = await vehicleAPI.getCustomerVehicles(params);
            console.log('API Response:', response);

            // Xử lý response
            if (response.success && response.data) {
                const vehicleData = response.data.items || [];
                const pages = response.data.totalPages || 1;
                const total = response.data.totalItems || 0;

                setVehicles(vehicleData);
                setTotalPages(pages);
                setTotalItems(total);
                console.log(`Loaded ${vehicleData.length} vehicles`);
            } else {
                // Fallback if structure is different
                console.warn('Unexpected response structure:', response);
                setVehicles([]);
            }

        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setError('Không thể tải dữ liệu từ API. Vui lòng thử lại sau.');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1); // Reset to page 1 on search
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

    const handleView = (vehicle) => {
        setSelectedVehicle(vehicle);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEdit = (vehicle) => {
        setSelectedVehicle(vehicle);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (vehicleId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa xe này không? Hành động này không thể hoàn tác.')) {
            try {
                await vehicleAPI.deleteCustomerVehicle(vehicleId);
                // Refresh list
                fetchVehicles();
                alert('Xóa xe thành công!');
            } catch (error) {
                console.error('Error deleting vehicle:', error);
                alert('Xóa xe thất bại: ' + (error.message || 'Lỗi không xác định'));
            }
        }
    };

    const handleSaveVehicle = async (updatedData) => {
        try {
            // Call API to update
            await vehicleAPI.updateCustomerVehicle(updatedData.vehicleId, updatedData);
            alert('Cập nhật thông tin xe thành công!');
            fetchVehicles(); // Refresh list
            return true;
        } catch (error) {
            console.error('Error updating vehicle:', error);
            alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
            throw error;
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
        if (!percent) return '#ccc';
        if (percent >= 90) return '#28a745';
        if (percent >= 70) return '#ffc107';
        return '#dc3545';
    };

    // Trigger data load on first mount and when filters/pagination change
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchVehicles();
        }, 500); // Debounce search

        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filterStatus, searchTerm]);

    if (loading && vehicles.length === 0) {
        return (
            <div className="loading">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Đang tải dữ liệu xe...</p>
                <style>{`
          .loading { text-align: center; padding: 3rem; }
          .spinner-border { width: 3rem; height: 3rem; border: 0.25em solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spinner-border 0.75s linear infinite; }
          @keyframes spinner-border { to { transform: rotate(360deg); } }
        `}</style>
            </div>
        );
    }

    return (
        <div className="vehicle-management">
            <div className="section-header">
                <h2>Quản lý Xe Điện</h2>
                <button className="btn-add" onClick={() => alert('Chức năng thêm xe mới đang phát triển')}>
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
                        Tất cả
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'Cần bảo dưỡng' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('Cần bảo dưỡng')}
                    >
                        Cần bảo dưỡng
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'Bình thường' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('Bình thường')}
                    >
                        Bình thường
                    </button>
                </div>
            </div>

            {/* Statistics Cards (Optional - can be dynamic based on API stats if available, currently static/calculated from page which is inaccurate for server-side pagination, so maybe remove or fetch stats separately) */}
            {/* For now, we will hide stats cards or make them generic since we don't have global stats API in this view easily without another call */}

            {/* Table */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên khách hàng</th>
                            <th>Model xe (Full)</th>
                            <th>Biển số</th>
                            <th>Sửa chữa lần cuối</th>
                            <th>Bảo dưỡng tiếp theo</th>
                            <th>Km đã chạy</th>
                            <th>Sức khỏe pin</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                    <p className="mt-2 text-muted">Không tìm thấy xe nào</p>
                                </td>
                            </tr>
                        ) : (
                            vehicles.map((vehicle, index) => (
                                <tr key={vehicle.vehicleId}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>
                                        <strong>{vehicle.customerName}</strong>
                                        <div className="small-text text-muted">{vehicle.customerCode}</div>
                                    </td>
                                    <td>
                                        <strong>{vehicle.fullModelName}</strong>
                                    </td>
                                    <td>
                                        <span className="license-plate">{vehicle.licensePlate}</span>
                                    </td>
                                    <td>{formatDate(vehicle.lastMaintenanceDate)}</td>
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
                                            <button className="btn-view" title="Xem chi tiết" onClick={() => handleView(vehicle)}>
                                                <i className="bi bi-eye"></i>
                                            </button>
                                            <button className="btn-edit" title="Chỉnh sửa" onClick={() => handleEdit(vehicle)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn-delete" title="Xóa" onClick={() => handleDelete(vehicle.vehicleId)}>
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

                    <span className="page-info">
                        Trang {currentPage} / {totalPages}
                    </span>

                    <button
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>
            )}

            {/* Modal */}
            <VehicleDetailModal
                vehicle={selectedVehicle}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveVehicle}
                mode={modalMode}
            />

            <style>{`
        .vehicle-management {
          padding: 20px;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .btn-add {
          background: #000;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.3s;
        }

        .btn-add:hover {
          background: #333;
          transform: translateY(-2px);
        }

        .search-filter-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
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
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
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
          border: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #555;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          background: #e9ecef;
        }

        .filter-btn.active {
          background: #000;
          color: white;
          border-color: #000;
        }

        .table-wrapper {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          overflow: hidden;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f8f9fa;
          border-bottom: 2px solid #eee;
        }

        th {
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #444;
          font-size: 14px;
          white-space: nowrap;
        }

        td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
          color: #333;
          vertical-align: middle;
        }

        tr:hover {
          background-color: #f8f9fa;
        }

        .license-plate {
          background: #ffc107;
          color: #000;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 700;
          font-family: monospace;
          border: 1px solid #e0a800;
        }

        .battery-bar {
          width: 100px;
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .battery-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .battery-bar span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: 700;
          color: #333;
          text-shadow: 0 0 2px white;
        }

        .status-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.warning {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.normal {
          background: #d4edda;
          color: #155724;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-view, .btn-edit, .btn-delete {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-view { background: #e7f1ff; color: #0d6efd; }
        .btn-view:hover { background: #0d6efd; color: white; }

        .btn-edit { background: #e6f8eb; color: #198754; }
        .btn-edit:hover { background: #198754; color: white; }

        .btn-delete { background: #fbeaea; color: #dc3545; }
        .btn-delete:hover { background: #dc3545; color: white; }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .page-btn {
          width: 36px;
          height: 36px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: #000;
          color: white;
          border-color: #000;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }

        .small-text {
          font-size: 12px;
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
            flex-wrap: wrap;
          }
        }
      `}</style>
        </div>
    );
};

export default VehicleManagement;
