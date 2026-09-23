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

export type AgentPass = {
  handle: string;
  publicAddress: string;
  createdAt: string;
};

export type AgentLot = {
  id: string;
  sellerHandle: string;
  title: string;
  askCents: number;
  asset: AgentAsset;
  flagged: boolean;
  pulled: boolean;
  createdAt: string;
};

export type AgentTrade = {
  id: string;
  lotId: string;
  takerHandle: string;
  askCents: number;
  feeCents: number;
  status: AgentTradeStatus;
  createdAt: string;
};

export type AgentRating = {
  id: string;
  fromHandle: string;
  about: AgentRatingAbout;
  aboutHandle: string | null;
  stars: number;
  body: string;
  createdAt: string;
};

export type AgentSuggestion = {
  id: string;
  fromHandle: string;
  body: string;
  createdAt: string;
};

export type DonatePledge = {
  id: string;
  method: DonateMethod;
  amountCents: number;
  from: DonateFrom;
  createdAt: string;
};

export type AgentTalkState = {
  ratings: AgentRating[];
  suggestions: AgentSuggestion[];
};

export type AgentStoreSnapshot = {
  pass?: string | null;
  lots?: string | null;
  trades?: string | null;
  talk?: string | null;
  pledges?: string | null;
};

export type AgentCookieWrites = {
  pass?: string;
  lots?: string;
  trades?: string;
  talk?: string;
  pledges?: string;
};

export type AgentStoreReason =
  | "empty"
  | "ask"
  | "physical"
  | "private-key"
  | "missing"
  | "pulled"
  | "taken"
  | "status"
  | "stars"
  | "about"
  | "method"
  | "amount";

export type AgentStoreWrite<T> =
  | { ok: true; value: T; cookies: AgentCookieWrites }
  | { ok: false; reason: AgentStoreReason; cookies: AgentCookieWrites };

const MEMORY = Symbol.for("iss.agent-row-store");

type MemoryState = {
  pass: AgentPass | null;
  lots: AgentLot[];
  trades: AgentTrade[];
  ratings: AgentRating[];
  suggestions: AgentSuggestion[];
  pledges: DonatePledge[];
};

type MemoryGlobal = typeof globalThis & {
  [MEMORY]?: MemoryState;
};

type SqlValue = string | number | null;

type SqlClient = {
  dialect: "sqlite" | "postgres";
  all<T extends Record<string, unknown>>(
    text: string,
    params?: SqlValue[],
  ): Promise<T[]>;
  run(text: string, params?: SqlValue[]): Promise<void>;
};

const KEY_MATERIAL =
  /private[_-]?key|\bmnemonic\b|\bseed\b|sk_live|sk_test/i;

