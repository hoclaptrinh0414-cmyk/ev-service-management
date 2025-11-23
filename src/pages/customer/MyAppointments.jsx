// src/pages/customer/MyAppointments.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, Tag, Button, Modal, DatePicker, Select, Spin, Row, Col, Space, Pagination, Input } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../Home.css';
import './MyAppointments.css';
import MainLayout from '../../components/layout/MainLayout';

const statusMap = {
  pending: { color: '#faad14', text: 'Pending confirmation', icon: 'clock-history' },
  confirmed: { color: '#1890ff', text: 'Confirmed', icon: 'check-circle' },
  rescheduled: { color: '#fa8c16', text: 'Rescheduled', icon: 'arrow-repeat' },
  inprogress: { color: '#722ed1', text: 'In progress', icon: 'gear' },
  completed: { color: '#52c41a', text: 'Completed', icon: 'check-all' },
  completed_partial: { color: '#13c2c2', text: 'Completed (unpaid)', icon: 'check2-circle' },
  cancelled: { color: '#f5222d', text: 'Cancelled', icon: 'x-circle' },
  noshow: { color: '#595959', text: 'No-show', icon: 'dash-circle' },
  unknown: { color: '#d9d9d9', text: 'Unknown', icon: 'question-circle' },
};

const canonicalStatus = (status) => {
  const raw = (status || '').toString().trim().toLowerCase();
  if (['pending', 'pendingpayment', 'awaitingpayment'].includes(raw)) return 'pending';
  if (['confirmed'].includes(raw)) return 'confirmed';
  if (['rescheduled', 'reschedule'].includes(raw)) return 'rescheduled';
  if (['inprogress', 'processing', 'ongoing'].includes(raw)) return 'inprogress';
  if (['completed'].includes(raw)) return 'completed';
  if (['completedwithunpaidbalance', 'completed_partial', 'completedpartiallypaid'].includes(raw)) return 'completed_partial';
  if (['cancelled', 'canceled', 'cancelledbystaff', 'cancelled_by_staff', 'customer_cancelled'].includes(raw)) return 'cancelled';
  if (['noshow', 'no_show', 'no-show'].includes(raw)) return 'noshow';
  return raw || 'unknown';
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming'
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateDesc'); // dateAsc | dateDesc
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeCenters, setActiveCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const toastConfig = { autoClose: 10000, closeOnClick: true, pauseOnHover: true };

  const renderPagination = () => {
    const hasMultiple = totalPages > 1 || totalCount > pageSize;
    if (!hasMultiple) return null;

    return (
      <div className="d-flex flex-wrap align-items-center justify-content-between my-3">
        <div className="text-muted small">
          Trang {page}/{totalPages} — {totalCount} lịch hẹn
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0 small text-muted">Page size</label>
          <select
            className="form-select form-select-sm"
            style={{ width: '90px' }}
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            disabled={loading}
          >
            {[6, 9, 12, 15].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="btn-group btn-group-sm">
            <button
              className="btn btn-outline-dark"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="btn btn-outline-dark"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCenters();
  }, []);

  useEffect(() => {
    // Reset trang khi đổi filter
    setPage(1);
  }, [activeTab, statusFilter, sortBy, dateFilter]);

  useEffect(() => {
    loadAppointments();
  }, [activeTab, statusFilter, sortBy, dateFilter, page, pageSize]);

  const loadAppointments = async () => {
    const statusMapIds = {
      pending: 1,
      confirmed: 2,
      inprogress: 4,
      completed: 5,
      cancelled: 6,
      rescheduled: 7,
      noshow: 8,
      completed_partial: 9,
    };

    const params = {
      page,
      pageSize,
      sortBy: 'appointmentDate',
      sortOrder: sortBy === 'dateAsc' ? 'asc' : 'desc',
    };

    if (statusFilter !== 'all' && statusMapIds[statusFilter]) {
      params.statusId = statusMapIds[statusFilter];
    }

    if (activeTab === 'upcoming') {
      params.startDate = new Date().toISOString().split('T')[0];
    }

    if (dateFilter) {
      params.startDate = dateFilter;
      params.endDate = dateFilter;
    }

    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments(params);
      const payload = response?.data?.data || response?.data || response || {};
      console.log('API Response Payload:', payload);
      const items = payload.items || payload.data || payload || [];
      console.log('Extracted Items:', items);

      setAppointments(items);
      const total = payload.totalCount ?? payload.TotalCount ?? items.length ?? 0;
      setTotalCount(total);
      console.log('Total Count:', total);
      const pages =
        payload.totalPages ??
        payload.TotalPages ??
        Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
      setTotalPages(pages);
      console.log('Total Pages:', pages);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setMessage('Khong the tai danh sach lich hen. Vui long thu lai.');
      toast.error('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const loadCenters = async () => {
    const extract = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.data?.items)) return payload.data.items;
      return [];
    };

    try {
      const res = await appointmentService.getActiveServiceCenters();
      let centers = extract(res);

      if (!centers.length) {
        // fallback to full list
        const all = await appointmentService.getServiceCenters?.();
        centers = extract(all);
      }

      setActiveCenters(centers);
    } catch (error) {
      console.error('Error loading centers:', error);
      setActiveCenters([]);
      toast.warning('Không thể tải danh sách trung tâm. Vui lòng thử lại.', toastConfig);
    }
  };

  const getStatusBadge = (status) => {
    const canon = canonicalStatus(status);
    const info = statusMap[canon] || statusMap.unknown;
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('vi-VN');
    } catch {
      return value;
    }
  };

  const formatTimeRange = (start, end) => {
    if (!start || !end) return '';
    return `${start} - ${end}`;
  };

  const handleReschedule = async (appointment) => {
    if (!activeCenters.length) {
      await loadCenters();
    }
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    setMessage('');
    setAvailableSlots([]);
    setSelectedSlot(null);
    setSelectedCenterId(appointment.serviceCenterId || null);
    setRescheduleDate('');
    setRescheduleReason('');
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
    setMessage('');
    setCancelReason('');
  };

  const loadSlotsForReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !selectedCenterId) return;

    try {
      const response = await appointmentService.getAvailableSlots(
        selectedCenterId,
        rescheduleDate
      );
      const slots = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    loadSlotsForReschedule();
  }, [rescheduleDate, selectedCenterId]);

  const confirmReschedule = async () => {
    if (!selectedCenterId) {
      setMessage('Vui long chon trung tam moi.');
      return;
    }
    if (!rescheduleDate) {
      setMessage('Vui long chon ngay moi.');
      return;
    }
    if (!selectedSlot) {
      setMessage('Vui long chon khung gio moi.');
      return;
    }

    try {
      setLoading(true);
      const res = await appointmentService.rescheduleAppointment(
        selectedAppointment.appointmentId,
        selectedSlot.slotId,
        rescheduleReason || 'Customer requested reschedule'
      );
      const newId =
        res?.data?.appointmentId ||
        res?.data?.newAppointmentId ||
        res?.appointmentId ||
        res?.newAppointmentId;
      const successMsg = newId
        ? `Rescheduled successfully. New appointment #${newId}`
        : 'Rescheduled successfully!';
      setMessage(successMsg);
      toast.success(successMsg, toastConfig);
      setShowRescheduleModal(false);
      loadAppointments();
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Error rescheduling:', error);
      const errMsg = error.response?.data?.message || 'Khong the doi lich. Vui long thu lai.';
      setMessage(errMsg);
      toast.error(errMsg, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      setMessage('Vui long nhap ly do huy lich.');
      return;
    }

    try {
      setLoading(true);
      await appointmentService.cancelAppointment(
        selectedAppointment.appointmentId,
        cancelReason
      );
      setMessage('Huy lich thanh cong!');
      toast.success('Đã hủy lịch hẹn.', toastConfig);
      setShowCancelModal(false);
      setCancelReason('');
      loadAppointments();
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Error cancelling:', error);
      const errMsg = error.response?.data?.message || 'Khong the huy lich. Vui long thu lai.';
      setMessage(errMsg);
      toast.error(errMsg, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!pendingDeleteId) return;

    try {
      setLoading(true);
      await appointmentService.deleteAppointment(pendingDeleteId);
      setMessage('Xoa lich hen thanh cong!');
      toast.success('Đã xóa lịch hẹn.', toastConfig);
      loadAppointments();
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Error deleting:', error);
      const errMsg = error.response?.data?.message || 'Khong the xoa lich hen. Chi xoa duoc lich dang Pending.';
      setMessage(errMsg);
      toast.error(errMsg, toastConfig);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  const loadAppointmentDetail = async (appointmentId) => {
    try {
      setDetailLoading(true);
      const response = await appointmentService.getAppointmentById(appointmentId);
      const payload = response?.data || response || {};
      setDetailData(payload);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading appointment detail:', error);
      toast.error('Không thể tải chi tiết lịch hẹn.', toastConfig);
    } finally {
      setDetailLoading(false);
    }
  };

  const renderDetailRow = (label, value) => (
    <div style={{ marginBottom: 8 }}>
      <strong>{label}: </strong>
      <span>{value || 'N/A'}</span>
    </div>
  );

  const renderDetailServices = (services = []) => {
    if (!services.length) return <div className="text-muted">Chưa có thông tin dịch vụ</div>;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {services.map((s, idx) => (
          <Tag key={idx} color="blue" style={{ margin: 0 }}>
            {s.serviceName || s.name || s.serviceCode || 'Dịch vụ'}
          </Tag>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* Main Content */}
      <section style={{ marginTop: '20px', minHeight: '60vh' }}>
        <div className="container">
          <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                <i className="bi bi-calendar-check me-2"></i>
                Lich hen cua toi
              </h2>
              <p className="text-muted mb-0">Xem, doi lich, huy lich nhanh chong</p>
            </div>
            <Link to="/schedule-service" className="btn btn-primary btn-lg">
              <i className="bi bi-plus-circle me-1"></i>
              Dat lich moi
            </Link>
          </div>

          {message && (
            <div className={`alert ${message.toLowerCase().includes('thanh cong') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          <div className="appointments-filter-bar d-flex flex-wrap align-items-center gap-3 mb-3">
            <Select
              value={activeTab}
              style={{ width: 120 }}
              onChange={setActiveTab}
            >
              <Select.Option value="all">Tat ca ({totalCount || appointments.length || 0})</Select.Option>
              <Select.Option value="upcoming">Sap toi</Select.Option>
            </Select>

            <Select
              value={statusFilter}
              style={{ width: 180 }}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">Status: all</Select.Option>
              <Select.Option value="pending">Pending confirmation</Select.Option>
              <Select.Option value="confirmed">Confirmed</Select.Option>
              <Select.Option value="inprogress">In progress</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="completed_partial">Completed (unpaid)</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
              <Select.Option value="noshow">No-show</Select.Option>
            </Select>

            <DatePicker onChange={(date, dateString) => setDateFilter(dateString)} />

            <Select
              value={sortBy}
              style={{ width: 120 }}
              onChange={setSortBy}
            >
              <Select.Option value="dateDesc">Moi nhat</Select.Option>
              <Select.Option value="dateAsc">Cu nhat</Select.Option>
            </Select>

            {/* Pagination inline with filters */}
            {totalPages > 1 && (
              <div className="d-flex align-items-center gap-2 ms-auto">
                <span className="text-muted small">
                  Trang {page}/{totalPages}
                </span>
                <Select
                  value={page}
                  style={{ width: 80 }}
                  onChange={(p) => setPage(p)}
                  disabled={loading}
                >
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                    <Select.Option key={p} value={p}>
                      {p}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  value={pageSize}
                  style={{ width: 90 }}
                  onChange={(ps) => {
                    setPage(1);
                    setPageSize(ps);
                  }}
                  disabled={loading}
                >
                  {[6, 9, 12, 15, 20].map((s) => (
                    <Select.Option key={s} value={s}>
                      {s}/trang
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          
          <Spin spinning={loading} size="large">
            {appointments.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p className="mt-3 text-muted">Khong co lich hen nao</p>
                <Link to="/schedule-service" className="btn btn-primary mt-2">
                  Dat lich ngay
                </Link>
              </div>
            ) : (
              <Row gutter={[16, 24]}>
                {appointments.map((appointment) => {
                  const paymentStatus =
                    appointment.paymentStatusName ||
                    appointment.paymentStatus ||
                    appointment.paymentIntentStatus ||
                    '';
                  const canonStatus = canonicalStatus(appointment.statusName || appointment.status);
                  const statusInfo = statusMap[canonStatus] || statusMap.unknown;

                  return (
                    <Col key={appointment.appointmentId} xs={24} sm={24} md={12} lg={8}>
                      <Card
                        title={`#${appointment.appointmentCode || appointment.appointmentId}`}
                        extra={<Tag color={statusInfo.color}>{statusInfo.text}</Tag>}
                        actions={[
                          <Button type="link" onClick={() => loadAppointmentDetail(appointment.appointmentId)}>
                            Chi tiết
                          </Button>,
                          <Space>
                            {(canonStatus === 'pending' || canonStatus === 'confirmed') && (
                              <Button
                                type="primary"
                                ghost
                                onClick={() => handleReschedule(appointment)}
                              >
                                Doi lich
                              </Button>
                            )}
                            {(canonStatus === 'pending' || canonStatus === 'confirmed') && (
                              <Button
                                danger
                                onClick={() => handleCancelAppointment(appointment)}
                              >
                                Huy
                              </Button>
                            )}
                            {canonStatus === 'cancelled' && (
                              <Button
                                type="dashed"
                                danger
                                onClick={() => {
                                  setPendingDeleteId(appointment.appointmentId);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Xoa
                              </Button>
                            )}
                          </Space>
                        ]}
                      bodyStyle={{ paddingBottom: 12, paddingTop: 12 }}
                      style={{ marginBottom: 12 }}
                      >
                        <p><strong>Xe:</strong> {appointment.vehicleName || appointment.vehicleModel || 'N/A'} ({appointment.vehicleLicensePlate || ''})</p>
                        <p><strong>Trung tam:</strong> {appointment.serviceCenterName || 'N/A'}</p>
                        <p>
                          <strong>Thoi gian:</strong> {formatDate(appointment.appointmentDate || appointment.slotDate)} - {formatTimeRange(appointment.slotStartTime, appointment.slotEndTime)}
                        </p>
                        {paymentStatus && (
                          <p><strong>Thanh toan:</strong> <Tag color="blue">{paymentStatus}</Tag></p>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Spin>

          {totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Pagination
                current={page}
                total={totalCount}
                pageSize={pageSize}
                onChange={(p, ps) => {
                  setPage(p);
                  if (ps !== pageSize) {
                    setPageSize(ps);
                    setPage(1);
                  }
                }}
                showSizeChanger
                pageSizeOptions={['6', '9', '12', '15', '20']}
                responsive
              />
            </div>
          )}
        </div>
      </section>

      <Modal
        title="Doi lich hen"
        visible={showRescheduleModal}
        onOk={confirmReschedule}
        onCancel={() => setShowRescheduleModal(false)}
        confirmLoading={loading}
        okText="Xac nhan doi lich"
        cancelText="Huy"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            placeholder="Chon trung tam moi"
            style={{ width: '100%' }}
            value={selectedCenterId}
            onChange={(value) => {
              setSelectedCenterId(value);
              setSelectedSlot(null);
              setAvailableSlots([]);
            }}
          >
            {activeCenters.map((c) => (
              <Select.Option key={c.serviceCenterId || c.id} value={c.serviceCenterId || c.id}>
                {c.name || c.serviceCenterName}
              </Select.Option>
            ))}
          </Select>
          <DatePicker
            style={{ width: '100%' }}
            onChange={(date, dateString) => setRescheduleDate(dateString)}
            disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
          />
          {availableSlots.length > 0 && (
            <Row gutter={[8, 8]}>
              {availableSlots.map((slot) => (
                <Col key={slot.slotId} span={12}>
                  <Card
                    hoverable
                    onClick={() => setSelectedSlot(slot)}
                    className={selectedSlot?.slotId === slot.slotId ? 'ant-card-active' : ''}
                  >
                    {slot.startTime} - {slot.endTime}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Space>
      </Modal>

      <Modal
        title="Huy lich hen"
        visible={showCancelModal}
        onOk={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
        confirmLoading={loading}
        okText="Xac nhan huy"
        cancelText="Khong"
      >
        <p>Ban co chac muon huy lich hen nay?</p>
        <Input.TextArea
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Nhap ly do huy lich..."
        />
      </Modal>

      <Modal
        title="Xóa lịch hẹn"
        visible={showDeleteModal}
        onOk={handleDeleteAppointment}
        onCancel={() => setShowDeleteModal(false)}
        confirmLoading={loading}
        okText="Xac nhan xoa"
        cancelText="Huy"
      >
        <p>Ban co chac muon xoa lich hen nay? (Chi xoa duoc lich dang Pending)</p>
      </Modal>

      <Modal
        title={
          detailData
            ? `Chi tiet lich hen #${detailData.appointmentCode || detailData.appointmentId}`
            : 'Chi tiet lich hen'
        }
        visible={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={
          <Button type="primary" onClick={() => setShowDetailModal(false)}>
            Dong
          </Button>
        }
        width={720}
      >
        {detailLoading ? (
          <div className="text-center py-4">
            <Spin />
          </div>
        ) : detailData ? (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <strong>Mã lịch hẹn:</strong> {detailData.appointmentCode || detailData.appointmentId}
              </div>
              {detailData.statusName && (
                <Tag color={detailData.statusColor || '#1890ff'}>
                  {detailData.statusName}
                </Tag>
              )}
            </div>

            {renderDetailRow('Khach hang', `${detailData.customerName || ''} (${detailData.customerPhone || ''})`)}
            {renderDetailRow('Xe', `${detailData.vehicleName || ''} (${detailData.licensePlate || ''})`)}
            {renderDetailRow('Trung tam', `${detailData.serviceCenterName || ''} - ${detailData.serviceCenterAddress || ''}`)}
            {renderDetailRow(
              'Thoi gian',
              `${formatDate(detailData.slotDate)} ${formatTimeRange(detailData.slotStartTime, detailData.slotEndTime)}`
            )}
            {renderDetailRow('Uu tien / Nguon', `${detailData.priority || 'N/A'} / ${detailData.source || 'N/A'}`)}
            {renderDetailRow(
              'Thanh toan',
              `${detailData.paymentStatus || 'N/A'} (Da tra: ${detailData.paidAmount || 0}, Con lai: ${
                detailData.outstandingAmount || 0
              })`
            )}
            {renderDetailRow('Nguoi tao', `${detailData.createdByName || ''} - ${formatDate(detailData.createdDate)}`)}
            {renderDetailRow('Ghi chu', detailData.customerNotes || '—')}

            <div>
              <strong>Dich vu / goi:</strong>
              <div style={{ marginTop: 4 }}>
                {renderDetailServices(detailData.services)}
                {detailData.packageName && (
                  <div style={{ marginTop: 6 }}>
                    <Tag color="green">{detailData.packageName}</Tag>
                  </div>
                )}
              </div>
            </div>
          </Space>
        ) : (
          <div className="text-muted">Khong co du lieu chi tiet.</div>
        )}
      </Modal>
    </MainLayout>
  );
};

export default MyAppointments;
