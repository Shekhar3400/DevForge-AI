import { useNavigate } from "react-router-dom";
import { Code2, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-primary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ textAlign: "center" }} className="fade-in">
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "var(--accent-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <Code2 size={32} color="var(--accent)" />
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, color: "var(--accent)", lineHeight: 1, marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>
          This page doesn't exist or you don't have access to it.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Go Back
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            <Home size={14} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
