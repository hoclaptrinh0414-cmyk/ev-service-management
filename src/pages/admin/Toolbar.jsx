import React from 'react';

const Toolbar = ({ view, onViewChange, onNewAppointment }) => {
  const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Canceled'];
  const technicians = ['Tech 1', 'Tech 2', 'Tech 3'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-3xl mx-auto flex flex-col gap-3 items-stretch">
      {/* Primary action centered */}
      <div className="flex justify-center">
        <button
          onClick={onNewAppointment}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Tạo lịch hẹn mới
        </button>
      </div>

      {/* Filters - full width stacked */}
      <select className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
        <option value="">Tất cả Trạng thái</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <select className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
        <option value="">Tất cả Kỹ thuật viên</option>
        {technicians.map((tech) => (
          <option key={tech} value={tech}>
            {tech}
          </option>
        ))}
      </select>

      {/* View switcher aligned right */}
      <div className="flex items-center justify-end">
        <div className="flex items-center border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              view === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Xem lịch"
          >
            Lịch
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Xem danh sách"
          >
            Danh sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
