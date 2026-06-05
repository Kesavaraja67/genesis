// components/workflow/TriggerNode.tsx
import React from "react";
import { Zap } from "lucide-react";

interface TriggerNodeProps {
  type: string;
  name: string;
  config?: Record<string, unknown>;
}

export function TriggerNode({ type, name, config }: TriggerNodeProps) {
  return (
    <div className="w-full max-w-md bg-bg-elevated border border-border rounded-lg p-4 flex gap-4 items-center relative overflow-hidden group hover:border-border-focus transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
      <div className="w-10 h-10 rounded bg-accent/20 text-accent flex items-center justify-center border border-accent/30 shrink-0">
        <Zap size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-text-primary text-sm truncate">{name}</h4>
        <p className="text-xs text-text-secondary font-mono mt-1 uppercase truncate">{type.replace(/_/g, " ")}</p>
      </div>
      {config && Object.keys(config).length > 0 && (
        <div className="shrink-0 text-xs text-text-disabled">
          {Object.keys(config).length} param{Object.keys(config).length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
