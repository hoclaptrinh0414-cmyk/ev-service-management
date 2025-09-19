// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // If needed, but using Font Awesome here
import '@fortawesome/fontawesome-free/css/all.min.css'; // For Font Awesome

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
          {/* Top row: Search, Logo, Account/Cart */}
          <div className="d-flex justify-content-between align-items-center w-100 top-navbar">
            {/* Search Form */}
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

            {/* Brand/Logo */}
            <a style={{ fontSize: '2rem' }} className="navbar-brand" href="#">
              Tesla
            </a>

            {/* User Account & Cart */}
            <div className="nav-icons d-flex align-items-center">
              <a href="#" className="nav-link move">
                <i className="fas fa-user"></i>
                <span>Tài khoản</span>
              </a>
              <a href="#" className="nav-link move">
                <i className="fas fa-shopping-cart"></i>
                <span>Giỏ hàng</span>
                <span className="cart-badge">0</span>
              </a>
            </div>
          </div>

          {/* Bottom row: Navigation Menu */}
          <div className="bottom-navbar">
            {/* Toggle button for mobile */}
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Navigation Links */}
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav w-100 justify-content-center">
                <li className="nav-item">
                  <a className="nav-link move" href="#">
                    TRANG CHỦ
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle move" href="#" role="button" data-bs-toggle="dropdown">
                    BỘ SƯU TẬP
                  </a>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#">Xe đạp thể thao</a></li>
                    <li><a className="dropdown-item" href="#">Xe đạp địa hình</a></li>
                    <li><a className="dropdown-item" href="#">Xe đạp đường phố</a></li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle move" href="#" role="button" data-bs-toggle="dropdown">
                    PRODUCT VIEW
                  </a>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#">Tất cả sản phẩm</a></li>
                    <li><a className="dropdown-item" href="#">Sản phẩm mới</a></li>
                    <li><a className="dropdown-item" href="#">Khuyến mãi</a></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">
                    BLOG
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">
                    GIỚI THIỆU
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link move" href="#">
                    LIÊN HỆ
                  </a>
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
                  style={{ borderRadius: '3%' }}
                  src="https://etimg.etb2bimg.com/photo/121247133.cms"
                  alt="Product 1"
                  className="img-fluid"
                />
                <div className="card-body text-center mt-3">
                  <h5 className="product-title mb-3">Cybertruck</h5>
                  <a href="#" className="btn btn-buy">
                    Choose
                  </a>
                </div>
              </div>
              <div className="product-card">
                <img
                  style={{ borderRadius: '3%' }}
                  src="https://static.automotor.vn/images/upload/2024/06/09/tesla-trung-quoc-vneconomyautomotive3.jpg"
                  alt="Product 1"
                  className="img-fluid"
                />
                <div className="card-body text-center mt-3">
                  <h5 className="product-title mb-3">Tesla Model 3</h5>
                  <a href="#" className="btn btn-buy">
                    Choose
                  </a>
                </div>
              </div>
            </div>

            {/* Bên phải: 1 card */}
            <div className="col-md-6 d-flex">
              <div className="product-card w-100">
                <img
                  style={{ borderRadius: '3%' }}
                  src="https://www.tesla-mag.com/wp-content/uploads/sites/2/2024/07/Next-gen-Model-S.jpeg"
                  alt="Product 2"
                  className="img-fluid"
                />
                <div className="card-body text-center">
                  <h5 className="card-title mt-4">Tesla Model S</h5>
                  <p
                    style={{
                      marginTop: '7%',
                      marginBottom: '10%',
                      fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
                    }}
                  >
                    The Tesla Model S is a premium all-electric sedan that combines cutting-edge performance, advanced
                    technology, and timeless design. Known for its impressive acceleration and long driving range, the
                    Model S redefines what a luxury electric vehicle can be. With a minimalist interior, an expansive
                    touchscreen interface, and over-the-air software updates, it offers drivers a seamless and futuristic
                    experience. The Model S represents Tesla’s commitment to sustainability while delivering
                    uncompromising comfort and innovation.
                  </p>
                  <a href="#" className="btn btn-buy">
                    Choose
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Reset margin và padding của body */
        body {
          margin: 0;
          padding: 0;
        }

        /* Navbar styles - Base transparent state */
        .navbar-custom {
          background: transparent;
          transition: all 0.4s ease;
          padding: 0.8rem 0;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          transform: translateY(0);
          /* Default position */
        }

        /* Navbar khi scroll qua carousel - giống như hover */
        .navbar-custom.scrolled {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        /* Navbar khi hover (giữ nguyên để vẫn có hover effect) */
        .navbar-custom:hover {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        /* Navbar hidden state */
        .navbar-custom.hidden {
          transform: translateY(-100%);
          /* Slide up out of view */
        }

        /* Top row styling */
        .top-navbar {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.8rem;
          margin-bottom: 0.8rem;
        }

        .navbar-custom:hover .top-navbar,
        .navbar-custom.scrolled .top-navbar {
          border-bottom-color: rgba(0, 0, 0, 0.1);
        }

        /* Bottom row - force menu to new line */
        .bottom-navbar {
          width: 100%;
        }

        .bottom-navbar .navbar-nav {
          margin: 0;
        }

        /* Brand/Logo */
        .navbar-brand {
          font-size: 1.4rem;
          font-weight: 600;
          letter-spacing: 1px;
          color: white;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .navbar-custom:hover .navbar-brand,
        .navbar-custom.scrolled .navbar-brand {
          color: #333;
          text-shadow: none;
        }

        /* Nav links - BUỘC màu trắng khi KHÔNG hover navbar */
        .navbar-custom .navbar-nav .nav-link,
        .navbar-custom .nav-icons .nav-link {
          color: #fff !important;
          font-weight: 400;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          margin: 0 0.3rem;
          padding: 0.4rem 0.8rem;
          border-radius: 3px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
          text-decoration: none;
          text-transform: uppercase;
        }

        .navbar-custom:hover .navbar-nav .nav-link,
        .navbar-custom:hover .nav-icons .nav-link,
        .navbar-custom.scrolled .navbar-nav .nav-link,
        .navbar-custom.scrolled .nav-icons .nav-link {
          color: #000 !important;
          text-shadow: none;
        }

        /* Hover effect for .move links in the bottom navbar (menu items only) */
        .bottom-navbar .navbar-nav .nav-link.move:hover,
        .bottom-navbar .navbar-nav .nav-link.dropdown-toggle.move:hover {
          color: white !important;
          background-color: black !important;
        }

        /* Search form */
        .search-form {
          position: relative;
        }

        .search-input {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 20px;
          padding: 0.4rem 2.2rem 0.4rem 0.9rem;
          width: 220px;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .navbar-custom:hover .search-input,
        .navbar-custom.scrolled .search-input {
          background: rgba(248, 249, 250, 0.9);
          border-color: #dee2e6;
          color: #333;
        }

        .navbar-custom:hover .search-input::placeholder,
        .navbar-custom.scrolled .search-input::placeholder {
          color: #6c757d;
        }

        .search-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .navbar-custom:hover .search-btn,
        .navbar-custom.scrolled .search-btn {
          color: #6c757d;
        }

        /* User account and cart */
        .nav-icons .nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          padding: 0.4rem 0.6rem;
        }

        .nav-icons .nav-link i {
          font-size: 1rem;
        }

        .img-fluid {
          transition: transform 0.5s ease-in-out;
        }

        .img-fluid:hover {
          transform: scale(1.08);
        }

        .cart-badge {
          background: #dc3545;
          color: white;
          border-radius: 50%;
          padding: 0.2rem 0.5rem;
          font-size: 0.8rem;
          min-width: 20px;
          text-align: center;
        }

        /* Dropdown menu */
        .dropdown-menu {
          border: none;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        /* Carousel styles - Full screen từ đầu, navbar overlay */
        .carousel {
          margin-top: 0;
          /* Bỏ margin để ảnh bắt đầu từ top */
        }

        .carousel-item img {
          height: 100vh;
          /* Full viewport height */
          object-fit: cover;
        }

        /* Product section styles */
        .product-section {
          padding: 4rem 0;
          background: #f8f9fa;
        }

        .product-card {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          height: 100%;
          position: relative;
          transition: transform 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
        }

        .product-badge {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #d4a574;
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .product-price {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .product-image {
          width: 100%;
          height: 200px;
          object-fit: contain;
          margin-bottom: 1.5rem;
        }

        .product-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .product-category {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .btn-buy {
          background: #000;
          border: 1px solid #dee2e6;
          color: white;
          padding: 0.6rem 2rem;
          border-radius: 5px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .btn-buy:hover {
          background: #333;
          color: white;
          border-color: #d4a574;
          transform: scale(1.1);
        }

        .content-section {
          background: white;
          padding: 4rem 0;
        }

        .content-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #666;
        }

        .content-title {
          font-size: 2.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .content-subtitle {
          color: #d4a574;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .content-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default Home;