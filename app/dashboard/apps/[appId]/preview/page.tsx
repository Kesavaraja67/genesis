"use client";
// app/(dashboard)/apps/[appId]/preview/page.tsx — Palette 3 styled

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RenderEngine } from "@/components/runtime/RenderEngine";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import toast from "react-hot-toast";
import { UIComponent } from "@/lib/config/types";

interface AppMeta {
  id: string;
  name: string;
  status: string;
  config: {
    pages?: {
      name?: string;
      components: UIComponent[];
    }[];
    ui?: {
      layouts?: UIComponent[];
    };
  };
}

export default function PreviewPage() {
  const { appId } = useParams<{ appId: string }>();
  const [app, setApp] = useState<AppMeta | null>(null);
  const [data] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const fetchApp = async () => {
      await Promise.resolve(); // avoid sync setState warning
      if (ignore) return;
      setLoading(true);
      fetch(`/api/apps/${appId}`)
        .then(r => r.json())
        .then(d => {
          if (!ignore) setApp(d.app);
        })
        .catch(() => {
          if (!ignore) toast.error("Failed to load app config");
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    };
    fetchApp();
    return () => { ignore = true; };
  }, [appId, refreshKey]);

  if (loading) {
    return (
      <div style={{ height: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!app) {
    return <div style={{ padding: "32px", color: "var(--text-primary)" }}>App not found</div>;
  }

  const pages = app.config?.pages || [];
  const layout = pages[activePageIdx]?.components || app.config?.ui?.layouts || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Top Preview Bar */}
      <div
        style={{
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border-default)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Live Preview: {app.name}
          </h1>
          <StatusBadge status={app.status} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href={`/dashboard/apps/${appId}/editor`}
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
          >
            Back to Editor
          </Link>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            title="Reload app config"
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              padding: "6px 10px",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-base)", padding: "32px", position: "relative" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Page Tabs */}
          {pages.length > 1 && (
            <div className="flex items-center gap-2 border-b border-border pb-4">
              {pages.map((page: { name?: string }, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActivePageIdx(idx)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePageIdx === idx
                      ? "bg-primary text-white"
                      : "bg-bg-elevated text-muted hover:text-white"
                  }`}
                >
                  {page.name || `Page ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {layout.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px",
                color: "var(--text-secondary)",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px dashed var(--border-default)",
              }}
            >
              <p style={{ margin: "0 0 8px 0" }}>No UI layout defined in this page.</p>
              <Link
                href={`/dashboard/apps/${appId}/editor`}
                style={{ color: "var(--pine)", textDecoration: "none", fontWeight: 500 }}
              >
                Edit Config
              </Link>
            </div>
          ) : (
            <RenderEngine 
              appId={appId as string} 
              layout={layout} 
              data={data}
              onAction={(action, actionData) => {
                toast(`Action Triggered: ${(action as { type?: string }).type}`);
                console.log("Action Triggered", action, actionData);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
