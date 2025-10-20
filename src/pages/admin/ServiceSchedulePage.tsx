/*
  ServiceSchedulePage.tsx – New standalone UI using shadcn/ui + Tailwind
  No changes to existing pages; uses mock data for rendering.
*/
// @ts-nocheck
import React, { useMemo, useState } from 'react';
import './ServiceSchedulePage.css';

import { ChevronLeft, ChevronRight, MoreHorizontal, Plus } from 'lucide-react';

// shadcn/ui components (relative paths; ensure you have generated them)
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '../../components/ui/command';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { format } from 'date-fns';
import vi from 'date-fns/locale/vi';

type AppointmentStatus =
  | 'Chờ xác nhận'
  | 'Đã xác nhận'
  | 'Đang tiến hành'
  | 'Đã hoàn thành'
  | 'Đã hủy';

type Appointment = {
  id: string;
  customerName: string;
  phone?: string;
  vehicleInfo: string;
  serviceType: string;
  technician: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
};

const technicians = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Quốc D'];

export const sampleAppointments: Appointment[] = [
  {
    id: 'A-1001',
    customerName: 'Nguyễn Văn An',
    phone: '0901 234 567',
    vehicleInfo: 'VinFast Feliz - 29-B1 12345',
    serviceType: 'Bảo dưỡng định kỳ',
    technician: 'Nguyễn Văn A',
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(10, 0, 0, 0)),
    status: 'Chờ xác nhận',
  },
  {
    id: 'A-1002',
    customerName: 'Trần Thị Hoa',
    phone: '0908 765 432',
    vehicleInfo: 'VinFast Klara - 30-F1 45678',
    serviceType: 'Thay pin',
    technician: 'Trần Thị B',
    startTime: new Date(new Date().setHours(11, 0, 0, 0)),
    endTime: new Date(new Date().setHours(12, 0, 0, 0)),
    status: 'Đã xác nhận',
  },
  {
    id: 'A-1003',
    customerName: 'Lê Quốc Bình',
    phone: '0912 345 678',
    vehicleInfo: 'Yadea ULike - 29-E1 99887',
    serviceType: 'Kiểm tra phanh',
    technician: 'Lê Minh C',
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    endTime: new Date(new Date().setHours(15, 0, 0, 0)),
    status: 'Đang tiến hành',
  },
  {
    id: 'A-1004',
    customerName: 'Phạm Hải Nam',
    phone: '0933 111 222',
    vehicleInfo: 'VinFast Feliz S - 30-H1 11223',
    serviceType: 'Thay má phanh',
    technician: 'Phạm Quốc D',
    startTime: new Date(new Date().setHours(16, 0, 0, 0)),
    endTime: new Date(new Date().setHours(17, 0, 0, 0)),
    status: 'Đã hoàn thành',
  },
];

