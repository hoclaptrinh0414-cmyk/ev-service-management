// src/components/AddVehicleModal.jsx
import React, { useState, useEffect } from 'react';
import { vehicleAPI, carBrandAPI, carModelAPI } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AddVehicleModal = ({ show, onHide }) => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    modelId: '',
    licensePlate: '',
    vin: '',
    color: '',
    purchaseDate: '',
    mileage: 0,
    insuranceNumber: '',        // ✅ THÊM MỚI
    insuranceExpiry: '',        // ✅ THÊM MỚI
    registrationExpiry: ''      // ✅ THÊM MỚI
  });

  const [selectedBrand, setSelectedBrand] = useState('');

  // Fetch brands khi modal mở
  useEffect(() => {
    if (show) {
      fetchBrands();
    }
  }, [show]);

  // Fetch models khi chọn brand
  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand);
    } else {
      setModels([]);
      setFormData(prev => ({ ...prev, modelId: '' }));
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    setLoadingBrands(true);
    setError('');
    try {
      console.log('🚗 Fetching car brands...');
      const result = await carBrandAPI.getActiveBrands();
      console.log('✅ Brands response:', result);

      const brandList = result.data || [];
      setBrands(brandList);

      if (brandList.length === 0) {
        setError('⚠️ Chưa có hãng xe nào. Vui lòng liên hệ admin để thêm hãng xe.');
      }
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
      setError('⚠️ Không thể tải danh sách hãng xe. Vui lòng thử lại sau hoặc liên hệ admin.');
      // Set empty array để form vẫn hiển thị
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brandId) => {
    setLoadingModels(true);
    setError('');
    try {
      console.log('🚗 Fetching models for brand:', brandId);
      const result = await carModelAPI.getModelsByBrand(brandId);
      console.log('✅ Models response:', result);

      const modelList = result.data || [];
      setModels(modelList);

      if (modelList.length === 0) {
        setError('⚠️ Hãng xe này chưa có mẫu xe nào. Vui lòng chọn hãng khác.');
      }
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      setError('⚠️ Không thể tải danh sách mẫu xe. Vui lòng thử lại.');
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.modelId) {
      setError('Vui lòng chọn mẫu xe');
      setLoading(false);
      return;
    }

    if (!formData.licensePlate.trim()) {
      setError('Vui lòng nhập biển số xe');
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Submitting vehicle data:', formData);

      // Lấy customerId từ user trong localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const customerId = user?.customerId || user?.id;

      // ✅ PAYLOAD MỚI theo BE (bỏ customerId, batteryHealthPercent, notes, isActive)
      const vehicleData = {
        modelId: parseInt(formData.modelId),
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        vin: formData.vin?.trim() || null,
        color: formData.color?.trim() || null,
        purchaseDate: formData.purchaseDate || null,
        mileage: parseInt(formData.mileage) || 0,
        insuranceNumber: formData.insuranceNumber?.trim() || null,
        insuranceExpiry: formData.insuranceExpiry || null,
        registrationExpiry: formData.registrationExpiry || null
      };

      console.log('📦 Final vehicle payload:', vehicleData);

      const result = await vehicleAPI.addVehicle(vehicleData);
      console.log('✅ Vehicle added successfully:', result);

      setSuccess('Đăng ký xe thành công!');

      // Reset form
      setTimeout(() => {
        setFormData({
          modelId: '',
          licensePlate: '',
          vin: '',
          color: '',
          purchaseDate: '',
          mileage: 0,
          insuranceNumber: '',
          insuranceExpiry: '',
          registrationExpiry: ''
        });
        setSelectedBrand('');
        setSuccess('');
        onHide();

        // Refresh trang để cập nhật danh sách xe
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('❌ Error adding vehicle:', error);
      setError(error.response?.data?.message || error.message || 'Không thể đăng ký xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      modelId: '',
      licensePlate: '',
      vin: '',
      color: '',
      purchaseDate: '',
      mileage: 0,
      insuranceNumber: '',
      insuranceExpiry: '',
      registrationExpiry: ''
    });
    setSelectedBrand('');
    setError('');
    setSuccess('');
    onHide();
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: 0
      }}>
        <div className="modal-dialog" style={{
          maxWidth: '1000px',
          width: '90%',
          margin: '2rem auto',
          position: 'relative'
        }}>
          <div className="modal-content" style={{
            minHeight: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-car-front-fill me-2"></i>
                Đăng ký xe mới
              </h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{
                padding: '2rem',
                maxHeight: 'none'
              }}>
                {error && !success && (
                  <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </div>
                )}

                <div className="row">
                  {/* Chọn hãng xe */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Hãng xe <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      disabled={loadingBrands}
                      required
                    >
                      <option value="">-- Chọn hãng xe --</option>
                      {brands.map(brand => (
                        <option key={brand.brandId} value={brand.brandId}>
                          {brand.brandName} {brand.country ? `(${brand.country})` : ''}
                        </option>
                      ))}
                    </select>
                    {loadingBrands && <small className="text-muted">Đang tải...</small>}
                  </div>

                  {/* Chọn mẫu xe */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Mẫu xe <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="modelId"
                      value={formData.modelId}
                      onChange={handleChange}
                      disabled={!selectedBrand || loadingModels}
                      required
                    >
                      <option value="">-- Chọn mẫu xe --</option>
                      {models.map(model => (
                        <option key={model.modelId} value={model.modelId}>
                          {model.modelName} {model.year ? `(${model.year})` : ''}
                        </option>
                      ))}
                    </select>
                    {loadingModels && <small className="text-muted">Đang tải...</small>}
                  </div>

                  {/* Biển số xe */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Biển số xe <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      placeholder="VD: 29A-12345"
                      required
                    />
                  </div>

                  {/* VIN */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">VIN (Số khung)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="vin"
                      value={formData.vin}
                      onChange={handleChange}
                      placeholder="VD: 5YJ3E1EA1JF000123"
                    />
                  </div>

                  {/* Màu xe */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Màu xe</label>
                    <input
                      type="text"
                      className="form-control"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="VD: Đen, Trắng, Xanh"
                    />
                  </div>

                  {/* Ngày mua */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ngày mua xe</label>
                    <input
                      type="date"
                      className="form-control"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Số km đã chạy */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Số km đã chạy</label>
                    <input
                      type="number"
                      className="form-control"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  {/* Số bảo hiểm */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Số bảo hiểm</label>
                    <input
                      type="text"
                      className="form-control"
                      name="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={handleChange}
                      placeholder="VD: BH123456"
                    />
                  </div>

                  {/* Hạn bảo hiểm */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Hạn bảo hiểm</label>
                    <input
                      type="date"
                      className="form-control"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Hạn đăng kiểm */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Hạn đăng kiểm</label>
                    <input
                      type="date"
                      className="form-control"
                      name="registrationExpiry"
                      value={formData.registrationExpiry}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Đăng ký
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

  <style>{`
        /* Backdrop - Lớp phủ tối */
        .modal-backdrop {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.6) !important;
          z-index: 9998 !important;
        }

        /* Override Bootstrap modal styles */
        .modal-content {
          border-radius: 12px !important;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5) !important;
          background: white !important;
        }

        .modal-header {
          border-bottom: 1px solid #dee2e6 !important;
          padding: 1rem 1.5rem !important;
        }

        .modal-footer {
          border-top: 1px solid #dee2e6 !important;
          padding: 1rem 1.5rem !important;
        }

        .form-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .text-danger {
          color: #dc3545;
        }

        .btn-primary {
          background-color: #000;
          border-color: #000;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #333;
          border-color: #333;
        }

        .btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default AddVehicleModal;
