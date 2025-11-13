// src/pages/customer/ProductIndividual.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import GlobalNavbar from '../../components/GlobalNavbar';
import Cart from '../../components/Cart';
import { formatCurrency } from '../../utils/currencyUtils';
import appointmentService from '../../services/appointmentService';
import {
  getMaintenanceServices,
  getApplicableServicesByVehicle,
} from '../../services/productService';
import { useSchedule } from '../../contexts/ScheduleContext';
import './ProductIndividual.css';

const extractItems = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const buildCartPayload = (service) => {
  if (!service) return null;
  const serviceId = service.serviceId ?? service.id;
  return {
    serviceId,
    serviceName: service.serviceName ?? service.name,
    basePrice: service.basePrice ?? service.price ?? 0,
    duration:
      service.standardTime ??
      service.standardDurationMinutes ??
      service.durationMinutes ??
      0,
    description: service.description ?? service.serviceDescription ?? '',
    category: service.category ?? service.categoryName ?? 'Maintenance',
  };
};

const ProductIndividual = () => {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { bookingState } = useSchedule();

  const [services, setServices] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const lockedVehicleId = bookingState?.selectedVehicleId
    ? String(bookingState.selectedVehicleId)
    : '';
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [applicableServices, setApplicableServices] = useState([]);
  const [loadingApplicable, setLoadingApplicable] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const response = await getMaintenanceServices({
          Page: 1,
          PageSize: 20,
          Status: 'Active',
        });
        const list = extractItems(response);
        setServices(list);
        setSelectedProduct(list[0] ?? null);
      } catch (err) {
        console.error('Error loading maintenance services:', err);
        setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const response = await appointmentService.getMyVehicles();
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setVehicles(list);
        if (lockedVehicleId) {
          setSelectedVehicleId(lockedVehicleId);
        } else if (list.length > 0) {
          setSelectedVehicleId(String(list[0].vehicleId));
        }
      } catch (err) {
        console.error('Error loading vehicles:', err);
      } finally {
        setLoadingVehicles(false);
      }
    };

    loadCatalog();
    loadVehicles();
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) {
      setApplicableServices([]);
      return;
    }

    const loadApplicable = async () => {
      try {
        setLoadingApplicable(true);
        const response = await getApplicableServicesByVehicle(selectedVehicleId);
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setApplicableServices(list);
      } catch (err) {
        console.error('Error loading applicable services:', err);
        setApplicableServices([]);
      } finally {
        setLoadingApplicable(false);
      }
    };

    loadApplicable();
  }, [selectedVehicleId]);

  const applicableServiceIds = useMemo(() => {
    const ids = applicableServices
      .map(
        (svc) =>
          svc.serviceId ??
          svc.maintenanceServiceId ??
          svc.id ??
          svc.subscriptionServiceId
      )
      .filter(Boolean)
      .map((id) => String(id));
    return new Set(ids);
  }, [applicableServices]);

  const isSelectedServiceFree =
    !!selectedVehicleId &&
    selectedProduct &&
    applicableServiceIds.has(
      String(selectedProduct.serviceId ?? selectedProduct.id)
    );

  const buildCartItem = () => {
    if (!selectedProduct) return null;
    const payload = buildCartPayload(selectedProduct);
    if (!payload) return null;
    return isSelectedServiceFree
      ? {
          ...payload,
          basePrice: 0,
          isComplimentary: true,
        }
      : payload;
  };

  const handleAddToCart = () => {
    const cartItem = buildCartItem();
    if (!cartItem) return;
    addToCart(cartItem);
    toast.success(
      cartItem.isComplimentary
        ? `Đã thêm "${cartItem.serviceName}" (Free) vào giỏ hàng`
        : `Đã thêm "${cartItem.serviceName}" vào giỏ hàng`
    );
  };

  const handleBookNow = () => {
    const cartItem = buildCartItem();
    if (!cartItem) return;
    clearCart();
    addToCart(cartItem);
    toast.success(
      cartItem.isComplimentary
        ? 'Đã sẵn sàng đặt lịch với dịch vụ miễn phí này'
        : 'Đã sẵn sàng đặt lịch với dịch vụ này'
    );
    navigate('/schedule-service');
  };

  const renderList = () => {
    if (loading) {
      return (
        <div className="empty-state">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return <div className="empty-state text-danger">{error}</div>;
    }

    if (services.length === 0) {
      return (
        <div className="empty-state">
          Hiện chưa có dịch vụ nào.
        </div>
      );
    }

    return services.map((service, index) => {
      const serviceId = service.serviceId ?? service.id;
      const serviceKey = String(serviceId);
      const selectedKey = selectedProduct
        ? String(selectedProduct.serviceId ?? selectedProduct.id)
        : null;
      const isActive = selectedKey === serviceKey;
      const isFree = selectedVehicleId && applicableServiceIds.has(serviceKey);

      return (
        <button
          key={serviceId}
          className={`product-list-item ${isActive ? 'active' : ''} ${isFree ? 'free-item' : ''}`}
          type="button"
          onClick={() => setSelectedProduct(service)}
        >
          <span className="product-index">{String(index + 1).padStart(2, '0')}</span>
          <div className="product-meta">
            <p className="product-name">{service.serviceName ?? service.name}</p>
            <p className="product-category">{service.category ?? service.categoryName}</p>
          </div>
          <div className="product-price-block">
            {isFree && <span className="product-badge free">Free</span>}
            <span className={`product-price ${isFree ? 'price-free' : ''}`}>
              {isFree ? 'Free' : formatCurrency(service.basePrice ?? service.price ?? 0)}
            </span>
          </div>
        </button>
      );
    });
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

        <div className="vehicle-context">
          <label className="context-label">Chọn xe để kiểm tra quyền lợi của bạn</label>
          {loadingVehicles ? (
            <div className="empty-state small">Đang tải danh sách xe...</div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state small">
              Bạn chưa có xe nào. <button className="link-button" onClick={() => navigate('/register-vehicle')}>Đăng ký xe</button>
            </div>
          ) : (
            <select
              className="form-select vehicle-select"
              value={selectedVehicleId}
              onChange={(e) => {
                if (lockedVehicleId) return;
                setSelectedVehicleId(e.target.value);
              }}
              disabled={!!lockedVehicleId}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  {vehicle.fullModelName || vehicle.modelName} • {vehicle.licensePlate}
                </option>
              ))}
            </select>
          )}
          {lockedVehicleId && (
            <p className="context-hint">Vehicle comes from your current booking and cannot be changed.</p>
          )}
          {loadingApplicable && selectedVehicleId && (
            <p className="context-hint">Đang kiểm tra các dịch vụ miễn phí...</p>
          )}
        </div>

        <div className="product-layout">
          <aside className="product-list">{renderList()}</aside>

          <section className="product-detail-card">
            <div className="detail-pill">Select your product</div>
            {selectedVehicleId && (
              <span className={`detail-badge ${isSelectedServiceFree ? 'free' : 'base'}`}>
                {isSelectedServiceFree ? 'Included' : 'Base price'}
              </span>
            )}

            {selectedProduct ? (
              <>
                <h1 className="detail-title">
                  {selectedProduct.serviceName ?? selectedProduct.name}
                </h1>
                <p className="detail-category-label">
                  {selectedProduct.category ?? selectedProduct.categoryName}
                </p>
                <p className="detail-description">
                  {selectedProduct.description ?? selectedProduct.serviceDescription}
                </p>

                <div className="detail-stats">
                  <div className="stat-card">
                    <span className="stat-label">Thời gian thực hiện</span>
                    <strong className="stat-value">
                      {selectedProduct.standardTime ??
                        selectedProduct.standardDurationMinutes ??
                        selectedProduct.durationMinutes ??
                        0}{' '}
                      phút
                    </strong>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Chi phí nhân công</span>
                    <strong className="stat-value">
                      {formatCurrency(selectedProduct.laborCost ?? 0)}
                    </strong>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Tổng phí dịch vụ</span>
                    <strong className={`stat-value price ${isSelectedServiceFree ? 'price-free' : ''}`}>
                      {isSelectedServiceFree
                        ? 'Free'
                        : formatCurrency(selectedProduct.basePrice ?? selectedProduct.price ?? 0)}
                    </strong>
                  </div>
                </div>

                <div className="detail-actions">
                  <button
                    type="button"
                    className="action-btn ghost"
                    onClick={handleAddToCart}
                  >
                    <i className="bi bi-bag-plus" /> Add to Cart{' '}
                    {isSelectedServiceFree && <span className="free-indicator">(Free)</span>}
                  </button>
                  <button
                    type="button"
                    className="action-btn solid"
                    onClick={handleBookNow}
                  >
                    <i className="bi bi-lightning-charge" /> Book Now{' '}
                    {isSelectedServiceFree && <span className="free-indicator">(Free)</span>}
                  </button>
                </div>
                {isSelectedServiceFree && (
                  <p className="context-hint">
                    Dịch vụ này nằm trong gói hiện tại của bạn. Bạn vẫn có thể đặt lịch như bình
                    thường và sẽ không bị tính phí khi thanh toán.
                  </p>
                )}
              </>
            ) : (
              <div className="empty-state">Chọn một dịch vụ để xem chi tiết</div>
            )}
          </section>
        </div>
        <Cart />
      </div>
    </>
  );
};

export default ProductIndividual;
