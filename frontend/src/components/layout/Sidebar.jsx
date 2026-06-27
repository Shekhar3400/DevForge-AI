import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  Code2,
  Users,
  Activity,
  Settings,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderOpen,      label: "Projects",  path: "/dashboard" },
  { icon: MessageSquare,   label: "Chats",     path: null },
  { icon: Code2,           label: "Editor",    path: null },
  { icon: Users,           label: "Team",      path: null },
  { icon: Activity,        label: "Activity",  path: null },
  { icon: Settings,        label: "Settings",  path: "/settings" },
];

export default function Sidebar({ projectId }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      style={{
        width: 52,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 8,
        gap: 2,
        flexShrink: 0,
      }}
    >
      {NAV.map(({ icon: Icon, label, path }) => {
        const active = path && location.pathname === path;
        return (
          <button
            key={label}
            title={label}
            className="btn-icon"
            onClick={() => path && navigate(path)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: active
                ? "var(--accent)"
                : "var(--text-muted)",
              background: active ? "var(--accent-light)" : "transparent",
              position: "relative",
            }}
          >
            <Icon size={18} />
            {active && (
              <span
                style={{
                  position: "absolute",
                  left: -2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: 18,
                  background: "var(--accent)",
                  borderRadius: "0 2px 2px 0",
                }}
              />
            )}
          </button>
        );
      })}
    </aside>
  );
}
