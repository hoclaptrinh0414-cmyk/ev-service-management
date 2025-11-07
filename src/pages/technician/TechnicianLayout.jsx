// src/pages/technician/TechnicianLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  History,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';

const TechnicianLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return {
        name: u?.fullName || u?.FullName || 'Technician',
        email: u?.email || u?.Email || '',
        initials: (u?.fullName || u?.FullName || 'T').substring(0, 2).toUpperCase()
      };
    } catch {
      return { name: 'Technician', email: '', initials: 'TC' };
    }
  })();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/technician',
      exact: true
    },
    {
      title: 'Work Orders',
      icon: ClipboardList,
      path: '/technician/work-orders'
    },
    {
      title: 'My Schedule',
      icon: Calendar,
      path: '/technician/schedule'
    },
    {
      title: 'Attendance',
      icon: History,
      path: '/technician/attendance'
    },
    {
      title: 'Performance',
      icon: TrendingUp,
      path: '/technician/performance'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r border-gray-200',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen && (
            <Link to="/technician" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EV</span>
              </div>
              <span className="font-semibold text-gray-900">EV Service</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-gray-100',
                  active && 'bg-blue-50 text-blue-700 font-medium',
                  !active && 'text-gray-700'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'text-blue-700')} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {active && <ChevronRight className="h-4 w-4" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg bg-gray-50',
              !sidebarOpen && 'justify-center'
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => isActive(item.path, item.exact))?.title || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TechnicianLayout;
