// lib/workflow/scheduler.ts
// node-cron based scheduler for SCHEDULED workflow triggers
// Only runs in server context (Node.js)

import cron, { ScheduledTask } from "node-cron";
import { prisma } from "../db";
import { executeWorkflow } from "./engine";

const activeCrons = new Map<string, ScheduledTask>();

export async function startScheduler(): Promise<void> {
  if (typeof window !== "undefined") return; // Client-side guard

  const workflows = await prisma.workflow.findMany({
    where: { triggerType: "SCHEDULED", isActive: true },
  });

  for (const workflow of workflows) {
    registerSchedule(workflow);
  }
}

export function registerSchedule(workflow: { id: string; triggerConfig: unknown; appId: string } & object): void {
  const config = workflow.triggerConfig as Record<string, unknown>;
  const schedule = String(config.schedule ?? "");

  if (!schedule || !cron.validate(schedule)) return;

  if (activeCrons.has(workflow.id)) {
    activeCrons.get(workflow.id)!.stop();
  }

  const task = cron.schedule(schedule, async () => {
    const run = await prisma.workflowRun.create({
      data: { workflowId: workflow.id, status: "RUNNING", input: {} },
    });
    const fullWorkflow = await prisma.workflow.findUnique({ where: { id: workflow.id } });
    if (fullWorkflow) {
      executeWorkflow(fullWorkflow, {}, run.id).catch(console.error);
    }
  });

  activeCrons.set(workflow.id, task);
}

export function cancelSchedule(workflowId: string): void {
  if (activeCrons.has(workflowId)) {
    activeCrons.get(workflowId)!.stop();
    activeCrons.delete(workflowId);
  }
}
