import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AgentRow } from "@/components/agents/agent-row";
import {
  loadAgentRowFloor,
  parseLots,
  snapshotFromRequestCookies,
} from "@/lib/agent-row-io";
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
  const snapshot = snapshotFromRequestCookies((name) => jar.get(name)?.value);
  const floor = await loadAgentRowFloor(snapshot);

  return (
    <AgentRow
      floor={floor}
      snapshotLots={parseLots(snapshot.lots)}
      error={error}
      slipId={slip}
    />
  );
}
