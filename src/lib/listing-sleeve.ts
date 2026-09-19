/**
 * The grocery bag is the sleeve — no real jacket. Still tote.
 *
 * Skip is the scratch. Press is which pressing.
 * This is the LP in a grocery bag. Not skip. Not poly.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:sleeve-listing-ids` is the client sleeve set.
 * Cookie `iss-sleeve-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write skip, press, poly, plays, scan, hiss, needle, book, cases,
 * film, look, ask, hands, van, firm, packed, sold, file-gone, gift,
 * buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF has no grocery bag.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SLEEVE_STORAGE_KEY = "iss:sleeve-listing-ids";
export const SLEEVE_COOKIE_NAME = "iss-sleeve-listing-ids";
export const SLEEVE_CHANGED_EVENT = "iss:sleeve-changed";

export const SLEEVE_REFUSE_COPY = "That one is not a grocery-bag sleeve.";
export const SLEEVE_TABLE_LINE = "The grocery bag is the sleeve.";
export const SLEEVE_SKIP_LINE = "Skip is the scratch.";
export const SLEEVE_PRESS_LINE = "Press is which pressing.";
export const SLEEVE_BAG_LINE = "This is the LP in a grocery bag.";
export const SLEEVE_JACKET_LINE = "No real jacket. The bag is the sleeve.";
export const SLEEVE_STILL_LINE = "Still tote. Not skip. Not poly.";
export const SLEEVE_TOTE_LINE = "Add to tote still works.";
export const SLEEVE_EMPTY_LINE = "Nobody taped the grocery bag yet.";

const SERVER_STORE = Symbol.for("iss.sleeve-listing-ids");

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

export function parseSleeveListingIds(raw: string | null | undefined): string[] {
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

export function sleeveCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SLEEVE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SLEEVE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SLEEVE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SLEEVE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SLEEVE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSleeveListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSleeveListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SLEEVE_STORAGE_KEY);
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
          window.localStorage.setItem(SLEEVE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSleeveListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = sleeveCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SLEEVE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SLEEVE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SLEEVE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSleeveOverlay(
  listingId: string,
  listingIds = readSleeveListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSleeve(listing: Listing | undefined): listing is Listing {
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

export type SleeveWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type SleeveWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SleeveWriteReason; listingIds: string[] };

function refuseSleeve(
  listing: Listing | undefined,
  listingIds: string[],
): SleeveWriteResult | null {
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

export function markListingSleeve(
  listing: Listing | undefined,
  listingIds: string[],
): SleeveWriteResult {
  const refused = refuseSleeve(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingSleeve(
  listing: Listing | undefined,
  listingIds: string[],
): SleeveWriteResult {
  const refused = refuseSleeve(listing, listingIds);
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

export function subscribeSleeve(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SLEEVE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SLEEVE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SLEEVE_CHANGED_EVENT, listener);
  };
}
