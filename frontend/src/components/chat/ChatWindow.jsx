import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getMessages, sendMessage } from "../../api/chatApi";
import AiResponseCard from "./AiResponseCard";
import ChatInput      from "./ChatInput";

export default function ChatWindow({ chatId, chatTitle }) {
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [typing,    setTyping]    = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMessages(chatId);
      setMessages(data);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) {
      setMessages([]);
      load();
    }
  }, [chatId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (content) => {
    if (!content.trim() || sending) return;

    // Optimistic user message
    const tempUser = { id: `temp-u-${Date.now()}`, role: "USER", content, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, tempUser]);
    setSending(true);
    setTyping(true);

    try {
      const aiMsg = await sendMessage(chatId, content);
      setTyping(false);
      // Replace temp + add real AI message
      setMessages((m) => {
        const withoutTemp = m.filter((x) => x.id !== tempUser.id);
        const userReal    = { ...tempUser, id: `user-${Date.now()}` };
        return [...withoutTemp, userReal, aiMsg];
      });
    } catch {
      setTyping(false);
      toast.error("Failed to send message");
      setMessages((m) => m.filter((x) => x.id !== tempUser.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Sub-header */}
      {chatTitle && (
        <div style={{
          padding: "8px 14px",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
          color: "var(--text-secondary)",
          fontWeight: 500,
          flexShrink: 0,
          background: "var(--bg-primary)",
        }}>
          {chatTitle}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="skeleton" style={{ height: 36, borderRadius: 8, width: i % 2 === 0 ? "70%" : "85%", marginLeft: i % 2 === 0 ? "auto" : 0 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 48, height: 48,
                background: "var(--accent-light)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <span style={{ fontSize: 22 }}>🤖</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                DevForge AI is ready
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Ask me about your project architecture
              </p>
            </div>
          </div>
        )}

        {!loading && messages.map((msg) => (
          msg.role === "USER"
            ? <UserMessage key={msg.id} msg={msg} />
            : <AiResponseCard key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
            <div style={{
              width: 28, height: 28,
              background: "var(--accent-light)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, flexShrink: 0,
            }}>
              🤖
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "inline-block",
                  animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} sending={sending} />
    </div>
  );
}

function UserMessage({ msg }) {
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        <div style={{
          background: "var(--accent)",
          color: "#fff",
          borderRadius: "12px 12px 2px 12px",
          padding: "8px 12px",
          fontSize: 13,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
        {time && (
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{time}</span>
        )}
      </div>
    </div>
  );
}
