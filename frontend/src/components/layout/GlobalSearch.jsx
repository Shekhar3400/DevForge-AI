import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderOpen, X, Command } from "lucide-react";
import { getProjects } from "../../api/projectApi";
import useUiStore from "../../store/uiStore";

export default function GlobalSearch() {
  const { searchOpen, closeSearch } = useUiStore();
  const [query,    setQuery]    = useState("");
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const navigate  = useNavigate();
  const inputRef  = useRef(null);

  useEffect(() => {
    if (searchOpen) {
      setLoading(true);
      getProjects()
        .then((d) => setProjects(d))
        .finally(() => setLoading(false));
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [searchOpen]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") closeSearch(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [closeSearch]);

  if (!searchOpen) return null;

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(query.toLowerCase())
  );

  const go = (projectId) => {
    navigate(`/project/${projectId}`);
    closeSearch();
  };

  return (
    <div
      onClick={closeSearch}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 2000,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "15vh",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card fade-in"
        style={{ width: "100%", maxWidth: 560, margin: "0 20px", overflow: "hidden" }}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, modules, features…"
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", fontSize: 14, color: "var(--text-primary)",
            }}
          />
          {query && (
            <button className="btn-icon" style={{ padding: 2 }} onClick={() => setQuery("")}>
              <X size={14} />
            </button>
          )}
          <kbd style={{
            fontSize: 10, padding: "2px 6px", borderRadius: 4,
            background: "var(--bg-hover)", border: "1px solid var(--border)",
            color: "var(--text-muted)", flexShrink: 0,
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {loading && (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Searching…
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              {query ? `No results for "${query}"` : "Start typing to search"}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div style={{ padding: "6px 16px 4px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Projects
              </div>
              {filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => go(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px", cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FolderOpen size={14} color="var(--accent)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description || "No description"}</div>
                  </div>
                  <kbd style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-muted)", flexShrink: 0 }}>↵</kbd>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 16 }}>
          {[["↵", "Open"], ["↑↓", "Navigate"], ["Esc", "Close"]].map(([k, l]) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)" }}>
              <kbd style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, background: "var(--bg-hover)", border: "1px solid var(--border)" }}>{k}</kbd>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
