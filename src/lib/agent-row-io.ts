/**
 * Agent Row floor I/O — snapshot cookies and apply store write cookies.
 * Cookie is the default when DATABASE_URL is unset.
 * Do not invent a second catalog. Import store names only.
 */
import { NextResponse } from "next/server";

import {
  agentTradeNetCents,
  cookieNameFor,
  listLots,
  listPledges,
  listRatings,
  listSuggestions,
  listTrades,
  mallCutThisAisle,
  parseLots,
  readPass,
  snapshotFromCookies,
  usesDatabase,
  type AgentCookieWrites,
  type AgentLot,
  type AgentPass,
  type AgentRating,
  type AgentStoreSnapshot,
  type AgentSuggestion,
  type AgentTrade,
  type DonatePledge,
} from "@/lib/agent-store";
import { formatMoney, money } from "@/lib/commerce";

export type AgentRowFloor = {
  pass: AgentPass | null;
  lots: AgentLot[];
  trades: AgentTrade[];
  ratings: AgentRating[];
  suggestions: AgentSuggestion[];
  pledges: DonatePledge[];
  mallCutCents: number;
  jarCents: number;
  shared: boolean;
};

export { parseLots };

export function snapshotFromRequestCookies(get: (name: string) => string | undefined) {
  return snapshotFromCookies(get);
}

export async function loadAgentRowFloor(
  snapshot: AgentStoreSnapshot,
): Promise<AgentRowFloor> {
  const [pass, lots, trades, ratings, suggestions, pledges, mallCutCents] =
    await Promise.all([
      readPass(snapshot),
      listLots(snapshot),
      listTrades(snapshot),
      listRatings(snapshot),
      listSuggestions(snapshot),
      listPledges(snapshot),
      mallCutThisAisle(snapshot),
    ]);
  return {
    pass,
    lots,
    trades,
    ratings,
    suggestions,
    pledges,
    mallCutCents,
    jarCents: pledges.reduce((sum, row) => sum + row.amountCents, 0),
    shared: usesDatabase(),
  };
}

export function applyAgentCookies(
  response: NextResponse,
  writes: AgentCookieWrites,
) {
  for (const key of Object.keys(writes) as (keyof AgentCookieWrites)[]) {
    const value = writes[key];
    if (value === undefined) {
      continue;
    }
    response.cookies.set({
      name: cookieNameFor(key),
      value,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export function lotTitleForTrade(
  trade: AgentTrade,
  lots: AgentLot[],
  snapshotLots: AgentLot[],
) {
  return (
    lots.find((lot) => lot.id === trade.lotId)?.title ??
    snapshotLots.find((lot) => lot.id === trade.lotId)?.title ??
    "Paper lot"
  );
}

export function formatAgentTradeSplit(askCents: number, feeCents: number) {
  return {
    ask: formatMoney(money(askCents)),
    cut: formatMoney(money(feeCents)),
    net: formatMoney(money(agentTradeNetCents(askCents, feeCents))),
  };
}

export function parseAskCents(raw: string) {
  const dollars = Number(raw.trim());
  if (!Number.isFinite(dollars)) {
    return null;
  }
  return Math.round(dollars * 100);
}
