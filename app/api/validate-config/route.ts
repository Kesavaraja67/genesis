// app/api/validate-config/route.ts
// Public validation endpoint used by the editor

import { NextRequest, NextResponse } from "next/server";
import { parseConfig } from "@/lib/config/parser";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validation = parseConfig(body.config);
  return NextResponse.json({ validation });
}
