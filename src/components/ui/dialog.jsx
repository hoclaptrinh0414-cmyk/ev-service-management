import * as React from 'react';
import { cn } from '../../lib/utils';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000
        }}
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  );
};

export const DialogContent = ({ className = '', onEscapeKeyDown, onPointerDownOutside, children, ...props }) => {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onEscapeKeyDown?.(e);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onEscapeKeyDown]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'relative',
        zIndex: 10001,
        width: '100%',
        maxWidth: '42rem',
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      className={className}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onPointerDownOutside?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ className = '', children }) => (
  <div className={cn('border-b px-6 py-4', className)}>{children}</div>
);
export const DialogTitle = ({ className = '', children }) => (
  <h2 className={cn('text-xl font-semibold', className)}>{children}</h2>
);
export const DialogFooter = ({ className = '', children }) => (
  <div className={cn('sticky bottom-0 flex items-center justify-end gap-2 border-t bg-white px-6 py-4', className)}>
    {children}
  </div>
);

