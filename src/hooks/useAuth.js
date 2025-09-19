import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
       const [user, setUser] = useState(null);
       const [loading, setLoading] = useState(true);

       useEffect(() => {
              // Kiểm tra user đã đăng nhập chưa khi app khởi động
              const currentUser = authService.getCurrentUser();
              if (currentUser) {
                     setUser(currentUser);
              }
              setLoading(false);
       }, []);

       const login = async (credentials) => {
              try {
                     const response = await authService.login(credentials);
                     setUser(response.user);
                     return response;
              } catch (error) {
                     throw error;
              }
       };

       const register = async (userData) => {
              try {
                     const response = await authService.register(userData);
                     return response;
              } catch (error) {
                     throw error;
              }
       };

       const logout = () => {
              authService.logout();
              setUser(null);
       };

       const value = {
              user,
              login,
              register,
              logout,
              loading,
              isAuthenticated: !!user
       };

       return (
              <AuthContext.Provider value={value}>
                     {children}
              </AuthContext.Provider>
       );
};

export const useAuth = () => {
       const context = useContext(AuthContext);
       if (!context) {
              throw new Error('useAuth must be used within AuthProvider');
       }
       return context;
};