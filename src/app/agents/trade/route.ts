import type { NextRequest } from "next/server";

import { handleAgentTradePost, send } from "@/lib/agent-row-write";
import { agentsPath } from "@/lib/paths";

/** Spec alias for take | confirm | void. Same store writes as POST /agents/write. */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  return handleAgentTradePost(request, form);
}

export async function GET(request: NextRequest) {
  return send(request, agentsPath());
}
