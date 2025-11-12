// src/pages/Home.jsx - UPDATED WITH USER MENU AND NOTIFICATIONS
import React from 'react';
import { Link } from 'react-router-dom';
import GlobalNavbar from '../components/GlobalNavbar';
import FancyButton from '../components/FancyButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css'; // Import CSS file

const Home = () => {
  return (
    <>
      <GlobalNavbar />

      {/* Carousel */}
      <div id="carouselExampleAutoplaying" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="10000">
        <div className="carousel-inner">
          <div className="carousel-item active" data-bs-interval="10000">
            <img
              src="https://www.reuters.com/resizer/v2/O2JH3CKXTZMY5FRVALTHVZI3WA.jpg?auth=9e3d2c9df7e8afdba0b1fee35f6ef89db69c61827e0820130589ebafb75686d5&width=5588&quality=80"
              className="d-block w-100"
              alt="Tesla Model Y"
            />
          </div>
          <div className="carousel-item" data-bs-interval="10000">
            <img
              src="http://www.shop4tesla.com/cdn/shop/articles/1roadi_42f236a7-c4fe-465f-bc7b-1377b0ce2d66.png?v=1740472787"
              className="d-block w-100"
              alt="Tesla Model Y"
            />
          </div>
          <div className="carousel-item" data-bs-interval="10000">
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
                  <Link to="/my-appointments" style={{ textDecoration: 'none' }}>
                    <FancyButton variant="dark">Đặt thông báo</FancyButton>
                  </Link>
                </div>
              </div>
              <div className="product-card">
                <img
                  style={{ borderRadius: '3%', height: '15rem' }}
                  src="https://t3.ftcdn.net/jpg/14/86/38/84/360_F_1486388425_sXVqCwK96IDhdu0XEnG0IXF5lzSSfWfr.jpg"
                  alt="Đặt lịch dịch vụ"
                  className="img-fluid"
                />
                <div className="card-body text-center mt-3">
                  <h5 className="product-title mb-3" style={{ fontWeight: 600 }}>Đặt lịch dịch vụ</h5>
                  <Link to="/schedule-service" style={{ textDecoration: 'none' }}>
                    <FancyButton variant="dark">Đặt lịch ngay</FancyButton>
                  </Link>
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
                  </p>
                  <Link to="/products/individual" style={{ textDecoration: 'none' }}>
                    <FancyButton variant="dark" style={{ marginTop: '0%' }}>
                      Xem tất cả dịch vụ
                    </FancyButton>
                  </Link>
                </div>
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

export default Home;
