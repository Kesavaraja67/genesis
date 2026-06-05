// lib/workflow/engine.ts
// Core workflow execution engine

import { prisma } from "../db";
import { executeStep } from "./actions";
import type { Workflow } from "@prisma/client";
import type { WorkflowStepConfig } from "../config/types";

const MAX_EXECUTION_MS = 30_000;

export async function executeWorkflow(
  workflow: Workflow,
  input: Record<string, unknown>,
  runId: string
): Promise<void> {
  const steps = workflow.steps as unknown as WorkflowStepConfig[];
  if (!steps || steps.length === 0) {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: "SUCCESS", finishedAt: new Date(), output: { message: "No steps to execute" } as never },
    });
    return;
  }

  const stepMap = new Map(steps.map((s) => [s.id, s]));
  const outputLog: Record<string, unknown> = {};
  let currentStepId: string | undefined = steps[0].id;

  const ctx = { input, steps: outputLog, appId: workflow.appId };
  const startTime = Date.now();

  while (currentStepId && currentStepId !== "__end__") {
    // Timeout guard
    if (Date.now() - startTime > MAX_EXECUTION_MS) {
      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: "FAILED",
          errorLog: "Execution timeout (30s)",
          finishedAt: new Date(),
          output: outputLog as never,
        },
      });
      return;
    }

    const step = stepMap.get(currentStepId);
    if (!step) {
      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: "FAILED",
          errorLog: `Step "${currentStepId}" not found`,
          finishedAt: new Date(),
          output: outputLog as never,
        },
      });
      return;
    }

    try {
      const result = await executeStep(step, ctx);
      outputLog[step.id] = result;

      // Special handling for condition steps
      if (step.type === "condition" && typeof result === "object" && result !== null) {
        const condResult = result as { result: boolean; nextStep: unknown };
        currentStepId = String(condResult.nextStep ?? step.onSuccess ?? "__end__");
      } else {
        currentStepId = step.onSuccess ?? "__end__";
      }

      // Update output incrementally
      await prisma.workflowRun.update({
        where: { id: runId },
        data: { output: outputLog as never },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      outputLog[`${step.id}_error`] = message;
      currentStepId = step.onFailure ?? "__end__";

      if (currentStepId === "__end__") {
        await prisma.workflowRun.update({
          where: { id: runId },
          data: {
            status: "FAILED",
            errorLog: message,
            finishedAt: new Date(),
            output: outputLog as never,
          },
        });
        return;
      }
    }
  }

  // Update workflow last run info
  await prisma.workflow.update({
    where: { id: workflow.id },
    data: { lastRunAt: new Date(), lastRunStatus: "SUCCESS" },
  });

  await prisma.workflowRun.update({
    where: { id: runId },
    data: { status: "SUCCESS", finishedAt: new Date(), output: outputLog as never },
  });
}
