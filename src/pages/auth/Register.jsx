import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.username || !formData.fullName || !formData.password || !formData.email) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Call register API
      const response = await authAPI.register(formData);
      console.log('Registration success:', response);

      // Registration successful
      setSuccess('Đăng ký thành công! Chúng tôi đã gửi email xác nhận, vui lòng kiểm tra hộp thư của bạn.');
      
      // Clear form
      setFormData({
        username: '',
        fullName: '',
        password: '',
        phone: '',
        email: '',
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.message) {
          setError(data.message);
        } else if (data.errors) {
          // Handle validation errors
          const errorMessages = Object.values(data.errors).flat().join(', ');
          setError(errorMessages);
        } else {
          setError('Đăng ký thất bại. Vui lòng thử lại.');
        }
      } else if (error.code === 'ERR_NETWORK') {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid p-0 h-100">
        <div className="card">
          <div className="row g-0 h-100">
            {/* Cột hình ảnh */}
            <div className="col-md-8 d-none d-md-block left-col h-auto">
              <img
                className="img-fluid"
                src="https://tsportline.com/cdn/shop/files/black-tesla-model-s-21-inch-aftermarket-wheels-tss-gloss-black-rear-1920-2_1600x.png?v=1680200206"
                alt="Tesla Model S"
              />
            </div>
            {/* Cột form */}
            <div style={{ backgroundColor: 'transparent' }} className="col col-md-4 d-flex align-items-center justify-content-center">
              <div className="card-body text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <h3
                  style={{ fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif" }}
                  className="mb-4"
                >
                  Sign up
                </h3>

                {/* Success message */}
                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      name="username"
                      placeholder="User Name *"
                      type="text"
                      className="form-control"
                      aria-label="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <input
                      name="fullName"
                      placeholder="Full Name *"
                      type="text"
                      className="form-control"
                      aria-label="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      name="password"
                      placeholder="Password * (min 6 characters)"
                      type="password"
                      className="form-control"
                      aria-label="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      name="phone"
                      placeholder="Phone (optional)"
                      type="tel"
                      className="form-control"
                      aria-label="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      name="email"
                      placeholder="Email *"
                      type="email"
                      className="form-control"
                      aria-label="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn login-btn w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Sign up
                      </>
                    )}
                  </button>
                </form>

                <div className="d-flex justify-content-center gap-3 mb-3">
                  <a href="#" className="social-icon" title="Đăng ký với Facebook">
                    <i className="bi bi-facebook fs-4"></i>
                  </a>
                  <a href="#" className="social-icon" title="Đăng ký với Google">
                    <i className="bi bi-google fs-4"></i>
                  </a>
                </div>

                <p className="text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none" style={{ color: '#8B0000' }}>
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

  <style>{`
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
        }

        .container,
        .card,
        .row {
          height: 100%;
          width: 100%;
        }

        .card {
          border-radius: 0;
          box-shadow: none;
          border: none;
        }

        .login-btn {
          background-color: black;
          color: white;
          transition: all 0.3s ease;
          border: none;
        }

        .login-btn:hover:not(:disabled) {
          background-color: #333;
          color: white;
          transform: scale(1.02);
          transition: transform 0.3s ease;
        }

        .login-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.65;
        }

        .social-icon {
          color: #6c757d;
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          color: #007bff;
          transform: scale(1.1);
        }

        .left-col img {
          width: 100%;
          height: 100vh;
          object-fit: cover;
        }

        .input-group-text {
          background-color: #f8f9fa;
          border-right: none;
        }

        .form-control {
          border-left: none;
        }

        .form-control:focus {
          border-color: #ced4da;
          box-shadow: none;
        }

        .form-control:disabled {
          background-color: #e9ecef;
        }

        .alert {
          text-align: left;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .row .col-md-4,
          .row .col-md-8 {
            width: 100%;
            height: auto;
          }
          
          .left-col img {
            height: auto;
          }
        }
      `}</style>
    </>
  );
};

export default Register;