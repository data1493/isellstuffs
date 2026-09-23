import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AgentTalkBoard } from "@/components/agents/agent-talk-board";
import {
  loadAgentRowFloor,
  snapshotFromRequestCookies,
} from "@/lib/agent-row-io";
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
  const snapshot = snapshotFromRequestCookies((name) => jar.get(name)?.value);
  const floor = await loadAgentRowFloor(snapshot);

  return <AgentTalkBoard floor={floor} error={error} />;
}
