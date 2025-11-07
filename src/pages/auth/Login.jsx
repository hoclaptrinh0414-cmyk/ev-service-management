// src/pages/auth/Login.jsx - HOÀN CHỈNH - COPY FILE NÀY VÀO PROJECT
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authUtils } from '../../services/apiService';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerificationModal from '../../components/EmailVerificationModal';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import FacebookLoginButton from '../../components/FacebookLoginButton';
import FancyButton from '../../components/FancyButton';
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
  const { refreshUser } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  // ============================================
  // LOGIC REDIRECT DỰA VÀO ROLE TỪ API
  // ============================================
  const redirectBasedOnRole = (user) => {
    console.log('🔍 User from API:', user);

    // ✅ BE trả về lowercase từ api.js: roleName, roleId
    const role = user.roleName || user.RoleName || user.Role || user.role;
    const roleId = user.roleId || user.RoleId;

    console.log('📋 Role info:', { role, roleId });

    // ✅ CORRECT Role mapping based on backend:
    // RoleId 1 = Admin      → /admin
    // RoleId 2 = Staff      → /admin  
    // RoleId 3 = Technician → /technician
    // RoleId 4 = Customer   → /home
    
    if (roleId === 1 || role?.toLowerCase() === 'admin') {
      console.log('✅ Redirect Admin to /admin');
      navigate('/admin');
    } else if (roleId === 2 || role?.toLowerCase() === 'staff') {
      console.log('✅ Redirect Staff to /admin');
      navigate('/admin');
    } else if (roleId === 3 || role?.toLowerCase() === 'technician') {
      console.log('✅ Redirect Technician to /technician');
      // Copy token to technician-specific storage for backward compatibility
      const token = authUtils.getToken();
      if (token) {
        localStorage.setItem('technician_access_token', token);
        localStorage.setItem('technician_user_id', String(user.userId || user.UserId));
        localStorage.setItem('technician_full_name', user.fullName || user.FullName);
        localStorage.setItem('technician_role', role);
      }
      navigate('/technician');
    } else if (roleId === 4 || role?.toLowerCase() === 'customer') {
      // Customer
      console.log('✅ Redirect Customer to /home');
      navigate('/home');
    } else {
      // Default fallback
      console.log('⚠️ Unknown role, redirect to /home');
      navigate('/home');
    }
  };

  const handleLoginSuccess = (result) => {
    console.log('✅ Login success result:', result);

    // ✅ BE trả về PascalCase: { data: { User, Customer, Token } }
    // authService.login() đã tự động lưu token và user data vào localStorage
    // Chỉ cần lấy user từ localStorage và redirect
    const user = authUtils.getUser();

    if (user) {
      console.log('✅ User data from localStorage:', user);
      redirectBasedOnRole(user);
    } else {
      console.error('❌ No user data in localStorage after login');
      setError('Có lỗi xảy ra khi đăng nhập');
    }
  };

  const handleLoginError = (error) => {
    console.error('Login error:', error);
    
    if (error.message === 'Network error - Cannot connect to server') {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      return;
    }
    
    if (error.message === 'Request timeout') {
      setError('Kết nối bị timeout. Vui lòng thử lại.');
      return;
    }
    
    if (error.response?.data) {
      const data = error.response.data;
      console.log('Error response data:', data);
      
      if (data.message) {
        const message = data.message.toLowerCase();
        
        if (message.includes('email') && (message.includes('verify') || message.includes('confirm'))) {
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

    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { username: formData.username });
      // Sử dụng authService.login() để tự động lấy full profile
      await authService.login(formData.username, formData.password);

      await refreshUser();
      // authService.login() đã tự động lưu token và full profile vào localStorage
      // Chỉ cần redirect dựa vào role
      const user = authUtils.getUser();
      if (user) {
        redirectBasedOnRole(user);
      } else {
        setError('Có lỗi xảy ra khi đăng nhập');
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SOCIAL LOGIN HANDLERS - DÙNG COMPONENTS CÓ SẴN
  // ============================================
  const handleSocialLoginSuccess = (result) => {
    console.log('✅ Social login success:', result);
    handleLoginSuccess(result);
  };

  const handleSocialLoginError = (errorMessage) => {
    console.error('❌ Social login error:', errorMessage);
    setError(errorMessage);
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden' }}>
      <div className="card border-0" style={{ height: '100%', width: '100%', margin: 0, padding: 0 }}>
        <div className="row" style={{ height: '100%', margin: 0 }}>
          {/* Cột hình ảnh */}
          <div className="col-md-8 d-none d-md-block" style={{ height: '100%', padding: 0 }}>
            <img
              src="https://tsportline.com/cdn/shop/files/black-tesla-model-s-21-inch-aftermarket-wheels-tss-gloss-black-rear-1920-2_1600x.png?v=1680200206"
              alt="Tesla Model S"
              className="img-fluid"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center' }}
            />
          </div>
          
          {/* Cột form */}
          <div className="col-md-4 d-flex align-items-center justify-content-center" style={{ height: '100%', padding: 0 }}>
            <div className="card-body text-center" style={{ maxWidth: '400px', width: '100%', padding: '1rem' }}>
              <h3
                style={{
                  fontSize: '1.8rem',
                  fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                }}
                className="mb-4"
              >
                Login
              </h3>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control custom-input"
                    id="floatingInput"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="floatingInput">User Name</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control custom-input"
                    id="floatingPassword"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <FancyButton
                    type="submit"
                    disabled={loading}
                    variant="dark"
                    style={{ width: '47%' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading...
                      </>
                    ) : (
                      'Login'
                    )}
                  </FancyButton>
                </div>
              </form>

              <Link to="/forgot-password" className="text-decoration-none text-muted mb-3 d-block">
                Forgot Password?
              </Link>

              {/* ICON ĐƠN GIẢN - HOẠT ĐỘNG */}
              {/* Social Login - Tạm thời tắt cho đến khi cấu hình Google Cloud Console */}
              {false && (
              <div className="d-flex justify-content-center gap-3 mb-3">
                <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                  <i
                    className="bi bi-facebook"
                    style={{
                      fontSize: '32px',
                      color: '#1877f2',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  ></i>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }}>
                    <FacebookLoginButton
                      onSuccess={handleSocialLoginSuccess}
                      onError={handleSocialLoginError}
                    />
                  </div>
                </div>

                <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                  <i
                    className="bi bi-google"
                    style={{
                      fontSize: '32px',
                      color: '#db4437',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  ></i>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }}>
                    <GoogleLoginButton
                      onSuccess={handleSocialLoginSuccess}
                      onError={handleSocialLoginError}
                    />
                  </div>
                </div>
              </div>
              )}

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

      <EmailVerificationModal
        show={showModal}
        onHide={() => setShowModal(false)}
        email={userEmail}
      />

  <style>{`
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          box-sizing: border-box;
        }

        *,
        *:before,
        *:after {
          box-sizing: inherit;
        }

        .container-fluid,
        .card,
        .row {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .card {
          border-radius: 0;
        }

        .custom-input {
          border: 2px solid #000 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .custom-input:focus {
          border-color: #000 !important;
          box-shadow: none !important;
        }

        .form-floating > label {
          color: #6c757d;
        }

        .form-floating > .custom-input:focus ~ label,
        .form-floating > .custom-input:not(:placeholder-shown) ~ label {
          color: #000;
        }

        .login-btn {
          background-color: black;
          color: white;
          transition: all 0.3s ease;
        }

        .login-btn:hover:not(:disabled) {
          background-color: darkgray;
          transform: scale(1.05);
          transition: transform 0.4s ease;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Social Login Wrapper - ẨN BUTTON XẤU, CHỈ HIỆN ICON */
        .social-login-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
        }

        .social-login-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'bootstrap-icons';
          font-size: 28px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1;
          pointer-events: none;
        }

        .social-login-wrapper:nth-child(1)::before {
          content: '\\F344'; /* Facebook icon */
          color: #1877f2;
        }

        .social-login-wrapper:nth-child(2)::before {
          content: '\\F3F0'; /* Google icon */
          color: #db4437;
        }

        .social-login-wrapper:hover::before {
          transform: scale(1.1);
        }

        /* ẨN HẾT CÁC BUTTON MẶC ĐỊNH */
        .social-login-wrapper > div,
        .social-login-wrapper button,
        .social-login-wrapper a,
        .social-login-wrapper iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          opacity: 0 !important;
          cursor: pointer !important;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: left center;
          transition: none !important;
          transform: none !important;
        }

        img:hover {
          transform: none !important;
        }

        .img-fluid {
          transition: none !important;
        }

        .img-fluid:hover {
          transform: none !important;
        }

        @media (max-width: 768px) {
          .col-md-8,
          .col-md-4 {
            width: 100%;
            height: auto;
          }
          img {
            height: auto;
          }
          .card-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
