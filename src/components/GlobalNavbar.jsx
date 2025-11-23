// src/components/GlobalNavbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import NotificationDropdown from './NotificationDropdown';
import useNotifications from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const GlobalNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const { notifications, markAsRead, dismissNotification } = useNotifications({
    enabled: isAuthenticated,
  });

  const hideNavbarPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/resend-verification',
  ];

  if (
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/technician')
  ) {
    return null;
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type === 'appointment_reminder' && notification.appointmentId) {
      navigate('/my-appointments');
    }
  };

  const handleNavigateHome = (e) => {
    e.preventDefault();
    let homePath = '/home';

    if (isAuthenticated) {
      switch (user?.role) {
        case 'admin':
          homePath = '/admin';
          break;
        case 'staff':
          homePath = '/staff';
          break;
        case 'technician':
          homePath = '/technician';
          break;
        default:
          homePath = '/home';
      }
    }

    navigate(homePath);
  };

  const getNavLinks = () => {
    const commonLinks = [
      { path: '/services', label: 'Services' },
      { path: '/blog', label: 'Blog' },
      { path: '/about', label: 'About' },
      { path: '/contact', label: 'Contact' },
    ];

    if (!isAuthenticated) {
      return commonLinks;
    }

    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard' },
          { path: '/admin/schedule', label: 'Schedule' },
          { path: '/admin/customers', label: 'Customers' },
          { path: '/admin/vehicles', label: 'Vehicles' },
          { path: '/admin/staff', label: 'Staff' },
          { path: '/admin/finance', label: 'Finance' },
        ];
      case 'staff':
        return [
          { path: '/staff/appointments', label: 'Appointments' },
          { path: '/staff/work-orders', label: 'Work Orders' },
          { path: '/staff/check-in', label: 'Check-In' },
        ];
      case 'technician':
        return [
          { path: '/technician/flow', label: 'Daily Flow' },
          { path: '/technician/work-orders', label: 'My Work Orders' },
        ];
      default:
        return [
          { path: '/home', label: 'Home' },
          { path: '/my-appointments', label: 'Appointments' },
          { path: '/schedule-service', label: 'Schedule Service' },
          { path: '/services', label: 'Services' },
          { path: '/blog', label: 'Blog' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="navbar navbar-expand-lg static-navbar-custom global-navbar">
      <div className="container-fluid top-navbar-container">
        {/* Logo */}
        <div className="navbar-col-left">
          <a className="navbar-brand-minimal logo-text" href="/home" onClick={handleNavigateHome}>
            T&N
          </a>
        </div>

        {/* Center Menu (Desktop only) */}
        <div className="d-none d-lg-block navbar-col-center">
          <ul className="navbar-nav main-menu-minimal">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <Link className="nav-link move" to={link.path}>
                  {link.label.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: User Menu & Notifications */}
        <div className="nav-icons-minimal navbar-col-right d-flex align-items-center">
          {isAuthenticated && (
            <>
              <UserMenu />
              <NotificationDropdown
                notifications={notifications}
                onMarkRead={markAsRead}
                onDismiss={dismissNotification}
                onNotificationClick={handleNotificationClick}
              />
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#globalNavbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Mobile Menu */}
        <div className="collapse navbar-collapse" id="globalNavbarNav">
          <ul className="navbar-nav ms-auto text-center d-lg-none">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <Link className="nav-link move" to={link.path}>
                  {link.label.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .global-navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          background-color: transparent !important;
          border-bottom: none;
          padding: 0;
          min-height: auto;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .global-navbar .logo-text {
          color: #000 !important;
        }

        .global-navbar .logo-text:hover {
          color: #000 !important;
          opacity: 0.9;
        }

        .global-navbar .main-menu-minimal .nav-link {
          color: #000 !important;
        }

        .global-navbar .main-menu-minimal .nav-link:hover {
          color: #000 !important;
          transform: scale(1.05);
        }

        .global-navbar .nav-icons-minimal *,
        .global-navbar .nav-icons-minimal button,
        .global-navbar .nav-icons-minimal a,
        .global-navbar .nav-icons-minimal i {
          color: #000 !important;
        }

        .global-navbar .navbar-toggler {
          border-color: rgba(0, 0, 0, 0.3) !important;
        }

        .global-navbar .navbar-toggler-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(0, 0, 0, 1)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
        }

        .global-navbar .navbar-collapse .nav-link {
          color: #000 !important;
        }

        .global-navbar .navbar-collapse .nav-link:hover {
          color: #000 !important;
        }

        .top-navbar-container {
          display: grid;
          grid-template-columns: 250px 1fr 250px;
          align-items: center;
          width: 100%;
          max-width: 100%;
          padding: 20px 50px;
          gap: 0;
          min-height: auto;
        }

        .navbar-col-left {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }

        .navbar-col-center {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .navbar-col-right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
        }

        .main-menu-minimal {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 35px;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .main-menu-minimal .nav-item {
          height: 100%;
          display: flex;
          align-items: center;
        }

        .main-menu-minimal .nav-link {
          font-size: 1.05rem;
          font-weight: 500;
          text-transform: uppercase;
          opacity: 0.9;
          transition: all 0.3s ease;
          padding: 0;
          white-space: nowrap;
          text-decoration: none;
          line-height: 1;
        }

        .main-menu-minimal .nav-link:hover {
          opacity: 1;
        }

        .nav-icons-minimal {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 100%;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          line-height: 1;
          padding: 0;
          margin: 0;
        }

        @media (max-width: 992px) {
          .top-navbar-container {
            grid-template-columns: auto 1fr auto;
            padding: 15px 20px;
          }
        }
      `}</style>
    </nav>
  );
};

export default GlobalNavbar;
