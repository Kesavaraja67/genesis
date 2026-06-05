// app/api/apps/[appId]/workflows/[workflowId]/route.ts
// GET, PUT, DELETE single workflow

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

async function resolveWorkflow(appId: string, workflowId: string, userId: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return { error: "App not found", status: 404 };
  if (app.userId !== userId) return { error: "Forbidden", status: 403 };
  const workflow = await prisma.workflow.findFirst({ where: { id: workflowId, appId } });
  if (!workflow) return { error: "Workflow not found", status: 404 };
  return { app, workflow };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string; workflowId: string }> }
) {
  const { appId, workflowId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const resolved = await resolveWorkflow(appId, workflowId, authResult.user.id);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { runs: { take: 10, orderBy: { startedAt: "desc" } } },
  });
  return NextResponse.json({ workflow });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string; workflowId: string }> }
) {
  const { appId, workflowId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const resolved = await resolveWorkflow(appId, workflowId, authResult.user.id);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  const body = await req.json();
  const { name, description, triggerType, triggerConfig, steps, isActive } = body;

  if (Array.isArray(steps)) {
    if (steps.length > 20) return NextResponse.json({ error: "Max 20 steps" }, { status: 400 });
    const stepIds = steps.map((s: { id: string }) => s.id);
    if (new Set(stepIds).size !== stepIds.length)
      return NextResponse.json({ error: "Step IDs must be unique" }, { status: 400 });
  }

  const workflow = await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(triggerType !== undefined && { triggerType }),
      ...(triggerConfig !== undefined && { triggerConfig }),
      ...(steps !== undefined && { steps }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ workflow });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string; workflowId: string }> }
) {
  const { appId, workflowId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const resolved = await resolveWorkflow(appId, workflowId, authResult.user.id);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  await prisma.workflow.delete({ where: { id: workflowId } });
  return new NextResponse(null, { status: 204 });
}
