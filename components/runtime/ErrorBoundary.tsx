// components/runtime/ErrorBoundary.tsx
"use client";
import React from "react";

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback?: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="border border-error/30 bg-error/5 rounded-lg p-4 text-sm">
          <p className="text-error font-semibold mb-1">Component failed to load</p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-muted font-mono">{this.state.error?.message}</p>
          )}
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
