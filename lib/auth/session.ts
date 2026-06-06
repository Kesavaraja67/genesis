// lib/auth/session.ts
// Session helpers for server-side auth
// AUTH TEMPORARILY BYPASSED - returning Guest user if not logged in

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { SessionUser } from "@/types";

export async function getAuthSession() {
  const session = await auth().catch(() => null);
  if (session?.user) return session;
  
  // Return mock guest session
  const guestUser = await getOrCreateGuestUser();
  return { user: guestUser, expires: "9999-12-31T23:59:59.999Z" };
}

async function getOrCreateGuestUser(): Promise<SessionUser> {
  let guest = await prisma.user.findUnique({ where: { email: "guest@genesis.app" } });
  if (!guest) {
    guest = await prisma.user.create({
      data: { name: "Guest User", email: "guest@genesis.app", passwordHash: "guest_password" }
    });
  }
  return { id: guest.id, name: guest.name, email: guest.email };
}

export async function requireAuth(): Promise<
  { user: SessionUser } | NextResponse
> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { user: session.user as SessionUser };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}
