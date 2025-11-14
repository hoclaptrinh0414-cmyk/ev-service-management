import React from 'react';
import { 
  Car, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, change, trend, icon: Icon, gradient }) => {
  const isPositive = trend === 'up';
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-gray-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm font-medium text-gray-600">
            {title}
          </CardDescription>
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg',
            gradient
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <div className="flex items-center gap-1.5 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(
              'font-semibold',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {change}
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentAppointment = ({ customer, vehicle, time, status }) => {
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
    inProgress: { color: 'bg-blue-100 text-blue-700', label: 'In Progress' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {customer.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{customer}</p>
          <p className="text-sm text-gray-500">{vehicle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">{time}</p>
        <span className={cn(
          'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
          config.color
        )}>
          {config.label}
        </span>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, gradient, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 border-gray-100 hover:-translate-y-1 group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300',
            gradient
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-1.5 text-base">{title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ModernDashboard = () => {
  const stats = {
    totalVehicles: 1247,
    totalCustomers: 856,
    todayAppointments: 24,
    monthlyRevenue: '$45,230'
  };

  const recentAppointments = [
    { customer: 'John Doe', vehicle: 'Tesla Model 3', time: '10:00 AM', status: 'inProgress' },
    { customer: 'Jane Smith', vehicle: 'Nissan Leaf', time: '11:30 AM', status: 'pending' },
    { customer: 'Bob Johnson', vehicle: 'Chevy Bolt', time: '02:00 PM', status: 'completed' },
    { customer: 'Alice Williams', vehicle: 'BMW i3', time: '03:30 PM', status: 'pending' }
  ];

  const quickActions = [
    {
      title: 'New Appointment',
      description: 'Schedule a service appointment',
      icon: Calendar,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Add Vehicle',
      description: 'Register new vehicle',
      icon: Car,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Add Customer',
      description: 'Create customer profile',
      icon: Users,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'View Reports',
      description: 'Financial & service reports',
      icon: Activity,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-blue-100 text-lg">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={Car}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          change="+8.3%"
          trend="up"
          icon={Users}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          change="-2.4%"
          trend="down"
          icon={Calendar}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          change="+15.7%"
          trend="up"
          icon={DollarSign}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              gradient={action.gradient}
              onClick={() => console.log(`Quick action: ${action.title}`)}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card className="border-gray-100 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              <span>Recent Appointments</span>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                View all
              </button>
            </CardTitle>
            <CardDescription>Latest service bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentAppointments.map((appointment, index) => (
                <RecentAppointment
                  key={index}
                  customer={appointment.customer}
                  vehicle={appointment.vehicle}
                  time={appointment.time}
                  status={appointment.status}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-gray-100 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">System Status</CardTitle>
            <CardDescription>Service health overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">API Services</p>
                    <p className="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Database</p>
                    <p className="text-sm text-gray-600">Connected and synced</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Backup Service</p>
                    <p className="text-sm text-gray-600">Last backup: 2 hours ago</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Running
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Email Service</p>
                    <p className="text-sm text-gray-600">Rate limit approaching</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  Warning
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernDashboard;
