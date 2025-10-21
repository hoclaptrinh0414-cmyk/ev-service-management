import * as React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(
  (
    { className = '', variant = 'default', size = 'default', asChild = false, ...props },
    ref
  ) => {
    const variants = {
      default:
        'bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none',
      outline:
        'border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none',
      ghost:
        'bg-transparent hover:bg-neutral-100 disabled:opacity-50 disabled:pointer-events-none',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none',
    };
    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md',
      default: 'h-10 px-4 rounded-md',
      icon: 'h-10 w-10 rounded-md inline-flex items-center justify-center',
    };
    const Comp = asChild ? 'span' : 'button';
    return (
      <Comp
        ref={ref}
        className={cn('inline-flex items-center justify-center transition-colors', variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

