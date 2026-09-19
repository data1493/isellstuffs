/**
 * I will not polish — BEATS 07 CD-R scratch refusal. Still tote.
 *
 * Zip is the leftover jewel. Ink is the Sharpie. Plays is I spun
 * it once. Scratch / nick was killed as a vinyl groove. Walkers
 * still want Beats to polish BEATS 07, or “make the scratch go.”
 * I will not polish. Scratched, plays. Still for sale. Not ink.
 * Not a polish shop. Not zip.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:polish-listing-ids` is the client polish set.
 * Cookie `iss-polish-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write zip, ink, plays, book, cases, loop, slant, burn, stick,
 * dust, skip, vg, buff, brasso, scratch, nick, film, look, ask, hands,
 * van, firm, packed, sold, file-gone, gift, buy, digital eligibility,
 * or tote keys.
 * Gift listings and digital files are refused — a sample-pack zip is
 * not a CD-R. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const POLISH_STORAGE_KEY = "iss:polish-listing-ids";
export const POLISH_COOKIE_NAME = "iss-polish-listing-ids";
export const POLISH_CHANGED_EVENT = "iss:polish-changed";

export const POLISH_REFUSE_COPY = "That one does not take polish.";
export const POLISH_TABLE_LINE = "I will not polish.";
export const POLISH_SCRATCH_LINE = "Scratched, plays.";
export const POLISH_NOTICE_TITLE = "I will not polish. Scratched, plays.";
export const POLISH_ZIP_LINE = "Zip is the leftover jewel. Ink is the Sharpie.";
export const POLISH_PLAYS_LINE = "Plays is I spun it once.";
export const POLISH_WALK_LINE = "Walkers still want Beats to make the scratch go.";
export const POLISH_STAYS_LINE = "This is the polish refusal.";
export const POLISH_STILL_LINE = "Still tote. Not ink. Not a polish shop. Not zip.";
export const POLISH_TOTE_LINE = "Add to tote still works.";
export const POLISH_EMPTY_LINE = "Nobody taped a polish refusal yet.";

const SERVER_STORE = Symbol.for("iss.polish-listing-ids");

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

export function parsePolishListingIds(raw: string | null | undefined): string[] {
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

export function polishCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const POLISH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${POLISH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(POLISH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(POLISH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${POLISH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePolishListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPolishListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(POLISH_STORAGE_KEY);
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
          window.localStorage.setItem(POLISH_STORAGE_KEY, JSON.stringify(ids));
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

export function writePolishListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = polishCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(POLISH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${POLISH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(POLISH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPolishOverlay(
  listingId: string,
  listingIds = readPolishListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapePolish(listing: Listing | undefined): listing is Listing {
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

export type PolishWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type PolishWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: PolishWriteReason; listingIds: string[] };

function refusePolish(
  listing: Listing | undefined,
  listingIds: string[],
): PolishWriteResult | null {
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

export function markListingPolish(
  listing: Listing | undefined,
  listingIds: string[],
): PolishWriteResult {
  const refused = refusePolish(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingPolish(
  listing: Listing | undefined,
  listingIds: string[],
): PolishWriteResult {
  const refused = refusePolish(listing, listingIds);
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

export function subscribePolish(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === POLISH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(POLISH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(POLISH_CHANGED_EVENT, listener);
  };
}
