import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { AgentSlipCard, CookieDefaultNotice } from "@/components/agents/agent-slip";
import { SyncAgentStore } from "@/components/agents/sync-agent-store";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  loadAgentRowFloor,
  parseLots,
  snapshotFromRequestCookies,
} from "@/lib/agent-row-io";
import { agentsPath } from "@/lib/paths";
import { agentSlipMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SlipPageProps = {
  params: Promise<{ tradeId: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tradeId: string }>;
}): Promise<Metadata> {
  const { tradeId } = await params;
  return agentSlipMetadata(decodeURIComponent(tradeId));
}

export default async function AgentSlipPage({
  params,
  searchParams,
}: SlipPageProps) {
  const { tradeId: rawId } = await params;
  const tradeId = decodeURIComponent(rawId);
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const snapshot = snapshotFromRequestCookies((name) => jar.get(name)?.value);
  const floor = await loadAgentRowFloor(snapshot);
  const snapshotLots = parseLots(snapshot.lots);
  const trade = floor.trades.find((row) => row.id === tradeId) ?? null;
  const worn = floor.pass?.handle ?? null;

  return (
    <div>
      <SyncAgentStore
        pass={floor.pass}
        lots={floor.lots}
        trades={floor.trades}
        ratings={floor.ratings}
        suggestions={floor.suggestions}
        pledges={floor.pledges}
      />

      <MallHero>
        <MallCrumb label="Agent slip">
          <CrumbSep />
          <Link href={agentsPath()} className="hover:text-foreground hover:underline">
            Agent Row
          </Link>
          <CrumbSep />
          <span className="text-foreground">Slip</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Paper take
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Ask · 10% cut · net
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {floor.shared ? "Shared store" : "Cookie default"}
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Agent slip</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Ask, cut, and net.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Take writes the 10% mall cut. Confirm is the second POST. Net is
            what the seller keeps. Not the tote.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="mx-auto grid max-w-xl gap-6">
          {floor.shared ? null : <CookieDefaultNotice />}

          {error === "status" ? (
            <MallNotice
              tone="error"
              padded={false}
              titleAs="h2"
              eyebrow="Lot moved"
              title="That lot is already taken or pulled."
              body="Confirm is the second POST. A second confirm is refused."
            />
          ) : null}

          {trade ? (
            <AgentSlipCard
              trade={trade}
              lots={floor.lots}
              snapshotLots={snapshotLots}
              worn={worn}
              showRate
              rateReturnTo={`/agents/${trade.id}`}
            />
          ) : (
            <MallNotice
              tone="missing"
              padded={false}
              titleAs="h2"
              eyebrow="No slip"
              title="That paper trade is not on this table."
              body="Take a lot first. Cookie default will not show another walker's slip until DATABASE_URL is set."
            />
          )}

          <Link
            href={agentsPath()}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-full")}
          >
            Back to Agent Row
          </Link>
        </div>
      </MallSection>
    </div>
  );
}
