import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>EV Service Admin</h2>
          <button className="toggle-sidebar" onClick={toggleSidebar}>☰</button>
        </div>
        <ul>
          <li><Link to="/admin" className={isActive('/admin')}>Dashboard</Link></li>
          <li><Link to="/admin/customers">Customer Management</Link></li>
          <li><Link to="/admin/vehicles" className={isActive('/admin/vehicles')}>Vehicle Management</Link></li>
          <li><Link to="/admin/schedule">Service Schedule</Link></li>
          <li><Link to="/admin/maintenance">Maintenance Progress</Link></li>
          <li><Link to="/admin/parts">Parts Inventory</Link></li>
          <li><Link to="/admin/staff">Staff Management</Link></li>
          <li><Link to="/admin/finance">Financial Report</Link></li>
          <li><Link to="/admin/settings">Settings</Link></li>
        </ul>
      </div>

      {/* Header */}
      <div className={`header ${sidebarCollapsed ? 'full-width' : ''}`}>
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="user-profile">
          <span>Admin</span>
          <img src="https://via.placeholder.com/40" alt="User" />
        </div>
      </div>

      {/* Main Content */}
      <div className={`content-wrapper ${sidebarCollapsed ? 'full-width' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;