/** Runtime schema. PRAGMA lines run on SQLite only. */
export const AGENT_ROW_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS agent_passes (
  handle TEXT PRIMARY KEY,
  public_address TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_lots (
  id TEXT PRIMARY KEY,
  seller_handle TEXT NOT NULL,
  title TEXT NOT NULL,
  ask_cents INTEGER NOT NULL,
  asset TEXT NOT NULL,
  flagged INTEGER NOT NULL DEFAULT 0,
  pulled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  CHECK (ask_cents >= 1 AND ask_cents <= 50000),
  CHECK (asset IN ('usdc', 'eth')),
  CHECK (flagged IN (0, 1)),
  CHECK (pulled IN (0, 1))
);

CREATE INDEX IF NOT EXISTS agent_lots_pulled_created_at
  ON agent_lots (pulled, created_at);

CREATE TABLE IF NOT EXISTS agent_trades (
  id TEXT PRIMARY KEY,
  lot_id TEXT NOT NULL,
  taker_handle TEXT NOT NULL,
  ask_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (ask_cents >= 1 AND ask_cents <= 50000),
  CHECK (status IN ('taken', 'confirmed', 'void'))
);

CREATE INDEX IF NOT EXISTS agent_trades_status
  ON agent_trades (status);

CREATE TABLE IF NOT EXISTS agent_ratings (
  id TEXT PRIMARY KEY,
  from_handle TEXT NOT NULL,
  about TEXT NOT NULL,
  about_handle TEXT,
  stars INTEGER NOT NULL,
  body TEXT,
  created_at TEXT NOT NULL,
  CHECK (about IN ('aisle', 'pass')),
  CHECK (stars >= 1 AND stars <= 5)
);

CREATE INDEX IF NOT EXISTS agent_ratings_about_handle
  ON agent_ratings (about_handle);

CREATE TABLE IF NOT EXISTS agent_suggestions (
  id TEXT PRIMARY KEY,
  from_handle TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS donate_pledges (
  id TEXT PRIMARY KEY,
  method TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  from_kind TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (method IN ('crypto', 'venmo', 'paypal', 'zelle', 'stripe')),
  CHECK (from_kind IN ('human', 'agent')),
  CHECK (amount_cents >= 1)
);
`;

const SQLITE_PRAGMAS = [
  "PRAGMA journal_mode = WAL",
  "PRAGMA synchronous = NORMAL",
  "PRAGMA busy_timeout = 5000",
];

function emptyMemory(): MemoryState {
  return {
    pass: null,
    lots: [],
    trades: [],
    ratings: [],
    suggestions: [],
    pledges: [],
  };
}

function memoryState(): MemoryState {
  const g = globalThis as MemoryGlobal;
  if (!g[MEMORY]) {
    g[MEMORY] = emptyMemory();
  }
  return g[MEMORY];
}

export function resetAgentStoreMemory() {
  const g = globalThis as MemoryGlobal;
  g[MEMORY] = emptyMemory();
  sqlReady = null;
  sqlClientCache = null;
}

export function databaseUrl(): string | null {
  const raw = process.env.DATABASE_URL?.trim();
  return raw ? raw : null;
}

export function usesDatabase() {
  return databaseUrl() !== null;
}

export function agentTradeFeeCents(askCents: number) {
  return Math.floor((askCents * 10) / 100);
}

export function agentTradeNetCents(
  askCents: number,
  feeCents = agentTradeFeeCents(askCents),
) {
  return askCents - feeCents;
}

function nowIso(at = new Date()) {
  return at.toISOString();
}

function createRowId(prefix: string, at = new Date()) {
  const stamp = at.getTime().toString(36);
  const salt = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${stamp}${salt}`;
}

function decodeRaw(raw: string | null | undefined): unknown {
  if (!raw) {
    return null;
  }
  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isAsset(value: unknown): value is AgentAsset {
  return value === "usdc" || value === "eth";
}

function isTradeStatus(value: unknown): value is AgentTradeStatus {
  return value === "taken" || value === "confirmed" || value === "void";
}

function isAbout(value: unknown): value is AgentRatingAbout {
  return value === "aisle" || value === "pass";
}

function isDonateMethod(value: unknown): value is DonateMethod {
  return (
    value === "crypto" ||
    value === "venmo" ||
    value === "paypal" ||
    value === "zelle" ||
    value === "stripe"
  );
}

function isDonateFrom(value: unknown): value is DonateFrom {
  return value === "human" || value === "agent";
}

function isPass(value: unknown): value is AgentPass {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as AgentPass;
  return (
    typeof row.handle === "string" &&
    row.handle.length > 0 &&
    typeof row.publicAddress === "string" &&
    row.publicAddress.length > 0 &&
    typeof row.createdAt === "string"
  );
}

function isLot(value: unknown): value is AgentLot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as AgentLot;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.sellerHandle === "string" &&
    typeof row.title === "string" &&
    Number.isInteger(row.askCents) &&
    isAsset(row.asset) &&
    typeof row.flagged === "boolean" &&
    typeof row.pulled === "boolean" &&
    typeof row.createdAt === "string"
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
    typeof row.lotId === "string" &&
    typeof row.takerHandle === "string" &&
    Number.isInteger(row.askCents) &&
    Number.isInteger(row.feeCents) &&
    isTradeStatus(row.status) &&
    typeof row.createdAt === "string"
  );
}

function isRating(value: unknown): value is AgentRating {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as AgentRating;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.fromHandle === "string" &&
    isAbout(row.about) &&
    (row.aboutHandle === null || typeof row.aboutHandle === "string") &&
    Number.isInteger(row.stars) &&
    row.stars >= 1 &&
    row.stars <= 5 &&
    typeof row.body === "string" &&
    typeof row.createdAt === "string"
  );
}

function isSuggestion(value: unknown): value is AgentSuggestion {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as AgentSuggestion;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.fromHandle === "string" &&
    typeof row.body === "string" &&
    row.body.length > 0 &&
    typeof row.createdAt === "string"
  );
}

function isPledge(value: unknown): value is DonatePledge {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as DonatePledge;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    isDonateMethod(row.method) &&
    Number.isInteger(row.amountCents) &&
    row.amountCents >= 1 &&
    isDonateFrom(row.from) &&
    typeof row.createdAt === "string"
  );
}

export function parsePass(raw: string | null | undefined): AgentPass | null {
  const parsed = decodeRaw(raw);
  return isPass(parsed) ? parsed : null;
}

export function parseLots(raw: string | null | undefined): AgentLot[] {
  const parsed = decodeRaw(raw);
  return Array.isArray(parsed) ? parsed.filter(isLot) : [];
}

export function parseTrades(raw: string | null | undefined): AgentTrade[] {
  const parsed = decodeRaw(raw);
  return Array.isArray(parsed) ? parsed.filter(isTrade) : [];
}

export function parseTalk(raw: string | null | undefined): AgentTalkState {
  const parsed = decodeRaw(raw);
  if (!parsed || typeof parsed !== "object") {
    return { ratings: [], suggestions: [] };
  }
  const talk = parsed as AgentTalkState;
  return {
    ratings: Array.isArray(talk.ratings) ? talk.ratings.filter(isRating) : [],
    suggestions: Array.isArray(talk.suggestions)
      ? talk.suggestions.filter(isSuggestion)
      : [],
  };
}

