import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  X, Trash2, Cpu, Database, Globe, Server, Lock, Layers,
  GitBranch, HardDrive, Zap, Box, Plus, ChevronRight,
  ChevronDown, FolderOpen, Edit2, Check, MoreVertical,
  Loader2, Package,
} from "lucide-react";
import {
  getNodeModules, createNodeModule, renameNodeModule, deleteNodeModule,
  getNodeFeatures, createNodeFeature, renameNodeFeature, deleteNodeFeature,
} from "../../api/nodeModuleApi";

const CATEGORIES = [
  { label: "Frontend",     icon: Globe,     color: "#6366f1" },
  { label: "Backend",      icon: Server,    color: "#22c55e" },
  { label: "Database",     icon: Database,  color: "#f59e0b" },
  { label: "API",          icon: GitBranch, color: "#06b6d4" },
  { label: "Cache",        icon: Zap,       color: "#f97316" },
  { label: "Queue",        icon: Layers,    color: "#a855f7" },
  { label: "Gateway",      icon: Box,       color: "#ec4899" },
  { label: "Microservice", icon: Cpu,       color: "#14b8a6" },
  { label: "Auth",         icon: Lock,      color: "#ef4444" },
  { label: "External",     icon: Globe,     color: "#64748b" },
  { label: "Storage",      icon: HardDrive, color: "#84cc16" },
  { label: "Custom",       icon: Box,       color: "#8b5cf6" },
];

