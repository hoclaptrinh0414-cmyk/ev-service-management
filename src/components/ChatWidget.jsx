import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { chatWithAI } from "../services/aiChat";

const ChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: "ai", text: "Xin chào! Mình có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (open && inputRef.current) {
      try {
        inputRef.current.focus();
      } catch (e) {}
    }
  }, [open, messages]);

  // Close when clicking outside
  useEffect(() => {
    const onPointerDown = (e) => {
      if (!open) return;
      const panel = panelRef.current;
      const toggle = toggleRef.current;
      if (
        panel &&
        !panel.contains(e.target) &&
        toggle &&
        !toggle.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    setMessages((prev) => {
      const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
      return [...prev, { id: nextId, from: "user", text }];
    });
    setInput("");
    setLoading(true);

    try {
      // Get AI response
      const aiResponse = await chatWithAI(
        text,
        messages.map(m => ({ from: m.from, text: m.text }))
      );

      // Add AI response and handle navigation if needed
      setMessages((prev) => {
        const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
        const newMessage = {
          id: nextId,
          from: "ai",
          text: aiResponse.message
        };

        if (aiResponse.type === 'navigation') {
          try {
            navigate(aiResponse.route);
          } catch (e) {
            console.error('Navigation failed:', e);
          }
        }

        return [...prev, newMessage];
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => {
        const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
        return [...prev, {
          id: nextId,
          from: "ai",
          text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
        }];
      });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  // Ẩn ChatWidget ở trang staff và admin
  if (location.pathname.startsWith('/staff') || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Wrapper aria-hidden={!open}>
      <div className={`chat-widget ${open ? "open" : ""}`}>
        <div
          ref={panelRef}
          className="panel"
          role="dialog"
          aria-label="Chat"
          aria-hidden={!open}
        >
          <div className="messages" ref={scrollRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`msg ${m.from === "ai" ? "ai" : "user"}`}
              >
                <div className="bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg ai">
                <div className="bubble typing">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            )}
          </div>

          <div className="composer">
            <input
              ref={inputRef}
              placeholder="Nhập tin nhắn của bạn"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
              aria-label="Message input"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              aria-label="Send"
              className={loading ? 'loading' : ''}
            >
              ➤
            </button>
          </div>
        </div>

        <button
          ref={toggleRef}
          className="toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open chat"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              fill="#fff"
            />
          </svg>
        </button>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .chat-widget {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 320px;
    pointer-events: auto;
  }

  .toggle {
    width: 56px;
    height: 56px;
    border-radius: 999px;
    background: #111;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: scale(1.05);
    }
  }

  .panel {
    position: absolute;
    bottom: calc(100% + 1rem);
    right: 0;
    width: 100%;
    height: 450px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chat-widget.open .panel {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }
  }

  .msg {
    display: flex;
    flex-direction: column;

    &.user {
      align-items: flex-end;

      .bubble {
        background: #111;
        color: white;
      }
    }

    .bubble {
      max-width: 80%;
      padding: 0.75rem 1rem;
      border-radius: 25px;
      background: #f0f0f0;
      color: #333;
      font-size: 0.9rem;
      line-height: 1.4;

      &.typing {
        display: flex;
        gap: 0.3rem;
        padding: 0.5rem 1rem;

        span {
          width: 6px;
          height: 6px;
          background: #888;
          border-radius: 50%;
          animation: typing 1s infinite;

          &:nth-child(2) { animation-delay: 0.2s; }
          &:nth-child(3) { animation-delay: 0.4s; }
        }
      }
    }
  }

  .composer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    gap: 0.5rem;
    input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 25px;
      font-size: 0.95rem;
      height: 42px;

      &:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
      }
    }

    button {
      min-width: 42px;
      height: 42px;
      padding: 0 12px;
      background: #111;
      border: none;
      border-radius: 25px;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s, transform 0.12s;

      &:active { transform: translateY(1px); }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  @keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @media (max-width: 420px) {
    .chat-widget {
      width: 92vw;
      right: 4vw;
    }

    .panel {
      height: 80vh;
    }
  }
`;

export default ChatWidget;
