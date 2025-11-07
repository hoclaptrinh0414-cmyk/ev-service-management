// src/pages/technician/WorkOrderDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  User,
  Car,
  ClipboardCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Textarea } from '../../components/ui/textarea';
import technicianService from '../../services/technicianService';

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    loadWorkOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadWorkOrderData = async () => {
    setLoading(true);
    try {
      const [woResponse, checklistResponse] = await Promise.all([
        technicianService.getWorkOrderDetail(id),
        technicianService.getWorkOrderChecklist(id)
      ]);

      const woData = woResponse?.data || woResponse?.Data || woResponse;
      const checklistData = checklistResponse?.data || checklistResponse?.Data || checklistResponse;

      setWorkOrder(woData);
      setChecklist(checklistData);
    } catch (error) {
      console.error('Error loading work order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkOrder = async () => {
    setProcessing(true);
    try {
      await technicianService.startWorkOrder(id);
      await loadWorkOrderData();
    } catch (error) {
      console.error('Error starting work order:', error);
      alert('Không thể bắt đầu công việc. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteItem = async (itemId) => {
    try {
      await technicianService.completeChecklistItem(itemId, {
        notes: 'Completed via app'
      });
      await loadWorkOrderData();
    } catch (error) {
      console.error('Error completing item:', error);
      alert('Không thể hoàn thành mục này.');
    }
  };

  const handleSkipItem = async (itemId) => {
    const reason = prompt('Lý do bỏ qua:');
    if (!reason) return;

    try {
      await technicianService.skipChecklistItem(itemId, { reason });
      await loadWorkOrderData();
    } catch (error) {
      console.error('Error skipping item:', error);
      alert('Không thể bỏ qua mục này.');
    }
  };

  const handleCompleteWorkOrder = async () => {
    setProcessing(true);
    try {
      // Validate checklist first
      const validation = await technicianService.validateChecklist(id);
      const validationData = validation?.data || validation?.Data || validation;

      if (!validationData.canComplete) {
        alert(`Không thể hoàn thành công việc. Còn ${validationData.missingCount} mục bắt buộc chưa hoàn thành.`);
        setProcessing(false);
        return;
      }

      // Complete work order
      await technicianService.completeWorkOrder(id, {
        notes: completionNotes || 'Completed via Technician App'
      });

      alert('Công việc đã được hoàn thành!');
      navigate('/technician/work-orders');
    } catch (error) {
      console.error('Error completing work order:', error);
      alert('Không thể hoàn thành công việc. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { variant: 'warning', label: 'Chờ xử lý' },
      'InProgress': { variant: 'info', label: 'Đang xử lý' },
      'Completed': { variant: 'success', label: 'Hoàn thành' },
      'Cancelled': { variant: 'destructive', label: 'Đã hủy' },
    };
    const config = statusMap[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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

  if (!workOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy công việc</h2>
          <Button onClick={() => navigate('/technician/work-orders')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = checklist 
    ? Math.round((checklist.completedItems / checklist.totalItems) * 100) 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/technician/work-orders')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{workOrder.workOrderCode}</h1>
            <p className="text-muted-foreground mt-1">Chi tiết công việc</p>
          </div>
        </div>
        {getStatusBadge(workOrder.statusName)}
      </div>

      {/* Work Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Tên khách hàng</p>
              <p className="font-semibold">{workOrder.customerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
              <p className="font-semibold">{workOrder.customerPhone || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Thông tin xe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Xe</p>
              <p className="font-semibold">{workOrder.vehicleName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Biển số</p>
              <p className="font-semibold">{workOrder.licensePlate || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {workOrder.statusName === 'Pending' && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlayCircle className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Sẵn sàng bắt đầu?</h3>
                  <p className="text-sm text-muted-foreground">
                    Bấm nút để bắt đầu làm việc với công việc này
                  </p>
                </div>
              </div>
              <Button
                onClick={handleStartWorkOrder}
                disabled={processing}
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Bắt đầu công việc
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Danh sách kiểm tra
              </CardTitle>
              <CardDescription className="mt-1">
                {checklist?.completedItems || 0}/{checklist?.totalItems || 0} mục đã hoàn thành
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{progressPercentage}%</p>
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
        <CardContent>
          {checklist && checklist.items && checklist.items.length > 0 ? (
            <div className="space-y-3">
              {checklist.items.map((item) => (
                <div
                  key={item.itemId}
                  className={`p-4 border rounded-lg ${
                    item.isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : item.isSkipped 
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {item.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : item.isSkipped ? (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{item.itemDescription}</p>
                          {item.isRequired && (
                            <Badge variant="destructive" className="text-xs">Bắt buộc</Badge>
                          )}
                          {item.isCompleted && (
                            <Badge variant="success" className="text-xs">Hoàn thành</Badge>
                          )}
                          {item.isSkipped && (
                            <Badge variant="outline" className="text-xs">Đã bỏ qua</Badge>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Ghi chú: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!item.isCompleted && !item.isSkipped && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleCompleteItem(item.itemId)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Hoàn thành
                          </Button>
                          {!item.isRequired && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSkipItem(item.itemId)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Bỏ qua
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Chưa có danh sách kiểm tra</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Work Order */}
      {workOrder.statusName === 'InProgress' && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle>Hoàn thành công việc</CardTitle>
            <CardDescription>
              Vui lòng kiểm tra kỹ danh sách trước khi hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ghi chú hoàn thành (không bắt buộc)
              </label>
              <Textarea
                placeholder="Nhập ghi chú về công việc đã hoàn thành..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={handleCompleteWorkOrder}
              disabled={processing}
              size="lg"
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Hoàn thành công việc
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkOrderDetail;
