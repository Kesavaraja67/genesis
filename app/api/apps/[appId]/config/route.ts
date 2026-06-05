// app/api/apps/[appId]/config/route.ts
// GET and PUT config JSON with validation

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { parseConfig } from "@/lib/config/parser";

async function resolveApp(appId: string, userId: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return { error: "App not found", status: 404 };
  if (app.userId !== userId) return { error: "Forbidden", status: 403 };
  return { app };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const resolved = await resolveApp(appId, authResult.user.id);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  return NextResponse.json({ config: resolved.app.config });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const resolved = await resolveApp(appId, authResult.user.id);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  const body = await req.json();
  const { config } = body;

  if (!config) {
    return NextResponse.json({ error: "config is required" }, { status: 400 });
  }

  const validation = parseConfig(config);

  if (!validation.valid) {
    return NextResponse.json(
      { error: "Invalid config", validation },
      { status: 400 }
    );
  }

  const updated = await prisma.app.update({
    where: { id: appId },
    data: { config, status: "DRAFT" },
  });

  // Sync AppModel rows so the runtime API can resolve schemas
  const configModels = validation.sanitizedConfig?.models ?? [];
  if (configModels.length > 0) {
    // Delete stale models not in new config
    const newModelNames = configModels.map((m) => m.name);
    await prisma.appModel.deleteMany({
      where: { appId, name: { notIn: newModelNames } },
    });
    // Upsert each model
    for (const m of configModels) {
      await prisma.appModel.upsert({
        where: { appId_name: { appId, name: m.name } },
        create: { appId, name: m.name, schema: m as never },
        update: { schema: m as never },
      });
    }
  }

  return NextResponse.json({ config: updated.config, validation });
}
