/**
 * The radio edit stays — still SUMMER 93. Still tote.
 *
 * Splice is no talkover cut. Bake is no oven. Hiss stays.
 * Rip is no WAV. Songs is no titles. Recut / album-cut were
 * killed. Walkers still want Sunday Crate to hand the album
 * version, or “give me the real first song.” The radio edit
 * stays. Still SUMMER 93. Not splice. Not a dub shop. Not hiss.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:radio-listing-ids` is the client radio set.
 * Cookie `iss-radio-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write splice, bake, hiss, rip, songs, year, warp, inners,
 * grease, album, cut, look, ask, hands, van, firm, packed, sold,
 * file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a liner PDF does
 * not take a radio edit. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RADIO_STORAGE_KEY = "iss:radio-listing-ids";
export const RADIO_COOKIE_NAME = "iss-radio-listing-ids";
export const RADIO_CHANGED_EVENT = "iss:radio-changed";

export const RADIO_REFUSE_COPY = "That one is not a radio edit.";
export const RADIO_TABLE_LINE = "The radio edit stays.";
export const RADIO_SUMMER_LINE = "Still SUMMER 93.";
export const RADIO_NOTICE_TITLE = "The radio edit stays. Still SUMMER 93.";
export const RADIO_WALK_LINE =
  "Walkers still want Sunday Crate to hand the album version, or give them the real first song.";
export const RADIO_STAYS_LINE = "This is the radio note. Still SUMMER 93.";
export const RADIO_STILL_LINE = "Still tote. Not splice. Not a dub shop. Not hiss.";
export const RADIO_TOTE_LINE = "Add to tote still works.";
export const RADIO_EMPTY_LINE = "Nobody taped the radio edit yet.";

const SERVER_STORE = Symbol.for("iss.radio-listing-ids");

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

export function parseRadioListingIds(raw: string | null | undefined): string[] {
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

export function radioCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RADIO_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RADIO_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RADIO_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RADIO_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RADIO_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRadioListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRadioListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RADIO_STORAGE_KEY);
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
          window.localStorage.setItem(RADIO_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRadioListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = radioCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RADIO_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RADIO_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RADIO_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRadioOverlay(
  listingId: string,
  listingIds: readonly string[] = readRadioListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeRadio(listing: Listing | undefined): listing is Listing {
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

export type RadioWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type RadioWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: RadioWriteReason; listingIds: string[] };

function refuseRadio(
  listing: Listing | undefined,
  listingIds: string[],
): RadioWriteResult | null {
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

export function markListingRadio(
  listing: Listing | undefined,
  listingIds: string[],
): RadioWriteResult {
  const refused = refuseRadio(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingRadio(
  listing: Listing | undefined,
  listingIds: string[],
): RadioWriteResult {
  const refused = refuseRadio(listing, listingIds);
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

export function subscribeRadio(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RADIO_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RADIO_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RADIO_CHANGED_EVENT, listener);
  };
}
