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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const menuItems = [
    { path: "/technician/flow", label: "Daily Flow", icon: "bi-play-circle", exact: false },
  ];

  const handleLogout = () => {
    setShowLogoutDialog(true);
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
              <div className="brand-text">
                <h5>Technician Portal</h5>
                <p>Maintenance & Repair</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="brand-text-small">TP</div>
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
            <div
              className="user-info-expanded clickable"
              onClick={() => navigate('/technician/settings')}
              title="Open Settings"
            >
              <div className="user-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="user-details">
                <div className="user-name">{user?.fullName || 'Technician'}</div>
                <div className="user-role">Kỹ Thuật Viên</div>
              </div>
            </div>
          ) : (
            <div
              className="user-info-collapsed clickable"
              onClick={() => navigate('/technician/settings')}
              title="Open Settings"
            >
              <div className="user-avatar-small">
                <i className="bi bi-person-circle"></i>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="tech-content">
        <Outlet />
      </main>

      {showLogoutDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
        onClick={() => setShowLogoutDialog(false)}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 1000000,
              width: '90%',
              maxWidth: '450px',
              borderRadius: '16px',
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '40px',
              margin: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <i className="bi bi-box-arrow-right" style={{ fontSize: '40px', color: '#dc2626' }}></i>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
                Đăng xuất
              </h2>
              <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '32px', lineHeight: '1.6' }}>
                Bạn có chắc chắn muốn đăng xuất không?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  style={{
                    padding: '14px 28px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderRadius: '25px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '15px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                  style={{
                    padding: '14px 32px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    borderRadius: '25px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '15px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          background: #ffffff;
          color: #1a1a1a;
          display: flex;
          flex-direction: column;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
          border-right: 1px solid #e5e5e5;
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
          border-bottom: 1px solid #e5e5e5;
          cursor: pointer;
          transition: background 0.2s;
        }

        .sidebar-header:hover {
          background: #f5f5f7;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-text-small {
          font-size: 18px;
          font-weight: 700;
          color: #111;
          text-align: center;
          width: 100%;
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
          color: #1a1a1a;
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
          background: #f5f5f5;
          color: #111;
          transform: translateX(4px);
        }

        .tech-sidebar.collapsed .nav-item:hover {
          transform: translateX(0) scale(1.05);
        }

        .nav-item:hover i {
          transform: scale(1.1);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #111 0%, #444 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-item.active i {
          transform: scale(1.1);
        }

        /* Footer */
        .sidebar-footer {
          padding: 20px 16px;
          border-top: 1px solid #e5e5e5;
        }

        .user-info-expanded {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f5f5f7;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-info-expanded:hover {
          background: #e5e5e5;
          transform: translateY(-2px);
        }

        .user-avatar {
          font-size: 36px;
          color: #111;
        }

        .user-avatar-small {
          font-size: 36px;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
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
          color: #666;
        }

        .user-info-collapsed {
          display: flex;
          justify-content: center;
          padding: 12px;
          background: #f5f5f7;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-info-collapsed:hover {
          background: #e5e5e5;
          transform: scale(1.05);
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
          background: rgba(0, 0, 0, 0.15);
          border-radius: 3px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}
