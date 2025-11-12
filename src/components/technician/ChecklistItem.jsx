// src/components/technician/ChecklistItem.jsx
import React from 'react';

/**
 * ChecklistItem - Individual checklist task with toggle
 */
export default function ChecklistItem({ item, onToggle, disabled = false }) {
  const handleToggle = () => {
    if (!disabled && onToggle) {
      onToggle(item.id || item.checklistItemId, !item.completed);
    }
  };

  return (
    <div 
      className={`flex items-start p-4 border rounded-lg mb-2 transition-all duration-200 ${
        item.completed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-gray-200 hover:border-orange-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
      onClick={handleToggle}
    >
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          checked={item.completed || false}
          onChange={handleToggle}
          disabled={disabled}
          className="w-5 h-5 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="ml-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {item.name || item.taskName || item.description}
            </p>
            {item.description && item.name && (
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
          
          {item.completed && (
            <span className="ml-2 flex-shrink-0">
              <i className="bi bi-check-circle-fill text-green-600 text-lg"></i>
            </span>
          )}
        </div>

        {item.completedAt && (
          <p className="text-xs text-gray-400 mt-1">
            <i className="bi bi-clock mr-1"></i>
            Completed {new Date(item.completedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
