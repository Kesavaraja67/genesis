// app/(dashboard)/apps/page.tsx — All Apps per Palette 3
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "My Apps" };

export default async function AppsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const apps = await prisma.app.findMany({
    where: { userId },
    include: { _count: { select: { runtimeData: true, workflows: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1280px" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "40px",
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
            Workspace
          </p>
          <h1
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "var(--tracking-tight)",
              margin: "0 0 4px 0",
            }}
          >
            My Apps
          </h1>
          <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", margin: 0 }}>
            {apps.length} app{apps.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <Link
          href="/dashboard/apps/new"
          id="apps-page-new-app"
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
          className="bg-pine text-text-inverse hover:bg-pine-hover hover:-translate-y-[1px] transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New App
        </Link>
      </div>

      {apps.length === 0 ? (
        /* Empty State */
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "80px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.3 }}>◻</div>
          <p
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              color: "var(--text-secondary)",
              margin: "0 0 8px 0",
            }}
          >
            No apps yet
          </p>
          <p
            style={{
              fontSize: "var(--text-base)",
              color: "var(--text-disabled)",
              maxWidth: "380px",
              margin: "0 auto 32px",
            }}
          >
            Create your first Genesis app by providing a JSON configuration.
          </p>
          <Link
            href="/dashboard/apps/new"
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
            Create First App
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {apps.map((app) => {
            const initials = app.name.slice(0, 2).toUpperCase();
            return (
              <Link
                key={app.id}
                href={`/dashboard/apps/${app.id}`}
                style={{
                  display: "block",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px",
                  textDecoration: "none",
                }}
                className="border border-border-subtle hover:border-border-default hover:-translate-y-[2px] transition-all duration-200"
              >
                {/* Top Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--pine-muted)",
                      color: "var(--pine)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <h3
                  style={{
                    fontSize: "var(--text-md)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 4px 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {app.name}
                </h3>
                {app.description && (
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-secondary)",
                      margin: "0 0 16px 0",
                      lineHeight: "var(--leading-relaxed)",
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
                    paddingTop: "12px",
                    marginTop: app.description ? "0" : "16px",
                    display: "flex",
                    justifyContent: "space-between",
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
          })}

          {/* Create new card */}
          <Link
            href="/dashboard/apps/new"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              padding: "40px 20px",
              textDecoration: "none",
              minHeight: "160px",
              cursor: "pointer",
            }}
            className="border border-dashed border-border-default hover:border-border-focus hover:border-solid transition-all duration-200"
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--pine-muted)",
                color: "var(--pine)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)", margin: 0 }}>
              Create New App
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}
