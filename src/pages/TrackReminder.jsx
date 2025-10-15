// src/pages/TrackReminder.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css';

const TrackReminder = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [showPayButton, setShowPayButton] = useState(false);
  let lastScrollY = 0;

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const packageType = document.getElementById('package').value;
    const lastMaintenance = document.getElementById('last-maintenance').value;

    // Calculate next maintenance date (4 months from last maintenance)
    const lastDate = new Date(lastMaintenance);
    const nextDate = new Date(lastDate);
    nextDate.setMonth(lastDate.getMonth() + 4);

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedNextDate = nextDate.toLocaleDateString('vi-VN', options);

    // Display reminder message
    setReminderMessage(
      `Chào ${name}, bạn sẽ nhận được nhắc nhở bảo dưỡng vào ngày ${formattedNextDate} cho gói ${packageType}.`
    );

    // Show payment button
    setShowPayButton(true);

    // Simulate storing data (in a real app, send to backend)
    console.log({
      name,
      email,
      phone,
      package: packageType,
      lastMaintenance,
      nextMaintenance: formattedNextDate,
    });
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

      {/* Track and Reminder Section */}
      <section className="track-section">
        <div className="container">
          <h2 className="text-center mb-4 content-title">Theo Dõi Xe & Nhắc Nhở Bảo Dưỡng</h2>
          <p className="text-center mb-5 content-text">
            Đăng ký để nhận nhắc nhở bảo dưỡng định kỳ mỗi 4 tháng và quản lý gói dịch vụ của bạn.
          </p>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="track-card">
                <form id="track-form" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Tên</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Nhập tên của bạn"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Nhập email của bạn"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      placeholder="Nhập số điện thoại"
                      required
                      pattern="[0-9]{10}"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="package" className="form-label">Gói dịch vụ</label>
                    <select className="form-select" id="package" required>
                      <option value="" disabled>Chọn gói dịch vụ</option>
                      <option value="Cơ bản">Cơ bản</option>
                      <option value="Tiêu chuẩn">Tiêu chuẩn</option>
                      <option value="Cao cấp">Cao cấp</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="last-maintenance" className="form-label">Ngày bảo dưỡng gần nhất</label>
                    <input type="date" className="form-control" id="last-maintenance" required />
                  </div>
                  <button type="submit" className="btn btn-submit w-100">Đăng ký nhắc nhở</button>
                </form>
                {reminderMessage && (
                  <p id="reminder-message" className="text-center" style={{ marginTop: '1rem', fontWeight: 500, color: 'red' }}>
                    {reminderMessage}
                  </p>
                )}
                {showPayButton && (
                  <a
                    href="#"
                    id="pay-button"
                    className="btn btn-pay w-100 mt-3"
                    style={{ display: 'block', background: 'black', color: 'white' }}
                  >
                    Thanh toán gói dịch vụ
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

export default TrackReminder;
