// app/(dashboard)/page.tsx — Dashboard Home per spec Section 5.3
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [apps, totalRecords] = await Promise.all([
    prisma.app.findMany({
      where: { userId },
      include: { _count: { select: { runtimeData: true, workflows: true } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.runtimeRecord.count({
      where: { app: { userId } },
    }),
  ]);

  const totalApps = await prisma.app.count({ where: { userId } });
  const activeWorkflows = await prisma.workflow.count({
    where: { app: { userId }, isActive: true },
  });

  const firstName = session?.user?.name?.split(" ")[0] ?? null;

  const stats = [
    { label: "Total Apps", value: totalApps, delta: null },
    { label: "Total Records", value: totalRecords, delta: null },
    { label: "Active Workflows", value: activeWorkflows, delta: null },
  ];

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1280px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "var(--tracking-tight)",
            margin: "0 0 4px 0",
          }}
        >
          {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        </h1>
        <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", margin: 0 }}>
          Here&apos;s what&apos;s happening with your apps.
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "var(--shadow-sm), var(--shadow-inset)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                letterSpacing: "var(--tracking-widest)",
                textTransform: "uppercase",
                marginBottom: "12px",
                margin: "0 0 12px 0",
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontSize: "var(--text-3xl)",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: "0 0 4px 0",
              }}
            >
              {stat.value}
            </p>
            {stat.delta !== null && (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-success)", margin: 0 }}>
                {stat.delta}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Apps Section */}
      <div style={{ marginBottom: "40px" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-disabled)",
                letterSpacing: "var(--tracking-widest)",
                textTransform: "uppercase",
                margin: "0 0 4px 0",
              }}
            >
              Recent Activity
            </p>
            <h2
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Your Apps
            </h2>
          </div>
          <Link
            href="/dashboard/apps"
            style={{
              fontSize: "var(--text-sm)",
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
            }}
            className="text-text-secondary hover:text-text-primary bg-transparent hover:bg-bg-overlay transition-colors duration-200 no-underline"
          >
            View all →
          </Link>
        </div>

        {apps.length === 0 ? (
          /* Empty state */
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.4 }}>◻</div>
            <p
              style={{
                fontSize: "var(--text-md)",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "8px",
                marginTop: 0,
              }}
            >
              No apps yet
            </p>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-disabled)",
                marginBottom: "24px",
                marginTop: 0,
              }}
            >
              In the beginning, there was a config. Create your first app to get started.
            </p>
            <Link
              href="/dashboard/apps/new"
              id="dashboard-create-first-app"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--pine)",
                color: "var(--text-inverse)",
                padding: "10px 20px",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Create your first app
            </Link>
          </div>
        ) : (
          /* Apps Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        <QuickAction
          href="/dashboard/apps/new"
          id="dashboard-new-app-cta"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
          title="Create New App"
          subtitle="Start from a JSON config template"
        />
        <QuickAction
          href="https://github.com/genesis/runtime"
          id="dashboard-docs-cta"
          external
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          }
          title="View Documentation"
          subtitle="API reference and guides"
        />
      </div>
    </div>
  );
}

type AppCardProps = { id: string; name: string; status: string; description?: string | null; updatedAt: Date; _count: { runtimeData: number; workflows: number } };
function AppCard({ app }: { app: AppCardProps }) {
  return (
    <Link
      href={`/dashboard/apps/${app.id}`}
      style={{
        display: "block",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        textDecoration: "none",
        cursor: "pointer",
      }}
      className="border border-border-subtle hover:border-border-default hover:-translate-y-[2px] transition-all duration-200"
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <p
          style={{
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
            marginRight: "8px",
          }}
        >
          {app.name}
        </p>
        <StatusBadge status={app.status} />
      </div>

      {/* Description */}
      {app.description && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--leading-relaxed)",
            marginBottom: "20px",
            marginTop: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            WebkitBoxOrient: "vertical" as any,
            overflow: "hidden",
          }}
        >
          {app.description}
        </p>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--text-disabled)" }}>
          {app._count.runtimeData} records · {app._count.workflows} workflows
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-disabled)" }}>
          {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </Link>
  );
}

function QuickAction({
  href,
  id,
  icon,
  title,
  subtitle,
  external,
}: {
  href: string;
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  external?: boolean;
}) {
  const style = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    textDecoration: "none",
    cursor: "pointer",
  } as React.CSSProperties;

  const content = (
    <>
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
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px 0" }}>
          {title}
        </p>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
          {subtitle}
        </p>
      </div>
    </>
  );

  const cssClasses = "border border-dashed border-border-default hover:border-border-focus hover:border-solid transition-all duration-200";

  if (external) {
    return (
      <a id={id} href={href} target="_blank" rel="noreferrer" style={style} className={cssClasses}>
        {content}
      </a>
    );
  }
  return (
    <Link id={id} href={href} style={style} className={cssClasses}>
      {content}
    </Link>
  );
}