export function parsePledges(raw: string | null | undefined): DonatePledge[] {
  const parsed = decodeRaw(raw);
  return Array.isArray(parsed) ? parsed.filter(isPledge) : [];
}

export function serializePass(pass: AgentPass | null) {
  return JSON.stringify(pass);
}

export function serializeLots(lots: AgentLot[]) {
  return JSON.stringify(lots);
}

export function serializeTrades(trades: AgentTrade[]) {
  return JSON.stringify(trades);
}

export function serializeTalk(talk: AgentTalkState) {
  return JSON.stringify(talk);
}

export function serializePledges(pledges: DonatePledge[]) {
  return JSON.stringify(pledges);
}

export function snapshotFromCookies(
  get: (name: string) => string | undefined,
): AgentStoreSnapshot {
  return {
    pass: get(AGENT_PASS_COOKIE_NAME) ?? null,
    lots: get(AGENT_LOTS_COOKIE_NAME) ?? null,
    trades: get(AGENT_TRADES_COOKIE_NAME) ?? null,
    talk: get(AGENT_TALK_COOKIE_NAME) ?? null,
    pledges: get(DONATE_PLEDGES_COOKIE_NAME) ?? null,
  };
}

export function cookieNameFor(key: keyof AgentCookieWrites) {
  switch (key) {
    case "pass":
      return AGENT_PASS_COOKIE_NAME;
    case "lots":
      return AGENT_LOTS_COOKIE_NAME;
    case "trades":
      return AGENT_TRADES_COOKIE_NAME;
    case "talk":
      return AGENT_TALK_COOKIE_NAME;
    case "pledges":
      return DONATE_PLEDGES_COOKIE_NAME;
  }
}

function normalizeHandle(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, 40);
}

function normalizeTitle(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, 140);
}

function normalizeAddress(raw: string) {
  return raw.trim().slice(0, 128);
}

function normalizeBody(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, 280);
}

function looksLikeKeyMaterial(value: string) {
  if (KEY_MATERIAL.test(value)) {
    return true;
  }
  return value.trim().split(/\s+/).filter(Boolean).length >= 12;
}

function isCatalogPhysicalId(title: string) {
  const listing = listingById(title);
  return Boolean(listing && isPhysicalListing(listing));
}

function askInRange(askCents: number) {
  return (
    Number.isInteger(askCents) &&
    askCents >= AGENT_ASK_CENTS_MIN &&
    askCents <= AGENT_ASK_CENTS_MAX
  );
}

function lotIsOpen(lot: AgentLot, trades: AgentTrade[]) {
  if (lot.pulled) {
    return false;
  }
  return !trades.some(
    (trade) =>
      trade.lotId === lot.id &&
      (trade.status === "taken" || trade.status === "confirmed"),
  );
}

function cookiesFor(state: MemoryState): AgentCookieWrites {
  return {
    pass: serializePass(state.pass),
    lots: serializeLots(state.lots),
    trades: serializeTrades(state.trades),
    talk: serializeTalk({
      ratings: state.ratings,
      suggestions: state.suggestions,
    }),
    pledges: serializePledges(state.pledges),
  };
}

function stateFromSnapshot(
  snapshot: AgentStoreSnapshot | undefined,
  fallback: MemoryState,
): MemoryState {
  if (!snapshot) {
    return {
      pass: fallback.pass,
      lots: fallback.lots.slice(),
      trades: fallback.trades.slice(),
      ratings: fallback.ratings.slice(),
      suggestions: fallback.suggestions.slice(),
      pledges: fallback.pledges.slice(),
    };
  }
  const talk = parseTalk(snapshot.talk);
  return {
    pass:
      snapshot.pass === undefined ? fallback.pass : parsePass(snapshot.pass),
    lots:
      snapshot.lots === undefined ? fallback.lots.slice() : parseLots(snapshot.lots),
    trades:
      snapshot.trades === undefined
        ? fallback.trades.slice()
        : parseTrades(snapshot.trades),
    ratings:
      snapshot.talk === undefined ? fallback.ratings.slice() : talk.ratings,
    suggestions:
      snapshot.talk === undefined
        ? fallback.suggestions.slice()
        : talk.suggestions,
    pledges:
      snapshot.pledges === undefined
        ? fallback.pledges.slice()
        : parsePledges(snapshot.pledges),
  };
}

function remember(state: MemoryState) {
  const g = globalThis as MemoryGlobal;
  g[MEMORY] = {
    pass: state.pass,
    lots: state.lots.slice(),
    trades: state.trades.slice(),
    ratings: state.ratings.slice(),
    suggestions: state.suggestions.slice(),
    pledges: state.pledges.slice(),
  };
}

