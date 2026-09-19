"use client";

import { useEffect } from "react";

import {
  mergeAgentTalkState,
  persistAgentTalkCookie,
  readAgentTalkState,
  serializeAgentTalkCookie,
  type AgentTalkState,
} from "@/lib/agent-talk";

/** Copy the cookie row into `iss:agent-talk` after a no-JS POST. */
export function SyncAgentTalk({ state }: { state: AgentTalkState }) {
  useEffect(() => {
    try {
      const next = mergeAgentTalkState(readAgentTalkState(), state);
      persistAgentTalkCookie(serializeAgentTalkCookie(next));
    } catch {
      // blocked storage
    }
  }, [state]);

  return null;
}
