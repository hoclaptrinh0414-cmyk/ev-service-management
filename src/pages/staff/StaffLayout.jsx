// src/pages/staff/StaffLayout.jsx
import { Outlet } from "react-router-dom";
import GlobalNavbar from "../../components/GlobalNavbar";

export default function StaffLayout() {
  return (
    <div className="staff-layout">
      <GlobalNavbar />
      <main className="staff-content">
        <Outlet />
      </main>
      <style>{`
        .staff-layout {
          min-height: 100vh;
          background: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .staff-content {
          padding: 120px 32px 32px 32px;
        }
      `}</style>
    </div>
  );
}
