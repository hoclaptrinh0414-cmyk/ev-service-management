// src/pages/customer/ProductCombo.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import GlobalNavbar from '../../components/GlobalNavbar';
import Cart from '../../components/Cart';
import { formatCurrency } from '../../utils/currencyUtils';
import appointmentService from '../../services/appointmentService';
import {
  getMaintenancePackages,
  getActiveSubscriptionsByVehicle,
  purchasePackageWithPayment,
} from '../../services/productService';
import { useSchedule } from '../../contexts/ScheduleContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import './ProductCombo.css';

const extractItems = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const buildComboPayload = (combo) => {
  if (!combo) return null;
  const packageId = combo.packageId ?? combo.id;
  return {
    packageId,
    packageName: combo.packageName ?? combo.name,
    totalPriceAfterDiscount:
      combo.totalPriceAfterDiscount ?? combo.price ?? combo.basePrice ?? 0,
    validityPeriod: combo.validityPeriod ?? combo.durationInDays ?? 0,
    validityMileage: combo.validityMileage ?? combo.mileageLimit ?? 0,
    isPackage: true,
  };
};

const ProductCombo = () => {
  const navigate = useNavigate();
  const { addPackageToCart, clearCart } = useCart();

  const [packages, setPackages] = useState([]);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const { bookingState } = useSchedule();
  const lockedVehicleId = bookingState?.selectedVehicleId
    ? String(bookingState.selectedVehicleId)
    : '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showAlreadyPurchasedDialog, setShowAlreadyPurchasedDialog] = useState(false);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        const response = await getMaintenancePackages({
          Page: 1,
          PageSize: 12,
          Status: 'Active',
        });
        const list = extractItems(response);
        setPackages(list);
        setSelectedCombo(list[0] ?? null);
      } catch (err) {
        console.error('Error loading packages:', err);
        setError('Không thể tải danh sách gói combo. Vui lòng thử lại sau.');
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

    loadPackages();
    loadVehicles();
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) {
      setActiveSubscriptions([]);
      return;
    }

    const loadSubscriptions = async () => {
      try {
        setLoadingSubscriptions(true);
        const response = await getActiveSubscriptionsByVehicle(selectedVehicleId);
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setActiveSubscriptions(list);
      } catch (err) {
        console.error('Error loading active subscriptions:', err);
        setActiveSubscriptions([]);
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    loadSubscriptions();
  }, [selectedVehicleId]);

  // Extract packageCode/packageName for comparison
  const extractPackageIdentifier = (sub) => {
    return {
      packageId: sub.packageId ?? sub.maintenancePackageId ?? sub.subscriptionPackageId,
      packageCode: sub.packageCode,
      packageName: sub.packageName
    };
  };

  const ownedPackageIdentifiers = useMemo(() => {
    const identifiers = activeSubscriptions
      .map(extractPackageIdentifier)
      .filter(item => item.packageCode || item.packageName || item.packageId);
    return identifiers;
  }, [activeSubscriptions]);

  // ✅ NEW: Check if combo is owned by matching packageId, packageCode, or packageName
  const selectedComboId = selectedCombo?.packageId ?? selectedCombo?.id;
  const selectedComboCode = selectedCombo?.packageCode ?? selectedCombo?.code;
  const selectedComboName = selectedCombo?.packageName ?? selectedCombo?.name;

  const isComboOwned = useMemo(() => {
    if (!selectedVehicleId || (!selectedComboId && !selectedComboCode && !selectedComboName)) {
      return false;
    }

    return ownedPackageIdentifiers.some(item => {
      // Match by packageId
      if (selectedComboId && item.packageId && String(item.packageId) === String(selectedComboId)) {
        return true;
      }
      // Match by packageCode
      if (selectedComboCode && item.packageCode && item.packageCode === selectedComboCode) {
        return true;
      }
      // Match by packageName
      if (selectedComboName && item.packageName && item.packageName === selectedComboName) {
        return true;
      }
      return false;
    });
  }, [selectedVehicleId, selectedComboId, selectedComboCode, selectedComboName, ownedPackageIdentifiers]);

  const comboDuration =
    selectedCombo?.validityPeriod ?? selectedCombo?.durationInDays ?? 0;
  const comboMileage =
    Number(
      selectedCombo?.validityMileage ?? selectedCombo?.mileageLimit ?? 0
    ) || 0;
  const comboPrice =
    selectedCombo?.totalPriceAfterDiscount ?? selectedCombo?.price ?? 0;

  const handleAddToCart = () => {
    toast.info('Combo không thể đặt lịch – vui lòng dùng Pay Now để thanh toán cho xe đã chọn.');
  };

  const handleBookNow = async () => {
    if (!selectedCombo) return;
    if (!selectedVehicleId) {
      toast.error('Vui lòng chọn xe trước khi thanh toán');
      return;
    }

    // Show dialog if package already owned
    if (isComboOwned) {
      setShowAlreadyPurchasedDialog(true);
      return;
    }

    const payload = {
      packageId: selectedCombo.packageId ?? selectedCombo.id,
      vehicleId: Number(selectedVehicleId),
      paymentMethod: 'VNPay',
      returnUrl: `${window.location.origin}/payment/callback`,
    };

    try {
      setIsPurchasing(true);
      const purchaseResponse = await purchasePackageWithPayment(payload);

      const paymentUrl =
        purchaseResponse?.data?.paymentUrl ||
        purchaseResponse?.data?.payment?.paymentUrl ||
        purchaseResponse?.paymentUrl ||
        purchaseResponse?.payment?.paymentUrl;

      if (paymentUrl) {
        toast.info('Đang chuyển đến cổng thanh toán...');
        window.location.href = paymentUrl;
        return;
      }

      toast.success('Thanh toán thành công! Vui lòng kiểm tra mục Subscriptions.');
      clearCart();
      const response = await getActiveSubscriptionsByVehicle(selectedVehicleId);
      const list = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setActiveSubscriptions(list);
    } catch (err) {
      console.error('Purchase combo failed:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Không thể thanh toán gói. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsPurchasing(false);
    }
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

    if (packages.length === 0) {
      return <div className="empty-state">Hiện chưa có gói nào.</div>;
    }

    return packages.map((pkg, index) => {
      const packageId = pkg.packageId ?? pkg.id;
      const packageCode = pkg.packageCode ?? pkg.code;
      const packageName = pkg.packageName ?? pkg.name;

      const isActive =
        selectedCombo?.packageId === packageId || selectedCombo?.id === packageId;

      return (
        <button
          key={packageId}
          className={`product-list-item ${isActive ? 'active' : ''}`}
          type="button"
          onClick={() => setSelectedCombo(pkg)}
        >
          <span className="product-index">{String(index + 1).padStart(2, '0')}</span>
          <div className="product-meta">
            <p className="product-name">{pkg.packageName ?? pkg.name}</p>
            <p className="product-category">{pkg.category ?? pkg.packageCategory}</p>
          </div>
          <div className="product-price-block">
            <span className="product-price">
              {formatCurrency(pkg.totalPriceAfterDiscount ?? pkg.price ?? 0)}
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

        <div className="vehicle-context">
          <label className="context-label">Chọn xe để xem quyền lợi combo</label>
          {loadingVehicles ? (
            <div className="empty-state small">Đang tải danh sách xe...</div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state small">
              Bạn chưa có xe nào.{' '}
              <button className="link-button" onClick={() => navigate('/register-vehicle')}>
                Đăng ký xe
              </button>
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
            <p className="context-hint">Vehicle comes from your booking and cannot be changed here.</p>
          )}
          {loadingSubscriptions && selectedVehicleId && (
            <p className="context-hint">Đang kiểm tra các gói bạn đã sở hữu...</p>
          )}
        </div>

        <div className="product-layout">
          <aside className="product-list">{renderList()}</aside>

          <section className="product-detail-card">
            <div className="detail-pill">Select your package</div>
            {selectedCombo && (
              <span className="detail-badge purchase-only">
                Gói combo chỉ có thể thanh toán
              </span>
            )}

            {selectedCombo ? (
              <>
                <h1 className="detail-title">
                  {selectedCombo.packageName ?? selectedCombo.name}
                </h1>
                <p className="detail-category-label">
                  {selectedCombo.category ?? selectedCombo.packageCategory}
                </p>
                <p className="detail-description">{selectedCombo.description}</p>

                <div className="detail-stats">
                  <div className="stat-card">
                    <span className="stat-label">Thời hạn</span>
                    <strong className="stat-value">{comboDuration} ngày</strong>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Giới hạn số km</span>
                    <strong className="stat-value">
                      {comboMileage.toLocaleString('vi-VN')} km
                    </strong>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Giá gói</span>
                    <strong className="stat-value price">
                      {formatCurrency(comboPrice)}
                    </strong>
                  </div>
                </div>

                <div className="detail-actions">
                  <button
                    type="button"
                    className="action-btn solid"
                    onClick={handleBookNow}
                    disabled={isPurchasing}
                  >
                    <i className="bi bi-calendar-plus" />{' '}
                    {isPurchasing ? 'Đang xử lý...' : 'Thanh toán ngay'}
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">Chọn một gói để xem chi tiết</div>
            )}
          </section>
        </div>
        <Cart />
      </div>

      {/* Already Purchased Dialog - Simple notification with only Close button */}
      {showAlreadyPurchasedDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999
            }}
            onClick={() => setShowAlreadyPurchasedDialog(false)}
          />
          <div style={{
            position: 'relative',
            zIndex: 10000,
            width: '90%',
            maxWidth: '500px',
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '32px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <i className="bi bi-info-circle-fill" style={{ fontSize: '32px', color: '#3b82f6' }}></i>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                Gói đã được mua
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                Bạn đã mua gói "{selectedCombo?.packageName || 'này'}" cho xe đã chọn. Vui lòng sử dụng hết gói hiện tại trước khi mua gói mới.
              </p>
              <button
                onClick={() => setShowAlreadyPurchasedDialog(false)}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderRadius: '25px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '15px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1f1f1f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCombo;