function asInt(value: unknown) {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.length > 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullText(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function rowPass(row: Record<string, unknown>): AgentPass {
  return {
    handle: asText(row.handle),
    publicAddress: asText(row.public_address),
    createdAt: asText(row.created_at),
  };
}

function rowLot(row: Record<string, unknown>): AgentLot {
  return {
    id: asText(row.id),
    sellerHandle: asText(row.seller_handle),
    title: asText(row.title),
    askCents: asInt(row.ask_cents),
    asset: isAsset(row.asset) ? row.asset : "usdc",
    flagged: asInt(row.flagged) === 1,
    pulled: asInt(row.pulled) === 1,
    createdAt: asText(row.created_at),
  };
}

function rowTrade(row: Record<string, unknown>): AgentTrade {
  return {
    id: asText(row.id),
    lotId: asText(row.lot_id),
    takerHandle: asText(row.taker_handle),
    askCents: asInt(row.ask_cents),
    feeCents: asInt(row.fee_cents),
    status: isTradeStatus(row.status) ? row.status : "taken",
    createdAt: asText(row.created_at),
  };
}

function rowRating(row: Record<string, unknown>): AgentRating {
  return {
    id: asText(row.id),
    fromHandle: asText(row.from_handle),
    about: isAbout(row.about) ? row.about : "aisle",
    aboutHandle: asNullText(row.about_handle),
    stars: asInt(row.stars),
    body: asText(row.body),
    createdAt: asText(row.created_at),
  };
}

function rowSuggestion(row: Record<string, unknown>): AgentSuggestion {
  return {
    id: asText(row.id),
    fromHandle: asText(row.from_handle),
    body: asText(row.body),
    createdAt: asText(row.created_at),
  };
}

function rowPledge(row: Record<string, unknown>): DonatePledge {
  return {
    id: asText(row.id),
    method: isDonateMethod(row.method) ? row.method : "crypto",
    amountCents: asInt(row.amount_cents),
    from: isDonateFrom(row.from_kind) ? row.from_kind : "human",
    createdAt: asText(row.created_at),
  };
}

function toPostgresParams(text: string) {
  let index = 0;
  return text.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

function parseSqliteTarget(url: string) {
  if (url === ":memory:" || url === "sqlite::memory:") {
    return ":memory:";
  }
  if (url.startsWith("sqlite:")) {
    return url.slice("sqlite:".length);
  }
  if (url.startsWith("file:")) {
    return url.slice("file:".length);
  }
  if (url.endsWith(".db") || url.endsWith(".sqlite")) {
    return url;
  }
  return null;
}

function isPostgresUrl(url: string) {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

async function openSqlite(file: string): Promise<SqlClient> {
  const { mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  const sqliteMod = "node:sqlite";
  const { DatabaseSync } = (await import(sqliteMod)) as {
    DatabaseSync: new (path: string) => {
      exec(sql: string): void;
      prepare(sql: string): {
        all: (...params: SqlValue[]) => Record<string, unknown>[];
        run: (...params: SqlValue[]) => void;
      };
    };
  };
  if (file !== ":memory:") {
    mkdirSync(dirname(file) || ".", { recursive: true });
  }
  const db = new DatabaseSync(file);
  for (const pragma of SQLITE_PRAGMAS) {
    db.exec(pragma);
  }
  return {
    dialect: "sqlite",
    async all<T extends Record<string, unknown>>(text: string, params: SqlValue[] = []) {
      return db.prepare(text).all(...params) as T[];
    },
    async run(text: string, params: SqlValue[] = []) {
      db.prepare(text).run(...params);
    },
  };
}

async function openPostgres(url: string): Promise<SqlClient> {
  const postgresMod = "postgres";
  const loaded = (await import(postgresMod)) as {
    default?: (url: string) => {
      unsafe: (
        text: string,
        params?: SqlValue[],
      ) => Promise<Record<string, unknown>[]>;
    };
    (
      url: string,
    ): {
      unsafe: (
        text: string,
        params?: SqlValue[],
      ) => Promise<Record<string, unknown>[]>;
    };
  };
  const postgres = loaded.default ?? loaded;
  const sql = postgres(url);
  return {
    dialect: "postgres",
    async all<T extends Record<string, unknown>>(text: string, params: SqlValue[] = []) {
      const rows = await sql.unsafe(toPostgresParams(text), params);
      return rows as T[];
    },
    async run(text: string, params: SqlValue[] = []) {
      await sql.unsafe(toPostgresParams(text), params);
    },
  };
}

let sqlClientCache: SqlClient | null = null;
let sqlReady: Promise<SqlClient> | null = null;

async function applySchema(client: SqlClient) {
  const statements = AGENT_ROW_SCHEMA_SQL.split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  for (const statement of statements) {
    await client.run(statement);
  }
}

async function sqlClient(): Promise<SqlClient> {
  if (sqlClientCache) {
    return sqlClientCache;
  }
  if (sqlReady) {
    return sqlReady;
  }
  const url = databaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is unset");
  }
  if (typeof window !== "undefined") {
    throw new Error("Agent store SQL is server-only");
  }
  sqlReady = (async () => {
    const sqliteFile = parseSqliteTarget(url);
    const client = sqliteFile
      ? await openSqlite(sqliteFile)
      : isPostgresUrl(url)
        ? await openPostgres(url)
        : await openSqlite(url);
    await applySchema(client);
    sqlClientCache = client;
    return client;
  })();
  try {
    return await sqlReady;
  } catch (error) {
    sqlReady = null;
    throw error;
  }
}

function cookieState(snapshot?: AgentStoreSnapshot) {
  return stateFromSnapshot(snapshot, memoryState());
}

export async function readPass(
  snapshot?: AgentStoreSnapshot,
): Promise<AgentPass | null> {
  const fromCookie =
    snapshot?.pass !== undefined ? parsePass(snapshot.pass) : memoryState().pass;
  if (!usesDatabase()) {
    return snapshot ? cookieState(snapshot).pass : fromCookie;
  }
  if (!fromCookie) {
    return null;
  }
  const sql = await sqlClient();
  const named = await sql.all<Record<string, unknown>>(
    "SELECT handle, public_address, created_at FROM agent_passes WHERE handle = ?",
    [fromCookie.handle],
  );
  return named[0] ? rowPass(named[0]) : fromCookie;
}

export async function readPassByHandle(
  handle: string,
  snapshot?: AgentStoreSnapshot,
): Promise<AgentPass | null> {
  const named = normalizeHandle(handle);
  if (!named) {
    return null;
  }
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      "SELECT handle, public_address, created_at FROM agent_passes WHERE handle = ?",
      [named],
    );
    return rows[0] ? rowPass(rows[0]) : null;
  }
  const state = cookieState(snapshot);
  return state.pass?.handle === named ? state.pass : null;
}

export async function writePass(
  input: { handle: string; publicAddress: string } | null,
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<AgentPass | null>> {
  if (input === null) {
    if (usesDatabase()) {
      return { ok: true, value: null, cookies: { pass: serializePass(null) } };
    }
    const state = cookieState(snapshot);
    state.pass = null;
    remember(state);
    return { ok: true, value: null, cookies: { pass: serializePass(null) } };
  }

  const handle = normalizeHandle(input.handle);
  const publicAddress = normalizeAddress(input.publicAddress);
  if (!handle || !publicAddress) {
    return {
      ok: false,
      reason: "empty",
      cookies: { pass: serializePass(cookieState(snapshot).pass) },
    };
  }
  if (looksLikeKeyMaterial(handle) || looksLikeKeyMaterial(publicAddress)) {
    return {
      ok: false,
      reason: "private-key",
      cookies: { pass: serializePass(cookieState(snapshot).pass) },
    };
  }

  const pass: AgentPass = {
    handle,
    publicAddress,
    createdAt: nowIso(),
  };

  if (usesDatabase()) {
    const sql = await sqlClient();
    await sql.run(
      `INSERT INTO agent_passes (handle, public_address, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT (handle) DO UPDATE SET public_address = excluded.public_address`,
      [pass.handle, pass.publicAddress, pass.createdAt],
    );
    return { ok: true, value: pass, cookies: { pass: serializePass(pass) } };
  }

  const state = cookieState(snapshot);
  state.pass = pass;
  remember(state);
  return { ok: true, value: pass, cookies: { pass: serializePass(pass) } };
}

export async function listLots(
  snapshot?: AgentStoreSnapshot,
): Promise<AgentLot[]> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      `SELECT l.id, l.seller_handle, l.title, l.ask_cents, l.asset, l.flagged, l.pulled, l.created_at
       FROM agent_lots l
       WHERE l.pulled = 0
         AND NOT EXISTS (
           SELECT 1 FROM agent_trades t
           WHERE t.lot_id = l.id AND t.status IN ('taken', 'confirmed')
         )
       ORDER BY l.created_at DESC`,
    );
    return rows.map(rowLot);
  }
  const state = cookieState(snapshot);
  return state.lots.filter((lot) => lotIsOpen(lot, state.trades));
}

