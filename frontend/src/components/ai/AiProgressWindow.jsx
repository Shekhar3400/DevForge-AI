import { useEffect, useRef } from "react";
import { X, CheckCircle2, Loader2, AlertCircle, Wand2 } from "lucide-react";

export default function AiProgressWindow({ steps = [], title = "AI is working…", onClose, done = false, error = null }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9000,
      background:"rgba(0,0,0,0.6)", backdropFilter:"blur(3px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div style={{
        width: 440, maxHeight: "80vh",
        background:"var(--bg-card)", border:"1px solid var(--border)",
        borderRadius:14, boxShadow:"0 24px 64px rgba(0,0,0,0.6)",
        display:"flex", flexDirection:"column", overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"14px 16px", borderBottom:"1px solid var(--border)",
          background:"var(--bg-secondary)",
        }}>
          <div style={{
            width:32, height:32, borderRadius:8, background:"var(--accent-light)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {done
              ? <CheckCircle2 size={16} color="var(--success)" />
              : error
                ? <AlertCircle size={16} color="var(--danger)" />
                : <Loader2 size={16} color="var(--accent)" style={{ animation:"spin 0.7s linear infinite" }} />}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{title}</div>
            <div style={{ fontSize:10, color:"var(--text-muted)" }}>
              {done ? "Completed successfully" : error ? "An error occurred" : "Processing…"}
            </div>
          </div>
          {(done || error) && (
            <button className="btn-icon" onClick={onClose} style={{ padding:4 }}>
              <X size={15} color="var(--text-muted)" />
            </button>
          )}
        </div>

        {/* Steps */}
        <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:6 }}>
          {steps.map((step, i) => {
            const isDone    = typeof step === "string" && step.startsWith("✔");
            const isErr     = typeof step === "string" && step.startsWith("✗");
            const isRunning = !isDone && !isErr && i === steps.length - 1 && !done;
            const text      = typeof step === "string" ? step : String(step);

            return (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", gap:10,
                padding:"7px 10px", borderRadius:8,
                background: isDone ? "rgba(34,197,94,0.07)"
                           : isErr ? "rgba(239,68,68,0.07)"
                           : isRunning ? "var(--accent-light)" : "transparent",
                border: isRunning ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                transition:"all 0.2s",
              }}>
                <span style={{ flexShrink:0, marginTop:1 }}>
                  {isDone
                    ? <CheckCircle2 size={13} color="var(--success)" />
                    : isErr
                      ? <AlertCircle size={13} color="var(--danger)" />
                      : isRunning
                        ? <Loader2 size={13} color="var(--accent)" style={{ animation:"spin 0.7s linear infinite" }} />
                        : <div style={{ width:13, height:13, borderRadius:"50%", background:"var(--border)", marginTop:1 }} />}
                </span>
                <span style={{
                  fontSize:12, lineHeight:1.5,
                  color: isDone ? "var(--success)" : isErr ? "var(--danger)" : isRunning ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: isRunning ? 600 : 400,
                }}>
                  {text.replace(/^[✔✗]\s*/,"")}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        {(done || error) && (
          <div style={{ padding:"10px 16px", borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            <button className="btn btn-primary" onClick={onClose} style={{ width:"100%", justifyContent:"center", fontSize:12 }}>
              {done ? "✔ Done — Close" : "Close"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
