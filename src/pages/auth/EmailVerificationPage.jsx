import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { emailVerificationAPI } from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // Lấy token và email từ query string
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const email = params.get('email');

      if (!token || !email) {
        setError('Liên kết xác minh không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        // Gọi API xác minh email
        const response = await emailVerificationAPI.verifyEmail(token, email);

        // Xác minh thành công
        setSuccess('Email đã được xác minh thành công! Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        console.error('Verification error:', error);
        
        if (error.response?.data) {
          const data = error.response.data;
          if (data.message) {
            setError(data.message);
          } else {
            setError('Liên kết xác minh không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu email xác minh mới.');
          }
        } else if (error.message === 'Network Error') {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        } else {
          setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [location, navigate]);

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
            {/* Cột nội dung */}
            <div
              style={{ backgroundColor: 'transparent' }}
              className="col col-md-4 d-flex align-items-center justify-content-center"
            >
              <div className="card-body text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <h3
                  style={{
                    fontFamily:
                      "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                  }}
                  className="mb-4"
                >
                  Xác minh Email
                </h3>

                {/* Loading state */}
                {loading && (
                  <div className="alert alert-info" role="alert">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xác minh email...
                  </div>
                )}

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
                    <br />
                    <Link to="/resend-verification" className="text-decoration-none" style={{ color: '#8B0000' }}>
                      Gửi lại email xác minh
                    </Link>
                  </div>
                )}
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

        .left-col img {
          width: 100%;
          height: 100vh;
          object-fit: cover;
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

export default EmailVerificationPage;