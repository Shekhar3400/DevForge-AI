import { useEffect, useState, useCallback, useRef } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, BackgroundVariant,
  Panel, MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import toast from "react-hot-toast";
import {
  Plus, Trash2, RefreshCw, X, Cpu, Database, Globe, Server,
  Lock, Layers, GitBranch, HardDrive, Zap, Box, Loader2,
  LayoutGrid, Wand2, Link2,
} from "lucide-react";

import { getArchitectures, createArchitecture } from "../../api/architectureApi";
import { getNodes, createNode, deleteNode } from "../../api/nodeApi";
import { getEdges, createEdge, deleteEdge } from "../../api/edgeApi";
import { aiFullGenerate, aiGenerateArchitecture, aiAutoConnect } from "../../api/projectFileApi";

import NodePanel from "./NodePanel";
import EdgePanel from "./EdgePanel";
import AiProgressWindow from "../ai/AiProgressWindow";

const CATEGORIES = [
  { label:"Frontend",     icon:Globe,     color:"#6366f1" },
  { label:"Backend",      icon:Server,    color:"#22c55e" },
  { label:"Database",     icon:Database,  color:"#f59e0b" },
  { label:"API",          icon:GitBranch, color:"#06b6d4" },
  { label:"Cache",        icon:Zap,       color:"#f97316" },
  { label:"Queue",        icon:Layers,    color:"#a855f7" },
  { label:"Gateway",      icon:Box,       color:"#ec4899" },
  { label:"Microservice", icon:Cpu,       color:"#14b8a6" },
  { label:"Auth",         icon:Lock,      color:"#ef4444" },
  { label:"External",     icon:Globe,     color:"#64748b" },
  { label:"Storage",      icon:HardDrive, color:"#84cc16" },
  { label:"Custom",       icon:Box,       color:"#8b5cf6" },
];

const colorOf = (type) => CATEGORIES.find(c => c.label === type)?.color || "#6366f1";

