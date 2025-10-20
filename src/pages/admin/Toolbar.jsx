import React from 'react';

const Toolbar = ({ view, onViewChange, onNewAppointment }) => {
  const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Canceled'];
  const technicians = ['Tech 1', 'Tech 2', 'Tech 3'];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Primary action */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewAppointment}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg flex items-center gap-2 whitespace-nowrap"
        >
          <i className="bi bi-plus-circle"></i>
          <span>Tạo lịch hẹn mới</span>
        </button>
      </div>

      {/* Right: Filters + View switcher */}
      <div className="flex items-center gap-3 flex-wrap">
        <i className="bi bi-filter text-gray-600"></i>
        <select className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md min-w-[200px]">
          <option value="">Tất cả Trạng thái</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md min-w-[200px]">
          <option value="">Tất cả Kỹ thuật viên</option>
          {technicians.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>

        {/* View Switcher */}
        <div className="flex items-center border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              view === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Xem lịch"
          >
            <i className="bi bi-calendar-month mr-2"></i>
            Lịch
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Xem danh sách"
          >
            <i className="bi bi-list-ul mr-2"></i>
            Danh sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;

