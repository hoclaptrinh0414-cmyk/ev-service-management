// src/components/UserMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// SVG Icons
const User = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Car = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const Dashboard = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const LogOut = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
    }
  };

  // Lấy chữ cái đầu của tên để làm avatar
  const getInitials = () => {
    const name = user?.fullName || user?.username || 'U';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleMenuItemClick = (action) => {
    setShowDropdown(false);
    action();
  };

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="user-menu-trigger"
      >
        <div className="user-avatar">
          {getInitials()}
        </div>
        <div className="user-info">
          <div className="user-name">
            {user?.fullName || user?.username || 'User'}
          </div>
          <div className="user-email">
            {user?.email || ''}
          </div>
        </div>
      </button>

      {showDropdown && (
        <div className="user-dropdown">
          {/* Header */}
          <div className="dropdown-header">
            <div className="header-avatar">
              {getInitials()}
            </div>
            <div>
              <div className="header-name">
                {user?.fullName || user?.username || 'User'}
              </div>
              <div className="header-email">
                {user?.email || ''}
              </div>
              {user?.role && (
                <div className="header-role">
                  {user.role}
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="dropdown-section">
            <button
              className="dropdown-item"
              onClick={() => handleMenuItemClick(() => navigate('/profile'))}
            >
              <User className="item-icon" />
              Thông tin cá nhân
            </button>
            <button
              className="dropdown-item"
              onClick={() => handleMenuItemClick(() => navigate('/register-vehicle'))}
            >
              <Car className="item-icon" />
              Đăng ký xe mới
            </button>
            <button
              className="dropdown-item"
              onClick={() => handleMenuItemClick(() => navigate('/dashboard'))}
            >
              <Dashboard className="item-icon" />
              Dashboard
            </button>
          </div>

          <div className="dropdown-divider"></div>

          {/* Logout */}
          <div className="dropdown-section">
            <button
              className="dropdown-item logout-item"
              onClick={() => handleMenuItemClick(handleLogout)}
            >
              <LogOut className="item-icon" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-menu-wrapper {
          position: relative;
          display: inline-block;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border: none;
          background: transparent;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .user-menu-trigger:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-info {
          text-align: left;
          display: none;
        }

        @media (min-width: 768px) {
          .user-info {
            display: block;
          }
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.2;
          transition: color 0.2s;
        }

        .user-email {
          font-size: 0.75rem;
          color: #ffffff;
          line-height: 1.2;
          transition: color 0.2s;
        }

        .user-menu-trigger:hover .user-name,
        .user-menu-trigger:hover .user-email {
          color: #000000;
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 18rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          z-index: 1050;
          padding: 0.5rem;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 0.5rem;
        }

        .header-avatar {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .header-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.2;
        }

        .header-email {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.2;
        }

        .header-role {
          font-size: 0.75rem;
          color: #3b82f6;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .dropdown-section {
          padding: 0.25rem 0;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.15s;
          font-size: 0.875rem;
          color: #374151;
          text-align: left;
        }

        .dropdown-item:hover {
          background-color: #f3f4f6;
        }

        .item-icon {
          color: #6b7280;
          flex-shrink: 0;
        }

        .dropdown-divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 0.5rem 0;
        }

        .logout-item {
          color: #dc2626;
        }

        .logout-item:hover {
          background-color: #fee2e2;
        }

        .logout-item .item-icon {
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default UserMenu;
