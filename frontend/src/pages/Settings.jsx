import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Bell, Palette, Keyboard, Shield, Bot, Save, Check } from "lucide-react";
import Navbar      from "../components/layout/Navbar";
import useAuthStore from "../store/authStore";

const TABS = [
  { id: "profile",       label: "Profile",        icon: User    },
  { id: "appearance",    label: "Appearance",      icon: Palette },
  { id: "ai",            label: "AI Settings",     icon: Bot     },
  { id: "notifications", label: "Notifications",   icon: Bell    },
  { id: "shortcuts",     label: "Shortcuts",       icon: Keyboard},
  { id: "security",      label: "Security",        icon: Shield  },
];

const SHORTCUTS = [
  { action: "Send message",           keys: ["Enter"]              },
  { action: "New line in chat",       keys: ["Shift", "Enter"]     },
  { action: "New project",            keys: ["Ctrl", "N"]          },
  { action: "Open global search",     keys: ["Ctrl", "K"]          },
  { action: "Toggle chat panel",      keys: ["Ctrl", "\\"]         },
  { action: "Save in editor",         keys: ["Ctrl", "S"]          },
  { action: "Delete selected node",   keys: ["Del"]                },
  { action: "Fit view (canvas)",      keys: ["Ctrl", "Shift", "F"] },
];

