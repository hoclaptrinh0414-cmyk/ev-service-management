// src/components/FancyButton.jsx
import React from 'react';
import './FancyButton.css';

const FancyButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "dark", // dark or light
  className = "",
  fullWidth = false,
  ...props
}) => {
  const isDark = variant === "dark";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`fancy-button ${isDark ? 'fancy-button-dark' : 'fancy-button-light'} ${className}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      {...props}
    >
      <span className="fancy-button-top-key" />
      <span className="fancy-button-text">{children}</span>
      <span className="fancy-button-bottom-key-1" />
      <span className="fancy-button-bottom-key-2" />
    </button>
  );
};

export default FancyButton;
