// src/pages/technician/Settings.jsx
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

export default function TechnicianSettings() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.FullName || user?.fullName || user?.displayName || "",
    email: user?.Email || user?.email || "",
    phoneNumber: user?.PhoneNumber || user?.phoneNumber || user?.phone || "",
  });

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Account Settings</h1>
          <p>Manage your account information and personal settings</p>
        </div>
      </div>

      {/* Settings Container */}
      <div className="settings-container">
        {/* Account Details Card */}
        <div className="settings-card">
          <div className="card-header-settings">
            <div className="icon-title">
              <div className="settings-icon">
                <i className="bi bi-person-circle"></i>
              </div>
              <div>
                <h3>Account details</h3>
                <p>Manage your personal information</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-logout-inline"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </button>
          </div>

          <div className="card-body-settings">
            {/* Profile Section */}
            <div className="section">
              <h4 className="section-title">PROFILE</h4>

            <div className="form-group">
              <label className="form-label">
                Full name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                readOnly
                className="form-input disabled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email address <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="form-input disabled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                readOnly
                className="form-input disabled"
              />
            </div>

            </div>
          </div>
        </div>

      </div>

      <style>{`
        .settings-page {
          padding: 32px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .header-left h1 {
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .header-left p {
          font-size: 14px;
          color: #86868b;
          margin: 0;
        }

        /* Settings Container */
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          overflow: hidden;
        }

        .card-header-settings {
          padding: 24px;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .icon-title {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .settings-icon {
          width: 48px;
          height: 48px;
          background: #f5f5f7;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #1a1a1a;
          flex-shrink: 0;
        }

        .icon-title h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .icon-title p {
          font-size: 14px;
          color: #86868b;
          margin: 0;
        }

        .card-body-settings {
          padding: 24px;
        }

        /* Section */
        .section {
          margin-bottom: 24px;
        }

        .section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: #86868b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 16px 0;
        }

        /* Form Group */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .required {
          color: #ff3b30;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
          font-size: 14px;
          color: #1a1a1a;
          transition: all 0.2s;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #1a1a1a;
          box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
        }

        .form-input.disabled {
          background: #f5f5f7;
          color: #86868b;
          cursor: not-allowed;
        }

        /* Logout Inline Button */
        .btn-logout-inline {
          padding: 10px 20px;
          background: #ff3b30;
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .btn-logout-inline:hover {
          background: #e6342a;
          box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .settings-page {
            padding: 20px;
          }

          .card-header-settings {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-logout-inline {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

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
                    window.location.href = "/login";
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
    </div>
  );
}
