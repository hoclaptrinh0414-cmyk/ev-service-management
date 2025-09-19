import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ.');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.forgotPassword(email);
      console.log('Forgot password success:', response);

      setMessage('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.message) {
          setError(data.message);
        } else {
          setError('Gửi yêu cầu thất bại. Vui lòng thử lại.');
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
            <div className="col-md-8 d-none d-md-block left-col h-auto">
              <img
                className="img-fluid"
                src="https://tsportline.com/cdn/shop/files/black-tesla-model-s-21-inch-aftermarket-wheels-tss-gloss-black-rear-1920-2_1600x.png?v=1680200206"
                alt="Tesla Model S"
              />
            </div>
            <div style={{ backgroundColor: 'transparent' }} className="col col-md-4 d-flex align-items-center justify-content-center">
              <div className="card-body text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <h3
                  style={{ fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif" }}
                  className="mb-4"
                >
                  Forgot Password
                </h3>

                {message && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {message}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn login-btn w-100 mb-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-right-circle me-2"></i>
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <Link to="/login" className="text-decoration-none text-muted mb-3 d-block">
                  Back to Login?
                </Link>

                <div className="d-flex justify-content-center gap-3 mb-3">
                  <a href="#" className="social-icon" title="Tiếp tục với Facebook">
                    <i className="bi bi-facebook fs-4"></i>
                  </a>
                  <a href="#" className="social-icon" title="Tiếp tục với Google">
                    <i className="bi bi-google fs-4"></i>
                  </a>
                  <a href="#" className="social-icon" title="Tiếp tục với Apple">
                    <i className="bi bi-apple fs-4"></i>
                  </a>
                </div>
                <p className="text-muted">
                  New user?{' '}
                  <Link to="/register" className="text-decoration-none" style={{ color: '#8B0000' }}>
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
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

export default ForgotPassword;