export default function Settings() {
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved,      setSaved]    = useState(false);
  const [theme,      setTheme]    = useState("dark");
  const [notifs,     setNotifs]   = useState({ projectUpdates: true, chatMessages: true, teamActivity: false });
  const [aiSettings, setAiSettings] = useState({ memory: 20, temperature: "balanced", streamingUI: true });

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved");
    setTimeout(() => setSaved(false), 2000);
  };

  const kbd = (k) => (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontFamily: "ui-monospace, Consolas, monospace", minWidth: 24 }}>
      {k}
    </span>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)", overflow: "hidden" }}>
      <Navbar breadcrumbs={[{ label: "Dashboard", onClick: () => navigate("/dashboard") }, { label: "Settings" }]} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: "12px 8px", overflowY: "auto" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                width: "100%", padding: "8px 12px", borderRadius: 7,
                fontSize: 13, fontWeight: activeTab === id ? 600 : 400,
                background: activeTab === id ? "var(--accent-light)" : "transparent",
                color: activeTab === id ? "var(--accent)" : "var(--text-secondary)",
                border: "none", cursor: "pointer", fontFamily: "inherit",
                marginBottom: 2, textAlign: "left", transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { if (activeTab !== id) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={(e) => { if (activeTab !== id) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          <div style={{ maxWidth: 540 }}>

            {/* ── Profile ── */}
            {activeTab === "profile" && (
              <div className="fade-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Profile</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Your personal information</p>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                  {/* Avatar — shows Google picture if available */}
                  {user?.pictureUrl ? (
                    <img
                      src={user.pictureUrl}
                      alt={user.name}
                      style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff" }}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{user?.name || "User"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{user?.email || ""}</div>
                    {/* Provider badge */}
                    <div style={{ marginTop: 5 }}>
                      {user?.provider === "GOOGLE" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(66,133,244,0.15)", color: "#4285F4", border: "1px solid rgba(66,133,244,0.3)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          Google Account
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--accent-light)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.3)" }}>
                          ✉ Email &amp; Password
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {[["Full Name", user?.name || ""], ["Email Address", user?.email || ""]].map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                    <input defaultValue={val} style={{ width: "100%", fontSize: 13 }} />
                  </div>
                ))}

                <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 4, fontSize: 13 }}>
                  {saved ? <><Check size={13} />Saved!</> : <><Save size={13} />Save Changes</>}
                </button>
              </div>
            )}

            {/* ── Appearance ── */}
            {activeTab === "appearance" && (
              <div className="fade-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Appearance</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Customize the look and feel</p>

                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Theme</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  {[{ id: "dark", label: "Dark", bg: "#0d0e14" }, { id: "light", label: "Light", bg: "#ffffff" }, { id: "system", label: "System", bg: "linear-gradient(135deg,#0d0e14 50%,#fff 50%)" }].map((t) => (
                    <button key={t.id} onClick={() => setTheme(t.id)} style={{
                      padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                      border: `2px solid ${theme === t.id ? "var(--accent)" : "var(--border)"}`,
                      background: "var(--bg-card)", color: "var(--text-primary)",
                      fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "border-color 0.15s",
                    }}>
                      <div style={{ width: 40, height: 24, borderRadius: 5, background: t.bg, border: "1px solid var(--border)" }} />
                      {t.label}
                      {theme === t.id && <Check size={12} color="var(--accent)" />}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: 13 }}>
                  {saved ? <><Check size={13} />Saved!</> : <><Save size={13} />Save Changes</>}
                </button>
              </div>
            )}

            {/* ── AI Settings ── */}
            {activeTab === "ai" && (
              <div className="fade-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>AI Settings</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Configure your AI assistant behaviour</p>

                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Conversation Memory</h3>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Messages in context ({aiSettings.memory})
                  </label>
                  <input
                    type="range" min={5} max={50} step={5}
                    value={aiSettings.memory}
                    onChange={(e) => setAiSettings((s) => ({ ...s, memory: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: "var(--accent)" }}
                  />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                    Higher = more context for AI, higher token usage. Configured in application.yml → openrouter.memory-size
                  </p>
                </div>

                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Response Style</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["precise", "balanced", "creative"].map((s) => (
                      <button key={s} onClick={() => setAiSettings((a) => ({ ...a, temperature: s }))} style={{
                        flex: 1, padding: "8px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer",
                        background: aiSettings.temperature === s ? "var(--accent-light)" : "var(--bg-card)",
                        border: `1px solid ${aiSettings.temperature === s ? "var(--accent)" : "var(--border)"}`,
                        color: aiSettings.temperature === s ? "var(--accent)" : "var(--text-secondary)",
                        fontFamily: "inherit", fontWeight: aiSettings.temperature === s ? 600 : 400,
                        textTransform: "capitalize", transition: "all 0.1s",
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Typing Animation</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Show typing indicator while AI responds</div>
                  </div>
                  <div onClick={() => setAiSettings((s) => ({ ...s, streamingUI: !s.streamingUI }))}
                    style={{ width: 40, height: 22, borderRadius: 11, background: aiSettings.streamingUI ? "var(--accent)" : "var(--border)", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: 3, left: aiSettings.streamingUI ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                  </div>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Active Model Routing</h3>
                  {[
                    ["Architecture",  "deepseek/deepseek-r1",       "#6366f1"],
                    ["Backend/Code",  "openai/gpt-4.1",             "#22c55e"],
                    ["Frontend",      "openai/gpt-4.1",             "#06b6d4"],
                    ["Debugging",     "anthropic/claude-sonnet-4-5","#ef4444"],
                    ["Documentation", "google/gemini-2.5-pro",      "#f59e0b"],
                    ["Database",      "deepseek/deepseek-r1",       "#a855f7"],
                    ["Security",      "anthropic/claude-sonnet-4-5","#ec4899"],
                    ["Planning",      "deepseek/deepseek-r1",       "#14b8a6"],
                    ["General Chat",  "openai/gpt-4.1",             "#8b5cf6"],
                  ].map(([intent, model, c]) => (
                    <div key={intent} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{intent}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: `${c}18`, color: c, border: `1px solid ${c}33`, fontFamily: "ui-monospace, Consolas, monospace" }}>{model}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Configurable in application.yml → openrouter.models</p>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {activeTab === "notifications" && (
              <div className="fade-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Notifications</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Control what you hear about</p>
                <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
                  {[
                    { key: "projectUpdates", label: "Project Updates",  desc: "When projects are created or modified" },
                    { key: "chatMessages",   label: "Chat Messages",    desc: "When you receive AI responses"         },
                    { key: "teamActivity",   label: "Team Activity",    desc: "When teammates make changes"           },
                  ].map(({ key, label, desc }, i, arr) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div>
                      </div>
                      <div onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
                        style={{ width: 40, height: 22, borderRadius: 11, background: notifs[key] ? "var(--accent)" : "var(--border)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: 3, left: notifs[key] ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: 13 }}>
                  {saved ? <><Check size={13} />Saved!</> : <><Save size={13} />Save Changes</>}
                </button>
              </div>
            )}

            {/* ── Shortcuts ── */}
            {activeTab === "shortcuts" && (
              <div className="fade-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Keyboard Shortcuts</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Speed up your workflow</p>
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  {SHORTCUTS.map(({ action, keys }, i, arr) => (
                    <div key={action} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{action}</span>
                      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                        {keys.map((k, ki) => (
                          <span key={ki} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            {kbd(k)}
                            {ki < keys.length - 1 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Security ── */}
            {activeTab === "security" && (
              <div className="fade-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Security</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Account security settings</p>

                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Change Password</h3>
                  {["Current Password", "New Password", "Confirm Password"].map((label) => (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                      <input type="password" style={{ width: "100%", fontSize: 13 }} />
                    </div>
                  ))}
                  <button className="btn btn-primary" style={{ marginTop: 4, fontSize: 13 }}>
                    <Save size={13} /> Update Password
                  </button>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Shield size={15} color="#22c55e" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>JWT Authentication Active</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    Your session uses a JWT bearer token stored in localStorage. Tokens expire after 24 hours.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
