/**
 * I don't rip — cassette transfer honesty. Still tote. No WAV.
 *
 * Hiss is the hiss. Songs is no titles. Scan is the liner PDF pair.
 * This is the cassette. I will not make a WAV. Not hiss. Not a transfer shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:rip-listing-ids` is the client rip set.
 * Cookie `iss-rip-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, songs, scan, stick, burn, print, bpm, claim, dump,
 * phone, name, radio, digitize, wav, plays, skip, book, press, remote,
 * parts, cells, ring, strap, van, lost, pile, grade, wash, cord, bent,
 * shell, heat, cases, fits, film, look, ask, hands, heavy, with, firm,
 * packed, sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a liner PDF is not a tape.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RIP_STORAGE_KEY = "iss:rip-listing-ids";
export const RIP_COOKIE_NAME = "iss-rip-listing-ids";
export const RIP_CHANGED_EVENT = "iss:rip-changed";

export const RIP_REFUSE_COPY = "That one is not a rip.";
export const RIP_TABLE_LINE = "I don't rip. Take the tape.";
export const RIP_HISS_LINE = "Hiss is the hiss.";
export const RIP_SONGS_LINE = "Songs is no titles.";
export const RIP_SCAN_LINE = "Scan is the liner PDF pair.";
export const RIP_TAPE_LINE = "This is the cassette. I will not make a WAV.";
export const RIP_STILL_LINE = "Still tote. Not hiss. Not a transfer shop.";
export const RIP_TOTE_LINE = "Add to tote still works.";
export const RIP_EMPTY_LINE = "Nobody taped the rip yet.";

const SERVER_STORE = Symbol.for("iss.rip-listing-ids");

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

export function parseRipListingIds(raw: string | null | undefined): string[] {
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

export function ripCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RIP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RIP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RIP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RIP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RIP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRipListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRipListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RIP_STORAGE_KEY);
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
          window.localStorage.setItem(RIP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRipListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = ripCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RIP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RIP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RIP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRipOverlay(
  listingId: string,
  listingIds = readRipListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeRip(listing: Listing | undefined): listing is Listing {
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

export type RipWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type RipWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: RipWriteReason; listingIds: string[] };

function refuseRip(
  listing: Listing | undefined,
  listingIds: string[],
): RipWriteResult | null {
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

export function markListingRip(
  listing: Listing | undefined,
  listingIds: string[],
): RipWriteResult {
  const refused = refuseRip(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingRip(
  listing: Listing | undefined,
  listingIds: string[],
): RipWriteResult {
  const refused = refuseRip(listing, listingIds);
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

export function subscribeRip(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RIP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RIP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RIP_CHANGED_EVENT, listener);
  };
}
