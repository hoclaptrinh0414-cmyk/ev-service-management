// src/pages/technician/TechnicianLayout.jsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

export default function TechnicianLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { path: "/technician", label: "Dashboard", icon: "bi-speedometer2", exact: true },
    { path: "/technician/work-orders", label: "My Work Orders", icon: "bi-tools" },
    { path: "/technician/maintenance", label: "Maintenance Jobs", icon: "bi-list-check" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="technician-layout">
      {/* Sidebar */}
      <aside className={`tech-sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        {/* Header */}
        <div
          className="sidebar-header clickable-header"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen && (
            <div className="brand">
              <div className="brand-icon">
                <i className="bi bi-wrench-adjustable-circle-fill"></i>
              </div>
              <div className="brand-text">
                <h5>Technician Portal</h5>
                <p>Maintenance & Repair</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="brand-icon-only">
              <i className="bi bi-wrench-adjustable-circle-fill"></i>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const isHovered = hoveredItem === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <i className={`bi ${item.icon}`}></i>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="sidebar-footer">
          {sidebarOpen ? (
            <div className="user-info-expanded">
              <div className="user-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="user-details">
                <div className="user-name">{user?.fullName || 'Technician'}</div>
                <div className="user-role">Kỹ Thuật Viên</div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Logout">
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          ) : (
            <div className="user-info-collapsed">
              <button className="logout-btn-icon" onClick={handleLogout} title="Logout">
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="tech-content">
        <Outlet />
      </main>

      <style>{`
        .technician-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f5f7;
        }

        /* ===== SIDEBAR ===== */
        .tech-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          display: flex;
          flex-direction: column;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
        }

        .tech-sidebar.expanded {
          width: 300px;
        }

        .tech-sidebar.collapsed {
          width: 92px;
        }

        /* Header */
        .sidebar-header {
          padding: 32px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: background 0.2s;
        }

        .sidebar-header:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .brand-icon-only {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .brand-text h5 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .brand-text p {
          margin: 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          margin-bottom: 8px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .tech-sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 16px;
        }

        .tech-sidebar.collapsed .nav-item span {
          display: none;
        }

        .nav-item i {
          font-size: 22px;
          transition: transform 0.3s;
        }

        .nav-item:hover {
          background: rgba(255, 107, 53, 0.15);
          color: #ff6b35;
          transform: translateX(4px);
        }

        .tech-sidebar.collapsed .nav-item:hover {
          transform: translateX(0) scale(1.05);
        }

        .nav-item:hover i {
          transform: scale(1.1);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .nav-item.active i {
          transform: scale(1.1);
        }

        /* Footer */
        .sidebar-footer {
          padding: 20px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-info-expanded {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .user-avatar {
          font-size: 36px;
          color: #ff6b35;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 700;
          font-size: 14px;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .user-role {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .logout-btn {
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          color: #ff6b35;
        }

        .user-info-collapsed {
          display: flex;
          justify-content: center;
        }

        .logout-btn-icon {
          width: 48px;
          height: 48px;
          background: transparent;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn-icon:hover {
          background: rgba(255, 107, 53, 0.2);
          color: #ff6b35;
        }

        /* ===== MAIN CONTENT ===== */
        .tech-content {
          flex: 1;
          overflow-y: auto;
          background: #f5f5f7;
          transition: margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tech-sidebar.expanded ~ .tech-content {
          margin-left: 300px;
        }

        .tech-sidebar.collapsed ~ .tech-content {
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
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
