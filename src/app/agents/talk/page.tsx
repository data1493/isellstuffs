import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AgentTalkBoard } from "@/components/agents/agent-talk-board";
import { AGENT_TALK_COOKIE, parseAgentTalkCookie } from "@/lib/agent-talk";
import { agentTalkMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = agentTalkMetadata();

type TalkPageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function AgentTalkPage({ searchParams }: TalkPageProps) {
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const state = parseAgentTalkCookie(jar.get(AGENT_TALK_COOKIE)?.value);

  return <AgentTalkBoard state={state} error={error} />;
}
