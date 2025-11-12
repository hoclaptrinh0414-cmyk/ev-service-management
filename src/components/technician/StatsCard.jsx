// src/components/technician/StatsCard.jsx
import React from 'react';
import { Card } from '../ui/card';

/**
 * StatsCard - Display statistics with icon and count
 * @param {string} title - Card title
 * @param {number} count - Stat count
 * @param {string} icon - Bootstrap icon class (e.g., 'bi-calendar-check')
 * @param {string} bgColor - Background color class
 * @param {string} textColor - Text color class
 */
export default function StatsCard({ 
  title, 
  count = 0, 
  icon = 'bi-bar-chart',
  bgColor = 'bg-orange-50',
  textColor = 'text-orange-600',
  trend = null
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{count}</h3>
            {trend && (
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        <div className={`${bgColor} ${textColor} p-3 rounded-lg`}>
          <i className={`${icon} text-2xl`}></i>
        </div>
      </div>
    </Card>
  );
}
