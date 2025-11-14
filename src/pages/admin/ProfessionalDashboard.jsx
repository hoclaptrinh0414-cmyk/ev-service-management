import React, { useEffect, useState, useRef } from 'react';
import {
  Car,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Award,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

// CountUp Animation Hook
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (end === 0) return;
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentCount = Math.floor(start + (end - start) * easeOutQuart);
      
      countRef.current = currentCount;
      setCount(currentCount);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
};

const StatCard = ({ title, value, change, changeType, icon: Icon, color, loading, delay = 0 }) => {
  const isPositive = changeType === 'positive';
  const [isVisible, setIsVisible] = useState(false);
  
  // Extract number from value string (e.g., "1,247" or "$45,230")
  const numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/[^0-9]/g, '')) 
    : value;
  
  const animatedValue = useCountUp(isVisible ? numericValue : 0, 2000);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const formatValue = (num) => {
    if (typeof value === 'string' && value.includes('$')) {
      return `$${num.toLocaleString()}`;
    }
    return num.toLocaleString();
  };

  return (
    <Card className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 border-gray-200 relative overflow-hidden">
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="w-7 h-7 text-white animate-in zoom-in duration-700" style={{ animationDelay: `${delay}ms` }} />
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full transition-all duration-300 ${
                isPositive 
                  ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' 
                  : 'bg-red-50 text-red-600 group-hover:bg-red-100'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4 animate-bounce" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {change}
            </div>
          )}
        </div>
        <div>
          {loading ? (
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded mb-2" />
          ) : (
            <h3 className="text-4xl font-bold text-gray-900 mb-1 transition-colors group-hover:text-blue-600">
              {formatValue(animatedValue)}
            </h3>
          )}
          <p className="text-sm text-gray-600 font-medium group-hover:text-gray-700 transition-colors">{title}</p>
        </div>
      </CardContent>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Card>
  );
};

const ActivityItem = ({ type, customer, vehicle, time, status, index }) => {
  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
    inProgress: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200' }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;
  
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      className={`flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 px-4 rounded-lg transition-all duration-300 cursor-pointer group ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
      style={{ transition: 'all 0.5s ease-out' }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 ring-2 ${config.ring} ring-offset-2`}>
            <span className="text-white font-bold text-lg">{customer.charAt(0)}</span>
          </div>
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{customer}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">{vehicle}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {time}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} ring-1 ${config.ring} group-hover:scale-105 transition-transform duration-300`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-semibold ${config.color}`}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1')}
          </span>
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

const QuickStatCard = ({ title, value, subtitle, icon: Icon, color, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000 + index * 200);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Card className={`border-gray-200 hover:shadow-xl transition-all duration-500 group relative overflow-hidden ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{title}</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1 group-hover:scale-105 transition-transform origin-left">{value}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardContent>
      
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 transform translate-x-10 -translate-y-10 rotate-45 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500`} />
    </Card>
  );
};

const ModernDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vehicles: 0,
    customers: 0,
    appointments: 0,
    revenue: 0
  });

  useEffect(() => {
    // Simulate API call - Replace with real API integration
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Simulated data - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          vehicles: 1247,
          customers: 856,
          appointments: 24,
          revenue: 45230
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const mainStats = [
    {
      title: 'Total Vehicles',
      value: stats.vehicles,
      change: '+12.5%',
      changeType: 'positive',
      icon: Car,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Total Customers',
      value: stats.customers,
      change: '+8.3%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: "Today's Appointments",
      value: stats.appointments,
      change: '+5.2%',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.revenue}`,
      change: '+15.7%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  const recentActivities = [
    { type: 'appointment', customer: 'John Doe', vehicle: 'Tesla Model 3', time: '10:00 AM', status: 'inProgress' },
    { type: 'appointment', customer: 'Jane Smith', vehicle: 'Nissan Leaf', time: '11:30 AM', status: 'pending' },
    { type: 'appointment', customer: 'Bob Johnson', vehicle: 'Chevy Bolt', time: '02:00 PM', status: 'completed' },
    { type: 'appointment', customer: 'Alice Williams', vehicle: 'BMW i3', time: '03:30 PM', status: 'pending' },
    { type: 'appointment', customer: 'Charlie Brown', vehicle: 'Audi e-tron', time: '04:15 PM', status: 'cancelled' }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>
          Welcome back! Here's what's happening with your EV service center today.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {mainStats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} delay={index * 200} />
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="activity-card">
        <CardHeader className="activity-header">
          <div className="flex items-center justify-between">
            <CardTitle className="activity-title">Recent Activity</CardTitle>
            <button className="view-all-btn">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {recentActivities.map((activity, index) => (
            <ActivityItem key={index} {...activity} index={index} />
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="quick-stats-grid">
        <QuickStatCard
          title="Service Completion Rate"
          value="94%"
          subtitle="Average completion rate this month"
          icon={TrendingUp}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          index={0}
        />
        <QuickStatCard
          title="Avg. Service Time"
          value="2.5h"
          subtitle="Per vehicle service duration"
          icon={Clock}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          index={1}
        />
        <QuickStatCard
          title="Customer Satisfaction"
          value="4.8/5"
          subtitle="Based on 124 reviews this month"
          icon={Users}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          index={2}
        />
      </div>

      <style>{`
        .admin-dashboard {
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .activity-card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          margin-bottom: 32px;
        }

        .activity-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e5e5;
          background: #fafafa;
          border-radius: 16px 16px 0 0;
        }

        .activity-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .view-all-btn {
          font-size: 14px;
          font-weight: 600;
          color: #667eea;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .view-all-btn:hover {
          color: #764ba2;
          gap: 8px;
        }

        .quick-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .stats-grid,
          .quick-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernDashboard;
