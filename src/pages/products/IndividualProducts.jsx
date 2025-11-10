// src/pages/products/IndividualProducts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import maintenanceService from '../../services/maintenanceService';
import { useCart } from '../../contexts/CartContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import Cart from '../../components/Cart';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Particles from '../../components/Particles';
import './Products.css';

const IndividualProducts = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { hasBookingState } = useSchedule();

  // State management
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    categoryId: '',
    sortBy: 'ServiceName',
    sortOrder: 'asc'
  });

  // Load services
  useEffect(() => {
    loadServices();
  }, [filters]);

  const loadServices = async () => {
    try {
      setLoading(true);

      const params = {
        page: 1,
        pageSize: 100,
        isActive: true,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await maintenanceService.getAllServices(params);

      if (response.success && response.data) {
        const loadedServices = response.data.items || [];
        setServices(loadedServices);

        // Auto-select first service
        if (loadedServices.length > 0) {
          setSelectedService(loadedServices[0]);
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Unable to load services. Please try again.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleBookService = () => {
    if (selectedService) {
      // Add to cart first, then navigate to schedule
      addToCart(selectedService);
      toast.success(`${selectedService.serviceName} added to cart!`);
      navigate('/schedule-service');
    }
  };

  const handleAddToCart = () => {
    if (selectedService) {
      addToCart(selectedService);
      toast.success(`${selectedService.serviceName} added to cart!`);
    }
  };

  const handleContinueBooking = () => {
    // Navigate back to schedule - it will restore the saved state
    navigate('/schedule-service');
  };

  const handleSwitchToCombo = () => {
    navigate('/products/combo');
  };

  // Handle wheel scroll to change products
  const handleWheel = (e) => {
    if (services.length === 0) return;

    const currentIndex = services.findIndex(s => s.serviceId === selectedService?.serviceId);
    if (currentIndex === -1) return;

    if (e.deltaY > 0) {
      // Scroll down - next product
      const nextIndex = (currentIndex + 1) % services.length;
      setSelectedService(services[nextIndex]);
    } else {
      // Scroll up - previous product
      const prevIndex = currentIndex === 0 ? services.length - 1 : currentIndex - 1;
      setSelectedService(services[prevIndex]);
    }
  };

  return (
    <div className="products-page-container">
      {/* Cart Component */}
      <Cart />

      {/* Particles Background */}
      <div className="products-particles">
        <Particles
          particleColors={['#cccccc', '#999999']}
          particleCount={300}
          particleSpread={15}
          speed={0.08}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="products-layout">
        {/* Left Sidebar */}
        <div className="products-left-panel">
          {/* Type Buttons */}
          <div className="product-type-buttons">
            <button className="product-type-btn active">
              INDIVIDUAL
            </button>
            <button className="product-type-btn" onClick={handleSwitchToCombo}>
              COMBO
            </button>
          </div>

          {/* Products List */}
          <div className="products-list-container">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-light"></div>
              </div>
            ) : (
              services.map((service, index) => (
                <div
                  key={service.serviceId}
                  className={`product-list-item ${selectedService?.serviceId === service.serviceId ? 'active' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <span className="product-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="product-name-text">{service.serviceName}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="products-right-panel" onWheel={handleWheel}>
          {!selectedService ? (
            <div className="product-empty-state">
              <p className="select-text">Select your Product</p>
              <h1 className="empty-title">Choose a service</h1>
            </div>
          ) : (
            <div className="product-detail-area">
              <p className="select-text">Select your Product</p>

              <h1 className="product-title-main">
                {selectedService.serviceName}
              </h1>

              <p className="product-description-main">
                {selectedService.description || 'Professional maintenance service for your electric vehicle'}
              </p>

              <div className="product-price-main">
                {maintenanceService.formatCurrency(selectedService.basePrice || 0)}
              </div>

              <div className="product-action-buttons">
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  <i className="bi bi-cart-plus"></i> Add to Cart
                </button>

                {/* Show different button based on context */}
                {hasBookingState() && cartItems.length > 0 ? (
                  <button className="book-now-btn" onClick={handleContinueBooking}>
                    <i className="bi bi-arrow-left-circle"></i> Continue Booking
                  </button>
                ) : (
                  <button className="book-now-btn" onClick={handleBookService}>
                    <i className="bi bi-calendar-plus"></i> Book Now
                  </button>
                )}
              </div>

              {/* Additional Info */}
              <div className="product-meta-info">
                <div className="meta-info-item">
                  <i className="bi bi-clock"></i>
                  <span>{selectedService.standardTime} minutes</span>
                </div>
                {selectedService.isWarrantyService && (
                  <div className="meta-info-item">
                    <i className="bi bi-shield-check"></i>
                    <span>Warranty Service</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualProducts;
