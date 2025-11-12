// src/components/ui/progress.jsx
import React from 'react';

export function Progress({ value = 0, className = '' }) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className="h-full bg-orange-600 transition-all duration-300 ease-in-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
