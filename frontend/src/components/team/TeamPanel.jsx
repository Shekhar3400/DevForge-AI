import { useState } from "react";
import {
  Users, UserPlus, Crown, Shield, Code2, Eye,
  Mail, MoreVertical, Wifi, Clock,
} from "lucide-react";

// Mock team data — real collaboration requires WebSocket (future)
const MOCK_MEMBERS = [
  { id: 1, name: "Alex Johnson",  email: "alex@company.com",  role: "Owner",     avatar: "A", online: true,  lastSeen: null },
  { id: 2, name: "Sarah Chen",    email: "sarah@company.com", role: "Admin",     avatar: "S", online: true,  lastSeen: null },
  { id: 3, name: "Mike Torres",   email: "mike@company.com",  role: "Developer", avatar: "M", online: false, lastSeen: "2m ago" },
  { id: 4, name: "Priya Patel",   email: "priya@company.com", role: "Developer", avatar: "P", online: true,  lastSeen: null },
  { id: 5, name: "James Wilson",  email: "james@company.com", role: "Viewer",    avatar: "J", online: false, lastSeen: "1h ago" },
];

const ROLE_META = {
  Owner:     { icon: Crown,   color: "#f59e0b", label: "Owner"     },
  Admin:     { icon: Shield,  color: "#6366f1", label: "Admin"     },
  Developer: { icon: Code2,   color: "#22c55e", label: "Developer" },
  Viewer:    { icon: Eye,     color: "#64748b", label: "Viewer"    },
};

const AVATAR_COLORS = ["#6366f1", "#a855f7", "#06b6d4", "#22c55e", "#f59e0b"];

export default function TeamPanel({ projectId }) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState("Developer");
  const [members] = useState(MOCK_MEMBERS);

  const onlineCount = members.filter((m) => m.online).length;

  const handleInvite = (e) => {
    e.preventDefault();
    setShowInvite(false);
    setInviteEmail("");
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg-primary)", padding: 24 }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>
              Team
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {members.length} members · {onlineCount} online
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowInvite((v) => !v)}
            style={{ fontSize: 12 }}
          >
            <UserPlus size={13} /> Invite
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="card fade-in" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>
              Invite Team Member
            </h3>
            <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <Mail size={13} color="var(--text-muted)"
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  autoFocus
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{ width: "100%", paddingLeft: 32, fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                  Role
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  {Object.entries(ROLE_META).filter(([r]) => r !== "Owner").map(([role, meta]) => {
                    const Icon = meta.icon;
                    const active = inviteRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setInviteRole(role)}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                          background: active ? `${meta.color}22` : "var(--bg-card)",
                          border: `1px solid ${active ? meta.color : "var(--border)"}`,
                          color: active ? meta.color : "var(--text-muted)",
                          transition: "all 0.1s", fontFamily: "inherit",
                        }}
                      >
                        <Icon size={11} /> {role}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowInvite(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>
                  <Mail size={13} /> Send Invite
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Online users strip */}
        <div className="card" style={{ padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Wifi size={13} color="var(--success)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              Online now
            </span>
            <span style={{
              fontSize: 10, padding: "1px 6px",
              background: "rgba(34,197,94,0.15)", color: "var(--success)",
              borderRadius: 10, border: "1px solid rgba(34,197,94,0.3)",
            }}>
              {onlineCount}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {members.filter((m) => m.online).map((m, i) => (
              <div
                key={m.id}
                title={`${m.name} (${m.role})`}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  border: "2px solid var(--success)",
                  cursor: "default",
                  position: "relative",
                }}
              >
                {m.avatar}
                <span style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 9, height: 9, borderRadius: "50%",
                  background: "var(--success)",
                  border: "2px solid var(--bg-card)",
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Members list */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              All Members
            </span>
          </div>
          {members.map((member, i) => {
            const roleMeta = ROLE_META[member.role];
            const RoleIcon = roleMeta.icon;
            return (
              <div
                key={member.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < members.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#fff",
                  }}>
                    {member.avatar}
                  </div>
                  <span style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 10, height: 10, borderRadius: "50%",
                    background: member.online ? "var(--success)" : "var(--text-muted)",
                    border: "2px solid var(--bg-card)",
                  }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {member.name}
                    </span>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "1px 7px", borderRadius: 10, fontSize: 10,
                      background: `${roleMeta.color}18`,
                      color: roleMeta.color,
                      border: `1px solid ${roleMeta.color}33`,
                      flexShrink: 0,
                    }}>
                      <RoleIcon size={9} /> {member.role}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {member.email}
                    </span>
                    {!member.online && member.lastSeen && (
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
                        <Clock size={9} /> {member.lastSeen}
                      </span>
                    )}
                  </div>
                </div>

                {member.role !== "Owner" && (
                  <button className="btn-icon" style={{ flexShrink: 0 }}>
                    <MoreVertical size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Roles legend */}
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Role Permissions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(ROLE_META).map(([role, meta]) => {
              const Icon = meta.icon;
              const perms = {
                Owner:     "Full access · Can delete project · Manage billing",
                Admin:     "Full access · Manage team · Cannot delete project",
                Developer: "Read & write · Architecture · Code · Chat",
                Viewer:    "Read-only access to all project content",
              };
              return (
                <div key={role} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: `${meta.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={13} color={meta.color} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>{role}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
                      {perms[role]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
          Real-time collaboration requires WebSocket — coming in a future release.
        </p>
      </div>
    </div>
  );
}
