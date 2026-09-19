/**
 * The strap walked — camera/bag strap is not in the box. Still tote.
 *
 * Remote is the clicker. This is the camera/bag strap that walked.
 * Not van. Not lost. Not a fourth status.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:strap-listing-ids` is the client strap set.
 * Cookie `iss-strap-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write remote, van, lost, pile, grade, cells, parts, wash, stick,
 * cord, bent, shell, heat, cases, plays, fits, press, film, look, ask,
 * hands, scan, heavy, with, firm, packed, sold, file-gone, gift, buy,
 * digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not take a strap.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const STRAP_STORAGE_KEY = "iss:strap-listing-ids";
export const STRAP_COOKIE_NAME = "iss-strap-listing-ids";
export const STRAP_CHANGED_EVENT = "iss:strap-changed";

export const STRAP_REFUSE_COPY = "That one does not need a strap.";
export const STRAP_TABLE_LINE = "The strap walked.";
export const STRAP_BOX_LINE = "The strap is not in the box.";
export const STRAP_STILL_LINE = "Still tote. Not a fourth status.";
export const STRAP_TOTE_LINE = "Add to tote still works.";
export const STRAP_REMOTE_LINE =
  "Remote is the clicker. This is the camera/bag strap that walked.";
export const STRAP_VAN_LINE = "Not van. Not lost.";
export const STRAP_EMPTY_LINE = "Nobody taped the strap yet.";

const SERVER_STORE = Symbol.for("iss.strap-listing-ids");

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

export function parseStrapListingIds(raw: string | null | undefined): string[] {
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

export function strapCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const STRAP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${STRAP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(STRAP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(STRAP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${STRAP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseStrapListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readStrapListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(STRAP_STORAGE_KEY);
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
          window.localStorage.setItem(STRAP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeStrapListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = strapCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STRAP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${STRAP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(STRAP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingStrapOverlay(
  listingId: string,
  listingIds = readStrapListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeStrap(listing: Listing | undefined): listing is Listing {
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

export type StrapWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type StrapWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: StrapWriteReason; listingIds: string[] };

function refuseStrap(
  listing: Listing | undefined,
  listingIds: string[],
): StrapWriteResult | null {
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

export function markListingStrap(
  listing: Listing | undefined,
  listingIds: string[],
): StrapWriteResult {
  const refused = refuseStrap(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingStrap(
  listing: Listing | undefined,
  listingIds: string[],
): StrapWriteResult {
  const refused = refuseStrap(listing, listingIds);
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

export function subscribeStrap(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STRAP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STRAP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STRAP_CHANGED_EVENT, listener);
  };
}
