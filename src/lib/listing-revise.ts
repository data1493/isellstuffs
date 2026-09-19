/**
 * I will not revise — the junk PDF stays one page. Still tote.
 *
 * Walkers still want Tuesday to update How to price your junk,
 * or “give me this year’s numbers.” I will not revise.
 * Written on a folding table. One page. Still for sale.
 * Not a second edition. Not a consult desk.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:revise-listing-ids` is the client revise set.
 * Cookie `iss-revise-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write consult, edition, dated, rule, folder, film, look,
 * ask, hands, van, firm, packed, sold, file-gone, gift, buy,
 * digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp is not a
 * page. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const REVISE_STORAGE_KEY = "iss:revise-listing-ids";
export const REVISE_COOKIE_NAME = "iss-revise-listing-ids";
export const REVISE_CHANGED_EVENT = "iss:revise-changed";

export const REVISE_REFUSE_COPY = "That one does not take a revise.";
export const REVISE_TABLE_LINE = "I will not revise.";
export const REVISE_PAGE_LINE = "Written on a folding table.";
export const REVISE_ONE_LINE = "One page.";
export const REVISE_NOTICE_TITLE =
  "I will not revise. Written on a folding table. One page.";
export const REVISE_WALK_LINE =
  "Walkers still want Tuesday to update How to price your junk.";
export const REVISE_STILL_LINE =
  "Still tote. Not a second edition. Not a consult desk.";
export const REVISE_TOTE_LINE = "Add to tote still works.";
export const REVISE_EMPTY_LINE = "Nobody taped a revise yet.";

const SERVER_STORE = Symbol.for("iss.revise-listing-ids");

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

export function parseReviseListingIds(
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

export function reviseCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const REVISE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${REVISE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(REVISE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(REVISE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${REVISE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseReviseListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readReviseListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(REVISE_STORAGE_KEY);
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
          window.localStorage.setItem(REVISE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeReviseListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = reviseCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(REVISE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${REVISE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(REVISE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingReviseOverlay(
  listingId: string,
  listingIds = readReviseListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeRevise(listing: Listing | undefined): listing is Listing {
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

export type ReviseWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type ReviseWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ReviseWriteReason; listingIds: string[] };

function refuseRevise(
  listing: Listing | undefined,
  listingIds: string[],
): ReviseWriteResult | null {
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

export function markListingRevise(
  listing: Listing | undefined,
  listingIds: string[],
): ReviseWriteResult {
  const refused = refuseRevise(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingRevise(
  listing: Listing | undefined,
  listingIds: string[],
): ReviseWriteResult {
  const refused = refuseRevise(listing, listingIds);
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

export function subscribeRevise(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === REVISE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(REVISE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REVISE_CHANGED_EVENT, listener);
  };
}
