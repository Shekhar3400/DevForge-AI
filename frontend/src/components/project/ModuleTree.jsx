import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus, Trash2, ChevronRight, ChevronDown,
  Layers, Zap, MoreVertical, Loader2, FolderOpen,
} from "lucide-react";

import { getModules, createModule, deleteModule } from "../../api/moduleApi";
import { getFeatures, createFeature, deleteFeature } from "../../api/featureApi";

export default function ModuleTree({ projectId }) {
  const [modules,       setModules]       = useState([]);
  const [featuresMap,   setFeaturesMap]   = useState({});
  const [collapsed,     setCollapsed]     = useState({});
  const [loading,       setLoading]       = useState(true);

  // Module creation
  const [moduleName,    setModuleName]    = useState("");
  const [addingModule,  setAddingModule]  = useState(false);

  // Feature creation: one input per module id
  const [featureInputs, setFeatureInputs] = useState({});
  const [addingFeat,    setAddingFeat]    = useState({}); // { [moduleId]: bool }

  // Context menu
  const [ctxMenu, setCtxMenu] = useState(null);
  const ctxRef = useRef(null);

  /* ── Load ── */
  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const mods = await getModules(projectId);
      setModules(mods);
      const map = {};
      await Promise.all(
        mods.map(async (m) => {
          try { map[m.id] = await getFeatures(m.id); }
          catch { map[m.id] = []; }
        })
      );
      setFeaturesMap(map);
    } catch (err) {
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  /* ── Context menu — close on outside click ── */
  useEffect(() => {
    const h = (e) => { if (ctxRef.current && !ctxRef.current.contains(e.target)) setCtxMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Module actions ── */
  const handleAddModule = async () => {
    const name = moduleName.trim();
    if (!name) { toast.error("Enter a module name"); return; }
    setAddingModule(true);
    try {
      await createModule({ name, projectId: Number(projectId) });
      setModuleName("");
      toast.success(`Module "${name}" created`);
      load();
    } catch (err) {
      toast.error("Failed to create module — check backend is running");
    } finally {
      setAddingModule(false);
    }
  };

  const handleDeleteModule = async (id) => {
    setCtxMenu(null);
    try {
      await deleteModule(id);
      toast.success("Module deleted");
      load();
    } catch {
      toast.error("Failed to delete module");
    }
  };

  /* ── Feature actions ── */
  const handleAddFeature = async (moduleId) => {
    const name = (featureInputs[moduleId] || "").trim();
    if (!name) return;
    setAddingFeat((f) => ({ ...f, [moduleId]: true }));
    try {
      await createFeature({ name, description: "", moduleId });
      setFeatureInputs((f) => ({ ...f, [moduleId]: "" }));
      toast.success(`Feature "${name}" added`);
      load();
    } catch {
      toast.error("Failed to add feature");
    } finally {
      setAddingFeat((f) => ({ ...f, [moduleId]: false }));
    }
  };

  const handleDeleteFeature = async (id) => {
    try {
      await deleteFeature(id);
      toast.success("Feature deleted");
      load();
    } catch {
      toast.error("Failed to delete feature");
    }
  };

  const toggle = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  const totalFeatures = Object.values(featuresMap).reduce((s, a) => s + (a?.length || 0), 0);

  /* ── Render ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
          System Design
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span className="badge badge-accent"><Layers size={10} /> {modules.length} modules</span>
          <span className="badge badge-purple"><Zap size={10} /> {totalFeatures} features</span>
        </div>
      </div>

      {/* ── Add Module form — always visible ── */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg-card)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            placeholder="New module name…"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddModule(); }}
            style={{ flex: 1, fontSize: 12, padding: "5px 10px" }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddModule}
            disabled={addingModule || !moduleName.trim()}
            style={{ padding: "5px 10px", fontSize: 12, flexShrink: 0 }}
            title="Add module (Enter)"
          >
            {addingModule
              ? <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} />
              : <><Plus size={13} /> Add</>}
          </button>
        </div>
      </div>

      {/* ── Tree body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ padding: "10px 14px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div className="skeleton" style={{ height: 26, borderRadius: 6, marginBottom: 5 }} />
                <div className="skeleton" style={{ height: 18, width: "75%", marginLeft: 24, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && modules.length === 0 && (
          <div style={{ padding: "36px 14px", textAlign: "center" }}>
            <Layers size={30} color="var(--text-muted)" style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              No modules yet.<br />Type a name above and click <strong>Add</strong>.
            </p>
          </div>
        )}

        {/* Module list */}
        {!loading && modules.map((mod) => (
          <div key={mod.id} style={{ marginBottom: 1 }}>

            {/* Module row */}
            <div
              onClick={() => toggle(mod.id)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 10px 7px 8px",
                margin: "0 6px", borderRadius: 7,
                cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Chevron */}
              <span style={{ color: "var(--text-muted)", flexShrink: 0, lineHeight: 0 }}>
                {collapsed[mod.id] ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
              </span>

              {/* Icon */}
              <FolderOpen size={13} color="var(--accent)" style={{ flexShrink: 0 }} />

              {/* Name */}
              <span style={{
                flex: 1, fontSize: 12, fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {mod.name}
              </span>

              {/* Feature count badge */}
              <span style={{
                fontSize: 10, color: "var(--text-muted)",
                background: "var(--bg-primary)",
                borderRadius: 10, padding: "1px 6px", flexShrink: 0,
              }}>
                {(featuresMap[mod.id] || []).length}
              </span>

              {/* Context menu trigger */}
              <button
                className="btn-icon"
                style={{ padding: 2, flexShrink: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  const r = e.currentTarget.getBoundingClientRect();
                  setCtxMenu({ type: "module", id: mod.id, x: r.left, y: r.bottom + 4 });
                }}
                title="Module options"
              >
                <MoreVertical size={12} />
              </button>
            </div>

            {/* ── Features section (expanded) ── */}
            {!collapsed[mod.id] && (
              <div style={{ paddingLeft: 28, paddingRight: 8, paddingBottom: 6 }}>

                {/* Feature rows */}
                {(featuresMap[mod.id] || []).length === 0 && (
                  <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 8px", marginBottom: 4 }}>
                    No features yet
                  </p>
                )}

                {(featuresMap[mod.id] || []).map((feat) => (
                  <div
                    key={feat.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "4px 8px", borderRadius: 5,
                      transition: "background 0.1s", cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-hover)";
                      e.currentTarget.querySelector(".del-btn").style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.querySelector(".del-btn").style.opacity = "0";
                    }}
                  >
                    <Zap size={11} color="var(--purple)" style={{ flexShrink: 0 }} />
                    <span style={{
                      flex: 1, fontSize: 12, color: "var(--text-secondary)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {feat.name}
                    </span>
                    <button
                      className="del-btn btn-icon"
                      style={{ padding: 2, flexShrink: 0, opacity: 0, transition: "opacity 0.1s" }}
                      onClick={() => handleDeleteFeature(feat.id)}
                      title="Delete feature"
                    >
                      <Trash2 size={11} color="var(--danger)" />
                    </button>
                  </div>
                ))}

                {/* Add feature input */}
                <div style={{ display: "flex", gap: 5, padding: "5px 0 2px" }}>
                  <input
                    placeholder="Add feature…"
                    value={featureInputs[mod.id] || ""}
                    onChange={(e) =>
                      setFeatureInputs((f) => ({ ...f, [mod.id]: e.target.value }))
                    }
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddFeature(mod.id); }}
                    style={{ flex: 1, fontSize: 11, padding: "4px 8px", borderRadius: 5 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddFeature(mod.id)}
                    disabled={!featureInputs[mod.id]?.trim() || addingFeat[mod.id]}
                    style={{ padding: "3px 8px", fontSize: 11, flexShrink: 0 }}
                    title="Add feature (Enter)"
                  >
                    {addingFeat[mod.id]
                      ? <Loader2 size={11} style={{ animation: "spin 0.7s linear infinite" }} />
                      : <Plus size={11} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Context menu ── */}
      {ctxMenu && (
        <div
          ref={ctxRef}
          style={{
            position: "fixed",
            top: ctxMenu.y, left: ctxMenu.x,
            zIndex: 9999,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8, padding: 4,
            minWidth: 150,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {ctxMenu.type === "module" && (
            <button
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "8px 12px", borderRadius: 5,
                fontSize: 12, color: "var(--danger)",
                background: "transparent", cursor: "pointer",
                border: "none", fontFamily: "inherit",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => handleDeleteModule(ctxMenu.id)}
            >
              <Trash2 size={13} /> Delete Module
            </button>
          )}
        </div>
      )}
    </div>
  );
}
