/**
 * I will not flatten — the unnamed LP stays warped. Still tote.
 *
 * Center is the hole. Skip is the chorus. Dust is the wipe.
 * VG is no Goldmine. Sleeve is the grocery bag. Shrink is crate cello.
 * Walkers still want Sunday Crate to flatten the unnamed LP, or
 * “put it under books.” I will not flatten. Warp stays. Still plays.
 * Still for sale. Not center. Not skip. Not vg.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:warp-listing-ids` is the client warp set.
 * Cookie `iss-warp-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a liner PDF does not flatten.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const WARP_STORAGE_KEY = "iss:warp-listing-ids";
export const WARP_COOKIE_NAME = "iss-warp-listing-ids";
export const WARP_CHANGED_EVENT = "iss:warp-changed";

export const WARP_REFUSE_COPY = "That one does not take a warp note.";
export const WARP_TABLE_LINE = "I will not flatten.";
export const WARP_STAYS_LINE = "Warp stays.";
export const WARP_PLAYS_LINE = "Still plays.";
export const WARP_NOTICE_TITLE = "I will not flatten. Warp stays. Still plays.";
export const WARP_WALK_LINE =
  "Walkers still want Sunday Crate to flatten the unnamed LP, or put it under books.";
export const WARP_NOTE_LINE = "This is the warp note. Warp stays. Still plays.";
export const WARP_STILL_LINE =
  "Still tote. Still plays. Still for sale. Not center. Not skip. Not vg.";
export const WARP_TOTE_LINE = "Add to tote still works.";
export const WARP_EMPTY_LINE = "Nobody taped the warp note yet.";

const SERVER_STORE = Symbol.for("iss.warp-listing-ids");

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

export function parseWarpListingIds(raw: string | null | undefined): string[] {
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

export function warpCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WARP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WARP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WARP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WARP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WARP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWarpListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWarpListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WARP_STORAGE_KEY);
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
          window.localStorage.setItem(WARP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeWarpListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = warpCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WARP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WARP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WARP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWarpOverlay(
  listingId: string,
  listingIds = readWarpListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeWarp(listing: Listing | undefined): listing is Listing {
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

export type WarpWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type WarpWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: WarpWriteReason; listingIds: string[] };

function refuseWarp(
  listing: Listing | undefined,
  listingIds: string[],
): WarpWriteResult | null {
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

export function markListingWarp(
  listing: Listing | undefined,
  listingIds: string[],
): WarpWriteResult {
  const refused = refuseWarp(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingWarp(
  listing: Listing | undefined,
  listingIds: string[],
): WarpWriteResult {
  const refused = refuseWarp(listing, listingIds);
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

export function subscribeWarp(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WARP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WARP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WARP_CHANGED_EVENT, listener);
  };
}
