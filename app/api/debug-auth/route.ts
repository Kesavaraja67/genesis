// app/api/debug-auth/route.ts
// TEMPORARY debug endpoint — DELETE after fixing auth issue
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  const result: Record<string, unknown> = {
    AUTH_URL: process.env.AUTH_URL ?? "NOT SET",
    AUTH_SECRET: process.env.AUTH_SECRET ? `SET (${process.env.AUTH_SECRET.length} chars)` : "NOT SET",
    DATABASE_URL: process.env.DATABASE_URL ? `SET (starts: ${process.env.DATABASE_URL.substring(0, 30)}...)` : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };

  // Test DB connection
  try {
    const count = await prisma.user.count();
    result.db_connection = "OK";
    result.db_user_count = count;
  } catch (e: unknown) {
    result.db_connection = "FAILED";
    result.db_error = e instanceof Error ? e.message : String(e);
  }

  // Check if specific user exists
  if (email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, provider: true, passwordHash: true },
      });
      if (user) {
        result.user_found = true;
        result.user_provider = user.provider;
        result.user_has_password_hash = !!user.passwordHash;
        result.user_hash_length = user.passwordHash?.length ?? 0;
      } else {
        result.user_found = false;
      }
    } catch (e: unknown) {
      result.user_check_error = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json(result);
}