export async function insertLot(
  input: {
    sellerHandle: string;
    title: string;
    askCents: number;
    asset: AgentAsset;
  },
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<AgentLot>> {
  const sellerHandle = normalizeHandle(input.sellerHandle);
  const title = normalizeTitle(input.title);
  const cookies = () => ({ lots: serializeLots(cookieState(snapshot).lots) });

  if (!sellerHandle || !title) {
    return { ok: false, reason: "empty", cookies: cookies() };
  }
  if (!isAsset(input.asset) || !askInRange(input.askCents)) {
    return { ok: false, reason: "ask", cookies: cookies() };
  }
  if (isCatalogPhysicalId(title)) {
    return { ok: false, reason: "physical", cookies: cookies() };
  }

  const lot: AgentLot = {
    id: createRowId("lot"),
    sellerHandle,
    title,
    askCents: input.askCents,
    asset: input.asset,
    flagged: false,
    pulled: false,
    createdAt: nowIso(),
  };

  if (usesDatabase()) {
    const sql = await sqlClient();
    await sql.run(
      `INSERT INTO agent_lots (id, seller_handle, title, ask_cents, asset, flagged, pulled, created_at)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
      [lot.id, lot.sellerHandle, lot.title, lot.askCents, lot.asset, lot.createdAt],
    );
    return { ok: true, value: lot, cookies: {} };
  }

  const state = cookieState(snapshot);
  state.lots = [lot, ...state.lots];
  remember(state);
  return { ok: true, value: lot, cookies: { lots: serializeLots(state.lots) } };
}

export async function pullLot(
  lotId: string,
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<AgentLot>> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    await sql.run("UPDATE agent_lots SET pulled = 1 WHERE id = ?", [lotId]);
    const rows = await sql.all<Record<string, unknown>>(
      "SELECT id, seller_handle, title, ask_cents, asset, flagged, pulled, created_at FROM agent_lots WHERE id = ?",
      [lotId],
    );
    if (!rows[0]) {
      return { ok: false, reason: "missing", cookies: {} };
    }
    return { ok: true, value: rowLot(rows[0]), cookies: {} };
  }
  const state = cookieState(snapshot);
  const lot = state.lots.find((row) => row.id === lotId);
  if (!lot) {
    return { ok: false, reason: "missing", cookies: { lots: serializeLots(state.lots) } };
  }
  lot.pulled = true;
  remember(state);
  return { ok: true, value: lot, cookies: { lots: serializeLots(state.lots) } };
}

export async function flagLot(
  lotId: string,
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<AgentLot>> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    await sql.run("UPDATE agent_lots SET flagged = 1 WHERE id = ?", [lotId]);
    const rows = await sql.all<Record<string, unknown>>(
      "SELECT id, seller_handle, title, ask_cents, asset, flagged, pulled, created_at FROM agent_lots WHERE id = ?",
      [lotId],
    );
    if (!rows[0]) {
      return { ok: false, reason: "missing", cookies: {} };
    }
    return { ok: true, value: rowLot(rows[0]), cookies: {} };
  }
  const state = cookieState(snapshot);
  const lot = state.lots.find((row) => row.id === lotId);
  if (!lot) {
    return { ok: false, reason: "missing", cookies: { lots: serializeLots(state.lots) } };
  }
  lot.flagged = true;
  remember(state);
  return { ok: true, value: lot, cookies: { lots: serializeLots(state.lots) } };
}

export async function insertTrade(
  input: { lotId: string; takerHandle: string },
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<AgentTrade>> {
  const takerHandle = normalizeHandle(input.takerHandle);
  if (usesDatabase()) {
    const sql = await sqlClient();
    const lots = await sql.all<Record<string, unknown>>(
      "SELECT id, seller_handle, title, ask_cents, asset, flagged, pulled, created_at FROM agent_lots WHERE id = ?",
      [input.lotId],
    );
    if (!lots[0]) {
      return { ok: false, reason: "missing", cookies: {} };
    }
    const lot = rowLot(lots[0]);
    if (lot.pulled) {
      return { ok: false, reason: "pulled", cookies: {} };
    }
    const busy = await sql.all<Record<string, unknown>>(
      "SELECT id FROM agent_trades WHERE lot_id = ? AND status IN ('taken', 'confirmed')",
      [lot.id],
    );
    if (busy[0]) {
      return { ok: false, reason: "taken", cookies: {} };
    }
    if (!takerHandle) {
      return { ok: false, reason: "empty", cookies: {} };
    }
    const trade: AgentTrade = {
      id: createRowId("trade"),
      lotId: lot.id,
      takerHandle,
      askCents: lot.askCents,
      feeCents: agentTradeFeeCents(lot.askCents),
      status: "taken",
      createdAt: nowIso(),
    };
    await sql.run(
      `INSERT INTO agent_trades (id, lot_id, taker_handle, ask_cents, fee_cents, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        trade.id,
        trade.lotId,
        trade.takerHandle,
        trade.askCents,
        trade.feeCents,
        trade.status,
        trade.createdAt,
      ],
    );
    return { ok: true, value: trade, cookies: {} };
  }

  const state = cookieState(snapshot);
  const lot = state.lots.find((row) => row.id === input.lotId);
  if (!lot) {
    return {
      ok: false,
      reason: "missing",
      cookies: { trades: serializeTrades(state.trades) },
    };
  }
  if (lot.pulled) {
    return {
      ok: false,
      reason: "pulled",
      cookies: { trades: serializeTrades(state.trades) },
    };
  }
  if (!lotIsOpen(lot, state.trades)) {
    return {
      ok: false,
      reason: "taken",
      cookies: { trades: serializeTrades(state.trades) },
    };
  }
  if (!takerHandle) {
    return {
      ok: false,
      reason: "empty",
      cookies: { trades: serializeTrades(state.trades) },
    };
  }
  const trade: AgentTrade = {
    id: createRowId("trade"),
    lotId: lot.id,
    takerHandle,
    askCents: lot.askCents,
    feeCents: agentTradeFeeCents(lot.askCents),
    status: "taken",
    createdAt: nowIso(),
  };
  state.trades = [trade, ...state.trades];
  remember(state);
  return {
    ok: true,
    value: trade,
    cookies: { trades: serializeTrades(state.trades) },
  };
}

async function setTradeStatus(
  tradeId: string,
  next: "confirmed" | "void",
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<AgentTrade>> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      "SELECT id, lot_id, taker_handle, ask_cents, fee_cents, status, created_at FROM agent_trades WHERE id = ?",
      [tradeId],
    );
    if (!rows[0]) {
      return { ok: false, reason: "missing", cookies: {} };
    }
    const trade = rowTrade(rows[0]);
    if (trade.status !== "taken") {
      return { ok: false, reason: "status", cookies: {} };
    }
    await sql.run("UPDATE agent_trades SET status = ? WHERE id = ?", [
      next,
      tradeId,
    ]);
    if (next === "confirmed") {
      await sql.run("UPDATE agent_lots SET pulled = 1 WHERE id = ?", [
        trade.lotId,
      ]);
    }
    return { ok: true, value: { ...trade, status: next }, cookies: {} };
  }

  const state = cookieState(snapshot);
  const trade = state.trades.find((row) => row.id === tradeId);
  if (!trade) {
    return {
      ok: false,
      reason: "missing",
      cookies: { trades: serializeTrades(state.trades), lots: serializeLots(state.lots) },
    };
  }
  if (trade.status !== "taken") {
    return {
      ok: false,
      reason: "status",
      cookies: { trades: serializeTrades(state.trades), lots: serializeLots(state.lots) },
    };
  }
  trade.status = next;
  if (next === "confirmed") {
    const lot = state.lots.find((row) => row.id === trade.lotId);
    if (lot) {
      lot.pulled = true;
    }
  }
  remember(state);
  return {
    ok: true,
    value: trade,
    cookies: {
      trades: serializeTrades(state.trades),
      lots: serializeLots(state.lots),
    },
  };
}

