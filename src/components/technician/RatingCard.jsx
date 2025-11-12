// src/components/technician/RatingCard.jsx
import React from 'react';
import { Card } from '../ui/card';

/**
 * RatingCard - Display customer rating with stars
 */
export default function RatingCard({ rating }) {
  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`${
          index < count ? 'bi-star-fill text-yellow-400' : 'bi-star text-gray-300'
        } text-lg`}
      ></i>
    ));
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <i className="bi bi-person text-orange-600 text-xl"></i>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">
              {rating.customerName || 'Anonymous'}
            </h4>
            <span className="text-xs text-gray-500">
              {new Date(rating.createdDate || rating.ratedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-1 mb-2">
            {renderStars(rating.rating || rating.stars || 0)}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {rating.rating || rating.stars || 0}.0
            </span>
          </div>

          {rating.comment && (
            <p className="text-sm text-gray-600 italic">"{rating.comment}"</p>
          )}

          {rating.workOrderCode && (
            <p className="text-xs text-gray-400 mt-2">
              Work Order: #{rating.workOrderCode}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
