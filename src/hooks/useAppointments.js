// src/hooks/useAppointments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';

export const useAppointments = () => {
  const queryClient = useQueryClient();

  // Lấy danh sách appointments
  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await appointmentService.getMyAppointments();
      return Array.isArray(response.data) ? response.data :
             Array.isArray(response) ? response : [];
    },
  });

  // Lấy upcoming appointments
  const { data: upcomingAppointments, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const response = await appointmentService.getUpcomingAppointments();
      return Array.isArray(response.data) ? response.data :
             Array.isArray(response) ? response : [];
    },
  });

  // Tạo appointment mới
  const createMutation = useMutation({
    mutationFn: appointmentService.createAppointment,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['appointments']);
      return data;
    },
  });

  // Hủy appointment
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => appointmentService.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
    },
  });

  // Reschedule appointment
  const rescheduleMutation = useMutation({
    mutationFn: ({ appointmentId, newSlotId, reason }) =>
      appointmentService.rescheduleAppointment(appointmentId, newSlotId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
    },
  });

  // Delete appointment
  const deleteMutation = useMutation({
    mutationFn: appointmentService.deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
    },
  });

  return {
    appointments: appointments || [],
    upcomingAppointments: upcomingAppointments || [],
    isLoading,
    isLoadingUpcoming,
    error,
    createAppointment: createMutation.mutate,
    createAppointmentAsync: createMutation.mutateAsync,
    cancelAppointment: cancelMutation.mutate,
    rescheduleAppointment: rescheduleMutation.mutate,
    deleteAppointment: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isRescheduling: rescheduleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export default useAppointments;
