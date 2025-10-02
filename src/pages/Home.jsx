// src/pages/Home.jsx - FIXED - COPY TOÀN BỘ FILE NÀY
import React, { useState, useEffect } from 'react';
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

            <a style={{ fontSize: '2rem' }} className="navbar-brand" href="#">
              Tesla
            </a>

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

          <div className="bottom-navbar">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav w-100 justify-content-center">
                <li className="nav-item">
                  <a className="nav-link move" href="#">TRANG CHỦ</a>
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
                  <a href="#" className="btn btn-buy">Choose</a>
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
                  <a href="#" className="btn btn-buy">Choose</a>
                </div>
              </div>
            </div>

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
                  <p style={{
                    marginTop: '7%',
                    marginBottom: '10%',
                    fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
                  }}>
                    The Tesla Model S is a premium all-electric sedan that combines cutting-edge performance, advanced
                    technology, and timeless design. Known for its impressive acceleration and long driving range, the
                    Model S redefines what a luxury electric vehicle can be.
                  </p>
                  <a href="#" className="btn btn-buy">Choose</a>
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