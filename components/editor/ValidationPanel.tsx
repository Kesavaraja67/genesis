// components/editor/ValidationPanel.tsx — Palette 3 per spec Section 5.4
import type { ValidationResult } from "@/lib/config/types";

interface ValidationPanelProps {
  validation: ValidationResult | null;
  loading: boolean;
}

export function ValidationPanel({ validation, loading }: ValidationPanelProps) {
  const errorCount  = validation?.errors?.length ?? 0;
  const warningCount = validation?.warnings?.length ?? 0;

  const dotColor = errorCount > 0
    ? "var(--mauve)"
    : warningCount > 0
    ? "var(--color-warning)"
    : "var(--color-success)";

  const dotStatus = errorCount > 0 ? "Errors" : warningCount > 0 ? "Warnings" : "Valid";

  return (
    <div>
      {/* Panel Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            letterSpacing: "var(--tracking-widest)",
            textTransform: "uppercase",
          }}
        >
          Validation
        </span>

        {/* Live Status Dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {loading && (
            <svg
              style={{ width: "12px", height: "12px", animation: "spin 0.7s linear infinite", color: "var(--text-secondary)" }}
              viewBox="0 0 24 24" fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {!loading && validation !== null && (
            <>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: dotColor,
                  display: "inline-block",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{dotStatus}</span>
            </>
          )}
        </div>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[80, 65, 75].map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: "14px",
                width: `${w}%`,
                borderRadius: "var(--radius-sm)",
              }}
            />
          ))}
        </div>
      )}

      {/* All clear */}
      {!loading && validation?.valid && errorCount === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          <svg
            width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-success)" strokeWidth="1.75" style={{ marginBottom: "12px" }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--color-success)",
              margin: "0 0 4px 0",
            }}
          >
            Config looks good
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
            No errors found.
          </p>
        </div>
      )}

      {/* No validation yet */}
      {!loading && validation === null && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-disabled)", margin: 0 }}>
            Start editing to validate your config.
          </p>
        </div>
      )}

      {/* Errors */}
      {!loading && validation && errorCount > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {validation.errors.map((issue: unknown, i: number) => (
            <IssueItem key={i} issue={issue} type="error" />
          ))}
          {validation.warnings?.map((issue: unknown, i: number) => (
            <IssueItem key={`w${i}`} issue={issue} type="warning" />
          ))}
        </div>
      )}

      {/* Warnings only */}
      {!loading && validation?.valid && warningCount > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {validation.warnings?.map((issue: unknown, i: number) => (
            <IssueItem key={i} issue={issue} type="warning" />
          ))}
        </div>
      )}
    </div>
  );
}

function IssueItem({ issue, type }: { issue: unknown; type: "error" | "warning" | "info" }) {
  const styles = {
    error: {
      bg: "var(--mauve-muted)",
      border: "var(--mauve)",
    },
    warning: {
      bg: "var(--color-warning-muted)",
      border: "var(--color-warning)",
    },
    info: {
      bg: "var(--color-info-muted)",
      border: "var(--pine)",
    },
  }[type];

  const issueObj = issue as Record<string, unknown>;
  const message = typeof issue === "string" ? issue : (issueObj?.message as string ?? JSON.stringify(issue));
  const path    = typeof issue === "object" && issue !== null && "path" in issueObj ? (issueObj.path as string) : null;

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        padding: "10px 12px",
        borderRadius: "var(--radius-md)",
        background: styles.bg,
        borderLeft: `2px solid ${styles.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {path && (
          <p
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              margin: "0 0 2px 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {path}
          </p>
        )}
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: "var(--leading-snug)",
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
