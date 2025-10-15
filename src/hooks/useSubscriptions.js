// src/hooks/useSubscriptions.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscriptionService';

export const useSubscriptions = (statusFilter) => {
  const queryClient = useQueryClient();

  // Lấy subscriptions
  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['subscriptions', statusFilter],
    queryFn: async () => {
      const response = await subscriptionService.getMySubscriptions(statusFilter);
      return Array.isArray(response.data) ? response.data :
             Array.isArray(response) ? response : [];
    },
  });

  // Mua package
  const purchaseMutation = useMutation({
    mutationFn: subscriptionService.purchasePackage,
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
    },
  });

  // Hủy subscription
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => subscriptionService.cancelSubscription(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
    },
  });

  return {
    subscriptions: subscriptions || [],
    isLoading,
    error,
    purchasePackage: purchaseMutation.mutate,
    purchasePackageAsync: purchaseMutation.mutateAsync,
    cancelSubscription: cancelMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
};

export default useSubscriptions;
