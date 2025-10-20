import * as React from 'react';
import { cn } from '../../lib/utils';

export const Textarea = React.forwardRef(({ className = '', rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none',
      'placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-black',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

