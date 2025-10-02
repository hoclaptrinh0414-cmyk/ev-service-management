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
    
    let token, user;
    
    if (result.token && result.user) {
      token = result.token;
      user = result.user;
    }
    else if (result.data && result.data.token && result.data.user) {
      token = result.data.token;
      user = result.data.user;
    }
    else if (result.accessToken && result.user) {
      token = result.accessToken;
      user = result.user;
    }
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
      
      navigate('/home');
    } else {
      console.error('Missing token or user in response');
      setError('Dữ liệu đăng nhập không hợp lệ');
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
      const result = await authAPI.login(formData);
      handleLoginSuccess(result);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden' }}>
      <div className="card border-0" style={{ height: '100%', width: '100%', margin: 0, padding: 0 }}>
        <div className="row" style={{ height: '100%', margin: 0 }}>
          {/* Cột hình ảnh (2/3 màn hình trên desktop) */}
          <div className="col-md-8 d-none d-md-block" style={{ height: '100%', padding: 0 }}>
            <img
              src="https://tsportline.com/cdn/shop/files/black-tesla-model-s-21-inch-aftermarket-wheels-tss-gloss-black-rear-1920-2_1600x.png?v=1680200206"
              alt="Tesla Model S"
              className="img-fluid"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Cột form (1/3 màn hình trên desktop) */}
          <div className="col-md-4 d-flex align-items-center justify-content-center" style={{ height: '100%', padding: 0 }}>
            <div className="card-body text-center" style={{ maxWidth: '400px', width: '100%', padding: '1rem' }}>
              <h3
                style={{
                  fontSize: '1.8rem',
                  fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                }}
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
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
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
                    className="form-control"
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
                <button
                  type="submit"
                  className="btn login-btn w-100 mb-3"
                  disabled={loading}
                >
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

              <a href="#" className="text-decoration-none text-muted mb-3 d-block">
                Forgot Password?
              </a>

              <div className="d-flex justify-content-center gap-3 mb-3">
                <button
                  className="btn social-icon"
                  style={{ color: '#1877f2' }}
                  onClick={() => console.log('Continue with Facebook clicked')}
                >
                  <i className="bi bi-facebook fs-4"></i>
                </button>
                <button
                  className="btn social-icon"
                  style={{ color: '#db4437' }}
                  onClick={() => console.log('Continue with Google clicked')}
                >
                  <i className="bi bi-google fs-4"></i>
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

        .social-icon {
          transition: all 0.3s ease;
          background: none;
          border: none;
          padding: 0;
        }

        .social-icon:hover {
          color: #007bff;
          transform: scale(1.1);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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