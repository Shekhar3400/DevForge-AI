import { useState, Suspense, lazy, useRef, useCallback, useEffect } from "react";
import {
  Code2, ChevronDown, FileCode, Play, Square,
  Trash2, Copy, Check, ChevronUp, Terminal,
  Save, Wand2, Loader2, X, FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { updateFileContent, aiGenerateFileCode } from "../../api/projectFileApi";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

/* ── Language registry ─────────────────────────────────────────────────────── */
const LANGUAGES = [
  { id: "javascript",  label: "JavaScript",  runnable: true,  backend: false },
  { id: "typescript",  label: "TypeScript",  runnable: true,  backend: true  },
  { id: "html",        label: "HTML",        runnable: true,  backend: false },
  { id: "css",         label: "CSS",         runnable: false, backend: false, note: "Preview requires HTML" },
  { id: "java",        label: "Java",        runnable: true,  backend: true  },
  { id: "python",      label: "Python",      runnable: true,  backend: true  },
  { id: "go",          label: "Go",          runnable: true,  backend: true  },
  { id: "rust",        label: "Rust",        runnable: true,  backend: true  },
  { id: "kotlin",      label: "Kotlin",      runnable: true,  backend: true  },
  { id: "csharp",      label: "C#",          runnable: true,  backend: true  },
  { id: "cpp",         label: "C++",         runnable: true,  backend: true  },
  { id: "c",           label: "C",           runnable: true,  backend: true  },
  { id: "php",         label: "PHP",         runnable: true,  backend: true  },
  { id: "ruby",        label: "Ruby",        runnable: true,  backend: true  },
  { id: "sql",         label: "SQL",         runnable: true,  backend: true  },
  { id: "json",        label: "JSON",        runnable: true,  backend: false },
  { id: "yaml",        label: "YAML",        runnable: false, backend: false },
  { id: "markdown",    label: "Markdown",    runnable: false, backend: false },
];

const STARTERS = {
  javascript: `// JavaScript
function greet(name) {
  return \`Hello, \${name}! Welcome to DevForge AI.\`;
}
console.log(greet("Developer"));
const nums = [1, 2, 3, 4, 5];
console.log("Doubled:", nums.map(n => n * 2));`,

  typescript: `// TypeScript
interface Project {
  id: number;
  name: string;
  stack: string[];
}
const project: Project = { id: 1, name: "DevForge AI", stack: ["Spring Boot", "React", "MySQL"] };
console.log(project);`,

  html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>DevForge AI</title>
<style>
  body { font-family: system-ui,sans-serif; background:#0d0e14; color:#e2e4f0; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
  .card { background:#1a1b26; border:1px solid #2a2b3d; border-radius:12px; padding:32px; text-align:center; }
  h1 { color:#6366f1; } p { color:#8b8fa8; }
</style></head>
<body><div class="card"><h1>DevForge AI</h1><p>Edit and click Run to preview</p></div></body></html>`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, DevForge AI!");
        int n = 10; int a = 0, b = 1;
        System.out.print("Fibonacci: ");
        for (int i = 0; i < n; i++) {
            System.out.print(a + " ");
            int tmp = a + b; a = b; b = tmp;
        }
        System.out.println();
    }
}`,

  python: `# Python
def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to DevForge AI."

print(greet("Developer"))
nums = [1, 2, 3, 4, 5]
print("Squares:", [n**2 for n in nums])`,

  go: `package main
import "fmt"
func main() {
    fmt.Println("Hello, DevForge AI!")
    for i := 1; i <= 5; i++ {
        fmt.Printf("Square of %d = %d\\n", i, i*i)
    }
}`,

  rust: `fn main() {
    println!("Hello, DevForge AI!");
    let nums: Vec<i32> = (1..=5).collect();
    let squares: Vec<i32> = nums.iter().map(|x| x * x).collect();
    println!("Squares: {:?}", squares);
}`,

  kotlin: `fun main() {
    println("Hello, DevForge AI!")
    val nums = listOf(1, 2, 3, 4, 5)
    val squares = nums.map { it * it }
    println("Squares: $squares")
}`,

  csharp: `using System;
using System.Linq;
class Program {
    static void Main() {
        Console.WriteLine("Hello, DevForge AI!");
        var nums = Enumerable.Range(1, 5).Select(x => x * x);
        Console.WriteLine("Squares: " + string.Join(", ", nums));
    }
}`,

  cpp: `#include <iostream>
#include <vector>
int main() {
    std::cout << "Hello, DevForge AI!" << std::endl;
    std::vector<int> v = {1,2,3,4,5};
    std::cout << "Squares: ";
    for (int x : v) std::cout << x*x << " ";
    std::cout << std::endl;
    return 0;
}`,

  c: `#include <stdio.h>
int main() {
    printf("Hello, DevForge AI!\\n");
    int nums[] = {1,2,3,4,5};
    printf("Squares: ");
    for (int i = 0; i < 5; i++) printf("%d ", nums[i]*nums[i]);
    printf("\\n");
    return 0;
}`,

  php: `<?php
echo "Hello, DevForge AI!\\n";
$nums = [1, 2, 3, 4, 5];
$squares = array_map(fn($n) => $n * $n, $nums);
echo "Squares: " . implode(", ", $squares) . "\\n";`,

  ruby: `puts "Hello, DevForge AI!"
nums = [1, 2, 3, 4, 5]
squares = nums.map { |n| n ** 2 }
puts "Squares: #{squares.join(', ')}"`,

  sql: `-- DevForge AI Sample SQL
SELECT id, name FROM projects ORDER BY created_at DESC LIMIT 10;`,

  json: `{
  "project": "DevForge AI",
  "version": "1.0.0",
  "stack": { "backend": "Spring Boot 3.5", "frontend": "React 19" }
}`,

  yaml: `project:\n  name: DevForge AI\n  version: 1.0.0`,

  markdown: `# Hello\n\nWelcome to **DevForge AI**.`,
};

/* ── Browser run engine ─────────────────────────────────────────────────────── */
function runBrowser(language, code) {
  if (language === "javascript") {
    const logs = [];
    const fakeConsole = {
      log:   (...a) => logs.push({ type: "log",   text: a.map(stringify).join(" ") }),
      error: (...a) => logs.push({ type: "error", text: a.map(stringify).join(" ") }),
      warn:  (...a) => logs.push({ type: "warn",  text: a.map(stringify).join(" ") }),
      info:  (...a) => logs.push({ type: "info",  text: a.map(stringify).join(" ") }),
    };
    try {
      // eslint-disable-next-line no-new-func
      new Function("console", code)(fakeConsole);
      if (logs.length === 0) logs.push({ type: "info", text: "✓ Ran (no output)" });
    } catch (e) { logs.push({ type: "error", text: `RuntimeError: ${e.message}` }); }
    return { type: "console", logs };
  }
  if (language === "html") return { type: "iframe", html: code };
  if (language === "json") {
    try {
      return { type: "console", logs: [{ type: "log", text: JSON.stringify(JSON.parse(code), null, 2) }] };
    } catch (e) {
      return { type: "console", logs: [{ type: "error", text: `JSON Error: ${e.message}` }] };
    }
  }
  return null;
}

function stringify(v) {
  if (typeof v === "object") { try { return JSON.stringify(v, null, 2); } catch { return String(v); } }
  return String(v);
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function CodeEditor({ openFile, projectId }) {
  const [language,    setLanguage]   = useState("javascript");
  const [code,        setCode]       = useState(STARTERS["javascript"]);
  const [showLang,    setShowLang]   = useState(false);
  const [output,      setOutput]     = useState(null);
  const [running,     setRunning]    = useState(false);
  const [outputOpen,  setOutputOpen] = useState(false);
  const [copied,      setCopied]     = useState(false);
  const [saving,      setSaving]     = useState(false);
  const [generating,  setGenerating] = useState(false);
  const [tabs,        setTabs]       = useState([]);   // [{ id, name, language, fileId, content }]
  const [activeTab,   setActiveTab]  = useState(null);
  const iframeRef = useRef(null);

  // When a file is opened externally (from ProjectExplorer)
  useEffect(() => {
    if (!openFile) return;
    const existing = tabs.find((t) => t.fileId === openFile.id);
    if (existing) {
      setActiveTab(existing.id);
      setLanguage(existing.language || "plaintext");
      setCode(existing.content || "");
    } else {
      const tab = {
        id: `tab-${openFile.id}`,
        name: openFile.name,
        language: openFile.language || "plaintext",
        fileId: openFile.id,
        content: openFile.content || "",
      };
      setTabs((t) => [...t, tab]);
      setActiveTab(tab.id);
      setLanguage(tab.language);
      setCode(tab.content);
    }
    setOutput(null);
    setOutputOpen(false);
  }, [openFile]);

  const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
  const activeTabObj = tabs.find((t) => t.id === activeTab);

  const handleLangChange = (lang) => {
    setLanguage(lang);
    if (!activeTab) setCode(STARTERS[lang] || "");
    setShowLang(false);
    setOutput(null);
    setOutputOpen(false);
  };

  const handleCodeChange = (val) => {
    setCode(val ?? "");
    // Update tab content
    if (activeTab) {
      setTabs((tabs) => tabs.map((t) => t.id === activeTab ? { ...t, content: val ?? "" } : t));
    }
  };

  const handleCloseTab = (tabId) => {
    setTabs((tabs) => {
      const remaining = tabs.filter((t) => t.id !== tabId);
      if (activeTab === tabId) {
        const next = remaining[remaining.length - 1];
        if (next) { setActiveTab(next.id); setLanguage(next.language); setCode(next.content); }
        else { setActiveTab(null); setLanguage("javascript"); setCode(STARTERS["javascript"]); }
      }
      return remaining;
    });
  };

  const switchTab = (tab) => {
    setActiveTab(tab.id);
    setLanguage(tab.language);
    setCode(tab.content);
    setOutput(null);
    setOutputOpen(false);
  };

  const handleSave = async () => {
    if (!activeTabObj?.fileId || !projectId) { toast("No file open to save"); return; }
    setSaving(true);
    try {
      await updateFileContent(projectId, activeTabObj.fileId, code);
      toast.success("Saved");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleAiGenerate = async () => {
    if (!activeTabObj?.fileId || !projectId) { toast("Open a file first"); return; }

    // Ask user for instruction
    const instruction = prompt(`AI will modify: ${activeTabObj.name}\n\nWhat should the AI do? (leave blank to generate fresh code)`);
    if (instruction === null) return; // cancelled

    setGenerating(true);
    try {
      const result = await aiGenerateFileCode(
        projectId, activeTabObj.fileId, activeTabObj.name,
        code,          // current file content
        instruction    // user instruction (modify or generate)
      );
      const newCode = result.code || "";
      setCode(newCode);
      setTabs(tabs => tabs.map(t => t.id === activeTab ? { ...t, content: newCode } : t));
      toast.success(instruction ? "AI modified the file" : "AI generated code");
    } catch { toast.error("AI generation failed"); }
    finally { setGenerating(false); }
  };

  const handleRun = useCallback(async () => {
    if (!currentLang.runnable) return;
    setRunning(true);
    setOutputOpen(true);

    // Backend execution
    if (currentLang.backend) {
      try {
        const res = await axios.post("/execute", { language, code });
        const d = res.data;
        const logs = [];
        if (d.output) logs.push({ type: "log",   text: d.output });
        if (d.error)  logs.push({ type: "error", text: d.error });
        if (logs.length === 0) logs.push({ type: "info", text: "✓ Exit code: " + d.exitCode });
        logs.push({ type: "info", text: `⏱ ${d.executionTimeMs}ms | exit: ${d.exitCode}` });
        setOutput({ type: "console", logs });
      } catch (err) {
        setOutput({ type: "console", logs: [{ type: "error", text: "Execution error: " + (err.response?.data?.message || err.message) }] });
      }
      setRunning(false);
      return;
    }

    // Browser execution
    setTimeout(() => {
      setOutput(runBrowser(language, code));
      setRunning(false);
    }, 100);
  }, [language, code, currentLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Ctrl+Enter to run, Ctrl+S to save
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun(); }
    if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
  }, [handleRun, handleSave]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-primary)" }}
      onKeyDown={handleKeyDown}
    >
      {/* ── File Tabs ── */}
      {tabs.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 1,
          padding: "0 8px", overflowX: "auto",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0, minHeight: 34,
        }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", cursor: "pointer", borderRadius: "5px 5px 0 0",
                fontSize: 11, flexShrink: 0,
                background: activeTab === tab.id ? "var(--bg-primary)" : "transparent",
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "all 0.1s",
              }}
            >
              <FileText size={11} />
              {tab.name}
              <button
                className="btn-icon"
                style={{ padding: 1, marginLeft: 2 }}
                onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
              >
                <X size={10} color="var(--text-muted)" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <Code2 size={14} color="var(--accent)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
          {activeTabObj ? activeTabObj.name : "Code Editor"}
        </span>

        <div style={{ flex: 1 }} />

        {/* Copy */}
        <button onClick={handleCopy} className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 9px" }}>
          {copied ? <><Check size={11} color="var(--success)" /> Copied</> : <><Copy size={11} /> Copy</>}
        </button>

        {/* AI Generate */}
        {activeTabObj && (
          <button
            onClick={handleAiGenerate}
            disabled={generating}
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: "4px 9px" }}
            title="AI: generate code for this file"
          >
            {generating
              ? <><Loader2 size={11} style={{ animation: "spin 0.7s linear infinite" }} /> Generating…</>
              : <><Wand2 size={11} color="var(--accent)" /> AI Generate</>}
          </button>
        )}

        {/* Save */}
        {activeTabObj && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: "4px 9px" }}
            title="Save (Ctrl+S)"
          >
            {saving
              ? <><Loader2 size={11} style={{ animation: "spin 0.7s linear infinite" }} /> Saving…</>
              : <><Save size={11} /> Save</>}
          </button>
        )}

        {/* Language selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowLang((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 6, fontSize: 11,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-primary)", cursor: "pointer",
            }}
          >
            <FileCode size={12} color="var(--accent)" />
            {currentLang.label}
            <ChevronDown size={11} color="var(--text-muted)" />
          </button>

          {showLang && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 9999,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 8, padding: 4, minWidth: 160, maxHeight: 320, overflowY: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLangChange(l.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "6px 10px", borderRadius: 5, fontSize: 12,
                    cursor: "pointer",
                    background: language === l.id ? "var(--accent-light)" : "transparent",
                    color: language === l.id ? "var(--accent)" : "var(--text-secondary)",
                    border: "none", fontFamily: "inherit", transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (language !== l.id) e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { if (language !== l.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <span>{l.label}</span>
                  <div style={{ display: "flex", gap: 3 }}>
                    {l.runnable && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>run</span>}
                    {l.backend  && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(99,102,241,0.15)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.2)" }}>server</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RUN */}
        <button
          onClick={handleRun}
          disabled={!currentLang.runnable || running}
          className="btn btn-primary"
          style={{ fontSize: 12, padding: "5px 13px", opacity: !currentLang.runnable ? 0.4 : 1, cursor: !currentLang.runnable ? "not-allowed" : "pointer" }}
          title={currentLang.runnable ? "Run (Ctrl+Enter)" : currentLang.note || "Not runnable"}
        >
          {running
            ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Running…</>
            : <><Play size={12} /> Run</>}
        </button>
      </div>

      {/* ── Editor + Output ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ flex: outputOpen ? "1 1 60%" : "1 1 100%", overflow: "hidden", minHeight: 0 }}>
          <Suspense fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--bg-primary)" }}>
              <div style={{ textAlign: "center" }}>
                <span className="spinner" style={{ margin: "0 auto 10px", display: "block" }} />
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Loading Monaco…</p>
              </div>
            </div>
          }>
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "ui-monospace, 'Cascadia Code', Consolas, monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineNumbers: "on",
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                automaticLayout: true,
                padding: { top: 12 },
                bracketPairColorization: { enabled: true },
                suggest: { preview: true },
                tabSize: 2,
              }}
            />
          </Suspense>
        </div>

        {/* Output panel */}
        {outputOpen && (
          <div style={{ flex: "0 0 40%", minHeight: 0, display: "flex", flexDirection: "column", borderTop: "1px solid var(--border)", background: "#0a0b10" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", flexShrink: 0 }}>
              <Terminal size={12} color="var(--accent)" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>Output</span>
              <div style={{ flex: 1 }} />
              <button className="btn-icon" style={{ padding: 3 }} onClick={() => { setOutput(null); setOutputOpen(false); }}><Trash2 size={12} color="var(--text-muted)" /></button>
              <button className="btn-icon" style={{ padding: 3 }} onClick={() => setOutputOpen(false)}><ChevronDown size={12} color="var(--text-muted)" /></button>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {!output && <div style={{ padding: 14, color: "var(--text-muted)", fontSize: 12 }}>No output yet.</div>}

              {output?.type === "console" && (
                <div style={{ padding: "8px 0" }}>
                  {output.logs.map((log, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "3px 14px", borderLeft: `3px solid ${log.type === "error" ? "var(--danger)" : log.type === "warn" ? "var(--warning)" : log.type === "info" ? "var(--accent)" : "transparent"}` }}>
                      {log.type !== "log" && (
                        <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, flexShrink: 0, marginTop: 1, background: log.type === "error" ? "var(--danger-light)" : log.type === "warn" ? "rgba(245,158,11,0.15)" : "var(--accent-light)", color: log.type === "error" ? "var(--danger)" : log.type === "warn" ? "#f59e0b" : "var(--accent)" }}>
                          {log.type}
                        </span>
                      )}
                      <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: log.type === "error" ? "var(--danger)" : log.type === "warn" ? "#f59e0b" : "#a8d8a8", fontFamily: "ui-monospace, Consolas, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {log.text}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {output?.type === "iframe" && (
                <iframe ref={iframeRef} srcDoc={output.html} title="HTML Preview" aria-label="HTML Preview" style={{ width: "100%", height: "100%", border: "none", background: "#fff" }} sandbox="allow-scripts allow-same-origin" />
              )}
            </div>
          </div>
        )}

        {/* Collapsed output bar */}
        {!outputOpen && output && (
          <div onClick={() => setOutputOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", cursor: "pointer", flexShrink: 0 }}>
            <Terminal size={12} color="var(--accent)" />
            <span style={{ fontSize: 11, color: "var(--accent)" }}>Output available — click to expand</span>
            <ChevronUp size={12} color="var(--text-muted)" style={{ marginLeft: "auto" }} />
          </div>
        )}

        {!currentLang.runnable && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>⚠ {currentLang.label} — {currentLang.note || "Not runnable"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
