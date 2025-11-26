import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenancePackageAPI, maintenanceServiceAPI } from '../../services/adminAPI';
import './MaintenancePackages.css';

const MaintenancePackages = () => {
  const queryClient = useQueryClient();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Add service modal
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    packageCode: '',
    packageName: '',
    description: '',
    validityPeriodInDays: 365,
    validityMileage: 20000,
    totalPriceAfterDiscount: 0,
    discountPercent: 0,
    imageUrl: '',
    isPopularPackage: false,
    status: 'Active',
    includedServices: [],
  });

  // Add service form
  const [serviceForm, setServiceForm] = useState({
    serviceId: '',
    quantityInPackage: 1,
    isIncludedInPackagePrice: true,
    additionalCostPerExtraQuantity: null,
  });

  // Queries
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['maintenance-packages', searchTerm, statusFilter, page, pageSize],
    queryFn: () =>
      maintenancePackageAPI.getAll({
        searchTerm,
        status: statusFilter || undefined,
        page,
        pageSize,
      }),
  });

  const { data: servicesData } = useQuery({
    queryKey: ['maintenance-services-active'],
    queryFn: () => maintenanceServiceAPI.getActive(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: maintenancePackageAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance-packages']);
      closeModal();
      alert('Tạo gói thành công!');
    },
    onError: (error) => {
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => maintenancePackageAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance-packages']);
      closeModal();
      alert('Cập nhật gói thành công!');
    },
    onError: (error) => {
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: maintenancePackageAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance-packages']);
      alert('Xóa gói thành công!');
    },
    onError: (error) => {
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: ({ id, data }) => maintenancePackageAPI.addService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance-packages']);
      closeAddServiceModal();
      alert('Thêm dịch vụ thành công!');
    },
    onError: (error) => {
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    },
  });

  // Data processing
  const packages = useMemo(() => {
    console.log('packagesData:', packagesData);

    // Response structure: { data: { items: [...], totalCount: 3 } }
    if (packagesData?.data?.data?.items) {
      return packagesData.data.data.items;
    }

    // Fallback: if response is already unwrapped
    const data = packagesData?.data || packagesData;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;

    return [];
  }, [packagesData]);

  const services = useMemo(() => {
    const data = servicesData?.data || servicesData;
    return Array.isArray(data) ? data : [];
  }, [servicesData]);

  // Handlers
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      packageCode: '',
      packageName: '',
      description: '',
      validityPeriodInDays: 365,
      validityMileage: 20000,
      totalPriceAfterDiscount: 0,
      discountPercent: 0,
      imageUrl: '',
      isPopularPackage: false,
      status: 'Active',
      includedServices: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setModalMode('edit');
    setSelectedPackage(pkg);
    setFormData({
      packageId: pkg.packageId,
      packageCode: pkg.packageCode || '',
      packageName: pkg.packageName || '',
      description: pkg.description || '',
      validityPeriodInDays: pkg.validityPeriodInDays || 365,
      validityMileage: pkg.validityMileage || 20000,
      totalPriceAfterDiscount: pkg.totalPriceAfterDiscount || 0,
      discountPercent: pkg.discountPercent || 0,
      imageUrl: pkg.imageUrl || '',
      isPopularPackage: pkg.isPopularPackage || false,
      status: pkg.status || 'Active',
      includedServices: pkg.includedServices || [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const openAddServiceModal = (pkg) => {
    setSelectedPackage(pkg);
    setServiceForm({
      serviceId: '',
      quantityInPackage: 1,
      isIncludedInPackagePrice: true,
      additionalCostPerExtraQuantity: null,
    });
    setIsAddServiceModalOpen(true);
  };

  const closeAddServiceModal = () => {
    setIsAddServiceModalOpen(false);
    setSelectedPackage(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleServiceFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      validityPeriodInDays: Number(formData.validityPeriodInDays),
      validityMileage: Number(formData.validityMileage),
      totalPriceAfterDiscount: Number(formData.totalPriceAfterDiscount),
      discountPercent: Number(formData.discountPercent),
    };

    if (modalMode === 'create') {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate({ id: selectedPackage.packageId, data: payload });
    }
  };

  const handleAddService = (e) => {
    e.preventDefault();
    const payload = {
      serviceId: Number(serviceForm.serviceId),
      quantityInPackage: Number(serviceForm.quantityInPackage),
      isIncludedInPackagePrice: serviceForm.isIncludedInPackagePrice,
      additionalCostPerExtraQuantity: serviceForm.additionalCostPerExtraQuantity
        ? Number(serviceForm.additionalCostPerExtraQuantity)
        : null,
    };

    addServiceMutation.mutate({ id: selectedPackage.packageId, data: payload });
  };

  const handleDelete = async (pkg) => {
    try {
      const canDeleteRes = await maintenancePackageAPI.canDelete(pkg.packageId);
      const canDelete = canDeleteRes?.data?.canDelete;

      if (!canDelete) {
        alert('Không thể xóa gói này vì đã có khách hàng đăng ký!');
        return;
      }

      if (window.confirm(`Xác nhận xóa gói "${pkg.packageName}"?`)) {
        deleteMutation.mutate(pkg.packageId);
      }
    } catch (error) {
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  return (
    <div className="maintenance-packages-page">
      <div className="page-header">
        <h1>Quản lý Gói Bảo Dưỡng</h1>
        <p>Quản lý các gói bảo dưỡng, dịch vụ bao gồm và giá cả</p>
      </div>

      {/* Filters */}
      <div className="panel">
        <div className="filters">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã gói..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button className="btn primary" onClick={openCreateModal}>
            <i className="bi bi-plus-circle"></i> Tạo gói mới
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="packages-grid">
        {isLoading ? (
          <div className="loading-state">Đang tải...</div>
        ) : packages.length === 0 ? (
          <div className="empty-state">Không tìm thấy gói nào</div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.packageId} className="package-card">
              {pkg.isPopularPackage && <div className="popular-badge">Phổ biến</div>}
              {pkg.imageUrl && (
                <div className="package-image">
                  <img src={pkg.imageUrl} alt={pkg.packageName} />
                </div>
              )}
              <div className="package-content">
                <div className="package-header">
                  <h3>{pkg.packageName}</h3>
                  <span className={`status-badge status-${pkg.statusDisplayName?.toLowerCase() || (pkg.status === 1 ? 'active' : 'inactive')}`}>
                    {pkg.statusDisplayName || (pkg.status === 1 ? 'Active' : 'Inactive')}
                  </span>
                </div>
                <p className="package-code">{pkg.packageCode}</p>
                <p className="package-description">{pkg.description}</p>

                <div className="package-details">
                  <div className="detail-item">
                    <i className="bi bi-calendar3"></i>
                    <span>{pkg.validityPeriodInDays} ngày</span>
                  </div>
                  <div className="detail-item">
                    <i className="bi bi-speedometer2"></i>
                    <span>{pkg.validityMileage?.toLocaleString()} km</span>
                  </div>
                  {pkg.discountPercent > 0 && (
                    <div className="detail-item discount">
                      <i className="bi bi-percent"></i>
                      <span>Giảm {pkg.discountPercent}%</span>
                    </div>
                  )}
                </div>

                <div className="package-price">
                  <span className="price-label">Giá:</span>
                  <span className="price-value">{formatCurrency(pkg.totalPriceAfterDiscount)}</span>
                </div>

                <div className="package-services">
                  <p className="services-label">
                    Bao gồm {pkg.totalServicesCount || pkg.includedServices?.length || 0} dịch vụ
                    {pkg.totalServiceQuantity && ` (${pkg.totalServiceQuantity} lượt)`}
                  </p>
                  {pkg.serviceNamesPreview && (
                    <p className="services-preview">{pkg.serviceNamesPreview}</p>
                  )}
                </div>

                <div className="package-actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => openEditModal(pkg)}
                    title="Chỉnh sửa"
                  >
                    <i className="bi bi-pencil"></i> Sửa
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => openAddServiceModal(pkg)}
                    title="Thêm dịch vụ"
                  >
                    <i className="bi bi-plus-circle"></i> Thêm DV
                  </button>
                  <button
                    className="btn btn-sm danger"
                    onClick={() => handleDelete(pkg)}
                    title="Xóa gói"
                  >
                    <i className="bi bi-trash"></i> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Tạo gói mới' : 'Chỉnh sửa gói'}</h3>
              <button className="btn-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid two-col">
                <label>
                  Mã gói *
                  <input
                    type="text"
                    name="packageCode"
                    value={formData.packageCode}
                    onChange={handleInputChange}
                    required
                    placeholder="PKG-EV-BASIC"
                  />
                </label>
                <label>
                  Tên gói *
                  <input
                    type="text"
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleInputChange}
                    required
                    placeholder="Combo EV cơ bản"
                  />
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  Mô tả
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Mô tả chi tiết về gói..."
                  />
                </label>
                <label>
                  Thời hạn (ngày) *
                  <input
                    type="number"
                    name="validityPeriodInDays"
                    value={formData.validityPeriodInDays}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </label>
                <label>
                  Quãng đường (km) *
                  <input
                    type="number"
                    name="validityMileage"
                    value={formData.validityMileage}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </label>
                <label>
                  Giá sau giảm (VND) *
                  <input
                    type="number"
                    name="totalPriceAfterDiscount"
                    value={formData.totalPriceAfterDiscount}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </label>
                <label>
                  Giảm giá (%) *
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                  />
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  URL hình ảnh
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </label>
                <label>
                  Trạng thái
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
                <label className="checkbox-label" style={{ gridColumn: '1 / -1' }}>
                  <input
                    type="checkbox"
                    name="isPopularPackage"
                    checked={formData.isPopularPackage}
                    onChange={handleInputChange}
                  />
                  <span>Đánh dấu là gói phổ biến</span>
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeModal}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {createMutation.isLoading || updateMutation.isLoading
                    ? 'Đang lưu...'
                    : modalMode === 'create'
                    ? 'Tạo gói'
                    : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddServiceModalOpen && (
        <div className="modal-backdrop" onClick={closeAddServiceModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm dịch vụ vào gói</h3>
              <button className="btn-close" onClick={closeAddServiceModal}>
                ×
              </button>
            </div>
            <p className="modal-subtitle">Gói: {selectedPackage?.packageName}</p>
            <form onSubmit={handleAddService}>
              <div className="form-grid">
                <label>
                  Chọn dịch vụ *
                  <select
                    name="serviceId"
                    value={serviceForm.serviceId}
                    onChange={handleServiceFormChange}
                    required
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    {services.map((service) => (
                      <option key={service.serviceId} value={service.serviceId}>
                        {service.serviceName} - {formatCurrency(service.basePrice)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Số lượng *
                  <input
                    type="number"
                    name="quantityInPackage"
                    value={serviceForm.quantityInPackage}
                    onChange={handleServiceFormChange}
                    required
                    min="1"
                  />
                </label>
                <label>
                  Chi phí thêm (nếu vượt số lượng)
                  <input
                    type="number"
                    name="additionalCostPerExtraQuantity"
                    value={serviceForm.additionalCostPerExtraQuantity || ''}
                    onChange={handleServiceFormChange}
                    min="0"
                    placeholder="Để trống nếu không áp dụng"
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isIncludedInPackagePrice"
                    checked={serviceForm.isIncludedInPackagePrice}
                    onChange={handleServiceFormChange}
                  />
                  <span>Bao gồm trong giá gói</span>
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeAddServiceModal}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={addServiceMutation.isLoading}
                >
                  {addServiceMutation.isLoading ? 'Đang thêm...' : 'Thêm dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePackages;
