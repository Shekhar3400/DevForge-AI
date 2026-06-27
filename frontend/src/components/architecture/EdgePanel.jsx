import { useState } from "react";
import { X, Trash2, Edit2, Check, GitBranch, Zap, Globe, Database, Server, Box } from "lucide-react";
import { updateEdge } from "../../api/edgeApi";
import toast from "react-hot-toast";

const PROTOCOLS = ["REST","GraphQL","WebSocket","Kafka","RabbitMQ","gRPC","JPA","Redis","JDBC","AMQP"];
const FORMATS   = ["JSON","XML","Binary","Protobuf","Text","SQL"];

const PROTOCOL_COLORS = {
  REST:"#6366f1", GraphQL:"#e535ab", WebSocket:"#22c55e",
  Kafka:"#f59e0b", RabbitMQ:"#ef4444", gRPC:"#06b6d4",
  JPA:"#f97316", Redis:"#dc2626", JDBC:"#8b5cf6",
};

export default function EdgePanel({ edge, nodes, onDelete, onClose, onUpdate }) {
  if (!edge) return null;

  const backendId = edge.data?.backendId;

  // Resolve node labels from id
  const srcNode = nodes?.find(n => String(n.id) === String(edge.source));
  const tgtNode = nodes?.find(n => String(n.id) === String(edge.target));
  const srcLabel = srcNode?.data?.label || `Node ${edge.source}`;
  const tgtLabel = tgtNode?.data?.label || `Node ${edge.target}`;

  const [editing,     setEditing]  = useState(false);
  const [saving,      setSaving]   = useState(false);
  const [form, setForm] = useState({
    connectionName: edge.data?.connectionName || "",
    protocol:       edge.data?.protocol       || "REST",
    dataFormat:     edge.data?.dataFormat      || "JSON",
    endpoints:      edge.data?.endpoints       || "",
    description:    edge.data?.description     || "",
  });

  const protoColor = PROTOCOL_COLORS[form.protocol] || "#6366f1";

  const handleSave = async () => {
    if (!backendId) return;
    setSaving(true);
    try {
      const updated = await updateEdge(backendId, form);
      if (onUpdate) onUpdate(edge.id, { ...edge.data, ...form });
      setEditing(false);
      toast.success("Connection updated");
    } catch { toast.error("Failed to update connection"); }
    finally { setSaving(false); }
  };

  const row = (label, value, color) => (
    <div style={{ marginBottom: 10 }}>
      <span style={{ display:"block", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>
        {label}
      </span>
      <span style={{ fontSize:12, color: color || "var(--text-primary)", background:"var(--bg-card)", display:"block", padding:"5px 10px", borderRadius:6, border:"1px solid var(--border)" }}>
        {value || <span style={{color:"var(--text-muted)"}}>—</span>}
      </span>
    </div>
  );

  return (
    <div style={{ padding:14, display:"flex", flexDirection:"column", height:"100%", overflow:"auto" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:`${protoColor}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <GitBranch size={15} color={protoColor} />
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>Connection</div>
            <div style={{ fontSize:10, color:protoColor }}>{form.protocol}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {!editing && (
            <button className="btn-icon" onClick={() => setEditing(true)} title="Edit" style={{ padding:4 }}>
              <Edit2 size={13} color="var(--text-muted)" />
            </button>
          )}
          {editing && (
            <button className="btn-icon" onClick={handleSave} disabled={saving} title="Save" style={{ padding:4 }}>
              <Check size={13} color="var(--success)" />
            </button>
          )}
          <button className="btn-icon" onClick={onClose} style={{ padding:4 }}><X size={14} /></button>
        </div>
      </div>

      {/* Flow diagram */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:"var(--bg-card)", borderRadius:8, border:"1px solid var(--border)", marginBottom:14 }}>
        <span style={{ fontSize:11, fontWeight:600, color:"var(--text-primary)", flex:1, textAlign:"center" }}>{srcLabel}</span>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ height:1, width:40, background:protoColor, position:"relative" }}>
            <span style={{ position:"absolute", right:-4, top:-4, fontSize:10, color:protoColor }}>▶</span>
          </div>
          <span style={{ fontSize:9, color:protoColor, background:`${protoColor}18`, padding:"1px 6px", borderRadius:4 }}>
            {form.protocol}
          </span>
        </div>
        <span style={{ fontSize:11, fontWeight:600, color:"var(--text-primary)", flex:1, textAlign:"center" }}>{tgtLabel}</span>
      </div>

      {/* Fields */}
      {editing ? (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[{label:"Connection Name",key:"connectionName",type:"text"},
            {label:"Endpoints / Topics",key:"endpoints",type:"text"},
            {label:"Description",key:"description",type:"textarea"}
          ].map(({label,key,type}) => (
            <div key={key}>
              <span style={{ display:"block", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", marginBottom:3 }}>{label}</span>
              {type === "textarea"
                ? <textarea value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))}
                    rows={3} style={{ width:"100%", fontSize:11, padding:"5px 8px", borderRadius:6, resize:"vertical" }} />
                : <input value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))}
                    style={{ width:"100%", fontSize:11, padding:"5px 8px" }} />}
            </div>
          ))}
          <div>
            <span style={{ display:"block", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", marginBottom:3 }}>Protocol</span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {PROTOCOLS.map(p => (
                <button key={p} onClick={() => setForm(f=>({...f,protocol:p}))} style={{
                  padding:"3px 8px", borderRadius:5, fontSize:10, cursor:"pointer",
                  background: form.protocol===p ? `${PROTOCOL_COLORS[p]||"#6366f1"}22` : "var(--bg-card)",
                  border:`1px solid ${form.protocol===p ? (PROTOCOL_COLORS[p]||"#6366f1") : "var(--border)"}`,
                  color: form.protocol===p ? (PROTOCOL_COLORS[p]||"#6366f1") : "var(--text-muted)",
                }}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <span style={{ display:"block", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", marginBottom:3 }}>Data Format</span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {FORMATS.map(f => (
                <button key={f} onClick={() => setForm(fm=>({...fm,dataFormat:f}))} style={{
                  padding:"3px 8px", borderRadius:5, fontSize:10, cursor:"pointer",
                  background: form.dataFormat===f ? "var(--accent-light)" : "var(--bg-card)",
                  border:`1px solid ${form.dataFormat===f ? "var(--accent)" : "var(--border)"}`,
                  color: form.dataFormat===f ? "var(--accent)" : "var(--text-muted)",
                }}>{f}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {row("Connection Name", form.connectionName, protoColor)}
          {row("Protocol", form.protocol, protoColor)}
          {row("Data Format", form.dataFormat)}
          {form.endpoints && row("Endpoints / Topics", form.endpoints)}
          {form.description && row("Description", form.description)}
        </>
      )}

      <div style={{ marginTop:"auto", paddingTop:14, borderTop:"1px solid var(--border)" }}>
        <button className="btn btn-danger" onClick={onDelete} style={{ width:"100%", justifyContent:"center", fontSize:12 }}>
          <Trash2 size={13} /> Delete Connection
        </button>
      </div>
    </div>
  );
}
