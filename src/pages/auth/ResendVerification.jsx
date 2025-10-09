import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { emailVerificationAPI } from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ResendVerification = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng nhập email.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ.');
      setLoading(false);
      return;
    }

    try {
      const response = await emailVerificationAPI.resendVerification(email);
      console.log('Resend verification success:', response);
      
      setSuccess('Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Resend verification error:', error);
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.message) {
          setError(data.message);
        } else {
          setError('Gửi email xác minh thất bại. Vui lòng thử lại.');
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
                style={{
                  fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                }}
                className="mb-4"
              >
                Gửi lại email xác minh
              </h3>

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

              <form onSubmit={handleSubmit}>
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
                    value={email}
                    onChange={handleChange}
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
                      <i className="bi bi-envelope me-2"></i>
                      Gửi lại email
                    </>
                  )}
                </button>
              </form>

              <p className="text-muted">
                Already verified?{' '}
                <Link to="/login" className="text-decoration-none" style={{ color: '#8B0000' }}>
                  Login
                </Link>
              </p>
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
    </div>
  );
};

export default ResendVerification;