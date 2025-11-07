// src/pages/technician/Dashboard.jsx
import React from 'react';

const TechnicianDashboard = () => {
  const name = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('technician_user') || 'null');
      return u?.fullName || u?.FullName || '';
    } catch {
      return '';
    }
  })();

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <h3>Technician Dashboard</h3>
      <p>Welcome {name ? name : 'Technician'}.</p>
    </div>
  );
};

export default TechnicianDashboard;

