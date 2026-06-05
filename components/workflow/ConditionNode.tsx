// components/workflow/ConditionNode.tsx
import React from "react";
import { GitBranch } from "lucide-react";

interface ConditionNodeProps {
  name: string;
  config?: Record<string, unknown>;
}

export function ConditionNode({ name, config }: ConditionNodeProps) {
  return (
    <div className="w-full max-w-md bg-bg-elevated border border-border rounded-lg p-4 flex gap-4 items-center relative hover:border-border-focus transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-warning" />
      <div className="w-10 h-10 rounded bg-warning/20 text-warning flex items-center justify-center border border-warning/30 shrink-0 rotate-90">
        <GitBranch size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-text-primary text-sm truncate">{name}</h4>
        <p className="text-xs text-text-secondary font-mono mt-1 truncate">
          if {String(config?.field ?? "condition")} {String(config?.operator ?? "===")} {String(config?.value ?? "?")}
        </p>
      </div>
    </div>
  );
}
