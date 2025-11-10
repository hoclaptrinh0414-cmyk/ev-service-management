// src/pages/customer/ProductIndividual.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Home.css';
import './ProductIndividual.css';

// All products - Real services from database
const allProducts = [
  {
    id: 1,
    name: 'Bảo dưỡng 10,000 km',
    category: 'Bảo dưỡng định kỳ',
    price: 600000,
    laborCost: 250000,
    standardTime: 90,
    description: 'Updated description - Kiểm tra hệ thống phanh, thay dầu động cơ và kiểm tra hiệu suất',
    image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800',
    badge: 'New'
  },
  {
    id: 2,
    name: 'Bảo dưỡng 20,000 km',
    category: 'Bảo dưỡng định kỳ',
    price: 1200000,
    laborCost: 400000,
    standardTime: 120,
    description: 'Bảo dưỡng định kỳ toàn diện: kiểm tra hệ thống phanh, thay dầu, kiểm tra pin',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    badge: 'Best'
  },
  {
    id: 3,
    name: 'Kiểm tra động cơ pin',
    category: 'Kiểm tra chuyên sâu',
    price: 300000,
    laborCost: 150000,
    standardTime: 45,
    description: 'Chẩn đoán và kiểm tra tình trạng pin, kiểm tra dung dịch và hiệu suất',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    badge: null
  },
  {
    id: 4,
    name: 'Bảo dưỡng hệ thống làm mát pin',
    category: 'Hệ thống làm mát',
    price: 1500000,
    laborCost: 500000,
    standardTime: 90,
    description: 'Vệ sinh và kiểm tra hệ thống làm mát pin, thay dung dịch làm mát',
    image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800',
    badge: 'New'
  },
  {
    id: 5,
    name: 'Kiểm tra động cơ điện',
    category: 'Động cơ điện',
    price: 800000,
    laborCost: 300000,
    standardTime: 60,
    description: 'Chẩn đoán và kiểm tra hiệu suất động cơ điện',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    badge: null
  },
  {
    id: 6,
    name: 'Kiểm tra hệ thống phanh',
    category: 'Hệ thống phanh',
    price: 200000,
    laborCost: 100000,
    standardTime: 30,
    description: 'Kiểm tra má phanh, đĩa phanh, dầu phanh',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    badge: null
  },
  {
    id: 7,
    name: 'Thay má phanh trước',
    category: 'Hệ thống phanh',
    price: 1500000,
    laborCost: 300000,
    standardTime: 60,
    description: 'Thay má phanh trước, kiểm tra đĩa phanh',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
    badge: null
  },
  {
    id: 8,
    name: 'Cân chỉnh và xoay lốp',
    category: 'Lốp xe',
    price: 400000,
    laborCost: 150000,
    standardTime: 45,
    description: 'Thay chỉnh và cân bằng, xoay vị trí lốp',
    image: 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=800',
    badge: null
  },
  {
    id: 9,
    name: 'Thay lốp xe',
    category: 'Lốp xe',
    price: 200000,
    laborCost: 200000,
    standardTime: 30,
    description: 'Thay lốp mới, cân bằng lốp (giá chưa bao gồm lốp)',
    image: 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=800',
    badge: null
  },
  {
    id: 10,
    name: 'Bảo dưỡng điều hòa',
    category: 'Điều hòa',
    price: 1200000,
    laborCost: 400000,
    standardTime: 90,
    description: 'Vệ sinh đàn lạnh, thay lọc gió điều hòa, nạp gas',
    image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=800',
    badge: null
  },
  {
    id: 11,
    name: 'Chẩn đoán tổng quát',
    category: 'Chẩn đoán',
    price: 500000,
    laborCost: 300000,
    standardTime: 60,
    description: 'Chẩn đoán toàn bộ hệ thống xe bằng máy chuyên dụng',
    image: 'https://images.unsplash.com/photo-1563584697-1994a7d9bb0f?w=800',
    badge: 'Best'
  },
  {
    id: 12,
    name: 'Kiểm tra định kỳ hằng năm',
    category: 'Kiểm tra định kỳ',
    price: 800000,
    laborCost: 400000,
    standardTime: 120,
    description: 'Kiểm toàn diện theo quy định nhà sản xuất',
    image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800',
    badge: null
  },
  {
    id: 13,
    name: 'Cập nhật phần mềm hệ thống',
    category: 'Phần mềm',
    price: 1000000,
    laborCost: 500000,
    standardTime: 90,
    description: 'Cập nhật firmware, phần mềm điều khiển xe',
    image: 'https://images.unsplash.com/photo-1563584697-1994a7d9bb0f?w=800',
    badge: 'New'
  }
];

