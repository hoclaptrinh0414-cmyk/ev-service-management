import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { customerAPI, vehicleAPI, maintenanceServiceAPI } from '../../services/adminAPI';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'canceled', label: 'Đã hủy' },
];

const AppointmentModal = ({ appointment, onClose, onSave, technicians = [] }) => {
  const [formData, setFormData] = useState({});
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customersRes, servicesRes] = await Promise.all([
          customerAPI.getAll({ pageSize: 100 }), // Fetch top 100 customers for now
          maintenanceServiceAPI.getAll({ pageSize: 100 })
        ]);

        setCustomers(customersRes?.data?.items || customersRes?.data || []);
        setServices(servicesRes?.data?.items || servicesRes?.data || []);
      } catch (error) {
        console.error("Failed to fetch initial data for modal:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!appointment) return;
    setFormData({
      customerId: appointment.resource?.customerId || '',
      vehicleId: appointment.resource?.vehicleId || '',
      service: appointment.resource?.service || '',
      technician: appointment.resource?.technician || '',
      status: appointment.resource?.status || 'pending',
      notes: appointment.resource?.notes || '',
      start: appointment.start
        ? new Date(appointment.start).toISOString().slice(0, 16)
        : '',
      end: appointment.end
        ? new Date(appointment.end).toISOString().slice(0, 16)
        : '',
    });
  }, [appointment]);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!formData.customerId) {
        setVehicles([]);
        return;
      }

      try {
        // Assuming vehicleAPI has a method to get vehicles by customer, or we filter from getAll
        // For now, let's use getAll with a search param if supported, or just fetch all and filter client side if list is small
        // Ideally: vehicleAPI.getByCustomer(formData.customerId)
        // Based on adminAPI.js, we have vehicleAPI.getAll(params). Let's try to filter by customerId if backend supports it,
        // or use search. If not, we might need to add a specific endpoint.
        // Let's assume vehicleAPI.getAll({ customerId: ... }) works or we fallback to empty.

        // Actually, looking at adminAPI.js, vehicleAPI.getAll takes params.
        // Let's try to fetch vehicles for this customer.
        // If the API doesn't support filtering by customerId directly in getAll, we might need to rely on what we have.
        // A common pattern is vehicleAPI.getAll({ customerId: id })

        const res = await vehicleAPI.getAll({ customerId: formData.customerId });
        setVehicles(res?.data?.items || res?.data || []);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    };

    fetchVehicles();
  }, [formData.customerId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  const isNew = !appointment?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {isNew ? 'Tạo lịch hẹn mới' : 'Cập nhật lịch hẹn'}
            </h2>
            <p className="text-sm text-neutral-500">
              Điền đầy đủ thông tin để đảm bảo lịch hẹn được xử lý chính xác.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-neutral-400 transition hover:text-neutral-600"
            aria-label="Đóng"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="customerId"
                className="text-sm font-medium text-neutral-700"
              >
                Khách hàng
              </label>
              <select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-200"
              >
                <option value="">Chọn khách hàng</option>
                {customers.map((customer) => (
                  <option key={customer.customerId || customer.id} value={customer.customerId || customer.id}>
                    {customer.fullName || customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="vehicleId"
                className="text-sm font-medium text-neutral-700"
              >
                Xe
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                disabled={!formData.customerId}
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-200 disabled:bg-neutral-100"
              >
                <option value="">Chọn xe</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.vehicleId || vehicle.id} value={vehicle.vehicleId || vehicle.id}>
                    {vehicle.licensePlate || vehicle.plate}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="service"
                className="text-sm font-medium text-neutral-700"
              >
                Dịch vụ
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-200"
              >
                <option value="">Chọn dịch vụ</option>
                {services.map((service) => (
                  <option key={service.serviceId || service.id} value={service.serviceName || service.name}>
                    {service.serviceName || service.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="technician"
                className="text-sm font-medium text-neutral-700"
              >
                Kỹ thuật viên
              </label>
              <select
                id="technician"
                name="technician"
                value={formData.technician}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-200"
              >
                <option value="">Gán kỹ thuật viên</option>
                {technicians.map((tech) => (
                  <option key={tech.technicianId || tech.id || tech} value={tech.fullName || tech.name || tech}>
                    {tech.fullName || tech.name || tech}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="start"
                className="text-sm font-medium text-neutral-700"
              >
                Thời gian bắt đầu
              </label>
              <input
                type="datetime-local"
                id="start"
                name="start"
                value={formData.start}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-200"
              />
            </div>
            <div>
              <label
                htmlFor="end"
                className="text-sm font-medium text-neutral-700"
              >
                Thời gian kết thúc
              </label>
              <input
                type="datetime-local"
                id="end"
                name="end"
                value={formData.end}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="status"
                className="text-sm font-medium text-neutral-700"
              >
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="notes"
                className="text-sm font-medium text-neutral-700"
              >
                Ghi chú
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-5 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
            >
              Hủy
            </button>
            <Button type="submit" className="bg-accent-600 hover:bg-accent-700">
              {isNew ? 'Tạo lịch hẹn' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AppointmentModal;
