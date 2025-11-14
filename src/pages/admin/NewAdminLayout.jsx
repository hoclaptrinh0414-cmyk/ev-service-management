import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Calendar, 
  Wrench, 
  Package, 
  UserCheck, 
  TrendingUp, 
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/schedule', label: 'Schedule', icon: Calendar },
  { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/admin/parts', label: 'Parts', icon: Package },
  { to: '/admin/staff', label: 'Staff', icon: UserCheck },
  { to: '/admin/finance', label: 'Finance', icon: TrendingUp },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const NewAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside 
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm`}
      >
        {/* Logo & Brand */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">EV</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">EV Service</span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto cursor-pointer hover:shadow-lg transition-shadow"
            >
              <span className="text-white font-bold">EV</span>
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all
                    ${active 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-gray-600'}`} />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {user?.fullName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.fullName || 'Administrator'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Admin</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto cursor-pointer">
                <span className="text-white font-semibold text-sm">
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default NewAdminLayout;
