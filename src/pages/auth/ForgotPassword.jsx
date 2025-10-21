// src/pages/auth/ForgotPassword.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader2 } from 'lucide-react';

import authService from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const validationSchema = yup.object({
  email: yup
    .string()
    .required('Email là bắt buộc.')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Vui lòng nhập email hợp lệ.'),
});

const ForgotPassword = () => {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    trigger,
    getFieldState,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const emailRegister = register('email');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const valid = await trigger('email');
    if (!valid) {
      const fieldError = getFieldState('email').error?.message;
      const validationMessage = fieldError || 'Vui lòng nhập email hợp lệ.';
      setError(validationMessage);
      toast.error(validationMessage);
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const validationMessage = 'Vui lòng nhập email hợp lệ.';
      setError(validationMessage);
      toast.error(validationMessage);
      setLoading(false);
      return;
    }

    try {
      console.log('📧 Sending forgot password request for:', email);
      const response = await authService.forgotPassword(email);
      console.log('✅ Forgot password response:', response);

      if (response.success) {
        const successMessage =
          'Yêu cầu đã được gửi. Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn trong vài phút. Vui lòng kiểm tra hộp thư (kể cả mục Spam).';
        setSuccess(successMessage);
        toast.success('Đã gửi hướng dẫn đặt lại mật khẩu!');
        setEmail('');
        setValue('email', '');
        setCooldown(60);
      } else {
        const message = response.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error('❌ Forgot password error:', err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else if (err.message === 'Network error - Cannot connect to server') {
        const networkMessage =
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        setError(networkMessage);
        toast.error(networkMessage);
      } else if (err.message === 'Request timeout') {
        const timeoutMessage = 'Kết nối bị gián đoạn. Vui lòng thử lại.';
        setError(timeoutMessage);
        toast.error(timeoutMessage);
      } else {
        const fallbackMessage = err.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

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
              alt="Tesla Model S"
              className="img-fluid"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>

          <div className="col-lg-5 d-flex align-items-center justify-content-center bg-white py-5">
            <div className="w-100 px-4 px-sm-5" style={{ maxWidth: '420px' }}>
              <Card className="border-0 shadow-none">
                <CardHeader className="space-y-3 text-center">
                  <h1 className="text-2xl font-semibold text-neutral-900">
                    Quên Mật Khẩu
                  </h1>
                  <p className="text-sm leading-6 text-gray-500">
                    Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {success && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 text-start"
                    >
                      {success}
                    </div>
                  )}

                  {error && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 text-start"
                    >
                      {error}
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2 text-start">
                      <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        name={emailRegister.name}
                        ref={emailRegister.ref}
                        onBlur={(event) => emailRegister.onBlur(event)}
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          emailRegister.onChange(event);
                        }}
                        placeholder="nhapemail@example.com"
                        autoComplete="email"
                        disabled={loading}
                        className={`h-11 rounded-lg border border-neutral-200 bg-white px-4 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-accent-600 ${
                          errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || cooldown > 0 || !isValid}
                      className="h-11 w-full rounded-lg bg-accent-600 text-white font-medium transition hover:bg-accent-700 focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : cooldown > 0 ? (
                        `Thử lại sau ${cooldown}s`
                      ) : (
                        'Gửi Hướng Dẫn'
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

export default ForgotPassword;

