import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const isPositive = trend === 'up';

  return (
    <Card className="border-gray-200 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {change}
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </CardContent>
    </Card>
  );
};

const TransactionRow = ({ date, description, type, amount, status }) => {
  const statusColors = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    failed: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="py-4 px-6">
        <p className="text-sm text-gray-900">{date}</p>
      </td>
      <td className="py-4 px-6">
        <p className="text-sm font-medium text-gray-900">{description}</p>
      </td>
      <td className="py-4 px-6">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
          }`}
        >
          {type === 'income' ? 'Income' : 'Expense'}
        </span>
      </td>
      <td className="py-4 px-6">
        <p
          className={`text-sm font-bold ${
            type === 'income' ? 'text-emerald-600' : 'text-gray-900'
          }`}
        >
          {type === 'income' ? '+' : '-'}${amount.toLocaleString()}
        </p>
      </td>
      <td className="py-4 px-6">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
    </tr>
  );
};

const Finance = () => {
  const [dateFilter, setDateFilter] = useState('thisMonth');

  const stats = [
    {
      title: 'Total Revenue',
      value: '$127,500',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    },
    {
      title: 'Total Expenses',
      value: '$42,890',
      change: '+8.1%',
      trend: 'up',
      icon: Wallet,
      color: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    {
      title: 'Net Profit',
      value: '$84,610',
      change: '+23.7%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Pending Payments',
      value: '$12,340',
      change: '-12.4%',
      trend: 'down',
      icon: CreditCard,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  const transactions = [
    {
      date: '2025-11-10',
      description: 'Tesla Model 3 - Full Service',
      type: 'income',
      amount: 850,
      status: 'completed'
    },
    {
      date: '2025-11-10',
      description: 'Parts Purchase - Battery Components',
      type: 'expense',
      amount: 1200,
      status: 'completed'
    },
    {
      date: '2025-11-09',
      description: 'VinFast VF8 - Brake Service',
      type: 'income',
      amount: 450,
      status: 'pending'
    },
    {
      date: '2025-11-09',
      description: 'Nissan Leaf - Tire Replacement',
      type: 'income',
      amount: 620,
      status: 'completed'
    },
    {
      date: '2025-11-08',
      description: 'Staff Salary - November',
      type: 'expense',
      amount: 15000,
      status: 'completed'
    }
  ];

  const paymentMethods = [
    { name: 'Cash', amount: 45230, percentage: 35, color: 'bg-blue-500' },
    { name: 'Credit Card', amount: 58900, percentage: 46, color: 'bg-purple-500' },
    { name: 'Bank Transfer', amount: 23370, percentage: 19, color: 'bg-emerald-500' }
  ];

  return (
    <div className="admin-finance-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Financial Overview</h1>
          <p>Track revenue, expenses, and financial performance</p>
        </div>
        <div className="header-actions">
          <div className="date-filter">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <button className="export-btn">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Payment Methods */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <CardTitle className="text-lg font-bold">Payment Methods Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${method.color}`} />
                    <span className="text-sm font-medium text-gray-900">{method.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${method.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{method.percentage}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${method.color} transition-all duration-500`}
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View All
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <TransactionRow key={index} {...transaction} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg. Transaction Value</h3>
            <p className="text-3xl font-bold text-gray-900">$734</p>
            <p className="text-sm text-emerald-600 font-semibold mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold text-gray-900">1,247</p>
            <p className="text-sm text-emerald-600 font-semibold mt-1">+8.3% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Payment Success Rate</h3>
            <p className="text-3xl font-bold text-gray-900">98.2%</p>
            <p className="text-sm text-emerald-600 font-semibold mt-1">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .admin-finance-page {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-header h1 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-weight: 800;
          font-size: 36px;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .page-header p {
          font-size: 16px;
          color: #86868b;
          margin: 8px 0 0 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .date-filter {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 25px;
        }

        .filter-select {
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          cursor: pointer;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .date-filter,
          .export-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Finance;
