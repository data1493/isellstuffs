/**
 * I will not double it — recipe scans stay three cards. Still tote.
 *
 * Vibe is cups are vibes. Cards is I will not type them.
 * Clip is the binder that walked. Grease was killed as a wipe.
 * Walkers still want Sink Drawer to scale the cards, or
 * “double it for a crowd.” I will not double it. Three cards.
 * Vibes. Still for sale. Not vibe. Not a cookbook desk. Not cards.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:double-listing-ids` is the client double set.
 * Cookie `iss-double-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write vibe, cards, clip, glass, whose, pour, grease, yield,
 * scale, folder, tested-kinda, grade, stems, foundry, convert,
 * film, look, ask, hands, van, firm, packed, sold, file-gone, gift,
 * buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a mug is not a
 * recipe yield. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const DOUBLE_STORAGE_KEY = "iss:double-listing-ids";
export const DOUBLE_COOKIE_NAME = "iss-double-listing-ids";
export const DOUBLE_CHANGED_EVENT = "iss:double-changed";

export const DOUBLE_REFUSE_COPY = "That one does not take a double.";
export const DOUBLE_TABLE_LINE = "I will not double it.";
export const DOUBLE_CARDS_LINE = "Three cards. Vibes.";
export const DOUBLE_NOTICE_TITLE = "I will not double it. Three cards. Vibes.";
export const DOUBLE_VIBE_LINE =
  "Vibe is cups are vibes. Cards is I will not type them.";
export const DOUBLE_CLIP_LINE = "Clip is the binder that walked.";
export const DOUBLE_STILL_LINE =
  "Still tote. Not vibe. Not a cookbook desk. Not cards.";
export const DOUBLE_TOTE_LINE = "Add to tote still works.";
export const DOUBLE_EMPTY_LINE = "Nobody taped the double yet.";

const SERVER_STORE = Symbol.for("iss.double-listing-ids");

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

export function parseDoubleListingIds(raw: string | null | undefined): string[] {
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

export function doubleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DOUBLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DOUBLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DOUBLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DOUBLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DOUBLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDoubleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDoubleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DOUBLE_STORAGE_KEY);
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
          window.localStorage.setItem(DOUBLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDoubleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = doubleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DOUBLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DOUBLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DOUBLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDoubleOverlay(
  listingId: string,
  listingIds = readDoubleListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeDouble(listing: Listing | undefined): listing is Listing {
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

export type DoubleWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type DoubleWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: DoubleWriteReason; listingIds: string[] };

function refuseDouble(
  listing: Listing | undefined,
  listingIds: string[],
): DoubleWriteResult | null {
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

export function markListingDouble(
  listing: Listing | undefined,
  listingIds: string[],
): DoubleWriteResult {
  const refused = refuseDouble(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingDouble(
  listing: Listing | undefined,
  listingIds: string[],
): DoubleWriteResult {
  const refused = refuseDouble(listing, listingIds);
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

export function subscribeDouble(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DOUBLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DOUBLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DOUBLE_CHANGED_EVENT, listener);
  };
}
