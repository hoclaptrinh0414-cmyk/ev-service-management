import React, { useState, useEffect } from 'react';
import './PartsInventory.css';

// Action Icons and Search Icon are kept as they define the component's structure
const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.443-5.443a1.012 1.012 0 0 1 1.591.093l4.443 5.443a1.012 1.012 0 0 1 0 .639l-4.443 5.443a1.012 1.012 0 0 1-1.591-.093L2.036 12.322Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const PartsInventory = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Mock data - Trong thực tế sẽ fetch từ API
    const mockParts = [
        {
            id: 1,
            name: 'Pin Lithium-Ion 75kWh',
            sku: 'BAT-LI-75K',
            category: 'Pin',
            quantity: 15,
            status: 'in-stock',
            costPrice: 150000000,
            sellPrice: 180000000,
            supplier: 'CATL Battery Co.',
            image: 'https://via.placeholder.com/40x40.png?text=BAT'
        },
        {
            id: 2,
            name: 'Động cơ điện 200kW',
            sku: 'MTR-ELC-200',
            category: 'Động cơ',
            quantity: 8,
            status: 'in-stock',
            costPrice: 80000000,
            sellPrice: 95000000,
            supplier: 'Bosch Electric Motors',
            image: 'https://via.placeholder.com/40x40.png?text=MTR'
        },
        {
            id: 3,
            name: 'Phanh đĩa Ceramic',
            sku: 'BRK-CER-F01',
            category: 'Phanh',
            quantity: 25,
            status: 'in-stock',
            costPrice: 5000000,
            sellPrice: 7000000,
            supplier: 'Brembo Vietnam',
            image: 'https://via.placeholder.com/40x40.png?text=BRK'
        },
        {
            id: 4,
            name: 'Lốp xe All-Season 19"',
            sku: 'TIR-AS-19',
            category: 'Bánh xe',
            quantity: 3,
            status: 'low-stock',
            costPrice: 3000000,
            sellPrice: 4500000,
            supplier: 'Michelin Vietnam',
            image: 'https://via.placeholder.com/40x40.png?text=TIR'
        },
        {
            id: 5,
            name: 'Bộ sạc nhanh DC 150kW',
            sku: 'CHR-DC-150',
            category: 'Điện tử',
            quantity: 0,
            status: 'out-of-stock',
            costPrice: 45000000,
            sellPrice: 55000000,
            supplier: 'ABB Charging',
            image: 'https://via.placeholder.com/40x40.png?text=CHR'
        },
        {
            id: 6,
            name: 'Hệ thống làm mát Pin',
            sku: 'COL-BAT-SYS',
            category: 'Làm mát',
            quantity: 12,
            status: 'in-stock',
            costPrice: 25000000,
            sellPrice: 32000000,
            supplier: 'Valeo Thermal',
            image: 'https://via.placeholder.com/40x40.png?text=COL'
        },
        {
            id: 7,
            name: 'Bộ điều khiển BMS',
            sku: 'BMS-CTL-V2',
            category: 'Điện tử',
            quantity: 20,
            status: 'in-stock',
            costPrice: 15000000,
            sellPrice: 20000000,
            supplier: 'Texas Instruments',
            image: 'https://via.placeholder.com/40x40.png?text=BMS'
        },
        {
            id: 8,
            name: 'Cáp sạc Type 2',
            sku: 'CAB-T2-10M',
            category: 'Phụ kiện',
            quantity: 5,
            status: 'low-stock',
            costPrice: 2000000,
            sellPrice: 3000000,
            supplier: 'Phoenix Contact',
            image: 'https://via.placeholder.com/40x40.png?text=CAB'
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setParts(mockParts);
            setLoading(false);
        }, 500);
    }, []);

    // Helper functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'in-stock':
                return 'Còn hàng';
            case 'low-stock':
                return 'Sắp hết';
            case 'out-of-stock':
                return 'Hết hàng';
            default:
                return status;
        }
    };

    // Filter parts
    const filteredParts = parts.filter(part => {
        const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            part.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || part.category === categoryFilter;
        const matchesStatus = !statusFilter || part.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    return (
        <div className="parts-inventory-container">
            <div className="parts-inventory-header">
                <h1>Quản lý Kho Phụ tùng</h1>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-input">
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên phụ tùng, mã SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="filter-dropdown"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">Tất cả danh mục</option>
                        <option value="Pin">Pin</option>
                        <option value="Động cơ">Động cơ</option>
                        <option value="Phanh">Phanh</option>
                        <option value="Bánh xe">Bánh xe</option>
                        <option value="Điện tử">Điện tử</option>
                        <option value="Làm mát">Làm mát</option>
                        <option value="Phụ kiện">Phụ kiện</option>
                    </select>
                    <select 
                        className="filter-dropdown"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="in-stock">Còn hàng</option>
                        <option value="low-stock">Sắp hết</option>
                        <option value="out-of-stock">Hết hàng</option>
                    </select>
                </div>
                <div className="toolbar-right">
                    <button className="add-part-btn">
                        <span style={{ fontSize: '18px' }}>&#10133;</span> Thêm phụ tùng
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="parts-table-wrapper">
                <table className="parts-table">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên phụ tùng</th>
                            <th>Mã phụ tùng (SKU)</th>
                            <th>Danh mục</th>
                            <th style={{ textAlign: 'center' }}>Số lượng tồn kho</th>
                            <th>Trạng thái kho</th>
                            <th>Giá nhập</th>
                            <th>Giá bán</th>
                            <th>Nhà cung cấp</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredParts.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                    {searchTerm || categoryFilter || statusFilter 
                                        ? '🔍 Không tìm thấy phụ tùng phù hợp'
                                        : '📦 Chưa có phụ tùng nào trong kho'}
                                </td>
                            </tr>
                        ) : (
                            filteredParts.map((part) => (
                                <tr key={part.id}>
                                    <td>
                                        <img src={part.image} alt={part.name} className="part-image" />
                                    </td>
                                    <td><strong>{part.name}</strong></td>
                                    <td><code>{part.sku}</code></td>
                                    <td>{part.category}</td>
                                    <td className="stock-quantity" style={{ 
                                        textAlign: 'center',
                                        color: part.quantity === 0 ? '#dc3545' : part.quantity < 10 ? '#ffc107' : '#28a745',
                                        fontWeight: 'bold'
                                    }}>
                                        {part.quantity}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${part.status}`}>
                                            {getStatusText(part.status)}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(part.costPrice)}</td>
                                    <td><strong>{formatCurrency(part.sellPrice)}</strong></td>
                                    <td>{part.supplier}</td>
                                    <td className="action-icons">
                                        <button title="Xem chi tiết" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <ViewIcon />
                                        </button>
                                        <button title="Chỉnh sửa" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <EditIcon />
                                        </button>
                                        <button title="Xóa" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PartsInventory;



 




