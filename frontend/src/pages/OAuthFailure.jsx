import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function OAuthFailure() {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const errorMsg   = params.get("error") || "Google login failed. Please try again.";

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div className="card fade-in" style={{ padding: 40, textAlign: "center", maxWidth: 380 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "var(--danger-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <AlertCircle size={26} color="var(--danger)" />
        </div>

        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          Google Login Failed
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
          {decodeURIComponent(errorMsg)}
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/login")} style={{ fontSize: 13 }}>
            <ArrowLeft size={14} /> Back to Login
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { window.location.href = "http://localhost:8080/oauth2/authorization/google"; }}
            style={{ fontSize: 13 }}
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
