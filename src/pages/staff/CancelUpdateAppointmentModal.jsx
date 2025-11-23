// src/pages/staff/CancelUpdateAppointmentModal.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as staffService from '../../services/staffService';

export default function CancelUpdateAppointmentModal({
  show,
  onClose,
  onSuccess,
  appointment,
  mode // 'cancel' or 'update'
}) {
  const [loading, setLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [updateData, setUpdateData] = useState({
    customerNotes: '',
    priority: 'Normal',
  });

  useEffect(() => {
    if (show && appointment) {
      setCancellationReason('');
      setUpdateData({
        customerNotes: appointment.customerNotes || '',
        priority: appointment.priority || 'Normal',
      });
    }
  }, [show, appointment]);

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    setLoading(true);
    try {
      await staffService.cancelAppointment(appointment.appointmentId || appointment.id, cancellationReason);
      toast.success('Đã hủy lịch hẹn thành công');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await staffService.updateAppointment(
        appointment.appointmentId || appointment.id,
        updateData
      );
      toast.success('Đã cập nhật lịch hẹn thành công');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  if (!show || !appointment) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {mode === 'cancel' ? 'Hủy Lịch Hẹn' : 'Cập Nhật Lịch Hẹn'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <strong>Khách hàng:</strong> {appointment.customerName}
            </div>
            <div className="mb-3">
              <strong>Biển số:</strong> {appointment.licensePlate || appointment.vehicle?.licensePlate}
            </div>
            <div className="mb-3">
              <strong>Ngày:</strong> {new Date(appointment.slotDate || appointment.appointmentDate).toLocaleDateString('vi-VN')}
            </div>

            {mode === 'cancel' ? (
              <div className="mb-3">
                <label className="form-label">Lý do hủy *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Nhập lý do hủy lịch hẹn..."
                  required
                ></textarea>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">Độ ưu tiên</label>
                  <select
                    className="form-select"
                    value={updateData.priority}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="Low">Thấp</option>
                    <option value="Normal">Bình thường</option>
                    <option value="High">Cao</option>
                    <option value="Urgent">Khẩn cấp</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={updateData.customerNotes}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, customerNotes: e.target.value }))}
                    placeholder="Ghi chú từ khách hàng..."
                  ></textarea>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Đóng
            </button>
            <button
              type="button"
              className={`btn ${mode === 'cancel' ? 'btn-danger' : 'btn-primary'}`}
              onClick={mode === 'cancel' ? handleCancel : handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang xử lý...
                </>
              ) : (
                mode === 'cancel' ? 'Hủy lịch hẹn' : 'Cập nhật'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
