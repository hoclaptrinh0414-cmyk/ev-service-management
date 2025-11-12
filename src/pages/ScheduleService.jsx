// src/pages/ScheduleService.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import NotificationDropdown from '../components/NotificationDropdown';
import useNotifications from '../hooks/useNotifications';
import FancyButton from '../components/FancyButton';
import appointmentService from '../services/appointmentService';
import subscriptionService from '../services/subscriptionService';
import { validateAgeForService } from '../utils/ageValidator';
import { formatCurrency } from '../utils/currencyUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css';

const ScheduleService = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, dismissNotification } = useNotifications();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [showPayButton, setShowPayButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ageValidation, setAgeValidation] = useState({ isValid: true, message: '', needsDateOfBirth: false });

  // Data from API
  const [vehicles, setVehicles] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Smart Subscription
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  let lastScrollY = 0;

  // Load initial data
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Check age requirement first
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('👤 User from localStorage:', user);
    console.log('📅 Date of birth:', user?.dateOfBirth);

    const validation = validateAgeForService(user);
    console.log('✅ Age validation result:', validation);
    setAgeValidation(validation);

    // If user needs to provide date of birth, show alert and redirect
    if (validation.needsDateOfBirth) {
      console.log('⚠️ User needs to provide date of birth');
      if (window.confirm('Bạn cần cập nhật ngày sinh trong Thông tin cá nhân để sử dụng dịch vụ. Chuyển đến trang Thông tin cá nhân ngay?')) {
        navigate('/profile');
        return;
      }
    }

    if (!validation.isValid) {
      console.log('❌ User is not eligible for service:', validation.message);
    } else {
      console.log('✅ User is eligible for service');
    }

    loadInitialData();

    // Reload data when user comes back to this page
    const handleFocus = () => {
      // Re-check age when user comes back
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      const updatedValidation = validateAgeForService(updatedUser);
      setAgeValidation(updatedValidation);

      if (!updatedValidation.needsDateOfBirth) {
        loadInitialData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar-custom');
      const carousel = document.querySelector('#carouselExampleAutoplaying');
      const carouselHeight = carousel ? carousel.offsetHeight : 0;
      const scrollPosition = window.scrollY;
      const currentScrollY = window.scrollY;

      if (scrollPosition > carouselHeight - 100) {
        if (currentScrollY > lastScrollY) {
          setHidden(true);
        } else {
          setHidden(false);
          setScrolled(true);
        }
      } else {
        setHidden(false);
        setScrolled(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load vehicles, service centers, and services
  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load in parallel
      const [vehiclesRes, centersRes, servicesRes] = await Promise.all([
        appointmentService.getMyVehicles(),
        appointmentService.getServiceCenters(),
        appointmentService.getActiveServices()
      ]);

      console.log('🚗 Vehicles response:', vehiclesRes);
      console.log('🚗 Vehicles data:', vehiclesRes.data);
      console.log('🏢 Centers:', centersRes);
      console.log('🏢 Centers data:', centersRes.data);
      console.log('🔧 Services:', servicesRes);
      console.log('🔧 Services data:', servicesRes.data);

      // Handle different response formats and filter out deleted vehicles
      const rawVehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data :
                          Array.isArray(vehiclesRes) ? vehiclesRes : [];

      // Get frontend-deleted vehicles from localStorage
      const deletedVehicles = JSON.parse(localStorage.getItem('deletedVehicles') || '[]');

      const vehiclesData = rawVehicles.filter(vehicle => {
        // Filter out backend soft-deleted vehicles
        const isDeleted = vehicle.isDeleted || vehicle.IsDeleted || false;
        if (isDeleted) {
          console.log(`🗑️ Filtering out BE-deleted vehicle: ${vehicle.licensePlate}`);
          return false;
        }

        // Filter out frontend-deleted vehicles
        const isFrontendDeleted = deletedVehicles.includes(vehicle.vehicleId);
        if (isFrontendDeleted) {
          console.log(`🗑️ Filtering out frontend-deleted vehicle: ${vehicle.licensePlate}`);
          return false;
        }

        return true;
      });

      const centersData = Array.isArray(centersRes.data) ? centersRes.data :
                         Array.isArray(centersRes) ? centersRes : [];

      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data :
                          Array.isArray(servicesRes) ? servicesRes : [];

      setVehicles(vehiclesData);
      setServiceCenters(centersData);
      setServices(servicesData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('❌ Error response:', error.response);
      setBookingMessage('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Load time slots when center and date change
  const handleCenterOrDateChange = async (centerId, date) => {
    console.log('🕐 Loading time slots for center:', centerId, 'date:', date);
    if (!centerId || !date) return;

    try {
      setLoading(true);
      setSelectedSlot(null); // Reset selected slot when changing center or date
      const slotsRes = await appointmentService.getAvailableSlots(centerId, date);
      console.log('🕐 Time slots response:', slotsRes);
      console.log('🕐 Time slots data:', slotsRes.data);

      const slotsData = Array.isArray(slotsRes.data) ? slotsRes.data :
                       Array.isArray(slotsRes) ? slotsRes : [];

      console.log('🕐 Final time slots:', slotsData);
      setTimeSlots(slotsData);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type === 'appointment_reminder' && notification.appointmentId) {
      navigate('/my-appointments');
    }
  };

  // Check active subscription khi vehicle và services thay đổi
  useEffect(() => {
    checkActiveSubscription();
  }, [selectedVehicleId, selectedServiceIds]);

  const checkActiveSubscription = async () => {
    if (!selectedVehicleId || selectedServiceIds.length === 0) {
      setActiveSubscription(null);
      return;
    }

    try {
      setCheckingSubscription(true);
      const response = await subscriptionService.getActiveSubscriptionsByVehicle(selectedVehicleId);
      const activeSubscriptions = Array.isArray(response.data) ? response.data : [];

      // Check if any service is covered by subscription
      const matchingSubscription = activeSubscriptions.find(sub =>
        sub.packageServices && sub.packageServices.some(ps =>
          selectedServiceIds.includes(ps.serviceId) && sub.remainingServices > 0
        )
      );

      setActiveSubscription(matchingSubscription || null);

      if (matchingSubscription) {
        console.log('✅ Found active subscription:', matchingSubscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setActiveSubscription(null);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    checkActiveSubscription();
  };

  const handleServiceChange = (serviceId, isChecked) => {
    setSelectedServiceIds(prev => {
      if (isChecked) {
        return [...prev, parseInt(serviceId)];
      } else {
        return prev.filter(id => id !== parseInt(serviceId));
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBookingMessage('');

    try {
      // Get customer ID from localStorage (set during login)
      const user = JSON.parse(localStorage.getItem('user'));

      // Re-validate age before submitting
      const validation = validateAgeForService(user);
      if (!validation.isValid) {
        setBookingMessage(validation.message);
        setLoading(false);
        return;
      }

      // Get form values
      const vehicleId = document.getElementById('vehicle').value;
      const serviceCenterId = document.getElementById('service-center').value;
      const slotId = selectedSlot?.slotId;
      const serviceIds = Array.from(document.querySelectorAll('input[name="service-type"]:checked'))
        .map(el => parseInt(el.value));
      const customerNotes = document.getElementById('notes')?.value || '';

      if (!slotId) {
        setBookingMessage('Vui lòng chọn khung giờ.');
        setLoading(false);
        return;
      }

      const customerId = user?.customerId || user?.CustomerId;

      console.log('📋 User from localStorage:', user);
      console.log('👤 Customer ID:', customerId);

      if (!customerId) {
        setBookingMessage('Vui lòng đăng nhập để đặt lịch.');
        return;
      }

      // Prepare appointment data
      const appointmentData = {
        customerId,
        vehicleId: parseInt(vehicleId),
        serviceCenterId: parseInt(serviceCenterId),
        slotId: parseInt(slotId),
        serviceIds: serviceIds.length > 0 ? serviceIds : [],
        customerNotes,
        priority: 'Normal',
        source: 'Online'
      };

      // Create appointment
      const response = await appointmentService.createAppointment(appointmentData);

      if (response.success) {
        setBookingMessage(response.message || 'Đặt lịch thành công! Vui lòng kiểm tra email để xác nhận.');
        setShowPayButton(true);

        // Reset form and states
        e.target.reset();
        setSelectedSlot(null);
        setSelectedCenter('');
        setSelectedDate('');
        setTimeSlots([]);
      } else {
        setBookingMessage(response.message || 'Có lỗi xảy ra khi đặt lịch.');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setBookingMessage(
        error.response?.data?.message ||
        'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-custom scrolled">
        <div className="container d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center w-100 top-navbar">
            <form className="search-form">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Tìm kiếm sản phẩm..."
              />
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>

            <Link style={{ fontSize: '2rem' }} className="navbar-brand" to="/home">
              Tesla
            </Link>

            <div className="nav-icons d-flex align-items-center">
              <UserMenu />
              <NotificationDropdown
                notifications={notifications}
                onMarkRead={markAsRead}
                onDismiss={dismissNotification}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </div>

          <div className="bottom-navbar">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav w-100 justify-content-center">
                <li className="nav-item">
                  <Link className="nav-link move" to="/home">TRANG CHỦ</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle move" href="#" role="button" data-bs-toggle="dropdown">
                    DỊCH VỤ
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/my-appointments">Theo dõi & Nhắc nhở</Link></li>
                    <li><Link className="dropdown-item" to="/schedule-service">Đặt lịch dịch vụ</Link></li>
                    <li><Link className="dropdown-item" to="/products/individual">Quản lý chi phí</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">BLOG</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">GIỚI THIỆU</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">LIÊN HỆ</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Booking Section */}
      <section className="booking-section" style={{ marginTop: '180px' }}>
        <div className="container">
          {/* Age Validation Alert */}
          {!ageValidation.isValid && (
            <div className={`alert ${ageValidation.needsDateOfBirth ? 'alert-warning' : 'alert-danger'} mb-4`} role="alert">
              <div className="d-flex align-items-center">
                <i className={`bi ${ageValidation.needsDateOfBirth ? 'bi-exclamation-triangle-fill' : 'bi-x-circle-fill'} me-2`} style={{ fontSize: '1.5rem' }}></i>
                <div className="flex-grow-1">
                  <h5 className="alert-heading mb-1">
                    {ageValidation.needsDateOfBirth ? 'Cần cập nhật thông tin' : 'Không đủ điều kiện'}
                  </h5>
                  <p className="mb-0">{ageValidation.message}</p>
                </div>
                {ageValidation.needsDateOfBirth && (
                  <button
                    className="btn btn-warning btn-sm ms-3"
                    onClick={() => navigate('/profile')}
                  >
                    <i className="bi bi-person-fill me-1"></i>
                    Cập nhật ngay
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="text-center mb-4 position-relative">
            <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 600 }}>ĐẶT LỊCH DỊCH VỤ</h2>
            <p className="mb-4" style={{ fontSize: '0.95rem', color: '#666' }}>
              Đặt lịch bảo dưỡng hoặc sửa chữa trực tuyến, chọn trung tâm dịch vụ và nhận xác nhận nhanh chóng.
            </p>
            <button
              onClick={loadInitialData}
              className="btn btn-outline-dark btn-sm position-absolute"
              disabled={loading}
              style={{ top: 0, right: 0 }}
            >
              <i className="fas fa-sync-alt"></i> Làm mới
            </button>
          </div>
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="booking-card">
                <form id="booking-form" onSubmit={handleSubmit}>
                  {loading && <div className="alert alert-info">Đang tải dữ liệu...</div>}

                  <div className="row">
                    {/* Cột trái */}
                    <div className="col-md-6">
                      {/* Vehicle Selection */}
                      <h5 className="mb-3" style={{ fontWeight: 600 }}>Chọn xe</h5>
                      <div className="mb-4">
                        <select className="form-select" id="vehicle" required disabled={loading || vehicles.length === 0}>
                          <option value="">Chọn xe ({vehicles.length} xe)</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                              {vehicle.licensePlate} - {vehicle.modelName}
                            </option>
                          ))}
                        </select>
                        {vehicles.length === 0 && !loading && (
                          <small className="text-danger">
                            Bạn chưa đăng ký xe. Vui lòng <Link to="/register-vehicle">đăng ký xe</Link> trước.
                          </small>
                        )}
                      </div>

                      {/* Service Center Selection */}
                      <h5 className="mb-3" style={{ fontWeight: 600 }}>Trung tâm dịch vụ</h5>
                      <div className="mb-4">
                        <select
                          className="form-select"
                          id="service-center"
                          required
                          disabled={loading || serviceCenters.length === 0}
                          onChange={(e) => {
                            setSelectedCenter(e.target.value);
                            if (selectedDate) {
                              handleCenterOrDateChange(e.target.value, selectedDate);
                            }
                          }}
                        >
                          <option value="">Chọn trung tâm dịch vụ ({serviceCenters.length} trung tâm)</option>
                          {serviceCenters.map(center => (
                            <option key={center.centerId} value={center.centerId}>
                              {center.centerName} - {center.address}
                            </option>
                          ))}
                        </select>
                        {serviceCenters.length === 0 && !loading && (
                          <small className="text-danger">Không có trung tâm dịch vụ khả dụng</small>
                        )}
                      </div>

                      {/* Date Selection */}
                      <h5 className="mb-3" style={{ fontWeight: 600 }}>Chọn ngày & giờ</h5>
                      <div className="mb-4">
                        <input
                          type="date"
                          className="form-control"
                          id="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            if (selectedCenter) {
                              handleCenterOrDateChange(selectedCenter, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Cột phải */}
                    <div className="col-md-6">
                      {/* Time Slot Selection */}
                      <h5 className="mb-3" style={{ fontWeight: 600 }}>Khung giờ</h5>
                      <div className="mb-4">
                        {!selectedCenter || !selectedDate ? (
                          <div className="text-center py-4 text-muted">
                            <i className="bi bi-clock-history" style={{ fontSize: '2rem' }}></i>
                            <p className="mt-2 mb-0">Vui lòng chọn trung tâm và ngày để xem khung giờ</p>
                          </div>
                        ) : timeSlots.length === 0 && !loading ? (
                          <div className="text-center py-4 text-warning">
                            <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                            <p className="mt-2 mb-0">Không có khung giờ trống cho ngày này</p>
                          </div>
                        ) : (
                          <div className="row g-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {timeSlots.map(slot => {
                              const isSelected = selectedSlot?.slotId === slot.slotId;

                              // BE trả về: remainingCapacity, maxBookings, currentBookings
                              const totalSlots = slot.maxBookings || slot.maxCapacity || 10;
                              const availableSlots = slot.remainingCapacity ?? (totalSlots - (slot.currentBookings || 0));
                              const availablePercent = totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;

                              console.log(`✅ Slot ${slot.slotId}: ${slot.startTime}-${slot.endTime} | available=${availableSlots}/${totalSlots} (${availablePercent.toFixed(0)}%)`);

                              const getSlotColor = () => {
                                if (availableSlots === 0) return 'danger';
                                if (availablePercent <= 30) return 'warning';
                                return 'success';
                              };

                              return (
                                <div key={slot.slotId} className="col-6">
                                  <div
                                    className={`card h-100 ${isSelected ? 'border-primary shadow' : ''} ${availableSlots === 0 ? 'opacity-50' : ''}`}
                                    style={{
                                      cursor: availableSlots > 0 ? 'pointer' : 'not-allowed',
                                      transition: 'all 0.2s',
                                      border: isSelected ? '2px solid #0d6efd' : '1px solid #dee2e6'
                                    }}
                                    onClick={() => {
                                      if (availableSlots > 0) {
                                        setSelectedSlot(slot);
                                      }
                                    }}
                                  >
                                    <div className="card-body p-3">
                                      <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                          <h6 className="mb-1" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                            <i className="bi bi-clock me-1"></i>
                                            {slot.startTime} - {slot.endTime}
                                          </h6>
                                        </div>
                                        {isSelected && (
                                          <i className="bi bi-check-circle-fill text-primary"></i>
                                        )}
                                      </div>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className={`badge bg-${getSlotColor()} badge-sm`}>
                                          {availableSlots > 0 ? `${availableSlots} còn trống` : 'Hết chỗ'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {selectedSlot && (
                          <div className="alert alert-info mt-2 mb-0 py-2">
                            <small>
                              <i className="bi bi-info-circle me-1"></i>
                              Đã chọn: <strong>{selectedSlot.startTime} - {selectedSlot.endTime}</strong>
                            </small>
                          </div>
                        )}
                      </div>

                      {/* Service Selection */}
                      <h5 className="mb-3" style={{ fontWeight: 600 }}>Chọn dịch vụ</h5>
                      <div className="mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {services.map(service => (
                          <div key={service.serviceId} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="service-type"
                              id={`service-${service.serviceId}`}
                              value={service.serviceId}
                            />
                            <label className="form-check-label" htmlFor={`service-${service.serviceId}`}>
                              {service.serviceName} - {service.basePrice?.toLocaleString('vi-VN')} VNĐ
                            </label>
                          </div>
                        ))}
                        {services.length === 0 && !loading && (
                          <small className="text-danger">Không có dịch vụ khả dụng</small>
                        )}
                      </div>

                      {/* Notes */}
                      <h5 className="mb-3" style={{ fontWeight: 600 }}>Ghi chú</h5>
                      <div className="mb-4">
                        <textarea
                          className="form-control"
                          id="notes"
                          rows="3"
                          placeholder="Ghi chú thêm về yêu cầu của bạn..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-center mt-3">
                    <FancyButton
                      type="submit"
                      variant="dark"
                      style={{ minWidth: '180px' }}
                      disabled={loading || vehicles.length === 0 || !ageValidation.isValid}
                    >
                      {loading ? 'Đang xử lý...' : 'Đặt lịch ngay'}
                    </FancyButton>
                  </div>
                </form>
                {bookingMessage && (
                  <p id="booking-message" className="text-center" style={{ marginTop: '1rem', fontWeight: 500, color: 'red' }}>
                    {bookingMessage}
                  </p>
                )}
                {showPayButton && (
                  <div className="d-flex justify-content-center mt-3">
                    <FancyButton
                      id="pay-button"
                      variant="dark"
                      style={{ minWidth: '250px' }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Thanh toán dịch vụ
                    </FancyButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5 className="mb-3" style={{ fontWeight: 600 }}>Điều hướng</h5>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link className="nav-link" to="/home">TRANG CHỦ</Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">DỊCH VỤ</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">BLOG</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">GIỚI THIỆU</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">LIÊN HỆ</a>
                </li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="mb-3" style={{ fontWeight: 600 }}>Liên hệ</h5>
              <div className="contact-info">
                <p><i className="fas fa-map-marker-alt"></i> 160 Lã Xuân Oai, TP. Hồ Chí Minh, Việt Nam</p>
                <p><i className="fas fa-phone"></i> +84 334 171 139</p>
                <p><i className="fas fa-envelope"></i> support@tesla.vn</p>
              </div>
            </div>
            <div className="col-md-4">
              <h5 className="mb-3" style={{ fontWeight: 600 }}>Kết nối với chúng tôi</h5>
              <div className="social-icons">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Tesla Việt Nam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ScheduleService;
