/**
 * Agent Row — named passes, talk, paper trades, aisle + agent rates, the jar.
 * Cookie `iss:agent-talk` until a database exists. Same key in localStorage.
 * Write helpers return the JSON cookie value the route can parse.
 * Never write `iss:cart-listing-ids`. Never change tote math / `platformFeeOn`.
 * 10% mall cut on confirmed agent trades only. Donations are 100% jar.
 * Import `@/lib/commerce` shapes only. Not a stall. Not a listing overlay.
 */
import {
  allListings,
  formatMoney,
  isCartEligible,
  isGiftListing,
  listingById,
  money,
  stallById,
  type Listing,
} from "@/lib/commerce";

export const AGENT_TALK_COOKIE = "iss:agent-talk";
export const AGENT_TALK_STORAGE_KEY = "iss:agent-talk";
export const AGENT_TALK_CHANGED_EVENT = "iss:agent-talk-changed";

export const AGENT_TRADE_FEE_BPS = 1000;
export const AGENT_BODY_MAX = 280;
export const AGENT_TALK_MAX = 40;
export const AGENT_RATE_MAX = 40;
export const AGENT_TRADE_MAX = 20;
export const AGENT_DONATION_MAX = 20;

export const AGENT_DONATION_CENTS = [100, 200, 500, 1000] as const;

export type AgentPass = {
  id: string;
  name: string;
  stallId: string;
  blurb: string;
};

export const agentPasses = [
  {
    id: "tuesday-desk",
    name: "Tuesday Desk",
    stallId: "folding-table-tuesday",
    blurb: "Lists the driveway leftovers. A named pass, not a seventh stall.",
  },
  {
    id: "closet-rack",
    name: "Closet Rack",
    stallId: "the-hall-closet",
    blurb: "Holds the windbreaker and the split soles. No lookbook.",
  },
  {
    id: "half-working-bench",
    name: "Half-Working Bench",
    stallId: "half-working",
    blurb: "Pressed start. Tetris went. The bench wears this pass.",
  },
  {
    id: "beats-folder",
    name: "Beats Folder",
    stallId: "beats-under-the-table",
    blurb: "Hands the zip and the Sharpie disc. No burn shop.",
  },
  {
    id: "crate-hand",
    name: "Crate Hand",
    stallId: "sunday-crate",
    blurb: "Lifts the unnamed LP. Side B is honest.",
  },
  {
    id: "sink-jar",
    name: "Sink Jar",
    stallId: "the-sink-drawer",
    blurb: "Watches the mug chip. Tends the jar on this row.",
  },
] as const satisfies readonly AgentPass[];

export type AgentPassId = (typeof agentPasses)[number]["id"];

export type AgentStars = 1 | 2 | 3 | 4 | 5;

export type AgentTalkLine = {
  id: string;
  fromPassId: string;
  toPassId: string;
  body: string;
  at: string;
};

export type AgentRateSubject = "aisle" | string;

export type AgentRate = {
  id: string;
  fromPassId: string;
  subject: AgentRateSubject;
  stars: AgentStars;
  body: string;
  at: string;
};

export type AgentTrade = {
  id: string;
  fromPassId: string;
  toPassId: string;
  listingId: string;
  amountCents: number;
  currency: "usd";
  status: "open" | "confirmed";
  mallCutCents: number;
  at: string;
  confirmedAt?: string;
};

export type AgentDonation = {
  id: string;
  fromPassId: string;
  amountCents: number;
  currency: "usd";
  at: string;
};

export type AgentTalkState = {
  selfPassId: string | null;
  talks: AgentTalkLine[];
  rates: AgentRate[];
  trades: AgentTrade[];
  donations: AgentDonation[];
};

export function emptyAgentTalkState(): AgentTalkState {
  return {
    selfPassId: null,
    talks: [],
    rates: [],
    trades: [],
    donations: [],
  };
}

export function agentPassById(id: string): AgentPass | undefined {
  return agentPasses.find((pass) => pass.id === id);
}

export function agentPassName(id: string) {
  return agentPassById(id)?.name ?? "Unknown pass";
}

export function otherAgentPasses(selfPassId: string | null | undefined) {
  if (!selfPassId) {
    return [...agentPasses];
  }
  return agentPasses.filter((pass) => pass.id !== selfPassId);
}

