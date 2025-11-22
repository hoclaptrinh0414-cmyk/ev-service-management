// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';

// Create a QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Thay đổi giá trị này thành Google Client ID thật của bạn
const DEFAULT_GOOGLE_CLIENT_ID = "402182573159-gf1i4nu0f1qorshklgsdnem03rc6h07f.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
  console.warn(
    "[Google OAuth] Đang dùng Google Client ID mặc định. Đặt REACT_APP_GOOGLE_CLIENT_ID trong .env rồi khởi động lại npm start để dùng giá trị riêng."
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
