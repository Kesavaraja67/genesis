"use client";
// app/page.tsx — Landing Page per spec Section 5.1

import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* Version Badge */}
        <span
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--pine-muted)",
            color: "var(--pine)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--pine)",
              display: "inline-block",
            }}
          />
          Genesis v0.1.0 is live
        </span>

        {/* Headline */}
        <h1
          className="animate-slide-up"
          style={{
            fontSize: "clamp(36px, 6vw, 48px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: "var(--leading-tight)",
            maxWidth: "640px",
            margin: 0,
          }}
        >
          In the beginning,
          <br />
          there was a config.
        </h1>

        {/* Subline */}
        <p
          className="animate-slide-up"
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 400,
            color: "var(--text-secondary)",
            maxWidth: "480px",
            lineHeight: "var(--leading-relaxed)",
            margin: 0,
          }}
        >
          Define your UI, schema, and workflows in JSON.
          <br />
          We handle the rest.
        </p>

        {/* CTA Row */}
        <div
          className="animate-fade-in"
          style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}
        >
          <Link
            href="/dashboard"
            id="hero-cta-start"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--pine)",
              color: "var(--text-inverse)",
              fontSize: "14px",
              fontWeight: 500,
              padding: "10px 20px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              transition: "background var(--transition-base), transform var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--pine-hover)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--pine)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Start Building
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <a
            href="https://github.com/genesis/runtime"
            target="_blank"
            rel="noreferrer"
            id="hero-cta-docs"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: "14px",
              fontWeight: 500,
              padding: "10px 20px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              textDecoration: "none",
              transition: "background var(--transition-base), border-color var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-overlay)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-focus)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-default)";
            }}
          >
            View Documentation
          </a>
        </div>
      </section>

      {/* ── Feature Strip ────────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          padding: "60px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              ),
              title: "Metadata Driven",
              desc: "Everything from your database schema to your dashboard UI is generated from a single, strict JSON config.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              ),
              title: "Dynamic Runtime API",
              desc: "RESTful endpoints and database queries are constructed on the fly without deploying new backend code.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              ),
              title: "Serverless Workflows",
              desc: "Connect data triggers to powerful automated workflows running instantly on the edge.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                padding: "32px 40px",
                borderRight: i < 2 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  color: "var(--pine)",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                  margin: "0 0 8px 0",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-base)",
                  color: "var(--text-secondary)",
                  lineHeight: "var(--leading-relaxed)",
                  margin: 0,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
