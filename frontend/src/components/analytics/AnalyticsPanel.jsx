import { useEffect, useState } from "react";
import {
  Layers, Zap, GitBranch, MessageSquare,
  RefreshCw, BarChart2, Activity, CheckCircle,
  Loader2,
} from "lucide-react";

import { getModules }       from "../../api/moduleApi";
import { getFeatures }      from "../../api/featureApi";
import { getArchitectures } from "../../api/architectureApi";
import { getNodes }         from "../../api/nodeApi";
import { getEdges }         from "../../api/edgeApi";
import { getChats }         from "../../api/chatApi";
import { getProjectContext, regenerateContext } from "../../api/contextApi";

export default function AnalyticsPanel({ projectId }) {
  const [stats,     setStats]     = useState(null);
  const [context,   setContext]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [ctxLoading,setCtxLoading]= useState(false);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [modules, architectures, chats] = await Promise.all([
        getModules(projectId),
        getArchitectures(projectId),
        getChats(projectId),
      ]);

      let totalFeatures = 0;
      let totalNodes = 0;
      let totalEdges = 0;

      // Load features in parallel
      const featPromises = modules.map((m) => getFeatures(m.id));
      const featureArrays = await Promise.all(featPromises);
      featureArrays.forEach((arr) => { totalFeatures += arr.length; });

      // Load nodes+edges if architecture exists
      if (architectures.length > 0) {
        const archId = architectures[0].id;
        const [nodes, edges] = await Promise.all([getNodes(archId), getEdges(archId)]);
        totalNodes = nodes.length;
        totalEdges = edges.length;
      }

      setStats({
        modules:      modules.length,
        features:     totalFeatures,
        nodes:        totalNodes,
        edges:        totalEdges,
        chats:        chats.length,
        architectures:architectures.length,
      });

      // Load context
      const ctx = await getProjectContext(projectId);
      setContext(ctx);
    } catch {
      // fail silently — partial data is fine
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setCtxLoading(true);
    try {
      const ctx = await regenerateContext(projectId);
      setContext(ctx);
    } catch {
      /* silent */
    } finally {
      setCtxLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const METRICS = stats ? [
    { label: "Modules",       value: stats.modules,       icon: Layers,        color: "#6366f1" },
    { label: "Features",      value: stats.features,      icon: Zap,           color: "#a855f7" },
    { label: "Arch Nodes",    value: stats.nodes,         icon: BarChart2,     color: "#06b6d4" },
    { label: "Connections",   value: stats.edges,         icon: GitBranch,     color: "#22c55e" },
    { label: "Chat Sessions", value: stats.chats,         icon: MessageSquare, color: "#f97316" },
    { label: "Architectures", value: stats.architectures, icon: Activity,      color: "#ec4899" },
  ] : [];

  const healthScore = stats
    ? Math.min(100, Math.round(
        (stats.modules > 0 ? 20 : 0) +
        (stats.features > 0 ? 20 : 0) +
        (stats.nodes > 0 ? 20 : 0) +
        (stats.edges > 0 ? 20 : 0) +
        (stats.chats > 0 ? 20 : 0)
      ))
    : 0;

  const healthColor = healthScore >= 80 ? "#22c55e" : healthScore >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg-primary)", padding: 24 }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Project Analytics</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>Overview of your project structure</p>
          </div>
          <button className="btn btn-ghost" onClick={load} style={{ fontSize: 12 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <Loader2 size={28} color="var(--accent)" style={{ animation: "spin 0.7s linear infinite" }} />
          </div>
        )}

        {!loading && stats && (
          <>
            {/* Health score */}
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Architecture Health</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: healthColor }}>{healthScore}%</span>
              </div>
              <div style={{ height: 8, background: "var(--bg-hover)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${healthScore}%`, background: healthColor, borderRadius: 4, transition: "width 0.8s ease" }} />
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                {healthScore === 100 ? "Excellent — all dimensions populated" :
                 healthScore >= 60  ? "Good — a few areas could use more detail" :
                                      "Getting started — add modules, features, and architecture nodes"}
              </p>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {METRICS.map(({ label, value, icon: Icon, color: c }) => (
                <div key={label} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${c}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={c} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Completion checklist */}
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Project Completion
              </h3>
              {[
                { label: "At least one module",      done: stats.modules > 0      },
                { label: "Features defined",         done: stats.features > 0     },
                { label: "Architecture designed",    done: stats.nodes > 0        },
                { label: "Services connected",       done: stats.edges > 0        },
                { label: "AI chat session created",  done: stats.chats > 0        },
              ].map(({ label, done }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <CheckCircle size={15} color={done ? "#22c55e" : "var(--text-muted)"} />
                  <span style={{ fontSize: 13, color: done ? "var(--text-primary)" : "var(--text-muted)" }}>{label}</span>
                  {done && <span style={{ marginLeft: "auto", fontSize: 10, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "1px 7px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.2)" }}>Done</span>}
                </div>
              ))}
            </div>

            {/* Context JSON */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Project Context (AI Input)</span>
                <button
                  className="btn btn-ghost"
                  onClick={handleRegenerate}
                  disabled={ctxLoading}
                  style={{ fontSize: 12 }}
                >
                  {ctxLoading
                    ? <><Loader2 size={12} style={{ animation: "spin 0.7s linear infinite" }} /> Regenerating…</>
                    : <><RefreshCw size={12} /> Regenerate</>}
                </button>
              </div>
              <pre style={{
                margin: 0, padding: 16,
                fontSize: 11, lineHeight: 1.6,
                color: "var(--text-secondary)",
                fontFamily: "ui-monospace, Consolas, monospace",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: 300,
                overflowY: "auto",
                background: "var(--bg-primary)",
              }}>
                {context?.contextJson
                  ? (() => { try { return JSON.stringify(JSON.parse(context.contextJson), null, 2); } catch { return context.contextJson; } })()
                  : "No context generated yet. Click Regenerate."}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
