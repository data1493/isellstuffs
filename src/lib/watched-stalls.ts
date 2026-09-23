/**
 * Watched tables — booth ids, not SKUs.
 * Never write `iss:saved-listing-ids`, `iss-saved-listing-ids`,
 * or `iss:cart-listing-ids` / `iss-cart-listing-ids`.
 *
 * Shape: JSON array of `Stall.id` strings from `@/lib/commerce`.
 * localStorage key `iss:watched-stall-ids` is the client walk.
 * Cookie `iss-watched-stall-ids` is the same JSON for no-JS watch.
 */
import {
  listingsByStall,
  stallById,
  stallBySlug,
  type Listing,
  type Stall,
} from "@/lib/commerce";

export const WATCHED_STORAGE_KEY = "iss:watched-stall-ids";
export const WATCHED_COOKIE_NAME = "iss-watched-stall-ids";

export const WATCHED_CHANGED_EVENT = "iss:watched-changed";

export type WatchedWriteResult =
  | { ok: true; already: boolean; stallIds: string[] }
  | { ok: false; reason: "missing"; stallIds: string[] };

const emptyIds: string[] = [];

let cachedRaw: string | null | undefined;
let cachedIds: string[] = emptyIds;

function canUseStorage() {
  return typeof window !== "undefined";
}

function uniqueStallIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out.length === 0 ? emptyIds : out;
}

export function parseWatchedStallIds(raw: string | null | undefined): string[] {
  if (!raw) {
    return emptyIds;
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
      return emptyIds;
    }
    const ids = parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
    return uniqueStallIds(ids);
  } catch {
    return emptyIds;
  }
}

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WATCHED_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWatchedStallIds(raw);
  return cachedIds;
}

export function readWatchedStallIds(): string[] {
  if (!canUseStorage()) {
    return emptyIds;
  }
  const fromStorage = window.localStorage.getItem(WATCHED_STORAGE_KEY);
  if (fromStorage) {
    const stored = snapshotFromRaw(fromStorage);
    if (stored.length > 0) {
      return stored;
    }
  }
  const fromCookie = readCookieRaw();
  if (fromCookie) {
    const ids = snapshotFromRaw(fromCookie);
    if (ids.length > 0) {
      try {
        window.localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(ids));
      } catch {
        // blocked storage
      }
      return ids;
    }
  }
  return snapshotFromRaw(fromStorage ?? null);
}

export function writeWatchedStallIds(stallIds: string[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = JSON.stringify(stallIds);
  try {
    window.localStorage.setItem(WATCHED_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${WATCHED_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  cachedRaw = raw;
  cachedIds = stallIds.length === 0 ? emptyIds : stallIds;
  window.dispatchEvent(new Event(WATCHED_CHANGED_EVENT));
}

export function resolveWatchStall(raw: string): Stall | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function isStallWatched(stallId: string, stallIds = readWatchedStallIds()) {
  return stallIds.includes(stallId);
}

export function addStallIdToWatched(
  stallId: string,
  stallIds: string[],
): WatchedWriteResult {
  const stall = resolveWatchStall(stallId);
  if (!stall) {
    return { ok: false, reason: "missing", stallIds };
  }

  if (stallIds.includes(stall.id)) {
    return { ok: true, already: true, stallIds };
  }

  return {
    ok: true,
    already: false,
    stallIds: [...stallIds, stall.id],
  };
}

export function removeStallIdFromWatched(stallId: string, stallIds: string[]) {
  const stall = resolveWatchStall(stallId);
  const id = stall?.id ?? stallId.trim();
  if (!id || !stallIds.includes(id)) {
    return { ok: true as const, stallIds };
  }

  return {
    ok: true as const,
    stallIds: stallIds.filter((item) => item !== id),
  };
}

export function addStallToWatched(stallId: string): WatchedWriteResult {
  const result = addStallIdToWatched(stallId, readWatchedStallIds());
  if (result.ok && !result.already) {
    writeWatchedStallIds(result.stallIds);
  }
  return result;
}

export function dropStallFromWatched(stallId: string) {
  const result = removeStallIdFromWatched(stallId, readWatchedStallIds());
  writeWatchedStallIds(result.stallIds);
  return result;
}

/** Available rows only. Sold and file-gone stay off the walk. */
export function stillHereOnStall(stallId: string): Listing[] {
  return listingsByStall(stallId).filter((listing) => listing.status === "available");
}

export function subscribeWatched(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WATCHED_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WATCHED_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WATCHED_CHANGED_EVENT, listener);
  };
}
