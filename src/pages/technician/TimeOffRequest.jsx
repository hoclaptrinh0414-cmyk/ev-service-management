// src/pages/technician/TimeOffRequest.jsx - Request Time Off
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { requestTimeOff } from '../../services/technicianService';

/**
 * Time Off Request - Self-Service Time Off Management
 * Features:
 * - Request time off with date range
 * - Select time off type (vacation, sick, personal)
 * - Add reason/notes
 * - Submit request for approval
 */

export default function TimeOffRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'vacation',
    reason: '',
    notes: '',
  });

  // Submit time off request mutation
  const requestMutation = useMutation({
    mutationFn: requestTimeOff,
    onSuccess: () => {
      toast.success('✅ Time off request submitted successfully!');
      queryClient.invalidateQueries(['timeOffRequests']);
      setTimeout(() => navigate('/technician/dashboard'), 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for your request');
      return;
    }

    // Calculate days
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Submit request
    requestMutation.mutate({
      ...formData,
      days,
    });
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <i className="bi bi-arrow-left mr-2"></i>
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <i className="bi bi-calendar-x text-orange-600 mr-3"></i>
          Request Time Off
        </h1>
        <p className="text-gray-600 mt-2">Submit a time off request for approval</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Time Off Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Time Off *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Day</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Days Calculation */}
            {formData.startDate && formData.endDate && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    Total Days Requested:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <Input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Brief reason for time off request"
                required
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Any additional details or information..."
              />
            </div>

            {/* Guidelines */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center">
                <i className="bi bi-info-circle mr-2"></i>
                Time Off Request Guidelines
              </h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Submit requests at least 2 weeks in advance for vacation</li>
                <li>• Sick leave can be requested with 24 hours notice</li>
                <li>• Emergency requests will be reviewed on a case-by-case basis</li>
                <li>• You will receive email notification once approved/denied</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
                disabled={requestMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={requestMutation.isPending}
              >
                {requestMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send mr-2"></i>
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Success Tips */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <i className="bi bi-lightbulb text-orange-600 mr-2"></i>
            Tips for Faster Approval
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <i className="bi bi-check-circle-fill text-green-600 mr-2 mt-0.5"></i>
              <span>Submit your request as early as possible</span>
            </li>
            <li className="flex items-start">
              <i className="bi bi-check-circle-fill text-green-600 mr-2 mt-0.5"></i>
              <span>Provide clear and detailed reasons</span>
            </li>
            <li className="flex items-start">
              <i className="bi bi-check-circle-fill text-green-600 mr-2 mt-0.5"></i>
              <span>Check your schedule for conflicts before requesting</span>
            </li>
            <li className="flex items-start">
              <i className="bi bi-check-circle-fill text-green-600 mr-2 mt-0.5"></i>
              <span>Ensure coverage is available for your shift</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
