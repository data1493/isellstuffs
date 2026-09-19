/**
 * I will not bold it — two weights. Almost bold stays almost. Still tote.
 *
 * Foundry is two weights. Slant is no italic. Icons is no restroom
 * glyphs. Court / hint / install were killed. Walkers still want
 * Beats to throw a Bold, or “make it a family.” I will not bold it.
 * Two weights. Almost bold stays almost. Still for sale.
 * Not foundry. Not slant. Not icons.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bold-listing-ids` is the client bold set.
 * Cookie `iss-bold-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foundry, slant, icons, typeset, norm, copy, grid,
 * tray, family, weight, black, hint, kern, court, map, install,
 * host, woff, look, ask, hands, van, firm, packed, sold, file-gone,
 * gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * take a third weight. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const BOLD_STORAGE_KEY = "iss:bold-listing-ids";
export const BOLD_COOKIE_NAME = "iss-bold-listing-ids";
export const BOLD_CHANGED_EVENT = "iss:bold-changed";

export const BOLD_REFUSE_COPY = "That one does not take a bold note.";
export const BOLD_TABLE_LINE = "I will not bold it.";
export const BOLD_WEIGHTS_LINE = "Two weights.";
export const BOLD_ALMOST_LINE = "Almost bold stays almost.";
export const BOLD_NOTICE_TITLE =
  "I will not bold it. Two weights. Almost bold stays almost.";
export const BOLD_WALK_LINE =
  "Walkers still want Beats to throw a Bold, or make it a family.";
export const BOLD_FOUNDRY_LINE = "Foundry is two weights.";
export const BOLD_STILL_LINE = "Still tote. Not foundry. Not slant. Not icons.";
export const BOLD_TOTE_LINE = "Add to tote still works.";
export const BOLD_EMPTY_LINE = "Nobody taped the bold note yet.";

const SERVER_STORE = Symbol.for("iss.bold-listing-ids");

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

export function parseBoldListingIds(raw: string | null | undefined): string[] {
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

export function boldCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BOLD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOLD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BOLD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOLD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BOLD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBoldListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBoldListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BOLD_STORAGE_KEY);
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
          window.localStorage.setItem(BOLD_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBoldListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = boldCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BOLD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BOLD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BOLD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBoldOverlay(
  listingId: string,
  listingIds: readonly string[] = readBoldListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeBold(listing: Listing | undefined): listing is Listing {
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

export type BoldWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type BoldWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: BoldWriteReason; listingIds: string[] };

function refuseBold(
  listing: Listing | undefined,
  listingIds: string[],
): BoldWriteResult | null {
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

export function markListingBold(
  listing: Listing | undefined,
  listingIds: string[],
): BoldWriteResult {
  const refused = refuseBold(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingBold(
  listing: Listing | undefined,
  listingIds: string[],
): BoldWriteResult {
  const refused = refuseBold(listing, listingIds);
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

export function subscribeBold(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BOLD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BOLD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOLD_CHANGED_EVENT, listener);
  };
}
