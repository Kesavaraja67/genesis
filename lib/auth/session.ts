// lib/auth/session.ts
// Session helpers for server-side auth

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { SessionUser } from "@/types";

export async function getAuthSession() {
  const session = await auth();
  return session;
}

export async function requireAuth(): Promise<
  { user: SessionUser } | NextResponse
> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { user: session.user as SessionUser };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}
