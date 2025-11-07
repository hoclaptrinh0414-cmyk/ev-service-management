import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Timer,
  ClipboardList,
  Calendar,
  Award,
  ArrowRight,
  LogIn,
  LogOut as LogOutIcon,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { formatTime, formatDateTime } from '../../lib/utils';
import technicianService from '../../services/technicianService';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [todayShift, setTodayShift] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [shiftResponse, workOrdersResponse] = await Promise.all([
        technicianService.getTodayShift(),
        technicianService.getMyWorkOrders()
      ]);

      const shiftData = shiftResponse?.data || shiftResponse?.Data || shiftResponse;
      const workOrdersData = workOrdersResponse?.data || workOrdersResponse?.Data || workOrdersResponse;
      
      setTodayShift(shiftData);
      const allOrders = Array.isArray(workOrdersData) ? workOrdersData : [];
      setWorkOrders(allOrders.slice(0, 5));
      
      setStats({
        pending: allOrders.filter(wo => (wo.status || wo.Status) === 'Pending').length,
        inProgress: allOrders.filter(wo => (wo.status || wo.Status) === 'In Progress').length,
        completed: allOrders.filter(wo => (wo.status || wo.Status) === 'Completed').length,
        total: allOrders.length
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await technicianService.checkIn({
        serviceCenterId: 1,
        shiftType: 'FullDay',
        notes: 'Check-in via Dashboard'
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Check-in failed:', error);
      alert('Không thể check-in. Vui lòng thử lại.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await technicianService.checkOut({
        notes: 'Check-out via Dashboard'
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Check-out failed:', error);
      alert('Không thể check-out. Vui lòng thử lại.');
    } finally {
      setCheckingOut(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { variant: 'warning', label: 'Chờ xử lý' },
      'In Progress': { variant: 'info', label: 'Đang xử lý' },
      'Completed': { variant: 'success', label: 'Hoàn thành' },
      'Cancelled': { variant: 'destructive', label: 'Đã hủy' }
    };
    const config = statusMap[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng công việc</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Chờ xử lý</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Đang xử lý</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Attendance */}
        <div className="lg:col-span-1 space-y-6">
          {/* Today Shift Card */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ca làm việc hôm nay</CardTitle>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <CardDescription>
                {currentTime.toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Time Display */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white text-center">
                <p className="text-sm opacity-90 mb-1">Thời gian hiện tại</p>
                <p className="text-4xl font-bold tabular-nums">
                  {currentTime.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>

              {/* Shift Info */}
              {todayShift ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Đã check-in</p>
                        <p className="text-xs text-green-600">
                          {formatTime(todayShift.checkInTime || todayShift.CheckInTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {todayShift.checkOutTime || todayShift.CheckOutTime ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <LogOutIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Đã check-out</p>
                          <p className="text-xs text-blue-600">
                            {formatTime(todayShift.checkOutTime || todayShift.CheckOutTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={handleCheckOut}
                      disabled={checkingOut}
                    >
                      <LogOutIcon className="h-4 w-4 mr-2" />
                      {checkingOut ? 'Đang xử lý...' : 'Check-out'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-medium">Chưa check-in</p>
                    </div>
                    <p className="text-sm text-orange-600">
                      Bạn cần check-in để bắt đầu ca làm việc hôm nay
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {checkingIn ? 'Đang xử lý...' : 'Check-in ngay'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Truy cập nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/technician/schedule')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Lịch làm việc
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/technician/attendance')}
              >
                <Timer className="h-4 w-4 mr-2" />
                Lịch sử chấm công
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/technician/performance')}
              >
                <Award className="h-4 w-4 mr-2" />
                Hiệu suất làm việc
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Work Orders */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Công việc gần đây</CardTitle>
                  <CardDescription className="mt-1">
                    {stats.total} công việc được giao
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/technician/work-orders')}
                >
                  Xem tất cả
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Không có công việc nào</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Bạn chưa được giao công việc nào hôm nay
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workOrders.map((workOrder) => {
                    const woId = workOrder.workOrderId || workOrder.WorkOrderId;
                    const woCode = workOrder.workOrderCode || workOrder.WorkOrderCode;
                    const woStatus = workOrder.status || workOrder.Status;
                    const woCustomer = workOrder.customerName || workOrder.CustomerName;
                    const woCreated = workOrder.createdAt || workOrder.CreatedAt;
                    const woProgress = workOrder.progress || 0;

                    return (
                      <div
                        key={woId}
                        className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navigate(`/technician/work-orders/${woId}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                #{woCode}
                              </h3>
                              {getStatusBadge(woStatus)}
                            </div>
                            <p className="text-sm text-gray-600">{woCustomer}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(woCreated)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {woStatus === 'In Progress' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">Tiến độ</span>
                              <span className="font-medium text-blue-600">{woProgress}%</span>
                            </div>
                            <Progress value={woProgress} className="h-2" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
