// src/pages/ScheduleService.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import appointmentService from '../services/appointmentService';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css';

const ScheduleService = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [showPayButton, setShowPayButton] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data from API
  const [vehicles, setVehicles] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  let lastScrollY = 0;

  // Load initial data
  useEffect(() => {
    loadInitialData();
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

      setVehicles(vehiclesRes.data || []);
      setServiceCenters(centersRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setBookingMessage('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Load time slots when center and date change
  const handleCenterOrDateChange = async (centerId, date) => {
    if (!centerId || !date) return;

    try {
      setLoading(true);
      const slotsRes = await appointmentService.getAvailableSlots(centerId, date);
      setTimeSlots(slotsRes.data || []);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBookingMessage('');

    try {
      // Get form values
      const vehicleId = document.getElementById('vehicle').value;
      const serviceCenterId = document.getElementById('service-center').value;
      const slotId = document.getElementById('time-slot').value;
      const serviceIds = Array.from(document.querySelectorAll('input[name="service-type"]:checked'))
        .map(el => parseInt(el.value));
      const customerNotes = document.getElementById('notes')?.value || '';

      // Get customer ID from localStorage (set during login)
      const customerId = JSON.parse(localStorage.getItem('user'))?.customerId;

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

        // Reset form
        e.target.reset();
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
      <nav className={`navbar navbar-expand-lg navbar-custom ${scrolled ? 'scrolled' : ''} ${hidden ? 'hidden' : ''}`}>
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
              <a href="#" className="nav-link move">
                <i className="fas fa-shopping-cart"></i>
                <span>Giỏ hàng</span>
                <span className="cart-badge">0</span>
              </a>
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
                    <li><a className="dropdown-item" href="#">Lưu lịch sử bảo dưỡng</a></li>
                    <li><a className="dropdown-item" href="#">Quản lý chi phí bảo dưỡng & sửa chữa</a></li>
                    <li><a className="dropdown-item" href="#">Thanh toán online</a></li>
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

      {/* Carousel */}
      <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="https://www.reuters.com/resizer/v2/O2JH3CKXTZMY5FRVALTHVZI3WA.jpg?auth=9e3d2c9df7e8afdba0b1fee35f6ef89db69c61827e0820130589ebafb75686d5&width=5588&quality=80"
              className="d-block w-100"
              alt="Tesla Model Y"
            />
          </div>
          <div className="carousel-item">
            <img
              src="http://www.shop4tesla.com/cdn/shop/articles/1roadi_42f236a7-c4fe-465f-bc7b-1377b0ce2d66.png?v=1740472787"
              className="d-block w-100"
              alt="Tesla Model Y"
            />
          </div>
          <div className="carousel-item">
            <img
              src="https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1500w,f_auto,q_auto:best/rockcms/2025-02/250213-Cybertruck-aa-1045-dd55f3.jpg"
              className="d-block w-100"
              alt="Tesla Cybertruck"
            />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Booking Section */}
      <section className="booking-section">
        <div className="container">
          <h2 className="text-center mb-4 content-title">Đặt Lịch Dịch Vụ</h2>
          <p className="text-center mb-5 content-text">
            Đặt lịch bảo dưỡng hoặc sửa chữa trực tuyến, chọn trung tâm dịch vụ và nhận xác nhận nhanh chóng.
          </p>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="booking-card">
                <form id="booking-form" onSubmit={handleSubmit}>
                  {loading && <div className="alert alert-info">Đang tải dữ liệu...</div>}

                  {/* Vehicle Selection */}
                  <h5 className="mb-3" style={{ fontWeight: 600 }}>Chọn xe</h5>
                  <div className="mb-3">
                    <label htmlFor="vehicle" className="form-label">Xe của bạn</label>
                    <select className="form-select" id="vehicle" required disabled={loading || vehicles.length === 0}>
                      <option value="">Chọn xe</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                          {vehicle.licensePlate} - {vehicle.modelName}
                        </option>
                      ))}
                    </select>
                    {vehicles.length === 0 && !loading && (
                      <small className="text-danger">Bạn chưa đăng ký xe. Vui lòng đăng ký xe trước.</small>
                    )}
                  </div>

                  {/* Service Center Selection */}
                  <h5 className="mb-3" style={{ fontWeight: 600 }}>Trung tâm dịch vụ</h5>
                  <div className="mb-3">
                    <label htmlFor="service-center" className="form-label">Chọn trung tâm</label>
                    <select
                      className="form-select"
                      id="service-center"
                      required
                      disabled={loading}
                      onChange={(e) => {
                        setSelectedCenter(e.target.value);
                        if (selectedDate) {
                          handleCenterOrDateChange(e.target.value, selectedDate);
                        }
                      }}
                    >
                      <option value="">Chọn trung tâm dịch vụ</option>
                      {serviceCenters.map(center => (
                        <option key={center.centerId} value={center.centerId}>
                          {center.centerName} - {center.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selection */}
                  <h5 className="mb-3" style={{ fontWeight: 600 }}>Chọn ngày & giờ</h5>
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">Ngày đặt lịch</label>
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

                  {/* Time Slot Selection */}
                  <div className="mb-3">
                    <label htmlFor="time-slot" className="form-label">Khung giờ</label>
                    <select
                      className="form-select"
                      id="time-slot"
                      required
                      disabled={timeSlots.length === 0 || loading}
                    >
                      <option value="">Chọn khung giờ</option>
                      {timeSlots.map(slot => (
                        <option key={slot.slotId} value={slot.slotId}>
                          {slot.startTime} - {slot.endTime} ({slot.availableSlots} slots còn trống)
                        </option>
                      ))}
                    </select>
                    {timeSlots.length === 0 && selectedCenter && selectedDate && (
                      <small className="text-warning">Không có khung giờ trống cho ngày này</small>
                    )}
                  </div>

                  {/* Service Selection */}
                  <h5 className="mb-3" style={{ fontWeight: 600 }}>Chọn dịch vụ</h5>
                  <div className="mb-3">
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
                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Ghi chú (tùy chọn)</label>
                    <textarea
                      className="form-control"
                      id="notes"
                      rows="3"
                      placeholder="Ghi chú thêm về yêu cầu của bạn..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-submit w-100"
                    disabled={loading || vehicles.length === 0}
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt lịch'}
                  </button>
                </form>
                {bookingMessage && (
                  <p id="booking-message" className="text-center" style={{ marginTop: '1rem', fontWeight: 500, color: 'red' }}>
                    {bookingMessage}
                  </p>
                )}
                {showPayButton && (
                  <a
                    href="#"
                    id="pay-button"
                    className="btn btn-pay w-100 mt-3"
                    style={{ display: 'block', background: '#dc3545', color: 'white' }}
                  >
                    Thanh toán dịch vụ
                  </a>
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
