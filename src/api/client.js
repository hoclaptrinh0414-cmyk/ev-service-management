// src/api/client.js
import axios from 'axios';

// Accept either a full host (ending with /api) or just "/api"
const raw = process.env.REACT_APP_API_URL || '/api';
const baseURL = String(raw).replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach technician token if available
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('technician_access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default apiClient;

