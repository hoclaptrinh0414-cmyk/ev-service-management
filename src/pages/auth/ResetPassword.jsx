// src/pages/auth/ResetPassword.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader2, ShieldCheck } from 'lucide-react';

import authService from '../../services/authService';
import { accountRecoveryService } from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const passwordSchema = yup.object({
  newPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu mới.')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
    .matches(/[A-Z]/, 'Phải chứa ít nhất một chữ hoa.')
    .matches(/[a-z]/, 'Phải chứa ít nhất một chữ thường.')
    .matches(/\d/, 'Phải chứa ít nhất một chữ số.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Phải chứa ít nhất một ký tự đặc biệt.'),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu.')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp.'),
});

const REQUIREMENTS = [
  'Tối thiểu 8 ký tự',
  'Ít nhất 1 chữ hoa',
  'Ít nhất 1 chữ thường',
  'Ít nhất 1 chữ số',
  'Ít nhất 1 ký tự đặc biệt',
];

const ResetPassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [status, setStatus] = useState('validating'); // validating | ready | invalid
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const passwordRegister = register('newPassword');
  const confirmPasswordRegister = register('confirmPassword');

  useEffect(() => {
    let isMounted = true;

    const validateLink = async () => {
      if (!token || !email) {
        setStatus('invalid');
        setStatusMessage('Liên kết không hợp lệ hoặc đã hết hạn.');
        return;
      }

      try {
        await accountRecoveryService.validateResetToken(token, email);
        if (isMounted) {
          setStatus('ready');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Validate reset token error:', error);
        const message =
          error.response?.data?.message ||
          'Liên kết không hợp lệ hoặc đã hết hạn.';
        setStatus('invalid');
        setStatusMessage(message);
      }
    };

    validateLink();

    return () => {
      isMounted = false;
    };
  }, [token, email]);

  const onSubmit = async (values) => {
    if (!email || !token) {
      setServerError('Thiếu thông tin token hoặc email.');
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const response = await authService.resetPassword(
        email,
        token,
        values.newPassword,
        values.confirmPassword
      );

      const loginUrl =
        response?.loginUrl ||
        response?.LoginUrl ||
        response?.data?.loginUrl ||
        '/login';

      toast.success('Mật khẩu đã được đặt lại thành công!');
      reset();
      navigate('/reset-password-success', {
        replace: true,
        state: { loginUrl },
      });
    } catch (error) {
      console.error('Reset password error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Có lỗi xảy ra, vui lòng thử lại.';
      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderValidationState = () => (
    <div className="d-flex flex-column align-items-center justify-content-center text-center min-vh-100 gap-3 bg-neutral-100">
      <Loader2 className="h-10 w-10 animate-spin text-accent-600" />
      <p className="text-muted mb-0">Đang kiểm tra link...</p>
    </div>
  );

  const renderInvalidState = () => (
    <div className="min-vh-100 bg-neutral-100 d-flex flex-column align-items-center justify-content-center px-4">
      <Card className="w-full max-w-md border border-red-100 bg-white shadow-lg p-6 text-center">
        <CardHeader className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Liên kết không hợp lệ
          </h1>
          <p className="text-sm text-gray-500">{statusMessage}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full bg-accent-600 hover:bg-accent-700">
            <Link to="/forgot-password">Yêu cầu link mới</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (status === 'validating') {
    return renderValidationState();
  }

  if (status === 'invalid') {
    return renderInvalidState();
  }

  return (
    <main
      className="min-vh-100 bg-neutral-100"
      style={{ fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="container-fluid p-0 min-vh-100">
        <div className="row g-0 min-vh-100">
          <div className="col-lg-7 d-none d-lg-block">
            <img
              src="https://tsportline.com/cdn/shop/files/black-tesla-model-s-21-inch-aftermarket-wheels-tss-gloss-black-rear-1920-2_1600x.png?v=1680200206"
              alt="Reset password illustration"
              className="img-fluid"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>

          <div className="col-lg-5 d-flex align-items-center justify-content-center bg-white py-5">
            <div className="w-100 px-4 px-sm-5" style={{ maxWidth: '420px' }}>
              <Card className="border-0 shadow-none">
                <CardHeader className="space-y-3 text-center">
                  <ShieldCheck className="mx-auto h-10 w-10 text-accent-600" />
                  <h1 className="text-2xl font-semibold text-neutral-900">
                    Tạo Mật Khẩu Mới
                  </h1>
                  <p className="text-sm leading-6 text-gray-500">
                    Mật khẩu mới sẽ thay thế mật khẩu cũ cho tài khoản{' '}
                    <strong>{email}</strong>.
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {serverError && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                      {serverError}
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2 text-start">
                      <Label htmlFor="newPassword" className="text-sm font-medium text-neutral-700">
                        Mật khẩu mới
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Nhập mật khẩu mới"
                        disabled={loading}
                        name={passwordRegister.name}
                        ref={passwordRegister.ref}
                        onBlur={passwordRegister.onBlur}
                        onChange={(event) => {
                          passwordRegister.onChange(event);
                        }}
                        className={`h-11 rounded-lg border border-neutral-200 bg-white px-4 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-accent-600 ${
                          errors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.newPassword && (
                        <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 text-start">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                        Xác nhận mật khẩu mới
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu mới"
                        disabled={loading}
                        name={confirmPasswordRegister.name}
                        ref={confirmPasswordRegister.ref}
                        onBlur={confirmPasswordRegister.onBlur}
                        onChange={(event) => {
                          confirmPasswordRegister.onChange(event);
                        }}
                        className={`h-11 rounded-lg border border-neutral-200 bg-white px-4 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-accent-600 ${
                          errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-start">
                      <p className="text-sm font-semibold text-neutral-700 mb-2">
                        Mật khẩu mới phải bao gồm:
                      </p>
                      <ul className="list-unstyled mb-0 text-sm text-neutral-600">
                        {REQUIREMENTS.map((item) => (
                          <li key={item} className="d-flex align-items-start gap-2 mb-1">
                            <span className="mt-1 h-1 w-1 rounded-circle bg-accent-600 d-inline-block"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !isValid}
                      className="h-11 w-full rounded-lg bg-accent-600 text-white font-medium transition hover:bg-accent-700 focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang đặt lại...
                        </>
                      ) : (
                        'Đặt Lại Mật Khẩu'
                      )}
                    </Button>
                  </form>

                  <div className="pt-2 text-center">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-500 transition hover:text-gray-700"
                    >
                      ← Quay lại trang Đăng nhập
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
