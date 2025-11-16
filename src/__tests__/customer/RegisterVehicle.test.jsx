// src/__tests__/customer/RegisterVehicle.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import RegisterVehicle from '../../pages/customer/RegisterVehicle';
import { vehicleAPI, carBrandAPI, carModelAPI } from '../../services/apiService';

// Mock các dependencies
jest.mock('../../services/apiService');
jest.mock('../../components/GlobalNavbar', () => {
  return function MockGlobalNavbar() {
    return <div data-testid="mock-navbar">Mock Navbar</div>;
  };
});
jest.mock('../../components/FancyButton', () => {
  return function MockFancyButton({ children, onClick, disabled, type }) {
    return (
      <button onClick={onClick} disabled={disabled} type={type} data-testid="fancy-button">
        {children}
      </button>
    );
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RegisterVehicle Component', () => {
  const mockBrands = [
    { brandId: 1, brandName: 'Tesla', country: 'USA' },
    { brandId: 2, brandName: 'BYD', country: 'China' },
    { brandId: 3, brandName: 'VinFast', country: 'Vietnam' }
  ];

  const mockModels = [
    { modelId: 1, modelName: 'Model 3', year: 2024 },
    { modelId: 2, modelName: 'Model Y', year: 2024 },
    { modelId: 3, modelName: 'Model S', year: 2023 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    // Mock API responses
    carBrandAPI.getActiveBrands.mockResolvedValue({ data: mockBrands });
    carModelAPI.getModelsByBrand.mockResolvedValue({ data: mockModels });
    vehicleAPI.addVehicle.mockResolvedValue({ success: true });
  });

  // ==================== TEST 1: UI RENDERING ====================
  describe('UI Rendering', () => {
    test('renders form title correctly', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Đăng ký xe mới')).toBeInTheDocument();
      });
    });

    test('renders all form fields', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Hãng xe')).toBeInTheDocument();
      });

      expect(screen.getByText('Mẫu xe')).toBeInTheDocument();
      expect(screen.getByText('Biển số xe')).toBeInTheDocument();
      expect(screen.getByText('VIN (Số khung)')).toBeInTheDocument();
      expect(screen.getByText('Màu xe')).toBeInTheDocument();
      expect(screen.getByText('Ngày mua xe')).toBeInTheDocument();
      expect(screen.getByText('Số km đã chạy')).toBeInTheDocument();
      expect(screen.getByText('Số bảo hiểm')).toBeInTheDocument();
      expect(screen.getByText('Hạn bảo hiểm')).toBeInTheDocument();
      expect(screen.getByText('Hạn đăng kiểm')).toBeInTheDocument();
    });

    test('renders submit button', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByTestId('fancy-button')).toBeInTheDocument();
      });

      expect(screen.getByText('Đăng ký')).toBeInTheDocument();
    });

    test('shows required field indicators', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        const requiredFields = screen.getAllByText('*');
        expect(requiredFields.length).toBeGreaterThan(0);
      });
    });
  });

  // ==================== TEST 2: DATA LOADING ====================
  describe('Data Loading', () => {
    test('loads car brands on mount', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(carBrandAPI.getActiveBrands).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      expect(screen.getByText('BYD (China)')).toBeInTheDocument();
      expect(screen.getByText('VinFast (Vietnam)')).toBeInTheDocument();
    });

    test('displays loading state while fetching brands', async () => {
      carBrandAPI.getActiveBrands.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: mockBrands }), 100))
      );

      renderWithRouter(<RegisterVehicle />);

      // Should show loading text
      expect(screen.getByText('Đang tải...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });
    });

    test('loads models when brand is selected', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Select brand
      const brandSelect = screen.getAllByRole('combobox')[0]; // First select is brand
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(carModelAPI.getModelsByBrand).toHaveBeenCalledWith('1');
      });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      expect(screen.getByText('Model Y (2024)')).toBeInTheDocument();
      expect(screen.getByText('Model S (2023)')).toBeInTheDocument();
    });

    test('clears models when brand is deselected', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Select brand
      const brandSelect = screen.getAllByRole('combobox')[0]; // First select is brand
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      // Deselect brand
      fireEvent.change(brandSelect, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.queryByText('Model 3 (2024)')).not.toBeInTheDocument();
      });
    });
  });

  // ==================== TEST 3: FORM INPUT ====================
  describe('Form Input', () => {
    test('updates license plate input correctly', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('VD: 29A-12345')).toBeInTheDocument();
      });

      const licensePlateInput = screen.getByPlaceholderText('VD: 29A-12345');
      fireEvent.change(licensePlateInput, { target: { value: '29A-12345' } });

      expect(licensePlateInput.value).toBe('29A-12345');
    });

    test('updates VIN input correctly', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('VD: 5YJ3E1EA1JF000123')).toBeInTheDocument();
      });

      const vinInput = screen.getByPlaceholderText('VD: 5YJ3E1EA1JF000123');
      fireEvent.change(vinInput, { target: { value: '5YJ3E1EA1JF000123' } });

      expect(vinInput.value).toBe('5YJ3E1EA1JF000123');
    });

    test('updates color input correctly', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('VD: Đen, Trắng, Xanh')).toBeInTheDocument();
      });

      const colorInput = screen.getByPlaceholderText('VD: Đen, Trắng, Xanh');
      fireEvent.change(colorInput, { target: { value: 'Đen' } });

      expect(colorInput.value).toBe('Đen');
    });

    test('updates mileage input correctly', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
      });

      const mileageInput = screen.getByPlaceholderText('0');
      fireEvent.change(mileageInput, { target: { value: '5000' } });

      expect(mileageInput.value).toBe('5000');
    });

    test('updates purchase date input correctly', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        const dateInputs = screen.getAllByDisplayValue('');
        expect(dateInputs.length).toBeGreaterThan(0);
      });

      const purchaseDateInput = screen.getAllByDisplayValue('')[0];
      fireEvent.change(purchaseDateInput, { target: { value: '2024-01-01' } });

      expect(purchaseDateInput.value).toBe('2024-01-01');
    });
  });

  // ==================== TEST 4: FORM VALIDATION ====================
  describe('Form Validation', () => {
    test('shows error when submitting without model', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByTestId('fancy-button')).toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng chọn mẫu xe')).toBeInTheDocument();
      });
    });

    test('shows error when submitting without license plate', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Select brand and model
      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1]; // Second select is model
      fireEvent.change(modelSelect, { target: { value: '1' } });

      // Submit without license plate
      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập biển số xe')).toBeInTheDocument();
      });
    });

    test('disables model select when no brand is selected', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Hãng xe')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1];
      expect(modelSelect).toBeDisabled();
    });

    test('enables model select after brand is selected', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        const modelSelect = screen.getAllByRole('combobox')[1];
        expect(modelSelect).not.toBeDisabled();
      });
    });
  });

  // ==================== TEST 5: FORM SUBMISSION - SUCCESS ====================
  describe('Form Submission - Success', () => {
    test('submits form successfully with valid data', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Fill form
      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1]; // Second select is model
      fireEvent.change(modelSelect, { target: { value: '1' } });

      const licensePlateInput = screen.getByPlaceholderText('VD: 29A-12345');
      fireEvent.change(licensePlateInput, { target: { value: '29A-12345' } });

      // Submit
      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vehicleAPI.addVehicle).toHaveBeenCalledWith({
          modelId: 1,
          licensePlate: '29A-12345',
          vin: null,
          color: null,
          purchaseDate: null,
          mileage: 0,
          insuranceNumber: null,
          insuranceExpiry: null,
          registrationExpiry: null
        });
      });
    });

    test('converts license plate to uppercase before submission', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Fill form
      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1]; // Second select is model
      fireEvent.change(modelSelect, { target: { value: '1' } });

      const licensePlateInput = screen.getByPlaceholderText('VD: 29A-12345');
      fireEvent.change(licensePlateInput, { target: { value: '29a-12345' } }); // lowercase

      // Submit
      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vehicleAPI.addVehicle).toHaveBeenCalledWith(
          expect.objectContaining({
            licensePlate: '29A-12345' // should be uppercase
          })
        );
      });
    });

    test('submits form with all optional fields filled', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Fill all fields
      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1]; // Second select is model
      fireEvent.change(modelSelect, { target: { value: '1' } });

      const licensePlateInput = screen.getByPlaceholderText('VD: 29A-12345');
      fireEvent.change(licensePlateInput, { target: { value: '29A-12345' } });

      const vinInput = screen.getByPlaceholderText('VD: 5YJ3E1EA1JF000123');
      fireEvent.change(vinInput, { target: { value: '5YJ3E1EA1JF000123' } });

      const colorInput = screen.getByPlaceholderText('VD: Đen, Trắng, Xanh');
      fireEvent.change(colorInput, { target: { value: 'Đen' } });

      const mileageInput = screen.getByPlaceholderText('0');
      fireEvent.change(mileageInput, { target: { value: '5000' } });

      const allDateInputs = screen.getAllByDisplayValue('');
      const purchaseDateInput = allDateInputs[0]; // First date input (Ngày mua)
      fireEvent.change(purchaseDateInput, { target: { value: '2024-01-01' } });

      const insuranceInput = screen.getByPlaceholderText('VD: BH123456');
      fireEvent.change(insuranceInput, { target: { value: 'BH123456' } });

      // Query again after first date changed
      const remainingDateInputs = screen.getAllByDisplayValue('');
      const insuranceExpiryInput = remainingDateInputs[0]; // Now first empty is insurance expiry
      fireEvent.change(insuranceExpiryInput, { target: { value: '2025-01-01' } });

      // Query again after second date changed
      const finalDateInputs = screen.getAllByDisplayValue('');
      const registrationExpiryInput = finalDateInputs[0]; // Now first empty is registration expiry
      fireEvent.change(registrationExpiryInput, { target: { value: '2025-06-01' } });

      // Submit
      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vehicleAPI.addVehicle).toHaveBeenCalledWith({
          modelId: 1,
          licensePlate: '29A-12345',
          vin: '5YJ3E1EA1JF000123',
          color: 'Đen',
          purchaseDate: '2024-01-01',
          mileage: 5000,
          insuranceNumber: 'BH123456',
          insuranceExpiry: '2025-01-01',
          registrationExpiry: '2025-06-01'
        });
      });
    });

    test('navigates to home page after successful submission', async () => {
      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Fill required fields
      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1]; // Second select is model
      fireEvent.change(modelSelect, { target: { value: '1' } });

      const licensePlateInput = screen.getByPlaceholderText('VD: 29A-12345');
      fireEvent.change(licensePlateInput, { target: { value: '29A-12345' } });

      // Submit
      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vehicleAPI.addVehicle).toHaveBeenCalled();
      });

      // Wait for navigate to be called (setTimeout 2000ms in component)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      }, { timeout: 3000 });
    });
  });

  // ==================== TEST 6: FORM SUBMISSION - ERROR ====================
  describe('Form Submission - Error', () => {
    test('displays error message when API fails', async () => {
      vehicleAPI.addVehicle.mockRejectedValue({
        response: {
          data: {
            message: 'License plate already exists'
          }
        }
      });

      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Fill form
      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1]; // Second select is model
      fireEvent.change(modelSelect, { target: { value: '1' } });

      const licensePlateInput = screen.getByPlaceholderText('VD: 29A-12345');
      fireEvent.change(licensePlateInput, { target: { value: '29A-12345' } });

      // Submit
      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('License plate already exists')).toBeInTheDocument();
      });
    });

    test('shows generic error when API error has no message', async () => {
      vehicleAPI.addVehicle.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Fill form
      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1]; // Second select is model
      fireEvent.change(modelSelect, { target: { value: '1' } });

      const licensePlateInput = screen.getByPlaceholderText('VD: 29A-12345');
      fireEvent.change(licensePlateInput, { target: { value: '29A-12345' } });

      // Submit
      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  // ==================== TEST 7: LOADING STATES ====================
  describe('Loading States', () => {
    test('disables submit button while submitting', async () => {
      vehicleAPI.addVehicle.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      // Fill form
      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Model 3 (2024)')).toBeInTheDocument();
      });

      const modelSelect = screen.getAllByRole('combobox')[1]; // Second select is model
      fireEvent.change(modelSelect, { target: { value: '1' } });

      const licensePlateInput = screen.getByPlaceholderText('VD: 29A-12345');
      fireEvent.change(licensePlateInput, { target: { value: '29A-12345' } });

      // Submit
      const submitButton = screen.getByTestId('fancy-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Đang đăng ký...')).toBeInTheDocument();
      });

      expect(submitButton).toBeDisabled();
    });

    test('shows error when no brands are available', async () => {
      carBrandAPI.getActiveBrands.mockResolvedValue({ data: [] });

      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('⚠️ Chưa có hãng xe nào. Vui lòng liên hệ admin.')).toBeInTheDocument();
      });
    });

    test('shows warning when brand has no models', async () => {
      carModelAPI.getModelsByBrand.mockResolvedValue({ data: [] });

      renderWithRouter(<RegisterVehicle />);

      await waitFor(() => {
        expect(screen.getByText('Tesla (USA)')).toBeInTheDocument();
      });

      const brandSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(brandSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('⚠️ Hãng xe này chưa có mẫu xe nào.')).toBeInTheDocument();
      });
    });
  });
});
