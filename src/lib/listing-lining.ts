/**
 * I don’t have a lining — the windbreaker stays a shell. Still tote.
 *
 * Spray is no Scotchgard. Wash is I washed it. Smoke is the car.
 * Size is the lying tag. Sew is not a tailor. Verso is liner notes,
 * not a jacket. Walkers still want Closet to throw a lining in the
 * windbreaker, or “make it warm.” I don’t have a lining. Shell only.
 * Still a jacket. Still for sale. Not spray. Not sew. Not verso.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:lining-listing-ids` is the client lining set.
 * Cookie `iss-lining-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a recipe scan is not a jacket.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const LINING_STORAGE_KEY = "iss:lining-listing-ids";
export const LINING_COOKIE_NAME = "iss-lining-listing-ids";
export const LINING_CHANGED_EVENT = "iss:lining-changed";

export const LINING_REFUSE_COPY = "That one does not take a lining.";
export const LINING_TABLE_LINE = "I don’t have a lining.";
export const LINING_SHELL_LINE = "Shell only.";
export const LINING_JACKET_LINE = "Still a jacket.";
export const LINING_NOTICE_TITLE =
  "I don’t have a lining. Shell only. Still a jacket.";
export const LINING_WALK_LINE =
  "Walkers still want Closet to throw a lining in the windbreaker, or make it warm.";
export const LINING_STAYS_LINE =
  "This is the lining note. Shell only. Still a jacket.";
export const LINING_STILL_LINE = "Still tote. Not spray. Not sew. Not verso.";
export const LINING_TOTE_LINE = "Add to tote still works.";
export const LINING_EMPTY_LINE = "Nobody taped a lining note yet.";

const SERVER_STORE = Symbol.for("iss.lining-listing-ids");

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

export function parseLiningListingIds(raw: string | null | undefined): string[] {
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

export function liningCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LINING_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LINING_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LINING_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LINING_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LINING_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLiningListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLiningListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LINING_STORAGE_KEY);
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
          window.localStorage.setItem(LINING_STORAGE_KEY, JSON.stringify(ids));
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

export function writeLiningListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = liningCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LINING_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LINING_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LINING_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLiningOverlay(
  listingId: string,
  listingIds = readLiningListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeLining(listing: Listing | undefined): listing is Listing {
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

export type LiningWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type LiningWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: LiningWriteReason; listingIds: string[] };

function refuseLining(
  listing: Listing | undefined,
  listingIds: string[],
): LiningWriteResult | null {
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

export function markListingLining(
  listing: Listing | undefined,
  listingIds: string[],
): LiningWriteResult {
  const refused = refuseLining(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingLining(
  listing: Listing | undefined,
  listingIds: string[],
): LiningWriteResult {
  const refused = refuseLining(listing, listingIds);
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

export function subscribeLining(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LINING_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LINING_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LINING_CHANGED_EVENT, listener);
  };
}
