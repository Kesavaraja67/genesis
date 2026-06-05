"use client";

import React from "react";
import { UIComponent } from "@/lib/config/types";
import { ComponentRegistry } from "../ComponentRegistry";

export interface ContainerRendererProps {
  config: UIComponent;
  appId: string;
  data?: unknown;
  onAction?: (action: unknown, data?: unknown) => void;
  onNavigate?: (path: string) => void;
}

export function ContainerRenderer({ config, appId, data, onAction, onNavigate }: ContainerRendererProps) {
  return (
    <div className={`flex flex-col gap-4 w-full rounded-xl ${config.style?.padding || ''} ${config.style?.background || 'bg-bg-elevated'}`}>
      {config.title && <h3 className="text-lg font-bold text-white px-4 pt-4">{config.title}</h3>}
      <div className="flex flex-col gap-4 p-4">
        {config.children?.map((child, i) => (
          <ComponentRegistry 
            key={child.id || i}
            config={child as UIComponent}
            appId={appId}
            data={data}
            onAction={onAction}
            onNavigate={onNavigate}
          />
        ))}
        {(!config.children || config.children.length === 0) && (
          <div className="text-sm text-muted italic opacity-50 border border-dashed border-border p-4 rounded-md text-center">
            [{config.type}] component (empty)
          </div>
        )}
      </div>
    </div>
  );
}