export default function NodePanel({ node, onDelete, onClose }) {
  const [modules,        setModules]       = useState([]);
  const [featuresMap,    setFeaturesMap]   = useState({});   // moduleId → features[]
  const [collapsed,      setCollapsed]     = useState({});   // moduleId → bool
  const [loading,        setLoading]       = useState(true);
  const [newModName,     setNewModName]    = useState("");
  const [addingMod,      setAddingMod]     = useState(false);
  const [featureInputs,  setFeatureInputs] = useState({});   // moduleId → string
  const [addingFeat,     setAddingFeat]    = useState({});
  const [renameModId,    setRenameModId]   = useState(null);
  const [renameModVal,   setRenameModVal]  = useState("");
  const [renameFeatId,   setRenameFeatId]  = useState(null);
  const [renameFeatVal,  setRenameFeatVal] = useState("");
  const [ctxMenu,        setCtxMenu]       = useState(null);
  const ctxRef = useRef(null);

  if (!node) return null;

  const backendId = node.data?.backendId;
  const { label, nodeType, nodeKey, technology, framework } = node.data || {};
  const cat  = CATEGORIES.find((c) => c.label === nodeType) || CATEGORIES[11];
  const Icon = cat.icon;

  // Close context menu on outside click
  useEffect(() => {
    const h = (e) => { if (ctxRef.current && !ctxRef.current.contains(e.target)) setCtxMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Load modules whenever node changes
  useEffect(() => {
    if (!backendId) return;
    loadModules();
  }, [backendId]);

  const loadModules = async () => {
    setLoading(true);
    try {
      const mods = await getNodeModules(backendId);
      setModules(mods);
      const map = {};
      await Promise.all(mods.map(async (m) => {
        try { map[m.id] = await getNodeFeatures(m.id); }
        catch { map[m.id] = []; }
      }));
      setFeaturesMap(map);
    } catch { toast.error("Failed to load modules"); }
    finally { setLoading(false); }
  };

  const totalFeatures = Object.values(featuresMap).reduce((s, a) => s + (a?.length || 0), 0);

  // ── Module actions ──────────────────────────────────────────────────────────
  const handleAddModule = async () => {
    const name = newModName.trim();
    if (!name) return;
    setAddingMod(true);
    try {
      await createNodeModule(backendId, name);
      setNewModName("");
      toast.success(`Module "${name}" added`);
      loadModules();
    } catch { toast.error("Failed to add module"); }
    finally { setAddingMod(false); }
  };

  const handleRenameModule = async (id) => {
    const name = renameModVal.trim();
    if (!name) return;
    try {
      await renameNodeModule(id, name);
      setRenameModId(null);
      loadModules();
    } catch { toast.error("Failed to rename"); }
  };

  const handleDeleteModule = async (id) => {
    setCtxMenu(null);
    try {
      await deleteNodeModule(id);
      toast.success("Module deleted");
      loadModules();
    } catch { toast.error("Failed to delete module"); }
  };

  // ── Feature actions ─────────────────────────────────────────────────────────
  const handleAddFeature = async (moduleId) => {
    const name = (featureInputs[moduleId] || "").trim();
    if (!name) return;
    setAddingFeat((f) => ({ ...f, [moduleId]: true }));
    try {
      await createNodeFeature(moduleId, name);
      setFeatureInputs((f) => ({ ...f, [moduleId]: "" }));
      toast.success(`Feature "${name}" added`);
      loadModules();
    } catch { toast.error("Failed to add feature"); }
    finally { setAddingFeat((f) => ({ ...f, [moduleId]: false })); }
  };

  const handleRenameFeature = async (id) => {
    const name = renameFeatVal.trim();
    if (!name) return;
    try {
      await renameNodeFeature(id, name);
      setRenameFeatId(null);
      loadModules();
    } catch { toast.error("Failed to rename feature"); }
  };

  const handleDeleteFeature = async (id) => {
    try {
      await deleteNodeFeature(id);
      toast.success("Feature deleted");
      loadModules();
    } catch { toast.error("Failed to delete feature"); }
  };

  const toggle = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  // ── Info row helper ─────────────────────────────────────────────────────────
  const row = (lbl, val) => val ? (
    <div style={{ marginBottom: 8 }}>
      <span style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>
        {lbl}
      </span>
      <span style={{ fontSize: 12, color: "var(--text-primary)", background: "var(--bg-card)", display: "block", padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>
        {val}
      </span>
    </div>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* ── Header ── */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={15} color={cat.color} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{label}</div>
              <div style={{ fontSize: 10, color: cat.color }}>{nodeType}</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Node summary */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {technology && (
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}33` }}>
              {technology}
            </span>
          )}
          {framework && (
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              {framework}
            </span>
          )}
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            <Package size={9} style={{ display: "inline", marginRight: 3 }} />
            {modules.length} modules
          </span>
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            <Zap size={9} style={{ display: "inline", marginRight: 3 }} />
            {totalFeatures} features
          </span>
        </div>
      </div>

      {/* ── Modules section ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 0 0" }}>

        {/* Modules header */}
        <div style={{ padding: "0 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
            Modules
          </span>
        </div>

        {/* Add module input */}
        <div style={{ padding: "0 10px 10px", display: "flex", gap: 6 }}>
          <input
            placeholder="Add module…"
            value={newModName}
            onChange={(e) => setNewModName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            style={{ flex: 1, fontSize: 11, padding: "5px 8px", borderRadius: 6 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddModule}
            disabled={addingMod || !newModName.trim()}
            style={{ padding: "4px 8px", fontSize: 11, flexShrink: 0 }}
          >
            {addingMod ? <Loader2 size={11} style={{ animation: "spin 0.7s linear infinite" }} /> : <Plus size={11} />}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: "14px", textAlign: "center" }}>
            <Loader2 size={18} color="var(--accent)" style={{ animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
          </div>
        )}

        {/* Empty */}
        {!loading && modules.length === 0 && (
          <div style={{ padding: "20px 14px", textAlign: "center" }}>
            <Package size={24} color="var(--text-muted)" style={{ margin: "0 auto 8px", display: "block" }} />
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>No modules yet.<br />Add one above.</p>
          </div>
        )}

        {/* Module list */}
        {!loading && modules.map((mod) => (
          <div key={mod.id}>
            {/* Module row */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px 6px 8px", margin: "0 4px", borderRadius: 7, cursor: "pointer", transition: "background 0.1s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => { if (renameModId !== mod.id) toggle(mod.id); }}
            >
              <span style={{ color: "var(--text-muted)", flexShrink: 0, lineHeight: 0 }}>
                {collapsed[mod.id] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </span>
              <FolderOpen size={12} color={cat.color} style={{ flexShrink: 0 }} />

              {renameModId === mod.id ? (
                <input
                  autoFocus
                  value={renameModVal}
                  onChange={(e) => setRenameModVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRenameModule(mod.id); if (e.key === "Escape") setRenameModId(null); }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 1, fontSize: 11, padding: "2px 6px" }}
                />
              ) : (
                <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {mod.name}
                </span>
              )}

              <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-primary)", borderRadius: 10, padding: "1px 5px", flexShrink: 0 }}>
                {(featuresMap[mod.id] || []).length}
              </span>

              {renameModId === mod.id ? (
                <button className="btn-icon" style={{ padding: 2 }} onClick={(e) => { e.stopPropagation(); handleRenameModule(mod.id); }}>
                  <Check size={11} color="var(--success)" />
                </button>
              ) : (
                <button
                  className="btn-icon"
                  style={{ padding: 2, flexShrink: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const r = e.currentTarget.getBoundingClientRect();
                    setCtxMenu({ type: "module", id: mod.id, x: r.left, y: r.bottom + 4 });
                  }}
                >
                  <MoreVertical size={11} />
                </button>
              )}
            </div>

            {/* Features */}
            {!collapsed[mod.id] && (
              <div style={{ paddingLeft: 24, paddingRight: 8, paddingBottom: 4 }}>
                {(featuresMap[mod.id] || []).length === 0 && (
                  <p style={{ fontSize: 10, color: "var(--text-muted)", padding: "2px 6px", marginBottom: 2 }}>No features</p>
                )}

                {(featuresMap[mod.id] || []).map((feat) => (
                  <div
                    key={feat.id}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 5, transition: "background 0.1s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; const b = e.currentTarget.querySelector(".feat-del"); if (b) b.style.opacity = "1"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; const b = e.currentTarget.querySelector(".feat-del"); if (b) b.style.opacity = "0"; }}
                  >
                    <Zap size={10} color="#a855f7" style={{ flexShrink: 0 }} />

                    {renameFeatId === feat.id ? (
                      <input
                        autoFocus
                        value={renameFeatVal}
                        onChange={(e) => setRenameFeatVal(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRenameFeature(feat.id); if (e.key === "Escape") setRenameFeatId(null); }}
                        style={{ flex: 1, fontSize: 10, padding: "2px 5px" }}
                      />
                    ) : (
                      <span style={{ flex: 1, fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {feat.name}
                      </span>
                    )}

                    {renameFeatId === feat.id ? (
                      <button className="btn-icon" style={{ padding: 2 }} onClick={() => handleRenameFeature(feat.id)}>
                        <Check size={10} color="var(--success)" />
                      </button>
                    ) : (
                      <button
                        className="btn-icon feat-rename"
                        style={{ padding: 2, opacity: 0, transition: "opacity 0.1s" }}
                        onClick={() => { setRenameFeatId(feat.id); setRenameFeatVal(feat.name); }}
                        title="Rename"
                      >
                        <Edit2 size={10} color="var(--text-muted)" />
                      </button>
                    )}

                    <button
                      className="btn-icon feat-del"
                      style={{ padding: 2, opacity: 0, transition: "opacity 0.1s", flexShrink: 0 }}
                      onClick={() => handleDeleteFeature(feat.id)}
                      title="Delete feature"
                    >
                      <Trash2 size={10} color="var(--danger)" />
                    </button>
                  </div>
                ))}

                {/* Add feature */}
                <div style={{ display: "flex", gap: 4, padding: "4px 0 2px" }}>
                  <input
                    placeholder="Add feature…"
                    value={featureInputs[mod.id] || ""}
                    onChange={(e) => setFeatureInputs((f) => ({ ...f, [mod.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddFeature(mod.id); }}
                    style={{ flex: 1, fontSize: 10, padding: "3px 7px", borderRadius: 5 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddFeature(mod.id)}
                    disabled={!featureInputs[mod.id]?.trim() || addingFeat[mod.id]}
                    style={{ padding: "2px 7px", fontSize: 10, flexShrink: 0 }}
                  >
                    {addingFeat[mod.id] ? <Loader2 size={10} style={{ animation: "spin 0.7s linear infinite" }} /> : <Plus size={10} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Delete Node ── */}
      <div style={{ padding: 12, borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <button
          className="btn btn-danger"
          onClick={onDelete}
          style={{ width: "100%", justifyContent: "center", fontSize: 12 }}
        >
          <Trash2 size={13} /> Delete Node
        </button>
      </div>

      {/* ── Context Menu ── */}
      {ctxMenu && (
        <div
          ref={ctxRef}
          style={{
            position: "fixed", top: ctxMenu.y, left: ctxMenu.x,
            zIndex: 9999, background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: 4, minWidth: 150,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <button
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", borderRadius: 5, fontSize: 12, color: "var(--text-secondary)", background: "transparent", cursor: "pointer", border: "none", fontFamily: "inherit" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={() => {
              const mod = modules.find((m) => m.id === ctxMenu.id);
              if (mod) { setRenameModId(mod.id); setRenameModVal(mod.name); }
              setCtxMenu(null);
            }}
          >
            <Edit2 size={13} /> Rename
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", borderRadius: 5, fontSize: 12, color: "var(--danger)", background: "transparent", cursor: "pointer", border: "none", fontFamily: "inherit" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={() => handleDeleteModule(ctxMenu.id)}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
