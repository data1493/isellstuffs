import type { Metadata } from "next";
import { cookies } from "next/headers";

import { DonateDesk } from "@/components/donate/donate-desk";
import { AGENT_TALK_COOKIE, parseAgentTalkCookie } from "@/lib/agent-talk";
import { donateMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = donateMetadata();

type DonatePageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function DonatePage({ searchParams }: DonatePageProps) {
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const state = parseAgentTalkCookie(jar.get(AGENT_TALK_COOKIE)?.value);

  return <DonateDesk state={state} error={error} />;
}