export function normalizeAgentBody(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, AGENT_BODY_MAX);
}

export function parseAgentStars(raw: string | null | undefined): AgentStars | null {
  const n = Number(String(raw ?? "").trim());
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5) {
    return n;
  }
  return null;
}

export function agentTradeMallCutCents(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return 0;
  }
  return Math.round((amountCents * AGENT_TRADE_FEE_BPS) / 10_000);
}

export function tradeableAgentListings(): Listing[] {
  return allListings().filter(
    (listing) =>
      isCartEligible(listing) &&
      !isGiftListing(listing) &&
      listing.status === "available",
  );
}

export function isTradeableListing(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  return (
    isCartEligible(listing) &&
    !isGiftListing(listing) &&
    listing.status === "available"
  );
}

function isTalkLine(value: unknown): value is AgentTalkLine {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as AgentTalkLine;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.fromPassId === "string" &&
    typeof row.toPassId === "string" &&
    typeof row.body === "string" &&
    row.body.length > 0 &&
    typeof row.at === "string"
  );
}

function isRate(value: unknown): value is AgentRate {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as AgentRate;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.fromPassId === "string" &&
    typeof row.subject === "string" &&
    row.subject.length > 0 &&
    (row.stars === 1 ||
      row.stars === 2 ||
      row.stars === 3 ||
      row.stars === 4 ||
      row.stars === 5) &&
    typeof row.body === "string" &&
    typeof row.at === "string"
  );
}

function isTrade(value: unknown): value is AgentTrade {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as AgentTrade;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.fromPassId === "string" &&
    typeof row.toPassId === "string" &&
    typeof row.listingId === "string" &&
    Number.isInteger(row.amountCents) &&
    row.amountCents > 0 &&
    row.currency === "usd" &&
    (row.status === "open" || row.status === "confirmed") &&
    Number.isInteger(row.mallCutCents) &&
    row.mallCutCents >= 0 &&
    typeof row.at === "string"
  );
}

function isDonation(value: unknown): value is AgentDonation {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as AgentDonation;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.fromPassId === "string" &&
    Number.isInteger(row.amountCents) &&
    row.amountCents > 0 &&
    row.currency === "usd" &&
    typeof row.at === "string"
  );
}

export function parseAgentTalkCookie(
  raw: string | null | undefined,
): AgentTalkState {
  const empty = emptyAgentTalkState();
  if (!raw) {
    return empty;
  }
  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return empty;
    }
    const row = parsed as Partial<AgentTalkState>;
    const selfPassId =
      typeof row.selfPassId === "string" && agentPassById(row.selfPassId)
        ? row.selfPassId
        : null;
    return {
      selfPassId,
      talks: Array.isArray(row.talks) ? row.talks.filter(isTalkLine) : [],
      rates: Array.isArray(row.rates) ? row.rates.filter(isRate) : [],
      trades: Array.isArray(row.trades) ? row.trades.filter(isTrade) : [],
      donations: Array.isArray(row.donations)
        ? row.donations.filter(isDonation)
        : [],
    };
  } catch {
    return empty;
  }
}

export function serializeAgentTalkCookie(state: AgentTalkState): string {
  return JSON.stringify({
    selfPassId: state.selfPassId,
    talks: state.talks.slice(0, AGENT_TALK_MAX),
    rates: state.rates.slice(0, AGENT_RATE_MAX),
    trades: state.trades.slice(0, AGENT_TRADE_MAX),
    donations: state.donations.slice(0, AGENT_DONATION_MAX),
  } satisfies AgentTalkState);
}

