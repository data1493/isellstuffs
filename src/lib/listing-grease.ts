/**
 * The grease stays — still readable. Still tote.
 *
 * Cards is I will not type them. Vibe is cups are vibes.
 * Double is I will not scale. Scan is the paper↔file mate.
 * Fillable / consult were killed. Mins is no minutes.
 * Walkers still want Sink Drawer to wipe the grease off the
 * cards, or “make a clean scan.” The grease stays. Still
 * readable. Not cards. Not a shop wipe. Not mins.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:grease-listing-ids` is the client grease set.
 * Cookie `iss-grease-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cards, vibe, double, scan, mins, grid, dishes, foil,
 * wipe, stain, form, fields, blanks, look, ask, hands, van, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a mug is not a
 * scan wipe. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GREASE_STORAGE_KEY = "iss:grease-listing-ids";
export const GREASE_COOKIE_NAME = "iss-grease-listing-ids";
export const GREASE_CHANGED_EVENT = "iss:grease-changed";

export const GREASE_REFUSE_COPY = "That one does not take a grease note.";
export const GREASE_TABLE_LINE = "The grease stays.";
export const GREASE_READABLE_LINE = "Still readable.";
export const GREASE_NOTICE_TITLE = "The grease stays. Still readable.";
export const GREASE_WALK_LINE =
  "Walkers still want Sink Drawer to wipe the grease off the cards, or make a clean scan.";
export const GREASE_CARDS_LINE =
  "Cards is I will not type them. Vibe is cups are vibes.";
export const GREASE_STILL_LINE = "Still tote. Not cards. Not a shop wipe. Not mins.";
export const GREASE_TOTE_LINE = "Add to tote still works.";
export const GREASE_EMPTY_LINE = "Nobody taped the grease note yet.";

const SERVER_STORE = Symbol.for("iss.grease-listing-ids");

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

export function parseGreaseListingIds(raw: string | null | undefined): string[] {
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

export function greaseCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GREASE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GREASE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GREASE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GREASE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GREASE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGreaseListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGreaseListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GREASE_STORAGE_KEY);
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
          window.localStorage.setItem(GREASE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGreaseListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = greaseCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GREASE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GREASE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GREASE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGreaseOverlay(
  listingId: string,
  listingIds: readonly string[] = readGreaseListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeGrease(listing: Listing | undefined): listing is Listing {
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

export type GreaseWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type GreaseWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: GreaseWriteReason; listingIds: string[] };

function refuseGrease(
  listing: Listing | undefined,
  listingIds: string[],
): GreaseWriteResult | null {
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

export function markListingGrease(
  listing: Listing | undefined,
  listingIds: string[],
): GreaseWriteResult {
  const refused = refuseGrease(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingGrease(
  listing: Listing | undefined,
  listingIds: string[],
): GreaseWriteResult {
  const refused = refuseGrease(listing, listingIds);
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

export function subscribeGrease(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GREASE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GREASE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GREASE_CHANGED_EVENT, listener);
  };
}
