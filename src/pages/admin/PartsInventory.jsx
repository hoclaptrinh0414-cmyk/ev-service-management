import React from 'react';
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
    // Mock data and helper functions have been removed.
    // In a real application, you would fetch data from an API using a hook like useEffect.
    
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
                        <input type="text" placeholder="Tìm kiếm theo tên phụ tùng, mã SKU..." />
                    </div>
                    <select className="filter-dropdown">
                        <option value="">Tất cả danh mục</option>
                        <option value="Pin">Pin</option>
                        <option value="Động cơ">Động cơ</option>
                        <option value="Phanh">Phanh</option>
                        <option value="Bánh xe">Bánh xe</option>
                    </select>
                    <select className="filter-dropdown">
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
                      
                        {/* Data will be mapped here from an API call */}
                        {/* Example of a single row structure: */}
                        <tr>
                          
                            <td>
                                <img src="https://via.placeholder.com/40x40.png?text=..." alt="part" className="part-image" />
                            </td>
                            
                            <td>Phụ tùng mẫu</td>
                            <td>SKU-SAMPLE</td>
                            <td>Danh mục mẫu</td>
                            <td className="stock-quantity">10</td>
                            <td>
                                <span className="status-badge status-in-stock">
                                    Còn hàng
                                </span>
                            </td>
                            <td>1.000.000đ</td>
                            <td>1.500.000đ</td>
                            <td>Nhà cung cấp mẫu</td>
                            <td className="action-icons">
                                <ViewIcon />
                                <EditIcon />
                                <DeleteIcon />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                Dữ liệu sẽ được tải ở đây...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PartsInventory;



 




