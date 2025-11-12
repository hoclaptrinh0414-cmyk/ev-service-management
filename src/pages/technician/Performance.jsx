// src/pages/technician/Performance.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyPerformance, getMyRatings } from '../../services/technicianService';
import RatingCard from '../../components/technician/RatingCard';
import { Card } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Performance() {
  // Fetch performance data
  const { data: performanceResponse, isLoading: loadingPerformance } = useQuery({
    queryKey: ['myPerformance'],
    queryFn: getMyPerformance,
  });

  // Extract performance data
  const performance = performanceResponse?.data || performanceResponse;

  // Fetch ratings
  const { data: ratingsResponse, isLoading: loadingRatings } = useQuery({
    queryKey: ['myRatings'],
    queryFn: getMyRatings,
  });

  // Extract ratings
  const ratings = ratingsResponse?.data || ratingsResponse || [];

  if (loadingPerformance || loadingRatings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const weeklyData = performance?.weeklyStats || [
    { day: 'Mon', completed: 0 },
    { day: 'Tue', completed: 0 },
    { day: 'Wed', completed: 0 },
    { day: 'Thu', completed: 0 },
    { day: 'Fri', completed: 0 },
    { day: 'Sat', completed: 0 },
    { day: 'Sun', completed: 0 },
  ];

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`${
          index < Math.floor(count) ? 'bi-star-fill text-yellow-400' : 'bi-star text-gray-300'
        } text-2xl`}
      ></i>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance</h1>
        <p className="text-gray-600">Track your work performance and customer feedback</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Completed</p>
            <i className="bi bi-check-circle text-green-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-gray-900">{performance?.totalCompleted || 0}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Average Rating</p>
            <i className="bi bi-star-fill text-yellow-400 text-2xl"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {performance?.averageRating?.toFixed(1) || '0.0'}
            </p>
            <span className="text-gray-500">/ 5.0</span>
          </div>
          <div className="flex gap-1 mt-2">
            {renderStars(performance?.averageRating || 0)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg. Completion Time</p>
            <i className="bi bi-clock-history text-blue-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {performance?.avgCompletionTime || 0}
            <span className="text-lg text-gray-500 ml-1">h</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Per work order</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Ratings</p>
            <i className="bi bi-chat-left-text text-purple-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-gray-900">{ratings.length}</p>
          <p className="text-xs text-gray-500 mt-1">Customer feedback</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Performance Bar Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="completed" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Rating Trend Line Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performance?.ratingTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis domain={[0, 5]} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Ratings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Customer Ratings</h2>

        {ratings.length === 0 ? (
          <div className="text-center py-12">
            <i className="bi bi-star text-gray-300 text-6xl"></i>
            <p className="text-gray-500 mt-4">No ratings received yet</p>
            <p className="text-gray-400 text-sm mt-2">Complete work orders to receive customer feedback</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ratings.map((rating, index) => (
              <RatingCard key={index} rating={rating} />
            ))}
          </div>
        )}
      </Card>

      {/* Performance Insights */}
      {performance?.insights && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <i className="bi bi-trophy-fill text-green-600 text-xl mr-2"></i>
                <h3 className="font-semibold text-green-900">Strengths</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• {performance.insights.strength1 || 'High completion rate'}</li>
                <li>• {performance.insights.strength2 || 'Excellent customer ratings'}</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <i className="bi bi-graph-up-arrow text-blue-600 text-xl mr-2"></i>
                <h3 className="font-semibold text-blue-900">Improvements</h3>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {performance.insights.improvement1 || 'Maintain consistent quality'}</li>
                <li>• {performance.insights.improvement2 || 'Focus on time efficiency'}</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center mb-2">
                <i className="bi bi-lightbulb-fill text-purple-600 text-xl mr-2"></i>
                <h3 className="font-semibold text-purple-900">Tips</h3>
              </div>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• {performance.insights.tip1 || 'Complete checklists thoroughly'}</li>
                <li>• {performance.insights.tip2 || 'Communicate with customers'}</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
