import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, MessageSquare, Loader2, X } from "lucide-react";

import { getChats, createChat, deleteChat } from "../../api/chatApi";
import ChatWindow from "./ChatWindow";

export default function ChatPanel({ projectId }) {
  const [chats,          setChats]         = useState([]);
  const [activeChatId,   setActiveChatId]  = useState(null);
  const [loadingChats,   setLoadingChats]  = useState(true);
  const [creating,       setCreating]      = useState(false);
  const [newTitle,       setNewTitle]      = useState("");
  const [showNewChat,    setShowNewChat]   = useState(false);
  const [deletingId,     setDeletingId]    = useState(null);

  const loadChats = async () => {
    if (!projectId) return;
    try {
      const data = await getChats(projectId);
      setChats(data);
      if (data.length > 0 && !activeChatId) {
        setActiveChatId(data[0].id);
      }
    } catch {
      /* silent */
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => { loadChats(); }, [projectId]);

  const handleCreateChat = async (e) => {
    e?.preventDefault();
    const title = newTitle.trim() || "New Chat";
    setCreating(true);
    try {
      const chat = await createChat({ title, projectId: Number(projectId) });
      setChats((c) => [chat, ...c]);
      setActiveChatId(chat.id);
      setNewTitle("");
      setShowNewChat(false);
      toast.success("Chat created");
    } catch {
      toast.error("Failed to create chat");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteChat(id);
      setChats((c) => c.filter((x) => x.id !== id));
      if (activeChatId === id) {
        const remaining = chats.filter((x) => x.id !== id);
        setActiveChatId(remaining[0]?.id || null);
      }
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeletingId(null);
    }
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* ── Header ── */}
      <div style={{
        padding: "12px 14px 10px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            AI Assistant
          </span>
          <button
            className="btn-icon"
            onClick={() => setShowNewChat((v) => !v)}
            title="New chat"
            style={{ color: showNewChat ? "var(--accent)" : "var(--text-muted)" }}
          >
            <Plus size={15} />
          </button>
        </div>

        {/* New chat input */}
        {showNewChat && (
          <form onSubmit={handleCreateChat} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input
              autoFocus
              placeholder="Chat title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ flex: 1, fontSize: 12, padding: "5px 10px" }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
              style={{ padding: "4px 10px", fontSize: 12 }}
            >
              {creating ? <Loader2 size={12} style={{ animation: "spin 0.7s linear infinite" }} /> : <Plus size={12} />}
            </button>
            <button type="button" className="btn-icon" onClick={() => setShowNewChat(false)}>
              <X size={13} />
            </button>
          </form>
        )}

        {/* Chat list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 180, overflowY: "auto" }}>
          {loadingChats && (
            <div style={{ padding: "8px 0" }}>
              {[1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: 28, borderRadius: 6, marginBottom: 4 }} />
              ))}
            </div>
          )}

          {!loadingChats && chats.length === 0 && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>No chats yet. Create one above.</p>
            </div>
          )}

          {!loadingChats && chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 8px", borderRadius: 6, cursor: "pointer",
                background: activeChatId === chat.id ? "var(--accent-light)" : "transparent",
                border: activeChatId === chat.id ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { if (activeChatId !== chat.id) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={(e) => { if (activeChatId !== chat.id) e.currentTarget.style.background = "transparent"; }}
            >
              <MessageSquare
                size={12}
                color={activeChatId === chat.id ? "var(--accent)" : "var(--text-muted)"}
                style={{ flexShrink: 0 }}
              />
              <span style={{
                flex: 1, fontSize: 12,
                color: activeChatId === chat.id ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: activeChatId === chat.id ? 600 : 400,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {chat.title}
              </span>
              <button
                className="btn-icon"
                style={{ padding: 2, flexShrink: 0, opacity: 0.6 }}
                onClick={(e) => handleDeleteChat(e, chat.id)}
                title="Delete chat"
              >
                {deletingId === chat.id
                  ? <Loader2 size={11} style={{ animation: "spin 0.7s linear infinite" }} />
                  : <Trash2 size={11} color="var(--text-muted)" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Window (takes remaining height) ── */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeChatId ? (
          <ChatWindow chatId={activeChatId} chatTitle={activeChat?.title} />
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", padding: 24 }}>
              <MessageSquare size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>No chat selected</p>
              <button
                className="btn btn-primary"
                onClick={() => handleCreateChat()}
                style={{ fontSize: 12 }}
              >
                <Plus size={13} /> Start a Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
