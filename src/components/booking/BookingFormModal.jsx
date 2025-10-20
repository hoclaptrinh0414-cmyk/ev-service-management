import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '../../components/ui/form';
import apiService from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';

const fmtLocal = (d) => {
  if (!d) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const addMinutes = (date, minutes) => {
  const dt = new Date(date);
  dt.setMinutes(dt.getMinutes() + minutes);
  return dt;
};

const isWithinWorkingHours = (start, end) => {
  const toMinutes = (dt) => dt.getHours() * 60 + dt.getMinutes();
  const s = toMinutes(new Date(start));
  const e = toMinutes(new Date(end));
  const open = 8 * 60; // 08:00
  const close = 18 * 60; // 18:00
  return s >= open && e <= close && e > s;
};

// props: { open, onClose, onSubmit, initialData, defaultStatus }
const BookingFormModal = ({ open, onClose, onSubmit, initialData = null, defaultStatus = 'Pending' }) => {
  const toast = useToast();

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]); // { id, name, duration }
  const [resources, setResources] = useState([]);
  const [checking, setChecking] = useState(false);
  const [conflict, setConflict] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      customerId: initialData?.customerId || '',
      vehicleId: initialData?.vehicleId || '',
      serviceId: initialData?.serviceId || '',
      resourceId: initialData?.resourceId || '',
      start: initialData?.start ? fmtLocal(initialData.start) : fmtLocal(new Date()),
      end: initialData?.end ? fmtLocal(initialData.end) : fmtLocal(addMinutes(new Date(), 60)),
      status: initialData?.status || defaultStatus || 'Pending',
      notes: initialData?.notes || '',
    },
  });

  const customerId = watch('customerId');
  const serviceId = watch('serviceId');
  const startVal = watch('start');
  const endVal = watch('end');
  const resourceId = watch('resourceId');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [resCustomers, resServices, resResources] = await Promise.all([
          apiService.request('/customers?simple=true'),
          apiService.request('/services?simple=true'),
          apiService.request('/schedule/resources?type=technician'),
        ]);
        if (!mounted) return;
        setCustomers(resCustomers?.data || resCustomers || []);
        setServices(resServices?.data || resServices || []);
        setResources(resResources?.data || resResources || []);
      } catch (e) {
        setCustomers([
          { id: 1, name: 'Nguyen Van An' },
          { id: 2, name: 'Tran Thi B' },
        ]);
        setServices([
          { id: 11, name: 'Bao duong dinh ky', duration: 60 },
          { id: 12, name: 'Thay pin', duration: 90 },
          { id: 13, name: 'Kiem tra phanh', duration: 45 },
        ]);
        setResources([
          { id: 101, title: 'KTV 1' },
          { id: 102, title: 'KTV 2' },
        ]);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    (async () => {
      if (!customerId) {
        setVehicles([]);
        setValue('vehicleId', '');
        return;
      }
      try {
        const res = await apiService.request(`/customers/${customerId}/vehicles?simple=true`);
        setVehicles(res?.data || res || []);
        setValue('vehicleId', '');
      } catch {
        setVehicles([
          { id: 201, plate: '29A-123.45', model: 'VinFast Feliz' },
          { id: 202, plate: '30F-678.90', model: 'Klara S' },
        ]);
        setValue('vehicleId', '');
      }
    })();
  }, [customerId, setValue]);

  useEffect(() => {
    if (!serviceId || !startVal) return;
    const svc = (services || []).find((s) => String(s.id) === String(serviceId));
    if (!svc?.duration) return;
    const newEnd = fmtLocal(addMinutes(new Date(startVal), Number(svc.duration)));
    setValue('end', newEnd, { shouldValidate: true });
  }, [serviceId, startVal, services, setValue]);

  useEffect(() => {
    if (!resourceId || !startVal || !endVal) return;
    const timer = setTimeout(async () => {
      try {
        setChecking(true);
        const qs = new URLSearchParams({ resourceId, start: new Date(startVal).toISOString(), end: new Date(endVal).toISOString() });
        if (initialData?.id) qs.append('excludeId', String(initialData.id));
        const res = await apiService.request(`/schedule/check?${qs.toString()}`);
        setConflict(res);
      } catch (e) {
        setConflict(null);
      } finally {
        setChecking(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [resourceId, startVal, endVal, initialData?.id]);

  const onSubmitInternal = async (values) => {
    if (!isWithinWorkingHours(new Date(values.start), new Date(values.end))) {
      toast.error('Loi', 'Thoi gian phai trong 08:00–18:00 va End > Start');
      return;
    }
    if (conflict && conflict.ok === false) {
      toast.warning('Canh bao', 'Khung gio bi trung. Vui long chon thoi gian khac.');
      return;
    }
    try {
      await onSubmit?.({
        ...values,
        start: new Date(values.start).toISOString(),
        end: new Date(values.end).toISOString(),
      });
      toast.success('Thanh cong', initialData ? 'Luu lich hen thanh cong' : 'Tao lich hen thanh cong');
      onClose?.();
      reset();
    } catch (e) {
      toast.error('Loi', e.message || 'Khong the luu lich hen');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent onEscapeKeyDown={() => onClose?.()}>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Cap nhat lich hen' : 'Tao lich hen moi'}</DialogTitle>
        </DialogHeader>

        <Form onSubmit={handleSubmit(onSubmitInternal)} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem>
              <FormLabel htmlFor="customerId">Khach hang</FormLabel>
              <FormControl>
                <Select id="customerId" aria-invalid={!!errors.customerId} {...register('customerId', { required: 'Vui long chon khach hang' })}>
                  <option value="">-- Chon khach hang --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.fullName || c.title}</option>
                  ))}
                </Select>
              </FormControl>
              {errors.customerId && <FormMessage>{errors.customerId.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="vehicleId">Xe</FormLabel>
              <FormControl>
                <Select id="vehicleId" disabled={!customerId} aria-invalid={!!errors.vehicleId} {...register('vehicleId', { required: 'Vui long chon xe' })}>
                  <option value="">-- Chon xe --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.model ? `${v.model} - ${v.plate}` : (v.name || v.plate)}</option>
                  ))}
                </Select>
              </FormControl>
              {errors.vehicleId && <FormMessage>{errors.vehicleId.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="serviceId">Dich vu</FormLabel>
              <FormControl>
                <Select id="serviceId" aria-invalid={!!errors.serviceId} {...register('serviceId', { required: 'Vui long chon dich vu' })}>
                  <option value="">-- Chon dich vu --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.duration ? ` • ${s.duration} phut` : ''}</option>
                  ))}
                </Select>
              </FormControl>
              {errors.serviceId && <FormMessage>{errors.serviceId.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="resourceId">Ky thuat vien / Khoang</FormLabel>
              <FormControl>
                <Select id="resourceId" aria-invalid={!!errors.resourceId} {...register('resourceId', { required: 'Vui long chon tai nguyen' })}>
                  <option value="">-- Chon tai nguyen --</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </Select>
              </FormControl>
              {errors.resourceId && <FormMessage>{errors.resourceId.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="start">Thoi gian bat dau</FormLabel>
              <FormControl>
                <Input
                  id="start"
                  type="datetime-local"
                  aria-invalid={!!errors.start}
                  {...register('start', {
                    required: 'Vui long chon thoi gian bat dau',
                  })}
                />
              </FormControl>
              {errors.start && <FormMessage>{errors.start.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="end">Thoi gian ket thuc</FormLabel>
              <FormControl>
                <Input
                  id="end"
                  type="datetime-local"
                  aria-invalid={!!errors.end}
                  {...register('end', {
                    required: 'Vui long chon thoi gian ket thuc',
                    validate: (v) => {
                      const s = new Date(watch('start'));
                      const e = new Date(v);
                      if (!(e > s)) return 'Ket thuc phai sau Bat dau';
                      if (!isWithinWorkingHours(s, e)) return 'Thoi gian phai trong 08:00–18:00';
                      return true;
                    },
                  })}
                />
              </FormControl>
              {errors.end && <FormMessage>{errors.end.message}</FormMessage>}
            </FormItem>

            {(initialData || (defaultStatus && defaultStatus !== 'Pending')) && (
              <FormItem>
                <FormLabel htmlFor="status">Trang thai</FormLabel>
                <FormControl>
                  <Select id="status" {...register('status')}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </Select>
                </FormControl>
              </FormItem>
            )}

            <div className="md:col-span-2">
              <FormItem>
                <FormLabel htmlFor="notes">Ghi chu</FormLabel>
                <FormControl>
                  <Textarea id="notes" rows={3} {...register('notes')} placeholder="Ghi chu them (tuy chon)" />
                </FormControl>
              </FormItem>
            </div>
          </div>

          {conflict && conflict.ok === false && (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800" role="alert" aria-live="polite">
              Khung gio bi trung. Vui long xem lai thoi gian hoac ky thuat vien.
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose?.()}>Huy</Button>
            <Button type="submit" disabled={checking || (conflict && conflict.ok === false)}>
              {initialData ? 'Luu' : 'Tao moi'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFormModal;

