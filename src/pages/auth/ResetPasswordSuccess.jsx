// src/pages/auth/ResetPasswordSuccess.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const ResetPasswordSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const loginUrl =
    location.state?.loginUrl ||
    location.state?.LoginUrl ||
    '/login';

  return (
    <main
      className="min-vh-100 bg-neutral-100 d-flex flex-column align-items-center justify-content-center px-4"
      style={{ fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <Card className="w-full max-w-md border border-emerald-100 bg-white shadow-lg p-6 text-center">
        <CardHeader className="space-y-3">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="text-2xl font-semibold text-neutral-900">
            Mật khẩu đã được đặt lại!
          </h1>
          <p className="text-sm text-gray-500">
            Bạn có thể sử dụng mật khẩu mới để đăng nhập vào tài khoản của mình ngay bây giờ.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full bg-accent-600 hover:bg-accent-700"
            onClick={() => navigate(loginUrl, { replace: true })}
          >
            Đăng nhập ngay
          </Button>
          <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700 d-inline-block">
            Cần hỗ trợ khác? Quay lại trang Quên mật khẩu
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};

export default ResetPasswordSuccess;

