// components/workflow/ActionNode.tsx
import React from "react";
import { Play } from "lucide-react";

interface ActionNodeProps {
  type: string;
  name: string;
  config?: Record<string, unknown>;
}

export function ActionNode({ type, name, config }: ActionNodeProps) {
  return (
    <div className="w-full max-w-md bg-bg-elevated border border-border rounded-lg p-4 flex gap-4 items-center relative hover:border-border-focus transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      <div className="w-10 h-10 rounded bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shrink-0">
        <Play size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-text-primary text-sm truncate">{name}</h4>
        <p className="text-xs text-text-secondary font-mono mt-1 truncate">{type}</p>
      </div>
      {config && Object.keys(config).length > 0 && (
        <div className="shrink-0 text-xs text-text-disabled bg-bg-overlay px-2 py-1 rounded">
          {Object.keys(config).length} params
        </div>
      )}
    </div>
  );
}
