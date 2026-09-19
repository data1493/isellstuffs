/**
 * Warm stays warm — the LUT pack stays three looks. Still tote.
 *
 * Shot is I don't shoot. Grade is no custom LUT. Convert is Rec.709.
 * Walkers still want Half-Working to add a night look, cool the
 * warm, or “give me four.” Warm stays warm. Three looks. Still
 * for sale. Not shot. Not a grade shop. Not convert.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:warm-listing-ids` is the client warm set.
 * Cookie `iss-warm-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write shot, grade, convert, glue, film, look, folder, stems,
 * vibe, foundry, cards, zip, name, fourth, night, cool, packed, sold,
 * file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp is not
 * a LUT look. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const WARM_STORAGE_KEY = "iss:warm-listing-ids";
export const WARM_COOKIE_NAME = "iss-warm-listing-ids";
export const WARM_CHANGED_EVENT = "iss:warm-changed";

export const WARM_REFUSE_COPY = "That one does not take a warm tape.";
export const WARM_TABLE_LINE = "Warm stays warm.";
export const WARM_LOOKS_LINE = "Three looks.";
export const WARM_NOTICE_TITLE = "Warm stays warm. Three looks.";
export const WARM_SHOT_LINE = "Shot is I don't shoot. Grade is no custom LUT.";
export const WARM_CONVERT_LINE = "Convert is Rec.709.";
export const WARM_WALK_LINE =
  "Walkers still want a night look, or four.";
export const WARM_STILL_LINE = "Still tote. Not shot. Not a grade shop. Not convert.";
export const WARM_TOTE_LINE = "Add to tote still works.";
export const WARM_EMPTY_LINE = "Nobody taped the warm yet.";

const SERVER_STORE = Symbol.for("iss.warm-listing-ids");

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

export function parseWarmListingIds(raw: string | null | undefined): string[] {
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
    return uniqueListingIds(
      parsed.filter((id): id is string => typeof id === "string"),
    );
  } catch {
    return emptyIds;
  }
}

export function warmCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WARM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WARM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WARM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WARM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WARM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWarmListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWarmListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WARM_STORAGE_KEY);
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
          window.localStorage.setItem(WARM_STORAGE_KEY, JSON.stringify(ids));
        } catch {
          // blocked storage
        }
        return ids;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  return serverStore();
}

export function writeWarmListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = warmCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WARM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WARM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WARM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWarmOverlay(
  listingId: string,
  listingIds = readWarmListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeWarm(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isDigitalListing(listing)) {
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

export type WarmWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type WarmWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: WarmWriteReason; listingIds: string[] };

function refuseWarm(
  listing: Listing | undefined,
  listingIds: string[],
): WarmWriteResult | null {
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
  if (!isDigitalListing(listing)) {
    return { ok: false, reason: "physical", listingIds };
  }
  return null;
}

export function markListingWarm(
  listing: Listing | undefined,
  listingIds: string[],
): WarmWriteResult {
  const refused = refuseWarm(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingWarm(
  listing: Listing | undefined,
  listingIds: string[],
): WarmWriteResult {
  const refused = refuseWarm(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== taped.id),
  };
}

export function subscribeWarm(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WARM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WARM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WARM_CHANGED_EVENT, listener);
  };
}