const ProductIndividual = () => {
  const navigate = useNavigate();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [currentBottomIndex, setCurrentBottomIndex] = useState(0);

  // Auto carousel for hero section (4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % allProducts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Manual carousel controls for bottom section
  const handlePrevBottom = () => {
    setCurrentBottomIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, allProducts.length - 3)));
  };

  const handleNextBottom = () => {
    setCurrentBottomIndex((prev) => (prev < allProducts.length - 3 ? prev + 1 : 0));
  };

  const currentHeroProduct = allProducts[currentHeroIndex];
  const bottomProducts = allProducts.slice(currentBottomIndex, currentBottomIndex + 3);

  // Ensure we always have 3 products (loop back if needed)
  while (bottomProducts.length < 3 && allProducts.length >= 3) {
    bottomProducts.push(allProducts[bottomProducts.length % allProducts.length]);
  }

  return (
      <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg static-navbar-custom">
        <div className="container-fluid top-navbar-container">
          <div className="navbar-col-left">
            <Link className="navbar-brand-minimal logo-text" to="/home">
              T&N
            </Link>
          </div>

          <div className="d-none d-lg-block navbar-col-center">
            <ul className="navbar-nav main-menu-minimal">
              <li className="nav-item"><Link className="nav-link move" to="/services">SERVICES</Link></li>
              <li className="nav-item"><a className="nav-link move" href="#">BLOG</a></li>
              <li className="nav-item"><a className="nav-link move" href="#">ABOUT</a></li>
              <li className="nav-item"><a className="nav-link move" href="#">CONTACT</a></li>
            </ul>
          </div>

          <div className="nav-icons-minimal navbar-col-right d-flex align-items-center">
            <UserMenu />
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto text-center d-lg-none">
              <li className="nav-item"><Link className="nav-link move" to="/services">SERVICES</Link></li>
              <li className="nav-item"><a className="nav-link move" href="#">BLOG</a></li>
              <li className="nav-item"><a className="nav-link move" href="#">ABOUT</a></li>
              <li className="nav-item"><a className="nav-link move" href="#">CONTACT</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="product-page-container">
        {/* Hero Carousel Section */}
        <div className="hero-carousel-section">
          <div className="hero-content-wrapper">
            {/* Left: Product Info */}
            <div className="hero-left">
              <p className="hero-category">{currentHeroProduct.category}</p>
              <h1 className="hero-title">{currentHeroProduct.name}</h1>
              <p className="hero-description">{currentHeroProduct.description}</p>
              <div className="hero-price-info">
                <p className="hero-price">{currentHeroProduct.price.toLocaleString()} VNĐ</p>
                <p className="hero-time"><i className="bi bi-clock"></i> {currentHeroProduct.standardTime} phút</p>
              </div>
              <button className="customize-btn">Đặt lịch ngay</button>

              {/* Carousel Dots */}
              <div className="carousel-dots">
                {allProducts.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentHeroIndex ? 'active' : ''}`}
                    onClick={() => setCurrentHeroIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Right: Product Image */}
            <div className="hero-right">
              {currentHeroProduct.badge && (
                <span className={`hero-badge ${currentHeroProduct.badge.toLowerCase()}`}>
                  {currentHeroProduct.badge}
                </span>
              )}
              <img
                src={currentHeroProduct.image}
                alt={currentHeroProduct.name}
                className="hero-image"
              />
            </div>
          </div>
        </div>

        {/* Bottom Carousel Section - 3 Products */}
        <div className="bottom-carousel-section">
          <h3 className="section-subtitle">SHOW ALL PRODUCTS</h3>

          <div className="bottom-carousel-wrapper">
            {/* Previous Button */}
            <button className="carousel-nav-btn prev-btn" onClick={handlePrevBottom}>
              <i className="bi bi-chevron-left"></i>
            </button>

            {/* 3 Product Cards */}
            <div className="bottom-products-grid">
              {bottomProducts.map((product, index) => (
                <div key={`${product.id}-${index}`} className="bottom-product-card">
                  {product.badge && (
                    <span className={`product-badge ${product.badge.toLowerCase()}`}>
                      {product.badge}
                    </span>
                  )}
                  {/* First Content - Hiển thị khi chưa hover */}
                  <div className="first-content">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="bottom-product-image"
                    />
                    <h4 className="bottom-product-name">{product.name}</h4>
                  </div>

                  {/* Second Content - Hiển thị khi hover */}
                  <div className="second-content">
                    <h4 className="second-product-name">{product.name}</h4>
                    <p className="bottom-product-category">{product.category}</p>
                    <p className="bottom-product-price">{product.price.toLocaleString()} VNĐ</p>
                    <p className="service-time">
                      <i className="bi bi-clock-history"></i> {product.standardTime} phút
                    </p>
                    <p className="bottom-product-description">{product.description}</p>
                    <button className="view-details-btn">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <button className="carousel-nav-btn next-btn" onClick={handleNextBottom}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductIndividual;
