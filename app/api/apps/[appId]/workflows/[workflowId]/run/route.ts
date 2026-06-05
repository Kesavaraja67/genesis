// app/api/apps/[appId]/workflows/[workflowId]/run/route.ts
// POST — manually trigger a workflow execution

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { executeWorkflow } from "@/lib/workflow/engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string; workflowId: string }> }
) {
  const { appId, workflowId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });
  if (app.userId !== authResult.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const workflow = await prisma.workflow.findFirst({ where: { id: workflowId, appId } });
  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const input = body.input ?? {};

  // Create run record with RUNNING status
  const run = await prisma.workflowRun.create({
    data: {
      workflowId,
      status: "RUNNING",
      input,
    },
  });

  // Execute async (non-blocking)
  executeWorkflow(workflow, input, run.id).catch(console.error);

  return NextResponse.json({ run }, { status: 202 });
}
