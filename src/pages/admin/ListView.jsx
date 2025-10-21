import React, { useMemo, useState } from 'react';

const STATUS_DISPLAY = {
  pending: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-100 text-amber-700',
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'bg-sky-100 text-sky-700',
  },
  in_progress: {
    label: 'Đang thực hiện',
    className: 'bg-indigo-100 text-indigo-700',
  },
  completed: {
    label: 'Đã hoàn thành',
    className: 'bg-emerald-100 text-emerald-700',
  },
  canceled: {
    label: 'Đã hủy',
    className: 'bg-rose-100 text-rose-700',
  },
};

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (!sortConfig) return sortableItems;

    sortableItems.sort((a, b) => {
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const SortIcon = ({ direction }) => {
  if (!direction) return <i className="bi bi-arrow-down-up ml-2 text-xs" />;
  if (direction === 'ascending') {
    return <i className="bi bi-sort-up ml-2 text-xs" />;
  }
  return <i className="bi bi-sort-down ml-2 text-xs" />;
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch (error) {
    return '—';
  }
};

const ListView = ({ appointments, onSelectAppointment }) => {
  const tableData = appointments.map((appointment) => ({
    id: appointment.id,
    customerName: appointment.resource.customer,
    vehicle: appointment.resource.vehicle,
    service: appointment.resource.service,
    technician: appointment.resource.technician,
    appointmentTime: appointment.start,
    status: appointment.resource.status,
    original: appointment,
  }));

  const { items, requestSort, sortConfig } = useSortableData(tableData);

  const getDirection = (key) => (sortConfig?.key === key ? sortConfig.direction : null);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th
                onClick={() => requestSort('id')}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer"
              >
                Mã lịch hẹn <SortIcon direction={getDirection('id')} />
              </th>
              <th
                onClick={() => requestSort('customerName')}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer"
              >
                Khách hàng <SortIcon direction={getDirection('customerName')} />
              </th>
              <th
                onClick={() => requestSort('vehicle')}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer"
              >
                Biển số <SortIcon direction={getDirection('vehicle')} />
              </th>
              <th
                onClick={() => requestSort('service')}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer"
              >
                Dịch vụ <SortIcon direction={getDirection('service')} />
              </th>
              <th
                onClick={() => requestSort('technician')}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer"
              >
                Kỹ thuật viên <SortIcon direction={getDirection('technician')} />
              </th>
              <th
                onClick={() => requestSort('appointmentTime')}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer"
              >
                Thời gian <SortIcon direction={getDirection('appointmentTime')} />
              </th>
              <th
                onClick={() => requestSort('status')}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer"
              >
                Trạng thái <SortIcon direction={getDirection('status')} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {items.map((item) => {
              const statusMeta = STATUS_DISPLAY[item.status] || {
                label: item.status,
                className: 'bg-neutral-100 text-neutral-600',
              };

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectAppointment(item.original)}
                  className="transition hover:bg-neutral-50 cursor-pointer"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">
                    #{item.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-700">
                    {item.customerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                    {item.vehicle}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                    {item.service}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                    {item.technician || '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                    {formatDateTime(item.appointmentTime)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {statusMeta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-100 px-6 py-4 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
        <span>
          Hiển thị <strong>{items.length}</strong> lịch hẹn
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
            disabled
          >
            Trước
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
            disabled
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListView;
