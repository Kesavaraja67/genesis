// components/ui/Input.tsx — Palette 3 per spec Section 4.2
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col w-full" style={{ gap: "6px" }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              letterSpacing: "var(--tracking-wide)",
              textTransform: "uppercase",
            }}
          >
            {label}
            {props.required && <span style={{ color: "var(--mauve)", marginLeft: "4px" }}>*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-secondary)" }}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-md transition-all
              text-sm placeholder:text-text-disabled
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? "pl-10" : ""}
              ${className}
            `}
            style={{
              background: "var(--bg-input)",
              border: `1px solid ${error ? "var(--border-error)" : "var(--border-subtle)"}`,
              color: "var(--text-primary)",
              padding: "10px 14px",
              fontSize: "14px",
              boxShadow: error
                ? "0 0 0 3px rgba(175,93,99,0.15)"
                : undefined,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? "var(--border-error)" : "var(--border-focus)";
              e.currentTarget.style.boxShadow = error
                ? "0 0 0 3px rgba(175,93,99,0.15)"
                : "0 0 0 3px rgba(74,108,111,0.15)";
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? "var(--border-error)" : "var(--border-subtle)";
              e.currentTarget.style.boxShadow = error
                ? "0 0 0 3px rgba(175,93,99,0.15)"
                : "none";
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {error && (
          <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--mauve)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col w-full" style={{ gap: "6px" }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              letterSpacing: "var(--tracking-wide)",
              textTransform: "uppercase",
            }}
          >
            {label}
            {props.required && <span style={{ color: "var(--mauve)", marginLeft: "4px" }}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full rounded-md resize-y transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          style={{
            background: "var(--bg-input)",
            border: `1px solid ${error ? "var(--border-error)" : "var(--border-subtle)"}`,
            color: "var(--text-primary)",
            padding: "10px 14px",
            fontSize: "14px",
            minHeight: "100px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? "var(--border-error)" : "var(--border-focus)";
            e.currentTarget.style.boxShadow = error
              ? "0 0 0 3px rgba(175,93,99,0.15)"
              : "0 0 0 3px rgba(74,108,111,0.15)";
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "var(--border-error)" : "var(--border-subtle)";
            e.currentTarget.style.boxShadow = "none";
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--mauve)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
