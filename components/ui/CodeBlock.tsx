// components/ui/CodeBlock.tsx
"use client";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  copyable?: boolean;
}

export function CodeBlock({ code, language = "json", title, copyable = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {(title || copyable) && (
        <div className="flex items-center justify-between px-4 py-2 bg-bg-elevated border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-error/60" />
            <span className="w-3 h-3 rounded-full bg-warning/60" />
            <span className="w-3 h-3 rounded-full bg-success/60" />
            {title && <span className="ml-2 text-xs text-muted font-mono">{title}</span>}
          </div>
          {copyable && (
            <button
              onClick={handleCopy}
              className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      )}
      <pre className="bg-bg-elevated p-4 overflow-x-auto text-sm">
        <code className={`language-${language} font-mono text-accent`}>{code}</code>
      </pre>
    </div>
  );
}
