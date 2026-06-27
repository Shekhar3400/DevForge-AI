import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Tiny markdown renderer: bold, inline code, code blocks, bullets
function renderContent(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim() || "text";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={`cb-${i}`} code={codeLines.join("\n")} lang={lang} />
      );
      i++;
      continue;
    }

    // Bullet
    if (line.match(/^[\s]*[•\-\*]\s/)) {
      const txt = line.replace(/^[\s]*[•\-\*]\s/, "");
      elements.push(
        <div key={`li-${i}`} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
          <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>•</span>
          <span style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.6 }}>
            {inlineFormat(txt)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Separator line
    if (line.match(/^[=\-]{3,}$/)) {
      elements.push(<hr key={`hr-${i}`} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} style={{ height: 4 }} />);
      i++;
      continue;
    }

    // Normal text
    elements.push(
      <p key={`p-${i}`} style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 3 }}>
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function inlineFormat(text) {
  // Bold: **text**
  // Code: `text`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} style={{
          fontSize: 11, background: "var(--bg-primary)",
          border: "1px solid var(--border)", borderRadius: 4,
          padding: "1px 5px", fontFamily: "ui-monospace, Consolas, monospace",
          color: "var(--cyan)",
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      background: "var(--bg-primary)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      marginBottom: 6,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "5px 10px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{lang}</span>
        <button
          onClick={handleCopy}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 10, color: copied ? "var(--success)" : "var(--text-muted)",
            background: "transparent", border: "none", cursor: "pointer",
            transition: "color 0.15s",
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: "10px 12px",
        fontSize: 11, lineHeight: 1.6,
        color: "var(--text-primary)",
        fontFamily: "ui-monospace, Consolas, monospace",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {code}
      </pre>
    </div>
  );
}

export default function AiResponseCard({ msg }) {
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }} className="fade-in">
      {/* Avatar */}
      <div style={{
        width: 28, height: 28,
        background: "var(--accent-light)",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0, marginTop: 2,
      }}>
        🤖
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "2px 12px 12px 12px",
          padding: "10px 12px",
        }}>
          {renderContent(msg.content)}
        </div>
        {time && (
          <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, display: "block" }}>
            DevForge AI · {time}
          </span>
        )}
      </div>
    </div>
  );
}
