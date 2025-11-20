// src/pages/payment/PaymentCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import { useSchedule } from '../../contexts/ScheduleContext';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * PaymentCallback Page
 * Handle VNPay return after payment
 */
const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearBookingState } = useSchedule();
  const [popup, setPopup] = useState({
    show: false,
    title: '',
    message: '',
    variant: 'success',
  });

  useEffect(() => {
    handlePaymentCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentCallback = async () => {
    try {
      console.log('Payment callback received');

      const paymentStatus = searchParams.get('status');
      const paymentCode = searchParams.get('paymentCode');

      console.log('Callback params:', { paymentStatus, paymentCode });

      if (paymentStatus === 'success') {
        console.log('Payment successful');

        if (paymentCode) {
          try {
            const paymentStatusResponse = await paymentService.getPaymentByCodePublic(paymentCode);
            const payment = paymentStatusResponse.data?.data || paymentStatusResponse.data;

            console.log('Payment verification:', payment);

            clearBookingState();

            setPopup({
              show: true,
              title: 'Thanh toan thanh cong',
              message: 'Cuoc hen cua ban da duoc xac nhan. Dang chuyen den Lich hen cua toi.',
              variant: 'success',
            });

            setTimeout(() => {
              navigate('/my-appointments', {
                replace: true,
                state: { paymentSuccess: true },
              });
            }, 1800);
          } catch (error) {
            console.error('Payment verification failed:', error);
            clearBookingState();
            setPopup({
              show: true,
              title: 'Thanh toan da hoan tat',
              message: 'Khong xac minh duoc tren may chu. Vui long kiem tra o "Lich hen cua toi".',
              variant: 'warning',
            });
            setTimeout(() => {
              navigate('/my-appointments', {
                replace: true,
                state: { paymentSuccess: true },
              });
            }, 1800);
          }
        } else {
          clearBookingState();
          setPopup({
            show: true,
            title: 'Thieu ma thanh toan',
            message: 'Thanh toan thanh cong nhung khong nhan duoc ma. Vui long kiem tra lai lich hen.',
            variant: 'warning',
          });
          setTimeout(() => {
            navigate('/services', { replace: true });
          }, 2000);
        }
      } else if (paymentStatus === 'cancelled' || paymentStatus === 'canceled') {
        console.log('Payment canceled by user');

        setPopup({
          show: true,
          title: 'Thanh toan bi huy',
          message: 'Ban da huy thanh toan. Vui long thu lai.',
          variant: 'warning',
        });

        setTimeout(() => {
          navigate('/services', {
            replace: true,
            state: { paymentCanceled: true },
          });
        }, 2000);
      } else {
        console.log('Payment failed:', paymentStatus);

        setPopup({
          show: true,
          title: 'Thanh toan that bai',
          message: `Trang thai: ${paymentStatus || 'unknown'}. Vui long thu lai.`,
          variant: 'danger',
        });

        setTimeout(() => {
          navigate('/services', {
            replace: true,
            state: { paymentFailed: true },
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      setPopup({
        show: true,
        title: 'Loi xu ly ket qua thanh toan',
        message: 'Vui long thu lai hoac kiem tra trong "Lich hen cua toi".',
        variant: 'danger',
      });

      setTimeout(() => {
        navigate('/services', { replace: true });
      }, 3000);
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