function createAgentId(prefix: string, at = new Date()) {
  const stamp = at.getTime().toString(36);
  const salt = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${stamp}${salt}`;
}

/** Returns the JSON cookie value. Unknown pass leaves the cookie unchanged. */
export function writeWearPass(
  raw: string | null | undefined,
  passId: string,
): string {
  const state = parseAgentTalkCookie(raw);
  if (!agentPassById(passId)) {
    return serializeAgentTalkCookie(state);
  }
  return serializeAgentTalkCookie({ ...state, selfPassId: passId });
}

/** Returns the JSON cookie value. Blank / missing wear is a no-op. */
export function writeTalkLine(
  raw: string | null | undefined,
  input: { fromPassId?: string; toPassId?: string; body?: string },
): string {
  const state = parseAgentTalkCookie(raw);
  const fromPassId = input.fromPassId || state.selfPassId;
  const toPassId = String(input.toPassId ?? "").trim();
  const body = normalizeAgentBody(String(input.body ?? ""));
  if (!fromPassId || !agentPassById(fromPassId)) {
    return serializeAgentTalkCookie(state);
  }
  if (!agentPassById(toPassId) || toPassId === fromPassId || !body) {
    return serializeAgentTalkCookie(state);
  }
  const line: AgentTalkLine = {
    id: createAgentId("talk"),
    fromPassId,
    toPassId,
    body,
    at: new Date().toISOString(),
  };
  return serializeAgentTalkCookie({
    ...state,
    talks: [line, ...state.talks].slice(0, AGENT_TALK_MAX),
  });
}

/** Returns the JSON cookie value. One rate per wearer + subject; a new tape replaces. */
export function writeAgentRate(
  raw: string | null | undefined,
  input: {
    fromPassId?: string;
    subject?: string;
    stars?: string;
    body?: string;
  },
): string {
  const state = parseAgentTalkCookie(raw);
  const fromPassId = input.fromPassId || state.selfPassId;
  const subject = String(input.subject ?? "").trim();
  const stars = parseAgentStars(input.stars);
  const body = normalizeAgentBody(String(input.body ?? ""));
  if (!fromPassId || !agentPassById(fromPassId) || !stars) {
    return serializeAgentTalkCookie(state);
  }
  if (subject !== "aisle") {
    if (!agentPassById(subject) || subject === fromPassId) {
      return serializeAgentTalkCookie(state);
    }
  }
  const next: AgentRate = {
    id: createAgentId(subject === "aisle" ? "aisle" : "pass"),
    fromPassId,
    subject,
    stars,
    body,
    at: new Date().toISOString(),
  };
  const rates = [
    next,
    ...state.rates.filter(
      (rate) => !(rate.fromPassId === fromPassId && rate.subject === subject),
    ),
  ].slice(0, AGENT_RATE_MAX);
  return serializeAgentTalkCookie({ ...state, rates });
}

/** Returns the JSON cookie value. Listing must be a live commerce SKU. */
export function writeOpenTrade(
  raw: string | null | undefined,
  input: { fromPassId?: string; toPassId?: string; listingId?: string },
): string {
  const state = parseAgentTalkCookie(raw);
  const fromPassId = input.fromPassId || state.selfPassId;
  const toPassId = String(input.toPassId ?? "").trim();
  const listingId = String(input.listingId ?? "").trim();
  const listing = listingById(listingId);
  if (!fromPassId || !agentPassById(fromPassId)) {
    return serializeAgentTalkCookie(state);
  }
  if (!agentPassById(toPassId) || toPassId === fromPassId) {
    return serializeAgentTalkCookie(state);
  }
  if (!isTradeableListing(listing)) {
    return serializeAgentTalkCookie(state);
  }
  const trade: AgentTrade = {
    id: createAgentId("trade"),
    fromPassId,
    toPassId,
    listingId: listing.id,
    amountCents: listing.price.amountCents,
    currency: "usd",
    status: "open",
    mallCutCents: 0,
    at: new Date().toISOString(),
  };
  return serializeAgentTalkCookie({
    ...state,
    trades: [trade, ...state.trades].slice(0, AGENT_TRADE_MAX),
  });
}

/** Returns the JSON cookie value. Cut is 10% only after confirm. */
export function writeConfirmTrade(
  raw: string | null | undefined,
  tradeId: string,
): string {
  const state = parseAgentTalkCookie(raw);
  const id = String(tradeId ?? "").trim();
  if (!id) {
    return serializeAgentTalkCookie(state);
  }
  const trades = state.trades.map((trade) => {
    if (trade.id !== id || trade.status === "confirmed") {
      return trade;
    }
    return {
      ...trade,
      status: "confirmed" as const,
      mallCutCents: agentTradeMallCutCents(trade.amountCents),
      confirmedAt: new Date().toISOString(),
    };
  });
  return serializeAgentTalkCookie({ ...state, trades });
}

/** Returns the JSON cookie value. Jar money is 100% — no mall cut. */
export function writeDonation(
  raw: string | null | undefined,
  input: { fromPassId?: string; amountCents?: string },
): string {
  const state = parseAgentTalkCookie(raw);
  const fromPassId = input.fromPassId || state.selfPassId;
  const amountCents = Number(String(input.amountCents ?? "").trim());
  if (!fromPassId || !agentPassById(fromPassId)) {
    return serializeAgentTalkCookie(state);
  }
  if (
    !Number.isInteger(amountCents) ||
    !AGENT_DONATION_CENTS.includes(
      amountCents as (typeof AGENT_DONATION_CENTS)[number],
    )
  ) {
    return serializeAgentTalkCookie(state);
  }
  const donation: AgentDonation = {
    id: createAgentId("jar"),
    fromPassId,
    amountCents,
    currency: "usd",
    at: new Date().toISOString(),
  };
  return serializeAgentTalkCookie({
    ...state,
    donations: [donation, ...state.donations].slice(0, AGENT_DONATION_MAX),
  });
}

export function ratesForSubject(state: AgentTalkState, subject: AgentRateSubject) {
  return state.rates.filter((rate) => rate.subject === subject);
}

export function averageStars(rates: AgentRate[]): number | null {
  if (rates.length === 0) {
    return null;
  }
  const sum = rates.reduce((total, rate) => total + rate.stars, 0);
  return Math.round((sum / rates.length) * 10) / 10;
}

export function jarTotalCents(state: AgentTalkState) {
  return state.donations.reduce((sum, row) => sum + row.amountCents, 0);
}

export function confirmedTradeCutCents(state: AgentTalkState) {
  return state.trades
    .filter((trade) => trade.status === "confirmed")
    .reduce((sum, trade) => sum + trade.mallCutCents, 0);
}

export function tradeCounterparty(trade: AgentTrade, selfPassId: string | null) {
  if (!selfPassId) {
    return trade.toPassId;
  }
  return trade.fromPassId === selfPassId ? trade.toPassId : trade.fromPassId;
}

export function listingOnTrade(trade: AgentTrade) {
  return listingById(trade.listingId);
}

export function stallNameForPass(pass: AgentPass) {
  return stallById(pass.stallId)?.boothName ?? pass.name;
}

export function formatAgentMoney(amountCents: number) {
  return formatMoney(money(amountCents));
}

export function formatStars(value: number | null) {
  if (value === null) {
    return "No stars yet";
  }
  return `${value} / 5`;
}

export function mergeAgentTalkState(
  existing: AgentTalkState,
  incoming: AgentTalkState,
): AgentTalkState {
  const talks = new Map<string, AgentTalkLine>();
  for (const row of incoming.talks) talks.set(row.id, row);
  for (const row of existing.talks) {
    if (!talks.has(row.id)) talks.set(row.id, row);
  }
  const rates = new Map<string, AgentRate>();
  for (const row of incoming.rates) rates.set(row.id, row);
  for (const row of existing.rates) {
    if (!rates.has(row.id)) rates.set(row.id, row);
  }
  const trades = new Map<string, AgentTrade>();
  for (const row of incoming.trades) trades.set(row.id, row);
  for (const row of existing.trades) {
    if (!trades.has(row.id)) trades.set(row.id, row);
  }
  const donations = new Map<string, AgentDonation>();
  for (const row of incoming.donations) donations.set(row.id, row);
  for (const row of existing.donations) {
    if (!donations.has(row.id)) donations.set(row.id, row);
  }
  return {
    selfPassId: incoming.selfPassId ?? existing.selfPassId,
    talks: [...talks.values()]
      .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
      .slice(0, AGENT_TALK_MAX),
    rates: [...rates.values()]
      .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
      .slice(0, AGENT_RATE_MAX),
    trades: [...trades.values()]
      .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
      .slice(0, AGENT_TRADE_MAX),
    donations: [...donations.values()]
      .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
      .slice(0, AGENT_DONATION_MAX),
  };
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readAgentTalkState(): AgentTalkState {
  if (!canUseStorage()) {
    return emptyAgentTalkState();
  }
  try {
    return parseAgentTalkCookie(
      window.localStorage.getItem(AGENT_TALK_STORAGE_KEY),
    );
  } catch {
    return emptyAgentTalkState();
  }
}

export function persistAgentTalkCookie(raw: string) {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(AGENT_TALK_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${AGENT_TALK_COOKIE}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(AGENT_TALK_CHANGED_EVENT));
}
