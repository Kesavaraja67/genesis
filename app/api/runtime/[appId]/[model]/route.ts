// app/api/runtime/[appId]/[model]/route.ts
// GET list + POST create for runtime records

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeModel } from "@/lib/runtime/schemaBuilder";
import { createCRUDHandler, ValidationError } from "@/lib/runtime/apiGenerator";
import { auth } from "@/auth";
import { triggerWorkflows } from "@/lib/workflow/triggers";

async function resolveModel(appId: string, modelName: string, userId?: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return { error: "App not found", status: 404 };

  // Enforce ownership when caller is authenticated
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

export async function GET(
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
  const url = new URL(req.url);
  const sp = url.searchParams;

  const query = {
    page: sp.get("page") ? Number(sp.get("page")) : 1,
    limit: sp.get("limit") ? Math.min(100, Number(sp.get("limit"))) : 20,
    search: sp.get("search") ?? undefined,
    sortBy: sp.get("sortBy") ?? undefined,
    sortOrder: (sp.get("sortOrder") as "asc" | "desc") ?? "desc",
    filters: {} as Record<string, unknown>,
  };

  // Parse filter[fieldName]=value params
  for (const [key, value] of sp.entries()) {
    const match = key.match(/^filter\[(.+)\]$/);
    if (match) query.filters[match[1]] = value;
  }

  const result = await handler.list(appId, query);
  return NextResponse.json(result);
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

  // Safely parse body — malformed JSON → clean 400
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const record = await handler.create(appId, data);
    // Fire ON_RECORD_CREATE workflows async
    triggerWorkflows(appId, "ON_RECORD_CREATE", modelName, record).catch(console.error);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    throw err;
  }
}
