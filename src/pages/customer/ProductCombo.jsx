// src/pages/customer/ProductCombo.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';
import productService from '../../services/productService';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Home.css';
import './ProductCombo.css';

// Real combo packages from database
const combosPage1 = [
  {
    id: 1,
    name: 'Gói Bảo Dưỡng Cơ Bản',
    category: 'Gói cơ bản - 365 ngày',
    price: 2000000,
    validityPeriod: 365,
    validityMileage: 10000,
    description: 'Gói bảo dưỡng định kỳ dành cho xe điện, bao gồm kiểm tra hệ thống, bảo dưỡng pin',
    image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
    badge: 'New'
  },
  {
    id: 2,
    name: 'Gói Bảo Dưỡng Cao Cấp',
    category: 'Gói cao cấp - 365 ngày',
    price: 4500000,
    validityPeriod: 365,
    validityMileage: 15000,
    description: 'Gói bảo dưỡng toàn diện với các dịch vụ chuyên sâu, ưu tiên phục vụ',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
    badge: 'Best'
  },
  {
    id: 3,
    name: 'Gói Bảo Dưỡng VIP',
    category: 'Gói VIP - 730 ngày',
    price: 8000000,
    validityPeriod: 730,
    validityMileage: 30000,
    description: 'Gói bảo dưỡng cao cấp nhất, ưu tiên phục vụ, bảo dưỡng không giới hạn',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    badge: 'Best'
  },
  {
    id: 4,
    name: 'Gói Kiểm Tra Pin Toàn Diện',
    category: 'Gói chuyên biệt - 180 ngày',
    price: 1500000,
    validityPeriod: 180,
    validityMileage: 5000,
    description: 'Chuyên sâu về pin: kiểm tra, bảo dưỡng, tối ưu hóa hiệu suất pin',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    badge: null
  },
  {
    id: 5,
    name: 'Gói Bảo Dưỡng Hệ Thống Phanh',
    category: 'Gói an toàn - 365 ngày',
    price: 2500000,
    validityPeriod: 365,
    validityMileage: 12000,
    description: 'Tập trung vào hệ thống phanh: kiểm tra, thay thế, bảo dưỡng định kỳ',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
    badge: 'New'
  },
  {
    id: 6,
    name: 'Gói Chăm Sóc Động Cơ Điện',
    category: 'Gói chuyên sâu - 365 ngày',
    price: 3200000,
    validityPeriod: 365,
    validityMileage: 15000,
    description: 'Bảo dưỡng và kiểm tra động cơ điện, tối ưu hiệu suất vận hành',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    badge: null
  },
  {
    id: 7,
    name: 'Gói Bảo Dưỡng Điều Hòa',
    category: 'Gói tiện nghi - 365 ngày',
    price: 1800000,
    validityPeriod: 365,
    validityMileage: 10000,
    description: 'Vệ sinh, bảo dưỡng hệ thống điều hòa, nạp gas định kỳ',
    image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=400',
    badge: null
  },
  {
    id: 8,
    name: 'Gói Bảo Dưỡng Lốp Xe',
    category: 'Gói tiêu chuẩn - 365 ngày',
    price: 1200000,
    validityPeriod: 365,
    validityMileage: 20000,
    description: 'Kiểm tra, xoay lốp, cân chỉnh định kỳ cho độ bền tối đa',
    image: 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=400',
    badge: null
  }
];

