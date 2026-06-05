"use client";
// app/(dashboard)/apps/[appId]/workflows/page.tsx — per spec Section 5.6

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/ui/Badge";

interface AppMeta {
  id: string;
  name: string;
  config: Record<string, unknown>;
}

interface WorkflowLogEntry {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface Workflow {
  id: string;
  name: string;
  active?: boolean;
  trigger?: { type?: string };
  steps?: { id?: string; name?: string; action?: string; type?: string }[];
}

export default function WorkflowsPage() {
  const { appId } = useParams<{ appId: string }>();
  const [app, setApp] = useState<AppMeta | null>(null);
  const [logs, setLogs] = useState<WorkflowLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/apps/${appId}`).then(r => r.json()),
      Promise.resolve({ logs: [] }),
    ])
      .then(([appData, logsData]) => {
        setApp(appData.app);
        setLogs(logsData.logs || []);
        // Select first workflow by default
        const wfs = appData.app?.config?.workflows || [];
        if (wfs.length > 0) setSelected(wfs[0].id);
      })
      .catch(() => toast.error("Failed to load workflows"))
      .finally(() => setLoading(false));
  }, [appId]);

  const handleRun = async (workflowId: string) => {
    setRunning(workflowId);
    try {
      const res = await fetch(`/api/apps/${appId}/workflows/${workflowId}/run`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Workflow executed successfully!");
        setLogs(prev => [data.log, ...prev]);
      } else {
        toast.error(data.error || "Workflow failed");
      }
    } catch {
      toast.error("Workflow failed to execute");
    } finally {
      setRunning(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "calc(100vh - 0px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <svg
            style={{ width: "24px", height: "24px", animation: "spin 0.7s linear infinite", color: "var(--pine)" }}
            viewBox="0 0 24 24" fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>Loading workflows…</p>
        </div>
      </div>
    );
  }

  const workflows = (app?.config?.workflows as Workflow[]) || [];
  const selectedWf = workflows.find((wf) => wf.id === selected);
  const wfLogs = logs.filter(l => l.workflowId === selected);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Workflow List Panel (300px) ─────────────────────────────────────── */}
      <div
        style={{
          width: "300px",
          flexShrink: 0,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 16px 16px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Workflows
          </h2>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-overlay)",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {workflows.length}
          </span>
        </div>

        {/* Workflow List */}
        <nav style={{ padding: "8px", flex: 1 }}>
          {workflows.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-disabled)", margin: 0 }}>
                No workflows configured
              </p>
            </div>
          ) : (
            workflows.map((wf) => {
              const isActive = selected === wf.id;
              return (
                <button
                  key={wf.id}
                  onClick={() => setSelected(wf.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    background: isActive ? "var(--pine-muted)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: "2px",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        color: isActive ? "var(--pine)" : "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {wf.name}
                    </span>
                    <StatusBadge status={wf.active !== false ? "active" : "draft"} />
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: isActive ? "var(--pine)" : "var(--text-secondary)",
                      margin: 0,
                      fontFamily: "var(--font-mono)",
                      opacity: 0.8,
                    }}
                  >
                    {wf.trigger?.type ?? "manual"}
                  </p>
                </button>
              );
            })
          )}
        </nav>
      </div>

      {/* ── Workflow Detail ──────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 40px",
        }}
      >
        {!selectedWf ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60%",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 8px 0" }}>
              No workflow selected
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-disabled)", margin: 0 }}>
              Select a workflow from the list to view details
            </p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
              <div>
                <h1
                  style={{
                    fontSize: "var(--text-2xl)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: "0 0 8px 0",
                  }}
                >
                  {selectedWf.name}
                </h1>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, fontFamily: "var(--font-mono)" }}>
                  Trigger: {selectedWf.trigger?.type ?? "manual"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => handleRun(selectedWf.id)}
                  disabled={running === selectedWf.id}
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
                    cursor: running === selectedWf.id ? "not-allowed" : "pointer",
                    opacity: running === selectedWf.id ? 0.7 : 1,
                    transition: "background var(--transition-base), border-color var(--transition-base)",
                  }}
                  onMouseEnter={(e) => {
                    if (running !== selectedWf.id) {
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-focus)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
                  }}
                >
                  {running === selectedWf.id && (
                    <svg
                      style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }}
                      viewBox="0 0 24 24" fill="none"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  )}
                  Run Now
                </button>
              </div>
            </div>

            {/* Steps */}
            {(selectedWf.steps?.length ?? 0) > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--text-disabled)",
                    letterSpacing: "var(--tracking-widest)",
                    textTransform: "uppercase",
                    margin: "0 0 16px 0",
                  }}
                >
                  Steps
                </p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {(selectedWf.steps || []).map((step, idx: number) => {
                    return (
                    <div key={step.id ?? idx}>
                      <div
                        style={{
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-lg)",
                          padding: "16px 20px",
                          display: "flex",
                          gap: "14px",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Step icon */}
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            background: "var(--pine-muted)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--pine)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: "14px",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px 0" }}>
                            {step.name ?? step.action ?? `Step ${idx + 1}`}
                          </p>
                          <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, fontFamily: "var(--font-mono)" }}>
                            {step.type ?? step.action ?? "action"}
                          </p>
                        </div>
                      </div>
                      {/* Connector line */}
                      {idx < (selectedWf.steps?.length ?? 0) - 1 && (
                        <div className="step-connector" />
                      )}
                    </div>
                  )})}
                </div>
              </div>
            )}

            {/* Execution History */}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-disabled)",
                  letterSpacing: "var(--tracking-widest)",
                  textTransform: "uppercase",
                  margin: "0 0 16px 0",
                }}
              >
                Execution History
              </p>
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                }}
              >
                {/* Table Header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 140px 80px",
                    padding: "10px 16px",
                    background: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border-default)",
                  }}
                >
                  {["Run ID", "Status", "Started At", "Duration"].map(h => (
                    <span
                      key={h}
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        letterSpacing: "var(--tracking-widest)",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {wfLogs.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-disabled)", margin: 0 }}>
                      No executions recorded yet
                    </p>
                  </div>
                ) : (
                  wfLogs.map((log, idx) => {
                    const duration = log.completedAt
                      ? `${Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)}s`
                      : "—";
                    return (
                      <div
                        key={log.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 100px 140px 80px",
                          padding: "14px 16px",
                          borderBottom: idx < wfLogs.length - 1 ? "1px solid var(--border-subtle)" : "none",
                          alignItems: "center",
                          transition: "background var(--transition-fast)",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-overlay)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      >
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {log.id.slice(0, 8)}…
                        </span>
                        <StatusBadge status={log.status} />
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                          {new Date(log.startedAt).toLocaleString()}
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                          {duration}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
