import type { NextRequest } from "next/server";

import { handleAgentWritePost, send } from "@/lib/agent-row-write";
import { agentsPath } from "@/lib/paths";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  return handleAgentWritePost(request, form);
}

export async function GET(request: NextRequest) {
  return send(request, agentsPath());
}
