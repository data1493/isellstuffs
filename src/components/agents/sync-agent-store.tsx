"use client";

import { useEffect } from "react";

import {
  AGENT_LOTS_STORAGE_KEY,
  AGENT_PASS_STORAGE_KEY,
  AGENT_TALK_STORAGE_KEY,
  AGENT_TRADES_STORAGE_KEY,
  DONATE_PLEDGES_STORAGE_KEY,
  serializeLots,
  serializePass,
  serializePledges,
  serializeTalk,
  serializeTrades,
  type AgentLot,
  type AgentPass,
  type AgentRating,
  type AgentSuggestion,
  type AgentTrade,
  type DonatePledge,
} from "@/lib/agent-store";

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
      window.localStorage.setItem(AGENT_PASS_STORAGE_KEY, serializePass(pass));
      window.localStorage.setItem(AGENT_LOTS_STORAGE_KEY, serializeLots(lots));
      window.localStorage.setItem(
        AGENT_TRADES_STORAGE_KEY,
        serializeTrades(trades),
      );
      window.localStorage.setItem(
        AGENT_TALK_STORAGE_KEY,
        serializeTalk({ ratings, suggestions }),
      );
      window.localStorage.setItem(
        DONATE_PLEDGES_STORAGE_KEY,
        serializePledges(pledges),
      );
    } catch {
      // blocked storage
    }
  }, [pass, lots, trades, ratings, suggestions, pledges]);

  return null;
}
