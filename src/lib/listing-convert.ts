/**
 * I don't convert — the LUT pack stays .cube. Still tote.
 *
 * Grade is I don't grade. Foundry is a booth license.
 * This is the format. I will not convert CUBE to 3DL.
 * Walkers still ask Beats to transcode the cubes.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:convert-listing-ids` is the client convert set.
 * Cookie `iss-convert-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write grade, foundry, sleeve, print, dust, songs, line, clip,
 * workbook, stems, vibe, wrong, stick, scan, folder, skip, stack,
 * pile, remote, listing-cases, wash, plays, press, film, look, ask,
 * hands, van, firm, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp does not
 * take a LUT convert. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const CONVERT_STORAGE_KEY = "iss:convert-listing-ids";
export const CONVERT_COOKIE_NAME = "iss-convert-listing-ids";
export const CONVERT_CHANGED_EVENT = "iss:convert-changed";

export const CONVERT_REFUSE_COPY = "That one does not take a convert.";
export const CONVERT_TABLE_LINE = "I don't convert.";
export const CONVERT_CUBE_LINE = "The cubes stay .cube.";
export const CONVERT_GRADE_LINE =
  "Grade is I don't grade. Foundry is a booth license.";
export const CONVERT_FORMAT_LINE =
  "This is the LUT format. I will not convert CUBE to 3DL.";
export const CONVERT_STILL_LINE = "Still tote. Not grade. Not foundry.";
export const CONVERT_TOTE_LINE = "Add to tote still works.";
export const CONVERT_EMPTY_LINE = "Nobody taped the convert yet.";

const SERVER_STORE = Symbol.for("iss.convert-listing-ids");

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

export function parseConvertListingIds(raw: string | null | undefined): string[] {
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

export function convertCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CONVERT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CONVERT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CONVERT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CONVERT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CONVERT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseConvertListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readConvertListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CONVERT_STORAGE_KEY);
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
          window.localStorage.setItem(CONVERT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeConvertListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = convertCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CONVERT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CONVERT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CONVERT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingConvertOverlay(
  listingId: string,
  listingIds = readConvertListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeConvert(listing: Listing | undefined): listing is Listing {
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

export type ConvertWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type ConvertWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: ConvertWriteReason; listingIds: string[] };

function refuseConvert(
  listing: Listing | undefined,
  listingIds: string[],
): ConvertWriteResult | null {
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
  if (!isDigitalListing(listing)) {
    return { ok: false, reason: "physical", listingIds };
  }
  return null;
}

export function markListingConvert(
  listing: Listing | undefined,
  listingIds: string[],
): ConvertWriteResult {
  const refused = refuseConvert(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingConvert(
  listing: Listing | undefined,
  listingIds: string[],
): ConvertWriteResult {
  const refused = refuseConvert(listing, listingIds);
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

export function subscribeConvert(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CONVERT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CONVERT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONVERT_CHANGED_EVENT, listener);
  };
}
