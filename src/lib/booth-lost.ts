/**
 * Lost on this table — titles left behind on this booth.
 * Someone left sunglasses on the windbreaker pile.
 *
 * Never write free-box / wanted / scrap / tape / tote / sold / packed keys.
 * Never write `/stalls/[slug]/free`, `/stalls/[slug]/scrap`, or `/wanted`.
 *
 * Shape: `{ id, stallId, title, at }` titles.
 * localStorage key `iss:booth-lost` is the client pile.
 * Cookie `iss-booth-lost` is the same JSON so `/stalls/[slug]/lost` can SSR it.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const BOOTH_LOST_STORAGE_KEY = "iss:booth-lost";
export const BOOTH_LOST_COOKIE_NAME = "iss-booth-lost";
export const BOOTH_LOST_CHANGED_EVENT = "iss:booth-lost-changed";

export const BOOTH_LOST_NOTE_MAX = 140;
export const BOOTH_LOST_STALL_MAX = 20;

export const LOST_MISSING_COPY = "That stall packed up.";
export const LOST_EMPTY_COPY = "Nobody left a thing here.";
export const LOST_PAPER_LINE =
  "Left behind on this booth. Not free. Not cork.";
export const LOST_RELOAD_LINE = "Tape a title and it is still here after reload.";

export type LostTitle = {
  id: string;
  stallId: string;
  title: string;
  at: string;
};

export type TapeLostResult =
  | { ok: true; item: LostTitle; titles: LostTitle[] }
  | { ok: false; reason: "empty" | "missing"; titles: LostTitle[] };

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeLostTitle(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, BOOTH_LOST_NOTE_MAX);
}

function isLostTitle(value: unknown): value is LostTitle {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as LostTitle;
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

export function parseBoothLost(raw: string | null | undefined): LostTitle[] {
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
    return parsed.filter(isLostTitle);
  } catch {
    return [];
  }
}

export function serializeBoothLost(titles: LostTitle[]) {
  return JSON.stringify(titles);
}

export function createLostId(at = new Date()) {
  const stamp = at.getTime().toString(36);
  const salt = Math.random().toString(36).slice(2, 6);
  return `lost-${stamp}${salt}`;
}

export function createLostTitle(
  stall: Stall,
  title: string,
  at = new Date(),
): LostTitle {
  return {
    id: createLostId(at),
    stallId: stall.id,
    title,
    at: at.toISOString(),
  };
}

export function resolveLostStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallBySlug(trimmed) ?? stallById(trimmed);
}

export function lostTitlesForStall(titles: LostTitle[], stallId: string) {
  return titles.filter((item) => item.stallId === stallId);
}

function capBooth(
  titles: LostTitle[],
  stallId: string,
  incoming: LostTitle[],
): LostTitle[] {
  const others = titles.filter((item) => item.stallId !== stallId);
  const mine = incoming
    .filter((item) => item.stallId === stallId)
    .slice(0, BOOTH_LOST_STALL_MAX);
  return [...mine, ...others];
}

export function tapeLostTitle(
  existing: LostTitle[],
  slugOrId: string,
  raw: string,
): TapeLostResult {
  const stall = resolveLostStall(slugOrId);
  if (!stall) {
    return { ok: false, reason: "missing", titles: existing };
  }

  const title = normalizeLostTitle(raw);
  if (!title) {
    return { ok: false, reason: "empty", titles: existing };
  }

  const item = createLostTitle(stall, title);
  const mine = [item, ...lostTitlesForStall(existing, stall.id)];
  return {
    ok: true,
    item,
    titles: capBooth(existing, stall.id, mine),
  };
}

export function peelLostTitle(
  existing: LostTitle[],
  titleId: string,
): LostTitle[] {
  if (!titleId) {
    return existing;
  }
  return existing.filter((item) => item.id !== titleId);
}

export function mergeBoothLost(
  existing: LostTitle[],
  incoming: LostTitle[],
): LostTitle[] {
  const byId = new Map<string, LostTitle>();
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
    next = capBooth(next, stallId, lostTitlesForStall(next, stallId));
  }
  return next;
}

export function readBoothLost(): LostTitle[] {
  if (!canUseStorage()) {
    return [];
  }
  try {
    const fromStorage = parseBoothLost(
      window.localStorage.getItem(BOOTH_LOST_STORAGE_KEY),
    );
    if (fromStorage.length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return [];
}

export function writeBoothLost(titles: LostTitle[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeBoothLost(titles);
  try {
    window.localStorage.setItem(BOOTH_LOST_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${BOOTH_LOST_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(BOOTH_LOST_CHANGED_EVENT));
}

export function subscribeBoothLost(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOTH_LOST_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOTH_LOST_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOTH_LOST_CHANGED_EVENT, listener);
  };
}
