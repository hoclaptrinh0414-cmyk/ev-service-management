// src/components/FancyButton.jsx
import React from 'react';

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
    <>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`fancy-button ${className}`}
        style={{
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        {...props}
      >
        <span className="top-key" />
        <span className="text">{children}</span>
        <span className="bottom-key-1" />
        <span className="bottom-key-2" />
      </button>

      <style>{`
        .fancy-button {
          background-color: ${isDark ? 'transparent' : '#fff'};
          border: 2px solid ${isDark ? '#000' : '#007bff'};
          border-radius: 0;
          box-sizing: border-box;
          color: ${isDark ? '#000' : '#007bff'};
          cursor: pointer;
          display: inline-block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 0;
          outline: none;
          overflow: visible;
          padding: 0.7em 1.5em;
          position: relative;
          text-align: center;
          text-decoration: none;
          text-transform: none;
          transition: all 0.3s ease-in-out;
          user-select: none;
          font-size: 13px;
        }

        .fancy-button::before {
          content: " ";
          width: 1.5625rem;
          height: 2px;
          background: ${isDark ? 'black' : '#007bff'};
          top: 50%;
          left: 1.5em;
          position: absolute;
          transform: translateY(-50%);
          transform-origin: center;
          transition: background 0.3s linear, width 0.3s linear;
        }

        .fancy-button .text {
          font-size: 1em;
          line-height: 1.33333em;
          padding-left: 2em;
          display: block;
          text-align: left;
          transition: all 0.3s ease-in-out;
          text-transform: uppercase;
          text-decoration: none;
          color: ${isDark ? 'black' : '#007bff'};
        }

        .fancy-button .top-key {
          height: 2px;
          width: 1.5625rem;
          top: -2px;
          left: 0.625rem;
          position: absolute;
          background: ${isDark ? '#e8e8e8' : '#007bff'};
          transition: width 0.5s ease-out, left 0.3s ease-out;
        }

        .fancy-button .bottom-key-1 {
          height: 2px;
          width: 1.5625rem;
          right: 1.875rem;
          bottom: -2px;
          position: absolute;
          background: ${isDark ? '#e8e8e8' : '#007bff'};
          transition: width 0.5s ease-out, right 0.3s ease-out;
        }

        .fancy-button .bottom-key-2 {
          height: 2px;
          width: 0.625rem;
          right: 0.625rem;
          bottom: -2px;
          position: absolute;
          background: ${isDark ? '#e8e8e8' : '#007bff'};
          transition: width 0.5s ease-out, right 0.3s ease-out;
        }

        .fancy-button:hover:not(:disabled) {
          color: white;
          background: ${isDark ? 'black' : '#007bff'};
        }

        .fancy-button:hover:not(:disabled)::before {
          width: 0.9375rem;
          background: white;
        }

        .fancy-button:hover:not(:disabled) .text {
          color: white;
          padding-left: 1.5em;
        }

        .fancy-button:hover:not(:disabled) .top-key {
          left: -2px;
          width: 0px;
        }

        .fancy-button:hover:not(:disabled) .bottom-key-1,
        .fancy-button:hover:not(:disabled) .bottom-key-2 {
          right: 0;
          width: 0;
        }
      `}</style>
    </>
  );
};

export default FancyButton;
