import type { Metadata } from "next";

import { CookieDefaultNotice } from "@/components/agents/agent-slip";
import { FloorRefresh } from "@/components/portals/floor-refresh";
import { HudNotice, portalNotice } from "@/components/portals/hud-chrome";
import { TradeFloor } from "@/components/portals/trade-floor";
import { loadRequestFloor, oneParam } from "@/lib/request-floor";
import { tradeMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = tradeMetadata();

type TradePageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function TradePage({ searchParams }: TradePageProps) {
  const query = searchParams ? await searchParams : {};
  const error = oneParam(query.error);
  const { floor, snapshotLots } = await loadRequestFloor();
  const notice = portalNotice(error);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="space-y-4 px-4 pt-6 sm:px-6">
        <FloorRefresh shared={floor.shared} />
        {floor.shared ? null : <CookieDefaultNotice />}
        {notice ? <HudNotice {...notice} /> : null}
      </div>
      <TradeFloor floor={floor} snapshotLots={snapshotLots} showErrors={false} />
    </div>
  );
}