export async function confirmTrade(
  tradeId: string,
  snapshot?: AgentStoreSnapshot,
) {
  return setTradeStatus(tradeId, "confirmed", snapshot);
}

export async function voidTrade(
  tradeId: string,
  snapshot?: AgentStoreSnapshot,
) {
  return setTradeStatus(tradeId, "void", snapshot);
}

export async function readTrade(
  tradeId: string,
  snapshot?: AgentStoreSnapshot,
): Promise<AgentTrade | null> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      "SELECT id, lot_id, taker_handle, ask_cents, fee_cents, status, created_at FROM agent_trades WHERE id = ?",
      [tradeId],
    );
    return rows[0] ? rowTrade(rows[0]) : null;
  }
  return cookieState(snapshot).trades.find((row) => row.id === tradeId) ?? null;
}

export async function listTrades(
  snapshot?: AgentStoreSnapshot,
): Promise<AgentTrade[]> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      "SELECT id, lot_id, taker_handle, ask_cents, fee_cents, status, created_at FROM agent_trades ORDER BY created_at DESC",
    );
    return rows.map(rowTrade);
  }
  return cookieState(snapshot).trades;
}

export async function mallCutThisAisle(snapshot?: AgentStoreSnapshot) {
  const trades = await listTrades(snapshot);
  return trades
    .filter((trade) => trade.status === "confirmed")
    .reduce((sum, trade) => sum + trade.feeCents, 0);
}

