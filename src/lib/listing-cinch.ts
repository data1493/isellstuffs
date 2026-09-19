/**
 * I will not cinch it — the windbreaker stays pits and a hopeful L.
 * Still tote.
 *
 * Wash is I washed it. Spray is no Scotchgard. Lining is the shell.
 * Hood is no hood. Size is the lying tag. Stitch is the split-sole
 * pair, not this jacket. Walkers still want Closet to cinch the
 * waist, or “make it a real M.” I will not cinch it. Still pits.
 * Still a hopeful L. Still for sale. Not wash. Not spray. Not lining.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cinch-listing-ids` is the client cinch set.
 * Cookie `iss-cinch-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write wash, spray, lining, hood, elastic, scent, cream,
 * stitch, ferrite, variable, finalize, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a LUT does not
 * take a cinch. Sneakers stay on stitch. Fixture `sold` / `file-gone`
 * rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const CINCH_STORAGE_KEY = "iss:cinch-listing-ids";
export const CINCH_COOKIE_NAME = "iss-cinch-listing-ids";
export const CINCH_CHANGED_EVENT = "iss:cinch-changed";

export const CINCH_HOST_ID = "clo-windbreaker";
export const CINCH_SNEAKER_ID = "clo-split-soles";

export const CINCH_REFUSE_COPY = "That one does not take a cinch note.";
export const CINCH_TABLE_LINE = "I will not cinch it.";
export const CINCH_PITS_LINE = "Still pits.";
export const CINCH_SIZE_LINE = "Still a hopeful L.";
export const CINCH_NOTICE_TITLE =
  "I will not cinch it. Still pits. Still a hopeful L.";
export const CINCH_WALK_LINE =
  "Walkers still want Closet to cinch the waist, or make it a real M.";
export const CINCH_STAYS_LINE =
  "This is the cinch note. I will not cinch it. Still pits. Still a hopeful L.";
export const CINCH_STILL_LINE = "Still tote. Not wash. Not spray. Not lining.";
export const CINCH_TOTE_LINE = "Add to tote still works.";
export const CINCH_EMPTY_LINE = "Nobody taped a cinch note yet.";
export const CINCH_LEAVE_LINE = "Leave the waist";

const SERVER_STORE = Symbol.for("iss.cinch-listing-ids");

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

export function parseCinchListingIds(
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
    // Reject write-result literals `{ ok, listingIds }` — they 500 the PDP.
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

export function cinchCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CINCH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CINCH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CINCH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CINCH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CINCH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCinchListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCinchListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CINCH_STORAGE_KEY);
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
          window.localStorage.setItem(CINCH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCinchListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = cinchCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CINCH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CINCH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CINCH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCinchOverlay(
  listingId: string,
  listingIds: readonly string[] = readCinchListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === CINCH_SNEAKER_ID;
}

/** Physical unique goods only. Sneakers, digital, gift, sold, and file-gone stay off. */
export function canTapeCinch(listing: Listing | undefined): listing is Listing {
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
  if (isSneakerListing(listing)) {
    return false;
  }
  return true;
}

export type CinchWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "owned";

function refuseCinch(
  listing: Listing | undefined,
): CinchWriteReason | null {
  if (!listing) {
    return "missing";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isSneakerListing(listing)) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCinch(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCinch(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCinch(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCinch(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCinch(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CINCH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CINCH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CINCH_CHANGED_EVENT, listener);
  };
}
