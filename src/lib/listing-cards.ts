/**
 * I will not type the cards — recipe scans stay scans. Still tote.
 *
 * Vibe is cups are vibes. Clip is the binder that walked.
 * Workbook is no sequel on the junk PDF. Scan is mixtape ↔ liner.
 * Walkers still want Sink Drawer to type a clean cookbook.
 * The cards stay scans. I will not type them. Not a typist.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cards-listing-ids` is the client cards set.
 * Cookie `iss-cards-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write vibe, clip, workbook, scan, folder, tested-kinda,
 * grade, stems, foundry, convert, grease, ocr, type, film, look,
 * ask, hands, van, firm, packed, sold, file-gone, gift, buy,
 * digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a mug is not a
 * scan stack. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const CARDS_STORAGE_KEY = "iss:cards-listing-ids";
export const CARDS_COOKIE_NAME = "iss-cards-listing-ids";
export const CARDS_CHANGED_EVENT = "iss:cards-changed";

export const CARDS_REFUSE_COPY = "That one does not take typed cards.";
export const CARDS_TABLE_LINE = "I will not type them.";
export const CARDS_SCAN_LINE = "The cards stay scans.";
export const CARDS_NOTICE_TITLE = "The cards stay scans. I will not type them.";
export const CARDS_VIBE_LINE =
  "Vibe is cups are vibes. Clip is the binder that walked.";
export const CARDS_STILL_LINE = "Still tote. Not vibe. Not clip. Not a typist.";
export const CARDS_TOTE_LINE = "Add to tote still works.";
export const CARDS_EMPTY_LINE = "Nobody taped the cards yet.";

const SERVER_STORE = Symbol.for("iss.cards-listing-ids");

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

export function parseCardsListingIds(raw: string | null | undefined): string[] {
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

export function cardsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CARDS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CARDS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CARDS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CARDS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CARDS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCardsListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCardsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CARDS_STORAGE_KEY);
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
          window.localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCardsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = cardsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CARDS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CARDS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CARDS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCardsOverlay(
  listingId: string,
  listingIds = readCardsListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeCards(listing: Listing | undefined): listing is Listing {
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

export type CardsWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type CardsWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: CardsWriteReason; listingIds: string[] };

function refuseCards(
  listing: Listing | undefined,
  listingIds: string[],
): CardsWriteResult | null {
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

export function markListingCards(
  listing: Listing | undefined,
  listingIds: string[],
): CardsWriteResult {
  const refused = refuseCards(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingCards(
  listing: Listing | undefined,
  listingIds: string[],
): CardsWriteResult {
  const refused = refuseCards(listing, listingIds);
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

export function subscribeCards(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CARDS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CARDS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CARDS_CHANGED_EVENT, listener);
  };
}
