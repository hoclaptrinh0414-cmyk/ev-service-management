import React from 'react';
import { 
  Car, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
          <ArrowUpRight className="w-4 h-4" />
          {change}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

const ActivityItem = ({ customer, vehicle, time, status }) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    inProgress: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">{customer.charAt(0)}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{customer}</p>
          <p className="text-sm text-gray-600">{vehicle}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <Clock className="w-4 h-4" />
          {time}
        </div>
        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[status]}`}>
          {status === 'inProgress' ? 'In Progress' : status === 'completed' ? 'Completed' : 'Pending'}
        </span>
      </div>
    </div>
  );
};

const NewDashboard = () => {
  const stats = [
    { title: 'Total Vehicles', value: '1,247', change: '+12.5%', icon: Car, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { title: 'Total Customers', value: '856', change: '+8.3%', icon: Users, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { title: "Today's Appointments", value: '24', change: '+5.2%', icon: Calendar, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { title: 'Monthly Revenue', value: '$45,230', change: '+15.7%', icon: DollarSign, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  ];

  const activities = [
    { customer: 'John Doe', vehicle: 'Tesla Model 3', time: '10:00 AM', status: 'inProgress' },
    { customer: 'Jane Smith', vehicle: 'Nissan Leaf', time: '11:30 AM', status: 'pending' },
    { customer: 'Bob Johnson', vehicle: 'Chevy Bolt', time: '02:00 PM', status: 'completed' },
    { customer: 'Alice Williams', vehicle: 'BMW i3', time: '03:30 PM', status: 'pending' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your service center today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
            View All
          </button>
        </div>
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Service Completion</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">94%</p>
          <p className="text-sm text-gray-600">Average completion rate</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg. Service Time</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">2.5h</p>
          <p className="text-sm text-gray-600">Per vehicle service</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Customer Satisfaction</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">4.8/5</p>
          <p className="text-sm text-gray-600">Based on 124 reviews</p>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;
