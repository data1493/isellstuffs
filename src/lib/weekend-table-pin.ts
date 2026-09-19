/**
 * Stallholder pins on this weekend’s table. No paid stamp.
 *
 * Extra `Listing.id` values, appended after the fixture four or the
 * mall-keeper overlay. Never write `iss:week-picks` / `iss-week-picks`.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:weekend-pins` is the client pin set.
 * Cookie `iss-weekend-pins` is the same JSON so `/this-week` can SSR it.
 *
 * Sold, file-gone, gift, and missing ids never stick.
 */
import { listingById, type Listing } from "@/lib/commerce";
import { isGiftListing } from "@/lib/commerce/types";

export const WEEKEND_PINS_STORAGE_KEY = "iss:weekend-pins";
export const WEEKEND_PINS_COOKIE_NAME = "iss-weekend-pins";
export const WEEKEND_PINS_CHANGED_EVENT = "iss:weekend-pins-changed";

const SERVER_STORE = Symbol.for("iss.weekend-pins");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

let cachedRaw: string | null | undefined;
let cachedIds: string[] = emptyIds;

function canUseStorage() {
  return typeof window !== "undefined";
}

function uniqueListingIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const id of ids) {
    if (typeof id !== "string" || id.length === 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    next.push(id);
  }
  return next.length === 0 ? emptyIds : next;
}

export function parseWeekendPinIds(raw: string | null | undefined): string[] {
  if (raw == null || raw === "") {
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
    return uniqueListingIds(
      parsed.filter((id): id is string => typeof id === "string"),
    );
  } catch {
    return emptyIds;
  }
}

export function weekendPinCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WEEKEND_PIN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WEEKEND_PINS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WEEKEND_PINS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WEEKEND_PINS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WEEKEND_PINS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWeekendPinIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

/** Still-here fixture or overlay row. Sold, file-gone, and the gift card stay off. */
export function canPinWeekend(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (isGiftListing(listing)) {
    return false;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return false;
  }
  return true;
}

export function sanitizeWeekendPinIds(ids: readonly string[]) {
  const seen = new Set<string>();
  const clean: string[] = [];

  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }
    const listing = listingById(id);
    if (!canPinWeekend(listing)) {
      continue;
    }
    seen.add(id);
    clean.push(id);
  }

  return clean;
}

/**
 * After fixture / editor ids, append pins that are still eligible.
 * Does not rewrite the source list. Does not sneak a dropped fixture back.
 */
export function appendWeekendPins(
  baseIds: readonly string[],
  raw: string | null | undefined,
): string[] {
  const pins = sanitizeWeekendPinIds(parseWeekendPinIds(raw));
  const seen = new Set(baseIds);
  const extra = pins.filter((id) => !seen.has(id));
  return extra.length === 0 ? [...baseIds] : [...baseIds, ...extra];
}

export function readWeekendPinIds(): string[] {
  if (canUseStorage()) {
    const fromCookie = readCookieRaw();
    if (fromCookie != null && fromCookie !== "") {
      const ids = snapshotFromRaw(fromCookie);
      try {
        window.localStorage.setItem(
          WEEKEND_PINS_STORAGE_KEY,
          weekendPinCookieValue(ids),
        );
      } catch {
        // blocked storage
      }
      return ids;
    }
    try {
      const fromStorage = window.localStorage.getItem(WEEKEND_PINS_STORAGE_KEY);
      if (fromStorage != null && fromStorage !== "") {
        return snapshotFromRaw(fromStorage);
      }
    } catch {
      // blocked storage
    }
    return emptyIds;
  }

  return uniqueListingIds(serverStore());
}

export function writeWeekendPinIds(listingIds: readonly string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = weekendPinCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WEEKEND_PINS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WEEKEND_PINS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WEEKEND_PINS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isWeekendPinned(
  listingId: string,
  listingIds = readWeekendPinIds(),
) {
  return listingIds.includes(listingId);
}

export type WeekendPinWriteResult =
  | { ok: true; listingIds: string[] }
  | {
      ok: false;
      reason: "missing" | "sold" | "file-gone" | "gift";
      listingIds: string[];
    };

export function pinWeekendListing(
  listing: Listing | undefined,
  listingIds: string[],
): WeekendPinWriteResult {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", listingIds };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "sold", listingIds };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", listingIds };
  }
  if (listingIds.includes(listing.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing.id] };
}

/** Drop removes that id only. Fixture lamp stays on the source list. */
export function dropWeekendListing(
  listingId: string,
  listingIds: string[],
): { ok: true; listingIds: string[] } {
  if (!listingIds.includes(listingId)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== listingId),
  };
}
