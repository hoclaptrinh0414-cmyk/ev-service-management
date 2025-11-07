// src/pages/technician/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginTechnician } from '../../api/technicianAuthService';

const TechnicianLogin = () => {
  const [username, setUsername] = useState('techtest001');
  const [password, setPassword] = useState('Tech@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginTechnician(username, password);
      navigate('/technician/dashboard');
    } catch (err) {
      const msg = err?.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 40 }}>
      <h3 className="mb-3">Technician Login</h3>
      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default TechnicianLogin;

