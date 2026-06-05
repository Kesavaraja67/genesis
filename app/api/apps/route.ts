// app/api/apps/route.ts
// GET all apps + POST create app

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (await prisma.app.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const apps = await prisma.app.findMany({
    where: { userId: user.id },
    include: { _count: { select: { runtimeData: true, workflows: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ apps, total: apps.length });
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const body = await req.json();
  const { name, description, config } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "App name is required" }, { status: 400 });
  }

  const slug = await uniqueSlug(slugify(name));

  const app = await prisma.app.create({
    data: {
      userId: user.id,
      name: name.trim(),
      slug,
      description: description ?? null,
      config: config ?? {},
      status: "DRAFT",
    },
  });

  // Sync models from config into AppModel table so the runtime API can resolve schemas
  const configModels: { name: string; [key: string]: unknown }[] = config?.models ?? [];
  if (configModels.length > 0) {
    await prisma.appModel.createMany({
      data: configModels.map((m) => ({
        appId: app.id,
        name: m.name,
        schema: m as unknown as Parameters<typeof prisma.appModel.create>[0]["data"]["schema"],
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ app }, { status: 201 });
}
