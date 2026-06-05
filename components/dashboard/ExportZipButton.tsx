"use client";
// components/dashboard/ExportZipButton.tsx

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  appId: string;
  appName: string;
  appStatus: string;
}

export function ExportZipButton({ appId, appName, appStatus }: Props) {
  const [loading, setLoading] = useState(false);

  const isActive = appStatus === "ACTIVE";

  const handleExport = async () => {
    if (!isActive) {
      toast.error("Generate the app first before exporting.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/apps/${appId}/export`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${appName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-genesis.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ZIP downloaded!");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id="app-overview-export-btn"
      onClick={handleExport}
      disabled={loading}
      title={isActive ? "Download as deployable Next.js project ZIP" : "Generate the app first to enable export"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "transparent",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        color: isActive ? "var(--text-primary)" : "var(--text-disabled)",
        fontSize: "13px",
        fontWeight: 500,
        padding: "8px 14px",
        cursor: loading || !isActive ? "not-allowed" : "pointer",
        opacity: !isActive ? 0.5 : 1,
        transition: "background var(--transition-base), border-color var(--transition-base)",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!loading && isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-focus)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
      }}
    >
      {loading ? (
        <svg
          style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      {loading ? "Exporting…" : "Export ZIP"}
    </button>
  );
}
