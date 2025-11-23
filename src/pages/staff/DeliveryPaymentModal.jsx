// src/pages/staff/DeliveryPaymentModal.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as staffService from '../../services/staffService';

export default function DeliveryPaymentModal({ show, onClose, onSuccess, workOrder, mode }) {
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [paymentData, setPaymentData] = useState({
    appointmentId: null,
    paymentIntentId: null,
    amount: 0,
    status: 'Completed',
    paymentMethod: 'Banking', // Banking or VNPay
    gatewayTransactionId: '',
    notes: '',
  });

  useEffect(() => {
    if (show && workOrder && mode === 'validate') {
      validateDelivery();
    }
    if (show && workOrder && mode === 'payment') {
      setPaymentData(prev => ({
        ...prev,
        appointmentId: workOrder.appointmentId,
        paymentIntentId: workOrder.paymentIntentId || null,
        amount: workOrder.totalAmount || 0,
      }));
    }
  }, [show, workOrder, mode]);

  const validateDelivery = async () => {
    setLoading(true);
    try {
      const response = await staffService.validateDelivery(workOrder.workOrderId || workOrder.id);
      setValidationResult(response?.data || response);
    } catch (error) {
      console.error('Error validating delivery:', error);
      toast.error('Không thể kiểm tra điều kiện bàn giao xe');
      setValidationResult({ canDeliver: false, reason: 'Lỗi hệ thống' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentData.gatewayTransactionId.trim()) {
      toast.error('Vui lòng nhập mã giao dịch');
      return;
    }

    setLoading(true);
    try {
      await staffService.recordPaymentResult(paymentData.appointmentId, paymentData);
      toast.success('Đã ghi nhận thanh toán thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error(error.response?.data?.message || 'Không thể ghi nhận thanh toán');
    } finally {
      setLoading(false);
    }
  };

  if (!show || !workOrder) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {mode === 'validate' ? (
                <>
                  <i className="bi bi-shield-check me-2"></i>
                  Kiểm Tra Bàn Giao Xe
                </>
              ) : (
                <>
                  <i className="bi bi-credit-card me-2"></i>
                  Ghi Nhận Thanh Toán
                </>
              )}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <strong>Work Order:</strong> #{workOrder.workOrderId || workOrder.id}
            </div>
            <div className="mb-3">
              <strong>Khách hàng:</strong> {workOrder.customerName}
            </div>
            <div className="mb-3">
              <strong>Biển số:</strong> {workOrder.licensePlate || workOrder.vehicle?.licensePlate}
            </div>

            <hr />

            {mode === 'validate' ? (
              // VALIDATE DELIVERY MODE
              loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-2">Đang kiểm tra...</p>
                </div>
              ) : validationResult ? (
                <>
                  {validationResult.canDeliver ? (
                    <div className="alert alert-success">
                      <h5>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Có thể bàn giao xe
                      </h5>
                      <p className="mb-0">{validationResult.message || 'Tất cả điều kiện đã đáp ứng'}</p>
                    </div>
                  ) : (
                    <div className="alert alert-danger">
                      <h5>
                        <i className="bi bi-x-circle-fill me-2"></i>
                        Chưa thể bàn giao xe
                      </h5>
                      <p className="mb-0">
                        <strong>Lý do:</strong> {validationResult.reason || validationResult.message || 'Chưa đáp ứng điều kiện'}
                      </p>
                      {validationResult.outstandingAmount > 0 && (
                        <p className="mt-2 mb-0">
                          <strong>Số tiền chưa thanh toán:</strong>{' '}
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(validationResult.outstandingAmount)}
                        </p>
                      )}
                    </div>
                  )}

                  {validationResult.details && (
                    <div className="mt-3">
                      <strong>Chi tiết:</strong>
                      <ul className="mt-2">
                        {Object.entries(validationResult.details).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : null
            ) : (
              // PAYMENT RECORD MODE
              <>
                <div className="mb-3">
                  <label className="form-label">Phương thức thanh toán *</label>
                  <select
                    className="form-select"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    <option value="Banking">Chuyển khoản ngân hàng</option>
                    <option value="VNPay">Quét mã VNPay</option>
                    <option value="Cash">Tiền mặt</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Số tiền *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    required
                  />
                  <small className="text-muted">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentData.amount)}
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Mã giao dịch *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: FT2400112233"
                    value={paymentData.gatewayTransactionId}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, gatewayTransactionId: e.target.value }))}
                    required
                  />
                  <small className="text-muted">
                    Nhập mã giao dịch từ ngân hàng hoặc VNPay
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="form-select"
                    value={paymentData.status}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Completed">Thành công</option>
                    <option value="Pending">Đang chờ</option>
                    <option value="Failed">Thất bại</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ghi chú về giao dịch (tùy chọn)"
                  ></textarea>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Đóng
            </button>
            {mode === 'payment' && (
              <button type="button" className="btn btn-primary" onClick={handleRecordPayment} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Xác nhận thanh toán
                  </>
                )}
              </button>
            )}
            {mode === 'validate' && validationResult?.canDeliver && (
              <button type="button" className="btn btn-success" onClick={() => { toast.success('Đã bàn giao xe!'); onSuccess(); onClose(); }}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Bàn giao xe
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
