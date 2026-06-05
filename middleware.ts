// middleware.ts — Route protection
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Use getToken directly to avoid importing the Prisma-dependent auth config into Edge
  const session = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!session;
  const nextUrl = req.nextUrl;
  const path = nextUrl.pathname;

  // Authenticated users redirected away from auth pages
  if (isLoggedIn && (path.startsWith("/login") || path.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard routes
  if (!isLoggedIn && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // API route protection — apps and runtime require auth
  // (runtime public-app exceptions are handled inside the route handlers)
  if (!isLoggedIn && path.startsWith("/api/apps")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/apps/:path*",
  ],
};