function DevForgeNode({ data, selected }) {
  const C = CATEGORIES.find(c => c.label === data.nodeType) || CATEGORIES[11];
  const Icon = C.icon;
  return (
    <div style={{
      background:"var(--bg-card)", border:`2px solid ${selected ? C.color : "var(--border)"}`,
      borderRadius:10, padding:"10px 14px", minWidth:140,
      boxShadow: selected ? `0 0 0 3px ${C.color}33` : "0 4px 12px rgba(0,0,0,0.3)",
      cursor:"grab", transition:"border-color 0.15s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:7, background:`${C.color}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={14} color={C.color} />
        </div>
        <span style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {data.label}
        </span>
      </div>
      {data.nodeType && (
        <span style={{ display:"block", marginTop:5, fontSize:10, color:C.color, background:`${C.color}18`, borderRadius:4, padding:"1px 6px", width:"fit-content" }}>
          {data.nodeType}
        </span>
      )}
      {data.technology && (
        <span style={{ display:"block", marginTop:3, fontSize:9, color:"var(--text-muted)", background:"var(--bg-primary)", borderRadius:4, padding:"1px 6px", width:"fit-content" }}>
          {data.technology}{data.framework ? ` · ${data.framework}` : ""}
        </span>
      )}
    </div>
  );
}

const nodeTypes = { devforge: DevForgeNode };
const edgeOptions = {
  type:"smoothstep",
  markerEnd:{ type:MarkerType.ArrowClosed, width:16, height:16 },
  style:{ stroke:"var(--border-light)", strokeWidth:2 },
};

export default function ArchitectureCanvas({ projectId }) {
  const [architecture,  setArchitecture]  = useState(null);
  const [archLoading,   setArchLoading]   = useState(true);
  const [nodes,         setNodes,         onNodesChange] = useNodesState([]);
  const [edges,         setEdges,         onEdgesChange] = useEdgesState([]);
  const [selectedNode,  setSelectedNode]  = useState(null);
  const [selectedEdge,  setSelectedEdge]  = useState(null);
  const [showAddPanel,  setShowAddPanel]  = useState(false);
  const [newNodeName,   setNewNodeName]   = useState("");
  const [newNodeType,   setNewNodeType]   = useState("Backend");
  const [saving,        setSaving]        = useState(false);
  const [ctxMenu,       setCtxMenu]       = useState(null);
  const [showAiInput,   setShowAiInput]   = useState(false);
  const [aiPrompt,      setAiPrompt]      = useState("");
  const [aiRunning,     setAiRunning]     = useState(false);
  const [aiSteps,       setAiSteps]       = useState([]);
  const [aiDone,        setAiDone]        = useState(false);
  const [aiError,       setAiError]       = useState(null);
  const [showProgress,  setShowProgress]  = useState(false);
  const ctxRef = useRef(null);

  const mapNode = (n) => ({
    id: String(n.id), type:"devforge",
    position:{ x: n.positionX ?? 100, y: n.positionY ?? 100 },
    data:{ label:n.label, nodeType:n.type, backendId:n.id, nodeKey:n.nodeKey, technology:n.technology, framework:n.framework },
  });

  const mapEdge = (e) => ({
    id: String(e.id), source: String(e.sourceNode), target: String(e.targetNode),
    ...edgeOptions,
    label: e.connectionName || e.protocol || "",
    labelStyle:{ fill:"var(--text-muted)", fontSize:10 },
    data:{ backendId:e.id, edgeKey:e.edgeKey, connectionName:e.connectionName, protocol:e.protocol, dataFormat:e.dataFormat, endpoints:e.endpoints, description:e.description },
  });

  const loadArchitecture = useCallback(async () => {
    if (!projectId) return;
    setArchLoading(true);
    try {
      let archs = await getArchitectures(projectId);
      let arch  = archs[0];
      if (!arch) arch = await createArchitecture({ name:"Main Architecture", projectId: Number(projectId) });
      setArchitecture(arch);
      const [bNodes, bEdges] = await Promise.all([getNodes(arch.id), getEdges(arch.id)]);
      setNodes(bNodes.map(mapNode));
      setEdges(bEdges.map(mapEdge));
    } catch { toast.error("Failed to load architecture"); }
    finally { setArchLoading(false); }
  }, [projectId]);

  useEffect(() => { loadArchitecture(); }, [loadArchitecture]);

  useEffect(() => {
    const h = (e) => { if (ctxRef.current && !ctxRef.current.contains(e.target)) setCtxMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Manual add node ──────────────────────────────────────────────────────
  const handleAddNode = async () => {
    if (!newNodeName.trim() || !architecture) return;
    setSaving(true);
    try {
      const created = await createNode({
        nodeKey: `${newNodeName.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}`,
        label: newNodeName.trim(), type: newNodeType,
        positionX: 80 + Math.random()*400, positionY: 80 + Math.random()*300,
        architectureId: architecture.id,
      });
      setNodes(n => [...n, mapNode(created)]);
      setNewNodeName(""); setShowAddPanel(false);
      toast.success("Node added");
    } catch { toast.error("Failed to add node"); }
    finally { setSaving(false); }
  };

  const handleDeleteNode = async (nodeId) => {
    setCtxMenu(null);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    try {
      await deleteNode(node.data.backendId);
      setNodes(n => n.filter(x => x.id !== nodeId));
      setEdges(e => e.filter(x => x.source !== nodeId && x.target !== nodeId));
      if (selectedNode?.id === nodeId) setSelectedNode(null);
      toast.success("Node deleted");
    } catch { toast.error("Failed to delete node"); }
  };

  const handleDeleteEdge = async (edgeId) => {
    setCtxMenu(null);
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;
    try {
      await deleteEdge(edge.data.backendId);
      setEdges(e => e.filter(x => x.id !== edgeId));
      if (selectedEdge?.id === edgeId) setSelectedEdge(null);
      toast.success("Connection deleted");
    } catch { toast.error("Failed to delete connection"); }
  };

  const onConnect = useCallback(async (params) => {
    if (!architecture) return;
    try {
      const created = await createEdge({
        edgeKey: `edge-${params.source}-${params.target}-${Date.now()}`,
        sourceNode: params.source, targetNode: params.target,
        architectureId: architecture.id,
      });
      setEdges(e => addEdge({ ...params, id:String(created.id), ...edgeOptions, data:{ backendId:created.id, edgeKey:created.edgeKey } }, e));
    } catch { toast.error("Failed to create connection"); }
  }, [architecture]);

  const onNodeDragStop = useCallback((_e, node) => {
    setNodes(n => n.map(x => x.id === node.id ? { ...x, position: node.position } : x));
  }, []);

  const onNodeClick      = useCallback((_e, node) => { setSelectedNode(node); setSelectedEdge(null); }, []);
  const onEdgeClick      = useCallback((_e, edge) => { setSelectedEdge(edge); setSelectedNode(null); }, []);
  const onPaneClick      = useCallback(() => { setSelectedNode(null); setSelectedEdge(null); setCtxMenu(null); }, []);
  const onNodeContextMenu = useCallback((e, node) => { e.preventDefault(); setCtxMenu({ type:"node", id:node.id, x:e.clientX, y:e.clientY }); }, []);
  const onEdgeContextMenu = useCallback((e, edge) => { e.preventDefault(); setCtxMenu({ type:"edge", id:edge.id, x:e.clientX, y:e.clientY }); }, []);

  // ── Edge update from panel ───────────────────────────────────────────────
  const handleEdgeUpdate = useCallback((edgeId, newData) => {
    setEdges(es => es.map(e => e.id === edgeId
      ? { ...e, label: newData.connectionName || newData.protocol || e.label, data: { ...e.data, ...newData } }
      : e));
  }, []);

  // ── AI FULL GENERATE ────────────────────────────────────────────────────
  const pushStep = (s) => setAiSteps(prev => [...prev, s]);

  const handleAiFullGenerate = async () => {
    if (!aiPrompt.trim() || !architecture) return;
    setAiRunning(true); setAiDone(false); setAiError(null);
    setAiSteps(["Starting AI Software Engineer…"]); setShowProgress(true); setShowAiInput(false);
    try {
      pushStep("Analyzing existing project…");
      const result = await aiFullGenerate(projectId, architecture.id, aiPrompt, "", []);
      // Apply returned steps
      if (result.steps) result.steps.forEach(s => pushStep(s));
      // Reload architecture to show generated nodes + edges
      await loadArchitecture();
      setAiDone(true);
      toast.success("AI generated complete project!");
    } catch (err) {
      setAiError(err.message);
      pushStep("✗ Error: " + (err.message || "Unknown error"));
      toast.error("AI generation failed");
    } finally { setAiRunning(false); }
  };

  const handleAiArchOnly = async () => {
    if (!aiPrompt.trim() || !architecture) return;
    setAiRunning(true); setAiDone(false); setAiError(null);
    setAiSteps(["Designing architecture…"]); setShowProgress(true); setShowAiInput(false);
    try {
      pushStep("Calling AI architect…");
      const result = await aiGenerateArchitecture(projectId, architecture.id, aiPrompt);
      pushStep(`✔ Created ${result.nodeCount || 0} nodes with modules`);
      pushStep("Auto-connecting nodes…");
      await aiAutoConnect(architecture.id, result);
      pushStep("✔ Connections established");
      await loadArchitecture();
      pushStep("✔ Architecture complete");
      setAiDone(true);
      toast.success("Architecture generated!");
    } catch (err) {
      setAiError(err.message);
      pushStep("✗ " + (err.message || "Failed"));
    } finally { setAiRunning(false); }
  };

  const handleAutoConnect = async () => {
    if (!architecture || nodes.length < 2) { toast("Add at least 2 nodes first"); return; }
    setAiRunning(true); setAiDone(false); setAiError(null);
    setAiSteps(["Auto-connecting existing nodes…"]); setShowProgress(true);
    try {
      const archResult = {
        nodes: nodes.map(n => ({ id: n.data.backendId, label: n.data.label, type: n.data.nodeType }))
      };
      const created = await aiAutoConnect(architecture.id, archResult);
      pushStep(`✔ Created ${created.length} connections`);
      await loadArchitecture();
      setAiDone(true);
      toast.success("Nodes connected!");
    } catch (err) {
      pushStep("✗ " + (err.message || "Failed"));
      setAiError(err.message);
    } finally { setAiRunning(false); }
  };

  if (archLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:"var(--bg-primary)" }}>
      <div style={{ textAlign:"center" }}>
        <Loader2 size={32} color="var(--accent)" style={{ animation:"spin 0.7s linear infinite", margin:"0 auto 12px" }} />
        <p style={{ color:"var(--text-secondary)", fontSize:13 }}>Loading architecture…</p>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100%", background:"var(--bg-primary)", position:"relative" }}>
      {showProgress && (
        <AiProgressWindow
          title="AI Software Engineer"
          steps={aiSteps}
          done={aiDone}
          error={aiError}
          onClose={() => { setShowProgress(false); setAiSteps([]); }}
        />
      )}

      <div style={{ flex:1, position:"relative" }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick} onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick} onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={onNodeContextMenu} onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes} defaultEdgeOptions={edgeOptions}
          fitView fitViewOptions={{ padding:0.2 }} deleteKeyCode="Delete"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
          <Controls style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8 }} />
          <MiniMap nodeColor={n => colorOf(n.data?.nodeType)} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8 }} />

          {/* Toolbar */}
          <Panel position="top-left">
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <button className="btn btn-primary" onClick={() => setShowAddPanel(v => !v)} style={{ fontSize:11, padding:"5px 10px" }}>
                <Plus size={12} /> Add Node
              </button>
              <button className="btn btn-ghost" onClick={() => setShowAiInput(v => !v)} style={{ fontSize:11, padding:"5px 10px" }} title="AI: Generate complete architecture">
                <Wand2 size={12} color="var(--accent)" /> AI Generate
              </button>
              <button className="btn btn-ghost" onClick={handleAutoConnect} disabled={aiRunning} style={{ fontSize:11, padding:"5px 10px" }} title="AI: Auto-connect existing nodes">
                <Link2 size={12} color="#22c55e" /> Auto-Connect
              </button>
              <button className="btn btn-ghost" onClick={loadArchitecture} style={{ fontSize:11, padding:"5px 10px" }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
          </Panel>

          <Panel position="top-right">
            <div style={{ padding:"4px 10px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:11, color:"var(--text-muted)", display:"flex", gap:8 }}>
              <LayoutGrid size={12} />
              {nodes.length} nodes · {edges.length} connections
            </div>
          </Panel>
        </ReactFlow>

        {/* AI prompt input */}
        {showAiInput && (
          <div style={{
            position:"absolute", top:52, left:8, zIndex:50,
            background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10,
            padding:16, width:320, boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)", display:"flex", alignItems:"center", gap:6 }}>
                <Wand2 size={13} color="var(--accent)" /> AI Software Engineer
              </span>
              <button className="btn-icon" onClick={() => setShowAiInput(false)}><X size={14} /></button>
            </div>
            <textarea
              autoFocus
              placeholder="Describe what to build… e.g. 'Build a Netflix clone with React + Spring Boot + MySQL'"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              rows={3}
              style={{ width:"100%", fontSize:12, marginBottom:10, resize:"vertical", padding:"8px 10px", borderRadius:8 }}
            />
            <div style={{ display:"flex", gap:6 }}>
              <button className="btn btn-primary" onClick={handleAiFullGenerate} disabled={aiRunning || !aiPrompt.trim()} style={{ flex:1, justifyContent:"center", fontSize:11 }}>
                {aiRunning ? <><Loader2 size={11} style={{ animation:"spin 0.7s linear infinite" }} /> Running…</> : <><Wand2 size={11} /> Full Generate</>}
              </button>
              <button className="btn btn-ghost" onClick={handleAiArchOnly} disabled={aiRunning || !aiPrompt.trim()} style={{ flex:1, justifyContent:"center", fontSize:11 }}>
                Arch Only
              </button>
            </div>
            <p style={{ fontSize:10, color:"var(--text-muted)", marginTop:8, textAlign:"center" }}>
              Full Generate: architecture + files + code
            </p>
          </div>
        )}

        {/* Add Node panel */}
        {showAddPanel && (
          <div style={{ position:"absolute", top:52, left:8, zIndex:50, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:16, width:240, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>Add Node</span>
              <button className="btn-icon" onClick={() => setShowAddPanel(false)}><X size={14} /></button>
            </div>
            <input autoFocus placeholder="Node name…" value={newNodeName} onChange={e => setNewNodeName(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleAddNode()} style={{ width:"100%", fontSize:12, marginBottom:10 }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:12 }}>
              {CATEGORIES.map(({ label, icon:Icon, color }) => (
                <button key={label} onClick={() => setNewNodeType(label)} style={{
                  display:"flex", alignItems:"center", gap:5, padding:"5px 8px", borderRadius:6, fontSize:11, cursor:"pointer",
                  background: newNodeType===label ? `${color}22` : "transparent",
                  border:`1px solid ${newNodeType===label ? color : "var(--border)"}`,
                  color: newNodeType===label ? color : "var(--text-muted)",
                }}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleAddNode} disabled={saving || !newNodeName.trim()} style={{ width:"100%", justifyContent:"center", fontSize:12 }}>
              {saving ? <><span className="spinner" style={{ width:12, height:12 }} />Adding…</> : <><Plus size={13} />Add Node</>}
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {(selectedNode || selectedEdge) && (
        <div style={{ width:290, borderLeft:"1px solid var(--border)", background:"var(--bg-secondary)", overflowY:"auto", flexShrink:0 }}>
          {selectedNode && (
            <NodePanel node={selectedNode}
              onDelete={() => handleDeleteNode(selectedNode.id)}
              onClose={() => setSelectedNode(null)} />
          )}
          {selectedEdge && (
            <EdgePanel edge={selectedEdge} nodes={nodes}
              onDelete={() => handleDeleteEdge(selectedEdge.id)}
              onClose={() => setSelectedEdge(null)}
              onUpdate={handleEdgeUpdate} />
          )}
        </div>
      )}

      {/* Context menu */}
      {ctxMenu && (
        <div ref={ctxRef} style={{ position:"fixed", top:ctxMenu.y, left:ctxMenu.x, zIndex:9999, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, padding:4, minWidth:160, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
          {ctxMenu.type==="node" && (
            <>
              <div style={{ padding:"4px 10px 6px", fontSize:11, color:"var(--text-muted)", borderBottom:"1px solid var(--border)", marginBottom:4 }}>Node options</div>
              <button style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", borderRadius:5, fontSize:12, color:"var(--danger)", background:"transparent", cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background="var(--danger-light)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
                onClick={() => handleDeleteNode(ctxMenu.id)}>
                <Trash2 size={13} /> Delete Node
              </button>
            </>
          )}
          {ctxMenu.type==="edge" && (
            <>
              <div style={{ padding:"4px 10px 6px", fontSize:11, color:"var(--text-muted)", borderBottom:"1px solid var(--border)", marginBottom:4 }}>Connection options</div>
              <button style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", borderRadius:5, fontSize:12, color:"var(--danger)", background:"transparent", cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background="var(--danger-light)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
                onClick={() => handleDeleteEdge(ctxMenu.id)}>
                <Trash2 size={13} /> Delete Connection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
