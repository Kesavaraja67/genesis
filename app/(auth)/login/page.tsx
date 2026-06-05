// app/(auth)/login/page.tsx — Palette 3 per spec Section 5.2
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Genesis workspace",
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="animate-slide-up" style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          {/* Brand Icon 44px */}
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "var(--pine-muted)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "var(--pine)",
            }}
          >
            GN
          </div>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Genesis
          </h1>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            In the beginning, there was a config.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            padding: "40px",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Card Title */}
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "4px",
              marginTop: 0,
            }}
          >
            Welcome back
          </h2>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              marginBottom: "28px",
              marginTop: 0,
            }}
          >
            Sign in to your Genesis workspace
          </p>

          <LoginForm mode="login" />

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-disabled)",
                letterSpacing: "var(--tracking-widest)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              or continue with
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          </div>

          <OAuthButtons />

          {/* Sign Up Link */}
          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              marginBottom: 0,
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-pine font-medium no-underline hover:underline transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
