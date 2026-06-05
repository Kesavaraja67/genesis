// components/ui/Spinner.tsx — Palette 3
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: string;
}

const sizes = {
  sm: { w: "16px", h: "16px" },
  md: { w: "24px", h: "24px" },
  lg: { w: "32px", h: "32px" },
};

export function Spinner({ size = "md", className = "", color }: SpinnerProps) {
  const { w, h } = sizes[size];
  const c = color ?? "var(--pine)";
  return (
    <svg
      className={className}
      style={{ width: w, height: h, animation: "spin 0.7s linear infinite", color: c, flexShrink: 0 }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
