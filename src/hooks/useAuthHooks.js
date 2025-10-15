// src/hooks/useAuthHooks.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for handling login with loading and error states
 */
export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = useCallback(async (username, password, redirectPath = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await login(username, password);

      if (result.success) {
        // Redirect based on user role or custom path
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          // Auto-redirect based on role will be handled by Login component
          return result;
        }
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  return { handleLogin, loading, error, setError };
};

/**
 * Hook for handling logout
 */
export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async (redirectPath = '/login') => {
    setLoading(true);

    try {
      await logout();
      navigate(redirectPath);
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate anyway on error
      navigate(redirectPath);
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  return { handleLogout, loading };
};

/**
 * Hook for checking if user has specific role
 */
export const useRole = () => {
  const { user, hasRole, isAdminOrStaff, isCustomer } = useAuth();

  return {
    user,
    hasRole,
    isAdmin: hasRole('admin'),
    isStaff: hasRole('staff'),
    isCustomer: isCustomer(),
    isAdminOrStaff: isAdminOrStaff(),
  };
};

/**
 * Hook for protecting components based on role
 */
export const useRequireRole = (requiredRole) => {
  const { hasRole, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!hasRole(requiredRole)) {
        navigate('/home');
      } else {
        setAuthorized(true);
      }
    }
  }, [loading, isAuthenticated, hasRole, requiredRole, navigate]);

  return { authorized, loading };
};

/**
 * Hook for handling Google login
 */
export const useGoogleLogin = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = useCallback(async (idToken, redirectPath = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleLogin(idToken);

      if (result.success && redirectPath) {
        navigate(redirectPath);
      }

      return result;
    } catch (err) {
      setError(err.message || 'Google login thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate]);

  return { handleGoogleLogin, loading, error, setError };
};

/**
 * Hook for handling Facebook login
 */
export const useFacebookLogin = () => {
  const { facebookLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFacebookLogin = useCallback(async (accessToken, redirectPath = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await facebookLogin(accessToken);

      if (result.success && redirectPath) {
        navigate(redirectPath);
      }

      return result;
    } catch (err) {
      setError(err.message || 'Facebook login thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [facebookLogin, navigate]);

  return { handleFacebookLogin, loading, error, setError };
};

/**
 * Hook for user profile management
 */
export const useUserProfile = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      updateUser(userData);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  const handleRefreshUser = useCallback(async () => {
    setLoading(true);
    try {
      await refreshUser();
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  return {
    user,
    updateUser: handleUpdateUser,
    refreshUser: handleRefreshUser,
    loading,
  };
};

/**
 * Hook for checking authentication status on mount
 */
export const useAuthCheck = (redirectIfNotAuth = false) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (redirectIfNotAuth && !isAuthenticated) {
        navigate('/login');
      }
      setChecked(true);
    }
  }, [loading, isAuthenticated, redirectIfNotAuth, navigate]);

  return { isAuthenticated, loading, checked };
};

/**
 * Hook for redirect logic based on authentication
 */
export const useAuthRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  const redirectToDefaultPage = useCallback(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    const role = user?.role || user?.Role || user?.roleName || user?.RoleName;
    const roleId = user?.roleId || user?.RoleId;

    if (
      role?.toLowerCase() === 'admin' ||
      role?.toLowerCase() === 'staff' ||
      roleId === 1 ||
      roleId === 2
    ) {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  }, [isAuthenticated, user, loading, navigate]);

  return { redirectToDefaultPage };
};

export default {
  useLogin,
  useLogout,
  useRole,
  useRequireRole,
  useGoogleLogin,
  useFacebookLogin,
  useUserProfile,
  useAuthCheck,
  useAuthRedirect,
};
