// src/pages/technician/MySchedule.jsx - Technician Schedule View
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getMySchedule } from '../../services/technicianService';

/**
 * My Schedule - Technician Schedule Management
 * Features:
 * - View weekly schedule with assigned work orders
 * - Filter by date range
 * - See shift details and work order assignments
 * - Calendar view and list view
 */

export default function MySchedule() {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch schedule data
  const { data: scheduleResponse, isLoading, refetch } = useQuery({
    queryKey: ['mySchedule', selectedDate],
    queryFn: () => getMySchedule({
      startDate: getWeekStart(selectedDate).toISOString(),
      endDate: getWeekEnd(selectedDate).toISOString(),
    }),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Extract schedule data
  const schedule = scheduleResponse?.data || scheduleResponse || [];

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <i className="bi bi-calendar-week text-orange-600 mr-3"></i>
          My Schedule
        </h1>
        <p className="text-gray-600 mt-2">View your work schedule and assignments</p>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={goToPreviousWeek}>
              <i className="bi bi-chevron-left"></i>
            </Button>
            <div className="text-center min-w-[200px]">
              <p className="text-lg font-semibold text-gray-900">
                {formatWeekRange(selectedDate)}
              </p>
              <p className="text-sm text-gray-600">
                {selectedDate.toLocaleDateString('en-US', { year: 'numeric' })}
              </p>
            </div>
            <Button variant="outline" onClick={goToNextWeek}>
              <i className="bi bi-chevron-right"></i>
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={goToToday}>
              <i className="bi bi-calendar-day mr-2"></i>
              Today
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <i className="bi bi-arrow-clockwise mr-2"></i>
              Refresh
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="week">
                <i className="bi bi-calendar-week mr-2"></i>
                Week View
              </TabsTrigger>
              <TabsTrigger value="list">
                <i className="bi bi-list-ul mr-2"></i>
                List View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Schedule Content */}
      {viewMode === 'week' ? (
        <WeekView schedule={schedule} selectedDate={selectedDate} />
      ) : (
        <ListView schedule={schedule} />
      )}
    </div>
  );
}

// Week View Component
function WeekView({ schedule, selectedDate }) {
  const weekDays = getWeekDays(selectedDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {weekDays.map((day, index) => {
        const daySchedule = schedule?.find(s => 
          new Date(s.date).toDateString() === day.toDateString()
        );

        const isToday = day.toDateString() === new Date().toDateString();

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`p-4 ${isToday ? 'border-2 border-orange-500 bg-orange-50' : ''}`}>
              {/* Day Header */}
              <div className="text-center mb-4">
                <p className="text-xs font-medium text-gray-600 uppercase">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={`text-2xl font-bold ${isToday ? 'text-orange-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </p>
              </div>

              {/* Shift Info */}
              {daySchedule?.shift && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs font-medium text-blue-900">
                    {daySchedule.shift.type}
                  </p>
                  <p className="text-xs text-blue-700">
                    {daySchedule.shift.startTime} - {daySchedule.shift.endTime}
                  </p>
                </div>
              )}

              {/* Work Orders */}
              <div className="space-y-2">
                {daySchedule?.workOrders?.length > 0 ? (
                  daySchedule.workOrders.map((wo, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {wo.workOrderCode}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {wo.vehicleModel}
                      </p>
                      <Badge variant={getStatusVariant(wo.statusId)} className="mt-1 text-xs">
                        {wo.statusName}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">No work orders</p>
                )}
              </div>

              {/* Total Count */}
              {daySchedule?.workOrders?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                  <p className="text-xs font-semibold text-gray-700">
                    {daySchedule.workOrders.length} order{daySchedule.workOrders.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// List View Component
function ListView({ schedule }) {
  if (!schedule || schedule.length === 0) {
    return (
      <Card className="p-12 text-center">
        <i className="bi bi-calendar-x text-gray-300 text-6xl mb-4 block"></i>
        <p className="text-gray-600">No scheduled work orders</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {schedule.map((daySchedule, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(daySchedule.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                {daySchedule.shift && (
                  <p className="text-sm text-gray-600 mt-1">
                    Shift: {daySchedule.shift.type} ({daySchedule.shift.startTime} - {daySchedule.shift.endTime})
                  </p>
                )}
              </div>
              <Badge variant="secondary">
                {daySchedule.workOrders?.length || 0} orders
              </Badge>
            </div>

            {daySchedule.workOrders && daySchedule.workOrders.length > 0 ? (
              <div className="space-y-3">
                {daySchedule.workOrders.map((wo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{wo.workOrderCode}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>
                          <i className="bi bi-car-front mr-1"></i>
                          {wo.vehicleModel}
                        </span>
                        <span>
                          <i className="bi bi-credit-card-2-front mr-1"></i>
                          {wo.licensePlate}
                        </span>
                        <span>
                          <i className="bi bi-person mr-1"></i>
                          {wo.customerName}
                        </span>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(wo.statusId)}>
                      {wo.statusName}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No work orders scheduled</p>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Helper Functions
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function getWeekEnd(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

function getWeekDays(date) {
  const start = getWeekStart(date);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatWeekRange(date) {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function getStatusVariant(statusId) {
  const variants = {
    1: 'secondary',
    2: 'default',
    3: 'warning',
    6: 'success',
  };
  return variants[statusId] || 'secondary';
}
