/**
 * I will not wind it — still hiss. Still a radio edit. Still tote.
 *
 * Hiss is the tape. Bake is no oven. Splice is no talkover.
 * Radio is the radio edit. Cue / rewind were killed as hiss twins.
 * Walkers still want Sunday Crate to wind the cassette, or “start
 * at the first song.” I will not wind it. Still hiss. Still a radio
 * edit. Still for sale. Not hiss. Not a deck. Not radio.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:wind-listing-ids` is the client wind set.
 * Cookie `iss-wind-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, bake, splice, radio, warp, etch, year, cue,
 * rewind, ff, deck, spider, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a liner PDF does not
 * take a wind. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const WIND_STORAGE_KEY = "iss:wind-listing-ids";
export const WIND_COOKIE_NAME = "iss-wind-listing-ids";
export const WIND_CHANGED_EVENT = "iss:wind-changed";

export const WIND_REFUSE_COPY = "That one does not take a wind note.";
export const WIND_TABLE_LINE = "I will not wind it.";
export const WIND_HISS_LINE = "Still hiss.";
export const WIND_RADIO_LINE = "Still a radio edit.";
export const WIND_NOTICE_TITLE =
  "I will not wind it. Still hiss. Still a radio edit.";
export const WIND_WALK_LINE =
  "Walkers still want Sunday Crate to wind the cassette, or start at the first song.";
export const WIND_STAYS_LINE =
  "This is the wind note. I will not wind it. Still hiss. Still a radio edit.";
export const WIND_STILL_LINE = "Still tote. Not hiss. Not a deck. Not radio.";
export const WIND_TOTE_LINE = "Add to tote still works.";
export const WIND_EMPTY_LINE = "Nobody taped a wind note yet.";
export const WIND_LEAVE_LINE = "Leave the hiss";

const SERVER_STORE = Symbol.for("iss.wind-listing-ids");

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

export function parseWindListingIds(raw: string | null | undefined): string[] {
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

export function windCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WIND_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WIND_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WIND_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WIND_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WIND_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWindListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWindListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WIND_STORAGE_KEY);
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
          window.localStorage.setItem(WIND_STORAGE_KEY, JSON.stringify(ids));
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

export function writeWindListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = windCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WIND_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WIND_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WIND_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWindOverlay(
  listingId: string,
  listingIds: readonly string[] = readWindListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeWind(listing: Listing | undefined): listing is Listing {
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

export type WindWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type WindWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: WindWriteReason; listingIds: string[] };

function refuseWind(
  listing: Listing | undefined,
  listingIds: string[],
): WindWriteResult | null {
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

export function markListingWind(
  listing: Listing | undefined,
  listingIds: string[],
): WindWriteResult {
  const refused = refuseWind(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingWind(
  listing: Listing | undefined,
  listingIds: string[],
): WindWriteResult {
  const refused = refuseWind(listing, listingIds);
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

export function subscribeWind(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WIND_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WIND_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WIND_CHANGED_EVENT, listener);
  };
}
