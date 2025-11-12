import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { ClipboardDocumentListIcon, MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, XCircleIcon, StarIcon, UserIcon, CalendarIcon, DocumentTextIcon, SparklesIcon, WrenchScrewdriverIcon, CurrencyDollarIcon, FunnelIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const workOrderAPI = {
  getMyWorkOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.statusId) params.append('statusId', filters.statusId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    const url = `/api/technicians/my-work-orders${queryString ? `?${queryString}` : ''}`;
    const response = await api.request(url, { method: 'GET' });
    return response.data || response;
  },
  getQualityCheck: async (workOrderId) => {
    const response = await api.request(`/api/work-orders/${workOrderId}/quality-check`, { method: 'GET' });
    return response.data || response;
  },
};

export default function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({ statusId: null, startDate: null, endDate: null });

  const { data: workOrdersData, isLoading: loadingOrders, refetch } = useQuery({
    queryKey: ['myWorkOrders', filters],
    queryFn: () => workOrderAPI.getMyWorkOrders(filters),
  });

  const { data: qualityCheckData, isLoading: loadingQuality } = useQuery({
    queryKey: ['qualityCheck', selectedWorkOrder?.workOrderId],
    queryFn: () => workOrderAPI.getQualityCheck(selectedWorkOrder.workOrderId),
    enabled: !!selectedWorkOrder && showQualityModal,
  });

  const workOrders = workOrdersData || [];

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) =>
      wo.workOrderCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workOrders, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: workOrders.length,
      completed: workOrders.filter((wo) => wo.statusName === 'Completed').length,
      inProgress: workOrders.filter((wo) => wo.statusName === 'InProgress').length,
      totalRevenue: workOrders.reduce((sum, wo) => sum + (wo.estimatedCost || 0), 0),
    };
  }, [workOrders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">My Work Orders</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and track your assigned work orders</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">In Progress</p>
          <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Completed</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Filters & Search</h2>
        </div>
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by code, customer, or vehicle..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
        </div>
      </div>

      {loadingOrders ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading work orders...</p>
        </div>
      ) : filteredWorkOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <ClipboardDocumentListIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Work Orders Found</h3>
          <p className="text-gray-600">You have no assigned work orders at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkOrders.map((workOrder) => (
            <div key={workOrder.workOrderId} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                <span className="text-white font-bold text-lg">{workOrder.workOrderCode}</span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                    <UserIcon className="w-4 h-4" />
                    <span className="font-semibold">CUSTOMER</span>
                  </div>
                  <p className="font-bold text-gray-900">{workOrder.customerName}</p>
                  <p className="text-sm text-gray-600">{workOrder.customerPhone}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                    <WrenchScrewdriverIcon className="w-4 h-4" />
                    <span className="font-semibold">VEHICLE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-900 text-white font-mono text-sm rounded-lg">{workOrder.licensePlate}</span>
                    <span className="text-sm text-gray-600">{workOrder.vehicleName}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Estimated Cost</p>
                  <p className="font-bold text-green-600">{formatCurrency(workOrder.estimatedCost)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
