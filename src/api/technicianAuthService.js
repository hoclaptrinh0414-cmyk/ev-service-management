// src/api/technicianAuthService.js
import { apiClient } from './client';

export async function loginTechnician(username, password) {
  const res = await apiClient.post('/auth/login', { username, password });
  const body = res.data || {};
  const data = body.data || body.Data || body;

  const token =
    data.token || data.Token || data.accessToken || data.AccessToken || null;
  const user = data.user || data.User || null;

  if (!token) {
    const message = body.message || 'Missing token in response';
    const err = new Error(message);
    err.response = { data: body };
    throw err;
  }

  try {
    localStorage.setItem('technician_access_token', token);
    if (user) localStorage.setItem('technician_user', JSON.stringify(user));
  } catch {}

  return { token, user, raw: body };
}

export default { loginTechnician };

