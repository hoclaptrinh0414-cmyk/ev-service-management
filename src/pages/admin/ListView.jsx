
import React, { useState, useMemo } from 'react';

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const ListView = ({ appointments, onSelectAppointment }) => {
    // Transform data for the table
    const tableData = appointments.map(apt => ({
        id: apt.id,
        customerName: apt.resource.customer,
        vehicle: apt.resource.vehicle,
        service: apt.resource.service,
        technician: apt.resource.technician,
        appointmentTime: apt.start,
        status: apt.resource.status,
        original: apt // Keep original object for selection
    }));

  const { items, requestSort, sortConfig } = useSortableData(tableData);

  const getSortDirectionIcon = (name) => {
    if (!sortConfig) {
      return <i className="bi bi-arrow-down-up ml-2"></i>;
    }
    if (sortConfig.key === name) {
      if (sortConfig.direction === 'ascending') {
        return <i className="bi bi-sort-up ml-2"></i>;
      }
      return <i className="bi bi-sort-down ml-2"></i>;
    }
    return <i className="bi bi-arrow-down-up ml-2"></i>;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th onClick={() => requestSort('id')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                        ID {getSortDirectionIcon('id')}
                    </th>
                    <th onClick={() => requestSort('customerName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                        Tên Khách hàng {getSortDirectionIcon('customerName')}
                    </th>
                    <th onClick={() => requestSort('vehicle')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                        Xe (Biển số) {getSortDirectionIcon('vehicle')}
                    </th>
                    <th onClick={() => requestSort('service')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                        Dịch vụ {getSortDirectionIcon('service')}
                    </th>
                    <th onClick={() => requestSort('technician')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                        Kỹ thuật viên {getSortDirectionIcon('technician')}
                    </th>
                    <th onClick={() => requestSort('appointmentTime')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                        Thời gian hẹn {getSortDirectionIcon('appointmentTime')}
                    </th>
                    <th onClick={() => requestSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                        Trạng thái {getSortDirectionIcon('status')}
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                    <tr key={item.id} onClick={() => onSelectAppointment(item.original)} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.vehicle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.service}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.technician}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.appointmentTime).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        {/* Pagination will go here */}
        <div className="py-3 flex items-center justify-between">
            <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{items.length}</span> of <span className="font-medium">{items.length}</span> results
            </p>
            <div className="flex-1 flex justify-end">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Next
                </button>
            </div>
        </div>
    </div>
  );
};

export default ListView;
