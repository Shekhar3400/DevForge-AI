import { useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
  ChevronRight, ChevronDown, Folder, FolderOpen,
  FileText, File, Plus, Trash2, Edit2, Check, X,
  Search, RefreshCw, Loader2, FilePlus, FolderPlus, Wand2,
} from "lucide-react";
import {
  getProjectFiles, createProjectFile, renameFile, deleteFile,
  aiGenerateFiles, aiAnalyzeProject,
} from "../../api/projectFileApi";
import AiProgressWindow from "../ai/AiProgressWindow";

// ── Language → icon color ─────────────────────────────────────────────────
const LANG_COLORS = {
  java: "#f59e0b", javascript: "#f59e0b", typescript: "#3b82f6",
  python: "#3b82f6", html: "#f97316", css: "#06b6d4", json: "#22c55e",
  sql: "#a855f7", markdown: "#6366f1", yaml: "#64748b", xml: "#ec4899",
  go: "#06b6d4", rust: "#f97316", kotlin: "#a855f7", csharp: "#6366f1",
  php: "#8b5cf6", ruby: "#ef4444", c: "#64748b", cpp: "#64748b",
  shell: "#22c55e", properties: "#64748b", plaintext: "#64748b",
};

const fileColor = (lang) => LANG_COLORS[lang] || "#64748b";

// ── Build tree from flat list ──────────────────────────────────────────────
function buildTree(files) {
  const map = {};
  const roots = [];

  // Index by path
  for (const f of files) map[f.path] = { ...f, children: [] };

  for (const f of files) {
    if (f.parentPath === "") {
      roots.push(map[f.path]);
    } else if (map[f.parentPath]) {
      map[f.parentPath].children.push(map[f.path]);
    } else {
      roots.push(map[f.path]); // orphan → show at root
    }
  }

  // Sort: folders first, then alpha
  const sort = (arr) => {
    arr.sort((a, b) => {
      if (a.folder !== b.folder) return a.folder ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    arr.forEach((n) => sort(n.children));
    return arr;
  };
  return sort(roots);
}

// ── FileIcon ──────────────────────────────────────────────────────────────
function FileIcon({ file }) {
  if (file.folder) return <Folder size={13} color="#f59e0b" />;
  const color = fileColor(file.language);
  return <FileText size={13} color={color} />;
}

// ── TreeNode (recursive) ──────────────────────────────────────────────────
function TreeNode({ node, depth, expanded, onToggle, onSelect, onRename, onDelete, onAddFile, onAddFolder, selectedId, renameId, renameVal, setRenameVal, confirmRename }) {
  const isOpen = expanded[node.id];

  return (
    <div>
      <div
        onClick={() => { if (node.folder) onToggle(node.id); else onSelect(node); }}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: `4px ${8 + depth * 14}px 4px ${4 + depth * 14}px`,
          cursor: "pointer", borderRadius: 5, margin: "0 4px",
          transition: "background 0.1s",
          background: selectedId === node.id ? "var(--accent-light)" : "transparent",
          border: selectedId === node.id ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
        }}
        onMouseEnter={(e) => { if (selectedId !== node.id) e.currentTarget.style.background = "var(--bg-hover)"; }}
        onMouseLeave={(e) => { if (selectedId !== node.id) e.currentTarget.style.background = "transparent"; }}
      >
        {/* Chevron */}
        <span style={{ width: 14, flexShrink: 0, lineHeight: 0 }}>
          {node.folder
            ? (isOpen ? <ChevronDown size={12} color="var(--text-muted)" /> : <ChevronRight size={12} color="var(--text-muted)" />)
            : null}
        </span>

        {/* Icon */}
        <span style={{ flexShrink: 0, lineHeight: 0 }}>
          {node.folder
            ? (isOpen ? <FolderOpen size={13} color="#f59e0b" /> : <Folder size={13} color="#f59e0b" />)
            : <FileIcon file={node} />}
        </span>

        {/* Name / rename input */}
        {renameId === node.id ? (
          <input
            autoFocus
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") confirmRename(node.id); if (e.key === "Escape") onRename(null); }}
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, fontSize: 11, padding: "1px 5px", marginLeft: 4 }}
          />
        ) : (
          <span style={{
            flex: 1, fontSize: 12, marginLeft: 4,
            color: selectedId === node.id ? "var(--accent)" : "var(--text-secondary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {node.name}
          </span>
        )}

        {/* Confirm rename */}
        {renameId === node.id && (
          <button className="btn-icon" style={{ padding: 2 }} onClick={(e) => { e.stopPropagation(); confirmRename(node.id); }}>
            <Check size={11} color="var(--success)" />
          </button>
        )}

        {/* Hover actions */}
        {renameId !== node.id && (
          <div className="node-actions" style={{ display: "flex", gap: 1, opacity: 0, transition: "opacity 0.1s", marginLeft: "auto" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
          >
            {node.folder && (
              <>
                <button className="btn-icon" style={{ padding: 2 }} title="New file" onClick={(e) => { e.stopPropagation(); onAddFile(node); }}>
                  <FilePlus size={11} color="var(--text-muted)" />
                </button>
                <button className="btn-icon" style={{ padding: 2 }} title="New folder" onClick={(e) => { e.stopPropagation(); onAddFolder(node); }}>
                  <FolderPlus size={11} color="var(--text-muted)" />
                </button>
              </>
            )}
            <button className="btn-icon" style={{ padding: 2 }} title="Rename" onClick={(e) => { e.stopPropagation(); onRename(node.id, node.name); }}>
              <Edit2 size={11} color="var(--text-muted)" />
            </button>
            <button className="btn-icon" style={{ padding: 2 }} title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(node); }}>
              <Trash2 size={11} color="var(--danger)" />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {node.folder && isOpen && node.children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          onAddFile={onAddFile}
          onAddFolder={onAddFolder}
          selectedId={selectedId}
          renameId={renameId}
          renameVal={renameVal}
          setRenameVal={setRenameVal}
          confirmRename={confirmRename}
        />
      ))}
    </div>
  );
}

