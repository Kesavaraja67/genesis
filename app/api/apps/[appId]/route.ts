// app/api/apps/[appId]/route.ts
// GET, PUT, DELETE single app

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

  const app = await prisma.app.findUnique({
    where: { id: appId },
    include: {
      models: true,
      _count: { select: { workflows: true, runtimeData: true } },
    },
  });

  return NextResponse.json({ app });
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
  const { name, description } = body;

  const app = await prisma.app.update({
    where: { id: appId },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  return NextResponse.json({ app });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const resolved = await resolveApp(appId, authResult.user.id);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  await prisma.app.delete({ where: { id: appId } });
  return new NextResponse(null, { status: 204 });
}
