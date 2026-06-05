"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";

export interface WorkflowLogProps {
  logs: any[];
}

export function WorkflowLog({ logs }: WorkflowLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-white/10 rounded-xl text-slate-500 text-sm">
        No execution logs yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map(log => (
        <div key={log.id} className="bg-black/50 border border-white/10 p-3 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              log.status === "SUCCESS" ? "bg-green-500/20 text-green-400" :
              log.status === "FAILED" ? "bg-red-500/20 text-red-400" :
              "bg-blue-500/20 text-blue-400"
            }`}>
              {log.status}
            </span>
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(log.startedAt), { addSuffix: true })}
            </span>
          </div>
          {log.error && (
            <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20 break-words font-mono">
              {log.error}
            </div>
          )}
          <div className="text-xs text-slate-400 font-mono">
            ID: {log.id.substring(0, 8)}...
          </div>
        </div>
      ))}
    </div>
  );
}
