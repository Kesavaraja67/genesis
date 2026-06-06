import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { DeleteAppButton } from "@/components/dashboard/DeleteAppButton";
import { ExportZipButton } from "../../../../components/dashboard/ExportZipButton";

export const metadata: Metadata = { title: "App Overview" };

export default async function AppOverviewPage({ params }: { params: Promise<{ appId: string }> }) {
  // force TS reload for ExportZipButton
  const { appId } = await params;
  const session = await getAuthSession();

  const app = await prisma.app.findUnique({
    where: { id: appId },
    include: {
      models: true,
      workflows: { orderBy: { updatedAt: "desc" } },
      _count: { select: { runtimeData: true } },
    },
  });

  if (!app || app.userId !== session!.user!.id!) notFound();

  const navLinks = [
    {
      label: "Editor",
      href: `/dashboard/apps/${appId}/editor`,
      desc: "Edit JSON config",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    {
      label: "Preview",
      href: `/dashboard/apps/${appId}/preview`,
      desc: "Live rendered app",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: "Workflows",
      href: `/dashboard/apps/${appId}/workflows`,
      desc: "Automation flows",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  const initials = app.name.slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1280px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* App icon */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "var(--radius-lg)",
              background: "var(--pine-muted)",
              color: "var(--pine)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <h1
                style={{
                  fontSize: "var(--text-3xl)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "var(--tracking-tight)",
                  margin: 0,
                }}
              >
                {app.name}
              </h1>
              <StatusBadge status={app.status} />
            </div>
            {app.description && (
              <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>
                {app.description}
              </p>
            )}
            <p style={{ fontSize: "11px", color: "var(--text-disabled)", margin: 0, fontFamily: "var(--font-mono)" }}>
              {app.slug} · Updated {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ExportZipButton appId={appId} appName={app.name} appStatus={app.status} />
          <DeleteAppButton appId={appId} appName={app.name} />
        </div>
      </div>

      {/* Error Banner */}
      {app.status === "ERROR" && app.errorLog && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px 20px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--mauve)",
            background: "var(--mauve-muted)",
          }}
        >
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--mauve)", margin: "0 0 8px 0" }}>
            Generation Error
          </p>
          <pre
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
              whiteSpace: "pre-wrap",
              margin: 0,
              overflowX: "auto",
            }}
          >
            {app.errorLog}
          </pre>
        </div>
      )}

      {/* Navigation Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px",
              textDecoration: "none",
            }}
            className="border border-border-subtle hover:border-border-focus hover:-translate-y-[2px] transition-all duration-200"
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "var(--pine-muted)",
                borderRadius: "var(--radius-md)",
                color: "var(--pine)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {link.icon}
            </div>
            <div>
              <p style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px 0" }}>
                {link.label}
              </p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
                {link.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Models Table */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Models
          </h2>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase" }}>
            {app._count.runtimeData} records
          </span>
        </div>

        {app.models.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>
              No models yet.{" "}
              <Link href={`/dashboard/apps/${appId}/editor`} style={{ color: "var(--pine)", textDecoration: "none" }}>
                Open the editor
              </Link>{" "}
              and generate your app.
            </p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                padding: "10px 20px",
                borderBottom: "1px solid var(--border-default)",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>
                Model Name
              </span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>
                Fields
              </span>
            </div>
            {app.models.map((model: { id: string; name: string; schema: unknown }, idx: number) => {
              const schema = model.schema as { fields?: unknown[] };
              return (
                <div
                  key={model.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    padding: "14px 20px",
                    borderBottom: idx < app.models.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {model.name}
                  </span>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {schema?.fields?.length ?? 0}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workflows Table */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Workflows
          </h2>
          <Link
            href={`/dashboard/apps/${appId}/workflows`}
            style={{ fontSize: "var(--text-sm)", color: "var(--pine)", textDecoration: "none" }}
          >
            Manage →
          </Link>
        </div>
        {app.workflows.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
              No workflows configured yet.
            </p>
          </div>
        ) : (
          <div>
            {app.workflows.map((wf: { id: string; name: string; triggerType: string; isActive: boolean }, idx: number) => (
              <div
                key={wf.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom: idx < app.workflows.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <div>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)", margin: "0 0 2px 0" }}>
                    {wf.name}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, fontFamily: "var(--font-mono)" }}>
                    {wf.triggerType}
                  </p>
                </div>
                <StatusBadge status={wf.isActive ? "active" : "draft"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
