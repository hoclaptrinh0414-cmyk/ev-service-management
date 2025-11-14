import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialAPI } from '../../services/adminAPI';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  RefreshCw,
} from 'lucide-react';

const FinancialReports = () => {
  const [dateRange, setDateRange] = useState('this-month');

  // Fetch revenue data
  const { isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue', dateRange],
    queryFn: async () => {
      const response = await financialAPI.getRevenue({ period: dateRange });
      return response.data;
    },
  });

  // Fetch today's revenue
  const { data: todayRevenue } = useQuery({
    queryKey: ['revenue-today'],
    queryFn: async () => {
      const response = await financialAPI.getRevenueToday();
      return response.data;
    },
  });

  // Fetch this month's revenue
  const { data: monthRevenue } = useQuery({
    queryKey: ['revenue-month'],
    queryFn: async () => {
      const response = await financialAPI.getRevenueThisMonth();
      return response.data;
    },
  });

  // Fetch payment gateway comparison
  useQuery({
    queryKey: ['payment-gateway'],
    queryFn: async () => {
      const response = await financialAPI.getPaymentGatewayComparison();
      return response.data;
    },
  });

  // Fetch outstanding invoices
  const { data: outstandingInvoices } = useQuery({
    queryKey: ['outstanding-invoices'],
    queryFn: async () => {
      const response = await financialAPI.getOutstandingInvoices();
      return response.data;
    },
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0);
  };

  const KPICard = ({ title, value, change, icon: Icon, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Icon className="text-indigo-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
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
    </div>
  );

  if (revenueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Mock data for demonstration
  const mockRevenueData = [
    { date: '2024-01-01', revenue: 45000000, expenses: 30000000 },
    { date: '2024-01-02', revenue: 52000000, expenses: 32000000 },
    { date: '2024-01-03', revenue: 48000000, expenses: 28000000 },
    { date: '2024-01-04', revenue: 61000000, expenses: 35000000 },
    { date: '2024-01-05', revenue: 55000000, expenses: 31000000 },
    { date: '2024-01-06', revenue: 67000000, expenses: 38000000 },
    { date: '2024-01-07', revenue: 59000000, expenses: 33000000 },
  ];

  const mockGatewayData = [
    { name: 'VNPay', value: 45, color: '#0088FE' },
    { name: 'Momo', value: 30, color: '#00C49F' },
    { name: 'Cash', value: 25, color: '#FFBB28' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Revenue, payments, and financial analytics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="this-year">This Year</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue?.data?.totalRevenue || 59000000)}
          change="+12.5%"
          icon={DollarSign}
          trend="up"
        />
        <KPICard
          title="This Month"
          value={formatCurrency(monthRevenue?.data?.totalRevenue || 1250000000)}
          change="+8.3%"
          icon={TrendingUp}
          trend="up"
        />
        <KPICard
          title="Total Payments"
          value="₫387M"
          change="-2.4%"
          icon={CreditCard}
          trend="down"
        />
        <KPICard
          title="Outstanding Invoices"
          value={(outstandingInvoices?.data?.length || 12).toString()}
          change="+5"
          icon={FileText}
          trend="up"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
          <div className="flex gap-2">
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              Revenue
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Expenses
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
              stroke="#888"
            />
            <YAxis
              tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`}
              stroke="#888"
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
            />
            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Gateway & Outstanding Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Gateway Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mockGatewayData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockGatewayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {mockGatewayData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Outstanding Invoices</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {[
              { id: 'INV-001', customer: 'Nguyễn Văn A', amount: 15000000, dueDate: '2024-12-20' },
              { id: 'INV-002', customer: 'Trần Thị B', amount: 8500000, dueDate: '2024-12-22' },
              { id: 'INV-003', customer: 'Lê Văn C', amount: 12000000, dueDate: '2024-12-25' },
              { id: 'INV-004', customer: 'Phạm Thị D', amount: 9200000, dueDate: '2024-12-28' },
              { id: 'INV-005', customer: 'Hoàng Văn E', amount: 18500000, dueDate: '2024-12-30' },
            ].map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{invoice.id}</p>
                  <p className="text-sm text-gray-600">{invoice.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                  <p className="text-xs text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Service */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue by Service Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { category: 'Battery Service', revenue: 450000000 },
              { category: 'Motor Repair', revenue: 380000000 },
              { category: 'Brake System', revenue: 290000000 },
              { category: 'Tire Service', revenue: 210000000 },
              { category: 'AC System', revenue: 180000000 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" stroke="#888" />
            <YAxis tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`} stroke="#888" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialReports;
