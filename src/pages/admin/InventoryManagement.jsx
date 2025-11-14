import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI, stockTransactionAPI } from '../../services/adminAPI';
import {
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  History,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [selectedPart, setSelectedPart] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'reserve' or 'release'

  const queryClient = useQueryClient();

  // Fetch inventory
  const { data: inventoryData, isLoading, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await inventoryAPI.getAll();
      return response.data;
    },
  });

  // Fetch low stock alerts
  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: async () => {
      const response = await inventoryAPI.getLowStockAlerts();
      return response.data;
    },
  });

  // Fetch total inventory value
  const { data: totalValueData } = useQuery({
    queryKey: ['inventory-total-value'],
    queryFn: async () => {
      const response = await inventoryAPI.getTotalValue();
      return response.data;
    },
  });

  // Fetch transactions for selected part
  const { data: transactionsData } = useQuery({
    queryKey: ['stock-transactions', selectedPart?.partId],
    queryFn: async () => {
      if (!selectedPart?.partId) return [];
      const response = await stockTransactionAPI.getRecentByPart(selectedPart.partId);
      return response.data;
    },
    enabled: !!selectedPart?.partId,
  });

  // Reserve/Release mutations
  const actionMutation = useMutation({
    mutationFn: (data) =>
      actionType === 'reserve' ? inventoryAPI.reserve(data) : inventoryAPI.release(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success(`Stock ${actionType}d successfully`);
      setShowActionModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || `Failed to ${actionType} stock`);
    },
  });

  const inventory = inventoryData?.data || inventoryData || [];
  const lowStockAlerts = lowStockData?.data || lowStockData || [];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStock =
      stockFilter === ''
        ? true
        : stockFilter === 'low'
        ? item.quantity < item.minStockLevel
        : stockFilter === 'out'
        ? item.quantity === 0
        : item.quantity >= item.minStockLevel;

    return matchesSearch && matchesStock;
  });

  const getStockStatus = (quantity, minLevel) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity < minLevel) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const handleAction = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    actionMutation.mutate({
      partId: selectedPart.partId,
      quantity: parseInt(formData.get('quantity')),
      reason: formData.get('reason'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track parts stock levels and transactions</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="text-indigo-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalValueData?.data?.totalValue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventory.filter((i) => i.quantity === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by part name, number, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Stock Levels</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStockStatus(item.quantity, item.minStockLevel);
                  return (
                    <tr key={item.inventoryId || item.partId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="text-gray-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.partName || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{item.partNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.sku || 'N/A'}</code>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-lg">{item.quantity || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-600">{item.minStockLevel || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{formatCurrency(item.unitPrice || 0)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedPart(item);
                            setShowTransactionModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="View Transactions"
                        >
                          <History size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPart(item);
                            setActionType('reserve');
                            setShowActionModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                          title="Reserve Stock"
                        >
                          <TrendingDown size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPart(item);
                            setActionType('release');
                            setShowActionModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Release Stock"
                        >
                          <TrendingUp size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History Modal */}
      {showTransactionModal && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Transaction History - {selectedPart.partName}
              </h3>
              <button onClick={() => setShowTransactionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {transactionsData?.data?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No transactions found</p>
              ) : (
                (transactionsData?.data || []).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'IN' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'IN' ? (
                          <TrendingUp className="text-green-600" size={20} />
                        ) : (
                          <TrendingDown className="text-red-600" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.transactionType}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.transactionDate).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'IN' ? '+' : '-'}
                        {transaction.quantity}
                      </p>
                      <p className="text-sm text-gray-500">Ref: {transaction.referenceCode || 'N/A'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reserve/Release Action Modal */}
      {showActionModal && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {actionType === 'reserve' ? 'Reserve Stock' : 'Release Stock'}
            </h3>
            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
                <input
                  type="text"
                  value={selectedPart.partName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Quantity</label>
                <input
                  type="text"
                  value={selectedPart.quantity}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={actionType === 'reserve' ? selectedPart.quantity : 1000}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  name="reason"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter reason for this action..."
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionMutation.isPending}
                  className={`px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${
                    actionType === 'reserve' ? 'bg-orange-600' : 'bg-green-600'
                  }`}
                >
                  {actionMutation.isPending ? 'Processing...' : actionType === 'reserve' ? 'Reserve' : 'Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
