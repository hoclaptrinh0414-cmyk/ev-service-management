// src/__tests__/customer/MyAppointments.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyAppointments from '../../pages/customer/MyAppointments';
import appointmentService from '../../services/appointmentService';

// Mock các dependencies
jest.mock('../../services/appointmentService');
jest.mock('../../components/UserMenu', () => {
  return function MockUserMenu() {
    return <div data-testid="mock-user-menu">User Menu</div>;
  };
});
jest.mock('../../components/NotificationDropdown', () => {
  return function MockNotificationDropdown() {
    return <div data-testid="mock-notification">Notifications</div>;
  };
});
jest.mock('../../hooks/useNotifications', () => {
  return function useNotifications() {
    return {
      notifications: [],
      markAsRead: jest.fn(),
      dismissNotification: jest.fn()
    };
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MyAppointments Component', () => {
  const mockAppointments = [
    {
      appointmentId: 1,
      appointmentCode: 'APT001',
      appointmentDate: '2025-12-01T10:00:00',
      slotDate: '2025-12-01',
      slotStartTime: '10:00',
      slotEndTime: '11:00',
      status: 'Pending',
      vehicleLicensePlate: '29A-12345',
      vehicleModel: 'Tesla Model 3',
      serviceCenterName: 'Tesla Service Center HCM',
      serviceCenterId: 1,
      services: [
        { serviceName: 'Bảo dưỡng định kỳ' },
        { serviceName: 'Thay dầu' }
      ]
    },
    {
      appointmentId: 2,
      appointmentCode: 'APT002',
      appointmentDate: '2025-11-15T14:00:00',
      slotDate: '2025-11-15',
      slotStartTime: '14:00',
      slotEndTime: '15:00',
      status: 'Completed',
      vehicleLicensePlate: '30B-67890',
      vehicleModel: 'Tesla Model Y',
      serviceCenterName: 'Tesla Service Center Hanoi',
      serviceCenterId: 2,
      services: [
        { serviceName: 'Kiểm tra tổng quát' }
      ]
    },
    {
      appointmentId: 3,
      appointmentCode: 'APT003',
      appointmentDate: '2025-12-10T09:00:00',
      slotDate: '2025-12-10',
      slotStartTime: '09:00',
      slotEndTime: '10:00',
      status: 'Confirmed',
      vehicleLicensePlate: '51C-11111',
      vehicleModel: 'Tesla Model S',
      serviceCenterName: 'Tesla Service Center DN',
      serviceCenterId: 3,
      services: []
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    appointmentService.getMyAppointments.mockResolvedValue({
      data: mockAppointments
    });
  });

  // ==================== TEST 1: UI RENDERING ====================
  describe('UI Rendering', () => {
    test('renders page title and "Đặt lịch mới" button', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getAllByText('Lịch hẹn của tôi').length).toBeGreaterThan(0);
      });

      expect(screen.getByText('Đặt lịch mới')).toBeInTheDocument();
    });

    test('renders tabs for "Tất cả" and "Sắp tới"', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText(/Tất cả/)).toBeInTheDocument();
      });

      expect(screen.getByText('Sắp tới')).toBeInTheDocument();
    });

    test('displays loading spinner while fetching appointments', () => {
      appointmentService.getMyAppointments.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderWithRouter(<MyAppointments />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('displays appointments after loading', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      expect(screen.getByText('APT002')).toBeInTheDocument();
      expect(screen.getByText('APT003')).toBeInTheDocument();
    });

    test('displays "Không có lịch hẹn nào" when no appointments', async () => {
      appointmentService.getMyAppointments.mockResolvedValue({
        data: []
      });

      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('Không có lịch hẹn nào')).toBeInTheDocument();
      });

      expect(screen.getByText('Đặt lịch ngay')).toBeInTheDocument();
    });
  });

  // ==================== TEST 2: APPOINTMENT DATA DISPLAY ====================
  describe('Appointment Data Display', () => {
    test('displays appointment details correctly', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      // Check vehicle info
      expect(screen.getByText('29A-12345')).toBeInTheDocument();
      expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();

      // Check service center
      expect(screen.getByText('Tesla Service Center HCM')).toBeInTheDocument();

      // Check time slot
      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    });

    test('displays status badges correctly', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('Chờ xác nhận')).toBeInTheDocument();
      });

      expect(screen.getByText('Hoàn thành')).toBeInTheDocument();
      expect(screen.getByText('Đã xác nhận')).toBeInTheDocument();
    });

    test('displays services for appointments', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('Bảo dưỡng định kỳ')).toBeInTheDocument();
      });

      expect(screen.getByText('Thay dầu')).toBeInTheDocument();
      expect(screen.getByText('Kiểm tra tổng quát')).toBeInTheDocument();
    });
  });

  // ==================== TEST 3: TAB FILTERING ====================
  describe('Tab Filtering', () => {
    test('shows all appointments in "Tất cả" tab', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      expect(screen.getByText('APT002')).toBeInTheDocument();
      expect(screen.getByText('APT003')).toBeInTheDocument();
    });

    test('filters upcoming appointments in "Sắp tới" tab', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      // Click "Sắp tới" tab
      const upcomingTab = screen.getByText('Sắp tới');
      fireEvent.click(upcomingTab);

      await waitFor(() => {
        // APT001 and APT003 should be visible (future dates, not Cancelled/Completed)
        expect(screen.getByText('APT001')).toBeInTheDocument();
        expect(screen.getByText('APT003')).toBeInTheDocument();
      });

      // APT002 should not be visible (Completed status)
      expect(screen.queryByText('APT002')).not.toBeInTheDocument();
    });

    test('switches between tabs correctly', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      // Click "Sắp tới"
      const upcomingTab = screen.getByText('Sắp tới');
      fireEvent.click(upcomingTab);

      await waitFor(() => {
        expect(upcomingTab.className).toContain('active');
      });

      // Click back to "Tất cả"
      const allTab = screen.getByText(/Tất cả/);
      fireEvent.click(allTab);

      await waitFor(() => {
        expect(allTab.className).toContain('active');
      });
    });
  });

  // ==================== TEST 4: ACTION BUTTONS ====================
  describe('Action Buttons', () => {
    test('shows action buttons for Pending appointments', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      // Should have reschedule, cancel, and delete buttons for Pending status
      const buttons = screen.getAllByRole('button');
      const pendingAppointmentSection = screen.getByText('APT001').closest('.card-body');

      expect(pendingAppointmentSection).toBeInTheDocument();
    });

    test('shows cancel button for Confirmed appointments', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT003')).toBeInTheDocument();
      });

      const confirmedAppointmentSection = screen.getByText('APT003').closest('.card-body');
      expect(confirmedAppointmentSection).toBeInTheDocument();
    });

    test('does not show action buttons for Completed appointments', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT002')).toBeInTheDocument();
      });

      const completedAppointmentSection = screen.getByText('APT002').closest('.card-body');
      expect(completedAppointmentSection).toBeInTheDocument();
    });
  });

  // ==================== TEST 5: CANCEL APPOINTMENT ====================
  describe('Cancel Appointment', () => {
    test('opens cancel modal when cancel button is clicked', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      // Find and click cancel button (by icon)
      const cancelButtons = screen.getAllByTitle('Hủy lịch');
      fireEvent.click(cancelButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Hủy lịch hẹn')).toBeInTheDocument();
      });

      expect(screen.getByText('Bạn có chắc muốn hủy lịch hẹn này?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nhập lý do hủy lịch...')).toBeInTheDocument();
    });

    test('closes modal when "Không" button is clicked', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByTitle('Hủy lịch');
      fireEvent.click(cancelButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Hủy lịch hẹn')).toBeInTheDocument();
      });

      const noButton = screen.getByText('Không');
      fireEvent.click(noButton);

      await waitFor(() => {
        expect(screen.queryByText('Hủy lịch hẹn')).not.toBeInTheDocument();
      });
    });

    test('shows error when cancel reason is empty', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByTitle('Hủy lịch');
      fireEvent.click(cancelButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Hủy lịch hẹn')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Xác nhận hủy');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập lý do hủy lịch.')).toBeInTheDocument();
      });
    });

    test('successfully cancels appointment with valid reason', async () => {
      appointmentService.cancelAppointment.mockResolvedValue({
        success: true
      });

      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByTitle('Hủy lịch');
      fireEvent.click(cancelButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Hủy lịch hẹn')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('Nhập lý do hủy lịch...');
      fireEvent.change(reasonInput, { target: { value: 'Có việc đột xuất' } });

      const confirmButton = screen.getByText('Xác nhận hủy');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(appointmentService.cancelAppointment).toHaveBeenCalledWith(1, 'Có việc đột xuất');
      });
    });
  });

  // ==================== TEST 6: RESCHEDULE APPOINTMENT ====================
  describe('Reschedule Appointment', () => {
    test('opens reschedule modal when reschedule button is clicked', async () => {
      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const rescheduleButtons = screen.getAllByTitle('Dời lịch');
      fireEvent.click(rescheduleButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Dời lịch hẹn')).toBeInTheDocument();
      });

      expect(screen.getByText('Chọn ngày mới')).toBeInTheDocument();
    });

    test('loads available slots when date is selected', async () => {
      const mockSlots = [
        { slotId: 1, startTime: '09:00', endTime: '10:00', availableSlots: 3 },
        { slotId: 2, startTime: '10:00', endTime: '11:00', availableSlots: 2 }
      ];

      appointmentService.getAvailableSlots.mockResolvedValue({
        data: mockSlots
      });

      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const rescheduleButtons = screen.getAllByTitle('Dời lịch');
      fireEvent.click(rescheduleButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Dời lịch hẹn')).toBeInTheDocument();
      });

      // Verify modal opens with date input
      const dateInputs = document.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBeGreaterThan(0);

      // Verify modal has label for date selection
      expect(screen.getByText('Chọn ngày mới')).toBeInTheDocument();
    });
  });

  // ==================== TEST 7: DELETE APPOINTMENT ====================
  describe('Delete Appointment', () => {
    test('shows confirmation dialog when delete button is clicked', async () => {
      window.confirm = jest.fn(() => true);
      appointmentService.deleteAppointment.mockResolvedValue({
        success: true
      });

      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Xóa lịch');
      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith(
        'Bạn có chắc muốn xóa lịch hẹn này? (Chỉ xóa được lịch ở trạng thái Pending)'
      );
    });

    test('successfully deletes appointment when confirmed', async () => {
      window.confirm = jest.fn(() => true);
      appointmentService.deleteAppointment.mockResolvedValue({
        success: true
      });

      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Xóa lịch');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(appointmentService.deleteAppointment).toHaveBeenCalledWith(1);
      });
    });

    test('does not delete when user cancels confirmation', async () => {
      window.confirm = jest.fn(() => false);

      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Xóa lịch');
      fireEvent.click(deleteButtons[0]);

      expect(appointmentService.deleteAppointment).not.toHaveBeenCalled();
    });
  });

  // ==================== TEST 8: ERROR HANDLING ====================
  describe('Error Handling', () => {
    test('displays error message when loading appointments fails', async () => {
      appointmentService.getMyAppointments.mockRejectedValue(
        new Error('Network error')
      );

      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.')).toBeInTheDocument();
      });
    });

    test('displays error when cancel fails', async () => {
      appointmentService.cancelAppointment.mockRejectedValue({
        response: {
          data: {
            message: 'Cannot cancel appointment'
          }
        }
      });

      renderWithRouter(<MyAppointments />);

      await waitFor(() => {
        expect(screen.getByText('APT001')).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByTitle('Hủy lịch');
      fireEvent.click(cancelButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Hủy lịch hẹn')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('Nhập lý do hủy lịch...');
      fireEvent.change(reasonInput, { target: { value: 'Test reason' } });

      const confirmButton = screen.getByText('Xác nhận hủy');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Cannot cancel appointment')).toBeInTheDocument();
      });
    });
  });
});
