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
      service.quantity ??
      service.totalUses ??
      service.allowedUses ??
      service.usageLimit ??
      service.quota ??
      service.maxUsage ??
      null,
    remainingUses: service.remainingUses ?? service.remainingCount ?? service.remaining ?? null,
    usedCount: service.usedCount ?? service.timesUsed ?? service.quantityUsed ?? service.usageCount ?? 0,
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
  if (!value) return '—';
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

    // Xóa localStorage cũ (không còn dùng nữa)
    localStorage.removeItem('deletedVehicles');

    loadDashboardData();

    // Reload data when user navigates back to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible again - reloading data');
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

      console.log('🚗 Vehicles from API:', vehiclesRes);

      // Map vehicles to dashboard format - chỉ filter xe đã xóa từ backend
      const mappedVehicles = (vehiclesRes.data || [])
        .filter(vehicle => {
          // Chỉ filter out backend soft-deleted vehicles
          const isDeleted = vehicle.isDeleted || vehicle.IsDeleted || false;
          if (isDeleted) {
            console.log(`🗑️ Filtering out deleted vehicle: ${vehicle.licensePlate}`);
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
      console.error('❌ Error loading dashboard data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = async (vehicleId, updatedData) => {
    try {
      console.log('✏️ Attempting to edit vehicle ID:', vehicleId);

      // Gọi API để update xe trong database
      const response = await appointmentService.updateMyVehicle(vehicleId, updatedData);
      console.log('✅ Vehicle updated successfully:', response);

      // Hiển thị thông báo thành công
      toast.success('✏️ Cập nhật thông tin xe thành công!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reload lại dữ liệu từ server để đảm bảo đồng bộ
      setTimeout(() => {
        loadDashboardData();
      }, 500);

    } catch (error) {
      console.error('❌ Error editing vehicle:', error);

      // Lấy thông báo lỗi chi tiết
      let errorMessage = 'Có lỗi xảy ra khi cập nhật xe. Vui lòng thử lại.';

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền sửa xe này.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy xe cần sửa.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
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
      console.log('🗑️ Attempting to delete vehicle ID:', vehicleId);

      // Gọi API để xóa xe trong database
      const response = await appointmentService.deleteMyVehicle(vehicleId);
      console.log('✅ Vehicle deleted successfully in database:', response);

      // Xóa xe khỏi UI sau khi API thành công
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));

      // Hiển thị thông báo thành công
      toast.success('🗑️ Xóa xe thành công!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reload lại dữ liệu từ server để đảm bảo đồng bộ
      setTimeout(() => {
        loadDashboardData();
      }, 1000);

    } catch (error) {
      console.error('❌ Error deleting vehicle:', error);

      // Lấy thông báo lỗi chi tiết
      let errorMessage = 'Có lỗi xảy ra khi xóa xe. Vui lòng thử lại.';

      if (error.response?.status === 405) {
        errorMessage = 'Phương thức xóa không được hỗ trợ. Vui lòng liên hệ quản trị viên.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xóa xe này.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy xe cần xóa.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
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
      toast.error('Không tìm thấy thông tin subscription để xem chi tiết.');
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
      setSubscriptionDetailError('Không thể tải chi tiết gói. Vui lòng thử lại sau.');
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
              Welcome  , {user?.fullName || user?.name || user?.username || 'Khách hàng'}!
            </h1>
            {/* <p className="text-muted">Quản lý thông tin xe và lịch dịch vụ của bạn</p> */}
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
            <button
              type="button"
              className="vehicle-modal-close"
              aria-label="Close"
              onClick={closeVehicleModal}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <h3 className="vehicle-modal-title">
              Chi tiết gói & dịch vụ - {modalVehicle?.model}
            </h3>
            <p className="vehicle-modal-subtitle">
              {modalVehicle?.licensePlate} • VIN: {modalVehicle?.vin || 'N/A'}
            </p>

            {vehicleModalError && (
              <div className="alert alert-danger">{vehicleModalError}</div>
            )}

            {vehicleModalLoading ? (
              <div className="vehicle-modal-loading">
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="vehicle-modal-section">
                  <h4>Active combo packages</h4>
                  {modalPackages.length > 0 ? (
                    <ul className="vehicle-modal-list">
                      {modalPackages.map(pkg => (
                        <li key={pkg.subscriptionId || pkg.packageId}>
                          <div>
                            <strong>{pkg.packageName || pkg.name}</strong>
                            <span className="status-badge">
                              {pkg.statusName || pkg.status || 'Active'}
                            </span>
                          </div>
                          <small>
                            Hiệu lực:{' '}
                            {pkg.startDate
                              ? new Date(pkg.startDate).toLocaleDateString('vi-VN')
                              : '—'}{' '}
                            -{' '}
                            {pkg.expiryDate
                              ? new Date(pkg.expiryDate).toLocaleDateString('vi-VN')
                              : '—'}
                          </small>
                          <button
                            type="button"
                            className="subscription-detail-btn"
                            onClick={() => handleViewSubscriptionDetail(pkg)}
                          >
                            {selectedSubscriptionId === (pkg.subscriptionId || pkg.packageId)
                              ? 'Thu gọn'
                              : 'Xem chi tiết'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vehicle-modal-empty">
                      No combos are currently active for this vehicle.
                    </p>
                  )}
                </div>

                <div className="vehicle-modal-section">
                  <h4>Services included in your combos</h4>
                  {modalServices.length > 0 ? (
                    <div className="vehicle-modal-tags">
                      {modalServices.map(service => (
                        <span
                          key={
                            service.serviceId ||
                            service.maintenanceServiceId ||
                            service.id
                          }
                        >
                          {service.serviceName || service.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="vehicle-modal-empty">
                      No included services for this vehicle (or no combos purchased).
                    </p>
                  )}
                </div>

                {selectedSubscriptionId && (
                  <div className="vehicle-modal-section">
                    <h4>Package details: {selectedSubscriptionTitle || 'Subscription'}</h4>
                    {subscriptionDetailError && (
                      <div className="alert alert-danger">{subscriptionDetailError}</div>
                    )}
                    {subscriptionDetailLoading ? (
                      <div className="vehicle-modal-loading">
                        <div className="spinner-border text-dark" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                      </div>
                    ) : selectedSubscriptionDetail ? (
                      <>
                        <ul className="subscription-info-list">
                          <li>
                            <strong>Package code:</strong>{' '}
                            {subscriptionInfo?.subscriptionCode || subscriptionInfo?.code || '—'}
                          </li>
                          <li>
                            <strong>Status:</strong>{' '}
                            {subscriptionInfo?.statusName || subscriptionInfo?.status || '—'}
                          </li>
                          <li>
                            <strong>Activated:</strong>{' '}
                            {formatDate(subscriptionInfo?.startDate || subscriptionInfo?.activatedAt)}
                          </li>
                          <li>
                            <strong>Expires:</strong>{' '}
                            {formatDate(subscriptionInfo?.expiryDate || subscriptionInfo?.endDate)}
                          </li>
                        </ul>

                        <div className="vehicle-modal-section">
                          <h5>Services in this package</h5>
                          {includedServices.length > 0 ? (
                            <ul className="vehicle-modal-list">
                              {includedServices.map((service, index) => (
                                <li key={service.serviceId || service.id || index}>
                                  <div className="service-row">
                                    <span>{service.serviceName || 'Service'}</span>
                                    <small>
                                      {service.includedUses != null
                                        ? `SL: ${service.includedUses}`
                                        : ''}
                                      {service.remainingUses != null
                                        ? ` • Còn lại: ${service.remainingUses}`
                                        : ''}
                                    </small>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="vehicle-modal-empty">
                              No service list found for this package.
                            </p>
                          )}
                        </div>

                        <div className="vehicle-modal-section">
                          <h5>Usage history</h5>
                          {usageEntries.length > 0 ? (
                            <ul className="vehicle-modal-list">
                              {usageEntries.map((entry, index) => (
                                <li key={entry.usageId || entry.serviceId || index}>
                                  <div>
                                    <strong>{entry.serviceName || entry.name || 'Dịch vụ'}</strong>
                                  </div>
                                  <small>
                                    Đã dùng:{' '}
                                    {entry.usedCount ??
                                      entry.timesUsed ??
                                      entry.quantityUsed ??
                                      entry.usageCount ??
                                      0}
                                    {entry.remainingUses ?? entry.remainingCount
                                      ? ` • Còn lại: ${entry.remainingUses ?? entry.remainingCount}`
                                      : ''}
                                    {(entry.lastUsedDate || entry.usedAt) &&
                                      ` • Lần cuối: ${formatDate(entry.lastUsedDate || entry.usedAt)}`}
                                  </small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="vehicle-modal-empty">
                              No usage data for this package.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      !subscriptionDetailError && (
                        <p className="vehicle-modal-empty">
                          Select "View details" to load the package information.
                        </p>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </MainLayout>
  );
};

export default CustomerDashboard;
