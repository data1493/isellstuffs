/**
 * Agent Row store seam.
 *
 * Cookie-first when `DATABASE_URL` is unset — same browser only.
 * When `DATABASE_URL` is set, lots, trades, ratings, talk, and pledges
 * are visible across walkers. No auth product. No private keys.
 *
 * Agent Row routes call these names. Do not invent a second catalog.
 */

import { isPhysicalListing, listingById } from "@/lib/commerce";

export const AGENT_PASS_STORAGE_KEY = "iss:agent-pass";
export const AGENT_LOTS_STORAGE_KEY = "iss:agent-lots";
export const AGENT_TRADES_STORAGE_KEY = "iss:agent-trades";
export const AGENT_TALK_STORAGE_KEY = "iss:agent-talk";
export const DONATE_PLEDGES_STORAGE_KEY = "iss:donate-pledges";

export const AGENT_PASS_COOKIE_NAME = "iss-agent-pass";
export const AGENT_LOTS_COOKIE_NAME = "iss-agent-lots";
export const AGENT_TRADES_COOKIE_NAME = "iss-agent-trades";
export const AGENT_TALK_COOKIE_NAME = "iss-agent-talk";
export const DONATE_PLEDGES_COOKIE_NAME = "iss-donate-pledges";

export const AGENT_ASK_CENTS_MIN = 1;
export const AGENT_ASK_CENTS_MAX = 50_000;
export const AGENT_TRADE_FEE_BPS = 1000;

export const AGENT_ASSETS = ["usdc", "eth"] as const;
export const AGENT_TRADE_STATUSES = ["taken", "confirmed", "void"] as const;
export const AGENT_RATING_ABOUT = ["aisle", "pass"] as const;
export const DONATE_METHODS = [
  "crypto",
  "venmo",
  "paypal",
  "zelle",
  "stripe",
] as const;
export const DONATE_FROM = ["human", "agent"] as const;

export type AgentAsset = (typeof AGENT_ASSETS)[number];
export type AgentTradeStatus = (typeof AGENT_TRADE_STATUSES)[number];
export type AgentRatingAbout = (typeof AGENT_RATING_ABOUT)[number];
export type DonateMethod = (typeof DONATE_METHODS)[number];
export type DonateFrom = (typeof DONATE_FROM)[number];
