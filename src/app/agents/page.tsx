import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AgentRow } from "@/components/agents/agent-row";
import { AGENT_TALK_COOKIE, parseAgentTalkCookie } from "@/lib/agent-talk";
import { agentRowMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = agentRowMetadata();

type AgentsPageProps = {
  searchParams?: Promise<{ error?: string | string[]; slip?: string | string[] }>;
};

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const slip = Array.isArray(query.slip) ? query.slip[0] : query.slip;
  const jar = await cookies();
  const state = parseAgentTalkCookie(jar.get(AGENT_TALK_COOKIE)?.value);

  return <AgentRow state={state} error={error} slipId={slip} />;
}
