"use client";

import React from "react";
import { UIComponent } from "@/lib/config/types";

export interface CardRendererProps {
  config: UIComponent;
  data: unknown[];
  onNavigate?: (path: string) => void;
}

export function CardRenderer({ config, data, onNavigate }: CardRendererProps) {
  // Compute aggregate data if specified
  const value = React.useMemo(() => {
    if (!data || data.length === 0) return 0;
    
    if (config.props?.aggregate === "count") {
      return data.length;
    }
    
    if (config.props?.aggregate === "sum" && config.props.field) {
      return data.reduce((acc: number, curr: unknown) => {
        const val = curr && typeof curr === "object" ? (curr as Record<string, unknown>)[config.props!.field as string] : 0;
        return acc + (Number(val) || 0);
      }, 0);
    }
    
    return data.length;
  }, [data, config]);

  return (
    <div 
      className="p-6 rounded-xl border border-white/10 bg-[#12121a] hover:border-purple-500/50 transition-colors shadow-lg shadow-black/50 cursor-pointer"
      onClick={() => config.props?.link && onNavigate?.(config.props.link as string)}
    >
      <h3 className="text-sm font-medium text-slate-400 mb-2">{config.title || "Card"}</h3>
      <div className="text-3xl font-bold text-white font-display">
        {value.toLocaleString()}
      </div>
      {Boolean(config.props?.description) && (
        <p className="text-xs text-slate-500 mt-2">{String(config.props!.description)}</p>
      )}
    </div>
  );
}
