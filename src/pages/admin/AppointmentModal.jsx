
import React, { useState, useEffect } from 'react';

// Mock data - replace with API calls
const mockCustomers = [{ id: 1, name: 'Nguyễn Văn A' }, { id: 2, name: 'Trần Thị B' }];
const mockVehicles = {
    1: [{ id: 101, plate: '51F-123.45' }, { id: 102, plate: '51G-111.22' }],
    2: [{ id: 201, plate: '29A-987.65' }]
};
const mockServices = ['Bảo dưỡng định kỳ', 'Sửa chữa phanh', 'Thay lốp'];
const mockTechnicians = ['Tech 1', 'Tech 2', 'Tech 3'];
const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Canceled'];

const AppointmentModal = ({ appointment, onClose, onSave }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (appointment) {
            setFormData({
                customerId: appointment.resource?.customer_id || '',
                vehicleId: appointment.resource?.vehicle_id || '',
                service: appointment.resource?.service || '',
                technician: appointment.resource?.technician || '',
                status: appointment.resource?.status || 'Pending',
                notes: appointment.resource?.notes || '',
                start: appointment.start ? new Date(appointment.start).toISOString().slice(0, 16) : '',
                end: appointment.end ? new Date(appointment.end).toISOString().slice(0, 16) : '',
            });
        }
    }, [appointment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const isNew = !appointment?.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">
                        {isNew ? 'Tạo Lịch hẹn mới' : 'Chi tiết Lịch hẹn'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer and Vehicle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                            <select id="customer" name="customerId" value={formData.customerId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Chọn khách hàng</option>
                                {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">Xe</label>
                            <select id="vehicle" name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" disabled={!formData.customerId}>
                                <option value="">Chọn xe</option>
                                {formData.customerId && mockVehicles[formData.customerId]?.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Service and Technician */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ</label>
                            <select id="service" name="service" value={formData.service} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Chọn dịch vụ</option>
                                {mockServices.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="technician" className="block text-sm font-medium text-gray-700 mb-1">Kỹ thuật viên</label>
                            <select id="technician" name="technician" value={formData.technician} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Gán kỹ thuật viên</option>
                                {mockTechnicians.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                            <input type="datetime-local" id="start" name="start" value={formData.start} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                            <input type="datetime-local" id="end" name="end" value={formData.end} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú của khách</label>
                        <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">
                            Hủy
                        </button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                            {isNew ? 'Tạo mới' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;
