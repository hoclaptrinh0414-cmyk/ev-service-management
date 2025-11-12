// src/pages/technician/WorkOrderDetail.jsx - Enhanced with Checklist System
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import {
  getWorkOrderDetail,
  getWorkOrderChecklist,
  updateChecklistItem,
  markItemComplete,
  markItemIncomplete,
  completeItemWithValidation,
  skipOptionalItem,
  validateWorkOrderCompletion,
  bulkCompleteAllItems,
  getActiveServices,
  addServiceToWorkOrder,
  startWorkOrder,
  completeWorkOrder
} from '../../services/technicianService';

/**
 * Work Order Detail - Enhanced with Full Checklist Management
 * Features:
 * - View work order details with vehicle/customer info
 * - Interactive checklist with 8 API actions
 * - Add services (upsell)
 * - Start/Complete work order
 * - Real-time progress tracking
 * - Validation before completion
 */

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('checklist');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // ===== DATA FETCHING =====

  const { data: workOrderResponse, isLoading: loadingWO } = useQuery({
    queryKey: ['workOrderDetail', id],
    queryFn: () => getWorkOrderDetail(id),
    enabled: !!id,
    refetchInterval: 60000,
  });

  // Extract work order data
  const workOrder = workOrderResponse?.data || workOrderResponse;

  const { data: checklistResponse, isLoading: loadingChecklist, refetch: refetchChecklist } = useQuery({
    queryKey: ['workOrderChecklist', id],
    queryFn: () => getWorkOrderChecklist(id),
    enabled: !!id,
    refetchInterval: 30000,
  });

  // Extract checklist items (handle various response formats)
  const checklist = React.useMemo(() => {
    if (!checklistResponse) return [];
    // Response format: { data: { items: [...] } } or { data: [...] } or [...]
    if (checklistResponse.data?.items) return checklistResponse.data.items;
    if (Array.isArray(checklistResponse.data)) return checklistResponse.data;
    if (Array.isArray(checklistResponse)) return checklistResponse;
    return [];
  }, [checklistResponse]);

  const { data: activeServicesResponse, isLoading: loadingServices } = useQuery({
    queryKey: ['activeServices'],
    queryFn: getActiveServices,
    enabled: showAddServiceModal,
  });

  // Extract active services
  const activeServices = React.useMemo(() => {
    if (!activeServicesResponse) return [];
    if (Array.isArray(activeServicesResponse)) return activeServicesResponse;
    if (activeServicesResponse.data?.items) return activeServicesResponse.data.items;
    if (Array.isArray(activeServicesResponse.data)) return activeServicesResponse.data;
    return [];
  }, [activeServicesResponse]);

  // ===== MUTATIONS =====

  // Update checklist item (general update)
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, data }) => updateChecklistItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderChecklist', id]);
      toast.success('Item updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    },
  });

  // Mark item complete
  const completeItemMutation = useMutation({
    mutationFn: (itemId) => markItemComplete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderChecklist', id]);
      toast.success('✅ Item completed');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete item');
    },
  });

  // Mark item incomplete (undo)
  const incompleteItemMutation = useMutation({
    mutationFn: (itemId) => markItemIncomplete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderChecklist', id]);
      toast.info('Item marked as incomplete');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark incomplete');
    },
  });

  // Complete with validation
  const completeWithValidationMutation = useMutation({
    mutationFn: ({ itemId, validationData }) => completeItemWithValidation(itemId, validationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderChecklist', id]);
      toast.success('✅ Item completed with validation');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Validation failed');
    },
  });

  // Skip optional item
  const skipItemMutation = useMutation({
    mutationFn: ({ itemId, reason }) => skipOptionalItem(itemId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderChecklist', id]);
      toast.info('Item skipped');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cannot skip required item');
    },
  });

  // Validate work order completion
  const validateCompletionMutation = useMutation({
    mutationFn: (workOrderId) => validateWorkOrderCompletion(workOrderId),
    onSuccess: (data) => {
      if (data.canComplete) {
        toast.success('✅ All requirements met! Ready to complete.');
      } else {
        toast.error(`❌ Cannot complete: ${data.missingItems?.join(', ')}`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Validation failed');
    },
  });

  // Bulk complete all items
  const bulkCompleteMutation = useMutation({
    mutationFn: (workOrderId) => bulkCompleteAllItems(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderChecklist', id]);
      toast.success('🎉 All items completed!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete all items');
    },
  });

  // Add service to work order
  const addServiceMutation = useMutation({
    mutationFn: ({ workOrderId, serviceId }) => addServiceToWorkOrder(workOrderId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderDetail', id]);
      setShowAddServiceModal(false);
      toast.success('✅ Service added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add service');
    },
  });

  // Start work order
  const startWorkMutation = useMutation({
    mutationFn: startWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderDetail', id]);
      queryClient.invalidateQueries(['myWorkOrders']);
      toast.success('🚀 Work order started!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to start work order');
    },
  });

  // Complete work order
  const completeWorkMutation = useMutation({
    mutationFn: completeWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderDetail', id]);
      queryClient.invalidateQueries(['myWorkOrders']);
      toast.success('🎉 Work order completed!');
      setTimeout(() => navigate('/technician/work-orders'), 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete work order');
    },
  });

  // ===== HANDLERS =====

  const handleCompleteItem = (itemId) => {
    completeItemMutation.mutate(itemId);
  };

  const handleUndoItem = (itemId) => {
    incompleteItemMutation.mutate(itemId);
  };

  const handleSkipItem = (itemId) => {
    const reason = prompt('Reason for skipping (optional):');
    skipItemMutation.mutate({ itemId, reason: reason || 'Skipped by technician' });
  };

  const handleValidateCompletion = () => {
    validateCompletionMutation.mutate(id);
  };

  const handleBulkComplete = () => {
    if (window.confirm('Complete all checklist items at once?')) {
      bulkCompleteMutation.mutate(id);
    }
  };

  const handleStartWork = () => {
    if (window.confirm('Start working on this order?')) {
      startWorkMutation.mutate(id);
    }
  };

  const handleCompleteWork = () => {
    if (window.confirm('Complete this work order? Make sure all checklist items are done.')) {
      completeWorkMutation.mutate(id);
    }
  };

  const handleAddService = (serviceId) => {
    addServiceMutation.mutate({ workOrderId: id, serviceId });
  };

  // ===== COMPUTED VALUES =====

  const checklistProgress = React.useMemo(() => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.isCompleted).length;
    return Math.round((completed / checklist.length) * 100);
  }, [checklist]);

  const canStartWork = workOrder?.statusId === 2; // Assigned
  const isInProgress = workOrder?.statusId === 3; // InProgress
  const isCompleted = workOrder?.statusId === 6; // Completed

  // ===== LOADING STATE =====

  if (loadingWO) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading work order...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-12 text-center max-w-md">
          <i className="bi bi-exclamation-triangle text-red-500 text-6xl mb-4 block"></i>
          <h2 className="text-2xl font-bold mb-2">Work Order Not Found</h2>
          <p className="text-gray-600 mb-6">The work order doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate('/technician/work-orders')}>
            <i className="bi bi-arrow-left mr-2"></i>
            Back to Work Orders
          </Button>
        </Card>
      </div>
    );
  }

  // ===== MAIN RENDER =====

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/technician/work-orders')}>
                <i className="bi bi-arrow-left text-xl"></i>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {workOrder.workOrderCode}
                  <StatusBadge statusId={workOrder.statusId} statusName={workOrder.statusName} />
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {workOrder.vehicleModel} • {workOrder.licensePlate}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {canStartWork && (
                <Button
                  onClick={handleStartWork}
                  disabled={startWorkMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {startWorkMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Starting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play-fill mr-2"></i>
                      Start Work
                    </>
                  )}
                </Button>
              )}

              {isInProgress && (
                <>
                  <Button
                    onClick={handleValidateCompletion}
                    disabled={validateCompletionMutation.isPending}
                    variant="outline"
                  >
                    <i className="bi bi-check-square mr-2"></i>
                    Validate
                  </Button>
                  <Button
                    onClick={handleCompleteWork}
                    disabled={completeWorkMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {completeWorkMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Completing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle mr-2"></i>
                        Complete Work
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isInProgress && checklist.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Checklist Progress</span>
                <span className="font-semibold text-gray-900">{checklistProgress}%</span>
              </div>
              <Progress value={checklistProgress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Summary */}
          <div className="lg:col-span-1">
            <WorkOrderSummary workOrder={workOrder} />
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="checklist">
                    <i className="bi bi-list-check mr-2"></i>
                    Checklist ({checklist.length})
                  </TabsTrigger>
                  <TabsTrigger value="services">
                    <i className="bi bi-wrench mr-2"></i>
                    Services ({workOrder.services?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="info">
                    <i className="bi bi-info-circle mr-2"></i>
                    Info
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="checklist">
                  <ChecklistTab
                    checklist={checklist}
                    isLoading={loadingChecklist}
                    onComplete={handleCompleteItem}
                    onUndo={handleUndoItem}
                    onSkip={handleSkipItem}
                    onBulkComplete={handleBulkComplete}
                    onRefresh={refetchChecklist}
                    isUpdating={completeItemMutation.isPending || incompleteItemMutation.isPending}
                  />
                </TabsContent>

                <TabsContent value="services">
                  <ServicesTab
                    services={workOrder.services || []}
                    onAddService={() => setShowAddServiceModal(true)}
                    canAddService={isInProgress}
                  />
                </TabsContent>

                <TabsContent value="info">
                  <InfoTab workOrder={workOrder} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        open={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        services={activeServices}
        onAddService={handleAddService}
        isLoading={loadingServices}
        isAdding={addServiceMutation.isPending}
      />
    </div>
  );
}

// ===== SUB-COMPONENTS =====

function StatusBadge({ statusId, statusName }) {
  const variants = {
    1: { color: 'bg-gray-100 text-gray-800', icon: 'circle' },
    2: { color: 'bg-blue-100 text-blue-800', icon: 'person-check' },
    3: { color: 'bg-orange-100 text-orange-800', icon: 'gear-fill' },
    6: { color: 'bg-green-100 text-green-800', icon: 'check-circle-fill' },
  };
  const config = variants[statusId] || variants[1];
  
  return (
    <Badge className={`${config.color} px-3 py-1`}>
      <i className={`bi bi-${config.icon} mr-1`}></i>
      {statusName}
    </Badge>
  );
}

function WorkOrderSummary({ workOrder }) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="bi bi-car-front text-orange-600 mr-2"></i>
          Vehicle Info
        </h3>
        <div className="space-y-3 text-sm">
          <InfoRow label="Model" value={workOrder.vehicleModel} />
          <InfoRow label="License Plate" value={workOrder.licensePlate} />
          <InfoRow label="VIN" value={workOrder.vin || 'N/A'} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="bi bi-person text-orange-600 mr-2"></i>
          Customer Info
        </h3>
        <div className="space-y-3 text-sm">
          <InfoRow label="Name" value={workOrder.customerName} />
          <InfoRow label="Phone" value={workOrder.customerPhone || 'N/A'} />
          <InfoRow label="Email" value={workOrder.customerEmail || 'N/A'} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="bi bi-clock text-orange-600 mr-2"></i>
          Timeline
        </h3>
        <div className="space-y-3 text-sm">
          <InfoRow label="Created" value={formatDate(workOrder.createdAt)} />
          <InfoRow label="Start Date" value={formatDate(workOrder.startDate)} />
          <InfoRow label="Estimated Duration" value={`${workOrder.estimatedDuration || 0} min`} />
        </div>
      </Card>
    </div>
  );
}

function ChecklistTab({ checklist, isLoading, onComplete, onUndo, onSkip, onBulkComplete, onRefresh, isUpdating }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (checklist.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="bi bi-list-check text-gray-300 text-5xl mb-3 block"></i>
        <p className="text-gray-600">No checklist items</p>
      </div>
    );
  }

  const completed = checklist.filter(item => item.isCompleted).length;
  const total = checklist.length;

  return (
    <div>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Checklist Items ({completed}/{total})
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <i className="bi bi-arrow-clockwise mr-1"></i>
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkComplete}
            disabled={completed === total || isUpdating}
          >
            <i className="bi bi-check-all mr-1"></i>
            Complete All
          </Button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        <AnimatePresence>
          {checklist.map((item, index) => (
            <motion.div
              key={item.checklistItemId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ChecklistItem
                item={item}
                onComplete={onComplete}
                onUndo={onUndo}
                onSkip={onSkip}
                isUpdating={isUpdating}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChecklistItem({ item, onComplete, onUndo, onSkip, isUpdating }) {
  return (
    <Card className={`p-4 ${item.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-base ${item.isCompleted ? 'line-through text-gray-500' : 'font-medium text-gray-900'}`}>
              {item.taskDescription || item.description}
            </span>
            {item.isRequired && !item.isCompleted && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
            {item.isCompleted && (
              <Badge variant="success" className="text-xs">
                <i className="bi bi-check-circle-fill mr-1"></i>
                Done
              </Badge>
            )}
          </div>
          {item.notes && (
            <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!item.isCompleted ? (
            <>
              <Button
                size="sm"
                onClick={() => onComplete(item.checklistItemId)}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <i className="bi bi-check"></i>
              </Button>
              {!item.isRequired && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSkip(item.checklistItemId)}
                  disabled={isUpdating}
                >
                  <i className="bi bi-skip-forward"></i>
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUndo(item.checklistItemId)}
              disabled={isUpdating}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ServicesTab({ services, onAddService, canAddService }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Services ({services.length})</h3>
        {canAddService && (
          <Button onClick={onAddService} size="sm">
            <i className="bi bi-plus-circle mr-2"></i>
            Add Service
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <i className="bi bi-wrench text-gray-300 text-5xl mb-3 block"></i>
          <p className="text-gray-600">No services added</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">${service.price}</p>
                  <p className="text-xs text-gray-500">{service.duration} min</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoTab({ workOrder }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Work Order Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow label="Code" value={workOrder.workOrderCode} />
          <InfoRow label="Status" value={workOrder.statusName} />
          <InfoRow label="Priority" value={workOrder.priority || 'Normal'} />
          <InfoRow label="Estimated Duration" value={`${workOrder.estimatedDuration || 0} min`} />
        </div>
      </div>
      
      {workOrder.description && (
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{workOrder.description}</p>
        </div>
      )}
      
      {workOrder.notes && (
        <div>
          <h4 className="font-medium mb-2">Notes</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{workOrder.notes}</p>
        </div>
      )}
    </div>
  );
}

function AddServiceModal({ open, onClose, services, onAddService, isLoading, isAdding }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Add Service to Work Order</h2>
            <Button variant="ghost" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <i className="bi bi-inbox text-gray-300 text-5xl mb-3 block"></i>
              <p className="text-gray-600">No services available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <Card key={service.serviceId} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-orange-600 font-semibold">${service.price}</span>
                        <span className="text-gray-500">{service.duration} min</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => onAddService(service.serviceId)}
                      disabled={isAdding}
                      size="sm"
                    >
                      {isAdding ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
