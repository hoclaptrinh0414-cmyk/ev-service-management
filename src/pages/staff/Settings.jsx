// src/pages/staff/Settings.jsx
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

export default function Settings() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    companyName: "T&N",
    fullName: user?.FullName || "Staff Member",
    email: user?.Email || "staff@company.com",
    phoneNumber: user?.PhoneNumber || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Call API to update staff profile
    toast.success("Information updated successfully!");
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
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
            <button className="btn-logout-inline" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </button>
          </div>

          <div className="card-body-settings">
            {/* Company Profile Section */}
            <div className="section">
              <h4 className="section-title">COMPANY PROFILE</h4>

              <div className="form-group">
                <label className="form-label">
                  Company name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Full name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'disabled' : ''}`}
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
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'disabled' : ''}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  className={`form-input ${!isEditing ? 'disabled' : ''}`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {!isEditing ? (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil"></i>
                  Edit
                </button>
              ) : (
                <>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button className="btn-save" onClick={handleSave}>
                    <i className="bi bi-check-circle"></i>
                    Save changes
                  </button>
                </>
              )}
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

        .settings-card.danger-card {
          border-color: #fee;
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

        .settings-icon.danger {
          background: #fee;
          color: #ff3b30;
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

        .form-input::placeholder {
          color: #d1d1d6;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e5e5;
        }

        .btn-edit,
        .btn-cancel,
        .btn-save {
          padding: 10px 20px;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-edit {
          background: #f5f5f7;
          color: #1a1a1a;
        }

        .btn-edit:hover {
          background: #e5e5e5;
        }

        .btn-cancel {
          background: #f5f5f7;
          color: #1a1a1a;
        }

        .btn-cancel:hover {
          background: #e5e5e5;
        }

        .btn-save {
          background: #1a1a1a;
          color: white;
        }

        .btn-save:hover {
          background: #000;
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

          .action-buttons {
            flex-direction: column;
          }

          .btn-edit,
          .btn-cancel,
          .btn-save {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
