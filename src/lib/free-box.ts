/**
 * Free box — cardboard titles on this booth.
 * Tags are prices. The pile is titles, not a $0 listing, not tote math.
 *
 * Never write wanted / scrap / tape / sign / tote / sold / packed keys.
 * Never write `/stalls/[slug]/tape`, `/stalls/[slug]/scrap`, or `/stalls/[slug]/sign`.
 *
 * Shape: `{ id, stallId, title, at }` titles.
 * localStorage key `iss:free-box` is the client pile.
 * Cookie `iss-free-box` is the same JSON so `/stalls/[slug]/free` can SSR it.
 */
import { stallById, stallBySlug, type Stall } from "@/lib/commerce";

export const FREE_BOX_STORAGE_KEY = "iss:free-box";
export const FREE_BOX_COOKIE_NAME = "iss-free-box";
export const FREE_BOX_CHANGED_EVENT = "iss:free-box-changed";

export const FREE_BOX_NOTE_MAX = 140;
export const FREE_BOX_STALL_MAX = 20;

export const FREE_MISSING_COPY = "That stall packed up.";
export const FREE_EMPTY_COPY = "This pile is empty.";
export const FREE_PAPER_LINE =
  "Tags are prices. Free is a cardboard pile of titles — not a $0 listing, not tote math.";
export const FREE_RELOAD_LINE = "Tape a title and it is still here after reload.";

export type FreeTitle = {
  id: string;
  stallId: string;
  title: string;
  at: string;
};

export type TapeFreeResult =
  | { ok: true; item: FreeTitle; titles: FreeTitle[] }
  | { ok: false; reason: "empty" | "missing"; titles: FreeTitle[] };

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeFreeTitle(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, FREE_BOX_NOTE_MAX);
}

function isFreeTitle(value: unknown): value is FreeTitle {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as FreeTitle;
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

export function parseFreeBox(raw: string | null | undefined): FreeTitle[] {
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
    return parsed.filter(isFreeTitle);
  } catch {
    return [];
  }
}

export function serializeFreeBox(titles: FreeTitle[]) {
  return JSON.stringify(titles);
}

export function createFreeId(at = new Date()) {
  const stamp = at.getTime().toString(36);
  const salt = Math.random().toString(36).slice(2, 6);
  return `free-${stamp}${salt}`;
}

export function createFreeTitle(
  stall: Stall,
  title: string,
  at = new Date(),
): FreeTitle {
  return {
    id: createFreeId(at),
    stallId: stall.id,
    title,
    at: at.toISOString(),
  };
}

export function resolveFreeStall(slugOrId: string): Stall | undefined {
  const trimmed = slugOrId.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallBySlug(trimmed) ?? stallById(trimmed);
}

export function titlesForStall(titles: FreeTitle[], stallId: string) {
  return titles.filter((item) => item.stallId === stallId);
}

function capBooth(
  titles: FreeTitle[],
  stallId: string,
  incoming: FreeTitle[],
): FreeTitle[] {
  const others = titles.filter((item) => item.stallId !== stallId);
  const mine = incoming
    .filter((item) => item.stallId === stallId)
    .slice(0, FREE_BOX_STALL_MAX);
  return [...mine, ...others];
}

export function tapeFreeTitle(
  existing: FreeTitle[],
  slugOrId: string,
  raw: string,
): TapeFreeResult {
  const stall = resolveFreeStall(slugOrId);
  if (!stall) {
    return { ok: false, reason: "missing", titles: existing };
  }

  const title = normalizeFreeTitle(raw);
  if (!title) {
    return { ok: false, reason: "empty", titles: existing };
  }

  const item = createFreeTitle(stall, title);
  const mine = [item, ...titlesForStall(existing, stall.id)];
  return {
    ok: true,
    item,
    titles: capBooth(existing, stall.id, mine),
  };
}

export function peelFreeTitle(
  existing: FreeTitle[],
  titleId: string,
): FreeTitle[] {
  if (!titleId) {
    return existing;
  }
  return existing.filter((item) => item.id !== titleId);
}

export function mergeFreeBox(
  existing: FreeTitle[],
  incoming: FreeTitle[],
): FreeTitle[] {
  const byId = new Map<string, FreeTitle>();
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
    next = capBooth(next, stallId, titlesForStall(next, stallId));
  }
  return next;
}

export function readFreeBox(): FreeTitle[] {
  if (!canUseStorage()) {
    return [];
  }
  try {
    const fromStorage = parseFreeBox(
      window.localStorage.getItem(FREE_BOX_STORAGE_KEY),
    );
    if (fromStorage.length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return [];
}

export function writeFreeBox(titles: FreeTitle[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeFreeBox(titles);
  try {
    window.localStorage.setItem(FREE_BOX_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${FREE_BOX_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(FREE_BOX_CHANGED_EVENT));
}

export function subscribeFreeBox(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === FREE_BOX_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(FREE_BOX_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FREE_BOX_CHANGED_EVENT, listener);
  };
}
