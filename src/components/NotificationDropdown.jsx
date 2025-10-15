// src/components/NotificationDropdown.jsx
import React, { useState, useEffect, useRef } from "react";

// SVG Icons
const Bell = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const Check = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const X = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Settings = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6" />
    <path d="M1 12h6m6 0h6" />
  </svg>
);

// Dropdown Menu Component
const DropdownMenu = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="position-relative d-inline-block" ref={dropdownRef}>
      <div onClick={handleTriggerClick} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className="position-absolute rounded shadow-lg bg-white"
          style={{
            right: 0,
            marginTop: '0.5rem',
            width: '20rem',
            zIndex: 1050,
            border: '1px solid rgba(0,0,0,0.05)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ title, message, time, unread = false, onMarkRead, onDismiss, onClick }) => (
  <div
    className={`p-3 ${unread ? 'bg-light' : ''}`}
    style={{
      borderBottom: '1px solid #e9ecef',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background-color 0.2s'
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (onClick) e.currentTarget.style.backgroundColor = '#f8f9fa';
    }}
    onMouseLeave={(e) => {
      if (onClick) e.currentTarget.style.backgroundColor = unread ? '#e7f1ff' : 'transparent';
    }}
  >
    <div className="d-flex align-items-start justify-content-between">
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="d-flex align-items-center gap-2">
          <h6 className="mb-0 text-dark" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {title}
          </h6>
          {unread && (
            <div
              style={{
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: '#0d6efd',
                borderRadius: '50%'
              }}
            ></div>
          )}
        </div>
        <p className="mb-1 text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {message}
        </p>
        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          {time}
        </p>
      </div>
      <div className="d-flex align-items-center gap-1 ms-2">
        {unread && onMarkRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            className="btn btn-sm p-1"
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6c757d',
              transition: 'color 0.2s'
            }}
            title="Đánh dấu đã đọc"
            onMouseEnter={(e) => e.currentTarget.style.color = '#198754'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
          >
            <Check style={{ width: '1rem', height: '1rem' }} />
          </button>
        )}
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="btn btn-sm p-1"
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6c757d',
              transition: 'color 0.2s'
            }}
            title="Xóa"
            onMouseEnter={(e) => e.currentTarget.style.color = '#dc3545'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
          >
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        )}
      </div>
    </div>
  </div>
);

// Main NotificationDropdown Component
export default function NotificationDropdown({ notifications = [], onMarkRead, onDismiss, onNotificationClick }) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    notifications.forEach((notification) => {
      if (notification.unread && onMarkRead) {
        onMarkRead(notification.id);
      }
    });
  };

  return (
    <DropdownMenu
      trigger={
        <button
          className="position-relative btn p-2"
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            color: '#ffffff',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#000000';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Bell style={{ width: '1.5rem', height: '1.5rem' }} />
          {unreadCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '0.25rem 0.4rem',
                minWidth: '1.25rem'
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="p-3" style={{ borderBottom: '1px solid #e9ecef' }}>
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0 text-dark" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            Thông báo
          </h5>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn btn-sm"
              style={{
                fontSize: '0.875rem',
                color: '#0d6efd',
                fontWeight: 500,
                border: 'none',
                backgroundColor: 'transparent',
                padding: '0.25rem 0.5rem'
              }}
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="mb-0 text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Bạn có {unreadCount} thông báo chưa đọc
          </p>
        )}
      </div>

      <div className="notification-scrollbar" style={{ maxHeight: '24rem', overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              message={notification.message}
              time={notification.time}
              unread={notification.unread}
              onMarkRead={() => onMarkRead && onMarkRead(notification.id)}
              onDismiss={() => onDismiss && onDismiss(notification.id)}
              onClick={() => onNotificationClick && onNotificationClick(notification)}
            />
          ))
        ) : (
          <div className="p-5 text-center">
            <Bell style={{ width: '3rem', height: '3rem', color: '#dee2e6', margin: '0 auto 0.75rem' }} />
            <p className="mb-0 text-muted">Không có thông báo</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3" style={{ borderTop: '1px solid #e9ecef' }}>
          <button
            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            style={{
              fontSize: '0.875rem',
              color: '#6c757d',
              border: 'none',
              backgroundColor: 'transparent',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#212529'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
          >
            <Settings style={{ width: '1rem', height: '1rem' }} />
            <span>Cài đặt thông báo</span>
          </button>
        </div>
      )}
    </DropdownMenu>
  );
}
