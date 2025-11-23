// src/pages/staff/AddServicesModal.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as staffService from '../../services/staffService';
import apiService from '../../services/api';

export default function AddServicesModal({ show, onClose, onSuccess, appointment }) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (show) {
      loadServices();
    }
  }, [show]);

  const loadServices = async () => {
    try {
      const response = await apiService.request('/maintenance-services?Status=Active&PageSize=100');
      const serviceList = response?.data?.items || response?.items || response?.data || [];
      setServices(Array.isArray(serviceList) ? serviceList : []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Không thể tải danh sách dịch vụ');
    }
  };

  const handleToggleService = (serviceId) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async () => {
    if (selectedServiceIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một dịch vụ');
      return;
    }

    setLoading(true);
    try {
      await staffService.addServicesToAppointment(
        appointment.appointmentId || appointment.id,
        selectedServiceIds
      );
      toast.success('Đã thêm dịch vụ thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding services:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s =>
    (s.serviceName || s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show || !appointment) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>
              Thêm Dịch Vụ Phát Sinh
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

            <hr />

            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Services List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '1rem' }}>
              {filteredServices.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Không tìm thấy dịch vụ
                </div>
              ) : (
                filteredServices.map(service => (
                  <div key={service.serviceId || service.id} className="form-check mb-2 p-2" style={{ border: '1px solid #e9ecef', borderRadius: '0.25rem' }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.serviceId || service.id)}
                      onChange={() => handleToggleService(service.serviceId || service.id)}
                      id={`service-${service.serviceId || service.id}`}
                    />
                    <label className="form-check-label w-100" htmlFor={`service-${service.serviceId || service.id}`}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{service.serviceName || service.name}</strong>
                          <div>
                            <small className="text-muted">{service.description || ''}</small>
                          </div>
                        </div>
                        <div className="text-end">
                          <strong className="text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.basePrice || 0)}
                          </strong>
                          <div>
                            <small className="text-muted">{service.estimatedDurationMinutes || 0} phút</small>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>

            {selectedServiceIds.length > 0 && (
              <div className="mt-3 alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Đã chọn <strong>{selectedServiceIds.length}</strong> dịch vụ
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang thêm...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-lg me-2"></i>
                  Thêm dịch vụ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
