"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

export interface WorkflowCanvasProps {
  steps: any[];
}

export function WorkflowCanvas({ steps }: WorkflowCanvasProps) {
  if (!steps || steps.length === 0) {
    return <div className="text-slate-500 text-sm">No steps defined</div>;
  }

  return (
    <div className="flex flex-col items-center">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="w-full max-w-md bg-black border border-white/10 rounded-lg p-4 flex gap-4 items-center">
            <div className="w-10 h-10 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs uppercase border border-purple-500/30">
              {step.type.substring(0, 3)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm">{step.name}</h4>
              <p className="text-xs text-slate-500 font-mono mt-1">{step.type}</p>
            </div>
          </div>
          
          {idx < steps.length - 1 && (
            <div className="h-8 flex items-center justify-center text-slate-600">
              <ArrowDown size={16} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