const STATUS_STYLES: Record<AppointmentStatus, { dot: string; badge: string }> = {
  'Chờ xác nhận': { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' },
  'Đã xác nhận': { dot: 'bg-green-500', badge: 'bg-green-100 text-green-800' },
  'Đang tiến hành': { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' },
  'Đã hoàn thành': { dot: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800' },
  'Đã hủy': { dot: 'bg-red-500', badge: 'bg-red-100 text-red-800' },
};

const Toolbar = ({
  monthLabel,
  onToday,
  onPrev,
  onNext,
  status,
  setStatus,
  tech,
  setTech,
  viewMode,
  setViewMode,
  onCreate,
}) => (
  <div className="ss-toolbar">
    <div className="left">
      <Button onClick={onCreate} className="gap-2">
        <Plus className="h-4 w-4" />
        Tạo lịch hẹn mới
      </Button>
    </div>
    <div className="center">
      <Button variant="outline" onClick={onToday}>Hôm nay</Button>
      <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Trước">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onNext} aria-label="Sau">
        <ChevronRight className="h-5 w-5" />
      </Button>
      <span className="month-label">{monthLabel}</span>
    </div>
    <div className="right">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="Tất cả Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả Trạng thái</SelectItem>
          {Object.keys(STATUS_STYLES).map((k) => (
            <SelectItem key={k} value={k}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tech} onValueChange={setTech}>
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="Tất cả Kỹ thuật viên" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả Kỹ thuật viên</SelectItem>
          {['Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Quốc D'].map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v)}>
        <ToggleGroupItem value="month">Tháng</ToggleGroupItem>
        <ToggleGroupItem value="week">Tuần</ToggleGroupItem>
        <ToggleGroupItem value="day">Ngày</ToggleGroupItem>
        <ToggleGroupItem value="list">Danh sách</ToggleGroupItem>
      </ToggleGroup>
    </div>
  </div>
);

const ListView = ({ items }: { items: Appointment[] }) => (
  <div className="ss-table">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Khách hàng</TableHead>
          <TableHead>Phương tiện</TableHead>
          <TableHead>Dịch vụ</TableHead>
          <TableHead>Kỹ thuật viên</TableHead>
          <TableHead>Thời gian</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[48px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((a) => (
          <TableRow key={a.id} className="hover:bg-muted/40">
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{a.customerName}</span>
                <span className="text-muted-foreground text-xs">{a.phone || ''}</span>
              </div>
            </TableCell>
            <TableCell>{a.vehicleInfo}</TableCell>
            <TableCell>{a.serviceType}</TableCell>
            <TableCell>{a.technician}</TableCell>
            <TableCell>
              {format(a.startTime, 'dd/MM/yyyy HH:mm')} – {format(a.endTime, 'HH:mm')}
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[a.status].badge}`}>
                {a.status}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Thao tác">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Xem/Sửa</DropdownMenuItem>
                  <DropdownMenuItem>Hủy lịch</DropdownMenuItem>
                  <DropdownMenuItem>Gửi nhắc nhở</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const CreateEditDialog = ({ open, setOpen, onSave, initial }) => {
  const [date, setDate] = useState<Date | undefined>(initial?.startTime || new Date());
  const [form, setForm] = useState<Partial<Appointment>>({
    customerName: initial?.customerName || '',
    phone: initial?.phone || '',
    vehicleInfo: initial?.vehicleInfo || '',
    serviceType: initial?.serviceType || '',
    technician: initial?.technician || technicians[0],
    startTime: initial?.startTime || new Date(),
    endTime: initial?.endTime || new Date(new Date().getTime() + 60 * 60 * 1000),
    status: initial?.status || 'Chờ xác nhận',
  });

  const handleSave = () => {
    if (!form.customerName || !form.vehicleInfo || !date) return;
    const start = new Date(date);
    const [sh, sm] = format(form.startTime || new Date(), 'HH:mm').split(':').map(Number);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(date);
    const [eh, em] = format(form.endTime || new Date(), 'HH:mm').split(':').map(Number);
    end.setHours(eh, em, 0, 0);
    onSave({
      id: initial?.id || crypto.randomUUID(),
      customerName: form.customerName!,
      phone: form.phone || '',
      vehicleInfo: form.vehicleInfo!,
      serviceType: form.serviceType || 'Bảo dưỡng',
      technician: form.technician || technicians[0],
      startTime: start,
      endTime: end,
      status: form.status || 'Chờ xác nhận',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Tạo lịch hẹn mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Khách hàng</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {form.customerName || 'Chọn khách hàng'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[320px]">
                  <Command>
                    <CommandInput placeholder="Tìm khách hàng..." />
                    <CommandList>
                      <CommandEmpty>Không có kết quả</CommandEmpty>
                      {['Nguyễn Văn An', 'Trần Thị Hoa', 'Lê Quốc Bình', 'Phạm Hải Nam'].map((c) => (
                        <CommandItem key={c} value={c} onSelect={(v) => setForm({ ...form, customerName: v })}>
                          {c}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="VD: 0901 234 567" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phương tiện</Label>
              <Input value={form.vehicleInfo} onChange={(e) => setForm({ ...form, vehicleInfo: e.target.value })} placeholder="VinFast Feliz - 29-B1..." />
            </div>
            <div className="space-y-2">
              <Label>Loại dịch vụ</Label>
              <Input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="Bảo dưỡng / Thay pin..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày hẹn</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {date ? format(date, 'dd/MM/yyyy') : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} locale={vi} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giờ bắt đầu</Label>
                <Input type="time" value={format(form.startTime, 'HH:mm')} onChange={(e) => setForm({ ...form, startTime: new Date(`1970-01-01T${e.target.value}:00`) })} />
              </div>
              <div className="space-y-2">
                <Label>Giờ kết thúc</Label>
                <Input type="time" value={format(form.endTime, 'HH:mm')} onChange={(e) => setForm({ ...form, endTime: new Date(`1970-01-01T${e.target.value}:00`) })} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kỹ thuật viên</Label>
              <Select value={form.technician} onValueChange={(v) => setForm({ ...form, technician: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỹ thuật viên" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(STATUS_STYLES).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea rows={3} placeholder="Thông tin bổ sung (tuỳ chọn)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleSave}>Lưu lịch hẹn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ServiceSchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [status, setStatus] = useState('all');
  const [tech, setTech] = useState('all');
  const [viewMode, setViewMode] = useState('month');
  const [data, setData] = useState(sampleAppointments);
  const [open, setOpen] = useState(false);

  const monthLabel = useMemo(() => format(currentDate, 'MMMM yyyy', { locale: vi }), [currentDate]);

  const filtered = useMemo(() => data.filter((a) => (status === 'all' || a.status === status) && (tech === 'all' || a.technician === tech)), [data, status, tech]);

  const events = filtered.map((a) => ({ id: a.id, title: `${a.customerName} • ${a.vehicleInfo}`, start: a.startTime, end: a.endTime, extendedProps: { appt: a } }));

  const handleToday = () => setCurrentDate(new Date());
  const handlePrev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNext = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="service-schedule-page">
      <h1 className="text-3xl font-bold mb-4">Quản lý Lịch hẹn</h1>
      <Toolbar
        monthLabel={monthLabel}
        onToday={handleToday}
        onPrev={handlePrev}
        onNext={handleNext}
        status={status}
        setStatus={setStatus}
        tech={tech}
        setTech={setTech}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onCreate={() => setOpen(true)}
      />

      {viewMode === 'list' ? (
        <ListView items={filtered} />
      ) : (
        <div className="calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={false}
            initialView={viewMode === 'month' ? 'dayGridMonth' : viewMode === 'week' ? 'timeGridWeek' : 'timeGridDay'}
            events={events}
            height="auto"
            locale="vi"
            nowIndicator
            editable={false}
            eventContent={(arg) => {
              const appt = arg.event.extendedProps.appt;
              const el = document.createElement('div');
              const styles = STATUS_STYLES[appt.status];
              el.innerHTML = `
                <div class=\"appt-card\">
                  <span class=\"dot ${styles.dot}\"></span>
                  <div class=\"appt-meta\">
                    <span class=\"time\">${format(appt.startTime, 'HH:mm')} - ${format(appt.endTime, 'HH:mm')}</span>
                    <span class=\"customer\">${appt.customerName}</span>
                    <span class=\"vehicle\">${appt.vehicleInfo}</span>
                  </div>
                </div>`;
              return { domNodes: [el] };
            }}
          />
        </div>
      )}

      <CreateEditDialog open={open} setOpen={setOpen} onSave={(a) => setData((prev) => [...prev, a])} />
    </div>
  );
};

export default ServiceSchedulePage;

