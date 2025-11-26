// src/components/ChatWidget.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatWithAI } from "../services/aiChat";

const containerStyle = {
  position: "fixed",
  bottom: 20,
  right: 20,
  zIndex: 1200,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  fontFamily: '"Segoe UI", system-ui, sans-serif',
  alignItems: "flex-end",
};

const panelStyle = {
  width: 320,
  borderRadius: 14,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
  background: "#ffffff",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  maxHeight: "70vh",
};

const headerStyle = {
  background: "#0d6efd",
  color: "#ffffff",
  fontWeight: 700,
  padding: "12px 14px",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const bodyStyle = {
  padding: "12px 12px",
  fontSize: 13,
  color: "#1f1f1f",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const inputBarStyle = {
  borderTop: "1px solid #e8eaef",
  padding: "10px 12px",
  display: "flex",
  gap: 8,
  alignItems: "center",
  background: "#f8f9fb",
};

const toggleButtonStyle = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  background: "#28a745",
  color: "#fff",
  boxShadow: "0 6px 16px rgba(40, 167, 69, 0.4)",
};

const closeButtonStyle = {
  background: "rgba(255,255,255,0.16)",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "4px 8px",
  cursor: "pointer",
  fontWeight: 600,
};

const badgeStyle = {
  borderRadius: 8,
  padding: "6px 10px",
  maxWidth: "90%",
  lineHeight: 1.5,
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Bạn cần mình hỗ trợ gì? (đặt lịch, xem lịch, đăng ký xe, dịch vụ...)",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const listRef = useRef(null);
  const wrapperRef = useRef(null);

  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);

  const toggleLabel = useMemo(
    () => (isOpen ? "Close chat" : "Need help?"),
    [isOpen]
  );

  const appendMessage = (msg) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      // scroll to bottom on next tick
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 0);
      return next;
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    appendMessage({ sender: "user", text });
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithAI(text);
      const botText = res?.message || "Mình đang gặp lỗi, bạn thử lại nhé.";
      appendMessage({ sender: "bot", text: botText });

      if (res?.type === "navigation" && res.route) {
        // Điều hướng ngay sau khi hiển thị phản hồi
        setTimeout(() => navigate(res.route), 400);
      }
    } catch (err) {
      console.error("ChatWidget error:", err);
      appendMessage({
        sender: "bot",
        text: "Không thể kết nối trợ lý. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closePanel]);

  return (
    <div style={containerStyle} ref={wrapperRef}>
      {isOpen && (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span>Live support</span>
            <button type="button" onClick={closePanel} style={closeButtonStyle}>
              ✕
            </button>
          </div>
          <div style={bodyStyle} ref={listRef}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    m.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...badgeStyle,
                    background:
                      m.sender === "user" ? "#e7f5ff" : "#f1f3f5",
                    color: "#111",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={inputBarStyle}>
            <textarea
              rows={1}
              value={input}
              placeholder="Gõ câu hỏi của bạn..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                borderRadius: 10,
                border: "1px solid #d9d9d9",
                padding: "8px 10px",
                resize: "none",
                minHeight: 42,
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              style={{
                padding: "8px 14px",
                background: loading ? "#9ca3af" : "#0d6efd",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        style={toggleButtonStyle}
        onClick={isOpen ? closePanel : openPanel}
        aria-expanded={isOpen}
        aria-label="Toggle chat widget"
      >
        {toggleLabel}
      </button>
    </div>
  );
};

// Đóng khi click ra ngoài
ChatWidget.displayName = "ChatWidget";

export default ChatWidget;
