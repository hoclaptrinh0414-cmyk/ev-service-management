import * as React from 'react';

export const Form = ({ children, ...props }) => <form {...props}>{children}</form>;

export const FormItem = ({ className = '', children }) => (
  <div className={className}>{children}</div>
);

export const FormLabel = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
    {children}
  </label>
);

export const FormControl = ({ children }) => <div>{children}</div>;

export const FormMessage = ({ children }) => (
  <p className="mt-1 text-xs text-red-600" role="alert">
    {children}
  </p>
);

