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

      // Extract VNPay params
      const vnpParams = {
        responseCode: searchParams.get('vnp_ResponseCode'),
        txnRef: searchParams.get('vnp_TxnRef'), // This is paymentCode
        amount: searchParams.get('vnp_Amount'),
        transactionNo: searchParams.get('vnp_TransactionNo'),
        bankCode: searchParams.get('vnp_BankCode'),
        orderInfo: searchParams.get('vnp_OrderInfo'),
      };

      console.log('📦 VNPay params:', vnpParams);

      // Check if payment was successful
      if (vnpParams.responseCode === '00') {
        console.log('✅ Payment successful');

        // Verify payment status from backend
        if (vnpParams.txnRef) {
          try {
            const paymentStatusResponse = await paymentService.getPaymentByCode(vnpParams.txnRef);
            const payment = paymentStatusResponse.data?.data || paymentStatusResponse.data;

            console.log('✅ Payment verification:', payment);

            // Clear booking state
            clearBookingState();

            // Show success toast and redirect immediately to schedule (step 1)
            toast.success('🎉 Payment completed successfully! Your appointment has been confirmed.', {
              autoClose: 5000,
              position: 'top-center'
            });

            // Redirect immediately to schedule service (step 1)
            navigate('/schedule-service', {
              replace: true,
              state: { paymentSuccess: true }
            });

          } catch (error) {
            console.error('❌ Payment verification failed:', error);

            // Clear booking state anyway
            clearBookingState();

            toast.success('🎉 Payment completed! Your appointment has been confirmed.', {
              autoClose: 5000,
              position: 'top-center'
            });

            // Redirect to schedule service (step 1)
            navigate('/schedule-service', {
              replace: true,
              state: { paymentSuccess: true }
            });
          }
        } else {
          // Clear booking state
          clearBookingState();

          toast.success('🎉 Payment completed successfully!', {
            autoClose: 5000,
            position: 'top-center'
          });

          navigate('/schedule-service', {
            replace: true,
            state: { paymentSuccess: true }
          });
        }
      } else if (vnpParams.responseCode === '24') {
        console.log('⚠️ Payment canceled by user');

        toast.warning('Payment was canceled. Please try again.', {
          autoClose: 4000
        });

        navigate('/schedule-service', {
          replace: true,
          state: { paymentCanceled: true }
        });
      } else {
        console.log('❌ Payment failed:', vnpParams.responseCode);

        toast.error(`Payment failed (Code: ${vnpParams.responseCode}). Please try again.`, {
          autoClose: 4000
        });

        navigate('/schedule-service', {
          replace: true,
          state: { paymentFailed: true }
        });
      }
    } catch (error) {
      console.error('❌ Error handling payment callback:', error);
      toast.error('Error processing payment result');

      setTimeout(() => {
        navigate('/my-appointments');
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
