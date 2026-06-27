import { useEffect, useState } from "react";
import { Code2, CheckCircle, AlertCircle } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function OAuthSuccess() {
  const { setAuth } = useAuthStore();
  const [status,  setStatus]  = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      // Use URLSearchParams — it automatically decodes %XX sequences
      const params   = new URLSearchParams(window.location.search);
      const token    = params.get("token");    // already decoded by URLSearchParams
      const name     = params.get("name")    || "";
      const email    = params.get("email")   || "";
      const provider = params.get("provider")|| "GOOGLE";
      const picture  = params.get("picture") || "";

      console.log("[OAuthSuccess] token:", token ? token.substring(0,20)+"..." : "MISSING");
      console.log("[OAuthSuccess] email:", email);

      if (!token) {
        setStatus("error");
        setMessage("No authentication token received. Please try again.");
        return;
      }

      // Write directly to localStorage first
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        name, email, provider, pictureUrl: picture,
      }));

      // Sync Zustand
      setAuth(token, { name, email, provider, pictureUrl: picture });

      setStatus("success");

      // Hard navigate — full page reload ensures ProtectedRoute reads fresh localStorage
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);

    } catch (err) {
      console.error("[OAuthSuccess] error:", err);
      setStatus("error");
      setMessage("Login failed: " + err.message);
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-primary)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div className="card fade-in" style={{ padding: 40, textAlign: "center", maxWidth: 380, margin: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "linear-gradient(135deg, var(--accent), var(--purple))",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Code2 size={26} color="#fff" />
        </div>

        {status === "loading" && (
          <>
            <span className="spinner" style={{ margin: "0 auto 16px", display: "block" }} />
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Completing sign in…
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={36} color="#22c55e" style={{ margin: "0 auto 16px", display: "block" }} />
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Signed in!
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Redirecting…</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle size={36} color="#ef4444" style={{ margin: "0 auto 16px", display: "block" }} />
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Authentication failed
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>{message}</p>
            <button className="btn btn-primary" style={{ fontSize: 13 }}
              onClick={() => { window.location.href = "/login"; }}>
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
