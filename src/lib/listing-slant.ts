/**
 * I will not cut a slant — regular and almost bold. Still tote.
 *
 * Foundry is two weights, not a seat. Court / map / directory was
 * killed. Almost-bold / third weight was killed. Install / host /
 * woff was killed. Walkers still want Beats to cut an italic, an
 * oblique, or “give me a slant.” I will not cut a slant. Regular
 * and almost bold. Still for sale. Not foundry. Not a type shop.
 * Not bold.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:slant-listing-ids` is the client slant set.
 * Cookie `iss-slant-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foundry, loop, zip, print, stick, folder, italic,
 * oblique, cut, bold, court, install, woff, look, ask, hands, van,
 * firm, packed, sold, file-gone, gift, buy, digital eligibility,
 * or tote keys.
 * Physical listings and gift cards are refused — a lamp is not a
 * slant. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const SLANT_STORAGE_KEY = "iss:slant-listing-ids";
export const SLANT_COOKIE_NAME = "iss-slant-listing-ids";
export const SLANT_CHANGED_EVENT = "iss:slant-changed";

export const SLANT_REFUSE_COPY = "That one does not take a slant.";
export const SLANT_TABLE_LINE = "I will not cut a slant.";
export const SLANT_WEIGHTS_LINE = "Regular and almost bold.";
export const SLANT_NOTICE_TITLE =
  "I will not cut a slant. Regular and almost bold.";
export const SLANT_FOUNDRY_LINE = "Foundry is two weights, not a seat.";
export const SLANT_STILL_LINE =
  "Still tote. Not foundry. Not a type shop. Not bold.";
export const SLANT_TOTE_LINE = "Add to tote still works.";
export const SLANT_EMPTY_LINE = "Nobody taped the slant yet.";

const SERVER_STORE = Symbol.for("iss.slant-listing-ids");

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

export function parseSlantListingIds(
  raw: string | null | undefined,
): string[] {
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

export function slantCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SLANT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SLANT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SLANT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SLANT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SLANT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSlantListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSlantListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SLANT_STORAGE_KEY);
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
          window.localStorage.setItem(SLANT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSlantListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = slantCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SLANT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SLANT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SLANT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSlantOverlay(
  listingId: string,
  listingIds = readSlantListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeSlant(listing: Listing | undefined): listing is Listing {
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

export type SlantWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type SlantWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SlantWriteReason; listingIds: string[] };

function refuseSlant(
  listing: Listing | undefined,
  listingIds: string[],
): SlantWriteResult | null {
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

export function markListingSlant(
  listing: Listing | undefined,
  listingIds: string[],
): SlantWriteResult {
  const refused = refuseSlant(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingSlant(
  listing: Listing | undefined,
  listingIds: string[],
): SlantWriteResult {
  const refused = refuseSlant(listing, listingIds);
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

export function subscribeSlant(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SLANT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SLANT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SLANT_CHANGED_EVENT, listener);
  };
}
