// src/components/technician/WorkOrderCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

const STATUS_STYLES = {
  Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  Assigned: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  InProgress: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  Completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

/**
 * WorkOrderCard - Display work order information
 */
export default function WorkOrderCard({ workOrder, onStatusChange }) {
  const navigate = useNavigate();
  const statusStyle = STATUS_STYLES[workOrder.status] || STATUS_STYLES.Pending;

  const handleView = () => {
    navigate(`/technician/work-orders/${workOrder.workOrderId}`);
  };

  const handleStart = async (e) => {
    e.stopPropagation();
    if (onStatusChange) {
      await onStatusChange(workOrder.workOrderId, 'InProgress');
    }
  };

  const handleComplete = async (e) => {
    e.stopPropagation();
    if (onStatusChange) {
      await onStatusChange(workOrder.workOrderId, 'Completed');
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleView}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            #{workOrder.workOrderCode || workOrder.workOrderId}
          </h3>
          <p className="text-sm text-gray-500">
            {workOrder.vehicleMake} {workOrder.vehicleModel} • {workOrder.vehicleLicensePlate}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
          {workOrder.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <i className="bi bi-person text-orange-600 mr-2"></i>
          {workOrder.customerName || 'N/A'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <i className="bi bi-calendar text-orange-600 mr-2"></i>
          {new Date(workOrder.createdDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleView}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
        >
          <i className="bi bi-eye mr-1"></i>
          View
        </button>
        
        {workOrder.status === 'Assigned' && (
          <button
            onClick={handleStart}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <i className="bi bi-play-circle mr-1"></i>
            Start
          </button>
        )}

        {workOrder.status === 'InProgress' && (
          <button
            onClick={handleComplete}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <i className="bi bi-check-circle mr-1"></i>
            Complete
          </button>
        )}
      </div>
    </Card>
  );
}
