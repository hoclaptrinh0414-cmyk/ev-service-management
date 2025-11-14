import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { vehicleAPI } from '../../services/apiService';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Cần bảo dưỡng': {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200'
    },
    'Bình thường': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    },
    'Đang bảo dưỡng': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    }
  };

  const config = statusConfig[status] || statusConfig['Bình thường'];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      {status}
    </span>
  );
};

const VehicleTable = ({ vehicles, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">No vehicles found</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Vehicle
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Owner
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              License Plate
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Mileage
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Battery Health
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Next Maintenance
            </th>
            <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vehicles.map((vehicle, index) => (
            <tr
              key={vehicle.vehicleId || index}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-6">
                <div>
                  <p className="font-semibold text-gray-900">
                    {vehicle.fullModelName?.split(' ')[0] || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {vehicle.fullModelName?.split(' ').slice(1).join(' ') || 'Model'}
                  </p>
                </div>
              </td>
              <td className="py-4 px-6">
                <p className="text-sm text-gray-900">{vehicle.customerName || 'N/A'}</p>
              </td>
              <td className="py-4 px-6">
                <p className="text-sm font-mono font-semibold text-gray-900">
                  {vehicle.licensePlate || 'N/A'}
                </p>
              </td>
              <td className="py-4 px-6">
                <p className="text-sm text-gray-900">
                  {vehicle.mileage?.toLocaleString() || 0} km
                </p>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        vehicle.batteryHealthPercent >= 80
                          ? 'bg-emerald-500'
                          : vehicle.batteryHealthPercent >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${vehicle.batteryHealthPercent || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {vehicle.batteryHealthPercent?.toFixed(0) || 0}%
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <StatusBadge status={vehicle.maintenanceStatus || 'Bình thường'} />
              </td>
              <td className="py-4 px-6">
                <p className="text-sm text-gray-900">
                  {vehicle.nextMaintenanceDate
                    ? new Date(vehicle.nextMaintenanceDate).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchVehicles = async () => {
    setLoading(true);

    try {
      const params = {
        page: currentPage,
        pageSize: pageSize
      };

      if (searchTerm.trim()) {
        params.searchTerm = searchTerm.trim();
      }

      if (filterStatus !== 'all') {
        params.maintenanceStatus = filterStatus;
      }

      const response = await vehicleAPI.getCustomerVehicles(params);

      if (response.success && response.data) {
        const vehicleData = response.data.items || response.data;
        setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
        setTotalPages(response.data.totalPages || 1);
      } else if (Array.isArray(response)) {
        setVehicles(response);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Mock data fallback
      setVehicles([
        {
          vehicleId: 1,
          customerName: 'Nguyễn Văn An',
          fullModelName: 'Tesla Model 3 Long Range 2023',
          licensePlate: '29A-99999',
          nextMaintenanceDate: '2025-04-01',
          mileage: 15000,
          batteryHealthPercent: 95,
          maintenanceStatus: 'Cần bảo dưỡng'
        },
        {
          vehicleId: 2,
          customerName: 'Trần Thị Bình',
          fullModelName: 'VinFast VF8 Plus 2024',
          licensePlate: '30B-88888',
          nextMaintenanceDate: '2025-05-15',
          mileage: 8500,
          batteryHealthPercent: 98,
          maintenanceStatus: 'Bình thường'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterStatus]);

  const stats = [
    { label: 'Total Vehicles', value: vehicles.length, color: 'text-blue-600' },
    {
      label: 'Need Maintenance',
      value: vehicles.filter((v) => v.maintenanceStatus === 'Cần bảo dưỡng').length,
      color: 'text-red-600'
    },
    {
      label: 'Normal',
      value: vehicles.filter((v) => v.maintenanceStatus === 'Bình thường').length,
      color: 'text-emerald-600'
    },
    {
      label: 'In Service',
      value: vehicles.filter((v) => v.maintenanceStatus === 'Đang bảo dưỡng').length,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="admin-vehicles-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Vehicle Management</h1>
          <p>Manage and monitor all registered vehicles</p>
        </div>
        <button className="add-vehicle-btn">
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index} className="stat-card">
            <CardContent className="stat-card-content">
              <p className="stat-label">{stat.label}</p>
              <p className={`stat-value ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by license plate, owner, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="Bình thường">Normal</option>
                <option value="Cần bảo dưỡng">Need Maintenance</option>
                <option value="Đang bảo dưỡng">In Service</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={fetchVehicles}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <VehicleTable vehicles={vehicles} loading={loading} onRefresh={fetchVehicles} />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {vehicles.length} vehicles of {totalPages * pageSize}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-xl ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <style>{`
        .admin-vehicles-page {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-weight: 800;
          font-size: 36px;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .page-header p {
          font-size: 16px;
          color: #86868b;
          margin: 8px 0 0 0;
        }

        .add-vehicle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .add-vehicle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.2s;
        }

        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .stat-card-content {
          padding: 20px;
        }

        .stat-label {
          font-size: 14px;
          color: #86868b;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Vehicles;
