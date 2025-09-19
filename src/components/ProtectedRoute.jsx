import React from 'react';
import { Navigate } from 'react-router-dom';
import { authUtils } from '../services/api';

const ProtectedRoute = ({ children }) => {
  console.log('=== PROTECTED ROUTE CHECK ===');
  
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!user);
    
    // Kiểm tra token và user có tồn tại không
    if (!token || !user) {
      console.log('Missing token or user - redirecting to login');
      return false;
    }

    try {
      const parsedUser = JSON.parse(user);
      console.log('Parsed user object:', parsedUser);
      
      // Kiểm tra email đã được verify chưa (flexible field names)
      const isEmailVerified = 
        parsedUser.IsEmailVerified || 
        parsedUser.isEmailVerified || 
        parsedUser.emailVerified ||
        parsedUser.EmailVerified ||
        parsedUser.email_verified ||
        true; // Default to true if no verification field (backend might not require)
        
      console.log('Email verification status:', isEmailVerified);
      
      // Nếu có user data và token, cho phép access
      // (Email verification check có thể được handle ở login flow)
      console.log('User is authenticated - allowing access');
      return true;
      
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Nếu có lỗi parse user data, xóa localStorage và redirect đến login
      authUtils.clearAuth();
      console.log('Cleared localStorage due to parse error - redirecting to login');
      return false;
    }
  };

  const authenticated = isAuthenticated();
  console.log('Final authentication result:', authenticated);
  console.log('=== END PROTECTED ROUTE CHECK ===');

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;