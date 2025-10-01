       // src/components/GoogleLoginButton.jsx
       import React, { useState } from 'react';
       import { GoogleLogin } from '@react-oauth/google';
       import { authUtils } from '../services/api';

       const GoogleLoginButton = ({ onSuccess, onError }) => {
       const [loading, setLoading] = useState(false);

       const handleGoogleSuccess = async (credentialResponse) => {
       setLoading(true);
       try {
       // Import API service
       const { default: apiService } = await import('../services/api');
       
       // Call backend Google login API
       const result = await apiService.googleLogin(credentialResponse.credential);
       
       if (result.success || result.token) {
              // Handle successful login
              const token = result.token || result.data?.token;
              const user = result.user || result.data?.user;
              
              if (token && user) {
              authUtils.setAuth(token, user);
              
              if (onSuccess) {
              onSuccess({
                     user: user,
                     isNewUser: result.isNewUser || result.data?.isNewUser || false
              });
              }
              } else {
              throw new Error('Invalid login response format');
              }
       } else {
              throw new Error(result.message || 'Google login failed');
       }
       } catch (error) {
       console.error('Google login error:', error);
       
       let errorMessage = 'Có lỗi xảy ra trong quá trình đăng nhập Google';
       
       if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
       } else if (error.message) {
              errorMessage = error.message;
       }
       
       if (onError) {
              onError(errorMessage);
       }
       } finally {
       setLoading(false);
       }
       };

       const handleGoogleError = () => {
       if (onError) {
       onError('Đăng nhập Google bị hủy');
       }
       };

       return (
       <div className="google-login-container position-relative">
       <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={true}
              auto_select={true}
              theme="filled_blue"
              size="large"
              text="signin"
              shape="circle"
              width="48"
              render={({ onClick, disabled }) => (
              <a
              href="#"
              className="social-icon"
              title="Đăng nhập với Google"
              onClick={(e) => {
                     e.preventDefault();
                     if (!disabled && !loading) {
                     onClick();
                     }
              }}
              style={{ 
                     opacity: disabled || loading ? 0.6 : 1,
                     cursor: disabled || loading ? 'not-allowed' : 'pointer'
              }}
              >
              <i className="bi bi-google fs-4"></i>
              </a>
              )}
       />
       
       {loading && (
              <div 
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%'
              }}
              >
              <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
              </div>
              </div>
       )}
       </div>
       );
       };

       export default GoogleLoginButton;