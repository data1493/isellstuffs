/**
 * I will not dub it — cassette dub honesty. Still tote. Still hiss.
 *
 * Hiss is the tape. Rip is no WAV. Copy is no USB. Wind is cue.
 * Radio is the radio edit. Walkers still want Crate to dub a
 * clean tape, or “copy SUMMER 93.” I will not dub it. Still hiss.
 * Still a radio edit. Not rip. Not a shop. Not wind.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:dub-listing-ids` is the client dub set.
 * Cookie `iss-dub-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, bake, rip, wind, radio, songs, copy, burn,
 * gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a liner PDF
 * does not take a dub. Fixture `sold` / `file-gone` rows stay
 * as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const DUB_STORAGE_KEY = "iss:dub-listing-ids";
export const DUB_COOKIE_NAME = "iss-dub-listing-ids";
export const DUB_CHANGED_EVENT = "iss:dub-changed";

export const DUB_REFUSE_COPY = "That one is not a dub.";
export const DUB_TABLE_LINE = "I will not dub it.";
export const DUB_HISS_LINE = "Still hiss.";
export const DUB_RADIO_LINE = "Still a radio edit.";
export const DUB_NOTICE_TITLE =
  "I will not dub it. Still hiss. Still a radio edit.";
export const DUB_WALK_LINE =
  "Walkers still want Crate to dub a clean tape, or copy SUMMER 93.";
export const DUB_STAYS_LINE =
  "This is the dub note. I will not dub it. Still hiss. Still a radio edit.";
export const DUB_STILL_LINE = "Still tote. Not rip. Not a shop. Not wind.";
export const DUB_TOTE_LINE = "Add to tote still works.";
export const DUB_EMPTY_LINE = "Nobody taped a dub note yet.";
export const DUB_LEAVE_LINE = "Leave the hiss";

const SERVER_STORE = Symbol.for("iss.dub-listing-ids");

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

export function parseDubListingIds(raw: string | null | undefined): string[] {
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

export function dubCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DUB_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DUB_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DUB_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DUB_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DUB_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDubListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDubListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DUB_STORAGE_KEY);
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
          window.localStorage.setItem(DUB_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDubListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = dubCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DUB_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DUB_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DUB_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDubOverlay(
  listingId: string,
  listingIds: readonly string[] = readDubListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeDub(listing: Listing | undefined): listing is Listing {
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

export type DubWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

function refuseDub(
  listing: Listing | undefined,
  listingIds: string[],
): { ok: false; reason: DubWriteReason; listingIds: string[] } | null {
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

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDub(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDub(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDub(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDub(listing, listingIds)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDub(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DUB_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DUB_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DUB_CHANGED_EVENT, listener);
  };
}
