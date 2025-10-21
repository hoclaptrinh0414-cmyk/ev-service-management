import * as React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none',
      'placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-black',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

