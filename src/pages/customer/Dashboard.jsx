// src/pages/customer/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import VehicleFlipCard from '../../components/VehicleFlipCard';
import appointmentService from '../../services/appointmentService';
import {
  getActiveSubscriptionsByVehicle,
  getApplicableServicesByVehicle,
  getSubscriptionDetail,
  getSubscriptionUsage,
} from '../../services/productService';
import MainLayout from '../../components/layout/MainLayout';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Home.css';
import './Dashboard.css';

const extractApiList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const asArray = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.value)) return value.value;
  return null;
};

const findArrayDeep = (obj, preferredKeys = [], visited = new WeakSet()) => {
  if (!obj || typeof obj !== 'object') return [];
  if (visited.has(obj)) return [];
  visited.add(obj);

  for (const key of preferredKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const arr = asArray(obj[key]);
      if (arr && arr.length) return arr;
    }
  }

  for (const value of Object.values(obj)) {
    const arr = asArray(value);
    if (arr && arr.length) return arr;
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      const arr = findArrayDeep(value, preferredKeys, visited);
      if (arr.length) return arr;
    }
  }

  return [];
};

const normalizeServiceEntry = (service, fallbackKey = '') => {
  if (!service) {
    return {
      serviceId: fallbackKey,
      serviceName: 'Service',
      includedUses: null,
      remainingUses: null,
      usedCount: 0,
      lastUsedDate: null,
      lastUsedAppointmentId: null,
      usagePercentage: null,
      isFullyUsed: null,
    };
  }

  const serviceId =
    service.serviceId ||
    service.id ||
    service.maintenanceServiceId ||
    service.subscriptionServiceId ||
    service.service?.serviceId ||
    fallbackKey;

  return {
    serviceId,
    serviceName:
      service.serviceName ||
      service.name ||
      service.maintenanceServiceName ||
      service.service?.serviceName ||
      'Service',
    includedUses:
      service.includedUses ??
      service.totalAllowedQuantity ??
      service.quantity ??
      service.totalUses ??
      service.allowedUses ??
      service.usageLimit ??
      service.quota ??
      service.maxUsage ??
      null,
    remainingUses:
      service.remainingUses ??
      service.remainingCount ??
      service.remainingQuantity ??
      service.remaining ??
      null,
    usedCount:
      service.usedCount ??
      service.timesUsed ??
      service.quantityUsed ??
      service.usageCount ??
      service.usedQuantity ??
      0,
    lastUsedDate: service.lastUsedDate ?? service.usedAt ?? null,
    lastUsedAppointmentId: service.lastUsedAppointmentId ?? null,
    usagePercentage: service.usagePercentage ?? null,
    isFullyUsed: service.isFullyUsed ?? null,
  };
};

const extractSubscriptionServices = (detail) => {
  if (!detail) return [];
  const preferredKeys = [
    'packageServices',
    'services',
    'includedServices',
    'packageServiceDetails',
    'subscriptionServices',
    'serviceList',
  ];
  const arr = findArrayDeep(detail, preferredKeys);
  return arr.map((service, index) => normalizeServiceEntry(service, `detail-${index}`));
};

const extractUsageEntries = (usage) => {
  if (!usage) return [];
  const preferredKeys = [
    'serviceUsages',
    'services',
    'usageDetails',
    'entries',
    'history',
    'items',
    'subscriptionServices',
  ];
  return findArrayDeep(usage, preferredKeys);
};

const formatDate = (value) => {
  if (!value) return 'â€”';
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch {
    return value;
  }
};

