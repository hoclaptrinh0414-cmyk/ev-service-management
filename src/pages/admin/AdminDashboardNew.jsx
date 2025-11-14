import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialAPI, appointmentAPI, inventoryAPI } from '../../services/adminAPI';
import {
  DollarSign,
  Users,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboardNew = () => {
  // Fetch dashboard data
  const { data: todayRevenue } = useQuery({
    queryKey: ['dashboard-revenue-today'],
    queryFn: async () => {
      const response = await financialAPI.getRevenueToday();
      return response.data;
    },
  });

  const { data: appointmentStats } = useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: async () => {
      const response = await appointmentAPI.getStatisticsByStatus();
      return response.data;
    },
  });

  const { data: lowStockAlerts } = useQuery({
    queryKey: ['dashboard-low-stock'],
    queryFn: async () => {
      const response = await inventoryAPI.getLowStockAlerts();
      return response.data;
    },
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {change}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  // Mock data for charts
  const revenueChartData = [
    { day: 'Mon', revenue: 45000000 },
    { day: 'Tue', revenue: 52000000 },
    { day: 'Wed', revenue: 48000000 },
    { day: 'Thu', revenue: 61000000 },
    { day: 'Fri', revenue: 55000000 },
    { day: 'Sat', revenue: 67000000 },
    { day: 'Sun', revenue: 59000000 },
  ];

  const serviceChartData = [
    { service: 'Battery', count: 45 },
    { service: 'Motor', count: 38 },
    { service: 'Brake', count: 29 },
    { service: 'Tire', count: 52 },
    { service: 'AC', count: 18 },
  ];

  const recentAppointments = [
    { id: 'APT-001', customer: 'Nguyễn Văn A', service: 'Battery Service', time: '09:00', status: 'Confirmed' },
    { id: 'APT-002', customer: 'Trần Thị B', service: 'Motor Repair', time: '10:30', status: 'In Progress' },
    { id: 'APT-003', customer: 'Lê Văn C', service: 'Brake Check', time: '11:00', status: 'Pending' },
    { id: 'APT-004', customer: 'Phạm Thị D', service: 'Full Service', time: '14:00', status: 'Confirmed' },
    { id: 'APT-005', customer: 'Hoàng Văn E', service: 'Tire Change', time: '15:30', status: 'Confirmed' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Confirmed': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-orange-100 text-orange-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
        <p className="text-indigo-100">Here's what's happening with your EV service center today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue?.data?.totalRevenue || 59000000)}
          change="+12.5%"
          icon={DollarSign}
          trend="up"
          color="bg-green-500"
        />
        <StatCard
          title="Total Appointments"
          value={(appointmentStats?.data?.totalCount || 48).toString()}
          change="+8.3%"
          icon={Calendar}
          trend="up"
          color="bg-blue-500"
        />
        <StatCard
          title="Active Customers"
          value="1,247"
          change="+15.2%"
          icon={Users}
          trend="up"
          color="bg-purple-500"
        />
        <StatCard
          title="Low Stock Alerts"
          value={(lowStockAlerts?.data?.length || 12).toString()}
          change="+3"
          icon={AlertTriangle}
          trend="down"
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Weekly Revenue</h2>
            <Activity className="text-gray-400" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`} stroke="#888" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Popularity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Services</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={serviceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="service" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Appointments</h2>
          <div className="space-y-3">
            {recentAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{apt.customer}</p>
                    <span className="text-xs text-gray-500">• {apt.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{apt.service}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Low Stock Alerts</h2>
          <div className="space-y-3">
            {[
              { name: 'Battery 75kWh', current: 3, min: 10, urgent: true },
              { name: 'Brake Pads', current: 8, min: 15, urgent: false },
              { name: 'DC Charger 150kW', current: 0, min: 5, urgent: true },
              { name: 'Cooling System', current: 6, min: 12, urgent: false },
              { name: 'Type 2 Cable', current: 5, min: 10, urgent: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {item.urgent && <AlertTriangle className="text-red-500" size={20} />}
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Current: {item.current} | Min: {item.min}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.urgent ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.urgent ? 'Urgent' : 'Low'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add User', icon: Users, path: '/admin/users' },
            { label: 'New Appointment', icon: Calendar, path: '/admin/appointments' },
            { label: 'Stock Management', icon: Package, path: '/admin/inventory' },
            { label: 'Financial Report', icon: DollarSign, path: '/admin/financial-reports' },
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => window.location.href = action.path}
              className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
            >
              <action.icon className="text-indigo-600" size={24} />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
