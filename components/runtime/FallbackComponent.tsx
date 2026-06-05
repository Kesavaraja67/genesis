// components/runtime/FallbackComponent.tsx
import type { ComponentConfig, ActionConfig } from "@/lib/config/types";

export interface ComponentRenderProps {
  config: ComponentConfig;
  appId: string;
  modelData?: Record<string, Record<string, unknown>[]>;
  onAction?: (action: ActionConfig, context: unknown) => void;
}

export function FallbackComponent({ config }: ComponentRenderProps) {
  if (process.env.NODE_ENV === "production") {
    return <div style={{ display: "none" }} />;
  }
  return (
    <div className="border-2 border-dashed border-warning/40 rounded-lg p-4 bg-warning/5">
      <p className="text-warning text-xs font-mono font-semibold">
        Unknown component: <code className="text-accent">{config.type}</code>
      </p>
      <p className="text-muted text-xs mt-1">This component type is not registered in the ComponentRegistry.</p>
    </div>
  );
}
