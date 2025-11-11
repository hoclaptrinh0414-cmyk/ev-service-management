import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CarFront,
  Users2,
  CalendarCheck,
  Wrench,
  PackageSearch,
  UserCog,
  BarChart3,
  Settings,
  ChevronLeft,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: 'Vehicles',
    href: '/admin/vehicles',
    icon: CarFront
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users2
  },
  {
    title: 'Schedule',
    href: '/admin/schedule',
    icon: CalendarCheck
  },
  {
    title: 'Maintenance',
    href: '/admin/maintenance',
    icon: Wrench
  },
  {
    title: 'Parts',
    href: '/admin/parts',
    icon: PackageSearch
  },
  {
    title: 'Staff',
    href: '/admin/staff',
    icon: UserCog
  },
  {
    title: 'Finance',
    href: '/admin/finance',
    icon: BarChart3
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out z-40 border-r border-slate-700',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">EV Service</h1>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform',
            collapsed && 'rotate-180'
          )}
        />
      </button>

      {/* Navigation */}
      <nav className="py-6 px-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ease-in-out group relative',
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                collapsed && 'justify-center'
              )}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}

              <Icon
                className={cn(
                  'w-5 h-5 transition-transform group-hover:scale-110',
                  collapsed ? 'mx-auto' : ''
                )}
              />

              {!collapsed && (
                <span className="font-medium text-sm">{item.title}</span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                  {item.title}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
