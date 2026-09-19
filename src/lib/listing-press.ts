/**
 * Which press — sleeve paper. Still for sale.
 *
 * Scan is a file mate. This is the pressing on the $9 LP.
 * Not a first press. Not two titles. Still baggable.
 *
 * Shape: JSON object `{ [Listing.id]: { note, at } }` from `@/lib/commerce`.
 * localStorage key `iss:listing-press` is the client cork.
 * Cookie `iss-listing-press` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write scan, with, pockets, shade, film, parts, as-is, tote,
 * look, ask, hands, van, firm, heavy, packed, sold, file-gone, or gift keys.
 * Gift listings and digital files are refused — a PDF has no press.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const PRESS_STORAGE_KEY = "iss:listing-press";
export const PRESS_COOKIE_NAME = "iss-listing-press";
export const PRESS_CHANGED_EVENT = "iss:listing-press-changed";

export const PRESS_NOTE_MAX = 140;

export const PRESS_REFUSE_COPY = "That one is not a press check.";
export const PRESS_TABLE_LINE = "Which press.";
export const PRESS_STILL_LINE = "Still for sale. Not a first press. Not a scan mate.";
export const PRESS_TOTE_LINE = "Add to tote still works.";
export const PRESS_SCAN_LINE = "Scan is a file mate. This is the sleeve.";
export const PRESS_EMPTY_LINE = "Nobody taped which press yet.";
export const PRESS_EMPTY_TAPE = "Say which press or leave the sleeve.";
export const PRESS_PAPER_LINE =
  "Which press. The $9 LP is not a first press. Not a scan mate.";

export type ListingPressNote = {
  note: string;
  at: string;
};

export type ListingPressMap = Record<string, ListingPressNote>;

export type PressWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "empty";

export type PressWriteResult =
  | { ok: true; map: ListingPressMap }
  | { ok: false; reason: PressWriteReason; map: ListingPressMap };

const SERVER_STORE = Symbol.for("iss.listing-press");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: ListingPressMap;
};

const emptyMap: ListingPressMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is ListingPressNote {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.note === "string" &&
    row.note.trim().length > 0 &&
    typeof row.at === "string"
  );
}

export function normalizeListingPressNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, PRESS_NOTE_MAX);
}

export function parseListingPress(raw: string | null | undefined): ListingPressMap {
  if (!raw) {
    return emptyMap;
  }

  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return emptyMap;
    }
    const next: ListingPressMap = {};
    for (const [listingId, note] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof listingId !== "string" || listingId.length === 0) {
        continue;
      }
      if (!isNote(note)) {
        continue;
      }
      next[listingId] = {
        note: normalizeListingPressNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeListingPress(map: ListingPressMap) {
  return JSON.stringify(map);
}

export function listingPressCookieValue(map: ListingPressMap): string {
  return serializeListingPress(map);
}

export const PRESS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PRESS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(PRESS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PRESS_CHANGED_EVENT)}));}}}catch(e){}`;

export function listingPressFor(
  listingId: string,
  map: ListingPressMap = emptyMap,
): ListingPressNote | undefined {
  return map[listingId];
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapePress(listing: Listing | undefined): listing is Listing {
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

function refusePress(
  listing: Listing | undefined,
  map: ListingPressMap,
): PressWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", map };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", map };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "sold", map };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", map };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", map };
  }
  return null;
}

export function tapeListingPress(
  listing: Listing | undefined,
  map: ListingPressMap,
  raw: string,
  at = new Date(),
): PressWriteResult {
  const refused = refusePress(listing, map);
  if (refused) {
    return refused;
  }
  const note = normalizeListingPressNote(raw);
  if (!note) {
    return { ok: false, reason: "empty", map };
  }
  return {
    ok: true,
    map: {
      ...map,
      [listing!.id]: { note, at: at.toISOString() },
    },
  };
}

export function clearListingPress(
  listing: Listing | undefined,
  map: ListingPressMap,
): PressWriteResult {
  const refused = refusePress(listing, map);
  if (refused) {
    return refused;
  }
  if (!(listing!.id in map)) {
    return { ok: true, map };
  }
  const next = { ...map };
  delete next[listing!.id];
  return { ok: true, map: next };
}

export function mergeListingPressMaps(...maps: ListingPressMap[]): ListingPressMap {
  const next: ListingPressMap = {};
  for (const map of maps) {
    for (const [listingId, note] of Object.entries(map)) {
      next[listingId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

function serverStore(): ListingPressMap {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyMap;
}

export function readListingPress(): ListingPressMap {
  if (canUseStorage()) {
    try {
      const fromStorage = parseListingPress(
        window.localStorage.getItem(PRESS_STORAGE_KEY),
      );
      if (Object.keys(fromStorage).length > 0) {
        return fromStorage;
      }
    } catch {
      // blocked storage
    }
    return emptyMap;
  }

  return serverStore();
}

export function writeListingPress(map: ListingPressMap) {
  const next = Object.keys(map).length === 0 ? emptyMap : map;
  const raw = listingPressCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PRESS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PRESS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    window.dispatchEvent(new Event(PRESS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
}

export function subscribeListingPress(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PRESS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PRESS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PRESS_CHANGED_EVENT, listener);
  };
}
