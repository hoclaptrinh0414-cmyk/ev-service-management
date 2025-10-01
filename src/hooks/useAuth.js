// src/hooks/useAuth.js - COMPLETE FILE - CREATE THIS NEW FILE
import { useState, useEffect } from 'react';
import { authUtils } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = authUtils.getUser();
      const token = authUtils.getToken();
      
      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    authUtils.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return {
    user,
    isAuthenticated,
    loading,
    logout
  };
};