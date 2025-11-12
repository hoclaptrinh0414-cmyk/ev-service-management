// src/pages/customer/ProductIndividual.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import GlobalNavbar from '../../components/GlobalNavbar';
import Cart from '../../components/Cart';
import { formatCurrency } from '../../utils/currencyUtils';
import './ProductIndividual.css';

const individualServices = [
  {
    id: 1,
    name: 'Bảo dưỡng 10,000 km',
    category: 'Bảo dưỡng định kỳ',
    price: 600000,
    laborCost: 250000,
    standardTime: 90,
    description:
      'Gói bảo dưỡng định kỳ bao gồm thay dầu, vệ sinh lọc gió và kiểm tra toàn bộ hệ thống phanh, lốp, hệ thống điện.',
    badge: 'New',
  },
  {
    id: 2,
    name: 'Bảo dưỡng 20,000 km',
    category: 'Bảo dưỡng định kỳ',
    price: 1200000,
    laborCost: 400000,
    standardTime: 120,
    description:
      'Chăm sóc toàn diện cho xe với kiểm tra pin, thay dung dịch làm mát, cập nhật phần mềm điều khiển.',
    badge: 'Best',
  },
  {
    id: 3,
    name: 'Kiểm tra động cơ pin',
    category: 'Chuyên sâu',
    price: 300000,
    laborCost: 150000,
    standardTime: 45,
    description:
      'Đo thông số pin, đánh giá hiệu suất sạc và phát hiện sớm các lỗi tiềm ẩn trong hệ thống pin.',
  },
  {
    id: 4,
    name: 'Bảo dưỡng hệ thống làm mát pin',
    category: 'Hệ thống làm mát',
    price: 1500000,
    laborCost: 500000,
    standardTime: 90,
    description:
      'Vệ sinh kênh làm mát, thay dung dịch và tối ưu khả năng tản nhiệt cho bộ pin chính.',
    badge: 'New',
  },
  {
    id: 5,
    name: 'Cân chỉnh & xoay lốp',
    category: 'Lốp xe',
    price: 400000,
    laborCost: 150000,
    standardTime: 45,
    description:
      'Cân chỉnh góc đặt bánh, xoay lốp để tăng tuổi thọ và đảm bảo khả năng bám đường.',
  },
  {
    id: 6,
    name: 'Bảo dưỡng điều hòa',
    category: 'Tiện nghi',
    price: 1200000,
    laborCost: 400000,
    standardTime: 90,
    description:
      'Vệ sinh dàn lạnh, thay lọc gió điều hòa và bổ sung gas để mang lại cabin mát lạnh.',
  },
];

const buildCartPayload = (service) => ({
  serviceId: service.id,
  serviceName: service.name,
  basePrice: service.price,
  duration: service.standardTime,
  description: service.description,
  category: service.category,
});

const ProductIndividual = () => {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(individualServices[0]);

  const handleAddToCart = () => {
    addToCart(buildCartPayload(selectedProduct));
    toast.success(`Đã thêm "${selectedProduct.name}" vào giỏ hàng`);
  };

  const handleBookNow = () => {
    clearCart();
    addToCart(buildCartPayload(selectedProduct));
    toast.success('Đã sẵn sàng đặt lịch với dịch vụ này');
    navigate('/schedule-service');
  };

  return (
    <>
      <GlobalNavbar />
      <div className="product-showcase">
      <div className="product-switcher">
        <button className="switch-btn active" type="button">
          Individual
        </button>
        <button
          className="switch-btn"
          type="button"
          onClick={() => navigate('/products/combo')}
        >
          Combo
        </button>
      </div>

      <div className="product-layout">
        <aside className="product-list">
          {individualServices.map((service, index) => {
            const isActive = selectedProduct.id === service.id;
            return (
              <button
                key={service.id}
                className={`product-list-item ${isActive ? 'active' : ''}`}
                type="button"
                onClick={() => setSelectedProduct(service)}
              >
                <span className="product-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="product-meta">
                  <p className="product-name">{service.name}</p>
                  <p className="product-category">{service.category}</p>
                </div>
                <span className="product-price">
                  {formatCurrency(service.price)}
                </span>
              </button>
            );
          })}
        </aside>

        <section className="product-detail-card">
          <div className="detail-pill">Select your product</div>
          {selectedProduct.badge && (
            <span className={`detail-badge ${selectedProduct.badge.toLowerCase()}`}>
              {selectedProduct.badge}
            </span>
          )}
          <h1 className="detail-title">{selectedProduct.name}</h1>
          <p className="detail-category-label">{selectedProduct.category}</p>
          <p className="detail-description">{selectedProduct.description}</p>

          <div className="detail-stats">
            <div className="stat-card">
              <span className="stat-label">Thời gian thực hiện</span>
              <strong className="stat-value">
                {selectedProduct.standardTime} phút
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Chi phí nhân công</span>
              <strong className="stat-value">
                {formatCurrency(selectedProduct.laborCost)}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tổng phí dịch vụ</span>
              <strong className="stat-value price">
                {formatCurrency(selectedProduct.price)}
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

export default ProductIndividual;
