/**
 * I kept the good laces — pair honesty. Still tote.
 *
 * Sneakers on the table. The nice laces stayed home (in the van).
 * Not van restock. Not a pair with. Size is the jacket tag.
 *
 * Shape: JSON object `{ [Listing.id]: { note, at } }` from `@/lib/commerce`.
 * localStorage key `iss:listing-laces` is the client cork.
 * Cookie `iss-listing-laces` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write van, with, size, wrap, poly, fits, plays, smoke, pockets,
 * press, look, ask, hands, firm, heavy, packed, sold, file-gone, or tote keys.
 * Gift listings and digital files are refused — a PDF does not wear laces.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const LACES_STORAGE_KEY = "iss:listing-laces";
export const LACES_COOKIE_NAME = "iss-listing-laces";
export const LACES_CHANGED_EVENT = "iss:listing-laces-changed";

export const LACES_NOTE_MAX = 140;

export const LACES_REFUSE_COPY = "That one is not a laces note.";
export const LACES_TABLE_LINE = "I kept the good laces.";
export const LACES_HOME_LINE =
  "The sneakers are on the table. The nice laces stayed home.";
export const LACES_VAN_LINE = "Not van restock. Not a pair with.";
export const LACES_STILL_LINE = "Still a pair. Still tote.";
export const LACES_TOTE_LINE = "Add to tote still works.";
export const LACES_EMPTY_LINE = "Nobody taped the good laces yet.";
export const LACES_EMPTY_TAPE =
  "Say you kept the good laces or leave the pair.";
export const LACES_PAPER_LINE =
  "I kept the good laces. These are the beat originals. The nice pair stayed in the van.";
export const LACES_SIZE_LINE =
  "Size is the jacket tag. This is the pair on the table.";

export type ListingLacesNote = {
  note: string;
  at: string;
};

export type ListingLacesMap = Record<string, ListingLacesNote>;

export type LacesWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "empty";

export type LacesWriteResult =
  | { ok: true; map: ListingLacesMap }
  | { ok: false; reason: LacesWriteReason; map: ListingLacesMap };

const SERVER_STORE = Symbol.for("iss.listing-laces");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: ListingLacesMap;
};

const emptyMap: ListingLacesMap = {};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isNote(value: unknown): value is ListingLacesNote {
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

export function normalizeListingLacesNote(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, LACES_NOTE_MAX);
}

export function parseListingLaces(
  raw: string | null | undefined,
): ListingLacesMap {
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
    const next: ListingLacesMap = {};
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
        note: normalizeListingLacesNote(note.note),
        at: note.at,
      };
    }
    return Object.keys(next).length === 0 ? emptyMap : next;
  } catch {
    return emptyMap;
  }
}

export function serializeListingLaces(map: ListingLacesMap) {
  return JSON.stringify(map);
}

export function listingLacesCookieValue(map: ListingLacesMap): string {
  return serializeListingLaces(map);
}

export const LACES_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LACES_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(v&&v.charAt(0)==="{"){localStorage.setItem(${JSON.stringify(LACES_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LACES_CHANGED_EVENT)}));}}}catch(e){}`;

export function listingLacesFor(
  listingId: string,
  map: ListingLacesMap = emptyMap,
): ListingLacesNote | undefined {
  return map[listingId];
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeLaces(listing: Listing | undefined): listing is Listing {
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

function refuseLaces(
  listing: Listing | undefined,
  map: ListingLacesMap,
): LacesWriteResult | null {
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

export function tapeListingLaces(
  listing: Listing | undefined,
  map: ListingLacesMap,
  raw: string,
  at = new Date(),
): LacesWriteResult {
  const refused = refuseLaces(listing, map);
  if (refused) {
    return refused;
  }
  const note = normalizeListingLacesNote(raw);
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

export function clearListingLaces(
  listing: Listing | undefined,
  map: ListingLacesMap,
): LacesWriteResult {
  const refused = refuseLaces(listing, map);
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

export function mergeListingLacesMaps(
  ...maps: ListingLacesMap[]
): ListingLacesMap {
  const next: ListingLacesMap = {};
  for (const map of maps) {
    for (const [listingId, note] of Object.entries(map)) {
      next[listingId] = note;
    }
  }
  return Object.keys(next).length === 0 ? emptyMap : next;
}

function serverStore(): ListingLacesMap {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyMap;
}

export function readListingLaces(): ListingLacesMap {
  if (canUseStorage()) {
    try {
      const fromStorage = parseListingLaces(
        window.localStorage.getItem(LACES_STORAGE_KEY),
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

export function writeListingLaces(map: ListingLacesMap) {
  const next = Object.keys(map).length === 0 ? emptyMap : map;
  const raw = listingLacesCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LACES_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LACES_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    window.dispatchEvent(new Event(LACES_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
}

export function subscribeListingLaces(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LACES_STORAGE_KEY || event.key === null) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LACES_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LACES_CHANGED_EVENT, listener);
  };
}
