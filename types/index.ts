// types/index.ts
// Global application TypeScript types

import type { App, AppModel, Workflow, WorkflowRun } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppWithMeta extends App {
  models?: AppModel[];
  workflows?: Workflow[];
  workflowCount?: number;
  _count?: {
    runtimeData: number;
    workflows: number;
  };
}

export interface WorkflowWithRuns extends Workflow {
  runs?: WorkflowRun[];
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

export interface GenerateResult {
  success: boolean;
  models: AppModel[];
  workflows: Workflow[];
  errors?: string[];
}
