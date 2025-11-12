// src/pages/technician/Attendance.jsx - REDESIGNED
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../services/api';

/**
 * Attendance Page - Complete Redesign
 * Features: Modern UI, Check-in/out with shift selection, Real-time tracking, History
 */

// API Functions with proper parameters
const attendanceAPI = {
  // Get today's attendance/shift
  getTodayAttendance: async () => {
    const response = await api.request('/api/technicians/attendance/today', {
      method: 'GET'
    });
    console.log('📥 Today Attendance Response:', response);
    return response;
  },

  // Check in with parameters
  checkIn: async (data) => {
    const response = await api.request('/api/technicians/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({
        serviceCenterId: data.serviceCenterId || 1,
        shiftType: data.shiftType || 'Morning',
        notes: data.notes || ''
      })
    });
    console.log('✅ Check-in Response:', response);
    return response;
  },

  // Check out with parameters
  checkOut: async (data) => {
    const response = await api.request('/api/technicians/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({
        notes: data.notes || '',
        earlyCheckoutReason: data.earlyCheckoutReason || null
      })
    });
    console.log('✅ Check-out Response:', response);
    return response;
  },

  // Get attendance history
  getAttendanceHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/technicians/attendance/my-shifts${queryString ? `?${queryString}` : ''}`;
    const response = await api.request(url, {
      method: 'GET'
    });
    console.log('📋 Attendance History Response:', response);
    return response;
  },
};

export default function Attendance() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const [checkInData, setCheckInData] = useState({
    serviceCenterId: 1,
    shiftType: 'Morning',
    notes: ''
  });
  const [checkOutData, setCheckOutData] = useState({
    notes: '',
    earlyCheckoutReason: ''
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance
  const {
    data: todayData,
    isLoading: loadingToday,
    error: todayError,
  } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: attendanceAPI.getTodayAttendance,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1, // Only retry once if error
  });

  // Fetch attendance history with date range filter
  const historyParams = {};
  if (dateRange.from) historyParams.from = dateRange.from;
  if (dateRange.to) historyParams.to = dateRange.to;
  
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['attendanceHistory', dateRange],
    queryFn: () => attendanceAPI.getAttendanceHistory(historyParams),
  });

  // Check in mutation with parameters
  const checkInMutation = useMutation({
    mutationFn: (data) => attendanceAPI.checkIn(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['todayAttendance']);
      queryClient.invalidateQueries(['attendanceHistory']);
      const shift = response?.data || response;
      const lateStatus = shift.isLate ? ' ⚠️ (Late)' : '';
      toast.success(response?.message || `Checked in successfully! 🎉${lateStatus}`);
      setShowCheckInModal(false);
      setCheckInData({ serviceCenterId: 1, shiftType: 'Morning', notes: '' });
    },
    onError: (error) => {
      console.error('❌ Check-in error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to check in');
    },
  });

  // Check out mutation with parameters
  const checkOutMutation = useMutation({
    mutationFn: (data) => attendanceAPI.checkOut(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['todayAttendance']);
      queryClient.invalidateQueries(['attendanceHistory']);
      const shift = response?.data || response;
      const hours = shift.workedHours || shift.netWorkingHours || 0;
      toast.success(response?.message || 'Checked out successfully!', {
        description: shift?.isEarlyLeave 
          ? `Early leave recorded${hours ? ` • ${hours}h worked` : ''}`
          : hours 
            ? `Hours worked: ${hours}h`
            : undefined
      });
      setShowCheckOutModal(false);
      setCheckOutData({ notes: '', earlyCheckoutReason: '' });
    },
    onError: (error) => {
      console.error('❌ Check-out error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to check out');
    },
  });

  // Handle check in - show modal
  const handleCheckIn = () => {
    setShowCheckInModal(true);
  };

  // Submit check in
  const submitCheckIn = () => {
    if (!checkInData.shiftType) {
      toast.error('Please select a shift type');
      return;
    }
    checkInMutation.mutate(checkInData);
  };

  // Handle check out
  const handleCheckOut = () => {
    setShowCheckOutModal(true);
  };

  const submitCheckOut = () => {
    checkOutMutation.mutate(checkOutData);
  };

  // Calculate worked duration
  const calculateDuration = (checkInTime) => {
    if (!checkInTime) return '0h 0m';
    const start = new Date(checkInTime);
    const diff = Math.floor((currentTime - start) / 1000 / 60); // minutes
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  const todayAttendance = todayData?.data;
  const attendanceHistory = historyData?.data || [];
  const hasNoShift = todayError?.response?.status === 404;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <i className="bi bi-clock-history text-white text-2xl"></i>
                </div>
                Attendance & Time Tracking
              </h1>
              <p className="text-gray-600 mt-2 ml-15">Manage your work hours and shift attendance</p>
            </div>
            
            {/* Live Clock Badge */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl px-6 py-4">
              <div className="text-xs text-orange-600 font-semibold mb-1 text-center">CURRENT TIME</div>
              <div className="text-3xl font-bold text-orange-600 font-mono tracking-tight">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <div className="text-xs text-gray-600 mt-1 text-center">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SECTION - Today's Shift */}
          <div className="xl:col-span-2 space-y-6">
            {/* Today's Shift Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {loadingToday ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading shift data...</p>
                </div>
              ) : hasNoShift ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-calendar-x text-5xl text-gray-400"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Shift</h3>
                  <p className="text-gray-600 mb-8">You haven't checked in today. Start your shift now!</p>
                  <button
                    onClick={handleCheckIn}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <i className="bi bi-box-arrow-in-right text-2xl"></i>
                    Check In Now
                  </button>
                </div>
              ) : (
                <>
                  {/* Shift Header */}
                  <div className={`p-6 ${todayAttendance?.isCheckedIn && !todayAttendance?.checkOutTime 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : todayAttendance?.isCompleted 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <i className="bi bi-calendar-check text-3xl"></i>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold mb-1">Today's Shift</h2>
                          <p className="text-white/80 flex items-center gap-2">
                            <i className="bi bi-building"></i>
                            {todayAttendance?.serviceCenterName || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
                          todayAttendance?.isCheckedIn && !todayAttendance?.checkOutTime
                            ? 'bg-white/30 backdrop-blur-sm'
                            : 'bg-white/20 backdrop-blur-sm'
                        }`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            todayAttendance?.isCheckedIn && !todayAttendance?.checkOutTime ? 'bg-white animate-pulse' : 'bg-white/70'
                          }`}></div>
                          {todayAttendance?.status || 'N/A'}
                        </div>
                        <div className="mt-2 text-lg font-semibold">
                          {todayAttendance?.shiftType || 'N/A'} Shift
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shift Details Grid */}
                  <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <DetailCard
                      icon="bi-clock"
                      label="Scheduled"
                      value={`${formatTime(todayAttendance?.scheduledStartTime)} - ${formatTime(todayAttendance?.scheduledEndTime)}`}
                      color="text-blue-600"
                      bgColor="bg-blue-50"
                    />
                    <DetailCard
                      icon="bi-box-arrow-in-right"
                      label="Check In"
                      value={todayAttendance?.checkInTime ? formatDateTime(todayAttendance.checkInTime) : 'Not yet'}
                      color={todayAttendance?.isLate ? 'text-red-600' : 'text-green-600'}
                      bgColor={todayAttendance?.isLate ? 'bg-red-50' : 'bg-green-50'}
                      badge={todayAttendance?.isLate ? `Late ${todayAttendance?.lateMinutes}m` : null}
                    />
                    <DetailCard
                      icon="bi-box-arrow-right"
                      label="Check Out"
                      value={todayAttendance?.checkOutTime ? formatDateTime(todayAttendance.checkOutTime) : 'Not yet'}
                      color={todayAttendance?.isEarlyLeave ? 'text-orange-600' : 'text-gray-600'}
                      bgColor={todayAttendance?.isEarlyLeave ? 'bg-orange-50' : 'bg-gray-50'}
                      badge={todayAttendance?.isEarlyLeave ? 'Early Leave' : null}
                    />
                    <DetailCard
                      icon="bi-hourglass-split"
                      label="Worked Hours"
                      value={todayAttendance?.isCheckedIn && !todayAttendance?.checkOutTime 
                        ? calculateDuration(todayAttendance?.checkInTime)
                        : todayAttendance?.netWorkingHours 
                        ? `${todayAttendance.netWorkingHours.toFixed(1)}h`
                        : '0h'}
                      color="text-purple-600"
                      bgColor="bg-purple-50"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
                    {todayAttendance?.isCheckedIn && !todayAttendance?.checkOutTime ? (
                      <button
                        onClick={handleCheckOut}
                        disabled={checkOutMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {checkOutMutation.isPending ? (
                          <>
                            <i className="bi bi-arrow-clockwise animate-spin text-xl"></i>
                            Checking Out...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-right text-xl"></i>
                            Check Out
                          </>
                        )}
                      </button>
                    ) : !todayAttendance?.isCompleted ? (
                      <button
                        onClick={handleCheckIn}
                        disabled={checkInMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {checkInMutation.isPending ? (
                          <>
                            <i className="bi bi-arrow-clockwise animate-spin text-xl"></i>
                            Checking In...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right text-xl"></i>
                            Check In
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex-1 text-center py-4">
                        <div className="inline-flex items-center gap-2 text-green-600 font-semibold">
                          <i className="bi bi-check-circle-fill text-xl"></i>
                          Shift Completed
                        </div>
                      </div>
                    )}
                    
                    {todayAttendance?.notes && (
                      <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <i className="bi bi-sticky text-orange-600 mt-1"></i>
                          <div className="flex-1">
                            <div className="text-xs text-gray-600 font-semibold mb-1">NOTES</div>
                            <p className="text-sm text-gray-900">{todayAttendance.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* Attendance History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <i className="bi bi-calendar2-week text-orange-600"></i>
                    Attendance History
                  </h3>
                  <button
                    onClick={() => setDateRange({ from: null, to: null })}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                    Reset Filter
                  </button>
                </div>
                
                {/* Date Range Filter */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={dateRange.from || ''}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={dateRange.to || ''}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Quick Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setDateRange({ from: today, to: today });
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const weekAgo = new Date(today);
                      weekAgo.setDate(today.getDate() - 7);
                      setDateRange({ 
                        from: weekAgo.toISOString().split('T')[0],
                        to: today.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const monthAgo = new Date(today);
                      monthAgo.setMonth(today.getMonth() - 1);
                      setDateRange({ 
                        from: monthAgo.toISOString().split('T')[0],
                        to: today.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      setDateRange({ 
                        from: firstDay.toISOString().split('T')[0],
                        to: today.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    This Month
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {loadingHistory ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
                    <p className="text-gray-600 mt-3 text-sm">Loading attendance records...</p>
                  </div>
                ) : attendanceHistory.length > 0 ? (
                  <>
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-900">{attendanceHistory.length}</span> shift(s) found
                        {(dateRange.from || dateRange.to) && (
                          <span className="ml-2 text-orange-600">
                            <i className="bi bi-filter-circle"></i> Filtered
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500">
                        Total Hours: <span className="font-semibold text-gray-900">
                          {attendanceHistory.reduce((acc, s) => acc + (s.netWorkingHours || s.workedHours || 0), 0).toFixed(1)}h
                        </span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      {attendanceHistory.map((shift, index) => (
                        <ShiftHistoryCard key={shift.shiftId || index} shift={shift} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <i className="bi bi-inbox text-5xl text-gray-300 mb-3 block"></i>
                    <p className="text-gray-500 mb-2">No attendance history found</p>
                    {(dateRange.from || dateRange.to) && (
                      <button
                        onClick={() => setDateRange({ from: null, to: null })}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Clear filters to see all records
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR - Quick Stats */}
          <div className="space-y-6">
            {/* Monthly Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <i className="bi bi-bar-chart text-orange-600"></i>
                This Month
              </h3>
              
              <div className="space-y-4">
                <StatBox
                  icon="bi-calendar-check"
                  label="Total Shifts"
                  value={attendanceHistory.filter(s => s.status === 'Completed').length}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                />
                <StatBox
                  icon="bi-clock"
                  label="Total Hours"
                  value={`${attendanceHistory.reduce((acc, s) => acc + (s.workedHours || 0), 0).toFixed(1)}h`}
                  color="text-green-600"
                  bgColor="bg-green-50"
                />
                <StatBox
                  icon="bi-exclamation-triangle"
                  label="Late Check-ins"
                  value={attendanceHistory.filter(s => s.isLate).length}
                  color="text-red-600"
                  bgColor="bg-red-50"
                />
                <StatBox
                  icon="bi-door-open"
                  label="Early Leaves"
                  value={attendanceHistory.filter(s => s.isEarlyLeave).length}
                  color="text-orange-600"
                  bgColor="bg-orange-50"
                />
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <i className="bi bi-lightning"></i>
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleCheckIn}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all"
                >
                  <i className="bi bi-box-arrow-in-right text-xl"></i>
                  Check In
                </button>
                <button
                  onClick={handleCheckOut}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all"
                >
                  <i className="bi bi-box-arrow-right text-xl"></i>
                  Check Out
                </button>
                <button
                  onClick={() => queryClient.invalidateQueries(['todayAttendance', 'attendanceHistory'])}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all"
                >
                  <i className="bi bi-arrow-clockwise text-xl"></i>
                  Refresh Data
                </button>
              </div>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="bi bi-lightbulb text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Attendance Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <i className="bi bi-check2 mt-0.5"></i>
                      <span>Check in on time to avoid late marks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="bi bi-check2 mt-0.5"></i>
                      <span>Select correct shift type when checking in</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="bi bi-check2 mt-0.5"></i>
                      <span>Add notes if you need to leave early</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <i className="bi bi-box-arrow-in-right text-2xl"></i>
                  </div>
                  Check In
                </h3>
                <button
                  onClick={() => setShowCheckInModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Service Center */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Service Center <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={checkInData.serviceCenterId}
                    onChange={(e) => setCheckInData({ ...checkInData, serviceCenterId: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium appearance-none bg-white cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <option value={1}>EV Service Center - Quận 1</option>
                    <option value={2}>EV Service Center - Quận 2</option>
                    <option value={3}>EV Service Center - Quận 3</option>
                  </select>
                  <i className="bi bi-building absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"></i>
                  <i className="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                </div>
              </div>

              {/* Shift Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Shift Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'Morning', label: 'Morning', time: '07:00 - 15:00', icon: 'bi-sunrise' },
                    { value: 'Afternoon', label: 'Afternoon', time: '15:00 - 23:00', icon: 'bi-sun' },
                    { value: 'Night', label: 'Night', time: '23:00 - 07:00', icon: 'bi-moon-stars' },
                    { value: 'FullDay', label: 'Full Day', time: '07:00 - 17:00', icon: 'bi-clock' },
                  ].map((shift) => (
                    <button
                      key={shift.value}
                      onClick={() => setCheckInData({ ...checkInData, shiftType: shift.value })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        checkInData.shiftType === shift.value
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <i className={`${shift.icon} text-2xl ${
                          checkInData.shiftType === shift.value ? 'text-orange-600' : 'text-gray-400'
                        }`}></i>
                        <div className="flex-1">
                          <div className={`font-bold ${
                            checkInData.shiftType === shift.value ? 'text-orange-600' : 'text-gray-900'
                          }`}>{shift.label}</div>
                          <div className="text-xs text-gray-500">{shift.time}</div>
                        </div>
                        {checkInData.shiftType === shift.value && (
                          <i className="bi bi-check-circle-fill text-orange-600 text-lg"></i>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={checkInData.notes}
                  onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  placeholder="Add any notes about your shift..."
                />
              </div>

              {/* Current Time Display */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <i className="bi bi-clock text-white text-lg"></i>
                    </div>
                    <div>
                      <div className="text-xs text-orange-600 font-bold">CHECK-IN TIME</div>
                      <div className="text-sm text-gray-600">Current Time</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 font-mono">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitCheckIn}
                disabled={checkInMutation.isPending}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkInMutation.isPending ? (
                  <>
                    <i className="bi bi-arrow-clockwise animate-spin"></i>
                    Checking In...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg text-xl"></i>
                    Check In Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Check-Out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i className="bi bi-box-arrow-right text-3xl"></i>
                  <div>
                    <h3 className="text-xl font-bold">Check Out</h3>
                    <p className="text-red-100 text-sm">
                      {currentTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckOutModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Current Shift Info */}
              {todayAttendance && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <i className="bi bi-clock-history text-purple-600 text-xl"></i>
                    <h4 className="font-semibold text-gray-800">Current Shift</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in Time:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(todayAttendance.checkInTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shift Type:</span>
                      <span className="font-semibold text-gray-800">
                        {todayAttendance.shiftType}
                      </span>
                    </div>
                    {todayAttendance.workedHours !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hours Worked:</span>
                        <span className="font-semibold text-purple-600">
                          {todayAttendance.workedHours} hours
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="bi bi-chat-left-text mr-2"></i>
                  Notes (Optional)
                </label>
                <textarea
                  value={checkOutData.notes}
                  onChange={(e) => setCheckOutData({ ...checkOutData, notes: e.target.value })}
                  placeholder="Add any notes about your shift..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                />
              </div>

              {/* Early Checkout Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="bi bi-exclamation-circle mr-2"></i>
                  Early Checkout Reason (if applicable)
                </label>
                <textarea
                  value={checkOutData.earlyCheckoutReason}
                  onChange={(e) => setCheckOutData({ ...checkOutData, earlyCheckoutReason: e.target.value })}
                  placeholder="Leaving early? Please specify reason..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                  rows="2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <i className="bi bi-info-circle mr-1"></i>
                  Leave blank if checking out at scheduled time
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCheckOutModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  <i className="bi bi-x-lg mr-2"></i>
                  Cancel
                </button>
                <button
                  onClick={submitCheckOut}
                  disabled={checkOutMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkOutMutation.isPending ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                      Checking Out...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-right mr-2"></i>
                      Confirm Check Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function DetailCard({ icon, label, value, color, bgColor, badge }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border-2 border-${color.replace('text-', '')}/20`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`bi ${icon} ${color} text-lg`}></i>
        <span className="text-xs font-bold text-gray-600 uppercase">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color} truncate`}>{value}</div>
      {badge && (
        <span className={`inline-block mt-2 px-2 py-1 ${color} ${bgColor} border border-${color.replace('text-', '')}/30 rounded-full text-xs font-semibold`}>
          {badge}
        </span>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, color, bgColor }) {
  return (
    <div className={`${bgColor} border-2 border-${color.replace('text-', '')}/20 rounded-xl p-4 flex items-center gap-4`}>
      <div className={`w-12 h-12 ${color.replace('text-', 'bg-')} bg-opacity-20 rounded-lg flex items-center justify-center`}>
        <i className={`bi ${icon} ${color} text-2xl`}></i>
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold text-gray-600 uppercase mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}

function ShiftHistoryCard({ shift }) {
  const isCompleted = shift.isCompleted || shift.status === 'Completed';
  const statusColor = isCompleted ? 'green' : shift.status === 'Present' ? 'blue' : 'gray';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-${statusColor}-50 border-2 border-${statusColor}-200 rounded-xl p-4 hover:shadow-md transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${statusColor}-500 rounded-lg flex items-center justify-center`}>
            <i className={`bi bi-calendar-check text-white text-lg`}></i>
          </div>
          <div>
            <div className="font-bold text-gray-900">{formatDate(shift.shiftDate)}</div>
            <div className="text-xs text-gray-600">{shift.shiftType || 'N/A'} Shift</div>
          </div>
        </div>
        <div className={`px-3 py-1.5 bg-${statusColor}-500 text-white rounded-full text-xs font-bold`}>
          {shift.status}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-xs text-gray-600 mb-1">Check In</div>
          <div className="font-semibold text-gray-900">{formatDateTime(shift.checkInTime)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Check Out</div>
          <div className="font-semibold text-gray-900">{formatDateTime(shift.checkOutTime)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Hours</div>
          <div className="font-semibold text-gray-900">{shift.netWorkingHours?.toFixed(1) || '0.0'}h</div>
        </div>
      </div>
      
      {(shift.isLate || shift.isEarlyLeave) && (
        <div className="mt-3 pt-3 border-t-2 border-gray-200 flex gap-2">
          {shift.isLate && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
              <i className="bi bi-exclamation-triangle mr-1"></i>Late {shift.lateMinutes}m
            </span>
          )}
          {shift.isEarlyLeave && (
            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
              <i className="bi bi-exclamation-circle mr-1"></i>Early Leave
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Helper Functions
function formatTime(timeString) {
  if (!timeString) return 'N/A';
  try {
    if (timeString.includes(':') && !timeString.includes('T')) {
      return timeString.slice(0, 5);
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return 'N/A';
  }
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'N/A';
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return 'N/A';
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  } catch {
    return 'N/A';
  }
}
