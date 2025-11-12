// __tests__/customer/RegisterForm.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../../src/components/customer/RegisterForm';
import { mockRegisterSuccess, mockRegisterFail } from '../../jest.mock-api';

describe('RegisterForm - Đăng ký khách hàng', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('hiển thị form đăng ký', () => {
    render(<RegisterForm />);
    expect(screen.getByText(/đăng ký/i)).toBeInTheDocument();
  });

  test('đăng ký thành công', async () => {
    mockRegisterSuccess();

    render(<RegisterForm />);
    await userEvent.click(screen.getByRole('button', { name: /đăng ký/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('lỗi khi email đã tồn tại', async () => {
    mockRegisterFail();

    render(<RegisterForm />);
    await userEvent.click(screen.getByRole('button', { name: /đăng ký/i }));

    expect(await screen.findByText(/email đã tồn tại/i)).toBeInTheDocument();
  });
});