import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';

const ICON_MAP = {
  warning: { Icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  info: { Icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  success: { Icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
  danger: { Icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' },
  logout: { Icon: LogOut, color: 'text-orange-500', bgColor: 'bg-orange-50' },
};

/**
 * Beautiful Confirmation Dialog
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Callback when dialog state changes
 * @param {function} onConfirm - Callback when user confirms
 * @param {function} onCancel - Callback when user cancels
 * @param {string} title - Dialog title
 * @param {string} description - Dialog description
 * @param {string} confirmText - Confirm button text (default: "Confirm")
 * @param {string} cancelText - Cancel button text (default: "Cancel")
 * @param {string} variant - Icon variant: warning, info, success, danger, logout (default: "warning")
 * @param {boolean} loading - Show loading state on confirm button
 */
const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
}) => {
  const { Icon, color, bgColor } = ICON_MAP[variant] || ICON_MAP.warning;

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" style={{ zIndex: 10001 }}>
        {/* Icon Section */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4">
          <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>

          {/* Title */}
          <DialogTitle className="text-center text-xl font-bold mb-2">
            {title}
          </DialogTitle>

          {/* Description */}
          <p className="text-center text-gray-600 text-sm max-w-xs">
            {description}
          </p>
        </div>

        {/* Actions */}
        <DialogFooter className="border-t-0 pt-0 pb-6" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '16px 24px' }}>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '25px',
              border: 'none',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#e5e7eb')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#f3f4f6')}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: variant === 'danger' || variant === 'logout' ? '#ef4444'
                : variant === 'success' ? '#10b981'
                : '#000000',
              color: '#ffffff',
              borderRadius: '25px',
              border: 'none',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (loading) return;
              if (variant === 'danger' || variant === 'logout') {
                e.target.style.backgroundColor = '#dc2626';
              } else if (variant === 'success') {
                e.target.style.backgroundColor = '#059669';
              } else {
                e.target.style.backgroundColor = '#1f1f1f';
              }
            }}
            onMouseLeave={(e) => {
              if (loading) return;
              if (variant === 'danger' || variant === 'logout') {
                e.target.style.backgroundColor = '#ef4444';
              } else if (variant === 'success') {
                e.target.style.backgroundColor = '#10b981';
              } else {
                e.target.style.backgroundColor = '#000000';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ animation: 'spin 1s linear infinite', height: '16px', width: '16px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
