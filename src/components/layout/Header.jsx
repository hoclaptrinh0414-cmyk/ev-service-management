import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BREADCRUMB_MAP = {
  '/admin': 'Dashboard',
  '/admin/vehicles': 'Vehicles',
  '/admin/customers': 'Customers',
  '/admin/schedule': 'Schedule',
  '/admin/maintenance': 'Maintenance',
  '/admin/parts': 'Parts',
  '/admin/staff': 'Staff',
  '/admin/finance': 'Finance',
  '/admin/settings': 'Settings'
};

const Header = ({ sidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = ['Admin'];

    if (pathSegments.length > 1) {
      const currentPath = `/${pathSegments.slice(0, 2).join('/')}`;
      const pageName = BREADCRUMB_MAP[currentPath];
      if (pageName && pageName !== 'Dashboard') {
        breadcrumbs.push(pageName);
      }
    }

    return breadcrumbs;
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white/70 backdrop-blur-md border-b border-gray-200 z-30 transition-all duration-300"
      style={{
        left: sidebarCollapsed ? '5rem' : '16rem'
      }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600'
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