export async function rateAgent(
  input: {
    fromHandle: string;
    about: AgentRatingAbout;
    aboutHandle?: string | null;
    stars: number;
    body?: string;
  },
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<AgentRating>> {
  const fromHandle = normalizeHandle(input.fromHandle) || "walker";
  const body = normalizeBody(input.body ?? "");
  const aboutHandle =
    input.about === "pass"
      ? normalizeHandle(input.aboutHandle ?? "")
      : normalizeHandle(input.aboutHandle ?? "") || null;

  const talkCookies = (state: MemoryState) => ({
    talk: serializeTalk({
      ratings: state.ratings,
      suggestions: state.suggestions,
    }),
  });

  if (!isAbout(input.about)) {
    return { ok: false, reason: "about", cookies: talkCookies(cookieState(snapshot)) };
  }
  if (input.about === "pass" && !aboutHandle) {
    return { ok: false, reason: "about", cookies: talkCookies(cookieState(snapshot)) };
  }
  if (!Number.isInteger(input.stars) || input.stars < 1 || input.stars > 5) {
    return { ok: false, reason: "stars", cookies: talkCookies(cookieState(snapshot)) };
  }

  const rating: AgentRating = {
    id: createRowId("rate"),
    fromHandle,
    about: input.about,
    aboutHandle: input.about === "pass" ? aboutHandle : aboutHandle,
    stars: input.stars,
    body,
    createdAt: nowIso(),
  };

  if (usesDatabase()) {
    const sql = await sqlClient();
    await sql.run(
      `INSERT INTO agent_ratings (id, from_handle, about, about_handle, stars, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        rating.id,
        rating.fromHandle,
        rating.about,
        rating.aboutHandle,
        rating.stars,
        rating.body,
        rating.createdAt,
      ],
    );
    return { ok: true, value: rating, cookies: {} };
  }

  const state = cookieState(snapshot);
  state.ratings = [rating, ...state.ratings];
  remember(state);
  return { ok: true, value: rating, cookies: talkCookies(state) };
}

export async function listRatingsForHandle(
  handle: string,
  snapshot?: AgentStoreSnapshot,
): Promise<AgentRating[]> {
  const aboutHandle = normalizeHandle(handle);
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      `SELECT id, from_handle, about, about_handle, stars, body, created_at
       FROM agent_ratings
       WHERE about = 'pass' AND about_handle = ?
       ORDER BY created_at DESC`,
      [aboutHandle],
    );
    return rows.map(rowRating);
  }
  return cookieState(snapshot).ratings.filter(
    (row) => row.about === "pass" && row.aboutHandle === aboutHandle,
  );
}

export async function listRatings(
  snapshot?: AgentStoreSnapshot,
): Promise<AgentRating[]> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      `SELECT id, from_handle, about, about_handle, stars, body, created_at
       FROM agent_ratings
       ORDER BY created_at DESC`,
    );
    return rows.map(rowRating);
  }
  return cookieState(snapshot).ratings;
}

export async function insertSuggestion(
  input: { fromHandle: string; body: string },
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<AgentSuggestion>> {
  const fromHandle = normalizeHandle(input.fromHandle) || "walker";
  const body = normalizeBody(input.body);
  const talkCookies = (state: MemoryState) => ({
    talk: serializeTalk({
      ratings: state.ratings,
      suggestions: state.suggestions,
    }),
  });
  if (!body) {
    return { ok: false, reason: "empty", cookies: talkCookies(cookieState(snapshot)) };
  }
  const suggestion: AgentSuggestion = {
    id: createRowId("sug"),
    fromHandle,
    body,
    createdAt: nowIso(),
  };
  if (usesDatabase()) {
    const sql = await sqlClient();
    await sql.run(
      `INSERT INTO agent_suggestions (id, from_handle, body, created_at) VALUES (?, ?, ?, ?)`,
      [
        suggestion.id,
        suggestion.fromHandle,
        suggestion.body,
        suggestion.createdAt,
      ],
    );
    return { ok: true, value: suggestion, cookies: {} };
  }
  const state = cookieState(snapshot);
  state.suggestions = [suggestion, ...state.suggestions];
  remember(state);
  return { ok: true, value: suggestion, cookies: talkCookies(state) };
}

export async function listSuggestions(
  snapshot?: AgentStoreSnapshot,
): Promise<AgentSuggestion[]> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      "SELECT id, from_handle, body, created_at FROM agent_suggestions ORDER BY created_at DESC",
    );
    return rows.map(rowSuggestion);
  }
  return cookieState(snapshot).suggestions;
}

export async function insertPledge(
  input: { method: DonateMethod; amountCents: number; from: DonateFrom },
  snapshot?: AgentStoreSnapshot,
): Promise<AgentStoreWrite<DonatePledge>> {
  const cookies = () => ({
    pledges: serializePledges(cookieState(snapshot).pledges),
  });
  if (!isDonateMethod(input.method)) {
    return { ok: false, reason: "method", cookies: cookies() };
  }
  if (!isDonateFrom(input.from)) {
    return { ok: false, reason: "empty", cookies: cookies() };
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents < 1) {
    return { ok: false, reason: "amount", cookies: cookies() };
  }
  const pledge: DonatePledge = {
    id: createRowId("pled"),
    method: input.method,
    amountCents: input.amountCents,
    from: input.from,
    createdAt: nowIso(),
  };
  if (usesDatabase()) {
    const sql = await sqlClient();
    await sql.run(
      `INSERT INTO donate_pledges (id, method, amount_cents, from_kind, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        pledge.id,
        pledge.method,
        pledge.amountCents,
        pledge.from,
        pledge.createdAt,
      ],
    );
    return { ok: true, value: pledge, cookies: {} };
  }
  const state = cookieState(snapshot);
  state.pledges = [pledge, ...state.pledges];
  remember(state);
  return {
    ok: true,
    value: pledge,
    cookies: { pledges: serializePledges(state.pledges) },
  };
}

export async function listPledges(
  snapshot?: AgentStoreSnapshot,
): Promise<DonatePledge[]> {
  if (usesDatabase()) {
    const sql = await sqlClient();
    const rows = await sql.all<Record<string, unknown>>(
      "SELECT id, method, amount_cents, from_kind, created_at FROM donate_pledges ORDER BY created_at DESC",
    );
    return rows.map(rowPledge);
  }
  return cookieState(snapshot).pledges;
}
