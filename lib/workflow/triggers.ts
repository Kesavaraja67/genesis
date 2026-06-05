// lib/workflow/triggers.ts
// Trigger type definitions and event dispatching

import { prisma } from "../db";
import { executeWorkflow } from "./engine";
import type { TriggerType } from "@prisma/client";

export async function triggerWorkflows(
  appId: string,
  triggerType: TriggerType,
  modelName: string,
  record: Record<string, unknown>
): Promise<void> {
  const workflows = await prisma.workflow.findMany({
    where: { appId, triggerType, isActive: true },
  });

  for (const workflow of workflows) {
    const triggerConfig = workflow.triggerConfig as Record<string, unknown>;
    if (triggerConfig.model && triggerConfig.model !== modelName) continue;

    const run = await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        status: "RUNNING",
        input: record as never,
      },
    });

    executeWorkflow(workflow, record, run.id).catch(async (err) => {
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          errorLog: err instanceof Error ? err.message : "Unknown error",
          finishedAt: new Date(),
        },
      });
    });
  }
}
