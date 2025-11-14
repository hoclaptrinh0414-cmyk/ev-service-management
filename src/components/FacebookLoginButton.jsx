// src/components/FacebookLoginButton.jsx
import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login';
import { authUtils } from '../services/apiService';

// ⚙️ CONFIG: Set to false to disable Facebook Login temporarily
// ⚠️ Facebook Login requires HTTPS but localhost uses HTTP
// Note: Will show HTTPS warning in console, but icon will still display
export const ENABLE_FACEBOOK_LOGIN = true;

// Thay đổi giá trị này thành Facebook App ID thật của bạn
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID";

const FacebookLoginButton = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  // If Facebook Login is disabled, return null (don't render anything)
  if (!ENABLE_FACEBOOK_LOGIN) {
    return null;
  }

  const handleFacebookResponse = async (response) => {
    if (response.accessToken) {
      setLoading(true);
      try {
        // Import API service
        const { default: apiService } = await import('../services/apiService');
        
        // Call backend Facebook login API
        const result = await apiService.facebookLogin(response.accessToken);
        
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
          throw new Error(result.message || 'Facebook login failed');
        }
      } catch (error) {
        console.error('Facebook login error:', error);
        
        let errorMessage = 'Có lỗi xảy ra trong quá trình đăng nhập Facebook';
        
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
    } else {
      if (onError) {
        onError('Đăng nhập Facebook bị hủy');
      }
    }
  };

  return (
    <div className="facebook-login-container position-relative">
      <FacebookLogin
        appId={FACEBOOK_APP_ID}
        autoLoad={false}
        fields="name,email,picture"
        callback={handleFacebookResponse}
        disableMobileRedirect={false}
        isMobile={false}
        redirectUri={window.location.origin}
        render={(renderProps) => (
          <a
            href="#"
            className="social-icon"
            title="Đăng nhập với Facebook"
            onClick={(e) => {
              e.preventDefault();
              if (!renderProps.disabled && !loading) {
                renderProps.onClick();
              }
            }}
            style={{ 
              opacity: renderProps.disabled || loading ? 0.6 : 1,
              cursor: renderProps.disabled || loading ? 'not-allowed' : 'pointer'
            }}
          >
            <i className="bi bi-facebook fs-4"></i>
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

export default FacebookLoginButton;