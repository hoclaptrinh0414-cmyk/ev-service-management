import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireRole = null }) => {
  const { isAuthenticated, user, loading, hasRole, hasAnyRole } = useAuth();

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

  // Fallback auth check from localStorage in case context not updated yet
  const hasLsAuth = (() => {
    try {
      return !!(localStorage.getItem('token') && localStorage.getItem('user'));
    } catch {
      return false;
    }
  })();
  const isAuthed = isAuthenticated || hasLsAuth;

  // If not authenticated, redirect to login
  if (!isAuthed) {
    console.log('Not authenticated - redirecting to login');
    console.log('=== END PROTECTED ROUTE CHECK ===');
    return <Navigate to="/login" replace />;
  }

  // If specific role(s) is required, check for it
  if (requireRole) {
    let allowed = Array.isArray(requireRole)
      ? hasAnyRole(requireRole)
      : hasRole(requireRole);

    // If no allow yet, try to evaluate from localStorage user
    if (!allowed && hasLsAuth) {
      try {
        const lsUser = JSON.parse(localStorage.getItem('user'));
        const normalize = (name) => {
          if (!name) return '';
          const n = String(name).toLowerCase();
          if (['admin', 'administrator', 'superadmin', 'super admin'].includes(n)) return 'admin';
          if (['staff', 'tech', 'technician', 'employee'].includes(n)) return 'staff';
          if (['customer', 'user', 'client'].includes(n)) return 'customer';
          return n;
        };
        const role = lsUser?.role || lsUser?.Role || lsUser?.roleName || lsUser?.RoleName;
        const roleId = lsUser?.roleId || lsUser?.RoleId;
        const mine = normalize(role);
        const wants = Array.isArray(requireRole) ? requireRole : [requireRole];
        allowed = wants.some((r) => {
          const want = normalize(r);
          if (want === 'admin') return mine === 'admin' || roleId === 1;
          if (want === 'staff') return mine === 'staff' || roleId === 2;
          if (want === 'customer') return mine === 'customer' || roleId === 3;
          return mine === want;
        });
      } catch {}
    }

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
