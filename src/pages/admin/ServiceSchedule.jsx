import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import './ServiceSchedule.css';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import ListView from './ListView';
import AppointmentModal from './AppointmentModal';

const localizer = momentLocalizer(moment);

const STATUS_META = {
  pending: { label: 'Chờ xác nhận', accent: 'bg-amber-400' },
  confirmed: { label: 'Đã xác nhận', accent: 'bg-sky-500' },
  in_progress: { label: 'Đang thực hiện', accent: 'bg-indigo-500' },
  completed: { label: 'Đã hoàn thành', accent: 'bg-emerald-500' },
  canceled: { label: 'Đã hủy', accent: 'bg-rose-500' },
};

const SAMPLE_APPOINTMENTS = [
  {
    id: 1,
    title: 'Nguyễn Văn A • Bảo dưỡng định kỳ',
    start: new Date(2025, 9, 24, 9, 0),
    end: new Date(2025, 9, 24, 10, 30),
    resource: {
      status: 'confirmed',
      technician: 'Nguyễn Quốc Huy',
      customer: 'Nguyễn Văn A',
      customerId: 1,
      vehicleId: 101,
      vehicle: '51F-123.45',
      service: 'Bảo dưỡng định kỳ',
      notes: 'Kiểm tra bổ sung hệ thống phanh trước khi giao xe.',
    },
  },
  {
    id: 2,
    title: 'Trần Thị B • Thay dầu động cơ',
    start: new Date(2025, 9, 25, 13, 30),
    end: new Date(2025, 9, 25, 15, 0),
    resource: {
      status: 'pending',
      technician: 'Phạm Minh Trí',
      customer: 'Trần Thị B',
      customerId: 2,
      vehicleId: 201,
      vehicle: '29A-987.65',
      service: 'Thay dầu động cơ',
      notes: 'Khách muốn lấy xe cuối ngày.',
    },
  },
  {
    id: 3,
    title: 'Lê Minh C • Kiểm tra phanh',
    start: new Date(2025, 9, 26, 8, 0),
    end: new Date(2025, 9, 26, 9, 0),
    resource: {
      status: 'in_progress',
      technician: 'Trần Nhật Anh',
      customer: 'Lê Minh C',
      customerId: 1,
      vehicleId: 102,
      vehicle: '51G-111.22',
      service: 'Kiểm tra phanh',
      notes: '',
    },
  },
  {
    id: 4,
    title: 'Phạm Gia D • Sửa chữa thân vỏ',
    start: new Date(2025, 9, 27, 15, 0),
    end: new Date(2025, 9, 27, 16, 30),
    resource: {
      status: 'completed',
      technician: 'Nguyễn Quốc Huy',
      customer: 'Phạm Gia D',
      customerId: 2,
      vehicleId: 201,
      vehicle: '29A-987.65',
      service: 'Sửa chữa thân vỏ',
      notes: 'Hoàn tất, đã vệ sinh nội thất.',
    },
  },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: STATUS_META.pending.label },
  { value: 'confirmed', label: STATUS_META.confirmed.label },
  { value: 'in_progress', label: STATUS_META.in_progress.label },
  { value: 'completed', label: STATUS_META.completed.label },
  { value: 'canceled', label: STATUS_META.canceled.label },
];

const CALENDAR_MESSAGES = {
  next: 'Sau',
  previous: 'Trước',
  today: 'Hôm nay',
  month: 'Tháng',
  week: 'Tuần',
  day: 'Ngày',
  agenda: 'Danh sách',
  date: 'Ngày',
  time: 'Thời gian',
  event: 'Lịch hẹn',
};

const VIEW_OPTIONS = [
  { value: 'month', label: 'Tháng' },
  { value: 'week', label: 'Tuần' },
  { value: 'day', label: 'Ngày' },
  { value: 'list', label: 'Danh sách' },
];

