// app/api/apps/[appId]/workflows/route.ts
// GET all workflows + POST create

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

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

  const workflows = await prisma.workflow.findMany({
    where: { appId },
    include: { _count: { select: { runs: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ workflows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const resolved = await resolveApp(appId, authResult.user.id);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  const body = await req.json();
  const { name, description, triggerType, triggerConfig, steps, isActive } = body;

  if (!name || !triggerType || !triggerConfig || !Array.isArray(steps)) {
    return NextResponse.json({ error: "name, triggerType, triggerConfig, and steps are required" }, { status: 400 });
  }

  // Validate step IDs unique
  const stepIds = steps.map((s: { id: string }) => s.id);
  if (new Set(stepIds).size !== stepIds.length) {
    return NextResponse.json({ error: "Step IDs must be unique" }, { status: 400 });
  }

  if (steps.length > 20) {
    return NextResponse.json({ error: "Workflow cannot exceed 20 steps" }, { status: 400 });
  }

  const workflow = await prisma.workflow.create({
    data: {
      appId,
      name,
      description: description ?? null,
      triggerType,
      triggerConfig,
      steps,
      isActive: isActive ?? false,
    },
  });

  return NextResponse.json({ workflow }, { status: 201 });
}
