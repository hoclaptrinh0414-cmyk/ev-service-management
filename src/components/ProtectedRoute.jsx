import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireRole = null }) => {
  const { isAuthenticated, user, loading, hasRole } = useAuth();

  console.log('=== PROTECTED ROUTE CHECK ===');
  console.log('Is Authenticated:', isAuthenticated);
  console.log('User:', user);
  console.log('Loading:', loading);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated - redirecting to login');
    console.log('=== END PROTECTED ROUTE CHECK ===');
    return <Navigate to="/login" replace />;
  }

  // If specific role(s) is required, check for it
  if (requireRole) {
    const allowed = Array.isArray(requireRole)
      ? requireRole.some((r) => hasRole(r))
      : hasRole(requireRole);
    if (!allowed) {
      console.log(`User lacks required role(s): ${requireRole} - redirecting to home`);
      console.log('=== END PROTECTED ROUTE CHECK ===');
      return <Navigate to="/home" replace />;
    }
  }

  console.log('Access granted');
  console.log('=== END PROTECTED ROUTE CHECK ===');

  return children;
};

export default ProtectedRoute;
