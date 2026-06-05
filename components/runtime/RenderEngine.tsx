"use client";

import React from "react";
import { UIComponent } from "@/lib/config/types";
import { ComponentRegistry } from "./ComponentRegistry";
import { ErrorBoundary } from "./ErrorBoundary";

export interface RenderEngineProps {
  appId: string;
  layout: UIComponent[]; // A list of components to render at the root level
  data?: Record<string, unknown[] | unknown>; // Global data map
  onAction?: (action: unknown, data?: unknown) => void;
  onNavigate?: (path: string) => void;
}

export function RenderEngine({ appId, layout, data, onAction, onNavigate }: RenderEngineProps) {
  if (!layout || layout.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          color: "var(--text-secondary)",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          border: "1px dashed var(--border-default)",
        }}
      >
        <p>No layout configuration provided.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {layout.map((componentConfig) => {
        // Resolve data for this component if it specifies a model
        let componentData: unknown = undefined;
        if (componentConfig.model && data) {
           componentData = data[componentConfig.model];
        } else if (data) {
           // Pass the whole map for dashboards which need multiple models
           componentData = data;
        }

        return (
          <ErrorBoundary key={componentConfig.id || Math.random().toString()}>
            <ComponentRegistry 
              config={componentConfig} 
              appId={appId} 
              data={componentData}
              onAction={onAction}
              onNavigate={onNavigate}
            />
          </ErrorBoundary>
        );
      })}
    </div>
  );
}
