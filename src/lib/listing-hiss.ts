/**
 * The hiss stays — the tape already hisses. Still tote.
 *
 * Skip is the LP scratch. Plays is I spun the Sharpie disc.
 * This is the mixtape hiss. Not skip. Not plays.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hiss-listing-ids` is the client hiss set.
 * Cookie `iss-hiss-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write skip, plays, scan, needle, book, press, remote, parts,
 * cells, ring, strap, van, lost, pile, grade, wash, stick, cord, bent,
 * shell, heat, cases, fits, film, look, ask, hands, heavy, with, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not hiss.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const HISS_STORAGE_KEY = "iss:hiss-listing-ids";
export const HISS_COOKIE_NAME = "iss-hiss-listing-ids";
export const HISS_CHANGED_EVENT = "iss:hiss-changed";

export const HISS_REFUSE_COPY = "That one is not a hiss.";
export const HISS_TABLE_LINE = "The hiss stays. That's the cassette.";
export const HISS_TAPE_LINE = "The tape already hisses.";
export const HISS_SKIP_LINE = "Skip is the LP scratch.";
export const HISS_PLAYS_LINE = "Plays is I spun the Sharpie disc.";
export const HISS_STILL_LINE = "Still tote. Not skip. Not a play count.";
export const HISS_TOTE_LINE = "Add to tote still works.";
export const HISS_EMPTY_LINE = "Nobody taped the hiss yet.";

const SERVER_STORE = Symbol.for("iss.hiss-listing-ids");

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

export function parseHissListingIds(raw: string | null | undefined): string[] {
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

export function hissCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HISS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HISS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HISS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HISS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HISS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHissListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHissListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HISS_STORAGE_KEY);
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
          window.localStorage.setItem(HISS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHissListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = hissCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HISS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HISS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HISS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHissOverlay(
  listingId: string,
  listingIds = readHissListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeHiss(listing: Listing | undefined): listing is Listing {
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

export type HissWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type HissWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: HissWriteReason; listingIds: string[] };

function refuseHiss(
  listing: Listing | undefined,
  listingIds: string[],
): HissWriteResult | null {
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

export function markListingHiss(
  listing: Listing | undefined,
  listingIds: string[],
): HissWriteResult {
  const refused = refuseHiss(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingHiss(
  listing: Listing | undefined,
  listingIds: string[],
): HissWriteResult {
  const refused = refuseHiss(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (!listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== listing!.id),
  };
}

export function subscribeHiss(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HISS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HISS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HISS_CHANGED_EVENT, listener);
  };
}
