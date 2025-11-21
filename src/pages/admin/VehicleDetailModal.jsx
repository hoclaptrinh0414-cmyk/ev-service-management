import React, { useState, useEffect } from 'react';

const VehicleDetailModal = ({ vehicle, isOpen, onClose, onSave, mode = 'view' }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...vehicle,
                purchaseDate: vehicle.purchaseDate ? vehicle.purchaseDate.split('T')[0] : '',
                insuranceExpiry: vehicle.insuranceExpiry ? vehicle.insuranceExpiry.split('T')[0] : '',
                registrationExpiry: vehicle.registrationExpiry ? vehicle.registrationExpiry.split('T')[0] : '',
            });
        } else {
            setFormData({});
        }
    }, [vehicle]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving vehicle:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isView = mode === 'view';

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{isView ? 'Chi tiết xe' : 'Cập nhật thông tin xe'}</h3>
                    <button className="btn-close-modal" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {/* Basic Info */}
                            <div className="form-group">
                                <label>Khách hàng</label>
                                <input
                                    type="text"
                                    value={formData.customerName || ''}
                                    disabled
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mẫu xe</label>
                                <input
                                    type="text"
                                    value={formData.fullModelName || ''}
                                    disabled
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Biển số</label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>VIN</label>
                                <input
                                    type="text"
                                    name="vin"
                                    value={formData.vin || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Màu sắc</label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ngày mua</label>
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    value={formData.purchaseDate || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Số Km (Mileage)</label>
                                <input
                                    type="number"
                                    name="mileage"
                                    value={formData.mileage || 0}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Sức khỏe pin (%)</label>
                                <input
                                    type="number"
                                    name="batteryHealthPercent"
                                    value={formData.batteryHealthPercent || 100}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            {/* Insurance & Registration */}
                            <div className="form-group">
                                <label>Số bảo hiểm</label>
                                <input
                                    type="text"
                                    name="insuranceNumber"
                                    value={formData.insuranceNumber || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Hết hạn bảo hiểm</label>
                                <input
                                    type="date"
                                    name="insuranceExpiry"
                                    value={formData.insuranceExpiry || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Hết hạn đăng kiểm</label>
                                <input
                                    type="date"
                                    name="registrationExpiry"
                                    value={formData.registrationExpiry || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Trạng thái bảo dưỡng</label>
                                <input
                                    type="text"
                                    value={formData.maintenanceStatus || ''}
                                    disabled
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Ghi chú</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    className="form-control"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive || false}
                                        onChange={handleChange}
                                        disabled={isView}
                                    />
                                    Đang hoạt động
                                </label>
                            </div>
                        </div>

                        {!isView && (
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .btn-close-modal {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        .form-group.checkbox-group {
           flex-direction: row;
           align-items: center;
        }
        
        .form-group.checkbox-group input {
           margin-right: 10px;
           width: auto;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #444;
        }

        .form-control {
          padding: 0.6rem 1rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .form-control:disabled {
          background: #f8f9fa;
          color: #6c757d;
        }

        .modal-footer {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .btn-cancel {
          padding: 0.6rem 1.2rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-save {
          padding: 0.6rem 1.2rem;
          border: none;
          background: #007bff;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-save:hover {
          background: #0056b3;
        }
        
        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};

export default VehicleDetailModal;
