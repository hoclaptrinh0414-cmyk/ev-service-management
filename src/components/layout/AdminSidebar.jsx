// src/components/layout/AdminSidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "bi-grid-1x2-fill" },
    { path: "/admin/vehicles", label: "Vehicles", icon: "bi-car-front-fill" },
    { path: "/admin/users", label: "Users", icon: "bi-people-fill" },
    { path: "/admin/appointments", label: "Appointments", icon: "bi-calendar-check-fill" },
    { path: "/admin/maintenance-jobs", label: "Maintenance", icon: "bi-tools" },
    { path: "/admin/parts", label: "Parts", icon: "bi-box-seam" },
    { path: "/admin/finance", label: "Finance", icon: "bi-currency-dollar" },
    { path: "/admin/reports", label: "Reports", icon: "bi-bar-chart-fill" },
    { path: "/admin/settings", label: "Settings", icon: "bi-gear-fill" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>
        {/* Header - Click to toggle sidebar */}
        <div
          className="sidebar-header clickable-header"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen && (
            <div className="brand">
              <div className="brand-icon">
                <i className="bi bi-shield-fill-check"></i>
              </div>
              <div className="brand-text">
                <h5>Admin Portal</h5>
                <p>Management System</p>
              </div>
            </div>
          )}
          {!isOpen && (
            <div className="brand-icon-only">
              <i className="bi bi-shield-fill-check"></i>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                className="nav-item-wrapper"
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {isOpen && <span>{item.label}</span>}
                </Link>
                {!isOpen && hoveredItem === item.path && (
                  <div className="nav-tooltip">{item.label}</div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div
            className="user-section clickable"
            onClick={() => navigate('/admin/settings')}
            title="Account Settings"
          >
            <div className="user-avatar">
              {user?.FullName?.[0] || "AD"}
            </div>
            {isOpen && (
              <div className="user-info">
                <p className="user-name">{user?.FullName || "Administrator"}</p>
                <p className="user-email">{user?.Email || "admin@company.com"}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <style>{`
        /* ===== ADMIN SIDEBAR ===== */
        .admin-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          background: #ffffff;
          border-right: 1px solid #e5e5e5;
          display: flex;
          flex-direction: column;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100vh;
          overflow: visible;
          will-change: width;
          z-index: 100;
        }

        .admin-sidebar.expanded {
          width: 280px;
        }

        .admin-sidebar.collapsed {
          width: 72px;
        }

        /* Header */
        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid #e5e5e5;
          transition: all 0.2s;
          min-height: 88px;
          overflow: hidden;
        }

        .sidebar-header.clickable-header {
          cursor: pointer;
        }

        .sidebar-header.clickable-header:hover {
          background: #f5f5f7;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          position: relative;
        }

        .admin-sidebar.expanded .brand-text {
          opacity: 1;
          transition: opacity 0.3s ease 0.2s;
        }

        .admin-sidebar.collapsed .brand-text {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
          transition: border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-sidebar.collapsed .brand-icon {
          border-radius: 50%;
        }

        .brand-icon-only {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
        }

        .brand-text {
          white-space: nowrap;
          overflow: hidden;
        }

        .brand-text h5 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .brand-text p {
          margin: 0;
          font-size: 13px;
          color: #86868b;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
        }

        .nav-item-wrapper {
          position: relative;
          margin-bottom: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 25px;
          text-decoration: none;
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s, border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      padding 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      width 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .admin-sidebar.collapsed .nav-item {
          border-radius: 50%;
          padding: 12px;
          width: 44px;
          height: 44px;
        }

        .nav-item span {
          white-space: nowrap;
          overflow: hidden;
        }

        .admin-sidebar.expanded .nav-item span {
          opacity: 1;
          transition: opacity 0.3s ease 0.2s;
        }

        .admin-sidebar.collapsed .nav-item span {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .nav-item i {
          font-size: 18px;
          color: #86868b;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .nav-item:hover {
          background: #f5f5f7;
        }

        .nav-item:hover i {
          color: #1a1a1a;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .nav-item.active i {
          color: white;
        }

        /* Tooltip for collapsed sidebar */
        .nav-tooltip {
          position: absolute;
          left: 80px;
          top: 50%;
          transform: translateY(-50%);
          background: #1a1a1a;
          color: white;
          padding: 10px 16px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          animation: fadeIn 0.2s ease;
        }

        .nav-tooltip::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #1a1a1a;
        }

        /* User Section */
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #e5e5e5;
          margin-top: auto;
          position: relative;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 25px;
          transition: background 0.2s, border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      padding 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-sidebar.collapsed .user-section {
          border-radius: 50%;
          padding: 0;
          width: 40px;
          height: 40px;
          justify-content: center;
        }

        .user-section.clickable {
          cursor: pointer;
        }

        .user-section.clickable:hover {
          background: #f5f5f7;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .admin-sidebar.expanded .user-info {
          opacity: 1;
          transition: opacity 0.3s ease 0.2s;
        }

        .admin-sidebar.collapsed .user-info {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .user-name {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          margin: 0;
          font-size: 12px;
          color: #86868b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Scrollbar */
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #d1d1d6;
          border-radius: 3px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #86868b;
        }
      `}</style>
    </>
  );
}
