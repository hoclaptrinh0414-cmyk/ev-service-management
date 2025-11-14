// Modern Admin Layout với Fixed Sidebar
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
  Bell, 
  Search, 
  Menu,
  X,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/schedule', label: 'Schedule', icon: Calendar },
  { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/admin/parts', label: 'Parts Inventory', icon: Package },
  { to: '/admin/staff', label: 'Staff', icon: UserCheck },
  { to: '/admin/finance', label: 'Finance', icon: TrendingUp },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const ModernAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Sidebar - Desktop */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 fixed left-0 top-0 h-full z-40',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">EV</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">EV Service</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="h-9 w-9 mx-auto"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">EV</span>
              </div>
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  sidebarCollapsed && 'justify-center'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-blue-600')} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user?.fullName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Administrator
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="w-10 h-10 mx-auto text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">EV</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">EV Service</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-blue-600')} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user?.fullName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Administrator
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                className="w-full justify-start mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area - với margin-left để tránh sidebar */}
      <div 
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-300',
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-20'
        )}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between shadow-sm">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles, customers, appointments..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100 rounded-xl"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </Button>

            <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ModernAdminLayout;
