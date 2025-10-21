import * as React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-neutral-200 bg-white shadow-lg',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = ({ className = '', ...props }) => (
  <div className={cn('space-y-1.5 text-center', className)} {...props} />
);

export const CardContent = ({ className = '', ...props }) => (
  <div className={cn('space-y-4', className)} {...props} />
);

export const CardFooter = ({ className = '', ...props }) => (
  <div className={cn('flex items-center justify-center', className)} {...props} />
);
