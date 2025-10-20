// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { authUtils } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = authUtils.getToken();
        const storedUser = authUtils.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
          console.log('✅ Auth initialized from localStorage:', storedUser);
        } else {
          console.log('⚠️ No auth data found in localStorage');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        authUtils.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login method
  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);

      if (response.success) {
        const storedToken = authUtils.getToken();
        const storedUser = authUtils.getUser();

        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);

        console.log('✅ Login successful, auth context updated');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Login error in AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register method
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      console.log('✅ Registration successful');
      return response;
    } catch (error) {
      console.error('❌ Registration error in AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const googleLogin = async (idToken) => {
    try {
      setLoading(true);
      const response = await authService.googleLogin(idToken);

      if (response.success) {
        const storedToken = authUtils.getToken();
        const storedUser = authUtils.getUser();

        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);

        console.log('✅ Google login successful, auth context updated');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Google login thất bại');
      }
    } catch (error) {
      console.error('❌ Google login error in AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Facebook Login
  const facebookLogin = async (accessToken) => {
    try {
      setLoading(true);
      const response = await authService.facebookLogin(accessToken);

      if (response.success) {
        const storedToken = authUtils.getToken();
        const storedUser = authUtils.getUser();

        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);

        console.log('✅ Facebook login successful, auth context updated');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Facebook login thất bại');
      }
    } catch (error) {
      console.error('❌ Facebook login error in AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout method
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();

      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      console.log('✅ Logout successful, auth context cleared');
    } catch (error) {
      console.error('❌ Logout error in AuthContext:', error);
      // Clear auth state even on error
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Update user data (useful after profile updates)
  const updateUser = (userData) => {
    try {
      const currentUser = authUtils.getUser();
      const updatedUser = { ...currentUser, ...userData };

      authUtils.setAuth(token, updatedUser);
      setUser(updatedUser);

      console.log('✅ User data updated in auth context:', updatedUser);
    } catch (error) {
      console.error('❌ Error updating user in AuthContext:', error);
    }
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      setLoading(true);
      const storedUser = authUtils.getUser();

      if (storedUser) {
        // If user has full profile data, just refresh from localStorage
        const freshUser = authUtils.getUser();
        setUser(freshUser);
        try {
          const token = authUtils.getToken();
          setIsAuthenticated(Boolean(token && freshUser));
        } catch {}
        console.log('✅ User data refreshed from localStorage');
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalize role names to a small set
  const normalizeRoleName = (name) => {
    if (!name) return '';
    const n = String(name).toLowerCase();
    if (['admin', 'administrator', 'superadmin', 'super admin'].includes(n)) return 'admin';
    if (['staff', 'tech', 'technician', 'employee'].includes(n)) return 'staff';
    if (['customer', 'user', 'client'].includes(n)) return 'customer';
    return n;
  };

  // Check if user has specific role (by name or id)
  const hasRole = (roleName) => {
    if (!user) return false;

    const role = user.role || user.Role || user.roleName || user.RoleName;
    const roleId = user.roleId || user.RoleId;
    const want = normalizeRoleName(roleName);
    const mine = normalizeRoleName(role);

    if (want === 'admin') return mine === 'admin' || roleId === 1;
    if (want === 'staff') return mine === 'staff' || roleId === 2;
    if (want === 'customer') return mine === 'customer' || roleId === 3;
    return mine === want; // fallback strict name check
  };

  const hasAnyRole = (roleList = []) => {
    return Array.isArray(roleList) && roleList.some((r) => hasRole(r));
  };

  // Check if user is admin or staff
  const isAdminOrStaff = () => {
    if (!user) return false;

    const role = user.role || user.Role || user.roleName || user.RoleName;
    const roleId = user.roleId || user.RoleId;

    return (
      role?.toLowerCase() === 'admin' ||
      role?.toLowerCase() === 'staff' ||
      roleId === 1 ||
      roleId === 2
    );
  };

  // Check if user is customer
  const isCustomer = () => {
    if (!user) return false;

    const role = user.role || user.Role || user.roleName || user.RoleName;
    const roleId = user.roleId || user.RoleId;

    return (
      role?.toLowerCase() === 'customer' ||
      roleId === 3
    );
  };

  const value = {
    // State
    user,
    token,
    loading,
    isAuthenticated,

    // Methods
    login,
    register,
    googleLogin,
    facebookLogin,
    logout,
    updateUser,
    refreshUser,

    // Utility methods
    hasRole,
    hasAnyRole,
    isAdminOrStaff,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
