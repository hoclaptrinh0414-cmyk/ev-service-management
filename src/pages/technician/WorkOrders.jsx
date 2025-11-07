// src/pages/technician/WorkOrders.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Filter,
  Search,
  ChevronRight,
  Briefcase,
  Clock,
  User,
  Car,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import technicianService from '../../services/technicianService';
import { formatDate } from '../../lib/utils';

const WorkOrders = () => {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadWorkOrders();
  }, []);

  useEffect(() => {
    filterWorkOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrders, searchTerm, statusFilter]);

  const loadWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await technicianService.getMyWorkOrders();
      const data = response?.data || response?.Data || response;
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkOrders = () => {
    let filtered = [...workOrders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(wo =>
        wo.workOrderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(wo => wo.statusName === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { variant: 'warning', label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'InProgress': { variant: 'info', label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'Completed': { variant: 'success', label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200' },
      'Cancelled': { variant: 'destructive', label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
    };
    const config = statusMap[status] || { variant: 'outline', label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusCount = (status) => {
    if (status === 'all') return workOrders.length;
    return workOrders.filter(wo => wo.statusName === status).length;
  };

  const stats = [
    { label: 'Tất cả', value: getStatusCount('all'), status: 'all', color: 'text-gray-600' },
    { label: 'Chờ xử lý', value: getStatusCount('Pending'), status: 'Pending', color: 'text-yellow-600' },
    { label: 'Đang xử lý', value: getStatusCount('InProgress'), status: 'InProgress', color: 'text-blue-600' },
    { label: 'Hoàn thành', value: getStatusCount('Completed'), status: 'Completed', color: 'text-green-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardCheck className="h-8 w-8" />
          Công việc được giao
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và theo dõi các công việc được phân công
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all hover:shadow-md ${
              statusFilter === stat.status ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setStatusFilter(stat.status)}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã công việc, khách hàng, xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Pending">Chờ xử lý</SelectItem>
                <SelectItem value="InProgress">Đang xử lý</SelectItem>
                <SelectItem value="Completed">Hoàn thành</SelectItem>
                <SelectItem value="Cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách công việc ({filteredOrders.length})
          </CardTitle>
          <CardDescription>
            Nhấn vào công việc để xem chi tiết
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="space-y-3">
              {filteredOrders.map((wo) => (
                <div
                  key={wo.workOrderId}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-all hover:shadow-md"
                  onClick={() => navigate(`/technician/work-orders/${wo.workOrderId}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{wo.workOrderCode}</h3>
                          {getStatusBadge(wo.statusName)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{wo.customerName || 'N/A'}</span>
                          </div>
                          {wo.vehicleName && (
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{wo.vehicleName}</span>
                            </div>
                          )}
                          {wo.createdAt && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{formatDate(wo.createdAt)}</span>
                            </div>
                          )}
                        </div>
                        
                        {wo.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {wo.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy công việc nào</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Chưa có công việc nào được giao'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrders;
