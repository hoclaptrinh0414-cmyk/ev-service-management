// src/components/ChatWidget.jsx
import React, { useCallback, useMemo, useState } from 'react';

const containerStyle = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1200,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  fontFamily: '"Segoe UI", system-ui, sans-serif',
  alignItems: 'flex-end',
};

const panelStyle = {
  width: 280,
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  background: '#ffffff',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle = {
  background: '#0d6efd',
  color: '#ffffff',
  fontWeight: 600,
  padding: '12px 14px',
  fontSize: 14,
};

const bodyStyle = {
  padding: '12px 14px',
  fontSize: 13,
  color: '#1f1f1f',
};

const footerStyle = {
  borderTop: '1px solid #e8eaef',
  padding: '10px 12px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
};

const buttonStyle = {
  padding: '10px 16px',
  borderRadius: 999,
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
};

const toggleButtonStyle = {
  ...buttonStyle,
  background: '#28a745',
  color: '#fff',
  boxShadow: '0 6px 16px rgba(40, 167, 69, 0.4)',
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: '#f1f3f5',
  color: '#343a40',
  flex: 1,
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleLabel = useMemo(
    () => (isOpen ? 'Close chat' : 'Need help?'),
    [isOpen],
  );

  return (
    <div style={containerStyle}>
      {isOpen && (
        <div style={panelStyle}>
          <div style={headerStyle}>Live support</div>
          <div style={bodyStyle}>
            <p style={{ margin: 0 }}>
              Our team responds within minutes. Share your question and we will
              get back to you shortly.
            </p>
          </div>
          <div style={footerStyle}>
            <button type="button" style={secondaryButtonStyle}>
              Send message
            </button>
            <button type="button" style={secondaryButtonStyle}>
              Request call
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        style={toggleButtonStyle}
        onClick={togglePanel}
        aria-expanded={isOpen}
        aria-label="Toggle chat widget"
      >
        {toggleLabel}
      </button>
    </div>
  );
};

export default ChatWidget;
