// src/pages/technician/TechnicianLayout.jsx
import { Outlet } from "react-router-dom";
import GlobalNavbar from "../../components/GlobalNavbar";

export default function TechnicianLayout() {
  return (
    <div className="technician-layout">
      <GlobalNavbar />
      <main className="tech-content">
        <Outlet />
      </main>
      <style>{`
        .technician-layout {
          min-height: 100vh;
          background: #f5f5f7;
        }
        .tech-content {
          padding: 120px 32px 32px 32px;
        }
      `}</style>
    </div>
  );
}
