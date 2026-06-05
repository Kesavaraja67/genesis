"use client";
// app/(dashboard)/apps/[appId]/editor/page.tsx — per spec Section 5.4

import { useEffect, useLayoutEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { ValidationPanel } from "@/components/editor/ValidationPanel";
import { StatusBadge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import type { ValidationResult } from "@/lib/config/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface AppMeta {
  id: string;
  name: string;
  status: string;
  config: unknown;
}

const GENESIS_THEME = {
  base: "vs-dark" as const,
  inherit: false,
  rules: [
    { token: "",            foreground: "C0BCB5", background: "0D0D0F" },
    { token: "string",     foreground: "5A9E7A" },
    { token: "number",     foreground: "B8935A" },
    { token: "keyword",    foreground: "4A6C6F" },
    { token: "comment",    foreground: "4A4A50" },
    { token: "delimiter",  foreground: "7A7870" },
    { token: "key",        foreground: "846075" },
  ],
  colors: {
    "editor.background":                    "#0D0D0F",
    "editor.foreground":                    "#C0BCB5",
    "editorLineNumber.foreground":          "#3A3A45",
    "editorLineNumber.activeForeground":    "#7A7870",
    "editor.selectionBackground":           "#4A6C6F40",
    "editorCursor.foreground":              "#4A6C6F",
    "editor.lineHighlightBackground":       "#141418",
    "editorIndentGuide.background":         "#2A2A33",
    "editorBracketMatch.background":        "#2D4547",
    "editorBracketMatch.border":            "#4A6C6F",
    "scrollbar.shadow":                     "#0D0D0F",
    "scrollbarSlider.background":           "#363640",
    "scrollbarSlider.hoverBackground":      "#4A6C6F",
    "scrollbarSlider.activeBackground":     "#4A6C6F",
    "editorWidget.background":              "#1C1C22",
    "editorWidget.border":                  "#363640",
    "input.background":                     "#18181E",
    "input.foreground":                     "#C0BCB5",
    "input.border":                         "#363640",
    "focusBorder":                          "#4A6C6F",
  },
};

export default function EditorPage() {
  const { appId } = useParams<{ appId: string }>();
  const router = useRouter();
  const [app, setApp] = useState<AppMeta | null>(null);
  const [configStr, setConfigStr] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  // Stable ref so keyboard handler never goes stale
  const handlerRef = useRef<{ save: () => void; generate: () => void }>({ save: () => {}, generate: () => {} });

  useEffect(() => {
    fetch(`/api/apps/${appId}`)
      .then(r => r.json())
      .then(d => {
        setApp(d.app);
        setConfigStr(JSON.stringify(d.app.config, null, 2));
      })
      .finally(() => setLoading(false));
  }, [appId]);

  const validateConfig = useCallback(async (value: string) => {
    setValidating(true);
    try {
      const parsed = JSON.parse(value);
      const res = await fetch("/api/validate-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: parsed }),
      });
      const data = await res.json();
      setValidation(data.validation);
    } catch {
      setValidation(null);
    } finally {
      setValidating(false);
    }
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    const v = value ?? "";
    setConfigStr(v);
    try {
      JSON.parse(v);
      const timer = setTimeout(() => validateConfig(v), 600);
      return () => clearTimeout(timer);
    } catch { /* ignore */ }
  }, [validateConfig]);

  const handleMonacoMount = useCallback((editor: unknown, monaco: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = monaco as any;
    m.editor.defineTheme("genesis-dark", GENESIS_THEME);
    m.editor.setTheme("genesis-dark");
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const config = JSON.parse(configStr);
      const res = await fetch(`/api/apps/${appId}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Save failed"); return; }
      setValidation(data.validation);
      toast.success("Config saved");
    } catch { toast.error("Invalid JSON"); }
    finally { setSaving(false); }
  }, [appId, configStr]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/apps/${appId}/generate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.errors?.[0] ?? "Generation failed");
        setApp(prev => prev ? { ...prev, status: "ERROR" } : prev);
        return;
      }
      toast.success(`App generated — ${data.models.length} model(s) ready`);
      setApp(prev => prev ? { ...prev, status: "ACTIVE" } : prev);
    } finally { setGenerating(false); }
  }, [appId]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/apps/${appId}/export`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${app?.name?.toLowerCase().replace(/[^a-z0-9-]/g, "-") ?? "app"}-genesis.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ZIP downloaded!");
    } finally {
      setExporting(false);
    }
  }, [appId, app?.name]);

  const handleCopyConfig = useCallback(() => {
    navigator.clipboard.writeText(configStr).then(() => toast.success("Config copied!"));
  }, [configStr]);

  // Keep ref current after every render so the keyboard effect never captures stale closures
  useLayoutEffect(() => {
    handlerRef.current = { save: handleSave, generate: handleGenerate };
  });

  // Keyboard shortcuts: Ctrl+S = save, Ctrl+Enter = generate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handlerRef.current.save();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handlerRef.current.generate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <svg style={{ width: "24px", height: "24px", animation: "spin 0.7s linear infinite", color: "var(--pine)" }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>Loading editor…</p>
        </div>
      </div>
    );
  }

  const hasErrors = validation && !validation.valid;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
      {/* Top Bar */}
      <div
        style={{
          height: "56px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        {/* Left: back + name + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              flexShrink: 0,
              transition: "background var(--transition-fast), color var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
            }}
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {app?.name}
          </h1>
          {app && <StatusBadge status={app.status} />}
        </div>

        {/* Right: buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Keyboard hint */}
          <span style={{ fontSize: "11px", color: "var(--text-disabled)", padding: "0 4px" }}>
            ⌘S save · ⌘↵ generate
          </span>
          {app?.status === "ERROR" && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--mauve)",
                background: "var(--mauve-muted)",
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                letterSpacing: "var(--tracking-wide)",
                textTransform: "uppercase",
              }}
            >
              Last build failed
            </span>
          )}

          {/* Copy Config */}
          <button
            id="editor-copy-btn"
            onClick={handleCopyConfig}
            title="Copy config JSON to clipboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 12px",
              cursor: "pointer",
              transition: "background var(--transition-base)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy
          </button>

          {/* Export ZIP */}
          <button
            id="editor-export-btn"
            onClick={handleExport}
            disabled={exporting || app?.status !== "ACTIVE"}
            title={app?.status !== "ACTIVE" ? "Generate the app first before exporting" : "Download as ZIP"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: (exporting || app?.status !== "ACTIVE") ? "var(--text-disabled)" : "var(--text-primary)",
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 12px",
              cursor: (exporting || app?.status !== "ACTIVE") ? "not-allowed" : "pointer",
              opacity: app?.status !== "ACTIVE" ? 0.5 : 1,
              transition: "background var(--transition-base)",
            }}
            onMouseEnter={(e) => { if (!exporting && app?.status === "ACTIVE") (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            {exporting ? (
              <svg style={{ width: "13px", height: "13px", animation: "spin 0.7s linear infinite" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            {exporting ? "Exporting…" : "Export ZIP"}
          </button>

          {/* Save Config */}
          <button
            id="editor-save-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 14px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              transition: "background var(--transition-base), border-color var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-focus)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
            }}
          >
            {saving && (
              <svg style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            Save Config
          </button>

          {/* Generate App */}
          <button
            id="editor-generate-btn"
            onClick={handleGenerate}
            disabled={generating || !!(hasErrors)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: (generating || hasErrors) ? "var(--pine-muted)" : "var(--pine)",
              color: "var(--text-inverse)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 14px",
              cursor: (generating || hasErrors) ? "not-allowed" : "pointer",
              opacity: hasErrors ? 0.5 : 1,
              transition: "background var(--transition-base), transform var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              if (!generating && !hasErrors) {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--pine-hover)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = (generating || hasErrors) ? "var(--pine-muted)" : "var(--pine)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {generating && (
              <svg style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {generating ? "Generating…" : "Generate App"}
          </button>
        </div>
      </div>

      {/* Editor + Validation Split */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Monaco Editor — ~65% */}
        <div style={{ flex: "0 0 65%", overflow: "hidden", minWidth: 0 }}>
          <MonacoEditor
            height="100%"
            language="json"
            theme="genesis-dark"
            value={configStr}
            onChange={handleEditorChange}
            onMount={handleMonacoMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              lineNumbers: "on",
              wordWrap: "on",
              formatOnPaste: true,
              formatOnType: false,
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: "line",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              bracketPairColorization: { enabled: false },
            }}
          />
        </div>

        {/* Validation Panel — ~35% */}
        <div
          style={{
            flex: "0 0 35%",
            background: "var(--bg-surface)",
            borderLeft: "1px solid var(--border-subtle)",
            height: "100%",
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <ValidationPanel validation={validation} loading={validating} />
        </div>
      </div>
    </div>
  );
}
