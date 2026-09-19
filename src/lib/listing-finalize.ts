/**
 * I will not finalize it — the CD-R stays open. Still tote.
 *
 * Polish is the scratch. Ink is the Sharpie. Plays is I spun it
 * once. Contents is no tracklist. Master is the session folder.
 * Walkers still want Beats to close the session, or “make BEATS 07
 * play in a car deck.” I will not finalize it. Still Sharpie. Still
 * scratched. Still for sale. Not polish. Not ink. Not plays.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:finalize-listing-ids` is the client finalize set.
 * Cookie `iss-finalize-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write polish, ink, plays, contents, face, master, tray,
 * gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a sample pack does
 * not take a finalize note. Fixture `sold` / `file-gone` rows stay
 * as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FINALIZE_STORAGE_KEY = "iss:finalize-listing-ids";
export const FINALIZE_COOKIE_NAME = "iss-finalize-listing-ids";
export const FINALIZE_CHANGED_EVENT = "iss:finalize-changed";

export const FINALIZE_REFUSE_COPY = "That one does not take a finalize note.";
export const FINALIZE_TABLE_LINE = "I will not finalize it.";
export const FINALIZE_SHARPIE_LINE = "Still Sharpie.";
export const FINALIZE_SCRATCHED_LINE = "Still scratched.";
export const FINALIZE_NOTICE_TITLE =
  "I will not finalize it. Still Sharpie. Still scratched.";
export const FINALIZE_WALK_LINE =
  "Walkers still want Beats to close the session, or make BEATS 07 play in a car deck.";
export const FINALIZE_STAYS_LINE =
  "This is the finalize note. I will not finalize it. Still Sharpie. Still scratched.";
export const FINALIZE_STILL_LINE = "Still tote. Not polish. Not ink. Not plays.";
export const FINALIZE_TOTE_LINE = "Add to tote still works.";
export const FINALIZE_EMPTY_LINE = "Nobody taped a finalize note yet.";
export const FINALIZE_LEAVE_LINE = "Leave the session";

const SERVER_STORE = Symbol.for("iss.finalize-listing-ids");

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

export function parseFinalizeListingIds(
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

export function finalizeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FINALIZE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FINALIZE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FINALIZE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FINALIZE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FINALIZE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFinalizeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFinalizeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FINALIZE_STORAGE_KEY);
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
            FINALIZE_STORAGE_KEY,
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

export function writeFinalizeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = finalizeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FINALIZE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FINALIZE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FINALIZE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFinalizeOverlay(
  listingId: string,
  listingIds: readonly string[] = readFinalizeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeFinalize(
  listing: Listing | undefined,
): listing is Listing {
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

export type FinalizeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

function refuseFinalize(
  listing: Listing | undefined,
): FinalizeWriteReason | null {
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
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingFinalize(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFinalize(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFinalize(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFinalize(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFinalize(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FINALIZE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FINALIZE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FINALIZE_CHANGED_EVENT, listener);
  };
}
