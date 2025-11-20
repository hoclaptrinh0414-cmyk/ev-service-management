// src/pages/payment/PaymentCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import { useSchedule } from '../../contexts/ScheduleContext';
import 'bootstrap/dist/css/bootstrap.min.css';

// Trang callback thanh toan VNPay
const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearBookingState } = useSchedule();
  const [popup, setPopup] = useState({ show: false, title: '', message: '', variant: 'success' });
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    handlePaymentCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPaymentStatus = async (paymentCode, attempt = 0) => {
    const maxAttempts = 5;
    const retryDelay = 3000;
    try {
      const res = await paymentService.getPaymentByCodePublic(paymentCode);
      const payment = res.data?.data || res.data;
      const status = String(payment?.status || '').toLowerCase();
      console.log('Payment verification:', { status, payment });

      if (status === 'completed' || status === 'success') {
        clearBookingState();
        localStorage.removeItem('lastPaymentCode');
        setPopup({
          show: true,
          title: 'Thanh toan thanh cong',
          message: 'Cuoc hen cua ban da duoc xac nhan. Dang chuyen den Lich hen cua toi.',
          variant: 'success',
        });
        setTimeout(() => {
          navigate('/my-appointments', { replace: true, state: { paymentSuccess: true } });
        }, 1800);
        return;
      }

      if (status === 'pending' && attempt < maxAttempts) {
        setPopup({
          show: true,
          title: 'Dang xac thuc thanh toan',
          message: 'Giao dich dang duoc xu ly, vui long cho trong giay lat...',
          variant: 'warning',
        });
        setTimeout(() => verifyPaymentStatus(paymentCode, attempt + 1), retryDelay);
        return;
      }

      setPopup({
        show: true,
        title: 'Thanh toan that bai',
        message: `Trang thai: ${payment?.status || 'unknown'}. Vui long thu lai hoac lien he ho tro.`,
        variant: 'danger',
      });
      localStorage.removeItem('lastPaymentCode');
      setTimeout(() => navigate('/services', { replace: true }), 2500);
    } catch (error) {
      console.error('Payment verification failed:', error);
      if (attempt < maxAttempts) {
        setPopup({
          show: true,
          title: 'Dang xac thuc thanh toan',
          message: 'Co loi mang hoac may chu. Thu lai sau giay lat...',
          variant: 'warning',
        });
        setTimeout(() => verifyPaymentStatus(paymentCode, attempt + 1), retryDelay);
        return;
      }
      setPopup({
        show: true,
        title: 'Loi xac thuc thanh toan',
        message: 'Vui long thu lai hoac kiem tra trong "Lich hen cua toi".',
        variant: 'danger',
      });
      localStorage.removeItem('lastPaymentCode');
      setTimeout(() => navigate('/services', { replace: true }), 2500);
    }
  };

  const handlePaymentCallback = async () => {
    try {
      console.log('Payment callback received');

      const paymentStatus = searchParams.get('status');
      const rawCodeParam =
        searchParams.get('paymentCode') ||
        searchParams.get('code') ||
        '';
      const fallbackCode = localStorage.getItem('lastPaymentCode') || '';

      // VNPay có thể trả về numeric TxnRef; chỉ dùng nếu giống dạng PAY-xxxx
      const normalizeCode = (val) => {
        if (!val) return '';
        const trimmed = String(val).trim();
        if (/^PAY-/i.test(trimmed)) return trimmed;
        return '';
      };

      const normalizedParamCode = normalizeCode(rawCodeParam);
      const paymentCode = normalizedParamCode || normalizeCode(fallbackCode);

      console.log('Callback params:', {
        paymentStatus,
        paymentCodeFromUrl: rawCodeParam,
        paymentCodeUsed: paymentCode,
        fallbackCode,
      });

      if (paymentStatus === 'success') {
        if (!paymentCode) {
          clearBookingState();
          setPopup({
            show: true,
            title: 'Thieu ma thanh toan',
            message: 'Ko tim duoc paymentCode (PAY-...). Vui long kiem tra trong \"Lich hen cua toi\".',
            variant: 'warning',
          });
          setTimeout(() => navigate('/services', { replace: true }), 2000);
          return;
        }

        await verifyPaymentStatus(paymentCode);
      } else if (paymentStatus === 'cancelled' || paymentStatus === 'canceled') {
        setPopup({
          show: true,
          title: 'Thanh toan bi huy',
          message: 'Ban da huy thanh toan. Vui long thu lai.',
          variant: 'warning',
        });
        setTimeout(() => navigate('/services', { replace: true, state: { paymentCanceled: true } }), 2000);
      } else {
        setPopup({
          show: true,
          title: 'Thanh toan that bai',
          message: `Trang thai: ${paymentStatus || 'unknown'}. Vui long thu lai.`,
          variant: 'danger',
        });
        setTimeout(() => navigate('/services', { replace: true, state: { paymentFailed: true } }), 2000);
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      setPopup({
        show: true,
        title: 'Loi xu ly ket qua thanh toan',
        message: 'Vui long thu lai hoac kiem tra trong "Lich hen cua toi".',
        variant: 'danger',
      });
      setTimeout(() => navigate('/services', { replace: true }), 3000);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-callback-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-5">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Processing...</span>
                </div>
                <h4 className="mb-2">Processing Payment...</h4>
                <p className="text-muted">Please wait while we verify your payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {popup.show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1050 }}
        >
          <div className="card shadow-lg" style={{ minWidth: '320px', borderRadius: '12px' }}>
            <div
              className={`card-header text-white bg-${popup.variant}`}
              style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
            >
              <strong>{popup.title}</strong>
            </div>
            <div className="card-body">
              <p className="mb-0">{popup.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;
