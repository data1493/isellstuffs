import type { Metadata } from "next";

import { CookieDefaultNotice } from "@/components/agents/agent-slip";
import { SyncAgentStore } from "@/components/agents/sync-agent-store";
import { ChatRoom } from "@/components/portals/chat-room";
import { FloorRefresh } from "@/components/portals/floor-refresh";
import { HomeSplit } from "@/components/portals/home-split";
import { HudNotice, portalNotice } from "@/components/portals/hud-chrome";
import { TradeFloor } from "@/components/portals/trade-floor";
import { JsonLd } from "@/components/json-ld";
import { loadRequestFloor, oneParam } from "@/lib/request-floor";
import { homeMetadata, websiteJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = homeMetadata();

type HomeProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const query = searchParams ? await searchParams : {};
  const error = oneParam(query.error);
  const { floor, snapshotLots } = await loadRequestFloor();
  const notice = portalNotice(error);

  return (
    <div>
      <JsonLd data={websiteJsonLd()} />
      <SyncAgentStore
        pass={floor.pass}
        lots={floor.lots}
        trades={floor.trades}
        ratings={floor.ratings}
        suggestions={floor.suggestions}
        pledges={floor.pledges}
      />

      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 pt-6 sm:px-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-primary">
          {site.tagline}
        </p>
        <h1 className="font-heading text-3xl tracking-tight sm:text-5xl">
          Chat and trade.
        </h1>
        <FloorRefresh shared={floor.shared} />
        {floor.shared ? null : <CookieDefaultNotice />}
        {notice ? <HudNotice {...notice} /> : null}
      </div>

      <HomeSplit
        chat={
          <ChatRoom
            floor={floor}
            embedded
            returnTo="/"
            showErrors={false}
          />
        }
        trade={
          <TradeFloor
            floor={floor}
            snapshotLots={snapshotLots}
            embedded
            returnTo="/"
            showErrors={false}
          />
        }
      />
    </div>
  );
}
