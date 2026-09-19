/**
 * I will not time it — the recipe scans stay untimed. Still tote.
 *
 * Vibe is cups are vibes. Double is I will not scale. Cards is I
 * will not type them. Grease / fillable were killed. Walkers still
 * want Sink Drawer to put minutes on the cards, or “tell me how
 * long.” I will not time it. No minutes. Still for sale. Not vibe.
 * Not double. Not cards.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:mins-listing-ids` is the client mins set.
 * Cookie `iss-mins-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write vibe, cards, clip, double, cap, vent, tines, dishes,
 * hours, timer, grease, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Physical listings and gift cards are refused — a mug is not a
 * kitchen timer. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const MINS_STORAGE_KEY = "iss:mins-listing-ids";
export const MINS_COOKIE_NAME = "iss-mins-listing-ids";
export const MINS_CHANGED_EVENT = "iss:mins-changed";

export const MINS_REFUSE_COPY = "That one does not take minutes.";
export const MINS_TABLE_LINE = "I will not time it.";
export const MINS_MINUTES_LINE = "No minutes.";
export const MINS_NOTICE_TITLE = "I will not time it. No minutes.";
export const MINS_VIBE_LINE = "Vibe is cups are vibes. Double is I will not scale.";
export const MINS_CARDS_LINE = "Cards is I will not type them.";
export const MINS_WALK_LINE =
  "Walkers still want minutes on the cards, or tell me how long.";
export const MINS_STILL_LINE = "Still tote. Not vibe. Not double. Not cards.";
export const MINS_TOTE_LINE = "Add to tote still works.";
export const MINS_EMPTY_LINE = "Nobody taped the minutes yet.";

const SERVER_STORE = Symbol.for("iss.mins-listing-ids");

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

export function parseMinsListingIds(raw: string | null | undefined): string[] {
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

export function minsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const MINS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${MINS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(MINS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(MINS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${MINS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseMinsListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readMinsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(MINS_STORAGE_KEY);
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
          window.localStorage.setItem(MINS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeMinsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = minsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(MINS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${MINS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(MINS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingMinsOverlay(
  listingId: string,
  listingIds = readMinsListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeMins(listing: Listing | undefined): listing is Listing {
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

export type MinsWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type MinsWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: MinsWriteReason; listingIds: string[] };

function refuseMins(
  listing: Listing | undefined,
  listingIds: string[],
): MinsWriteResult | null {
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

export function markListingMins(
  listing: Listing | undefined,
  listingIds: string[],
): MinsWriteResult {
  const refused = refuseMins(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingMins(
  listing: Listing | undefined,
  listingIds: string[],
): MinsWriteResult {
  const refused = refuseMins(listing, listingIds);
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

export function subscribeMins(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === MINS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(MINS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MINS_CHANGED_EVENT, listener);
  };
}
