import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus, FolderOpen, Trash2, ArrowRight, Search,
  Layers, Clock, X, Loader2, BarChart2,
  Activity, Zap, TrendingUp, RefreshCw,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import { getProjects, createProject, deleteProject } from "../api/projectApi";
import useAuthStore from "../store/authStore";
import useUiStore   from "../store/uiStore";

const COLORS = ["#6366f1", "#a855f7", "#06b6d4", "#22c55e", "#f97316"];
const color  = (id) => COLORS[Number(id) % COLORS.length];

const ACTIVITY_ICONS = {
  project_created:  { icon: FolderOpen, color: "#6366f1" },
  project_deleted:  { icon: Trash2,     color: "#ef4444" },
  default:          { icon: Activity,   color: "#64748b" },
};

export default function Dashboard() {
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const { activities, addActivity } = useUiStore();

  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [creating,   setCreating]   = useState(false);
  const [search,     setSearch]     = useState("");
  const [sortBy,     setSortBy]     = useState("newest"); // newest | name | id
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState({ name: "", description: "" });
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Keyboard shortcut: Ctrl+N to open create modal
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setShowModal(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const p = await createProject(form);
      toast.success("Project created");
      addActivity("project_created", `Created project "${form.name}"`);
      setForm({ name: "", description: "" });
      setShowModal(false);
      load();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (!window.confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      toast.success("Project deleted");
      addActivity("project_deleted", `Deleted project "${name}"`);
      setProjects((p) => p.filter((x) => x.id !== id));
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  const sorted = [...projects]
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name")   return a.name.localeCompare(b.name);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  const stats = [
    { label: "Total Projects", value: projects.length, icon: FolderOpen, color: "#6366f1" },
    { label: "Active",         value: projects.length, icon: Zap,        color: "#22c55e" },
    { label: "Recent (7d)",    value: projects.filter((p) => {
        const d = new Date(p.createdAt);
        return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
      }).length,                                         icon: TrendingUp, color: "#f97316" },
    { label: "Architecture",   value: projects.length, icon: BarChart2,  color: "#a855f7" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)", overflow: "hidden" }}>
      <Navbar breadcrumbs={[{ label: "Dashboard" }]} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>

          {/* ── Welcome header ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.3px" }}>
                Welcome back, {user?.name?.split(" ")[0] || "Developer"} 👋
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
                {projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={load} title="Refresh" style={{ fontSize: 12 }}>
                <RefreshCw size={13} />
              </button>
              <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: 13 }}>
                <Plus size={14} /> New Project
                <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>Ctrl+N</span>
              </button>
            </div>
          </div>

          {/* ── Stats row ── */}
          {!loading && projects.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
              {stats.map(({ label, value, icon: Icon, color: c }) => (
                <div key={label} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${c}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={c} />
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
            {/* ── Left: Projects ── */}
            <div>
              {/* Search + sort */}
              {projects.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <Search size={13} color="var(--text-muted)"
                      style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      placeholder="Search projects…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ width: "100%", paddingLeft: 32, fontSize: 13 }}
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ fontSize: 12, padding: "7px 10px", borderRadius: 8, cursor: "pointer" }}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </div>
              )}

              {/* Loading skeletons */}
              {loading && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card" style={{ padding: 22, height: 155 }}>
                      <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 11, width: "85%", marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 11, width: "65%" }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && sorted.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 16,
                    background: "var(--accent-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    <Layers size={26} color="var(--accent)" />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                    {search ? "No matching projects" : "No projects yet"}
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>
                    {search ? "Try a different search" : "Create your first project to start building"}
                  </p>
                  {!search && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                      <Plus size={14} /> Create Project
                    </button>
                  )}
                </div>
              )}

              {/* Project grid */}
              {!loading && sorted.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                  {sorted.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpen={() => navigate(`/project/${project.id}`)}
                      onDelete={(e) => handleDelete(e, project.id, project.name)}
                      deleting={deletingId === project.id}
                      accentColor={color(project.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Activity feed ── */}
            <div>
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Project Modal ── */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="card fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 460, padding: 32, margin: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                New Project
              </h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={17} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Project Name *
                </label>
                <input
                  autoFocus
                  placeholder="e.g. E-Commerce Platform"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: "100%", fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Description
                </label>
                <textarea
                  placeholder="What are you building?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ width: "100%", resize: "vertical", fontSize: 13 }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }} disabled={creating || !form.name.trim()}>
                  {creating
                    ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Creating…</>
                    : <><Plus size={14} /> Create Project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, onOpen, onDelete, deleting, accentColor }) {
  return (
    <div
      className="card fade-in"
      onClick={onOpen}
      style={{
        padding: 20, cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor  = accentColor;
        e.currentTarget.style.transform    = "translateY(-2px)";
        e.currentTarget.style.boxShadow    = "0 8px 28px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor  = "var(--border)";
        e.currentTarget.style.transform    = "none";
        e.currentTarget.style.boxShadow    = "none";
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accentColor, borderRadius: "12px 12px 0 0" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accentColor}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FolderOpen size={18} color={accentColor} />
        </div>
        <button
          className="btn-icon"
          onClick={onDelete}
          title="Delete project"
          style={{ color: "var(--text-muted)", padding: 4 }}
        >
          {deleting
            ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} />
            : <Trash2 size={14} />}
        </button>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {project.name}
      </h3>
      <p style={{
        fontSize: 12, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden", minHeight: 34,
      }}>
        {project.description || "No description"}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
          <Clock size={10} />
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: accentColor, fontWeight: 500 }}>
          Open <ArrowRight size={11} />
        </span>
      </div>
    </div>
  );
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

function ActivityFeed({ activities }) {
  const MOCK = [
    { id: 1, type: "project_created",  message: "Project workspace ready",     time: new Date(Date.now() - 60000).toISOString() },
    { id: 2, type: "default",          message: "DevForge AI initialized",      time: new Date(Date.now() - 120000).toISOString() },
  ];

  const all = activities.length > 0 ? activities : MOCK;

  const fmt = (iso) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000)   return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Activity
        </span>
        <Activity size={13} color="var(--text-muted)" />
      </div>
      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {all.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
            No activity yet
          </div>
        ) : all.map((a) => {
          const meta = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.default;
          const Icon = meta.icon;
          return (
            <div
              key={a.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${meta.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Icon size={12} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4, margin: 0 }}>{a.message}</p>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{fmt(a.time)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
