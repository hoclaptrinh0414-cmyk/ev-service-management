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

  // Handle social login success
  const handleSocialLoginSuccess = (result) => {
    console.log('Social login success:', result);
    setError('');
    navigate('/home');
  };

  // Handle social login error
  const handleSocialLoginError = (errorMessage) => {
    console.error('Social login error:', errorMessage);
    setError(errorMessage);
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
                
                {/* Divider */}
                <div className="divider-container mb-3">
                  <hr className="divider-line" />
                  <span className="divider-text">or</span>
                  <hr className="divider-line" />
                </div>
                
                {/* Social Login Buttons */}
                <div className="social-login-container mb-3">
                  <button className="social-btn facebook-btn" onClick={() => handleSocialLoginSuccess()}>
                    <i className="bi bi-facebook"></i>
                    <span>Continue with Facebook</span>
                  </button>
                  <button className="social-btn google-btn" onClick={() => handleSocialLoginSuccess()}>
                    <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
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
          font-weight: 500;
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

        /* Divider Styles */
        .divider-container {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
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
          font-weight: 500;
        }

        /* Social Login Container */
        .social-login-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        /* Base Social Button Styles */
        .social-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background-color: white;
          color: #333;
          font-size: 0.95rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
        }

        .social-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-decoration: none;
        }

        /* Facebook Button */
        .facebook-btn {
          border-color: #1877f2;
          background-color: #1877f2;
          color: white;
        }
        .facebook-btn:hover {
          background-color: #166fe5;
          border-color: #166fe5;
          color: white;
        }
        .facebook-btn i {
          font-size: 1.1rem;
        }

        /* Google Button */
        .google-btn {
          border-color: #dadce0;
          background-color: white;
          color: #3c4043;
        }
        .google-btn:hover {
          background-color: #f8f9fa;
          border-color: #c0c0c0;
          color: #3c4043;
        }
        .google-icon {
          flex-shrink: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .row .col-md-4,
          .row .col-md-8 {
            width: 100%;
            height: auto;
          }
          .left-col img {
            height: auto;
          }
          .social-btn {
            font-size: 0.9rem;
            padding: 0.7rem 0.8rem;
          }
        }

        @media (max-width: 576px) {
          .social-login-container {
            gap: 0.6rem;
          }
          .social-btn {
            padding: 0.65rem 0.75rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
};

export default Login;