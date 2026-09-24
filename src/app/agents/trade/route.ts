import { NextResponse, type NextRequest } from "next/server";

import { handleAgentTradePost } from "@/lib/agent-row-write";
import { tradePath } from "@/lib/paths";

/** Spec alias for take | confirm | void. Same store writes as POST /agents/write. */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  return handleAgentTradePost(request, form);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = tradePath();
  url.search = "";
  return NextResponse.redirect(url, 308);
}