// Additional combo packages
const combosPage2 = [
  {
    id: 9,
    name: 'Gói Gia Đình Tiết Kiệm',
    category: 'Gói gia đình - 365 ngày',
    price: 3500000,
    validityPeriod: 365,
    validityMileage: 18000,
    description: 'Gói phù hợp cho gia đình, bảo dưỡng toàn diện với giá ưu đãi',
    image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400',
    badge: null
  },
  {
    id: 10,
    name: 'Gói Bảo Dưỡng Thể Thao',
    category: 'Gói hiệu suất cao - 365 ngày',
    price: 5500000,
    validityPeriod: 365,
    validityMileage: 20000,
    description: 'Tối ưu hiệu suất vận hành, kiểm tra chuyên sâu cho xe thể thao',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
    badge: 'New'
  },
  {
    id: 11,
    name: 'Gói Chăm Sóc Cao Cấp Plus',
    category: 'Gói premium - 730 ngày',
    price: 9500000,
    validityPeriod: 730,
    validityMileage: 35000,
    description: 'Dịch vụ cao cấp nhất, không giới hạn số lần bảo dưỡng',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
    badge: 'Best'
  },
  {
    id: 12,
    name: 'Gói Đô Thị Thông Minh',
    category: 'Gói đô thị - 365 ngày',
    price: 2200000,
    validityPeriod: 365,
    validityMileage: 12000,
    description: 'Phù hợp cho xe chạy trong thành phố, bảo dưỡng thường xuyên',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
    badge: null
  },
  {
    id: 13,
    name: 'Gói Phiêu Lưu',
    category: 'Gói địa hình - 365 ngày',
    price: 4800000,
    validityPeriod: 365,
    validityMileage: 25000,
    description: 'Chuyên biệt cho xe đi địa hình, kiểm tra và bảo dưỡng chuyên sâu',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
    badge: null
  },
  {
    id: 14,
    name: 'Gói Doanh Nhân Elite',
    category: 'Gói doanh nghiệp - 730 ngày',
    price: 7200000,
    validityPeriod: 730,
    validityMileage: 40000,
    description: 'Dành cho doanh nhân, ưu tiên cao nhất, hỗ trợ 24/7',
    image: 'https://images.unsplash.com/photo-1617654112368-307921291f42?w=400',
    badge: 'Best'
  },
  {
    id: 15,
    name: 'Gói Khởi Đầu',
    category: 'Gói nhập môn - 180 ngày',
    price: 980000,
    validityPeriod: 180,
    validityMileage: 5000,
    description: 'Gói cơ bản cho xe mới, bảo dưỡng thiết yếu',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400',
    badge: null
  },
  {
    id: 16,
    name: 'Gói Toàn Diện Ultimate',
    category: 'Gói đỉnh cao - 1095 ngày',
    price: 12000000,
    validityPeriod: 1095,
    validityMileage: 50000,
    description: 'Gói toàn diện nhất, bảo hiểm mở rộng, hỗ trợ không giới hạn',
    image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400',
    badge: 'Best'
  }
];

