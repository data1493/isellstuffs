import type { Metadata } from "next";
import Link from "next/link";

import { WearPassForm } from "@/components/agents/agent-forms";
import { AgentSlipCard, CookieDefaultNotice } from "@/components/agents/agent-slip";
import { SyncAgentStore } from "@/components/agents/sync-agent-store";
import { FloorRefresh } from "@/components/portals/floor-refresh";
import { HudNotice, portalNotice } from "@/components/portals/hud-chrome";
import { buttonVariants } from "@/components/ui/button";
import {
  loadAgentRowFloor,
  parseLots,
  snapshotFromRequestCookies,
} from "@/lib/agent-row-io";
import { tradePath, tradeSlipPath } from "@/lib/paths";
import { oneParam } from "@/lib/request-floor";
import { tradeSlipMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type SlipPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return tradeSlipMetadata(decodeURIComponent(id));
}

export default async function TradeSlipPage({
  params,
  searchParams,
}: SlipPageProps) {
  const { id: rawId } = await params;
  const tradeId = decodeURIComponent(rawId);
  const query = searchParams ? await searchParams : {};
  const error = oneParam(query.error);
  const jar = await cookies();
  const snapshot = snapshotFromRequestCookies((name) => jar.get(name)?.value);
  const floor = await loadAgentRowFloor(snapshot);
  const snapshotLots = parseLots(snapshot.lots);
  const trade = floor.trades.find((row) => row.id === tradeId) ?? null;
  const worn = floor.pass?.handle ?? null;
  const agent = Boolean(worn);
  const notice = portalNotice(error);
  const back = tradeSlipPath(tradeId);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
      <SyncAgentStore
        pass={floor.pass}
        lots={floor.lots}
        trades={floor.trades}
        ratings={floor.ratings}
        suggestions={floor.suggestions}
        pledges={floor.pledges}
      />

      <div className="space-y-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-accent">
          Slip
        </p>
        <h1 className="font-heading text-4xl tracking-tight">Ask, cut, and net.</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Take writes the 10% floor cut. Confirm is the second POST. Net is
          what the seller keeps.
        </p>
        <FloorRefresh shared={floor.shared} />
        {floor.shared ? null : <CookieDefaultNotice />}
        {notice ? <HudNotice {...notice} /> : null}

        {trade ? (
          <AgentSlipCard
            trade={trade}
            lots={floor.lots}
            snapshotLots={snapshotLots}
            worn={worn}
            canAct={agent}
            showRate={agent}
            rateReturnTo={back}
          />
        ) : (
          <HudNotice
            tone="missing"
            eyebrow="No slip"
            title="That trade is not on this floor."
            body="Take a lot first. With the cookie default, another browser’s slip will not appear here."
          />
        )}

        {agent ? null : (
          <div className="rounded-sm border border-accent/40 bg-card/70 px-4 py-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
              Watching
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Confirm, void, and rate stay off. Wear a pass to act on this slip.
            </p>
            <div className="mt-4">
              <WearPassForm current={floor.pass} returnTo={back} idPrefix="slip-pass" />
            </div>
          </div>
        )}

        <Link
          href={tradePath()}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-sm")}
        >
          Back to trade
        </Link>
      </div>
    </div>
  );
}
