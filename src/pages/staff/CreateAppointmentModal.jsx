// src/pages/staff/CreateAppointmentModal.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as staffService from '../../services/staffService';
import apiService from '../../services/api';

export default function CreateAppointmentModal({ show, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    serviceCenterId: '',
    slotId: '',
    serviceIds: [],
    packageId: null,
    customerNotes: '',
    preferredTechnicianId: null,
    priority: 'Normal',
    source: 'Walk-in', // Walk-in hoặc Phone
  });

  // Load data khi modal mở
  useEffect(() => {
    if (show) {
      loadServiceCenters();
      loadServices();
    }
  }, [show]);

  // Load service centers
  const loadServiceCenters = async () => {
    try {
      const response = await staffService.getActiveServiceCenters();
      const centers = response?.data || response?.items || response || [];
      setServiceCenters(Array.isArray(centers) ? centers : []);
    } catch (error) {
      console.error('Error loading service centers:', error);
      toast.error('Không thể tải danh sách trung tâm');
    }
  };

  // Load services
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

  // Search customer by phone
  const handleSearchCustomer = async (phone) => {
    if (!phone || phone.length < 9) return;

    try {
      const response = await apiService.request(`/customers/by-phone?phone=${phone}`);
      const customer = response?.data || response;

      if (customer) {
        setFormData(prev => ({ ...prev, customerId: customer.customerId || customer.id }));
        loadCustomerVehicles(customer.customerId || customer.id);
      }
    } catch (error) {
      console.error('Customer not found:', error);
      toast.info('Không tìm thấy khách hàng với số điện thoại này');
    }
  };

  // Load vehicles của customer
  const loadCustomerVehicles = async (customerId) => {
    try {
      const response = await apiService.request(`/vehicles/by-customer/${customerId}`);
      const vehicleList = response?.data?.items || response?.items || response?.data || [];
      setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  // Load time slots khi chọn service center
  const loadTimeSlots = async (serviceCenterId, date) => {
    if (!serviceCenterId || !date) return;

    try {
      const response = await apiService.request(`/time-slots/available?serviceCenterId=${serviceCenterId}&date=${date}`);
      const slots = response?.data?.items || response?.items || response?.data || [];
      setTimeSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast.error('Không thể tải danh sách thời gian');
    }
  };

  // Handle service selection
  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const serviceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds };
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.customerId) {
      toast.error('Vui lòng chọn khách hàng');
      return;
    }
    if (!formData.vehicleId) {
      toast.error('Vui lòng chọn xe');
      return;
    }
    if (!formData.serviceCenterId) {
      toast.error('Vui lòng chọn trung tâm');
      return;
    }
    if (!formData.slotId) {
      toast.error('Vui lòng chọn thời gian');
      return;
    }
    if (formData.serviceIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một dịch vụ');
      return;
    }

    setLoading(true);
    try {
      await staffService.createAppointment(formData);
      toast.success('Tạo lịch hẹn thành công!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customerId: '',
      vehicleId: '',
      serviceCenterId: '',
      slotId: '',
      serviceIds: [],
      packageId: null,
      customerNotes: '',
      preferredTechnicianId: null,
      priority: 'Normal',
      source: 'Walk-in',
    });
    setVehicles([]);
    setTimeSlots([]);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tạo Lịch Hẹn Mới</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Source Selection */}
              <div className="mb-3">
                <label className="form-label">Nguồn</label>
                <select
                  className="form-select"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                >
                  <option value="Walk-in">Walk-in (Khách đến trực tiếp)</option>
                  <option value="Phone">Phone (Gọi điện)</option>
                </select>
              </div>

              {/* Customer Search */}
              <div className="mb-3">
                <label className="form-label">Số điện thoại khách hàng *</label>
                <div className="input-group">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Nhập số điện thoại để tìm"
                    onBlur={(e) => handleSearchCustomer(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => toast.info('Chức năng tạo khách hàng mới đang phát triển')}
                  >
                    <i className="bi bi-plus-lg"></i> Tạo mới
                  </button>
                </div>
                {formData.customerId && (
                  <small className="text-success">
                    <i className="bi bi-check-circle-fill"></i> Đã tìm thấy khách hàng
                  </small>
                )}
              </div>

              {/* Vehicle Selection */}
              {vehicles.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">Chọn xe *</label>
                  <select
                    className="form-select"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                    required
                  >
                    <option value="">-- Chọn xe --</option>
                    {vehicles.map(v => (
                      <option key={v.vehicleId || v.id} value={v.vehicleId || v.id}>
                        {v.licensePlate} - {v.brandName} {v.modelName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Center */}
              <div className="mb-3">
                <label className="form-label">Trung tâm dịch vụ *</label>
                <select
                  className="form-select"
                  value={formData.serviceCenterId}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, serviceCenterId: e.target.value, slotId: '' }));
                    setTimeSlots([]);
                  }}
                  required
                >
                  <option value="">-- Chọn trung tâm --</option>
                  {serviceCenters.map(c => (
                    <option key={c.serviceCenterId || c.id} value={c.serviceCenterId || c.id}>
                      {c.centerName || c.name} - {c.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              {formData.serviceCenterId && (
                <div className="mb-3">
                  <label className="form-label">Chọn ngày *</label>
                  <input
                    type="date"
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => loadTimeSlots(formData.serviceCenterId, e.target.value)}
                  />
                </div>
              )}

              {/* Time Slot */}
              {timeSlots.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">Chọn giờ *</label>
                  <select
                    className="form-select"
                    value={formData.slotId}
                    onChange={(e) => setFormData(prev => ({ ...prev, slotId: e.target.value }))}
                    required
                  >
                    <option value="">-- Chọn giờ --</option>
                    {timeSlots.map(slot => (
                      <option key={slot.slotId || slot.id} value={slot.slotId || slot.id}>
                        {slot.startTime} - {slot.endTime} ({slot.availableSlots || 0} slot)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Services */}
              <div className="mb-3">
                <label className="form-label">Chọn dịch vụ * (chọn nhiều)</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '0.5rem' }}>
                  {services.map(service => (
                    <div key={service.serviceId || service.id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.serviceIds.includes(service.serviceId || service.id)}
                        onChange={() => handleServiceToggle(service.serviceId || service.id)}
                      />
                      <label className="form-check-label">
                        {service.serviceName} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.basePrice || 0)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="mb-3">
                <label className="form-label">Độ ưu tiên</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="Low">Thấp</option>
                  <option value="Normal">Bình thường</option>
                  <option value="High">Cao</option>
                  <option value="Urgent">Khẩn cấp</option>
                </select>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <label className="form-label">Ghi chú</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.customerNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerNotes: e.target.value }))}
                  placeholder="Ghi chú từ khách hàng..."
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg me-2"></i>
                    Tạo lịch hẹn
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
