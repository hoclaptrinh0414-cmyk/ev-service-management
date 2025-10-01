import React from 'react';

const Dashboard = () => {
  return (
    <div className="main-content">
      <div className="card">
        <h3>Total Customers</h3>
        <div className="value">50</div>
        <div className="status">+5% This Week</div>
      </div>
      <div className="card">
        <h3>Active Appointments</h3>
        <div className="value">15</div>
        <div className="status">8 In Progress</div>
      </div>
      <div className="card">
        <h3>Total Parts in Stock</h3>
        <div className="value">120</div>
        <div className="status">10 Low Stock</div>
      </div>
      <div className="card">
        <h3>Total Revenue</h3>
        <div className="value">$5,200</div>
        <div className="status negative">-3% This Month</div>
      </div>
    </div>
  );
};

export default Dashboard;