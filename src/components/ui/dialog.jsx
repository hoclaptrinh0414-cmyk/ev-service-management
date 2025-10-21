import * as React from 'react';
import { cn } from '../../lib/utils';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange?.(false)} />
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
      className={cn('relative z-50 w-full max-w-2xl rounded-xl bg-white shadow-xl', className)}
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

