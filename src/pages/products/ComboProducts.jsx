// src/pages/products/ComboProducts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import packageService from '../../services/packageService';
import { useCart } from '../../contexts/CartContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import Cart from '../../components/Cart';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Particles from '../../components/Particles';
import './Products.css';

const ComboProducts = () => {
  const navigate = useNavigate();
  const { addPackageToCart, cartItems } = useCart();
  const { hasBookingState } = useSchedule();

  // State management
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mySubscriptions, setMySubscriptions] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'Active',
    isPopular: '',
    sortBy: 'PackageName',
    sortOrder: 'asc'
  });

  // Load packages and subscriptions
  useEffect(() => {
    loadPackages();
    loadMySubscriptions();
  }, [filters]);

  const loadMySubscriptions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('ℹ️ User not logged in, skipping subscriptions load');
        return;
      }

      const response = await packageService.getMySubscriptions();
      const subscriptions = response?.data?.items || response?.items || response?.data || [];

      // Only keep active subscriptions
      const activeSubscriptions = Array.isArray(subscriptions)
        ? subscriptions.filter(sub =>
            sub.status?.toLowerCase() === 'active' ||
            sub.remainingServices > 0
          )
        : [];

      console.log('✅ Loaded active subscriptions:', activeSubscriptions.length);
      setMySubscriptions(activeSubscriptions);
    } catch (error) {
      console.log('ℹ️ Could not load subscriptions (user may not be logged in):', error.message);
      setMySubscriptions([]);
    }
  };

  const loadPackages = async () => {
    try {
      setLoading(true);

      const params = {
        page: 1,
        pageSize: 100,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Convert isPopular to boolean if set
      if (params.isPopular === 'true') params.isPopular = true;
      if (params.isPopular === 'false') params.isPopular = false;

      const response = await packageService.getAllPackages(params);

      if (response.success && response.data) {
        const loadedPackages = response.data.items || [];
        setPackages(loadedPackages);

        // Auto-select first package
        if (loadedPackages.length > 0) {
          setSelectedPackage(loadedPackages[0]);
        }
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      toast.error('Unable to load packages. Please try again.');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  // Check if package is already purchased (has active subscription)
  const isPackagePurchased = (packageId) => {
    return mySubscriptions.some(sub => sub.packageId === packageId);
  };

  const handleBuyPackage = () => {
    if (selectedPackage) {
      if (isPackagePurchased(selectedPackage.packageId)) {
        toast.warning('You have already purchased this package. Please use it before buying again.');
        return;
      }
      navigate('/package-payment', { state: { selectedPackage } });
    }
  };

  const handleAddToCart = () => {
    if (selectedPackage) {
      if (isPackagePurchased(selectedPackage.packageId)) {
        toast.warning('You have already purchased this package. Please use it before buying again.');
        return;
      }
      addPackageToCart(selectedPackage);
      toast.success(`${selectedPackage.packageName} added to cart!`);
    }
  };

  const handleContinueBooking = () => {
    // Navigate back to schedule - it will restore the saved state
    navigate('/schedule-service');
  };

  const handleSwitchToIndividual = () => {
    navigate('/products/individual');
  };

  // Handle wheel scroll to change products
  const handleWheel = (e) => {
    if (packages.length === 0) return;

    const currentIndex = packages.findIndex(p => p.packageId === selectedPackage?.packageId);
    if (currentIndex === -1) return;

    if (e.deltaY > 0) {
      // Scroll down - next product
      const nextIndex = (currentIndex + 1) % packages.length;
      setSelectedPackage(packages[nextIndex]);
    } else {
      // Scroll up - previous product
      const prevIndex = currentIndex === 0 ? packages.length - 1 : currentIndex - 1;
      setSelectedPackage(packages[prevIndex]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
            <button className="product-type-btn" onClick={handleSwitchToIndividual}>
              INDIVIDUAL
            </button>
            <button className="product-type-btn active">
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
              packages.map((pkg, index) => {
                const isPurchased = isPackagePurchased(pkg.packageId);
                return (
                  <div
                    key={pkg.packageId}
                    className={`product-list-item ${selectedPackage?.packageId === pkg.packageId ? 'active' : ''} ${isPurchased ? 'purchased' : ''}`}
                    onClick={() => !isPurchased && handlePackageSelect(pkg)}
                    style={{
                      opacity: isPurchased ? 0.5 : 1,
                      cursor: isPurchased ? 'not-allowed' : 'pointer',
                      pointerEvents: isPurchased ? 'none' : 'auto'
                    }}
                  >
                    <span className="product-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="product-name-text">
                      {pkg.packageName}
                      {pkg.isPopular && <i className="bi bi-fire ms-2 text-danger"></i>}
                      {isPurchased && (
                        <span style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          color: '#27ae60',
                          marginTop: '0.25rem'
                        }}>
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Already Purchased
                        </span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="products-right-panel" onWheel={handleWheel}>
          {!selectedPackage ? (
            <div className="product-empty-state">
              <p className="select-text">Select your Product</p>
              <h1 className="empty-title">Choose a package</h1>
            </div>
          ) : (
            <div className="product-detail-area">
              <p className="select-text">Select your Product</p>

              <h1 className="product-title-main">
                {selectedPackage.packageName}
                {isPackagePurchased(selectedPackage.packageId) && (
                  <span style={{
                    display: 'inline-block',
                    marginLeft: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    padding: '0.5rem 1rem',
                    background: '#27ae60',
                    color: 'white',
                    borderRadius: '25px',
                    verticalAlign: 'middle'
                  }}>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Already Purchased
                  </span>
                )}
              </h1>

              <p className="product-description-main">
                {selectedPackage.description || 'Comprehensive maintenance package for your electric vehicle'}
              </p>

              {/* Show "Already Purchased" warning */}
              {isPackagePurchased(selectedPackage.packageId) && (
                <div className="alert alert-success" style={{
                  background: '#d4edda',
                  border: '1px solid #c3e6cb',
                  color: '#155724',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <i className="bi bi-info-circle me-2"></i>
                  You have an active subscription for this package. Use your remaining services before purchasing again.
                </div>
              )}

              {/* Show discount if available */}
              {selectedPackage.discountPercent > 0 && (
                <div className="discount-info mb-3">
                  <span className="original-price-text">
                    {formatCurrency(selectedPackage.basePrice || 0)}
                  </span>
                  <span className="discount-badge-text">
                    -{selectedPackage.discountPercent}% OFF
                  </span>
                </div>
              )}

              <div className="product-price-main">
                {formatCurrency(selectedPackage.totalPriceAfterDiscount || selectedPackage.basePrice || 0)}
              </div>

              {selectedPackage.savedAmount > 0 && (
                <div className="savings-text mb-3">
                  <i className="bi bi-piggy-bank"></i> You save {formatCurrency(selectedPackage.savedAmount)}
                </div>
              )}

              {/* Show buttons only if not purchased */}
              {!isPackagePurchased(selectedPackage.packageId) && (
                <div className="product-action-buttons">
                  <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    <i className="bi bi-cart-plus"></i> Add to Cart
                  </button>

                  {/* Show Continue Booking if coming from Schedule, otherwise show Buy Now */}
                  {hasBookingState() && cartItems.length > 0 ? (
                    <button className="book-now-btn" onClick={handleContinueBooking}>
                      <i className="bi bi-arrow-left-circle"></i> Continue Booking
                    </button>
                  ) : (
                    <button className="book-now-btn" onClick={handleBuyPackage}>
                      <i className="bi bi-shopping-bag"></i> Buy Now
                    </button>
                  )}
                </div>
              )}

              {/* Included Services */}
              {selectedPackage.includedServices && selectedPackage.includedServices.length > 0 && (
                <div className="included-services-info">
                  <h6>Included Services:</h6>
                  <ul>
                    {selectedPackage.includedServices.slice(0, 5).map((service, index) => (
                      <li key={index}>
                        <i className="bi bi-check-circle"></i> {service.serviceName}
                        {service.quantityInPackage > 1 && ` (×${service.quantityInPackage})`}
                      </li>
                    ))}
                    {selectedPackage.includedServices.length > 5 && (
                      <li className="more-services">
                        +{selectedPackage.includedServices.length - 5} more services
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Additional Info */}
              <div className="product-meta-info">
                <div className="meta-info-item">
                  <i className="bi bi-list-check"></i>
                  <span>{selectedPackage.totalServicesCount || selectedPackage.includedServices?.length || 0} services</span>
                </div>
                {selectedPackage.validityPeriodInDays && (
                  <div className="meta-info-item">
                    <i className="bi bi-calendar-range"></i>
                    <span>Valid for {selectedPackage.validityPeriodInDays} days</span>
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

export default ComboProducts;
