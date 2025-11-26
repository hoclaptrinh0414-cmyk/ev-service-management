// src/pages/staff/AddServicesModal.jsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const normalizeServiceId = (id) => {
  if (id === undefined || id === null) return null;
  return id.toString();
};

const resolveServiceName = (service) =>
  service?.serviceName ||
  service?.name ||
  service?.maintenanceServiceName ||
  service?.service?.serviceName ||
  service?.service?.name ||
  `Dịch vụ #${service?.serviceId || service?.id || ''}`;

const extractErrorMessage = (error) => {
  if (!error) return '';
  const data = error.response?.data ?? error.data;

  if (typeof data === 'string') return data;
  if (data?.message && typeof data.message === 'string') return data.message;
  if (data?.title && typeof data.title === 'string') return data.title;
  if (data?.error && typeof data.error === 'string') return data.error;

  const errorsBag = data?.errors;
  if (errorsBag && typeof errorsBag === 'object') {
    const first = Object.values(errorsBag)[0];
    if (Array.isArray(first) && first.length > 0) return first[0];
    if (typeof first === 'string') return first;
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return '';
};

export default function AddServicesModal({ show, onClose, onSuccess, appointment }) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [existingServicesMap, setExistingServicesMap] = useState({});

  const loadServices = useCallback(async () => {
    try {
      const response = await apiService.request('/maintenance-services?Status=Active&PageSize=100');
      const serviceList = response?.data?.items || response?.items || response?.data || [];
      setServices(Array.isArray(serviceList) ? serviceList : []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Không thể tải danh sách dịch vụ');
    }
  }, []);

  const loadExistingServices = useCallback(async () => {
    if (!appointment) return;
    const workOrderId = appointment.workOrderId || appointment.id;
    if (!workOrderId) return;

    try {
      const response = await apiService.request(`/work-orders/${workOrderId}`);
      const workOrder = response?.data || response;
      const serviceItems =
        workOrder?.services ||
        workOrder?.workOrderServices ||
        workOrder?.workOrderServiceDetails ||
        workOrder?.serviceItems ||
        workOrder?.additionalServices ||
        workOrder?.maintenanceServices ||
        [];

      const map = {};
      serviceItems.forEach((item) => {
        const id =
          item?.serviceId ||
          item?.maintenanceServiceId ||
          item?.service?.serviceId ||
          item?.service?.id ||
          item?.id;
        const key = normalizeServiceId(id);
        if (!key) return;

        map[key] = {
          id,
          name: resolveServiceName(item),
        };
      });

      setExistingServicesMap(map);
    } catch (error) {
      console.error('Error loading existing services:', error);
      setExistingServicesMap({});
    }
  }, [appointment]);

  useEffect(() => {
    if (show) {
      loadServices();
      loadExistingServices();
    } else {
      setSelectedServiceIds([]);
      setSearchTerm('');
    }
  }, [show, loadServices, loadExistingServices]);

  const isServiceAlreadyAdded = (serviceId) =>
    Boolean(existingServicesMap[normalizeServiceId(serviceId)]);

  const getExistingServiceName = (serviceId) =>
    existingServicesMap[normalizeServiceId(serviceId)]?.name;

  const handleToggleService = (serviceId) => {
    if (isServiceAlreadyAdded(serviceId)) {
      toast.info(
        `Dịch vụ "${getExistingServiceName(serviceId) || serviceId}" đã có trong Work Order`,
      );
      return;
    }

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
      const workOrderId = appointment.workOrderId || appointment.id;

      // Gọi API backend thông qua apiService để tự động thêm baseURL + header auth
      await Promise.all(
        selectedServiceIds.map((serviceId) =>
          apiService.request(`/work-orders/${workOrderId}/services/${serviceId}`, {
            method: 'POST',
          })
        )
      );

      toast.success(`Đã thêm ${selectedServiceIds.length} dịch vụ thành công!`);
      setSelectedServiceIds([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding services:', error);
      const friendlyMessage = extractErrorMessage(error) || 'Không thể thêm dịch vụ';
      toast.error(friendlyMessage);
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

            {selectedServiceIds.length > 0 && (
              <div className="mb-3 alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Đã chọn <strong>{selectedServiceIds.length}</strong> dịch vụ
              </div>
            )}

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
                filteredServices.map(service => {
                  const isSelected = selectedServiceIds.includes(service.serviceId || service.id);
                  const isAdded = isServiceAlreadyAdded(service.serviceId || service.id);
                  return (
                  <div
                    key={service.serviceId || service.id}
                    className="mb-2 p-3"
                    style={{
                      border: isSelected ? '2px solid #198754' : '1px solid #e9ecef',
                      borderRadius: '0.5rem',
                      position: 'relative',
                      backgroundColor: isSelected ? '#d1e7dd' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleService(service.serviceId || service.id)}
                        id={`service-${service.serviceId || service.id}`}
                        disabled={isAdded}
                        style={{ width: '20px', height: '20px', flexShrink: 0, cursor: isAdded ? 'not-allowed' : 'pointer', accentColor: '#198754' }}
                      />
                      <label htmlFor={`service-${service.serviceId || service.id}`} style={{ flex: 1, cursor: 'pointer', margin: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '15px', display: 'block' }}>
                                {service.serviceName || service.name}
                              </strong>
                              {isServiceAlreadyAdded(service.serviceId || service.id) && (
                                <span className="badge bg-success" style={{ fontSize: '11px' }}>
                                  Đã thêm
                                </span>
                              )}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '13px', marginTop: '4px' }}>
                              {service.description || ''}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', minWidth: '150px' }}>
                            <strong style={{ color: '#0d6efd', fontSize: '16px', display: 'block' }}>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.basePrice || 0)}
                            </strong>
                            <small style={{ color: '#6c757d', display: 'block', marginTop: '4px' }}>{service.estimatedDurationMinutes || 0} phút</small>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
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
