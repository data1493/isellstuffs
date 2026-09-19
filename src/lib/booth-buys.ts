/**
 * I buy that — titles this booth also buys.
 * Wanted is walkers. Scrap is a lid question. The stallholder buys too.
 *
 * Never write wanted / scrap / lost / free / stay / share / scan / heavy /
 * pockets / tote / sold / packed keys.
 * Never write `/wanted`, `/stalls/[slug]/scrap`, `/stalls/[slug]/lost`,
 * `/listings/[id]/heavy`, or `/listings/[id]/pockets`.
 *
 * Shape: `{ id, stallId, title, at }` titles.
 * localStorage key `iss:booth-buys` is the client pile.
 * Cookie `iss-booth-buys` is the same JSON so `/stalls/[slug]/buy` can SSR it.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_BUYS_STORAGE_KEY = "iss:booth-buys";
export const BOOTH_BUYS_COOKIE_NAME = "iss-booth-buys";
export const BOOTH_BUYS_CHANGED_EVENT = "iss:booth-buys-changed";

export const BOOTH_BUYS_NOTE_MAX = 140;
export const BOOTH_BUYS_STALL_MAX = 20;

export const BUY_MISSING_COPY = "That stall packed up.";
export const BUY_EMPTY_COPY = "This booth is not buying.";
export const BUY_PAPER_LINE =
  "This booth also buys. Wanted is walkers. Scrap is a lid question.";
export const BUY_RELOAD_LINE = "Tape a title and it is still here after reload.";

export type BuyTitle = {
  id: string;
  stallId: string;
  title: string;
  at: string;
};

export type TapeBuyResult =
  | { ok: true; item: BuyTitle; titles: BuyTitle[] }
  | { ok: false; reason: "empty" | "missing"; titles: BuyTitle[] };

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeBuyTitle(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_BUYS_NOTE_MAX);
}

function isBuyTitle(value: unknown): value is BuyTitle {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as BuyTitle;
  return (
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.stallId === "string" &&
    item.stallId.length > 0 &&
    typeof item.title === "string" &&
    item.title.length > 0 &&
    typeof item.at === "string"
  );
}

export function parseBoothBuys(raw: string | null | undefined): BuyTitle[] {
  if (!raw) {
    return [];
  }
  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isBuyTitle);
  } catch {
    return [];
  }
}

export function serializeBoothBuys(titles: BuyTitle[]) {
  return JSON.stringify(titles);
}

export function createBuyId(at = new Date()) {
  const stamp = at.getTime().toString(36);
  const salt = Math.random().toString(36).slice(2, 6);
  return `buy-${stamp}${salt}`;
}

export function createBuyTitle(
  stall: Stall,
  title: string,
  at = new Date(),
): BuyTitle {
  return {
    id: createBuyId(at),
    stallId: stall.id,
    title,
    at: at.toISOString(),
  };
}

export function resolveBuyStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallBySlug(trimmed) ?? stallById(trimmed);
}

export function buyTitlesForStall(titles: BuyTitle[], stallId: string) {
  return titles.filter((item) => item.stallId === stallId);
}

function capBooth(
  titles: BuyTitle[],
  stallId: string,
  incoming: BuyTitle[],
): BuyTitle[] {
  const others = titles.filter((item) => item.stallId !== stallId);
  const mine = incoming
    .filter((item) => item.stallId === stallId)
    .slice(0, BOOTH_BUYS_STALL_MAX);
  return [...mine, ...others];
}

export function tapeBuyTitle(
  existing: BuyTitle[],
  slugOrId: string,
  raw: string,
): TapeBuyResult {
  const stall = resolveBuyStall(slugOrId);
  if (!stall) {
    return { ok: false, reason: "missing", titles: existing };
  }

  const title = normalizeBuyTitle(raw);
  if (!title) {
    return { ok: false, reason: "empty", titles: existing };
  }

  const item = createBuyTitle(stall, title);
  const mine = [item, ...buyTitlesForStall(existing, stall.id)];
  return {
    ok: true,
    item,
    titles: capBooth(existing, stall.id, mine),
  };
}

export function peelBuyTitle(
  existing: BuyTitle[],
  titleId: string,
): BuyTitle[] {
  if (!titleId) {
    return existing;
  }
  return existing.filter((item) => item.id !== titleId);
}

export function mergeBoothBuys(
  existing: BuyTitle[],
  incoming: BuyTitle[],
): BuyTitle[] {
  const byId = new Map<string, BuyTitle>();
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  for (const item of existing) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  const merged = [...byId.values()].sort((a, b) =>
    a.at < b.at ? 1 : a.at > b.at ? -1 : 0,
  );

  const stallIds = [...new Set(merged.map((item) => item.stallId))];
  let next = merged;
  for (const stallId of stallIds) {
    next = capBooth(next, stallId, buyTitlesForStall(next, stallId));
  }
  return next;
}

export function readBoothBuys(): BuyTitle[] {
  if (!canUseStorage()) {
    return [];
  }
  try {
    const fromStorage = parseBoothBuys(
      window.localStorage.getItem(BOOTH_BUYS_STORAGE_KEY),
    );
    if (fromStorage.length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return [];
}

export function writeBoothBuys(titles: BuyTitle[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothBuys(titles);
  try {
    window.localStorage.setItem(BOOTH_BUYS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_BUYS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_BUYS_CHANGED_EVENT));
}

export function subscribeBoothBuys(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_BUYS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_BUYS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_BUYS_CHANGED_EVENT, listener);
  };
}
