// src/pages/auth/ForgotPassword.jsx - FIXED VERSION - REPLACE YOUR ENTIRE ForgotPassword.jsx WITH THIS
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accountRecoveryService, handleApiError } from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập email hợp lệ.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Sending forgot password request for:', email);
      
      // FIXED: Use direct axios-style call that matches backend exactly
      const response = await fetch('/api/account/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      console.log('✅ Forgot password response:', data);
      
      if (response.ok && data.success) {
        setSuccess('Vui lòng kiểm tra email để đặt lại mật khẩu.');
        setEmail(''); // Clear form
        
        // Auto redirect sau 5 giây
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        setError(data.message || 'Có lỗi xảy ra.');
      }

    } catch (error) {
      console.error('❌ Forgot password error:', error);
      setError('Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid p-0 h-100">
        <div className="card"> 
          <div className="row g-0 h-100">
            <div className="col-md-8 d-none d-md-block left-col h-auto">
              <img
                className="img-fluid"
                src="https://tsportline.com/cdn/shop/files/black-tesla-model-s-21-inch-aftermarket-wheels-tss-gloss-black-rear-1920-2_1600x.png?v=1680200206"
                alt="Tesla Model S"
              />
            </div>
            <div className="col col-md-4 d-flex align-items-center justify-content-center">
              <div className="card-body text-center" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="mb-4">
                  <i className="bi bi-key-fill text-primary" style={{ fontSize: '3rem' }}></i>
                  <h3
                    className="mt-3"
                    style={{
                      fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif"
                    }}
                  >
                    Quên mật khẩu
                  </h3>
                  <p className="text-muted">
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                  </p>
                </div>

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                {!success && (
                  <form onSubmit={handleSubmit}>
                    <div className="input-group mb-3">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                          if (success) setSuccess('');
                        }}
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    <button type="submit" className="btn reset-btn w-100 mb-3" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-envelope-plus me-2"></i>
                          Gửi
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none text-muted">
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay lại đăng nhập
                  </Link>
                </div>

                {!success && (
                  <>
                    {/* Divider */}
                    <div className="divider-container my-4">
                      <hr className="divider-line" />
                      <span className="divider-text">hoặc</span>
                      <hr className="divider-line" />
                    </div>

                    <p className="text-muted mb-0">
                      Chưa có tài khoản?{' '}
                      <Link to="/register" className="text-decoration-none" style={{ color: '#8B0000' }}>
                        Đăng ký ngay
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .container, .card, .row {
          height: 100%;
          width: 100%;
        }
        .card {
          border-radius: 0;
          box-shadow: none;
          border: none;
        }
        .reset-btn {
          background-color: #28a745;
          color: white;
          transition: all 0.3s ease;
          border: none;
          font-weight: 500;
        }
        .reset-btn:hover:not(:disabled) {
          background-color: #218838;
          color: white;
          transform: scale(1.02);
        }
        .reset-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.65;
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
        .divider-container {
          display: flex;
          align-items: center;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background-color: #e0e0e0;
          border: none;
          margin: 0;
        }
        .divider-text {
          padding: 0 1rem;
          color: #666;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          .row .col-md-4, .row .col-md-8 {
            width: 100%;
            height: auto;
          }
          .left-col img {
            height: auto;
          }
          body {
            overflow-y: auto;
          }
        }
      `}</style>
    </>
  );
};

export default ForgotPassword;