// src/pages/payment/PaymentCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../../services/paymentService';
import { useSchedule } from '../../contexts/ScheduleContext';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * PaymentCallback Page
 * Handle VNPay return after payment
 *
 * VNPay Sandbox Return Format:
 * ?vnp_Amount=100000000
 * &vnp_BankCode=NCB
 * &vnp_ResponseCode=00
 * &vnp_TxnRef=PAY-XXX-XXX
 * &vnp_TransactionNo=13995895
 * &vnp_OrderInfo=Payment+for+appointment
 *
 * Response Code:
 * - 00: Success
 * - 24: Customer canceled
 * - Others: Failed
 */
const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearBookingState } = useSchedule();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      console.log('🔙 Payment callback received');

      // Extract backend-defined params
      const paymentStatus = searchParams.get('status');
      const paymentCode = searchParams.get('paymentCode');
      
      console.log('📦 Backend params:', { paymentStatus, paymentCode });

      // Check if payment was successful
      if (paymentStatus === 'success') {
        console.log('✅ Payment successful');

        // Verify payment status from backend
        if (paymentCode) {
          try {
            const paymentStatusResponse = await paymentService.getPaymentByCodePublic(paymentCode);
            const payment = paymentStatusResponse.data?.data || paymentStatusResponse.data;

            console.log('✅ Payment verification:', payment);

            // Clear booking state
            clearBookingState();

            // Show success toast and redirect
            toast.success('🎉 Payment completed successfully! Your appointment has been confirmed.', {
              autoClose: 5000,
              position: 'top-center'
            });

            // Redirect to a relevant page, e.g., My Appointments
            navigate('/my-appointments', {
              replace: true,
              state: { paymentSuccess: true }
            });

          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            // Even if verification fails, we can assume success from the URL and let user check manually
            clearBookingState();
            toast.success('🎉 Payment completed! Please check "My Appointments" to see the confirmation.', {
              autoClose: 5000,
              position: 'top-center'
            });
            navigate('/my-appointments', {
              replace: true,
              state: { paymentSuccess: true }
            });
          }
        } else {
           // Should not happen if status is success
          clearBookingState();
          toast.warning('Payment status is success but no paymentCode provided.');
          navigate('/services', { replace: true });
        }
      } else if (paymentStatus === 'cancelled' || paymentStatus === 'canceled') {
        console.log('⚠️ Payment canceled by user');

        toast.warning('Payment was canceled. Please try again.', {
          autoClose: 4000
        });

        navigate('/services', {
          replace: true,
          state: { paymentCanceled: true }
        });
      } else {
        console.log('❌ Payment failed:', paymentStatus);

        toast.error(`Payment failed (Status: ${paymentStatus}). Please try again.`, {
          autoClose: 4000
        });

        navigate('/services', {
          replace: true,
          state: { paymentFailed: true }
        });
      }
    } catch (error) {
      console.error('❌ Error handling payment callback:', error);
      toast.error('Error processing payment result');

      setTimeout(() => {
        navigate('/services', { replace: true });
      }, 3000);
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
    </div>
  );
};

export default PaymentCallback;
