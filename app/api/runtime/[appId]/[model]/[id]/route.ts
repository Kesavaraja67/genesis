// app/api/runtime/[appId]/[model]/[id]/route.ts
// GET, PUT, DELETE for a single runtime record

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { normalizeModel } from "@/lib/runtime/schemaBuilder";
import { createCRUDHandler, ValidationError, NotFoundError } from "@/lib/runtime/apiGenerator";
import { triggerWorkflows } from "@/lib/workflow/triggers";

async function resolveModel(appId: string, modelName: string, userId?: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return { error: "App not found", status: 404 };

  // If a userId is provided, enforce ownership
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

// ── GET /api/runtime/[appId]/[model]/[id] ────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string; model: string; id: string }> }
) {
  const { appId, model: modelName, id: recordId } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  const resolved = await resolveModel(appId, modelName, userId);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const handler = createCRUDHandler(resolved.normalized);
  const record = await handler.getById(appId, recordId);
  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  return NextResponse.json({ data: record });
}

// ── PUT /api/runtime/[appId]/[model]/[id] ────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string; model: string; id: string }> }
) {
  const { appId, model: modelName, id: recordId } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  const resolved = await resolveModel(appId, modelName, userId);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  // Safely parse body
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const handler = createCRUDHandler(resolved.normalized);

  try {
    const updated = await handler.update(appId, recordId, data);
    // Fire ON_RECORD_UPDATE workflows async
    triggerWorkflows(appId, "ON_RECORD_UPDATE", modelName, updated).catch(console.error);
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}

// ── PATCH /api/runtime/[appId]/[model]/[id] ───────────────────────────────────
// Alias for PUT with partial: true — same handler, already uses partial=true on update
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string; model: string; id: string }> }
) {
  return PUT(req, { params });
}

// ── DELETE /api/runtime/[appId]/[model]/[id] ─────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string; model: string; id: string }> }
) {
  const { appId, model: modelName, id: recordId } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  const resolved = await resolveModel(appId, modelName, userId);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const handler = createCRUDHandler(resolved.normalized);

  try {
    const record = await handler.getById(appId, recordId);
    await handler.delete(appId, recordId);
    // Fire ON_RECORD_DELETE workflows async
    if (record) {
      triggerWorkflows(appId, "ON_RECORD_DELETE", modelName, record).catch(console.error);
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