const ServiceSchedule = () => {
  const [viewMode, setViewMode] = useState('calendar');
  const [calendarView, setCalendarView] = useState('month');
  const [activeDate, setActiveDate] = useState(new Date());

  const [statusFilter, setStatusFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');

  const [appointments, setAppointments] = useState(SAMPLE_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const technicians = useMemo(() => {
    const unique = new Set(
      appointments.map((apt) => apt.resource.technician).filter(Boolean)
    );
    return ['all', ...unique];
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchStatus =
        statusFilter === 'all' || appointment.resource.status === statusFilter;
      const matchTechnician =
        technicianFilter === 'all' ||
        appointment.resource.technician === technicianFilter;
      return matchStatus && matchTechnician;
    });
  }, [appointments, statusFilter, technicianFilter]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const summaryByStatus = appointments.reduce(
      (acc, appointment) => {
        const status = appointment.resource.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { pending: 0, confirmed: 0, in_progress: 0, completed: 0, canceled: 0 }
    );

    const today = appointments.filter((apt) =>
      moment(apt.start).isSame(moment(), 'day')
    ).length;

    return [
      {
        label: 'Tổng lịch hẹn',
        value: total,
        helper: 'Trong tháng hiện tại',
        accent: 'bg-indigo-50 text-indigo-700',
      },
      {
        label: STATUS_META.pending.label,
        value: summaryByStatus.pending,
        helper: 'Ưu tiên xác nhận sớm',
        accent: 'bg-amber-50 text-amber-700',
      },
      {
        label: STATUS_META.confirmed.label,
        value: summaryByStatus.confirmed,
        helper: 'Đã sẵn sàng thực hiện',
        accent: 'bg-sky-50 text-sky-700',
      },
      {
        label: STATUS_META.in_progress.label,
        value: summaryByStatus.in_progress,
        helper: 'Đang được xử lý',
        accent: 'bg-indigo-50 text-indigo-700',
      },
      {
        label: 'Diễn ra hôm nay',
        value: today,
        helper: 'Theo dõi tiến độ trong ngày',
        accent: 'bg-emerald-50 text-emerald-700',
      },
      {
        label: STATUS_META.completed.label,
        value: summaryByStatus.completed,
        helper: 'Đã hoàn tất trong tháng',
        accent: 'bg-emerald-50 text-emerald-700',
      },
      {
        label: STATUS_META.canceled.label,
        value: summaryByStatus.canceled,
        helper: 'Cần kiểm tra nguyên nhân',
        accent: 'bg-rose-50 text-rose-700',
      },
    ];
  }, [appointments]);

  const eventPropGetter = useMemo(() => {
    return (event) => {
      const status = event.resource?.status;
      const accent = STATUS_META[status]?.accent || 'bg-neutral-400';
      return {
        className: `${accent} text-white border-none`,
      };
    };
  }, []);

  const handleNewAppointment = () => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setSelectedAppointment({
      start,
      end,
      resource: {},
    });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event);
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedAppointment({
      start,
      end,
      resource: {},
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleSaveAppointment = (formData) => {
    if (selectedAppointment?.id) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                title: `${formData.customer || apt.resource.customer} • ${formData.service}`,
                start: new Date(formData.start || apt.start),
                end: new Date(formData.end || apt.end),
                resource: {
                  ...apt.resource,
                  ...formData,
                  customer: formData.customer || apt.resource.customer,
                  vehicle: formData.vehicle || apt.resource.vehicle,
                },
              }
            : apt
        )
      );
    } else {
      const newId = Math.max(...appointments.map((apt) => apt.id)) + 1;
      const newAppointment = {
        id: newId,
        title: `${formData.customer || 'Khách hàng'} • ${formData.service}`,
        start: new Date(formData.start),
        end: new Date(formData.end),
        resource: {
          status: formData.status || 'pending',
          technician: formData.technician,
          customer: formData.customer || 'Khách hàng',
          customerId: formData.customerId,
          vehicleId: formData.vehicleId,
          vehicle: formData.vehicle || '',
          service: formData.service,
          notes: formData.notes,
        },
      };
      setAppointments((prev) => [...prev, newAppointment]);
    }

    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="rounded-3xl border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 text-left lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
                Trung tâm dịch vụ
              </p>
              <h1 className="text-3xl font-semibold text-neutral-900">Quản lý lịch hẹn</h1>
              <p className="max-w-2xl text-sm text-neutral-500">
                Theo dõi lịch bảo dưỡng, phân bổ kỹ thuật viên và tối ưu năng suất xưởng bằng cách sử dụng lịch và danh sách tổng quan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleNewAppointment}
                className="rounded-full bg-accent-600 px-5 hover:bg-accent-700"
              >
                <i className="bi bi-calendar-plus mr-2" />
                Tạo lịch hẹn mới
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveDate(new Date())}
                className="rounded-full border-neutral-200 px-5 text-neutral-600 hover:bg-neutral-100"
              >
                <i className="bi bi-arrow-counterclockwise mr-2" />
                Quay về hôm nay
              </Button>
            </div>
          </CardHeader>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {stats.map((item) => (
            <Card
              key={item.label}
              className="rounded-3xl border border-neutral-200 bg-white shadow-sm"
            >
              <CardContent className="flex h-full flex-col justify-between gap-4 px-5 py-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.accent}`}
                  >
                    {item.label}
                  </span>
                  <i className="bi bi-graph-up text-neutral-300" />
                </div>
                <div>
                  <p className="text-3xl font-semibold text-neutral-900">{item.value}</p>
                  <p className="mt-1 text-sm text-neutral-500">{item.helper}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="rounded-3xl border border-neutral-200 shadow-sm">
          <CardHeader className="space-y-1 text-left">
            <h2 className="text-lg font-semibold text-neutral-900">Bộ lọc nâng cao</h2>
            <p className="text-sm text-neutral-500">
              Thu hẹp lịch hẹn theo trạng thái và kỹ thuật viên để làm việc nhanh hơn.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="statusFilter" className="text-sm font-medium text-neutral-600">
                Trạng thái
              </Label>
              <Select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="min-w-[220px] rounded-full border-neutral-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="technicianFilter" className="text-sm font-medium text-neutral-600">
                Kỹ thuật viên
              </Label>
              <Select
                id="technicianFilter"
                value={technicianFilter}
                onChange={(event) => setTechnicianFilter(event.target.value)}
                className="min-w-[220px] rounded-full border-neutral-200"
              >
                <option value="all">Tất cả kỹ thuật viên</option>
                {technicians
                  .filter((tech) => tech !== 'all')
                  .map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-neutral-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Lịch làm việc</h2>
              <p className="text-sm text-neutral-500">
                Hiển thị {filteredAppointments.length} lịch hẹn phù hợp bộ lọc.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {VIEW_OPTIONS.map((option) => {
                const isActive =
                  (option.value === 'list' && viewMode === 'list') ||
                  (viewMode === 'calendar' && calendarView === option.value);
                const handleClick = () => {
                  if (option.value === 'list') {
                    setViewMode('list');
                  } else {
                    setViewMode('calendar');
                    setCalendarView(option.value);
                  }
                };
                return (
                  <Button
                    key={option.value}
                    variant={isActive ? 'default' : 'outline'}
                    onClick={handleClick}
                    className={`rounded-full px-4 ${
                      isActive
                        ? 'bg-neutral-900'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="schedule-shell">
            {viewMode === 'calendar' ? (
              <Calendar
                localizer={localizer}
                events={filteredAppointments}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 720 }}
                view={calendarView}
                date={activeDate}
                onView={(nextView) => setCalendarView(nextView)}
                onNavigate={(nextDate) => setActiveDate(nextDate)}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventPropGetter}
                messages={CALENDAR_MESSAGES}
              />
            ) : (
              <ListView
                appointments={filteredAppointments}
                onSelectAppointment={handleSelectEvent}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {isModalOpen && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={handleCloseModal}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
};

export default ServiceSchedule;
