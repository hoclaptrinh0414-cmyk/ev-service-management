import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Nguyễn Văn A' },
  { id: 2, name: 'Trần Thị B' },
];

const MOCK_VEHICLES = {
  1: [
    { id: 101, plate: '51F-123.45' },
    { id: 102, plate: '51G-111.22' },
  ],
  2: [{ id: 201, plate: '29A-987.65' }],
};

const MOCK_SERVICES = [
  'Bảo dưỡng định kỳ',
  'Thay dầu động cơ',
  'Kiểm tra phanh',
];

const MOCK_TECHNICIANS = ['Nguyễn Quốc Huy', 'Phạm Minh Trí', 'Trần Nhật Anh'];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'canceled', label: 'Đã hủy' },
];

const AppointmentModal = ({ appointment, onClose, onSave }) => {
  const [formData, setFormData] = useState({});

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

  const selectedCustomerVehicles = useMemo(() => {
    if (!formData.customerId) return [];
    return MOCK_VEHICLES[formData.customerId] || [];
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
                {MOCK_CUSTOMERS.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
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
                {selectedCustomerVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate}
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
                {MOCK_SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
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
                {MOCK_TECHNICIANS.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
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
