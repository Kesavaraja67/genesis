"use client";

import React from "react";
import { UIComponent, UILayout } from "@/lib/config/types";
import { FallbackComponent } from "./FallbackComponent";
import { FormRenderer } from "./renderers/FormRenderer";
import { TableRenderer } from "./renderers/TableRenderer";
import { DashboardRenderer } from "./renderers/DashboardRenderer";
import { CardRenderer } from "./renderers/CardRenderer";
import { ChartRenderer } from "./renderers/ChartRenderer";
import { ModalRenderer } from "./renderers/ModalRenderer";
import { NavRenderer } from "./renderers/NavRenderer";
import { KanbanRenderer } from "./renderers/KanbanRenderer";
import { ContainerRenderer } from "./renderers/ContainerRenderer";

export interface ComponentRegistryProps {
  config: UIComponent;
  appId: string;
  data?: unknown; // The main data to pass down
  onAction?: (action: unknown, data?: unknown) => void;
  onNavigate?: (path: string) => void;
}

export function ComponentRegistry({ config, appId, data, onAction, onNavigate }: ComponentRegistryProps) {
  // We determine what renderer to use based on the config.type
  switch (config.type) {
    case "form":
      return <FormRenderer config={config} appId={appId} onAction={onAction} />;
    case "table":
      return <TableRenderer config={config} appId={appId} />;
    case "dashboard":
      return <DashboardRenderer layout={config as unknown as UILayout} data={data as Record<string, unknown[]>} onNavigate={onNavigate} appId={appId} />;
    case "card":
      return <CardRenderer config={config} data={data as unknown[]} onNavigate={onNavigate} />;
    case "chart":
      return <ChartRenderer config={config} appId={appId} data={data} />;
    case "modal":
      return <ModalRenderer config={config} appId={appId} onAction={onAction} />;
    case "nav":
      return <NavRenderer config={config} />;
    case "kanban":
      return <KanbanRenderer config={config} appId={appId} data={data} onAction={onAction} />;
    case "sidebar":
    case "header":
    case "stats":
    case "list":
    case "detail":
      return <ContainerRenderer config={config} appId={appId} data={data} onAction={onAction} onNavigate={onNavigate} />;
    default:
      return <FallbackComponent config={config} appId={appId} />;
  }
}
