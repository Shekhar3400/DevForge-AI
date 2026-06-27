import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Code2, Users, BarChart2, MessageSquare, Activity } from "lucide-react";

import Navbar             from "../components/layout/Navbar";
import ProjectExplorer    from "../components/explorer/ProjectExplorer";
import ArchitectureCanvas from "../components/architecture/ArchitectureCanvas";
import ChatPanel          from "../components/chat/ChatPanel";
import CodeEditor         from "../components/editor/CodeEditor";
import TeamPanel          from "../components/team/TeamPanel";
import AnalyticsPanel     from "../components/analytics/AnalyticsPanel";

import { getProjects } from "../api/projectApi";

const TABS = [
  { id: "architecture", label: "Architecture", icon: BarChart2 },
  { id: "analytics",    label: "Analytics",    icon: Activity  },
  { id: "editor",       label: "Editor",       icon: Code2     },
  { id: "team",         label: "Team",         icon: Users     },
];

export default function Workspace() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [project,    setProject]   = useState(null);
  const [activeTab,  setActiveTab] = useState("architecture");
  const [chatOpen,   setChatOpen]  = useState(true);
  const [leftWidth,  setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth]= useState(340);
  const [openFile,   setOpenFile]  = useState(null);

  const draggingLeft  = useRef(false);
  const draggingRight = useRef(false);

  useEffect(() => {
    getProjects()
      .then((list) => setProject(list.find((p) => String(p.id) === String(id)) || null))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    const onMove = (e) => {
      if (draggingLeft.current)  setLeftWidth(Math.max(180, Math.min(420, e.clientX)));
      if (draggingRight.current) setRightWidth(Math.max(260, Math.min(520, window.innerWidth - e.clientX)));
    };
    const onUp = () => {
      draggingLeft.current  = false;
      draggingRight.current = false;
      document.body.style.cursor    = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  const startDragLeft  = () => { draggingLeft.current  = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; };
  const startDragRight = () => { draggingRight.current = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; };

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") { e.preventDefault(); setChatOpen((v) => !v); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleFileOpen = useCallback((file) => {
    setOpenFile(file);
    setActiveTab("editor");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)", overflow: "hidden" }}>
      <Navbar
        breadcrumbs={[
          { label: "Dashboard", onClick: () => navigate("/dashboard") },
          { label: project?.name || `Project #${id}` },
          { label: TABS.find((t) => t.id === activeTab)?.label },
        ]}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Left: Project Explorer ── */}
        <div style={{ width: leftWidth, flexShrink: 0, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ProjectExplorer projectId={id} onFileOpen={handleFileOpen} />
        </div>

        {/* Drag handle – left */}
        <div
          onMouseDown={startDragLeft}
          style={{ width: 4, cursor: "col-resize", background: "transparent", flexShrink: 0, transition: "background 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        />

        {/* ── Centre ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Tab bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 12px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            {TABS.map(({ id: tid, label, icon: Icon }) => (
              <button
                key={tid}
                onClick={() => setActiveTab(tid)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  background: activeTab === tid ? "var(--accent-light)" : "transparent",
                  color:      activeTab === tid ? "var(--accent)"       : "var(--text-muted)",
                  border:     activeTab === tid ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <Icon size={13} /> {label}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            <button
              onClick={() => setChatOpen((v) => !v)}
              title="Toggle AI Chat (Ctrl+\)"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                background: chatOpen ? "var(--accent-light)" : "transparent",
                color:      chatOpen ? "var(--accent)"       : "var(--text-muted)",
                border:     chatOpen ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <MessageSquare size={13} /> AI Chat
            </button>
          </div>

          {/* Panels */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, display: activeTab === "architecture" ? "block" : "none" }}>
              <ArchitectureCanvas projectId={id} />
            </div>
            <div style={{ position: "absolute", inset: 0, display: activeTab === "analytics" ? "block" : "none" }}>
              <AnalyticsPanel projectId={id} />
            </div>
            <div style={{ position: "absolute", inset: 0, display: activeTab === "editor" ? "block" : "none" }}>
              <CodeEditor openFile={openFile} projectId={id} />
            </div>
            <div style={{ position: "absolute", inset: 0, display: activeTab === "team" ? "block" : "none" }}>
              <TeamPanel projectId={id} />
            </div>
          </div>
        </div>

        {/* Drag handle – right */}
        {chatOpen && (
          <div
            onMouseDown={startDragRight}
            style={{ width: 4, cursor: "col-resize", background: "transparent", flexShrink: 0, transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          />
        )}

        {/* ── Right: AI Chat ── */}
        {chatOpen && (
          <div style={{ width: rightWidth, flexShrink: 0, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <ChatPanel projectId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
