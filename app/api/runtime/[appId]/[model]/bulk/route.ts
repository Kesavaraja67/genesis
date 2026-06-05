// app/api/runtime/[appId]/[model]/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeModel } from "@/lib/runtime/schemaBuilder";
import { createCRUDHandler, ValidationError } from "@/lib/runtime/apiGenerator";
import { auth } from "@/auth";
import { triggerWorkflows } from "@/lib/workflow/triggers";

async function resolveModel(appId: string, modelName: string, userId?: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return { error: "App not found", status: 404 };

  if (userId && app.userId !== userId) {
    return { error: "Forbidden", status: 403 };
  }

  const appModel = await prisma.appModel.findFirst({
    where: { appId, name: { equals: modelName, mode: "insensitive" } },
  });
  if (!appModel) return { error: `Model "${modelName}" not found`, status: 404 };

  const normalized = normalizeModel(appModel.schema as unknown as Parameters<typeof normalizeModel>[0]);
  return { app, appModel, normalized };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string; model: string }> }
) {
  const { appId, model: modelName } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  const resolved = await resolveModel(appId, modelName, userId);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  const { normalized } = resolved;
  const handler = createCRUDHandler(normalized);

  let data: unknown[];
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Body must be an array of records" }, { status: 400 });
    }
    data = body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    try {
      const record = await handler.create(appId, data[i]);
      results.push(record);
      // Fire workflows async
      triggerWorkflows(appId, "ON_RECORD_CREATE", modelName, record).catch(console.error);
    } catch (err) {
      if (err instanceof ValidationError) {
        errors.push({ index: i, errors: err.errors });
      } else {
        errors.push({ index: i, error: "Internal error" });
      }
    }
  }

  return NextResponse.json({
    data: results,
    errors: errors.length > 0 ? errors : undefined,
    successCount: results.length,
    errorCount: errors.length
  }, { status: 201 });
}
