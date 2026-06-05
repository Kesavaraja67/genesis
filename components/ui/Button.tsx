// components/ui/Button.tsx — Palette 3 per spec Section 4.1
import { forwardRef } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: [
    "bg-pine text-text-inverse font-medium",
    "hover:bg-pine-hover hover:-translate-y-px",
    "active:translate-y-0 active:brightness-90",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),

  secondary: [
    "bg-transparent text-text-primary border border-border",
    "hover:bg-bg-overlay hover:border-border-focus",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),

  ghost: [
    "bg-transparent text-text-secondary border-none",
    "hover:text-text-primary hover:bg-bg-overlay",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),

  danger: [
    "bg-mauve-muted text-mauve border border-mauve",
    "hover:bg-mauve hover:text-text-inverse",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),

  icon: [
    "bg-transparent text-text-secondary border-none",
    "hover:bg-bg-overlay hover:text-text-primary",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm gap-2 rounded-md",
  md: "px-5 py-2.5 text-sm gap-2 rounded-md",
  lg: "px-5 py-3 text-base gap-2.5 rounded-md",
};

const iconSizeStyles: Record<Size, string> = {
  sm: "w-7 h-7 rounded-md",
  md: "w-8 h-8 rounded-md",
  lg: "w-9 h-9 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, ...props }, ref) => {
    const isIcon = variant === "icon";
    const sizeClass = isIcon ? iconSizeStyles[size] : sizeStyles[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center
          font-medium transition-all duration-200 cursor-pointer
          focus:outline-none focus-visible:ring-0
          focus-visible:[box-shadow:0_0_0_3px_rgba(74,108,111,0.25)]
          select-none
          ${variantStyles[variant]}
          ${sizeClass}
          ${className}
        `}
        {...props}
      >
        {loading
          ? <Spinner size="sm" />
          : icon
        }
        {!isIcon && children}
        {isIcon && !icon && children}
      </button>
    );
  }
);
Button.displayName = "Button";
