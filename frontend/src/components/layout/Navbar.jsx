import { useNavigate } from "react-router-dom";
import { Code2, Bell, Settings, LogOut, ChevronRight, Search, Keyboard } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useUiStore   from "../../store/uiStore";

export default function Navbar({ breadcrumbs = [] }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { openSearch }   = useUiStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Ctrl+K opens global search
  return (
    <header
      style={{
        height: 52, background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: 12, flexShrink: 0, zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginRight: 6 }}
        onClick={() => navigate("/dashboard")}
      >
        <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Code2 size={15} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
          DevForge<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
      </div>

      {/* Breadcrumbs */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
        {breadcrumbs.map((crumb, i) => (
          <span
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: i === breadcrumbs.length - 1 ? "var(--text-primary)" : "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {i > 0 && <ChevronRight size={12} color="var(--text-muted)" />}
            {crumb.onClick
              ? <span style={{ cursor: "pointer" }} onClick={crumb.onClick}>{crumb.label}</span>
              : <span>{crumb.label}</span>}
          </span>
        ))}
      </div>

      {/* Search trigger */}
      <button
        onClick={openSearch}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 12px", borderRadius: 7, fontSize: 12,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          color: "var(--text-muted)", cursor: "pointer", transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text-primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        title="Search (Ctrl+K)"
      >
        <Search size={13} />
        <span>Search</span>
        <kbd style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>⌘K</kbd>
      </button>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button className="btn-icon" title="Settings" onClick={() => navigate("/settings")}>
          <Settings size={16} />
        </button>

        {/* User chip */}
        <div
          onClick={handleLogout}
          title="Sign out"
          style={{
            display: "flex", alignItems: "center", gap: 7,
            marginLeft: 4, padding: "4px 10px",
            borderRadius: 8, border: "1px solid var(--border)",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {user?.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt={user.name}
              style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <span style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.name || "User"}
          </span>
          <LogOut size={12} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}
