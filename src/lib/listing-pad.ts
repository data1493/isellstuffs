/**
 * I will not pad them — peel stays. Still a pair. Still tote.
 *
 * Stretch is the last. Sole is no new sole. Even is even the wear.
 * Toe is the peel. Cement is no cobbler glue. Walkers still want
 * Closet to throw pads in, or “make them walk softer.” I will not
 * pad them. Peel stays. Still a pair. Still for sale. Not stretch.
 * Not a cobbler. Not cement.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pad-listing-ids` is the client pad set.
 * Cookie `iss-pad-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a recipe scan does
 * not take a pad. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PAD_STORAGE_KEY = "iss:pad-listing-ids";
export const PAD_COOKIE_NAME = "iss-pad-listing-ids";
export const PAD_CHANGED_EVENT = "iss:pad-changed";

export const PAD_REFUSE_COPY = "That one does not take a pad note.";
export const PAD_TABLE_LINE = "I will not pad them.";
export const PAD_PEEL_LINE = "Peel stays.";
export const PAD_PAIR_LINE = "Still a pair.";
export const PAD_NOTICE_TITLE =
  "I will not pad them. Peel stays. Still a pair.";
export const PAD_WALK_LINE =
  "Walkers still want Closet to throw pads in, or make them walk softer.";
export const PAD_STAYS_LINE =
  "This is the pad note. Peel stays. Still a pair.";
export const PAD_STILL_LINE =
  "Still tote. Not stretch. Not a cobbler. Not cement.";
export const PAD_TOTE_LINE = "Add to tote still works.";
export const PAD_EMPTY_LINE = "Nobody taped the pad note yet.";

const SERVER_STORE = Symbol.for("iss.pad-listing-ids");

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

export function parsePadListingIds(raw: string | null | undefined): string[] {
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

export function padCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PAD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PAD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PAD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PAD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PAD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePadListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPadListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PAD_STORAGE_KEY);
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
          window.localStorage.setItem(PAD_STORAGE_KEY, JSON.stringify(ids));
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

export function writePadListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = padCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PAD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PAD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PAD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPadOverlay(
  listingId: string,
  listingIds: readonly string[] = readPadListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapePad(listing: Listing | undefined): listing is Listing {
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

export type PadWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type PadWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: PadWriteReason; listingIds: string[] };

function refusePad(
  listing: Listing | undefined,
  listingIds: string[],
): PadWriteResult | null {
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

export function markListingPad(
  listing: Listing | undefined,
  listingIds: string[],
): PadWriteResult {
  const refused = refusePad(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingPad(
  listing: Listing | undefined,
  listingIds: string[],
): PadWriteResult {
  const refused = refusePad(listing, listingIds);
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

export function subscribePad(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PAD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PAD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PAD_CHANGED_EVENT, listener);
  };
}
