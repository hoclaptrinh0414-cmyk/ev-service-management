import * as React from 'react';
import { cn } from '../../lib/utils';

export const Breadcrumb = ({ children, className = '', ...props }) => (
  <nav aria-label="Breadcrumb" className={cn('text-sm text-neutral-600', className)} {...props}>
    <ol className="flex items-center gap-2">{children}</ol>
  </nav>
);

export const BreadcrumbItem = ({ children, className = '' }) => (
  <li className={cn('flex items-center gap-2', className)}>{children}</li>
);

export const BreadcrumbLink = ({ children, className = '', ...props }) => (
  <a className={cn('hover:underline text-neutral-700', className)} {...props}>
    {children}
  </a>
);

export const BreadcrumbSeparator = () => (
  <span aria-hidden className="text-neutral-400">/</span>
);

export const BreadcrumbPage = ({ children, className = '' }) => (
  <span className={cn('font-medium text-neutral-900', className)}>{children}</span>
);

