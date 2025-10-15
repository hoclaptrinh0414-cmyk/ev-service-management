// src/pages/Home.jsx - UPDATED WITH USER MENU
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css'; // Import CSS file

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
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
                    <li><Link className="dropdown-item" to="/track-reminder">Theo dõi & Nhắc nhở</Link></li>
                    <li><Link className="dropdown-item" to="/schedule-service">Đặt lịch dịch vụ</Link></li>
                    <li><a className="dropdown-item" href="#">Quản lý chi phí</a></li>
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

      {/* Product Section */}
      <section className="product-section">
        <div className="container">
          <div className="row align-items-stretch">
            {/* Bên trái: 2 card xếp dọc */}
            <div className="col-md-6 d-flex flex-column">
              <div className="product-card mb-3">
                <img
                  style={{ borderRadius: '3%', height: '15rem' }}
                  src="https://www.shutterstock.com/shutterstock/videos/1040823482/thumb/1.jpg?ip=x480"
                  alt="Theo dõi & Nhắc nhở"
                  className="img-fluid"
                />
                <div className="card-body text-center mt-3">
                  <h5 style={{ fontWeight: 600 }} className="product-title mb-3">Theo dõi & Nhắc nhở</h5>
                  <p style={{ fontWeight: 400 }}>
                    Nhắc nhở bảo dưỡng định kỳ theo km hoặc thời gian
                    và thanh toán gói bảo dưỡng định kỳ hoặc gia hạn gói dịch vụ.
                  </p>
                  <Link to="/track-reminder" className="btn btn-buy">Đặt lịch ngay</Link>
                </div>
              </div>
              <div className="product-card">
                <img
                  style={{ borderRadius: '3%' }}
                  src="https://t3.ftcdn.net/jpg/14/86/38/84/360_F_1486388425_sXVqCwK96IDhdu0XEnG0IXF5lzSSfWfr.jpg"
                  alt="Đặt lịch dịch vụ"
                  className="img-fluid"
                />
                <div className="card-body text-center mt-3">
                  <h5 className="product-title mb-3" style={{ fontSize: 600 }}>Đặt lịch dịch vụ</h5>
                  <p style={{ marginTop: '7%', marginBottom: '10%', fontWeight: 400 }}>
                    Nhanh chóng - Tiện lợi - Uy tín
                  </p>
                  <Link to="/schedule-service" className="btn btn-buy">Đặt lịch</Link>
                </div>
              </div>
            </div>

            {/* Bên phải: 1 card */}
            <div className="col-md-6 d-flex">
              <div className="product-card w-100">
                <img
                  style={{ borderRadius: '3%' }}
                  src="https://www.tesla-mag.com/wp-content/uploads/sites/2/2024/07/Next-gen-Model-S.jpeg"
                  alt="Quản lý hồ sơ & chi phí"
                  className="img-fluid"
                />
                <div className="card-body text-center" style={{ margin: '25% 0' }}>
                  <h5 className="card-title mt-4">Quản lý hồ sơ & chi phí</h5>
                  <p style={{
                    marginTop: '7%',
                    marginBottom: '10%',
                    fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
                  }}>
                    <ul style={{ listStyle: 'none' }}>
                      <li style={{ fontWeight: 400 }}>
                        Lưu lịch sử bảo dưỡng xe điện.
                      </li>
                      <li style={{ fontWeight: 400 }}>
                        Quản lý chi phí bảo dưỡng & sửa chữa theo từng lần.
                      </li>
                      <li style={{ fontWeight: 400 }}>
                        Thanh toán online (e-wallet, banking, ...).
                      </li>
                    </ul>
                  </p>
                  <a style={{ marginTop: '20%' }} href="#" className="btn btn-buy">Xem tất cả dịch vụ</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;