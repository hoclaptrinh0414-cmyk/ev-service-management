// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals'; // Thêm dòng này

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();