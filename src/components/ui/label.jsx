import * as React from 'react';
import { cn } from '../../lib/utils';

export const Label = ({ className = '', ...props }) => (
  <label className={cn('text-sm font-medium text-neutral-700', className)} {...props} />
);

