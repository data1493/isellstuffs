"use client";

import { useEffect } from "react";

import type {
  AgentLot,
  AgentPass,
  AgentRating,
  AgentSuggestion,
  AgentTrade,
  DonatePledge,
} from "@/lib/agent-store";

const PASS_KEY = "iss:agent-pass";
const LOTS_KEY = "iss:agent-lots";
const TRADES_KEY = "iss:agent-trades";
const TALK_KEY = "iss:agent-talk";
const PLEDGES_KEY = "iss:donate-pledges";

/** Copy cookie twins into `iss:agent-*` after a no-JS POST. */
export function SyncAgentStore({
  pass,
  lots,
  trades,
  ratings,
  suggestions,
  pledges,
}: {
  pass: AgentPass | null;
  lots: AgentLot[];
  trades: AgentTrade[];
  ratings: AgentRating[];
  suggestions: AgentSuggestion[];
  pledges: DonatePledge[];
}) {
  useEffect(() => {
    try {
      window.localStorage.setItem(PASS_KEY, JSON.stringify(pass));
      window.localStorage.setItem(LOTS_KEY, JSON.stringify(lots));
      window.localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
      window.localStorage.setItem(
        TALK_KEY,
        JSON.stringify({ ratings, suggestions }),
      );
      window.localStorage.setItem(PLEDGES_KEY, JSON.stringify(pledges));
    } catch {
      // blocked storage
    }
  }, [pass, lots, trades, ratings, suggestions, pledges]);

  return null;
}
