import React from 'react';

const Button = ({
  children,
  variant = 'default',
  iconLeft,
  iconRight,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default: "bg-black text-white hover:bg-gray-800",
    outline: "border-2 border-black bg-transparent text-black hover:bg-black hover:text-white",
    ghost: "bg-transparent text-black hover:bg-gray-100"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;
