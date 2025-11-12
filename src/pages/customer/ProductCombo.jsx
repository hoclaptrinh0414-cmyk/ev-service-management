// src/pages/customer/ProductCombo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import GlobalNavbar from '../../components/GlobalNavbar';
import Cart from '../../components/Cart';
import { formatCurrency } from '../../utils/currencyUtils';
import './ProductCombo.css';

const combosPage1 = [
  {
    id: 1,
    name: 'Gói Bảo Dưỡng Cơ Bản',
    category: 'Gói cơ bản - 365 ngày',
    price: 2000000,
    validityPeriod: 365,
    validityMileage: 10000,
    description:
      'Kiểm tra định kỳ toàn bộ hệ thống, ưu tiên lịch và ưu đãi 10% phụ tùng.',
    badge: 'New',
  },
  {
    id: 2,
    name: 'Gói Bảo Dưỡng Cao Cấp',
    category: 'Gói cao cấp - 365 ngày',
    price: 4500000,
    validityPeriod: 365,
    validityMileage: 15000,
    description:
      'Bao gồm chăm sóc pin, hệ thống điện, xe được ưu tiên kỹ thuật viên trưởng.',
    badge: 'Best',
  },
  {
    id: 3,
    name: 'Gói Bảo Dưỡng VIP',
    category: 'Gói VIP - 730 ngày',
    price: 8000000,
    validityPeriod: 730,
    validityMileage: 30000,
    description:
      'Phục vụ riêng 24/7, hỗ trợ cứu hộ miễn phí và bảo hành mở rộng.',
    badge: 'Best',
  },
  {
    id: 4,
    name: 'Gói Kiểm Tra Pin Toàn Diện',
    category: 'Gói chuyên biệt - 180 ngày',
    price: 1500000,
    validityPeriod: 180,
    validityMileage: 5000,
    description:
      'Đánh giá pin chuyên sâu, tối ưu dung lượng và cập nhật phần mềm pin.',
  },
];

const combosPage2 = [
  {
    id: 5,
    name: 'Gói Chăm Sóc Hệ Thống Phanh',
    category: 'Gói an toàn - 365 ngày',
    price: 2500000,
    validityPeriod: 365,
    validityMileage: 12000,
    description:
      'Kiểm tra, thay thế phanh, tinh chỉnh ABS và vệ sinh hệ thống phanh.',
    badge: 'New',
  },
  {
    id: 6,
    name: 'Gói Chăm Sóc Động Cơ Điện',
    category: 'Gói chuyên sâu - 365 ngày',
    price: 3200000,
    validityPeriod: 365,
    validityMileage: 15000,
    description:
      'Kiểm tra động cơ điện, cập nhật phần mềm điều khiển và tối ưu hiệu suất.',
  },
  {
    id: 7,
    name: 'Gói Bảo Dưỡng Điều Hòa',
    category: 'Gói tiện nghi - 365 ngày',
    price: 1800000,
    validityPeriod: 365,
    validityMileage: 10000,
    description:
      'Làm sạch hệ thống điều hòa, thay lọc gió và kiểm tra gas lạnh định kỳ.',
  },
  {
    id: 8,
    name: 'Gói Bảo Dưỡng Lốp Xe',
    category: 'Gói tiêu chuẩn - 365 ngày',
    price: 1200000,
    validityPeriod: 365,
    validityMileage: 20000,
    description:
      'Xoay lốp, cân chỉnh góc đặt bánh và theo dõi mòn lốp thông minh.',
  },
];

const comboPackages = [...combosPage1, ...combosPage2];

const buildComboPayload = (combo) => ({
  packageId: combo.id,
  packageName: combo.name,
  totalPriceAfterDiscount: combo.price,
  validityPeriod: combo.validityPeriod,
  validityMileage: combo.validityMileage,
  isPackage: true,
});

const ProductCombo = () => {
  const navigate = useNavigate();
  const { addPackageToCart, clearCart } = useCart();
  const [selectedCombo, setSelectedCombo] = useState(comboPackages[0]);

  const handleAddToCart = () => {
    addPackageToCart(buildComboPayload(selectedCombo));
    toast.success(`Đã thêm "${selectedCombo.name}" vào giỏ hàng`);
  };

  const handleBookNow = () => {
    clearCart();
    addPackageToCart(buildComboPayload(selectedCombo));
    toast.success('Đã sẵn sàng đặt lịch với gói combo này');
    navigate('/schedule-service');
  };

  return (
    <>
      <GlobalNavbar />
      <div className="product-showcase">
      <div className="product-switcher">
        <button
          className="switch-btn"
          type="button"
          onClick={() => navigate('/products/individual')}
        >
          Individual
        </button>
        <button className="switch-btn active" type="button">
          Combo
        </button>
      </div>

      <div className="product-layout">
        <aside className="product-list">
          {comboPackages.map((combo, index) => {
            const isActive = selectedCombo.id === combo.id;
            return (
              <button
                key={combo.id}
                className={`product-list-item ${isActive ? 'active' : ''}`}
                type="button"
                onClick={() => setSelectedCombo(combo)}
              >
                <span className="product-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="product-meta">
                  <p className="product-name">{combo.name}</p>
                  <p className="product-category">{combo.category}</p>
                </div>
                <span className="product-price">
                  {formatCurrency(combo.price)}
                </span>
              </button>
            );
          })}
        </aside>

        <section className="product-detail-card">
          <div className="detail-pill">Select your package</div>
          {selectedCombo.badge && (
            <span className={`detail-badge ${selectedCombo.badge.toLowerCase()}`}>
              {selectedCombo.badge}
            </span>
          )}
          <h1 className="detail-title">{selectedCombo.name}</h1>
          <p className="detail-category-label">{selectedCombo.category}</p>
          <p className="detail-description">{selectedCombo.description}</p>

          <div className="detail-stats">
            <div className="stat-card">
              <span className="stat-label">Thời hạn</span>
              <strong className="stat-value">
                {selectedCombo.validityPeriod} ngày
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Giới hạn số km</span>
              <strong className="stat-value">
                {selectedCombo.validityMileage.toLocaleString('vi-VN')} km
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Giá gói</span>
              <strong className="stat-value price">
                {formatCurrency(selectedCombo.price)}
              </strong>
            </div>
          </div>

          <div className="detail-actions">
            <button
              type="button"
              className="action-btn ghost"
              onClick={handleAddToCart}
            >
              <i className="bi bi-bag-plus" /> Add to Cart
            </button>
            <button
              type="button"
              className="action-btn solid"
              onClick={handleBookNow}
            >
              <i className="bi bi-lightning-charge" /> Book Now
            </button>
          </div>
        </section>
      </div>
        <Cart />
      </div>
    </>
  );
};

export default ProductCombo;
