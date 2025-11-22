// giỏ hàng 




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatPriceLabel = (amount, isComplimentary = false) => {
    if (isComplimentary || amount <= 0) {
      return 'Free';
    }
    return formatCurrency(amount);
  };

  const handleConfirmSelection = () => {
    if (cartItems.length === 0) return;

    // Navigate back to schedule service with selected items
    navigate('/schedule-service', { state: { selectedServices: cartItems } });
    setIsOpen(false);
  };

  const handleContinueShopping = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Cart Icon Button */}
      <div className="cart-icon-container" onClick={() => setIsOpen(!isOpen)}>
        <i className="bi bi-cart3"></i>
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
      </div>

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>
            <i className="bi bi-cart3"></i> Your Cart
          </h3>
          <button className="cart-close-btn" onClick={() => setIsOpen(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <i className="bi bi-cart-x"></i>
              <p>Your cart is empty</p>
              <small>Add services or packages to get started</small>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => {
                  const isPackage = item.isPackage;
                  const itemId = isPackage ? item.packageId : item.serviceId;
                  const itemName = isPackage ? item.packageName : item.serviceName;
                  const itemPrice = isPackage
                    ? (item.totalPriceAfterDiscount || item.basePrice || 0)
                    : (item.basePrice || 0);
                  const isComplimentary = item.isComplimentary || itemPrice <= 0;
                  const subtotalAmount = itemPrice * (isPackage ? 1 : item.quantity);

                  return (
                    <div key={`${isPackage ? 'pkg' : 'svc'}-${itemId}`} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">
                          {itemName}
                          {isPackage && <span className="item-type-badge">Package</span>}
                        </div>
                        <div className="cart-item-price">
                          {formatPriceLabel(itemPrice, isComplimentary)}
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        {/* Show quantity controls only for services, not packages */}
                        {!isPackage && (
                          <div className="quantity-controls">
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(itemId, item.quantity - 1, isPackage)}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="qty-value">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(itemId, item.quantity + 1, isPackage)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        )}

                        {/* For packages, show "1 Package" text */}
                        {isPackage && (
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            fontWeight: '500',
                            padding: '0.5rem 0'
                          }}>
                            <i className="bi bi-box-seam me-2"></i>
                            1 Package
                          </div>
                        )}

                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(itemId, isPackage)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        Subtotal: {formatPriceLabel(subtotalAmount, isComplimentary)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-amount">
                    {formatPriceLabel(totalPrice, totalPrice <= 0)}
                  </span>
                </div>

                <button className="btn-clear-cart" onClick={clearCart}>
                  <i className="bi bi-trash"></i> Clear All
                </button>

                <button className="btn-confirm-selection" onClick={handleConfirmSelection}>
                  <i className="bi bi-calendar-check"></i> Book All
                </button>

                <button className="btn-continue-shopping" onClick={handleContinueShopping}>
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="cart-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Cart;
