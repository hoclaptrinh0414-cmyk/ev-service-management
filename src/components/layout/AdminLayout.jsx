// src/components/layout/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={`admin-content ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <Outlet />
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* ===== MAIN CONTENT ===== */
        .admin-content {
          flex: 1;
          overflow-y: auto;
          background: #f5f5f7;
          transition: margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 32px;
          min-height: 100vh;
        }

        .admin-content.expanded {
          margin-left: 280px;
        }

        .admin-content.collapsed {
          margin-left: 72px;
        }

        /* ===== GLOBAL PAGE STYLES ===== */
        .admin-content .page-header {
          margin-bottom: 32px;
        }

        .admin-content .page-header h1 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
          font-weight: 800 !important;
          letter-spacing: 0.02em !important;
          font-size: 36px !important;
          color: #1a1a1a !important;
          margin: 0 !important;
        }

        .admin-content .page-header p {
          font-size: 16px;
          color: #86868b;
          margin: 8px 0 0 0;
        }

        /* Card Enhancements */
        .admin-content .card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.2s;
        }

        .admin-content .card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-content {
            padding: 16px;
          }

          .admin-content.expanded,
          .admin-content.collapsed {
            margin-left: 0;
          }

          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar.expanded {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
