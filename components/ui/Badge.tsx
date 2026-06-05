// components/ui/Badge.tsx — Palette 3 per spec Section 4.4
type BadgeVariant =
  | "pine"
  | "lavender"
  | "mauve"
  | "success"
  | "warning"
  | "silver"
  | "default"
  // Status aliases
  | "active" | "draft" | "error" | "building" | "running" | "failed" | "cancelled";

const variantStyles: Record<BadgeVariant, string> = {
  pine:      "bg-pine-muted text-pine",
  lavender:  "bg-lavender-muted text-lavender",
  mauve:     "bg-mauve-muted text-mauve",
  success:   "bg-success-muted text-success",
  warning:   "bg-warning-muted text-warning",
  silver:    "bg-silver-muted text-silver",
  default:   "bg-silver-muted text-text-secondary",
  // Status → palette mapping
  active:    "bg-pine-muted text-pine",
  draft:     "bg-lavender-muted text-lavender",
  error:     "bg-mauve-muted text-mauve",
  building:  "bg-warning-muted text-warning",
  running:   "bg-pine-muted text-pine",
  failed:    "bg-mauve-muted text-mauve",
  cancelled: "bg-silver-muted text-text-secondary",
};

const dotColorMap: Record<BadgeVariant, string> = {
  pine:      "bg-pine animate-pulse-dot",
  lavender:  "bg-lavender animate-pulse-dot",
  mauve:     "bg-mauve",
  success:   "bg-success animate-pulse-dot",
  warning:   "bg-warning animate-pulse-dot",
  silver:    "bg-silver",
  default:   "bg-text-secondary",
  active:    "bg-pine animate-pulse-dot",
  draft:     "bg-lavender",
  error:     "bg-mauve",
  building:  "bg-warning animate-pulse-dot",
  running:   "bg-pine animate-pulse-dot",
  failed:    "bg-mauve",
  cancelled: "bg-text-secondary",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ variant = "default", children, dot, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2 py-0.5 rounded-full
        text-[11px] font-semibold uppercase tracking-widest
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColorMap[variant]}`} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase() as BadgeVariant;
  const labels: Record<string, string> = {
    active: "Active", draft: "Draft", error: "Error",
    building: "Building", running: "Running", failed: "Failed",
    cancelled: "Cancelled", success: "Success",
  };
  return <Badge variant={s} dot>{labels[s] ?? status}</Badge>;
}
