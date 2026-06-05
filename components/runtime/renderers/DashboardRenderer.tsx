"use client";

import React from "react";
import { UILayout, UIComponent } from "@/lib/config/types";
import { CardRenderer } from "./CardRenderer";
import { ChartRenderer } from "./ChartRenderer";
import { TableRenderer } from "./TableRenderer";

export interface DashboardRendererProps {
  layout: UILayout;
  data: Record<string, unknown[]>; // map of modelName to data array
  onNavigate?: (path: string) => void;
  appId?: string;
}

export function DashboardRenderer({ layout, data, onNavigate, appId }: DashboardRendererProps) {
  const renderItem = (item: UIComponent) => {
    switch (item.type) {
      case "card":
        return <CardRenderer key={item.id} config={item} data={data[item.model || ""] || []} onNavigate={onNavigate} />;
      case "chart":
        return <ChartRenderer key={item.id} config={item} data={data[item.model || ""] || []} appId={appId || ""} />;
      case "table":
        return (
          <div key={item.id} className="col-span-full">
            <TableRenderer config={item} appId={appId || ""} />
          </div>
        );
      default:
        return (
          <div key={item.id} className="p-4 rounded-xl border border-white/10 bg-white/5 text-slate-400">
            Unknown component type: {item.type}
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {layout.components?.map(renderItem)}
      </div>
    </div>
  );
}
