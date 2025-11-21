import React, { useState, useEffect } from 'react';
import { inventoryAPI, lookupAPI } from '../../services/apiService';

const StockTransactionModal = ({ isOpen, onClose, onSuccess, initialPart = null }) => {
    const [transactionType, setTransactionType] = useState('Import'); // Import, Export, Adjustment
    const [formData, setFormData] = useState({
        partId: '',
        serviceCenterId: '',
        quantity: 1,
        referenceNumber: '',
        notes: '',
        unitCost: 0
    });
    const [parts, setParts] = useState([]);
    const [serviceCenters, setServiceCenters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            if (initialPart) {
                setFormData(prev => ({
                    ...prev,
                    partId: initialPart.partId,
                    serviceCenterId: initialPart.serviceCenterId || ''
                }));
            }
        }
    }, [isOpen, initialPart]);

    const fetchInitialData = async () => {
        try {
            // Fetch parts for dropdown (simplified, ideally search)
            const partsResponse = await inventoryAPI.getInventory({ PageSize: 100 });
            if (partsResponse.success) {
                // Extract unique parts
                const uniqueParts = [];
                const map = new Map();
                for (const item of partsResponse.data.items) {
                    if (!map.has(item.partId)) {
                        map.set(item.partId, true);    // set any value to Map
                        uniqueParts.push({
                            id: item.partId,
                            name: item.partName,
                            code: item.partCode
                        });
                    }
                }
                setParts(uniqueParts);
            }

            // Fetch service centers
            const centersResponse = await lookupAPI.getActiveServiceCenters();
            if (centersResponse.success) {
                setServiceCenters(centersResponse.data || []);
            }
        } catch (err) {
            console.error("Error loading form data", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                partId: parseInt(formData.partId),
                serviceCenterId: parseInt(formData.serviceCenterId),
                transactionType: transactionType,
                quantity: parseInt(formData.quantity),
                referenceNumber: formData.referenceNumber,
                notes: formData.notes,
                unitCost: transactionType === 'Import' ? parseFloat(formData.unitCost) : undefined
            };

            await inventoryAPI.createTransaction(payload);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Transaction failed", err);
            setError(err.message || 'Giao dịch thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>Nhập/Xuất Kho</h3>
                    <button className="btn-close-modal" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="transaction-type-selector">
                        <button
                            className={`type-btn ${transactionType === 'Import' ? 'active import' : ''}`}
                            onClick={() => setTransactionType('Import')}
                        >
                            Nhập kho
                        </button>
                        <button
                            className={`type-btn ${transactionType === 'Export' ? 'active export' : ''}`}
                            onClick={() => setTransactionType('Export')}
                        >
                            Xuất kho
                        </button>
                        <button
                            className={`type-btn ${transactionType === 'Adjustment' ? 'active adjust' : ''}`}
                            onClick={() => setTransactionType('Adjustment')}
                        >
                            Điều chỉnh
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Phụ tùng</label>
                            <select
                                name="partId"
                                value={formData.partId}
                                onChange={handleChange}
                                required
                                className="form-control"
                                disabled={!!initialPart}
                            >
                                <option value="">-- Chọn phụ tùng --</option>
                                {parts.map(p => (
                                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Trung tâm dịch vụ</label>
                            <select
                                name="serviceCenterId"
                                value={formData.serviceCenterId}
                                onChange={handleChange}
                                required
                                className="form-control"
                                disabled={!!initialPart?.serviceCenterId}
                            >
                                <option value="">-- Chọn trung tâm --</option>
                                {serviceCenters.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Số lượng</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="form-control"
                                />
                            </div>

                            {transactionType === 'Import' && (
                                <div className="form-group half">
                                    <label>Đơn giá nhập (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="unitCost"
                                        value={formData.unitCost}
                                        onChange={handleChange}
                                        min="0"
                                        className="form-control"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Mã tham chiếu (PO/Invoice)</label>
                            <input
                                type="text"
                                name="referenceNumber"
                                value={formData.referenceNumber}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="VD: PO-2023-001"
                            />
                        </div>

                        <div className="form-group">
                            <label>Ghi chú</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="form-control"
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
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
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-container {
          background: white;
          border-radius: 8px;
          width: 500px;
          max-width: 95%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h3 { margin: 0; font-size: 18px; }
        .btn-close-modal {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }
        .modal-body { padding: 20px; }
        
        .transaction-type-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          background: #f5f5f5;
          padding: 5px;
          border-radius: 6px;
        }
        .type-btn {
          flex: 1;
          padding: 8px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .type-btn.active { background: white; shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .type-btn.active.import { color: #28a745; border-bottom: 2px solid #28a745; }
        .type-btn.active.export { color: #dc3545; border-bottom: 2px solid #dc3545; }
        .type-btn.active.adjust { color: #ffc107; border-bottom: 2px solid #ffc107; }

        .form-group { margin-bottom: 15px; }
        .form-row { display: flex; gap: 15px; }
        .form-group.half { flex: 1; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 14px; }
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-control:focus { outline: none; border-color: #007bff; }
        
        .modal-footer {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn-cancel {
          padding: 8px 16px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-submit {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .alert-danger {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 14px;
        }
      `}</style>
        </div>
    );
};

export default StockTransactionModal;
