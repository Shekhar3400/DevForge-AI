import { useState, useRef } from "react";
import { Send, Loader2 } from "lucide-react";

export default function ChatInput({ onSend, sending }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || sending) return;
    onSend(message.trim());
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  return (
    <div style={{
      padding: "10px 12px",
      borderTop: "1px solid var(--border)",
      background: "var(--bg-secondary)",
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 10px",
        transition: "border-color 0.15s",
      }}
        onFocusCapture={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
        onBlurCapture={(e) => e.currentTarget.style.borderColor = "var(--border)"}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask DevForge AI… (Enter to send)"
          disabled={sending}
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--text-primary)",
            padding: 0,
            minHeight: 20,
            maxHeight: 120,
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          style={{
            width: 28, height: 28,
            borderRadius: 7,
            background: message.trim() && !sending ? "var(--accent)" : "var(--bg-hover)",
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: message.trim() && !sending ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          {sending
            ? <Loader2 size={13} color="var(--text-muted)" style={{ animation: "spin 0.7s linear infinite" }} />
            : <Send size={13} color={message.trim() ? "#fff" : "var(--text-muted)"} />}
        </button>
      </div>
      <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 5, textAlign: "center" }}>
        Shift+Enter for new line · Enter to send
      </p>
    </div>
  );
}
