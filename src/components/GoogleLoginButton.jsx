// src/components/GoogleLoginButton.jsx
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { authUtils } from '../services/apiService';

// ⚙️ CONFIG: Set to false to disable Google Login temporarily
// ⚠️ Google OAuth requires Google Cloud Console configuration (see GOOGLE_OAUTH_SETUP.md)
// Note: Will show 403 errors in console until properly configured, but won't affect main functionality
export const ENABLE_GOOGLE_LOGIN = true;

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  // If Google Login is disabled, return null (don't render anything)
  if (!ENABLE_GOOGLE_LOGIN) {
    return null;
  }

const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      console.log('🔑 Google credential received');
      console.log('📝 Credential (first 50 chars):', credentialResponse.credential?.substring(0, 50) + '...');
      
      // Import API service
      const { default: apiService } = await import('../services/apiService');
      
      console.log('📤 Sending Google token to backend...');
      // Call backend Google login API
      const result = await apiService.googleLogin(credentialResponse.credential);
      
      console.log('📥 Backend response:', result);
      
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
      console.error('❌ Google login error:', error);
      console.error('📋 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Có lỗi xảy ra trong quá trình đăng nhập Google';
      
      // More detailed error messages
      if (error.message && error.message.includes('Token Google không hợp lệ')) {
        errorMessage = '❌ Token Google không hợp lệ.\n\n' +
                      'Có thể do:\n' +
                      '1. Backend chưa cấu hình Google Client ID đúng\n' +
                      '2. Token đã hết hạn\n' +
                      '3. Google OAuth chưa được setup\n\n' +
                      '💡 Vui lòng đăng nhập bằng username/password hoặc xem hướng dẫn tại GOOGLE_OAUTH_SETUP.md';
      } else if (error.response?.status === 400) {
        errorMessage = '❌ Backend từ chối token Google. Vui lòng kiểm tra cấu hình Google OAuth.';
      } else if (error.response?.data?.message) {
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
  };       const handleGoogleError = () => {
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