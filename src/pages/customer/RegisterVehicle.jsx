// src/pages/customer/RegisterVehicle.jsx - TRANG ĐĂNG KÝ XE MỚI
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI, carBrandAPI, carModelAPI } from '../../services/apiService';
import FancyButton from '../../components/FancyButton';
import GlobalNavbar from '../../components/GlobalNavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Home.css';

const RegisterVehicle = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [formData, setFormData] = useState({
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

  const [selectedBrand, setSelectedBrand] = useState('');

  // Fetch brands khi component mount
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    fetchBrands();
  }, []);

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
    try {
      const result = await carBrandAPI.getActiveBrands();
      const brandList = result.data || [];
      setBrands(brandList);

      if (brandList.length === 0) {
        toast.warning('⚠️ Chưa có hãng xe nào. Vui lòng liên hệ admin.', {
          position: "bottom-right",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
      toast.error('⚠️ Không thể tải danh sách hãng xe.', {
        position: "bottom-right",
        autoClose: 3000
      });
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brandId) => {
    setLoadingModels(true);
    try {
      const result = await carModelAPI.getModelsByBrand(brandId);
      const modelList = result.data || [];
      setModels(modelList);

      if (modelList.length === 0) {
        toast.warning('⚠️ Hãng xe này chưa có mẫu xe nào.', {
          position: "bottom-right",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      toast.error('⚠️ Không thể tải danh sách mẫu xe.', {
        position: "bottom-right",
        autoClose: 3000
      });
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

    // Validation
    if (!formData.modelId) {
      toast.error('Vui lòng chọn mẫu xe', {
        position: "bottom-right",
        autoClose: 3000
      });
      setLoading(false);
      return;
    }

    if (!formData.licensePlate.trim()) {
      toast.error('Vui lòng nhập biển số xe', {
        position: "bottom-right",
        autoClose: 3000
      });
      setLoading(false);
      return;
    }

    try {
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

      console.log('📦 Submitting vehicle:', vehicleData);
      const result = await vehicleAPI.addVehicle(vehicleData);
      console.log('✅ Vehicle added:', result);

      toast.success('✅ Đăng ký xe thành công!', {
        position: "bottom-right",
        autoClose: 2000
      });

      // Redirect về trang chủ sau 2 giây
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error.response?.data?.message || error.message || 'Không thể đăng ký xe. Vui lòng thử lại.', {
        position: "bottom-right",
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalNavbar />

      {/* Form Container */}
      <div className="container" style={{ marginTop: '140px', marginBottom: '3rem', maxWidth: '1400px' }}>
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-dark text-white text-center py-4">
                <h3 className="mb-0">
                  <i className="bi bi-car-front-fill me-2"></i>
                  Đăng ký xe mới
                </h3>
              </div>

              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Hãng xe */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">
                        Hãng xe <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-lg"
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

                    {/* Mẫu xe */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">
                        Mẫu xe <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-lg"
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

                    {/* Biển số */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">
                        Biển số xe <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleChange}
                        placeholder="VD: 29A-12345"
                        required
                      />
                    </div>

                    {/* VIN */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">VIN (Số khung)</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="vin"
                        value={formData.vin}
                        onChange={handleChange}
                        placeholder="VD: 5YJ3E1EA1JF000123"
                      />
                    </div>

                    {/* Màu xe */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">Màu xe</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="VD: Đen, Trắng, Xanh"
                      />
                    </div>

                    {/* Ngày mua */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">Ngày mua xe</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Số km */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">Số km đã chạy</label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </div>

                    {/* Số bảo hiểm */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">Số bảo hiểm</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="insuranceNumber"
                        value={formData.insuranceNumber}
                        onChange={handleChange}
                        placeholder="VD: BH123456"
                      />
                    </div>

                    {/* Hạn bảo hiểm */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">Hạn bảo hiểm</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="insuranceExpiry"
                        value={formData.insuranceExpiry}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Hạn đăng kiểm */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">Hạn đăng kiểm</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="registrationExpiry"
                        value={formData.registrationExpiry}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex justify-content-center mt-4">
                    <FancyButton
                      type="submit"
                      disabled={loading}
                      variant="dark"
                    >
                      {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </FancyButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        body {
          background: #fff;
        }

        .card {
          border-radius: 0 !important;
        }

        .card-header {
          border-radius: 0 !important;
        }

        .form-label {
          color: #333;
          font-size: 0.95rem;
        }

        .form-control:focus, .form-select:focus {
          border-color: #000;
          box-shadow: 0 0 0 0.2rem rgba(0, 0, 0, 0.1);
        }

        .btn-dark {
          background: #000;
          border: none;
        }

        .btn-dark:hover {
          background: #333;
        }

        .text-danger {
          color: #dc3545;
        }
      `}</style>

      <ToastContainer />
    </>
  );
};

export default RegisterVehicle;