const ProductCombo = () => {
  const navigate = useNavigate();
  const [allCombos, setAllCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);

  // Fetch combos from API
  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const response = await productService.getMaintenancePackages({
        Status: 'Active',
        PageSize: 50
      });

      // Parse response
      const data = response.data || response;
      const packages = Array.isArray(data) ? data : (data.items || []);

      // Map API data to component format
      const mappedPackages = packages.map(pkg => ({
        id: pkg.packageId || pkg.id,
        name: pkg.packageName || pkg.name || 'N/A',
        category: pkg.description || 'Maintenance Package',
        price: pkg.price || 0,
        validityPeriod: pkg.validityPeriod || 365,
        validityMileage: pkg.validityMileage || 10000,
        description: pkg.description || 'No description available',
        image: pkg.imageUrl || 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
        badge: pkg.isPopular ? 'Best' : (pkg.isNew ? 'New' : null)
      }));

      setAllCombos(mappedPackages);
      console.log('✅ Fetched packages:', mappedPackages);
    } catch (error) {
      console.error('❌ Failed to fetch packages:', error);
      toast.error('Failed to load packages');
      // Fallback to empty array if API fails
      setAllCombos([]);
    } finally {
      setLoading(false);
    }
  };

  const visibleCombos = allCombos.slice(startIndex, startIndex + 4);
  while (visibleCombos.length < 4 && allCombos.length >= 4) {
    visibleCombos.push(allCombos[visibleCombos.length % allCombos.length]);
  }

  const handlePrev = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, allCombos.length - 4)));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev < allCombos.length - 4 ? prev + 1 : 0));
  };

  const handleComboClick = (combo) => {
    const idx = allCombos.findIndex(c => c.id === combo.id);
    if (idx >= 0) setCurrentIndex(idx);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '1rem' }}>Loading combo packages...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!loading && allCombos.length === 0) {
    return (
      <>
        <nav className="navbar navbar-expand-lg static-navbar-custom">
          <div className="container-fluid top-navbar-container">
            <div className="navbar-col-left">
              <Link className="navbar-brand-minimal logo-text" to="/home">T&N</Link>
            </div>
            <div className="navbar-col-right">
              <UserMenu />
            </div>
          </div>
        </nav>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column' }}>
          <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#86868b', marginBottom: '1rem' }}></i>
          <h3>No Combo Packages Available</h3>
          <p style={{ color: '#86868b' }}>Please check back later or contact support.</p>
          <Link to="/products/individual" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            View Individual Products
          </Link>
        </div>
      </>
    );
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
        {/* Hero master-detail area */}
        <div className="hero-master-detail">
          <div className="info-column">
            <h1 className="product-title">{allCombos[currentIndex].name}</h1>
            <div className="product-price">{allCombos[currentIndex].price.toLocaleString()} VNĐ</div>
            <p className="product-desc">{allCombos[currentIndex].description}</p>
            <details className="detail-item">
              <summary>Thời hạn & Số km</summary>
              <div className="detail-content">
                Hiệu lực: {allCombos[currentIndex].validityPeriod} ngày | Số km: {allCombos[currentIndex].validityMileage.toLocaleString()} km
              </div>
            </details>
            <details className="detail-item">
              <summary>Phương thức thanh toán</summary>
              <div className="detail-content">Hỗ trợ Visa, MasterCard, MoMo, VNPay, chuyển khoản ngân hàng.</div>
            </details>
            <details className="detail-item">
              <summary>Điều khoản</summary>
              <div className="detail-content">Gói có hiệu lực sau 24h kích hoạt. Áp dụng theo điều kiện của từng gói.</div>
            </details>
          </div>
          <div className="image-column">
            <img src={allCombos[currentIndex].image} alt={allCombos[currentIndex].name} className="hero-image" />
          </div>
        </div>

        <div className="more-section">
          <div className="more-header"><h3>Looking for more?</h3></div>
          <div className="bottom-carousel-wrapper">
            <button className="carousel-nav-btn prev-btn" onClick={handlePrev}><i className="bi bi-chevron-left"></i></button>
            <div className="bottom-products-grid">
              {visibleCombos.map((combo, idx) => (
                <div key={`${combo.id}-${idx}`} className="bottom-product-card" onClick={() => handleComboClick(combo)}>
                  {combo.badge && <span className="product-badge">{combo.badge}</span>}

                  {/* First Content - Hiển thị khi chưa hover */}
                  <div className="first-content">
                    <img src={combo.image} alt={combo.name} className="bottom-product-image" />
                    <h4 className="bottom-product-name">{combo.name}</h4>
                  </div>

                  {/* Second Content - Hiển thị khi hover */}
                  <div className="second-content">
                    <h4 className="second-product-name">{combo.name}</h4>
                    <p className="bottom-product-category">{combo.category}</p>
                    <p className="bottom-product-price">{combo.price.toLocaleString()} VNĐ</p>
                    <p className="combo-validity">
                      <i className="bi bi-calendar-check"></i> {combo.validityPeriod} ngày |
                      <i className="bi bi-speedometer2"></i> {combo.validityMileage.toLocaleString()} km
                    </p>
                    <button className="add-to-cart-btn">
                      <i className="bi bi-cart-plus"></i> Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-nav-btn next-btn" onClick={handleNext}><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCombo;