const deriveServicesFromUsage = (entries = []) => {
  const deduped = [];
  const seen = new Set();

  entries.forEach((entry, index) => {
    const key =
      entry.serviceId ||
      entry.maintenanceServiceId ||
      entry.subscriptionServiceId ||
      entry.id ||
      entry.serviceName ||
      `usage-${index}`;

    if (seen.has(key)) return;
    seen.add(key);

    deduped.push(normalizeServiceEntry(entry, key));
  });

  return deduped;
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleModalLoading, setVehicleModalLoading] = useState(false);
  const [vehicleModalError, setVehicleModalError] = useState('');
  const [modalVehicle, setModalVehicle] = useState(null);
  const [modalPackages, setModalPackages] = useState([]);
  const [modalServices, setModalServices] = useState([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [selectedSubscriptionTitle, setSelectedSubscriptionTitle] = useState('');
  const [subscriptionDetailLoading, setSubscriptionDetailLoading] = useState(false);
  const [subscriptionDetailError, setSubscriptionDetailError] = useState('');
  const [selectedSubscriptionDetail, setSelectedSubscriptionDetail] = useState(null);
  const [selectedSubscriptionUsage, setSelectedSubscriptionUsage] = useState(null);

  const subscriptionInfo = useMemo(() => {
    if (!selectedSubscriptionDetail) return null;
    if (selectedSubscriptionDetail.subscription) return selectedSubscriptionDetail.subscription;
    if (selectedSubscriptionDetail.data?.subscription) return selectedSubscriptionDetail.data.subscription;
    return selectedSubscriptionDetail;
  }, [selectedSubscriptionDetail]);

  const usageEntries = useMemo(
    () => extractUsageEntries(selectedSubscriptionUsage),
    [selectedSubscriptionUsage]
  );

  const usageDerivedServices = useMemo(
    () => deriveServicesFromUsage(usageEntries),
    [usageEntries]
  );

  const includedServices = useMemo(() => {
    const source = subscriptionInfo || selectedSubscriptionDetail;
    const fromDetail = extractSubscriptionServices(source || {});
    if (fromDetail.length > 0) return fromDetail;
    return usageDerivedServices;
  }, [subscriptionInfo, selectedSubscriptionDetail, usageDerivedServices]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // XÃ³a localStorage cÅ© (khÃ´ng cÃ²n dÃ¹ng ná»¯a)
    localStorage.removeItem('deletedVehicles');

    loadDashboardData();

    // Reload data when user navigates back to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('ðŸ‘ï¸ Page visible again - reloading data');
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const vehiclesRes = await appointmentService.getMyVehicles();

      console.log('ðŸš— Vehicles from API:', vehiclesRes);

      // Map vehicles to dashboard format - chá»‰ filter xe Ä‘Ã£ xÃ³a tá»« backend
      const mappedVehicles = (vehiclesRes.data || [])
        .filter(vehicle => {
          // Chá»‰ filter out backend soft-deleted vehicles
          const isDeleted = vehicle.isDeleted || vehicle.IsDeleted || false;
          if (isDeleted) {
            console.log(`ðŸ—‘ï¸ Filtering out deleted vehicle: ${vehicle.licensePlate}`);
            return false;
          }
          return true;
        })
        .map(vehicle => ({
          id: vehicle.vehicleId,
          model: vehicle.fullModelName || vehicle.modelName,
          vin: vehicle.vin,
          year: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).getFullYear() : null,
          nextService: vehicle.nextMaintenanceDate,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
          mileage: vehicle.mileage
        }));

      setVehicles(mappedVehicles);

    } catch (error) {
      console.error('âŒ Error loading dashboard data:', error);
      setError('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u. Vui lÃ²ng thá»­ láº¡i sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = async (vehicleId, updatedData) => {
    try {
      console.log('âœï¸ Attempting to edit vehicle ID:', vehicleId);

      // Gá»i API Ä‘á»ƒ update xe trong database
      const response = await appointmentService.updateMyVehicle(vehicleId, updatedData);
      console.log('âœ… Vehicle updated successfully:', response);

      // Hiá»ƒn thá»‹ thÃ´ng bÃ¡o thÃ nh cÃ´ng
      toast.success('âœï¸ Cáº­p nháº­t thÃ´ng tin xe thÃ nh cÃ´ng!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reload láº¡i dá»¯ liá»‡u tá»« server Ä‘á»ƒ Ä‘áº£m báº£o Ä‘á»“ng bá»™
      setTimeout(() => {
        loadDashboardData();
      }, 500);

    } catch (error) {
      console.error('âŒ Error editing vehicle:', error);

      // Láº¥y thÃ´ng bÃ¡o lá»—i chi tiáº¿t
      let errorMessage = 'CÃ³ lá»—i xáº£y ra khi cáº­p nháº­t xe. Vui lÃ²ng thá»­ láº¡i.';

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dá»¯ liá»‡u khÃ´ng há»£p lá»‡.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Báº¡n khÃ´ng cÃ³ quyá»n sá»­a xe nÃ y.';
      } else if (error.response?.status === 404) {
        errorMessage = 'KhÃ´ng tÃ¬m tháº¥y xe cáº§n sá»­a.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`âŒ ${errorMessage}`, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      throw error;
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      console.log('ðŸ—‘ï¸ Attempting to delete vehicle ID:', vehicleId);

      // Gá»i API Ä‘á»ƒ xÃ³a xe trong database
      const response = await appointmentService.deleteMyVehicle(vehicleId);
      console.log('âœ… Vehicle deleted successfully in database:', response);

      // XÃ³a xe khá»i UI sau khi API thÃ nh cÃ´ng
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));

      // Hiá»ƒn thá»‹ thÃ´ng bÃ¡o thÃ nh cÃ´ng
      toast.success('ðŸ—‘ï¸ XÃ³a xe thÃ nh cÃ´ng!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reload láº¡i dá»¯ liá»‡u tá»« server Ä‘á»ƒ Ä‘áº£m báº£o Ä‘á»“ng bá»™
      setTimeout(() => {
        loadDashboardData();
      }, 1000);

    } catch (error) {
      console.error('âŒ Error deleting vehicle:', error);

      // Láº¥y thÃ´ng bÃ¡o lá»—i chi tiáº¿t
      let errorMessage = 'CÃ³ lá»—i xáº£y ra khi xÃ³a xe. Vui lÃ²ng thá»­ láº¡i.';

      if (error.response?.status === 405) {
        errorMessage = 'PhÆ°Æ¡ng thá»©c xÃ³a khÃ´ng Ä‘Æ°á»£c há»— trá»£. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Báº¡n khÃ´ng cÃ³ quyá»n xÃ³a xe nÃ y.';
      } else if (error.response?.status === 404) {
        errorMessage = 'KhÃ´ng tÃ¬m tháº¥y xe cáº§n xÃ³a.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`âŒ ${errorMessage}`, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleViewVehicleDetails = async (vehicle) => {
    if (!vehicle) return;
    const vehicleId = vehicle.id || vehicle.vehicleId;
    setModalVehicle(vehicle);
    setShowVehicleModal(true);
    setVehicleModalLoading(true);
    setVehicleModalError('');
    try {
      const [packagesRes, servicesRes] = await Promise.all([
        getActiveSubscriptionsByVehicle(vehicleId),
        getApplicableServicesByVehicle(vehicleId),
      ]);
      setModalPackages(extractApiList(packagesRes));
      setModalServices(extractApiList(servicesRes));
    } catch (err) {
      console.error('Error loading vehicle entitlements:', err);
      setVehicleModalError('Unable to load package and service data for this vehicle.');
      setModalPackages([]);
      setModalServices([]);
    } finally {
      setVehicleModalLoading(false);
    }
  };

  const handleViewSubscriptionDetail = async (subscription) => {
    const subscriptionId = subscription?.subscriptionId || subscription?.id;
    if (!subscriptionId) {
      toast.error('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin subscription Ä‘á»ƒ xem chi tiáº¿t.');
      return;
    }

    const sameSelection = subscriptionId === selectedSubscriptionId;
    if (sameSelection && selectedSubscriptionDetail && !subscriptionDetailLoading) {
      // Collapse if already showing
      setSelectedSubscriptionId(null);
      setSelectedSubscriptionTitle('');
      setSelectedSubscriptionDetail(null);
      setSelectedSubscriptionUsage(null);
      setSubscriptionDetailError('');
      return;
    }

    setSelectedSubscriptionId(subscriptionId);
    setSelectedSubscriptionTitle(subscription.packageName || subscription.name || 'Subscription');
    setSubscriptionDetailLoading(true);
    setSubscriptionDetailError('');
    setSelectedSubscriptionDetail(null);
    setSelectedSubscriptionUsage(null);

    try {
      const [detailRes, usageRes] = await Promise.all([
        getSubscriptionDetail(subscriptionId),
        getSubscriptionUsage(subscriptionId),
      ]);
      setSelectedSubscriptionDetail(detailRes?.data || detailRes);
      setSelectedSubscriptionUsage(usageRes?.data || usageRes);
    } catch (err) {
      console.error('Error loading subscription detail:', err);
      setSubscriptionDetailError('KhÃ´ng thá»ƒ táº£i chi tiáº¿t gÃ³i. Vui lÃ²ng thá»­ láº¡i sau.');
    } finally {
      setSubscriptionDetailLoading(false);
    }
  };

  const closeVehicleModal = () => {
    setShowVehicleModal(false);
    setVehicleModalLoading(false);
    setVehicleModalError('');
    setModalVehicle(null);
    setModalPackages([]);
    setModalServices([]);
    setSelectedSubscriptionId(null);
    setSelectedSubscriptionTitle('');
    setSelectedSubscriptionDetail(null);
    setSelectedSubscriptionUsage(null);
    setSubscriptionDetailLoading(false);
    setSubscriptionDetailError('');
  };

  return (
    <MainLayout>
      {/* Dashboard Content */}
      <div className="dashboard-container" style={{ marginTop: '20px', minHeight: '60vh' }}>
        <div className="container">
          <header className="dashboard-header mb-5">
            <h1 className="mb-2 text-center" style={{ fontSize: '2rem', fontWeight: 600 }}>
              Welcome  , {user?.fullName || user?.name || user?.username || 'KhÃ¡ch hÃ ng'}!
            </h1>
            {/* <p className="text-muted">Quáº£n lÃ½ thÃ´ng tin xe vÃ  lá»‹ch dá»‹ch vá»¥ cá»§a báº¡n</p> */}
          </header>

          <div className="dashboard-content">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <section className="dashboard-section mb-5">
                  <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Your Vehicles</h2>
                  <div>
                    {vehicles.length > 0 ? (
                      <div className="vehicles-grid d-flex flex-wrap" style={{ gap: '0.75rem' }}>
                        {vehicles.map(vehicle => (
                          <div key={vehicle.id} style={{ width: 'calc(50% - 0.375rem)' }}>
                            <VehicleFlipCard
                              vehicle={vehicle}
                              onEdit={handleEditVehicle}
                              onDelete={handleDeleteVehicle}
                              onViewDetails={() => handleViewVehicleDetails(vehicle)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        You have not registered any vehicles yet. <Link to="/register-vehicle">Register a vehicle now</Link>
                      </div>
                    )}
                  </div>
                </section>

              </>
            )}
      </div>
    </div>
  </div>

      {showVehicleModal && (
        <div className="vehicle-modal-backdrop" role="dialog" aria-modal="true">
          <div className="vehicle-modal">
            <div className="vehicle-modal-header">
              <div>
                <p className="vehicle-modal-kicker">Goi & dich vu</p>
                <h3 className="vehicle-modal-title">{modalVehicle?.model || 'Vehicle'}</h3>
                <div className="vehicle-meta-row">
                  <span className="pill">{modalVehicle?.licensePlate || 'N/A'}</span>
                  <span className="pill pill-ghost">VIN: {modalVehicle?.vin || 'N/A'}</span>
                </div>
              </div>
              <button type="button" className="vehicle-modal-close" aria-label="Close" onClick={closeVehicleModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {vehicleModalError && <div className="alert alert-danger">{vehicleModalError}</div>}

            {vehicleModalLoading ? (
              <div className="vehicle-modal-loading">
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Dang tai...</span>
                </div>
              </div>
            ) : (
              <div className="vehicle-modal-grid">
                <div className="vehicle-modal-card">
                  <div className="vehicle-card-header">
                    <div>
                      <p className="vehicle-card-kicker">Goi dang kich hoat</p>
                      <h4>Active combo packages</h4>
                    </div>
                  </div>
                  {modalPackages.length > 0 ? (
                    <div className="combo-list">
                      {modalPackages.map(pkg => (
                        <div className="combo-item" key={pkg.subscriptionId || pkg.packageId}>
                          <div className="combo-title-row">
                            <h5>{pkg.packageName || pkg.name}</h5>
                            <span className="status-badge">{pkg.statusName || pkg.status || 'Active'}</span>
                          </div>
                          <div className="combo-meta">
                            Hieu luc: {pkg.startDate ? new Date(pkg.startDate).toLocaleDateString('vi-VN') : '—'} - {pkg.expiryDate ? new Date(pkg.expiryDate).toLocaleDateString('vi-VN') : '—'}
                          </div>
                          <button type="button" className="subscription-detail-btn" onClick={() => handleViewSubscriptionDetail(pkg)}>
                            {selectedSubscriptionId === (pkg.subscriptionId || pkg.packageId) ? 'Thu gon' : 'Xem chi tiet'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="vehicle-modal-empty">Chua co combo dang hoat dong cho xe nay.</p>
                  )}
                </div>

                <div className="vehicle-modal-card">
                  <div className="vehicle-card-header">
                    <div>
                      <p className="vehicle-card-kicker">Dich vu di kem</p>
                      <h4>Services included</h4>
                    </div>
                  </div>
                  {modalServices.length > 0 ? (
                    <div className="vehicle-modal-tags">
                      {modalServices.map(service => (
                        <span key={service.serviceId || service.maintenanceServiceId || service.id}>{service.serviceName || service.name}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="vehicle-modal-empty">Chua co dich vu nao cho xe nay (hoac chua mua combo).</p>
                  )}
                </div>
              </div>
            )}

            {selectedSubscriptionId && !vehicleModalLoading && (
              <div className="vehicle-modal-card">
                <div className="vehicle-card-header">
                  <div>
                    <p className="vehicle-card-kicker">Thong tin goi</p>
                    <h4>{selectedSubscriptionTitle || 'Subscription'}</h4>
                  </div>
                </div>

                {subscriptionDetailError && <div className="alert alert-danger">{subscriptionDetailError}</div>}

                {subscriptionDetailLoading ? (
                  <div className="vehicle-modal-loading">
                    <div className="spinner-border text-dark" role="status">
                      <span className="visually-hidden">Dang tai...</span>
                    </div>
                  </div>
                ) : selectedSubscriptionDetail ? (
                  <>
                    <div className="subscription-info-grid">
                      <div>
                        <p className="muted-label">Ma goi</p>
                        <strong>{subscriptionInfo?.subscriptionCode || subscriptionInfo?.code || '—'}</strong>
                      </div>
                      <div>
                        <p className="muted-label">Trang thai</p>
                        <strong>{subscriptionInfo?.statusName || subscriptionInfo?.status || '—'}</strong>
                      </div>
                      <div>
                        <p className="muted-label">Kich hoat</p>
                        <strong>{formatDate(subscriptionInfo?.startDate || subscriptionInfo?.activatedAt)}</strong>
                      </div>
                      <div>
                        <p className="muted-label">Het han</p>
                        <strong>{formatDate(subscriptionInfo?.expiryDate || subscriptionInfo?.endDate)}</strong>
                      </div>
                    </div>

                    <div className="vehicle-modal-section">
                      <h5>Services in this package</h5>
                      {includedServices.length > 0 ? (
                        <ul className="vehicle-modal-list">
                          {includedServices.map((service, index) => {
                            const total = service.includedUses ?? null;
                            const remaining = service.remainingUses ?? null;
                            const used = total != null && remaining != null
                              ? Math.max(total - remaining, 0)
                              : service.usedCount ?? 0;
                            const progress = total
                              ? Math.min(100, Math.round((used / total) * 100))
                              : service.usagePercentage != null
                                ? Math.min(100, Math.round(service.usagePercentage))
                                : null;

                            return (
                              <li key={service.serviceId || service.id || index}>
                                <div className="service-row">
                                  <div>
                                    <span>{service.serviceName || 'Service'}</span>
                                    <div className="muted-label mt-1">
                                      {total != null ? `Tong: ${total}` : 'Chua co quota'}
                                      {remaining != null ? ` · Con: ${remaining}` : ''}
                                      {service.lastUsedDate ? ` · Lan cuoi: ${formatDate(service.lastUsedDate)}` : ''}
                                    </div>
                                  </div>
                                  {progress !== null && (
                                    <span className="pill pill-ghost">{progress}% used</span>
                                  )}
                                </div>
                                {progress !== null && (
                                  <div className="usage-bar">
                                    <div className="usage-bar-fill" style={{ width: `${progress}%` }}></div>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="vehicle-modal-empty">Khong tim thay danh sach dich vu cua goi nay.</p>
                      )}
                    </div>

                    <div className="vehicle-modal-section">
                      <h5>Usage history</h5>
                      {usageEntries.length > 0 ? (
                        <ul className="vehicle-modal-list">
                          {usageEntries.map((entry, index) => (
                            <li key={entry.usageId || entry.serviceId || index}>
                              <div>
                                <strong>{entry.serviceName || entry.name || 'Dich vu'}</strong>
                              </div>
                              <small>
                                Da dung: {entry.usedCount ?? entry.timesUsed ?? entry.quantityUsed ?? entry.usageCount ?? 0}
                                {entry.remainingUses ?? entry.remainingCount ? ` · Con lai: ${entry.remainingUses ?? entry.remainingCount}` : ''}
                                {(entry.lastUsedDate || entry.usedAt) ? ` · Lan cuoi: ${formatDate(entry.lastUsedDate || entry.usedAt)}` : ''}
                              </small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="vehicle-modal-empty">Chua co lich su su dung cho goi nay.</p>
                      )}
                    </div>
                  </>
                ) : (
                  !subscriptionDetailError && (
                    <p className="vehicle-modal-empty">Chon "Xem chi tiet" de tai thong tin goi.</p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </MainLayout>
  );
};

export default CustomerDashboard;

