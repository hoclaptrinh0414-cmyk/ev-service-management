import React, { useState, useEffect } from 'react';
import { inventoryAPI, lookupAPI } from '../../services/apiService';
import StockTransactionModal from './StockTransactionModal';
import './PartsInventory.css';

const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.443-5.443a1.012 1.012 0 0 1 1.591.093l4.443 5.443a1.012 1.012 0 0 1 0 .639l-4.443 5.443a1.012 1.012 0 0 1-1.591-.093L2.036 12.322Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const TransactionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const PartsInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, low-stock, out-of-stock
    const [serviceCenters, setServiceCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // Stats
    const [totalValue, setTotalValue] = useState(0);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchServiceCenters();
        fetchTotalValue();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInventory();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchTerm, filterStatus, selectedCenter]);

    const fetchServiceCenters = async () => {
        try {
            const response = await lookupAPI.getActiveServiceCenters();
            if (response.success) {
                setServiceCenters(response.data || []);
            }
        } catch (err) {
            console.error("Failed to load service centers", err);
        }
    };

    const fetchTotalValue = async () => {
        try {
            const response = await inventoryAPI.getTotalValue();
            if (response.success) {
                setTotalValue(response.data.totalValue || 0);
            }
        } catch (err) {
            console.error("Failed to load total value", err);
        }
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                Page: currentPage,
                PageSize: pageSize,
                SortBy: 'PartName',
                SortDirection: 'asc'
            };

            if (searchTerm) params.SearchTerm = searchTerm;
            if (selectedCenter) params.ServiceCenterId = selectedCenter;

            if (filterStatus === 'low-stock') params.IsLowStock = true;
            if (filterStatus === 'out-of-stock') params.IsOutOfStock = true;

            const response = await inventoryAPI.getInventory(params);

            if (response.success && response.data) {
                setInventory(response.data.items || []);
                setTotalPages(response.data.totalPages || 1);
            } else {
                setInventory([]);
                setError('Không thể tải dữ liệu kho.');
            }
        } catch (err) {
            setError('Lỗi kết nối đến máy chủ.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
    };

    const handleCenterChange = (e) => {
        setSelectedCenter(e.target.value);
        setCurrentPage(1);
    };

    const handleTransaction = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleGeneralTransaction = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleTransactionSuccess = () => {
        fetchInventory();
        fetchTotalValue();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStockStatusClass = (status) => {
        switch (status) {
            case 'IN_STOCK': return 'status-in-stock';
            case 'LOW': return 'status-low-stock';
            case 'OUT_OF_STOCK': return 'status-out-of-stock';
            default: return '';
        }
    };

    const getStockStatusText = (status) => {
        switch (status) {
            case 'IN_STOCK': return 'Còn hàng';
            case 'LOW': return 'Sắp hết';
            case 'OUT_OF_STOCK': return 'Hết hàng';
            default: return status;
        }
    };

    return (
        <div className="parts-inventory-container">
            <div className="parts-inventory-header">
                <div>
                    <h1>Quản lý Kho Phụ tùng</h1>
                    <p className="text-muted">Tổng giá trị tồn kho: <strong>{formatCurrency(totalValue)}</strong></p>
                </div>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-input">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Tìm kiếm phụ tùng, mã SKU..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <select className="filter-dropdown" value={selectedCenter} onChange={handleCenterChange}>
                        <option value="">Tất cả chi nhánh</option>
                        {serviceCenters.map(center => (
                            <option key={center.id} value={center.id}>{center.name}</option>
                        ))}
                    </select>
                    <select className="filter-dropdown" value={filterStatus} onChange={handleFilterChange}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="low-stock">Sắp hết hàng</option>
                        <option value="out-of-stock">Hết hàng</option>
                    </select>
                </div>
                <div className="toolbar-right">
                    <button className="add-part-btn" onClick={handleGeneralTransaction}>
                        <span style={{ fontSize: '18px', marginRight: '5px' }}>&#8644;</span> Nhập/Xuất Kho
                    </button>
                </div>
            </div>

            <div className="parts-table-wrapper">
                <table className="parts-table">
                    <thead>
                        <tr>
                            <th>Mã PT</th>
                            <th>Tên phụ tùng</th>
                            <th>Danh mục</th>
                            <th>Chi nhánh</th>
                            <th style={{ textAlign: 'center' }}>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Giá bán</th>
                            <th>Vị trí</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                    <div className="spinner-border" role="status"></div>
                                    <div style={{ marginTop: '10px' }}>Đang tải dữ liệu kho...</div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                                    {error}
                                </td>
                            </tr>
                        ) : inventory.length > 0 ? (
                            inventory.map((item) => (
                                <tr key={item.inventoryId}>
                                    <td><strong>{item.partCode}</strong></td>
                                    <td>
                                        <div>{item.partName}</div>
                                        <small className="text-muted">{item.supplierName}</small>
                                    </td>
                                    <td>{item.categoryName}</td>
                                    <td>{item.serviceCenterName}</td>
                                    <td className="stock-quantity">
                                        {item.currentStock} <small>{item.unit}</small>
                                        {item.reservedStock > 0 && (
                                            <div className="reserved-info" title="Đang giữ chỗ">
                                                (Giữ: {item.reservedStock})
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStockStatusClass(item.stockStatus)}`}>
                                            {getStockStatusText(item.stockStatus)}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(item.sellingPrice)}</td>
                                    <td>{item.location || '-'}</td>
                                    <td className="action-icons">
                                        <button className="icon-btn" title="Xem chi tiết">
                                            <ViewIcon />
                                        </button>
                                        <button className="icon-btn" title="Nhập/Xuất kho" onClick={() => handleTransaction(item)}>
                                            <TransactionIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                    Không tìm thấy dữ liệu phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="page-btn"
                    >
                        &lt;
                    </button>
                    <span className="page-info">Trang {currentPage} / {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="page-btn"
                    >
                        &gt;
                    </button>
                </div>
            )}

            <StockTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleTransactionSuccess}
                initialPart={selectedItem}
            />

            <style>{`
                .text-muted { color: #6c757d; font-size: 0.85em; }
                .reserved-info { font-size: 0.75em; color: #e67e22; }
                .icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 5px;
                    color: #555;
                    transition: color 0.2s;
                }
                .icon-btn:hover { color: #000; }
                
                .pagination-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 20px;
                    gap: 15px;
                }
                .page-btn {
                    padding: 5px 12px;
                    border: 1px solid #ddd;
                    background: white;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .spinner-border {
                    display: inline-block;
                    width: 2rem;
                    height: 2rem;
                    vertical-align: text-bottom;
                    border: .25em solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                    animation: spinner-border .75s linear infinite;
                }
                @keyframes spinner-border {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PartsInventory;