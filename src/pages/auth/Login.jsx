import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, authUtils } from '../../services/api';
import EmailVerificationModal from '../../components/EmailVerificationModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleLoginSuccess = (result) => {
    console.log('Login success result:', result);
    
    // Handle different response formats from backend
    let token, user;
    
    // Case 1: { token, user } format
    if (result.token && result.user) {
      token = result.token;
      user = result.user;
    }
    // Case 2: { data: { token, user } } format  
    else if (result.data && result.data.token && result.data.user) {
      token = result.data.token;
      user = result.data.user;
    }
    // Case 3: { accessToken, user } format (common in some backends)
    else if (result.accessToken && result.user) {
      token = result.accessToken;
      user = result.user;
    }
    // Case 4: { access_token, user } format
    else if (result.access_token && result.user) {
      token = result.access_token;
      user = result.user;
    }
    else {
      console.error('Unexpected login response format:', result);
      setError('Định dạng phản hồi không hợp lệ');
      return;
    }
    
    if (token && user) {
      authUtils.setAuth(token, user);
      console.log('Auth data saved to localStorage');
      console.log('Token:', token);
      console.log('User:', user);
      
      // Always redirect to home, let ProtectedRoute handle verification
      navigate('/home');
    } else {
      console.error('Missing token or user in response');
      setError('Dữ liệu đăng nhập không hợp lệ');
    }
  };

  const handleLoginError = (error) => {
    console.error('Login error:', error);
    
    // Check if it's a network error first
    if (error.message === 'Network error - Cannot connect to server') {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      return;
    }
    
    if (error.message === 'Request timeout') {
      setError('Kết nối bị timeout. Vui lòng thử lại.');
      return;
    }
    
    // Handle response errors
    if (error.response?.data) {
      const data = error.response.data;
      console.log('Error response data:', data);
      
      if (data.message) {
        const message = data.message.toLowerCase();
        
        if (message.includes('email') && (message.includes('verify') || message.includes('confirm'))) {
          // Email chưa được verify
          setUserEmail(data.user?.email || formData.username);
          setShowModal(true);
          setError('');
        } else if (message.includes('invalid') || message.includes('incorrect') || message.includes('wrong')) {
          setError('Tên đăng nhập hoặc mật khẩu không đúng');
        } else if (message.includes('locked') || message.includes('disabled') || message.includes('banned')) {
          setError('Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ');
        } else {
          setError(data.message);
        }
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại');
      }
    } else {
      setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate input
    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { username: formData.username });
      const result = await authAPI.login(formData);
      handleLoginSuccess(result);
    } catch (error) {
      handleLoginError(error);
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
                  Tesla Login
                </h3>
                
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
                      type="text"
                      className="form-control"
                      name="username"
                      placeholder="Enter your username"
                      value={formData.username}
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
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn login-btn w-100 mb-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </button>
                </form>
                
                <Link to="/forgot-password" className="text-decoration-none text-muted mb-3 d-block">
                  Forgot Password?
                </Link>
                
                <div className="d-flex justify-content-center gap-3 mb-3">
                  <a href="#" className="social-icon" title="Đăng nhập với Facebook">
                    <i className="bi bi-facebook fs-4"></i>
                  </a>
                  <a href="#" className="social-icon" title="Đăng nhập với Google">
                    <i className="bi bi-google fs-4"></i>
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

      {/* Email Verification Modal */}
      <EmailVerificationModal
        show={showModal}
        onHide={() => setShowModal(false)}
        email={userEmail}
      />

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

export default Login;