/**
 * I will not replace a tine — whisk-wire refusal. Still tote.
 *
 * Wires splay. Still metal. Sharpen was killed. Walkers still
 * want Sink Drawer to replace a wire, or “make it a balloon
 * again.” I will not replace a tine. Still for sale. Not a
 * parts counter. Not a reshape. Not a drop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:tines-listing-ids` is the client tines set.
 * Cookie `iss-tines-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write reshape, drop, mug-story, lid-pane, recipe-scale,
 * diner-pour, wire, spoke, balloon, whip, eggs, film, look, ask,
 * hands, van, firm, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a recipe scan is
 * not a whisk. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TINES_STORAGE_KEY = "iss:tines-listing-ids";
export const TINES_COOKIE_NAME = "iss-tines-listing-ids";
export const TINES_CHANGED_EVENT = "iss:tines-changed";

export const TINES_REFUSE_COPY = "That one does not take a tine.";
export const TINES_TABLE_LINE = "I will not replace a tine.";
export const TINES_SPLAY_LINE = "Wires splay.";
export const TINES_METAL_LINE = "Still metal.";
export const TINES_NOTICE_TITLE = "I will not replace a tine. Wires splay. Still metal.";
export const TINES_WALK_LINE =
  "Walkers still want Sink Drawer to replace a wire.";
export const TINES_STAYS_LINE = "This is the tines refusal.";
export const TINES_STILL_LINE = "Still tote. Not a parts counter.";
export const TINES_TOTE_LINE = "Add to tote still works.";
export const TINES_EMPTY_LINE = "Nobody taped a tines refusal yet.";

const SERVER_STORE = Symbol.for("iss.tines-listing-ids");

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

export function parseTinesListingIds(raw: string | null | undefined): string[] {
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

export function tinesCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TINES_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TINES_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TINES_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TINES_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TINES_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTinesListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTinesListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TINES_STORAGE_KEY);
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
          window.localStorage.setItem(TINES_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTinesListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = tinesCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TINES_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TINES_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TINES_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTinesOverlay(
  listingId: string,
  listingIds = readTinesListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeTines(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isPhysicalListing(listing)) {
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

export type TinesWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type TinesWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: TinesWriteReason; listingIds: string[] };

function refuseTines(
  listing: Listing | undefined,
  listingIds: string[],
): TinesWriteResult | null {
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
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", listingIds };
  }
  return null;
}

export function markListingTines(
  listing: Listing | undefined,
  listingIds: string[],
): TinesWriteResult {
  const refused = refuseTines(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingTines(
  listing: Listing | undefined,
  listingIds: string[],
): TinesWriteResult {
  const refused = refuseTines(listing, listingIds);
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

export function subscribeTines(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TINES_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TINES_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TINES_CHANGED_EVENT, listener);
  };
}
