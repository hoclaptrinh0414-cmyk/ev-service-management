import React, { useState } from 'react';
import { emailVerificationAPI } from '../services/api';

const EmailVerificationModal = ({ show, onHide, email }) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success', 'error', 'warning'

  const showResendSuccess = (result) => {
    setStatusType('success');
    let message = `
      <div class="success-message">
        <h4>✅ Email đã được gửi!</h4>
        <p>${result.message || 'Email xác minh đã được gửi thành công'}</p>
    `;
    if (result.data?.instructions) {
      message += '<ul>' + result.data.instructions.map(i => `<li>${i}</li>`).join('') + '</ul>';
    }
    message += '</div>';
    setStatusMessage(message);
  };

  const showResendError = (result) => {
    setStatusType('error');
    setStatusMessage(`
      <div class="error-message">
        <h4>❌ Không thể gửi email</h4>
        <p>${result.message || 'Vui lòng thử lại sau'}</p>
      </div>
    `);
  };

  const showEmailVerified = () => {
    setStatusType('success');
    setStatusMessage(`
      <div class="success-message">
        <h4>🎉 Email đã được xác thực!</h4>
        <p>Bạn có thể đóng cửa sổ này và đăng nhập lại.</p>
        <button onclick="closeModalAndRetry()" class="btn btn-success">
          🔄 Đăng nhập lại
        </button>
      </div>
    `);
  };

  const showEmailNotVerified = (result) => {
    setStatusType('warning');
    setStatusMessage(`
      <div class="warning-message">
        <h4>⏳ Email chưa được xác thực</h4>
        <p>${result.data?.nextStep || result.message || 'Vui lòng kiểm tra email và xác thực tài khoản'}</p>
      </div>
    `);
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      setStatusType('error');
      setStatusMessage('<div class="error-message"><h4>❌ Lỗi</h4><p>Email không hợp lệ</p></div>');
      return;
    }

    setResendLoading(true);
    setStatusMessage('');

    try {
      const response = await emailVerificationAPI.resendVerification(email);
      console.log('Resend success:', response);
      showResendSuccess(response);
    } catch (error) {
      console.error('Resend error:', error);
      const errorData = error.response?.data || { message: 'Có lỗi xảy ra khi gửi email' };
      showResendError(errorData);
    } finally {
      setResendLoading(false);
    }
  };

  const checkEmailStatus = async () => {
    if (!email) {
      setStatusType('error');
      setStatusMessage('<div class="error-message"><h4>❌ Lỗi</h4><p>Email không hợp lệ</p></div>');
      return;
    }

    setCheckLoading(true);

    try {
      const response = await emailVerificationAPI.checkEmailStatus(email);
      console.log('Check status success:', response);
      
      if (response.data?.isVerified || response.isVerified) {
        showEmailVerified();
      } else {
        showEmailNotVerified(response);
      }
    } catch (error) {
      console.error('Check status error:', error);
      setStatusType('error');
      setStatusMessage(`
        <div class="error-message">
          <h4>❌ Không thể kiểm tra trạng thái</h4>
          <p>Vui lòng thử lại sau</p>
        </div>
      `);
    } finally {
      setCheckLoading(false);
    }
  };

  const closeModalAndRetry = () => {
    onHide();
    // Có thể focus vào form login hoặc reload page
    window.location.reload();
  };

  // Make closeModalAndRetry available globally for the button in statusMessage
  window.closeModalAndRetry = closeModalAndRetry;

  if (!show) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>📧 Xác thực Email</h3>
          <span className="close" onClick={onHide}>&times;</span>
        </div>

        <div className="modal-body">
          <div className="verification-info">
            <p><strong>Email chưa được xác thực!</strong></p>
            <p>Bạn cần xác thực email trước khi đăng nhập.</p>

            <div className="instructions">
              <h4>Hướng dẫn:</h4>
              <ul>
                <li>Kiểm tra hộp thư email của bạn</li>
                <li>Tìm email từ EV Service Center</li>
                <li>Click vào link xác thực trong email</li>
                <li>Quay lại để đăng nhập</li>
              </ul>
            </div>

            <div className="verification-actions">
              <button 
                className="btn btn-primary"
                onClick={resendVerificationEmail}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    ⏳ Đang gửi...
                  </>
                ) : (
                  '📤 Gửi lại Email xác thực'
                )}
              </button>

              <button 
                className="btn btn-secondary"
                onClick={checkEmailStatus}
                disabled={checkLoading}
              >
                {checkLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    🔍 Đang kiểm tra...
                  </>
                ) : (
                  '🔍 Kiểm tra trạng thái'
                )}
              </button>

              <button 
                className="btn btn-light"
                onClick={onHide}
              >
                Đóng
              </button>
            </div>

            {statusMessage && (
              <div 
                className={`status-message ${statusType}`}
                dangerouslySetInnerHTML={{ __html: statusMessage }}
              />
            )}
          </div>
        </div>
      </div>

  <style>{`
        .modal {
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.3s;
        }

        .modal-content {
          background-color: #fff;
          margin: 10% auto;
          padding: 0;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s;
        }

        .modal-header {
          padding: 20px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.2em;
        }

        .close {
          font-size: 24px;
          cursor: pointer;
          background: none;
          border: none;
          color: white;
        }

        .modal-body {
          padding: 20px;
        }

        .verification-info {
          text-align: center;
        }

        .instructions {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          text-align: left;
        }

        .instructions ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .instructions li {
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .verification-actions {
          margin-top: 20px;
        }

        .btn {
          padding: 10px 20px;
          margin: 5px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-success {
          background-color: #28a745;
          color: white;
        }

        .btn-light {
          background-color: #f8f9fa;
          color: #333;
          border: 1px solid #ddd;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .status-message {
          margin-top: 15px;
          padding: 15px;
          border-radius: 6px;
          animation: slideDown 0.3s;
        }

        .status-message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .status-message.warning {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 576px) {
          .modal-content {
            width: 95%;
            margin: 5% auto;
          }

          .btn {
            display: block;
            width: 100%;
            margin: 5px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailVerificationModal;