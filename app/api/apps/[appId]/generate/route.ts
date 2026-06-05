// app/api/apps/[appId]/generate/route.ts
// POST — triggers full generation pipeline

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { parseConfig } from "@/lib/config/parser";
import { buildSchema } from "@/lib/runtime/schemaBuilder";
import type { GenesisConfig, WorkflowConfig } from "@/lib/config/types";

async function resolveApp(appId: string, userId: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return { error: "App not found", status: 404 };
  if (app.userId !== userId) return { error: "Forbidden", status: 403 };
  return { app };
}

const TRIGGER_TYPE_MAP: Record<string, "MANUAL" | "ON_RECORD_CREATE" | "ON_RECORD_UPDATE" | "ON_RECORD_DELETE" | "SCHEDULED" | "ON_FORM_SUBMIT"> = {
  manual: "MANUAL",
  onRecordCreate: "ON_RECORD_CREATE",
  onRecordUpdate: "ON_RECORD_UPDATE",
  onRecordDelete: "ON_RECORD_DELETE",
  scheduled: "SCHEDULED",
  onFormSubmit: "ON_FORM_SUBMIT",
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const resolved = await resolveApp(appId, authResult.user.id);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  const { app } = resolved;

  // Set status to BUILDING
  await prisma.app.update({ where: { id: appId }, data: { status: "BUILDING" } });

  try {
    // Step 1: Validate + sanitize config
    const validation = parseConfig(app.config);
    if (!validation.valid || !validation.sanitizedConfig) {
      await prisma.app.update({
        where: { id: appId },
        data: { status: "ERROR", errorLog: JSON.stringify(validation.errors) },
      });
      return NextResponse.json(
        { success: false, errors: validation.errors.map(e => e.message) },
        { status: 400 }
      );
    }

    const genesisConfig = validation.sanitizedConfig as GenesisConfig;

    // Step 2: Build normalized model schemas
    const normalizedModels = buildSchema(genesisConfig.models);

    // Step 3: Upsert AppModel records
    const upsertedModels = await Promise.all(
      normalizedModels.map((model) =>
        prisma.appModel.upsert({
          where: { appId_name: { appId, name: model.name } },
          create: {
            appId,
            name: model.name,
            schema: model as never,
          },
          update: {
            schema: model as never,
          },
        })
      )
    );

    // Step 4: Remove AppModels that no longer exist in config
    const configModelNames = new Set(normalizedModels.map(m => m.name));
    const existingModels = await prisma.appModel.findMany({ where: { appId } });
    const toDelete = existingModels.filter((m: { id: string; name: string }) => !configModelNames.has(m.name));
    if (toDelete.length > 0) {
      await prisma.appModel.deleteMany({ where: { id: { in: toDelete.map((m: { id: string }) => m.id) } } });
    }

    // Step 5: Sync workflows
    const configWorkflows: WorkflowConfig[] = genesisConfig.workflows ?? [];
    const upsertedWorkflows = await Promise.all(
      configWorkflows.map((wf) =>
        prisma.workflow.upsert({
          where: { id: wf.id },
          create: {
            id: wf.id,
            appId,
            name: wf.name,
            triggerType: TRIGGER_TYPE_MAP[wf.trigger.type] ?? "MANUAL",
            triggerConfig: wf.trigger as never,
            steps: wf.steps as never,
            isActive: wf.isActive ?? false,
          },
          update: {
            name: wf.name,
            triggerType: TRIGGER_TYPE_MAP[wf.trigger.type] ?? "MANUAL",
            triggerConfig: wf.trigger as never,
            steps: wf.steps as never,
            isActive: wf.isActive ?? false,
          },
        })
      )
    );

    // Step 6: Set status to ACTIVE
    await prisma.app.update({
      where: { id: appId },
      data: { status: "ACTIVE", errorLog: null },
    });

    return NextResponse.json({
      success: true,
      models: upsertedModels,
      workflows: upsertedWorkflows,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.app.update({
      where: { id: appId },
      data: { status: "ERROR", errorLog: message },
    });
    return NextResponse.json({ success: false, errors: [message] }, { status: 500 });
  }
}
