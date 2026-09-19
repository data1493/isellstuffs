/**
 * I will not variable it — two weights. Still almost-bold. Still tote.
 *
 * Foundry is two weights. Slant is no italic. Bold is no third weight.
 * Icons is no restroom glyphs. Walkers still want Beats to interpolate
 * the axes, or “make it a variable font.” I will not variable it. Two
 * weights. Still almost-bold. Still for sale. Not foundry. Not slant.
 * Not bold.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:variable-listing-ids` is the client variable set.
 * Cookie `iss-variable-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foundry, slant, bold, icons, hint, typeset, crush,
 * gift, buy, digital eligibility, or tote keys.
 * Gift listings and physical rows are refused — a Game Boy does not
 * take a variable axis. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const VARIABLE_STORAGE_KEY = "iss:variable-listing-ids";
export const VARIABLE_COOKIE_NAME = "iss-variable-listing-ids";
export const VARIABLE_CHANGED_EVENT = "iss:variable-changed";

export const VARIABLE_REFUSE_COPY = "That one does not take a variable note.";
export const VARIABLE_TABLE_LINE = "I will not variable it.";
export const VARIABLE_WEIGHTS_LINE = "Two weights.";
export const VARIABLE_ALMOST_LINE = "Still almost-bold.";
export const VARIABLE_NOTICE_TITLE =
  "I will not variable it. Two weights. Still almost-bold.";
export const VARIABLE_WALK_LINE =
  "Walkers still want Beats to interpolate the axes, or make it a variable font.";
export const VARIABLE_STAYS_LINE =
  "This is the variable note. I will not variable it. Two weights. Still almost-bold.";
export const VARIABLE_STILL_LINE =
  "Still tote. Not foundry. Not slant. Not bold.";
export const VARIABLE_TOTE_LINE = "Add to tote still works.";
export const VARIABLE_EMPTY_LINE = "Nobody taped a variable note yet.";
export const VARIABLE_LEAVE_LINE = "Leave the two weights";

const SERVER_STORE = Symbol.for("iss.variable-listing-ids");

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

export function parseVariableListingIds(
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

export function variableCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VARIABLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VARIABLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VARIABLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VARIABLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VARIABLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVariableListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVariableListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VARIABLE_STORAGE_KEY);
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
          window.localStorage.setItem(
            VARIABLE_STORAGE_KEY,
            JSON.stringify(ids),
          );
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

export function writeVariableListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = variableCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VARIABLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VARIABLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VARIABLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVariableOverlay(
  listingId: string,
  listingIds: readonly string[] = readVariableListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeVariable(
  listing: Listing | undefined,
): listing is Listing {
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

export type VariableWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

function refuseVariable(
  listing: Listing | undefined,
): VariableWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingVariable(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVariable(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingVariable(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVariable(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeVariable(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VARIABLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VARIABLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VARIABLE_CHANGED_EVENT, listener);
  };
}
