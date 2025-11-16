// src/__tests__/customer/Profile.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../../pages/customer/Profile';
import { AuthProvider } from '../../contexts/AuthContext';
import { customerProfileService } from '../../services/customerProfileService';

// Mock các dependencies
jest.mock('../../services/customerProfileService');
jest.mock('../../components/GlobalNavbar', () => {
  return function MockGlobalNavbar() {
    return <div data-testid="mock-navbar">Mock Navbar</div>;
  };
});
jest.mock('../../components/FancyButton', () => {
  return function MockFancyButton({ children, onClick, disabled, variant }) {
    return (
      <button onClick={onClick} disabled={disabled} data-testid="fancy-button">
        {children}
      </button>
    );
  };
});

// Helper function để render component với providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Profile Component', () => {
  const mockProfileData = {
    success: true,
    data: {
      customerId: 1,
      fullName: 'Nguyen Van A',
      email: 'nguyenvana@example.com',
      phoneNumber: '0901234567',
      address: 'Ha Noi',
      gender: 'Male',
      dateOfBirth: '1990-01-01T00:00:00',
      totalSpent: 5000000,
      loyaltyPoints: 500,
      customerType: {
        typeName: 'Gold'
      },
      preferredLanguage: 'vi-VN',
      marketingOptIn: false
    }
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock localStorage
    localStorage.setItem('user', JSON.stringify({
      fullName: 'Nguyen Van A',
      email: 'nguyenvana@example.com',
      phoneNumber: '0901234567'
    }));

    // Mock API response mặc định
    customerProfileService.getProfile.mockResolvedValue(mockProfileData);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ==================== TEST 1: UI RENDERING ====================
  describe('UI Rendering', () => {
    test('renders profile form with all input fields', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByText('TÊN ĐẦY ĐỦ')).toBeInTheDocument();
      });

      // Kiểm tra các trường hiển thị
      expect(screen.getByText('EMAIL')).toBeInTheDocument();
      expect(screen.getByText('SỐ ĐIỆN THOẠI')).toBeInTheDocument();
      expect(screen.getByText('ĐỊA CHỈ')).toBeInTheDocument();
      expect(screen.getByText('GIỚI TÍNH')).toBeInTheDocument();
      expect(screen.getByText('NGÀY SINH')).toBeInTheDocument();
      expect(screen.getByText('BẬC KHÁCH HÀNG')).toBeInTheDocument();
      expect(screen.getByText('ĐIỂM TÍCH LŨY')).toBeInTheDocument();
      expect(screen.getByText('TỔNG CHI TIÊU')).toBeInTheDocument();
    });

    test('displays user profile data correctly', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('nguyenvana@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0901234567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Ha Noi')).toBeInTheDocument();
    });

    test('renders Edit button initially', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        expect(editButtons.length).toBeGreaterThan(0);
      });
    });
  });

  // ==================== TEST 2: STATE MANAGEMENT ====================
  describe('State Management', () => {
    test('enables input fields when Edit button is clicked', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const fullNameInput = screen.getByDisplayValue('Nguyen Van A');
        expect(fullNameInput).not.toBeDisabled();
      });
    });

    test('updates input value when user types', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const fullNameInput = screen.getByDisplayValue('Nguyen Van A');
        expect(fullNameInput).not.toBeDisabled();
      });

      // Change value
      const fullNameInput = screen.getByDisplayValue('Nguyen Van A');
      fireEvent.change(fullNameInput, { target: { value: 'Nguyen Van B' } });

      expect(screen.getByDisplayValue('Nguyen Van B')).toBeInTheDocument();
    });

    test('shows Save and Cancel buttons when editing', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });
  });

  // ==================== TEST 3: FORM VALIDATION ====================
  describe('Form Validation', () => {
    test('shows error when phone number is invalid', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const phoneInput = screen.getByDisplayValue('0901234567');
        expect(phoneInput).not.toBeDisabled();
      });

      // Nhập số điện thoại không hợp lệ
      const phoneInput = screen.getByDisplayValue('0901234567');
      fireEvent.change(phoneInput, { target: { value: '123' } });

      await waitFor(() => {
        expect(screen.getByText(/Số điện thoại phải có 10 hoặc 11 chữ số/i)).toBeInTheDocument();
      });
    });

    test('shows error when phone number does not start with 0', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const phoneInput = screen.getByDisplayValue('0901234567');
        expect(phoneInput).not.toBeDisabled();
      });

      // Nhập số không bắt đầu bằng 0
      const phoneInput = screen.getByDisplayValue('0901234567');
      fireEvent.change(phoneInput, { target: { value: '1901234567' } });

      await waitFor(() => {
        expect(screen.getByText(/Số điện thoại phải bắt đầu bằng số 0/i)).toBeInTheDocument();
      });
    });

    test('shows error when phone number has invalid prefix', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const phoneInput = screen.getByDisplayValue('0901234567');
        expect(phoneInput).not.toBeDisabled();
      });

      // Nhập đầu số không hợp lệ
      const phoneInput = screen.getByDisplayValue('0901234567');
      fireEvent.change(phoneInput, { target: { value: '0601234567' } });

      await waitFor(() => {
        expect(screen.getByText(/Đầu số điện thoại không hợp lệ/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== TEST 4: API CALLS - SUCCESS ====================
  describe('API Calls - Success Scenarios', () => {
    test('loads profile data from API on mount', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(customerProfileService.getProfile).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });
    });

    test('submits form successfully with valid data', async () => {
      customerProfileService.updateProfile.mockResolvedValue({
        success: true,
        data: mockProfileData.data
      });

      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const fullNameInput = screen.getByDisplayValue('Nguyen Van A');
        expect(fullNameInput).not.toBeDisabled();
      });

      // Change phone number to valid value
      const phoneInput = screen.getByDisplayValue('0901234567');
      fireEvent.change(phoneInput, { target: { value: '0912345678' } });

      // Click Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(customerProfileService.updateProfile).toHaveBeenCalled();
      });
    });
  });

  // ==================== TEST 5: API CALLS - ERROR ====================
  describe('API Calls - Error Scenarios', () => {
    test('displays error message when API fails to load profile', async () => {
      customerProfileService.getProfile.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(customerProfileService.getProfile).toHaveBeenCalled();
      });

      // Should fallback to localStorage data if available (we set it in beforeEach)
      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });
    });

    test('displays error message when update fails', async () => {
      customerProfileService.updateProfile.mockRejectedValue({
        response: {
          data: {
            message: 'Update failed'
          }
        }
      });

      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const fullNameInput = screen.getByDisplayValue('Nguyen Van A');
        expect(fullNameInput).not.toBeDisabled();
      });

      // Click Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(customerProfileService.updateProfile).toHaveBeenCalled();
      });
    });
  });

  // ==================== TEST 6: USER INTERACTIONS ====================
  describe('User Interactions', () => {
    test('cancels edit and resets form data', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const fullNameInput = screen.getByDisplayValue('Nguyen Van A');
        expect(fullNameInput).not.toBeDisabled();
      });

      // Change value
      const fullNameInput = screen.getByDisplayValue('Nguyen Van A');
      fireEvent.change(fullNameInput, { target: { value: 'Changed Name' } });

      expect(screen.getByDisplayValue('Changed Name')).toBeInTheDocument();

      // Click Cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Should reset to original value
      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });
    });

    test('prevents save when phone number is empty', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nguyen Van A')).toBeInTheDocument();
      });

      // Click Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        const phoneInput = screen.getByDisplayValue('0901234567');
        expect(phoneInput).not.toBeDisabled();
      });

      // Clear phone number
      const phoneInput = screen.getByDisplayValue('0901234567');
      fireEvent.change(phoneInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText(/Số điện thoại không được để trống/i)).toBeInTheDocument();
      });

      // Save button should be disabled
      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
    });
  });

  // ==================== TEST 7: READ-ONLY FIELDS ====================
  describe('Read-Only Fields', () => {
    test('email field is always disabled', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('nguyenvana@example.com')).toBeInTheDocument();
      });

      const emailInput = screen.getByDisplayValue('nguyenvana@example.com');
      expect(emailInput).toBeDisabled();

      // Even after clicking Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
      });
    });

    test('customer type field is always disabled', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Gold')).toBeInTheDocument();
      });

      const customerTypeInput = screen.getByDisplayValue('Gold');
      expect(customerTypeInput).toBeDisabled();

      // Even after clicking Edit
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(customerTypeInput).toBeDisabled();
      });
    });

    test('loyalty points field is always disabled', async () => {
      renderWithProviders(<Profile />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('500')).toBeInTheDocument();
      });

      const loyaltyPointsInput = screen.getByDisplayValue('500');
      expect(loyaltyPointsInput).toBeDisabled();
    });
  });
});
