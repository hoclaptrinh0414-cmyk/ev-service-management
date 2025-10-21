// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';

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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);