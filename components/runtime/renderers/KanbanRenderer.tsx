"use client";
// components/runtime/renderers/KanbanRenderer.tsx
// Fetches live records from the runtime API and renders them as a Kanban board

import React, { useState, useEffect, useCallback } from "react";
import { UIComponent } from "@/lib/config/types";
import type { ComponentRenderProps } from "../FallbackComponent";

export interface KanbanRendererProps extends ComponentRenderProps {
  config: UIComponent;
  data?: unknown;
  onAction?: (action: unknown, data?: unknown) => void;
}

interface KanbanRecord {
  id: string;
  [key: string]: unknown;
}

function KanbanSkeleton() {
  return (
    <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "16px" }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            width: "288px",
            background: "#12121a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div className="skeleton" style={{ height: "20px", borderRadius: "4px", width: "96px", marginBottom: "16px" }} />
          {[1, 2].map((j) => (
            <div
              key={j}
              className="skeleton"
              style={{ height: "80px", borderRadius: "8px", marginBottom: "12px" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function KanbanRenderer({ config, appId, onAction }: KanbanRendererProps) {
  const modelName = config.model ?? "";
  const statusField = (config.props?.statusField as string) || "status";
  const titleField = (config.props?.titleField as string) || "title";
  const descriptionField = (config.props?.descriptionField as string) || "description";
  const statuses: string[] = Array.isArray(config.props?.statuses)
    ? (config.props.statuses as string[])
    : ["To Do", "In Progress", "Done"];

  const [records, setRecords] = useState<KanbanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!modelName || !appId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/runtime/${appId}/${modelName}?limit=200`);
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setRecords(data.data ?? []);
    } catch {
      setError("Failed to load kanban data");
    } finally {
      setLoading(false);
    }
  }, [appId, modelName]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      await Promise.resolve(); // avoid sync setState warning
      if (!ignore) void fetchData();
    };
    run();
    return () => { ignore = true; };
  }, [fetchData]);

  if (loading) return <KanbanSkeleton />;

  if (error) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--error, #f87171)",
          background: "#12121a",
          borderRadius: "12px",
          border: "1px solid rgba(248, 113, 113, 0.2)",
        }}
      >
        <p style={{ margin: "0 0 8px" }}>{error}</p>
        <button
          onClick={fetchData}
          style={{
            background: "transparent",
            border: "1px solid rgba(248,113,113,0.4)",
            borderRadius: "6px",
            color: "#f87171",
            padding: "6px 16px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!modelName) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "#64748b",
          border: "1px dashed rgba(255,255,255,0.1)",
          borderRadius: "12px",
        }}
      >
        Kanban requires a <code>model</code> prop.
      </div>
    );
  }

  // Group records by status
  const columns = statuses.map((status) => ({
    status,
    items: records.filter(
      (item) =>
        item[statusField] === status ||
        (!item[statusField] && status === statuses[0])
    ),
  }));

  return (
    <div>
      {config.title && (
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600, color: "var(--text-primary, #fff)" }}>
          {config.title}
        </h3>
      )}
      <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "8px", minHeight: "400px" }}>
        {columns.map((col) => (
          <div
            key={col.status}
            style={{
              flexShrink: 0,
              width: "288px",
              display: "flex",
              flexDirection: "column",
              background: "#12121a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
            }}
          >
            {/* Column header */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>{col.status}</span>
              <span
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "99px",
                }}
              >
                {col.items.length}
              </span>
            </div>

            {/* Cards */}
            <div
              style={{
                flex: 1,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                overflowY: "auto",
              }}
            >
              {col.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onAction?.({ type: "edit", id: item.id }, item)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    padding: "14px",
                    cursor: onAction ? "pointer" : "default",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(74,108,111,0.5)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <div style={{ fontWeight: 500, color: "#e2e8f0", fontSize: "14px", marginBottom: "4px" }}>
                    {String(item[titleField] ?? `#${String(item.id).slice(0, 6)}`)}
                  </div>
                  {Boolean(item[descriptionField]) && (
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "12px",
                        lineHeight: "1.5",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
                      }}
                    >
                      {String(item[descriptionField])}
                    </div>
                  )}
                </div>
              ))}
              {col.items.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px 16px",
                    border: "1px dashed rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "#475569",
                    fontSize: "13px",
                  }}
                >
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
