// src/components/layout/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import GlobalNavbar from "../GlobalNavbar";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <GlobalNavbar />
      <main className="admin-content">
        <Outlet />
      </main>
      <style>{`
        .admin-layout {
          min-height: 100vh;
          background: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .admin-content {
          padding: 120px 32px 32px 32px;
        }
      `}</style>
    </div>
  );
}
