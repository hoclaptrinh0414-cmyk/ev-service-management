
import React from 'react';

const Toolbar = ({ view, onViewChange, onNewAppointment }) => {
  const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Canceled'];
  // This should be fetched from an API
  const technicians = ['Tech 1', 'Tech 2', 'Tech 3'];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onNewAppointment}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <i className="bi bi-plus-circle"></i>
          <span>Tạo lịch hẹn mới</span>
        </button>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
            <i className="bi bi-filter text-gray-600"></i>
            <select className="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none">
                <option value="">Tất cả Trạng thái</option>
                {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
            <select className="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none">
                <option value="">Tất cả Kỹ thuật viên</option>
                {technicians.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                ))}
            </select>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center border border-gray-300 rounded-lg p-1">
        <button 
            onClick={() => onViewChange('month')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${view === 'month' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <i className="bi bi-calendar-month-fill mr-2"></i>
            Lịch
        </button>
        <button 
            onClick={() => onViewChange('list')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${view === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <i className="bi bi-list-ul mr-2"></i>
            Danh sách
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
