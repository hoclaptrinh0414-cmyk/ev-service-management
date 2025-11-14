// src/pages/staff/StaffLayout.jsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { path: "/staff/appointments", label: "Appointment", icon: "bi-speedometer2" },
    { path: "/staff/work-orders", label: "Work Orders", icon: "bi-tools" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const isCollapsed = !sidebarOpen;

  return (
    <div className="staff-layout">
      {/* Sidebar */}
      <aside className={`staff-sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        {/* Header - Click to toggle sidebar */}
        <div
          className="sidebar-header clickable-header"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen && (
            <div className="brand">
              <div className="brand-icon">
                <i className="bi bi-grid-1x2-fill"></i>
              </div>
              <div className="brand-text">
                <h5>Staff Portal</h5>
                <p>Work Management</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="brand-icon-only">
              <i className="bi bi-grid-1x2-fill"></i>
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
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
                {!sidebarOpen && hoveredItem === item.path && (
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
            onClick={() => navigate('/staff/settings')}
            title="Account Settings"
          >
            <div className="user-avatar">
              {user?.FullName?.[0] || "ST"}
            </div>
            {sidebarOpen && (
              <div className="user-info">
                <p className="user-name">{user?.FullName || "Staff Member"}</p>
                <p className="user-email">{user?.Email || "staff@company.com"}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="staff-content">
        <Outlet />
      </main>

      <style>{`
        .staff-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* ===== SIDEBAR ===== */
        .staff-sidebar {
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

        .staff-sidebar.expanded {
          width: 280px;
        }

        .staff-sidebar.collapsed {
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

        .staff-sidebar.expanded .brand-text {
          opacity: 1;
          transition: opacity 0.3s ease 0.2s;
        }

        .staff-sidebar.collapsed .brand-text {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: #1a1a1a;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
          transition: border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .staff-sidebar.collapsed .brand-icon {
          border-radius: 50%;
        }

        .brand-icon-only {
          width: 40px;
          height: 40px;
          background: #1a1a1a;
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

        .staff-sidebar.collapsed .nav-item {
          border-radius: 50%;
          padding: 12px;
          width: 44px;
          height: 44px;
        }

        .nav-item span {
          white-space: nowrap;
          overflow: hidden;
        }

        .staff-sidebar.expanded .nav-item span {
          opacity: 1;
          transition: opacity 0.3s ease 0.2s;
        }

        .staff-sidebar.collapsed .nav-item span {
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
          background: #1a1a1a;
          color: white;
        }

        .nav-item.active i {
          color: white;
        }

        /* Tooltip for collapsed sidebar */
        .nav-tooltip {
          position: absolute;
          left: calc(100% + 12px);
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

        .staff-sidebar.collapsed .user-section {
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
          background: #1a1a1a;
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

        .staff-sidebar.expanded .user-info {
          opacity: 1;
          transition: opacity 0.3s ease 0.2s;
        }

        .staff-sidebar.collapsed .user-info {
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

        /* Dropdown Menu */
        .user-dropdown {
          margin-top: 8px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          padding: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          animation: slideDown 0.2s ease;
        }

        .user-dropdown-collapsed {
          position: absolute;
          bottom: 70px;
          left: 16px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          padding: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          animation: slideDown 0.2s ease;
          z-index: 1000;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .dropdown-item i {
          font-size: 16px;
          color: #86868b;
        }

        .dropdown-item:hover {
          background: #f5f5f7;
        }

        .dropdown-item:hover i {
          color: #1a1a1a;
        }

        .dropdown-item.logout {
          color: #ff3b30;
        }

        .dropdown-item.logout i {
          color: #ff3b30;
        }

        .dropdown-item.logout:hover {
          background: #fff5f5;
        }

        .dropdown-divider {
          height: 1px;
          background: #e5e5e5;
          margin: 4px 0;
        }

        .logout-btn-icon {
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn-icon:hover {
          background: #f5f5f7;
        }

        /* ===== MAIN CONTENT ===== */
        .staff-content {
          flex: 1;
          overflow-y: auto;
          background: #f5f5f7;
          transition: margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .staff-sidebar.expanded ~ .staff-content {
          margin-left: 300px;
        }

        .staff-sidebar.collapsed ~ .staff-content {
          margin-left: 92px;
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

        /* ===== GLOBAL PAGE TITLE STYLES ===== */
        .staff-content .page-header h1,
        .staff-content h1 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
          font-weight: 800 !important;
          letter-spacing: 0.02em !important;
        }
      `}</style>
    </div>
  );
}
