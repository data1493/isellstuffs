import { NextResponse, type NextRequest } from "next/server";

import { handleAgentWritePost } from "@/lib/agent-row-write";
import { tradePath } from "@/lib/paths";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  return handleAgentWritePost(request, form);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = tradePath();
  url.search = "";
  return NextResponse.redirect(url, 308);
}