// ── Main Explorer ─────────────────────────────────────────────────────────
export default function ProjectExplorer({ projectId, onFileOpen }) {
  const [files,       setFiles]      = useState([]);
  const [tree,        setTree]       = useState([]);
  const [expanded,    setExpanded]   = useState({});
  const [selectedId,  setSelectedId] = useState(null);
  const [loading,     setLoading]    = useState(true);
  const [search,      setSearch]     = useState("");
  const [renameId,    setRenameId]   = useState(null);
  const [renameVal,   setRenameVal]  = useState("");
  const [generating,  setGenerating] = useState(false);
  const [aiSteps,     setAiSteps]    = useState([]);
  const [aiDone,      setAiDone]     = useState(false);
  const [showAiProg,  setShowAiProg] = useState(false);

  // New file/folder inline creation
  const [creating,    setCreating]   = useState(null); // { parentPath, isFolder }
  const [newName,     setNewName]    = useState("");

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const flat = await getProjectFiles(projectId);
      setFiles(flat);
      const t = buildTree(flat);
      setTree(t);
      // Auto-expand root folders
      const initExpanded = {};
      flat.filter((f) => f.folder && f.parentPath === "").forEach((f) => { initExpanded[f.id] = true; });
      setExpanded((prev) => ({ ...initExpanded, ...prev }));
    } catch { toast.error("Failed to load files"); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const handleSelect = (file) => {
    setSelectedId(file.id);
    if (!file.folder && onFileOpen) onFileOpen(file);
  };

  const handleRenameStart = (id, currentName) => {
    setRenameId(id);
    setRenameVal(currentName);
  };

  const handleRenameConfirm = async (id) => {
    if (!renameVal.trim()) return;
    try {
      await renameFile(projectId, id, renameVal.trim());
      setRenameId(null);
      toast.success("Renamed");
      load();
    } catch { toast.error("Failed to rename"); }
  };

  const handleDelete = async (node) => {
    if (!confirm(`Delete "${node.name}"?`)) return;
    try {
      await deleteFile(projectId, node.id);
      toast.success("Deleted");
      if (selectedId === node.id) setSelectedId(null);
      load();
    } catch { toast.error("Failed to delete"); }
  };

  const startCreate = (parentNode, isFolder) => {
    setCreating({ parentPath: parentNode ? parentNode.path : "", isFolder });
    setNewName("");
    if (parentNode) setExpanded((e) => ({ ...e, [parentNode.id]: true }));
  };

  const confirmCreate = async () => {
    const name = newName.trim();
    if (!name) { setCreating(null); return; }
    const parentPath = creating.parentPath;
    const path = parentPath ? `${parentPath}/${name}` : name;
    try {
      const lang = creating.isFolder ? null : detectLanguage(name);
      await createProjectFile(projectId, {
        path, name, parentPath,
        folder: creating.isFolder,
        content: creating.isFolder ? null : "",
        language: lang,
      });
      setCreating(null);
      setNewName("");
      toast.success(`${creating.isFolder ? "Folder" : "File"} "${name}" created`);
      load();
    } catch { toast.error("Failed to create"); }
  };

  const handleAiGenerate = async () => {
    const stack = prompt("Describe your project (e.g. Spring Boot + React + MySQL Netflix clone):");
    if (!stack) return;
    setGenerating(true); setAiDone(false);
    setAiSteps(["Analyzing existing project…"]); setShowAiProg(true);
    try {
      const existing = files.map(f => ({ path: f.path }));
      setAiSteps(p => [...p, "Calling AI engineer…"]);
      const analysis = await aiAnalyzeProject(projectId, existing);
      setAiSteps(p => [...p, `✔ Detected: ${analysis.summary || "new project"}`]);
      setAiSteps(p => [...p, "Generating project structure…"]);
      const created = await aiGenerateFiles(projectId, stack, stack, files.map(f => f.path));
      setAiSteps(p => [...p, `✔ Created ${created.length} files`]);
      setAiSteps(p => [...p, "✔ Done"]);
      setAiDone(true);
      toast.success("AI generated project structure!");
      load();
    } catch (err) {
      setAiSteps(p => [...p, "✗ Error: " + (err.message || "Unknown")]);
      toast.error("AI generation failed");
    } finally { setGenerating(false); }
  };

  // Filter
  const filtered = search.trim()
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  const detectLanguage = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    const map = { js: "javascript", ts: "typescript", jsx: "javascript", tsx: "typescript", py: "python", java: "java", html: "html", css: "css", json: "json", sql: "sql", md: "markdown", yaml: "yaml", yml: "yaml", go: "go", rs: "rust", kt: "kotlin", cs: "csharp", php: "php", rb: "ruby", c: "c", cpp: "cpp", xml: "xml", sh: "shell" };
    return map[ext] || "plaintext";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {showAiProg && (
        <AiProgressWindow
          title="AI Project Generator"
          steps={aiSteps}
          done={aiDone}
          onClose={() => { setShowAiProg(false); setAiSteps([]); }}
        />
      )}

      {/* ── Header ── */}
      <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
            Explorer
          </span>
          <div style={{ display: "flex", gap: 3 }}>
            <button className="btn-icon" title="New file" onClick={() => startCreate(null, false)} style={{ padding: 4 }}>
              <FilePlus size={13} color="var(--text-muted)" />
            </button>
            <button className="btn-icon" title="New folder" onClick={() => startCreate(null, true)} style={{ padding: 4 }}>
              <FolderPlus size={13} color="var(--text-muted)" />
            </button>
            <button className="btn-icon" title="Refresh" onClick={load} style={{ padding: 4 }}>
              <RefreshCw size={12} color="var(--text-muted)" />
            </button>
            <button
              className="btn-icon"
              title="AI Generate project structure"
              onClick={handleAiGenerate}
              disabled={generating}
              style={{ padding: 4 }}
            >
              {generating
                ? <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} color="var(--accent)" />
                : <Wand2 size={13} color="var(--accent)" />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px" }}>
          <Search size={11} color="var(--text-muted)" />
          <input
            placeholder="Search files…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 11, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", padding: 0 }}
          />
          {search && (
            <button className="btn-icon" style={{ padding: 1 }} onClick={() => setSearch("")}>
              <X size={10} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tree body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>

        {loading && (
          <div style={{ padding: 16, textAlign: "center" }}>
            <Loader2 size={20} color="var(--accent)" style={{ animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
          </div>
        )}

        {!loading && files.length === 0 && !generating && (
          <div style={{ padding: "24px 12px", textAlign: "center" }}>
            <File size={28} color="var(--text-muted)" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>No files yet</p>
            <button
              className="btn btn-primary"
              onClick={handleAiGenerate}
              style={{ fontSize: 11, padding: "5px 12px" }}
              disabled={generating}
            >
              {generating ? <Loader2 size={11} style={{ animation: "spin 0.7s linear infinite" }} /> : <Wand2 size={11} />}
              AI Generate
            </button>
          </div>
        )}

        {/* Inline create at root */}
        {creating && creating.parentPath === "" && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", margin: "0 4px" }}>
            <span style={{ width: 14 }} />
            {creating.isFolder ? <Folder size={13} color="#f59e0b" /> : <File size={13} color="var(--text-muted)" />}
            <input
              autoFocus
              value={newName}
              placeholder={creating.isFolder ? "folder name…" : "file name…"}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmCreate(); if (e.key === "Escape") setCreating(null); }}
              style={{ flex: 1, fontSize: 11, padding: "2px 6px" }}
            />
            <button className="btn-icon" style={{ padding: 2 }} onClick={confirmCreate}><Check size={11} color="var(--success)" /></button>
            <button className="btn-icon" style={{ padding: 2 }} onClick={() => setCreating(null)}><X size={11} color="var(--danger)" /></button>
          </div>
        )}

        {/* Search results */}
        {filtered && (
          <div style={{ padding: "4px 0" }}>
            {filtered.length === 0 && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "8px 14px" }}>No matches</p>
            )}
            {filtered.map((f) => (
              <div
                key={f.id}
                onClick={() => handleSelect(f)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 14px", cursor: "pointer", fontSize: 12,
                  color: selectedId === f.id ? "var(--accent)" : "var(--text-secondary)",
                  background: selectedId === f.id ? "var(--accent-light)" : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (selectedId !== f.id) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={(e) => { if (selectedId !== f.id) e.currentTarget.style.background = "transparent"; }}
              >
                <FileIcon file={f} />
                <span style={{ flex: 1 }}>{f.name}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{f.parentPath || "/"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tree */}
        {!filtered && !loading && tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            expanded={expanded}
            onToggle={toggle}
            onSelect={handleSelect}
            onRename={handleRenameStart}
            onDelete={handleDelete}
            onAddFile={(parent) => startCreate(parent, false)}
            onAddFolder={(parent) => startCreate(parent, true)}
            selectedId={selectedId}
            renameId={renameId}
            renameVal={renameVal}
            setRenameVal={setRenameVal}
            confirmRename={handleRenameConfirm}
          />
        ))}
      </div>
    </div>
  );
}
