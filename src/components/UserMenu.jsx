// src/components/UserMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

  return (
    <>
      <div className="user-menu-wrapper" style={{ position: 'relative' }} ref={menuRef}>
        {/* GIỐNG Y HỆT UI CŨ - CHỈ THAY ĐỔI THÀNH BUTTON ĐỂ CÓ DROPDOWN */}
        <a
          href="#"
          className="nav-link move"
          onClick={(e) => {
            e.preventDefault();
            setShowDropdown(!showDropdown);
          }}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-user"></i>
          <span>Tài khoản</span>
        </a>

        {showDropdown && (
          <div className="user-dropdown-menu">
            <div className="dropdown-header">
              <strong>{user?.fullName || user?.username}</strong>
              <small className="d-block text-muted">{user?.email}</small>
            </div>

            <div className="dropdown-divider"></div>

            <button
              className="dropdown-item"
              onClick={() => {
                navigate('/register-vehicle');
                setShowDropdown(false);
              }}
            >
              <i className="bi bi-car-front-fill me-2"></i>
              Đăng ký xe mới
            </button>

            <button
              className="dropdown-item"
              onClick={() => {
                setShowDropdown(false);
                window.location.href = '/profile';
              }}
            >
              <i className="bi bi-person-fill me-2"></i>
              Thông tin cá nhân
            </button>

            <div className="dropdown-divider"></div>

            <button
              className="dropdown-item text-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .user-menu-wrapper {
          position: relative;
        }

        .user-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 250px;
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 12px 16px;
          background: #f8f9fa;
        }

        .dropdown-divider {
          height: 1px;
          background: #e9ecef;
          margin: 0;
        }

        .dropdown-item {
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          color: #212529;
          font-size: 14px;
        }

        .dropdown-item:hover {
          background: #f8f9fa;
        }

        .dropdown-item.text-danger:hover {
          background: #fee;
        }
      `}</style>
    </>
  );
};

export default UserMenu;
